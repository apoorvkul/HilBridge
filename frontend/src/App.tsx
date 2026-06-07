import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GraphEdge,
  GraphNode,
  GraphNodeKind,
  GraphRequest,
  GraphResponse,
  KIND_LABELS,
  LAYER_LABELS
} from "../../shared/src/graph";

type ViewMode = "pyramid" | "plane" | "slice" | "commit";
type PositionedNode = GraphNode & {
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};

const REPO_PATH_STORAGE_KEY = "specGraphVisualizer:lastRepoPath";
const GRAPH_HEIGHT = 760;

const KIND_COLORS: Record<GraphNodeKind, string> = {
  vision: "#f7f1a2",
  capability: "#8ed7ff",
  flow: "#8ff0c5",
  module: "#c8b4ff",
  contract: "#ffbf8a",
  code: "#d7dce3",
  architecture_note: "#ff8fb5",
  domain_note: "#a7ec7a",
  technology_note: "#77a7ff"
};

const CROSS_KINDS = new Set<GraphNodeKind>(["architecture_note", "domain_note", "technology_note"]);

export default function App() {
  const graphRef = useRef<any>(null);
  const [repoPath, setRepoPath] = useState(() => localStorage.getItem(REPO_PATH_STORAGE_KEY) ?? "");
  const [commitHash, setCommitHash] = useState("");
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("pyramid");
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [search, setSearch] = useState("");
  const [includeCrossCutting, setIncludeCrossCutting] = useState(true);
  const [changedOnly, setChangedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = async () => {
    const trimmedRepoPath = repoPath.trim();
    if (!trimmedRepoPath) {
      setError("Enter a repository path to load a graph.");
      setGraph(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: GraphRequest = {
        repoPath: trimmedRepoPath,
        commitHash: viewMode === "commit" && commitHash.trim() ? commitHash.trim() : undefined
      };
      const response = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not load graph");
      localStorage.setItem(REPO_PATH_STORAGE_KEY, trimmedRepoPath);
      setRepoPath(trimmedRepoPath);
      setGraph(json);
      const firstSliceNode = json.nodes.find((node: GraphNode) => node.kind === "capability" || node.kind === "flow");
      setSelectedNodeId((current) => current || firstSliceNode?.id || "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoPath.trim()) void loadGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    graphRef.current?.cameraPosition({ x: 0, y: 90, z: 760 }, { x: 0, y: 0, z: 0 }, 600);
  }, [viewMode, selectedLayer, selectedNodeId, graph]);

  const visibleGraph = useMemo(() => {
    if (!graph) return { nodes: [], links: [] };
    return buildVisibleGraph(graph.nodes, graph.edges, {
      viewMode,
      selectedLayer,
      selectedNodeId,
      search,
      includeCrossCutting,
      changedOnly
    });
  }, [graph, viewMode, selectedLayer, selectedNodeId, search, includeCrossCutting, changedOnly]);

  const selectedNodeOptions = useMemo(() => {
    return (graph?.nodes ?? [])
      .filter((node) => node.kind !== "code")
      .sort((a, b) => kindSort(a) - kindSort(b) || a.label.localeCompare(b.label));
  }, [graph]);

  const stats = useMemo(() => {
    const changed = graph?.nodes.filter((node) => node.changed).length ?? 0;
    return {
      nodes: graph?.nodes.length ?? 0,
      edges: graph?.edges.length ?? 0,
      visible: visibleGraph.nodes.length,
      changed
    };
  }, [graph, visibleGraph.nodes.length]);

  return (
    <main className="app-shell">
      <aside className="control-rail">
        <div className="brand-block">
          <p className="eyebrow">Spec Graph</p>
          <h1>Repository Knowledge Map</h1>
        </div>

        <section className="control-group">
          <label htmlFor="repoPath">Repository path</label>
          <div className="inline-field">
            <input
              id="repoPath"
              value={repoPath}
              onChange={(event) => setRepoPath(event.target.value)}
              placeholder="/path/to/local/repository"
            />
            <button type="button" onClick={loadGraph} disabled={loading}>
              {loading ? "Loading" : "Load"}
            </button>
          </div>
        </section>

        <section className="control-group">
          <label htmlFor="viewMode">View mode</label>
          <select id="viewMode" value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)}>
            <option value="pyramid">3D Pyramid</option>
            <option value="plane">Horizontal Plane</option>
            <option value="slice">Vertical Slice</option>
            <option value="commit">Commit Diff</option>
          </select>
        </section>

        {viewMode === "plane" && (
          <section className="control-group">
            <label htmlFor="layer">Layer</label>
            <select id="layer" value={selectedLayer} onChange={(event) => setSelectedLayer(Number(event.target.value))}>
              {LAYER_LABELS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </section>
        )}

        {viewMode === "slice" && (
          <section className="control-group">
            <label htmlFor="sliceNode">Slice root</label>
            <select
              id="sliceNode"
              value={selectedNodeId}
              onChange={(event) => setSelectedNodeId(event.target.value)}
            >
              {selectedNodeOptions.map((node) => (
                <option key={node.id} value={node.id}>
                  {KIND_LABELS[node.kind]} · {node.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {viewMode === "commit" && (
          <section className="control-group">
            <label htmlFor="commitHash">Commit hash</label>
            <div className="inline-field">
              <input
                id="commitHash"
                value={commitHash}
                onChange={(event) => setCommitHash(event.target.value)}
                placeholder="abc123"
              />
              <button type="button" onClick={loadGraph} disabled={loading || !commitHash.trim()}>
                Diff
              </button>
            </div>
          </section>
        )}

        <section className="control-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Label or path"
          />
        </section>

        <section className="toggle-stack">
          <label>
            <input
              type="checkbox"
              checked={includeCrossCutting}
              onChange={(event) => setIncludeCrossCutting(event.target.checked)}
            />
            Cross-cutting notes
          </label>
          <label>
            <input type="checkbox" checked={changedOnly} onChange={(event) => setChangedOnly(event.target.checked)} />
            Changed only
          </label>
        </section>

        <section className="metrics-strip">
          <div>
            <span>{stats.nodes}</span>
            Nodes
          </div>
          <div>
            <span>{stats.edges}</span>
            Edges
          </div>
          <div>
            <span>{stats.visible}</span>
            Visible
          </div>
          <div>
            <span>{stats.changed}</span>
            Changed
          </div>
        </section>

        <Legend />
      </aside>

      <section className="graph-stage">
        <header className="stage-header">
          <div>
            <p className="eyebrow">{graph?.repo.github.owner && graph.repo.github.repo ? `${graph.repo.github.owner}/${graph.repo.github.repo}` : "Local repository"}</p>
            <h2>{titleForView(viewMode, selectedLayer)}</h2>
          </div>
          <div className="stage-meta">
            {graph?.repo.github.branch && <span>{graph.repo.github.branch}</span>}
            {graph?.repo.github.commitHash && <span>{graph.repo.github.commitHash.slice(0, 12)}</span>}
          </div>
        </header>

        {error && <div className="notice danger">{error}</div>}
        {graph?.warnings.length ? <div className="notice">{graph.warnings.slice(0, 3).join(" · ")}</div> : null}

        <div className="graph-canvas" style={{ height: GRAPH_HEIGHT }}>
          {visibleGraph.nodes.length ? (
            <ForceGraph3D
              ref={graphRef}
              graphData={visibleGraph}
              backgroundColor="#10141a"
              nodeThreeObject={(node) => makeNodeObject(node as PositionedNode)}
              nodeThreeObjectExtend={false}
              nodeLabel={(node) => nodeTooltip(node as GraphNode)}
              linkColor={(link) => linkColor((link as GraphEdge).kind)}
              linkOpacity={0.52}
              linkWidth={(link) => ((link as GraphEdge).kind === "changed_with" ? 2.2 : 1)}
              linkDirectionalParticles={(link) => (((link as GraphEdge).kind === "changed_with" ? 2 : 0))}
              linkDirectionalParticleWidth={2}
              onNodeClick={(node) => openNode(node as GraphNode)}
              cooldownTicks={0}
              enableNodeDrag
            />
          ) : (
            <div className="empty-state">No nodes match the current filters.</div>
          )}
        </div>
      </section>
    </main>
  );
}

function buildVisibleGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: {
    viewMode: ViewMode;
    selectedLayer: number;
    selectedNodeId: string;
    search: string;
    includeCrossCutting: boolean;
    changedOnly: boolean;
  }
) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let selectedIds = new Set<string>();

  if (options.viewMode === "plane") {
    const layerIds = new Set(nodes.filter((node) => node.layerIndex === options.selectedLayer).map((node) => node.id));
    selectedIds = new Set(layerIds);
    if (options.includeCrossCutting) {
      for (const edge of edges) {
        const source = edgeEndpoint(edge.source);
        const target = edgeEndpoint(edge.target);
        if (layerIds.has(source) && CROSS_KINDS.has(byId.get(target)?.kind as GraphNodeKind)) selectedIds.add(target);
        if (layerIds.has(target) && CROSS_KINDS.has(byId.get(source)?.kind as GraphNodeKind)) selectedIds.add(source);
      }
    }
  } else if (options.viewMode === "slice" && options.selectedNodeId) {
    selectedIds = sliceIds(options.selectedNodeId, nodes, edges);
  } else if (options.viewMode === "commit") {
    const changed = new Set(nodes.filter((node) => node.changed).map((node) => node.id));
    selectedIds = new Set(changed);
    for (const edge of edges) {
      const source = edgeEndpoint(edge.source);
      const target = edgeEndpoint(edge.target);
      if (changed.has(source)) selectedIds.add(target);
      if (changed.has(target)) selectedIds.add(source);
    }
  } else {
    selectedIds = new Set(nodes.map((node) => node.id));
  }

  if (!options.includeCrossCutting) {
    selectedIds = new Set([...selectedIds].filter((id) => !CROSS_KINDS.has(byId.get(id)?.kind as GraphNodeKind)));
  }

  if (options.changedOnly) {
    selectedIds = new Set([...selectedIds].filter((id) => byId.get(id)?.changed));
  }

  const query = options.search.trim().toLowerCase();
  if (query) {
    selectedIds = new Set(
      [...selectedIds].filter((id) => {
        const node = byId.get(id);
        return node && `${node.label} ${node.path} ${KIND_LABELS[node.kind]}`.toLowerCase().includes(query);
      })
    );
  }

  const visibleNodes = nodes.filter((node) => selectedIds.has(node.id));
  const visibleEdges = edges.filter((edge) => selectedIds.has(edgeEndpoint(edge.source)) && selectedIds.has(edgeEndpoint(edge.target)));
  const positionedNodes = positionNodes(visibleNodes, visibleEdges, options.viewMode, options.selectedLayer, options.selectedNodeId);

  return { nodes: positionedNodes, links: visibleEdges };
}

function sliceIds(rootId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const outbound = new Map<string, string[]>();
  const undirected = new Map<string, string[]>();
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    push(outbound, source, target);
    push(undirected, source, target);
    push(undirected, target, source);
  }

  const selected = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const current = queue.shift()!;
    const currentLayer = byId.get(current)?.layerIndex ?? -1;
    for (const next of outbound.get(current) ?? []) {
      const nextNode = byId.get(next);
      if (!nextNode) continue;
      const nextLayer = nextNode.layerIndex ?? currentLayer;
      if (nextNode.kind === "code" || nextLayer >= currentLayer || CROSS_KINDS.has(nextNode.kind)) {
        if (!selected.has(next)) {
          selected.add(next);
          queue.push(next);
        }
      }
    }
  }

  for (const id of [...selected]) {
    for (const neighbor of undirected.get(id) ?? []) {
      const node = byId.get(neighbor);
      if (node && CROSS_KINDS.has(node.kind)) selected.add(neighbor);
    }
  }
  return selected;
}

function positionNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  viewMode: ViewMode,
  selectedLayer: number,
  selectedNodeId: string
): PositionedNode[] {
  const byLayer = new Map<number, GraphNode[]>();
  const crossNodes: GraphNode[] = [];
  for (const node of nodes) {
    if (node.layerIndex === undefined) crossNodes.push(node);
    else push(byLayer, node.layerIndex, node);
  }

  if (viewMode === "plane") {
    return radialPosition(nodes, 0, 250);
  }

  if (viewMode === "slice") {
    const root = nodes.find((node) => node.id === selectedNodeId);
    const orderedLayers = new Map<number, GraphNode[]>();
    for (const node of nodes) {
      const layer = node.layerIndex ?? (root?.layerIndex ?? 1);
      push(orderedLayers, layer, node);
    }
    return [...orderedLayers.entries()].flatMap(([layer, layerNodes]) => {
      const y = 210 - layer * 88;
      return spreadLine(layerNodes, y, 130 + layer * 18);
    });
  }

  if (viewMode === "commit") {
    const changed = nodes.filter((node) => node.changed);
    const context = nodes.filter((node) => !node.changed);
    return [...radialPosition(changed, 55, 115), ...radialPosition(context, -95, 260)];
  }

  const positioned: PositionedNode[] = [];
  const layerRadii = [12, 95, 155, 220, 285, 345];
  for (let layer = 0; layer <= 5; layer += 1) {
    const layerNodes = byLayer.get(layer) ?? [];
    const y = 245 - layer * 92;
    const radius = layerRadii[layer];
    positioned.push(...radialPosition(layerNodes, y, radius));
  }
  positioned.push(...radialPosition(crossNodes, 8, 410));
  return positioned;
}

function radialPosition(nodes: GraphNode[], y: number, radius: number): PositionedNode[] {
  const sorted = [...nodes].sort((a, b) => kindSort(a) - kindSort(b) || a.label.localeCompare(b.label));
  const count = Math.max(sorted.length, 1);
  return sorted.map((node, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const jitter = ((node.label.length % 7) - 3) * 4;
    const x = Math.cos(angle) * (radius + jitter);
    const z = Math.sin(angle) * (radius + jitter);
    return { ...node, x, y, z, fx: x, fy: y, fz: z };
  });
}

function spreadLine(nodes: GraphNode[], y: number, width: number): PositionedNode[] {
  const sorted = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
  const start = -width * (sorted.length - 1) * 0.5;
  return sorted.map((node, index) => {
    const x = start + index * width;
    const z = CROSS_KINDS.has(node.kind) ? 150 : 0;
    return { ...node, x, y, z, fx: x, fy: y, fz: z };
  });
}

function makeNodeObject(node: PositionedNode) {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(node.changed ? 8.5 : 6.5, 18, 18);
  const material = new THREE.MeshStandardMaterial({
    color: node.changed ? "#ffdf5d" : KIND_COLORS[node.kind],
    emissive: node.changed ? "#6b4a00" : "#000000",
    roughness: 0.55,
    metalness: 0.16
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  if (node.hasDiagrams) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(node.changed ? 12 : 10, 1.2, 8, 24),
      new THREE.MeshBasicMaterial({ color: "#ffffff" })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  const label = new SpriteText(nodeLabel(node));
  label.color = node.changed ? "#fff7c7" : "#edf3fb";
  label.textHeight = node.kind === "code" ? 6 : 7.5;
  label.position.y = node.changed ? 15 : 13;
  label.backgroundColor = "rgba(16,20,26,0.66)";
  label.padding = 2;
  group.add(label);
  return group;
}

function nodeLabel(node: GraphNode) {
  const prefix = node.changed ? "CHANGED · " : "";
  const diagram = node.hasDiagrams ? " ◇" : "";
  return `${prefix}${node.label}${diagram}`;
}

function nodeTooltip(node: GraphNode) {
  return `${KIND_LABELS[node.kind]}${node.changed ? " · changed" : ""}${node.hasDiagrams ? " · diagram" : ""}\n${node.path}`;
}

function openNode(node: GraphNode) {
  const url = node.changed && node.githubDiffUrl ? node.githubDiffUrl : node.githubUrl;
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function linkColor(kind: GraphEdge["kind"]) {
  if (kind === "changed_with") return "#ffdf5d";
  if (kind === "source_reference") return "#cfd6df";
  if (kind === "cross_cutting") return "#ff9bc0";
  if (kind === "hierarchy") return "#6d7f91";
  return "#8fb3ff";
}

function titleForView(viewMode: ViewMode, layer: number) {
  if (viewMode === "plane") return `${LAYER_LABELS[layer]} Plane`;
  if (viewMode === "slice") return "Vertical Feature Slice";
  if (viewMode === "commit") return "Commit Diff Context";
  return "3D Pyramid View";
}

function kindSort(node: GraphNode) {
  return node.layerIndex ?? 99;
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}

function edgeEndpoint(endpoint: string | { id?: string }) {
  return typeof endpoint === "string" ? endpoint : endpoint.id ?? "";
}

function Legend() {
  return (
    <section className="legend">
      <h3>Legend</h3>
      {(Object.keys(KIND_LABELS) as GraphNodeKind[]).map((kind) => (
        <div key={kind} className="legend-row">
          <span className="swatch" style={{ background: KIND_COLORS[kind] }} />
          <span>{KIND_LABELS[kind]}</span>
        </div>
      ))}
      <div className="legend-row">
        <span className="swatch changed" />
        <span>Changed file</span>
      </div>
      <div className="legend-row">
        <span className="diagram-mark">◇</span>
        <span>Contains diagram</span>
      </div>
    </section>
  );
}
