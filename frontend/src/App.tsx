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

type ViewMode = "map" | "pyramid" | "plane" | "slice" | "commit";
type Graph2DMode = Extract<ViewMode, "map" | "plane" | "slice" | "commit">;
type NodeVisualState = "normal" | "context" | "spotlight" | "dimmed" | "selected";
type PositionedNode = GraphNode & {
  x: number;
  y: number;
  z: number;
  fx?: number;
  fy?: number;
  fz?: number;
  visualState?: NodeVisualState;
};

type VisibleGraph = {
  nodes: PositionedNode[];
  links: GraphEdge[];
};
type GraphPoint = {
  x: number;
  y: number;
};

const REPO_PATH_STORAGE_KEY = "specGraphVisualizer:lastRepoPath";
const GRAPH_HEIGHT = 760;
const GRAPH_ANIMATION_MS = 360;
const LAYER_ROW_GAP = 112;
const LAYER_NODE_GAP = 210;
const LAYER_ROW_START_Y = 74;
const LAYER_VIEWPORT_MIN_WIDTH = 960;

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
  const layeredScrollRef = useRef<HTMLDivElement>(null);
  const [repoPath, setRepoPath] = useState(() => localStorage.getItem(REPO_PATH_STORAGE_KEY) ?? "");
  const [commitHash, setCommitHash] = useState("");
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => new Set());
  const [revealedNodeIds, setRevealedNodeIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [includeCrossCutting, setIncludeCrossCutting] = useState(true);
  const [changedOnly, setChangedOnly] = useState(false);
  const [layeredViewportWidth, setLayeredViewportWidth] = useState(960);
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
      setSelectedNodeId("");
      setExpandedNodeIds(new Set());
      setRevealedNodeIds(new Set());
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
    if (viewMode !== "pyramid") return;
    graphRef.current?.cameraPosition({ x: 0, y: 90, z: 760 }, { x: 0, y: 0, z: 0 }, 600);
  }, [viewMode, selectedLayer, selectedNodeId, graph]);

  useEffect(() => {
    if (!graph || !selectedNodeId) return;
    if (!graph.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId("");
    }
  }, [graph, selectedNodeId]);

  useEffect(() => {
    if (viewMode !== "map" && viewMode !== "commit") return;
    const container = layeredScrollRef.current;
    if (!container) return;

    const updateWidth = () => {
      setLayeredViewportWidth(Math.max(480, container.clientWidth || 960));
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [viewMode]);

  const visibleGraph = useMemo(() => {
    if (!graph) return { nodes: [], links: [] } satisfies VisibleGraph;
    return buildVisibleGraph(graph.nodes, graph.edges, {
      viewMode,
      selectedLayer,
      selectedNodeId,
      expandedNodeIds,
      revealedNodeIds,
      search,
      includeCrossCutting,
      changedOnly
    });
  }, [graph, viewMode, selectedLayer, selectedNodeId, expandedNodeIds, revealedNodeIds, search, includeCrossCutting, changedOnly]);

  const layeredFocusId = useMemo(() => {
    if (viewMode !== "map" && viewMode !== "commit") return "";
    const selectedVisibleNode = visibleGraph.nodes.find(
      (node) => node.id === selectedNodeId && node.layerIndex !== undefined
    );
    if (selectedVisibleNode) return selectedVisibleNode.id;
    return (
      visibleGraph.nodes.find((node) => node.kind === "vision")?.id ??
      visibleGraph.nodes.find((node) => node.layerIndex !== undefined)?.id ??
      ""
    );
  }, [selectedNodeId, viewMode, visibleGraph.nodes]);

  useEffect(() => {
    if (viewMode !== "map" && viewMode !== "commit") return;
    const container = layeredScrollRef.current;
    const focusNode = visibleGraph.nodes.find((node) => node.id === layeredFocusId);
    if (!container || !focusNode) return;

    const bounds = graphBounds(visibleGraph.nodes, viewMode, layeredViewportWidth);
    const focusPoint = projectNode(focusNode, viewMode);
    const nextLeft = Math.max(0, focusPoint.x - bounds.minX - container.clientWidth * 0.5);
    container.scrollTo({ left: nextLeft, behavior: "smooth" });
  }, [layeredFocusId, layeredViewportWidth, viewMode, visibleGraph.nodes]);

  const selectedNode = useMemo(() => {
    if (!graph || !selectedNodeId) return undefined;
    return graph.nodes.find((node) => node.id === selectedNodeId);
  }, [graph, selectedNodeId]);

  const visibleNodeIds = useMemo(() => new Set(visibleGraph.nodes.map((node) => node.id)), [visibleGraph.nodes]);

  const selectedExpansionTargets = useMemo(() => {
    if (!graph || !selectedNode) return [];
    return expansionTargets(selectedNode.id, graph.nodes, graph.edges).filter((id) => !visibleNodeIds.has(id));
  }, [graph, selectedNode, visibleNodeIds]);

  const selectedPeerTargets = useMemo(() => {
    if (!graph || !selectedNode || viewMode !== "plane") return [];
    return sameLayerPeerTargets(selectedNode.id, graph.nodes, graph.edges).filter((id) => !visibleNodeIds.has(id));
  }, [graph, selectedNode, viewMode, visibleNodeIds]);

  const hasExploration = expandedNodeIds.size > 0 || revealedNodeIds.size > 0;

  const expandSelectedNode = () => {
    if (!selectedNode || !selectedExpansionTargets.length) return;
    setExpandedNodeIds((current) => new Set(current).add(selectedNode.id));
  };

  const collapseSelectedNode = () => {
    if (!selectedNode) return;
    setExpandedNodeIds((current) => {
      const next = new Set(current);
      next.delete(selectedNode.id);
      return next;
    });
  };

  const expandSelectedPeers = () => {
    if (!selectedPeerTargets.length) return;
    setRevealedNodeIds((current) => {
      const next = new Set(current);
      selectedPeerTargets.forEach((id) => next.add(id));
      return next;
    });
  };

  const resetExploration = () => {
    setSelectedNodeId("");
    setExpandedNodeIds(new Set());
    setRevealedNodeIds(new Set());
  };

  const openLayerSlice = (layer: number) => {
    setSelectedLayer(layer);
    setViewMode("plane");
  };

  const selectNode = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (viewMode === "map" || viewMode === "pyramid" || viewMode === "commit") {
      const targets = graph ? expansionTargets(node.id, graph.nodes, graph.edges) : [];
      if (targets.length) {
        setExpandedNodeIds((current) => new Set(current).add(node.id));
      }
    }
  };

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

  const actionBarTitle = selectedNode
    ? `${KIND_LABELS[selectedNode.kind]}${selectedNode.changeStatus ? ` · ${changeStatusLabel(selectedNode)}` : ""}`
    : "";
  const actionBarCanOpen = Boolean(selectedNode?.githubUrl || selectedNode?.githubDiffUrl);
  const hasSelectedCollapse = Boolean(selectedNode && expandedNodeIds.has(selectedNode.id));
  const selectedVisible = Boolean(selectedNode && visibleNodeIds.has(selectedNode.id));
  const selectedNodePath = selectedNode?.previousPath ? `${selectedNode.previousPath} -> ${selectedNode.path}` : selectedNode?.path;

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
            <option value="map">Layered Map</option>
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
              <option value="">Select a note</option>
              {selectedNodeOptions.map((node) => (
                <option key={node.id} value={node.id}>
                  {KIND_LABELS[node.kind]} · {displayNodeLabel(node)}
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
        {selectedNode && (
          <div className="node-action-bar">
            <div className="node-action-summary">
              <span>{actionBarTitle}</span>
              <strong>{displayNodeLabel(selectedNode)}</strong>
              {selectedNodePath && <small>{selectedNodePath}</small>}
            </div>
            <div className="node-action-buttons">
              <button type="button" onClick={expandSelectedNode} disabled={!selectedExpansionTargets.length}>
                Expand
              </button>
              <button type="button" onClick={collapseSelectedNode} disabled={!hasSelectedCollapse}>
                Collapse
              </button>
              {viewMode === "plane" && (
                <button type="button" onClick={expandSelectedPeers} disabled={!selectedPeerTargets.length}>
                  Expand peers
                </button>
              )}
              <button
                type="button"
                onClick={() => openNode(selectedNode)}
                disabled={!actionBarCanOpen}
              >
                Open in GitHub
              </button>
              <button type="button" onClick={() => setSelectedNodeId("")}>
                Clear
              </button>
              {hasExploration && (
                <button type="button" onClick={resetExploration}>
                  Reset
                </button>
              )}
            </div>
            {!selectedVisible && <div className="node-action-note">Selected node is outside the current filters.</div>}
          </div>
        )}

        <div
          className={`graph-canvas ${viewMode === "pyramid" ? "graph-canvas-3d" : "graph-canvas-2d"} ${
            viewMode === "map" || viewMode === "commit" ? "graph-canvas-layered" : ""
          }`}
          style={{ height: GRAPH_HEIGHT }}
        >
          {visibleGraph.nodes.length ? (
            viewMode === "map" || viewMode === "plane" || viewMode === "slice" || viewMode === "commit" ? (
              viewMode === "map" || viewMode === "commit" ? (
                <div className="graph-layered-frame">
                  <LayerAxis selectedLayer={selectedLayer} onLayerClick={openLayerSlice} />
                  <div className="graph-layered-scroll" ref={layeredScrollRef}>
                    <Graph2D
                      graph={visibleGraph}
                      mode={viewMode}
                      selectedNodeId={selectedNodeId}
                      selectedLayer={selectedLayer}
                      viewportWidth={layeredViewportWidth}
                      onLayerClick={openLayerSlice}
                      onNodeClick={selectNode}
                    />
                  </div>
                </div>
              ) : (
                <Graph2D
                  graph={visibleGraph}
                  mode={viewMode}
                  selectedNodeId={selectedNodeId}
                  selectedLayer={selectedLayer}
                  viewportWidth={layeredViewportWidth}
                  onLayerClick={openLayerSlice}
                  onNodeClick={selectNode}
                />
              )
            ) : (
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
                onNodeClick={(node) => {
                  selectNode(node as GraphNode);
                }}
                cooldownTicks={0}
                enableNodeDrag
              />
            )
          ) : (
            <div className="empty-state">No nodes match the current filters.</div>
          )}
        </div>
      </section>
    </main>
  );
}

function LayerAxis({
  selectedLayer,
  onLayerClick
}: {
  selectedLayer: number;
  onLayerClick: (layer: number) => void;
}) {
  return (
    <div className="graph-layer-axis" aria-label="Graph layers">
      {LAYER_LABELS.map((label, index) => {
        const y = LAYER_ROW_START_Y + index * LAYER_ROW_GAP;
        return (
          <button
            key={label}
            type="button"
            className={`graph-layer-axis-label ${selectedLayer === index ? "is-active" : ""}`}
            style={{ top: y }}
            onClick={() => onLayerClick(index)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function buildVisibleGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: {
    viewMode: ViewMode;
    selectedLayer: number;
    selectedNodeId: string;
    expandedNodeIds: Set<string>;
    revealedNodeIds: Set<string>;
    search: string;
    includeCrossCutting: boolean;
    changedOnly: boolean;
  }
): VisibleGraph {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let selectedIds = new Set<string>();
  let contextIds = new Set<string>();

  if (options.viewMode === "map") {
    const visibility = layeredMapVisibility(nodes, edges, options.expandedNodeIds, options.revealedNodeIds, options.includeCrossCutting);
    selectedIds = visibility.ids;
    contextIds = visibility.contextIds;
  } else if (options.viewMode === "plane") {
    const visibility = layeredMapVisibility(nodes, edges, options.expandedNodeIds, options.revealedNodeIds, options.includeCrossCutting);
    selectedIds = new Set(
      [...visibility.ids].filter((id) => byId.get(id)?.layerIndex === options.selectedLayer)
    );
    contextIds = new Set([...visibility.contextIds].filter((id) => selectedIds.has(id)));
  } else if (options.viewMode === "slice" && options.selectedNodeId) {
    selectedIds = sliceIds(options.selectedNodeId, nodes, edges);
    contextIds = ancestorContextIds(selectedIds, nodes, edges);
  } else if (options.viewMode === "commit") {
    const visibility = commitVisibility(nodes, edges, options.expandedNodeIds, options.revealedNodeIds, options.includeCrossCutting);
    selectedIds = visibility.ids;
    contextIds = visibility.contextIds;
  } else {
    selectedIds = pyramidVisibleIds(nodes, edges, options.expandedNodeIds);
  }

  if (!options.includeCrossCutting || options.viewMode === "plane" || options.viewMode === "slice") {
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
  const visibleEdges = edges.filter(
    (edge) =>
      selectedIds.has(edgeEndpoint(edge.source)) &&
      selectedIds.has(edgeEndpoint(edge.target)) &&
      shouldShowVisibleEdge(edge, byId, options.selectedNodeId)
  );
  const spotlightIds = spotlightContextIds(options.selectedNodeId, selectedIds, nodes, edges);
  const positionedNodes = positionNodes(visibleNodes, visibleEdges, options.viewMode, options.selectedLayer, options.selectedNodeId).map((node) => ({
    ...node,
    visualState: visualStateFor(node.id, options.selectedNodeId, spotlightIds, contextIds)
  }));

  return { nodes: positionedNodes, links: visibleEdges };
}

function shouldShowVisibleEdge(edge: GraphEdge, byId: Map<string, GraphNode>, selectedNodeId: string) {
  const source = edgeEndpoint(edge.source);
  const target = edgeEndpoint(edge.target);
  const sourceNode = byId.get(source);
  const targetNode = byId.get(target);
  const isCrossCuttingEdge =
    edge.kind === "cross_cutting" ||
    Boolean(sourceNode && CROSS_KINDS.has(sourceNode.kind)) ||
    Boolean(targetNode && CROSS_KINDS.has(targetNode.kind));
  if (!isCrossCuttingEdge) return true;
  return Boolean(selectedNodeId && (source === selectedNodeId || target === selectedNodeId));
}

function layeredMapVisibility(
  nodes: GraphNode[],
  edges: GraphEdge[],
  expandedIds: Set<string>,
  revealedIds: Set<string>,
  includeCrossCutting: boolean
) {
  const ids = new Set(nodes.filter((node) => node.kind === "vision" || node.kind === "capability").map((node) => node.id));
  if (includeCrossCutting) addConnectedCrossCutting(ids, nodes, edges);
  addExpandedTargets(ids, expandedIds, nodes, edges);
  for (const id of revealedIds) ids.add(id);
  const contextIds = ancestorContextIds(revealedIds, nodes, edges);
  for (const id of contextIds) ids.add(id);
  if (includeCrossCutting) addConnectedCrossCutting(ids, nodes, edges);
  return { ids, contextIds };
}

function commitVisibility(
  nodes: GraphNode[],
  edges: GraphEdge[],
  expandedIds: Set<string>,
  revealedIds: Set<string>,
  includeCrossCutting: boolean
) {
  const changedIds = new Set(nodes.filter((node) => node.changed).map((node) => node.id));
  const ids = new Set(changedIds);
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    if (changedIds.has(source)) ids.add(target);
    if (changedIds.has(target)) ids.add(source);
  }
  for (const id of changedIds) {
    for (const target of expansionTargets(id, nodes, edges)) ids.add(target);
  }
  for (const id of revealedIds) ids.add(id);
  addExpandedTargets(ids, expandedIds, nodes, edges);
  const contextIds = ancestorContextIds(ids, nodes, edges);
  for (const id of contextIds) ids.add(id);
  if (includeCrossCutting) addConnectedCrossCutting(ids, nodes, edges);
  return { ids, contextIds };
}

function pyramidVisibleIds(nodes: GraphNode[], edges: GraphEdge[], expandedIds: Set<string>) {
  const selected = new Set(
    nodes.filter((node) => node.kind === "vision" || node.kind === "capability").map((node) => node.id)
  );
  let changed = true;
  while (changed) {
    changed = false;
    for (const expandedId of expandedIds) {
      if (!selected.has(expandedId)) continue;
      for (const targetId of expansionTargets(expandedId, nodes, edges)) {
        if (!selected.has(targetId)) {
          selected.add(targetId);
          changed = true;
        }
      }
    }
  }
  return selected;
}

function addExpandedTargets(ids: Set<string>, expandedIds: Set<string>, nodes: GraphNode[], edges: GraphEdge[]) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const expandedId of expandedIds) {
      if (!ids.has(expandedId)) continue;
      for (const targetId of expansionTargets(expandedId, nodes, edges)) {
        if (!ids.has(targetId)) {
          ids.add(targetId);
          changed = true;
        }
      }
    }
  }
}

function expansionTargets(sourceId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourceNode = byId.get(sourceId);
  if (!sourceNode) return [];
  const sourceLayer = sourceNode.layerIndex;
  if (sourceLayer === undefined) return [];
  const targets = new Set<string>();

  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    if (source !== sourceId) continue;
    const targetId = edgeEndpoint(edge.target);
    const targetNode = byId.get(targetId);
    if (!targetNode) continue;
    const targetLayer = targetNode.layerIndex;
    if (targetLayer === sourceLayer + 1) {
      targets.add(targetId);
    }
  }

  return [...targets];
}

function sameLayerPeerTargets(sourceId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourceNode = byId.get(sourceId);
  if (sourceNode?.layerIndex === undefined) return [];
  const targets = new Set<string>();
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    const otherId = source === sourceId ? target : target === sourceId ? source : "";
    if (!otherId) continue;
    const other = byId.get(otherId);
    if (other?.layerIndex === sourceNode.layerIndex) targets.add(otherId);
  }
  return [...targets];
}

function ancestorContextIds(rootIds: Iterable<string>, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const inbound = new Map<string, string[]>();
  for (const edge of edges) {
    push(inbound, edgeEndpoint(edge.target), edgeEndpoint(edge.source));
  }
  const selected = new Set<string>();
  const queue = [...rootIds];
  while (queue.length) {
    const current = queue.shift()!;
    const currentLayer = byId.get(current)?.layerIndex;
    for (const previous of inbound.get(current) ?? []) {
      const previousNode = byId.get(previous);
      if (!previousNode || CROSS_KINDS.has(previousNode.kind)) continue;
      const previousLayer = previousNode.layerIndex;
      if (previousLayer === undefined || currentLayer === undefined || previousLayer >= currentLayer) continue;
      if (!selected.has(previous)) {
        selected.add(previous);
        queue.push(previous);
      }
    }
  }
  return selected;
}

function addConnectedCrossCutting(ids: Set<string>, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const startingIds = new Set(ids);
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    const sourceNode = byId.get(source);
    const targetNode = byId.get(target);
    if (!sourceNode || !targetNode) continue;
    if (startingIds.has(source) && CROSS_KINDS.has(targetNode.kind)) ids.add(target);
    if (startingIds.has(target) && CROSS_KINDS.has(sourceNode.kind)) ids.add(source);
  }
}

function spotlightContextIds(selectedNodeId: string, visibleIds: Set<string>, nodes: GraphNode[], edges: GraphEdge[]) {
  if (!selectedNodeId || !visibleIds.has(selectedNodeId)) return new Set<string>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const selectedNode = byId.get(selectedNodeId);
  const spotlight = new Set<string>([selectedNodeId]);
  for (const id of ancestorContextIds([selectedNodeId], nodes, edges)) {
    if (visibleIds.has(id)) spotlight.add(id);
  }
  for (const target of expansionTargets(selectedNodeId, nodes, edges)) {
    if (visibleIds.has(target)) spotlight.add(target);
  }
  for (const peer of sameLayerPeerTargets(selectedNodeId, nodes, edges)) {
    if (visibleIds.has(peer)) spotlight.add(peer);
  }
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    if (source !== selectedNodeId && target !== selectedNodeId) continue;
    const other = source === selectedNodeId ? target : source;
    const otherNode = byId.get(other);
    if (otherNode && visibleIds.has(other) && (CROSS_KINDS.has(otherNode.kind) || Boolean(selectedNode && CROSS_KINDS.has(selectedNode.kind)))) {
      spotlight.add(other);
    }
  }
  return spotlight;
}

function visualStateFor(
  nodeId: string,
  selectedNodeId: string,
  spotlightIds: Set<string>,
  contextIds: Set<string>
): NodeVisualState {
  if (nodeId === selectedNodeId) return "selected";
  if (spotlightIds.size) return spotlightIds.has(nodeId) ? "spotlight" : "dimmed";
  if (contextIds.has(nodeId)) return "context";
  return "normal";
}

function sliceIds(rootId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const outbound = new Map<string, string[]>();
  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    push(outbound, source, target);
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
      if (nextNode.kind === "code" || (nextLayer > currentLayer && !CROSS_KINDS.has(nextNode.kind))) {
        if (!selected.has(next)) {
          selected.add(next);
          queue.push(next);
        }
      }
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

  if (viewMode === "map" || viewMode === "commit") {
    return layeredPosition(nodes, edges, selectedNodeId);
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

function layeredPosition(nodes: GraphNode[], edges: GraphEdge[], selectedNodeId: string): PositionedNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const byLayer = new Map<number, GraphNode[]>();
  const crossNodes: GraphNode[] = [];
  for (const node of nodes) {
    if (node.layerIndex === undefined) crossNodes.push(node);
    else push(byLayer, node.layerIndex, node);
  }
  const { children, parents } = layeredAdjacency(nodes, edges);
  const selectedNode = selectedNodeId ? byId.get(selectedNodeId) : undefined;
  const focusId =
    selectedNode?.layerIndex !== undefined
      ? selectedNode.id
      : nodes.find((node) => node.kind === "vision")?.id ?? nodes.find((node) => node.layerIndex !== undefined)?.id ?? "";
  const centerIdsByLayer = focusedLayerCenters(focusId, byId, children, parents);
  const positioned: PositionedNode[] = [];
  for (let layer = 0; layer < LAYER_LABELS.length; layer += 1) {
    const y = LAYER_ROW_START_Y + layer * LAYER_ROW_GAP;
    positioned.push(...positionLayer(byLayer.get(layer) ?? [], y, centerIdsByLayer.get(layer)));
  }
  const mainMaxX = Math.max(0, ...positioned.map((node) => node.x));
  const crossX = mainMaxX + Math.max(320, nodeGapForLayer(crossNodes));
  positioned.push(...spreadLine(crossNodes, LAYER_ROW_START_Y, 82, crossX));
  return positioned;
}

function layeredAdjacency(nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();

  for (const edge of edges) {
    const source = edgeEndpoint(edge.source);
    const target = edgeEndpoint(edge.target);
    const sourceNode = byId.get(source);
    const targetNode = byId.get(target);
    if (!sourceNode || !targetNode) continue;
    if (sourceNode.layerIndex === undefined || targetNode.layerIndex === undefined) continue;
    if (targetNode.layerIndex !== sourceNode.layerIndex + 1) continue;
    push(children, source, target);
    push(parents, target, source);
  }

  sortAdjacency(children, byId);
  sortAdjacency(parents, byId);
  return { children, parents };
}

function sortAdjacency(adjacency: Map<string, string[]>, byId: Map<string, GraphNode>) {
  for (const [id, ids] of adjacency.entries()) {
    adjacency.set(
      id,
      ids.sort((a, b) => {
        const nodeA = byId.get(a);
        const nodeB = byId.get(b);
        if (!nodeA || !nodeB) return a.localeCompare(b);
        return kindSort(nodeA) - kindSort(nodeB) || displayNodeLabel(nodeA).localeCompare(displayNodeLabel(nodeB));
      })
    );
  }
}

function focusedLayerCenters(
  focusId: string,
  byId: Map<string, GraphNode>,
  children: Map<string, string[]>,
  parents: Map<string, string[]>
) {
  const centers = new Map<number, Set<string>>();
  if (!focusId) return centers;

  for (const id of ancestorPath(focusId, byId, parents)) {
    const layer = byId.get(id)?.layerIndex;
    if (layer !== undefined) addToSetMap(centers, layer, id);
  }

  const queue = [...(children.get(focusId) ?? [])];
  const seen = new Set<string>([focusId]);
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const layer = byId.get(id)?.layerIndex;
    if (layer !== undefined) addToSetMap(centers, layer, id);
    queue.push(...(children.get(id) ?? []));
  }

  return centers;
}

function ancestorPath(focusId: string, byId: Map<string, GraphNode>, parents: Map<string, string[]>) {
  const path = [focusId];
  const seen = new Set(path);
  let currentId = focusId;
  while (true) {
    const currentLayer = byId.get(currentId)?.layerIndex;
    if (currentLayer === undefined || currentLayer <= 0) break;
    const parentId = (parents.get(currentId) ?? []).find((id) => !seen.has(id));
    if (!parentId) break;
    path.unshift(parentId);
    seen.add(parentId);
    currentId = parentId;
  }
  return path;
}

function positionLayer(nodes: GraphNode[], y: number, centerIds?: Set<string>): PositionedNode[] {
  if (!nodes.length) return [];
  const sorted = [...nodes].sort((a, b) => displayNodeLabel(a).localeCompare(displayNodeLabel(b)));
  const centered = centerIds?.size ? sorted.filter((node) => centerIds.has(node.id)) : sorted;
  const centerNodes = centered.length ? centered : sorted;
  const outerNodes = sorted.filter((node) => !centerNodes.some((centerNode) => centerNode.id === node.id));
  const leftNodes = outerNodes.slice(0, Math.ceil(outerNodes.length / 2));
  const rightNodes = outerNodes.slice(leftNodes.length);
  const gap = nodeGapForLayer(sorted);
  const centerSpan = gap * Math.max(centerNodes.length - 1, 0);
  const positioned: PositionedNode[] = [];

  centerNodes.forEach((node, index) => {
    positioned.push(positionedLayerNode(node, -centerSpan * 0.5 + index * gap, y));
  });

  leftNodes.forEach((node, index) => {
    const x = -centerSpan * 0.5 - gap * (leftNodes.length - index);
    positioned.push(positionedLayerNode(node, x, y));
  });

  rightNodes.forEach((node, index) => {
    const x = centerSpan * 0.5 + gap * (index + 1);
    positioned.push(positionedLayerNode(node, x, y));
  });

  return positioned;
}

function positionedLayerNode(node: GraphNode, x: number, y: number): PositionedNode {
  const z = CROSS_KINDS.has(node.kind) ? 150 : 0;
  return { ...node, x, y, z, fx: x, fy: y, fz: z };
}

function nodeGapForLayer(nodes: GraphNode[]) {
  if (!nodes.length) return LAYER_NODE_GAP;
  const longestLine = Math.max(
    ...nodes.flatMap((node) => nodeLabelLines(node).map((line) => line.length)),
    0
  );
  return Math.min(340, Math.max(LAYER_NODE_GAP, longestLine * 7.2 + 78));
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

function Graph2D({
  graph,
  mode,
  selectedNodeId,
  selectedLayer,
  viewportWidth,
  onLayerClick,
  onNodeClick
}: {
  graph: VisibleGraph;
  mode: Graph2DMode;
  selectedNodeId: string;
  selectedLayer: number;
  viewportWidth: number;
  onLayerClick: (layer: number) => void;
  onNodeClick: (node: GraphNode) => void;
}) {
  const bounds = graphBounds(graph.nodes, mode, viewportWidth);
  const projectedNodes = useAnimatedProjectedNodes(graph, mode);

  return (
    <svg
      className={`graph-2d graph-2d-${mode}`}
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      role="img"
      style={{ width: bounds.width, height: bounds.height }}
    >
      {(mode === "map" || mode === "commit") && (
        <g className="graph-layer-rows">
          {LAYER_LABELS.map((label, index) => {
            const y = LAYER_ROW_START_Y + index * LAYER_ROW_GAP;
            return (
              <g
                key={label}
                className={`graph-layer-row ${selectedLayer === index ? "is-active" : ""}`}
                onClick={() => onLayerClick(index)}
              >
                <line x1={bounds.minX} y1={y} x2={bounds.minX + bounds.width - 54} y2={y} />
                <title>Open {label} horizontal slice</title>
              </g>
            );
          })}
          <text className="graph-cross-label" x={bounds.minX + bounds.width - 220} y={LAYER_ROW_START_Y - 36}>
            Cross-cutting
          </text>
        </g>
      )}
      <g className="graph-2d-links">
        {graph.links.map((edge) => {
          const source = projectedNodes.get(edgeEndpoint(edge.source));
          const target = projectedNodes.get(edgeEndpoint(edge.target));
          if (!source || !target) return null;
          const sourceState = source.node.visualState ?? "normal";
          const targetState = target.node.visualState ?? "normal";
          const isDimmed = sourceState === "dimmed" || targetState === "dimmed";
          const isSpotlight = sourceState === "selected" || targetState === "selected" || sourceState === "spotlight" || targetState === "spotlight";
          return (
            <line
              key={edge.id}
              className={`graph-2d-link ${isDimmed ? "is-dimmed" : ""} ${isSpotlight ? "is-spotlight" : ""}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={linkColor(edge.kind)}
              strokeWidth={edge.kind === "changed_with" ? 2.6 : 1.35}
              strokeOpacity={edge.kind === "hierarchy" ? 0.42 : 0.68}
            />
          );
        })}
      </g>
      <g className="graph-2d-nodes">
        {graph.nodes.map((node) => {
          const point = projectedNodes.get(node.id);
          if (!point) return null;
          const radius = node.changed ? 13 : node.kind === "code" ? 8 : 10;
          const state = node.visualState ?? "normal";
          const badge = changeStatusLabel(node);
          const labelLines = nodeLabelLines(node);
          return (
            <g
              key={node.id}
              className={`graph-2d-node is-${state} ${node.id === selectedNodeId ? "is-selected-node" : ""}`}
              transform={`translate(${point.x} ${point.y})`}
              onClick={() => onNodeClick(node)}
            >
              <circle
                r={radius}
                fill={node.changed ? "#ffdf5d" : KIND_COLORS[node.kind]}
                stroke={node.hasDiagrams ? "#ffffff" : "rgba(255,255,255,0.34)"}
                strokeWidth={node.hasDiagrams ? 3 : 1.5}
              />
              {node.hasDiagrams && <text className="graph-2d-diagram" x={radius + 7} y={4}>◇</text>}
              <text className="graph-2d-label" x={radius + 9} y={labelLines.length > 1 ? -4 : 4}>
                {labelLines.map((line, index) => (
                  <tspan key={`${node.id}-label-${index}`} x={radius + 9} dy={index === 0 ? 0 : 15}>
                    {line}
                  </tspan>
                ))}
              </text>
              {badge && (
                <text className="graph-2d-badge" x={radius + 9} y={labelLines.length > 1 ? 30 : 22}>
                  {badge}
                </text>
              )}
              <title>{nodeTooltip(node)}</title>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function useAnimatedProjectedNodes(graph: VisibleGraph, mode: Graph2DMode) {
  const targetPositions = useMemo(() => targetPositionMap(graph.nodes, mode), [graph.nodes, mode]);
  const previousPositionsRef = useRef<Map<string, GraphPoint>>(new Map());
  const frameRef = useRef<number | undefined>(undefined);
  const [animatedPositions, setAnimatedPositions] = useState<Map<string, GraphPoint>>(() => targetPositions);

  useEffect(() => {
    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }

    const starts = new Map<string, GraphPoint>();
    for (const [id, target] of targetPositions.entries()) {
      starts.set(
        id,
        previousPositionsRef.current.get(id) ??
          entryPositionForNewNode(id, target, targetPositions, graph.links, previousPositionsRef.current)
      );
    }

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reducedMotion) {
      const snapped = new Map(targetPositions);
      previousPositionsRef.current = snapped;
      setAnimatedPositions(snapped);
      return;
    }

    const startTime = performance.now();
    setAnimatedPositions(new Map(starts));

    const animate = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - startTime) / GRAPH_ANIMATION_MS);
      const eased = easeOutCubic(progress);
      const next = new Map<string, GraphPoint>();

      for (const [id, target] of targetPositions.entries()) {
        const start = starts.get(id) ?? target;
        next.set(id, {
          x: start.x + (target.x - start.x) * eased,
          y: start.y + (target.y - start.y) * eased
        });
      }

      previousPositionsRef.current = next;
      setAnimatedPositions(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        const settled = new Map(targetPositions);
        previousPositionsRef.current = settled;
        setAnimatedPositions(settled);
        frameRef.current = undefined;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [targetPositions, graph.links]);

  return new Map(
    graph.nodes.map((node) => {
      const point = animatedPositions.get(node.id) ?? targetPositions.get(node.id) ?? projectNode(node, mode);
      return [node.id, { node, x: point.x, y: point.y }];
    })
  );
}

function targetPositionMap(nodes: PositionedNode[], mode: Graph2DMode) {
  return new Map(nodes.map((node) => [node.id, projectNode(node, mode)]));
}

function entryPositionForNewNode(
  id: string,
  target: GraphPoint,
  targetPositions: Map<string, GraphPoint>,
  links: GraphEdge[],
  previousPositions: Map<string, GraphPoint>
) {
  for (const edge of links) {
    const source = edgeEndpoint(edge.source);
    const edgeTarget = edgeEndpoint(edge.target);
    const neighborId = edgeTarget === id ? source : source === id ? edgeTarget : "";
    const previous = neighborId ? previousPositions.get(neighborId) : undefined;
    if (previous) return previous;
  }

  for (const edge of links) {
    const source = edgeEndpoint(edge.source);
    const edgeTarget = edgeEndpoint(edge.target);
    const neighborId = edgeTarget === id ? source : source === id ? edgeTarget : "";
    const neighbor = neighborId ? targetPositions.get(neighborId) : undefined;
    if (neighbor) return neighbor;
  }

  return target;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function graphBounds(nodes: PositionedNode[], mode: Graph2DMode, viewportWidth = LAYER_VIEWPORT_MIN_WIDTH) {
  const points = nodes.map((node) => projectNode(node, mode));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  if (mode === "map" || mode === "commit") {
    const viewportPadding = Math.max(240, viewportWidth * 0.5);
    const minX = Math.min(...xs, 0) - viewportPadding;
    const maxX = Math.max(...xs, 0) + Math.max(360, viewportPadding);
    const minY = 0;
    const maxY = Math.max(...ys, LAYER_ROW_START_Y + (LAYER_LABELS.length - 1) * LAYER_ROW_GAP) + 120;
    return {
      minX,
      minY,
      width: Math.max(maxX - minX, LAYER_VIEWPORT_MIN_WIDTH),
      height: Math.max(maxY - minY, GRAPH_HEIGHT)
    };
  }
  const minX = Math.min(...xs, 0) - 220;
  const maxX = Math.max(...xs, 0) + 340;
  const minY = Math.min(...ys, 0) - 140;
  const maxY = Math.max(...ys, 0) + 140;
  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 640),
    height: Math.max(maxY - minY, 420)
  };
}

function projectNode(node: PositionedNode, mode: Graph2DMode) {
  if (mode === "map" || mode === "commit") return { x: node.x, y: node.y };
  if (mode === "plane") return { x: node.x, y: node.z };
  return { x: node.x, y: -node.y };
}

function spreadLine(nodes: GraphNode[], y: number, width: number, startX?: number): PositionedNode[] {
  const sorted = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
  const start = startX ?? -width * (sorted.length - 1) * 0.5;
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
  return nodeLabelLines(node).join("\n");
}

function nodeLabelLines(node: GraphNode) {
  const prefix = node.changed ? "CHANGED · " : "";
  const diagram = node.hasDiagrams ? " ◇" : "";
  return wrapLabel(`${prefix}${displayNodeLabel(node)}${diagram}`, 28);
}

function displayNodeLabel(node: GraphNode) {
  const prefixes = [
    `${KIND_LABELS[node.kind]}:`,
    "UI Module:",
    "API Module:",
    "Backend Module:",
    "Frontend Module:",
    "Data Module:",
    "Domain Module:"
  ];
  const prefix = prefixes.find((candidate) => node.label.startsWith(candidate));
  return prefix ? node.label.slice(prefix.length).trim() : node.label;
}

function wrapLabel(label: string, maxLineLength: number) {
  const normalized = label.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLineLength) return [normalized];
  const words = normalized.split(" ");
  if (words.length < 2) return [normalized];

  let bestBreak = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ");
    const second = words.slice(index).join(" ");
    const score = Math.max(first.length, second.length) + Math.abs(first.length - second.length) * 0.25;
    if (score < bestScore) {
      bestBreak = index;
      bestScore = score;
    }
  }

  return [words.slice(0, bestBreak).join(" "), words.slice(bestBreak).join(" ")];
}

function nodeTooltip(node: GraphNode) {
  const status = changeStatusLabel(node);
  const previous = node.previousPath ? `\nprevious: ${node.previousPath}` : "";
  return `${KIND_LABELS[node.kind]}${status ? ` · ${status}` : ""}${node.hasDiagrams ? " · diagram" : ""}\n${node.path}${previous}`;
}

function changeStatusLabel(node: GraphNode) {
  if (!node.changeStatus) return node.changed ? "changed" : "";
  const labels: Record<NonNullable<GraphNode["changeStatus"]>, string> = {
    added: "added",
    modified: "modified",
    deleted: "deleted",
    renamed: "renamed",
    copied: "copied",
    unknown: "changed"
  };
  return labels[node.changeStatus];
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
  if (viewMode === "map") return "Layered Understanding Map";
  if (viewMode === "plane") return `${LAYER_LABELS[layer]} Plane`;
  if (viewMode === "slice") return "Vertical Feature Slice";
  if (viewMode === "commit") return "Change-Aware Layered Map";
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

function addToSetMap<K, V>(map: Map<K, Set<V>>, key: K, value: V) {
  const existing = map.get(key);
  if (existing) existing.add(value);
  else map.set(key, new Set([value]));
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
