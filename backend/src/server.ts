import cors from "cors";
import express from "express";
import matter from "gray-matter";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  GraphEdge,
  GraphNode,
  GraphNodeKind,
  GraphRequest,
  GraphResponse,
  KIND_LAYER
} from "../../shared/src/graph.js";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT ?? 4317);

type ParsedNote = {
  node: GraphNode;
  content: string;
  markdownTargets: string[];
  wikiTargets: string[];
  sourceTargets: string[];
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/graph", async (request, response) => {
  try {
    const body = request.body as GraphRequest;
    const requestedPath = body.repoPath?.trim();
    if (!requestedPath) {
      throw new Error("Repository path is required.");
    }
    const repoPath = path.resolve(requestedPath);
    const graph = await buildGraph(repoPath, body.commitHash?.trim() || undefined);
    response.json(graph);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    response.status(400).json({ error: message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Spec graph backend listening on http://127.0.0.1:${PORT}`);
});

async function buildGraph(repoPath: string, commitHash?: string): Promise<GraphResponse> {
  const warnings: string[] = [];
  const specPath = path.join(repoPath, "spec");
  const specStats = await statOrNull(specPath);
  if (!specStats?.isDirectory()) {
    throw new Error(`No spec/ directory found at ${specPath}`);
  }

  const github = await getGitHubInfo(repoPath, commitHash, warnings);
  const markdownFiles = await walkFiles(specPath, [".md", ".markdown"]);
  const parsedNotes = await Promise.all(
    markdownFiles.map((absolutePath) => parseNote(repoPath, specPath, absolutePath, github, commitHash))
  );

  const nodesById = new Map<string, GraphNode>();
  const noteByPath = new Map<string, ParsedNote>();
  const noteByBasename = new Map<string, ParsedNote[]>();
  const noteByTitle = new Map<string, ParsedNote[]>();
  const edges: GraphEdge[] = [];
  const edgeIds = new Set<string>();

  for (const note of parsedNotes) {
    nodesById.set(note.node.id, note.node);
    noteByPath.set(note.node.path, note);
    pushIndex(noteByBasename, basenameKey(note.node.path), note);
    pushIndex(noteByTitle, slugKey(note.node.label), note);
  }

  for (const note of parsedNotes) {
    for (const targetPath of note.markdownTargets) {
      const target = noteByPath.get(targetPath);
      if (target) {
        addEdge(edges, edgeIds, note.node.id, target.node.id, edgeKindFor(note.node.kind, target.node.kind));
      } else {
        warnings.push(`Could not resolve markdown link from ${note.node.path} to ${targetPath}`);
      }
    }

    for (const wikiTarget of note.wikiTargets) {
      const candidates = noteByTitle.get(slugKey(wikiTarget)) ?? noteByBasename.get(slugKey(wikiTarget));
      if (candidates?.length === 1) {
        addEdge(edges, edgeIds, note.node.id, candidates[0].node.id, edgeKindFor(note.node.kind, candidates[0].node.kind));
      } else if (candidates && candidates.length > 1) {
        warnings.push(`Ambiguous wikilink [[${wikiTarget}]] in ${note.node.path}`);
      } else {
        warnings.push(`Could not resolve wikilink [[${wikiTarget}]] in ${note.node.path}`);
      }
    }

    for (const sourcePath of note.sourceTargets) {
      const sourceNode = ensureCodeNode(nodesById, repoPath, sourcePath, github, commitHash);
      addEdge(edges, edgeIds, note.node.id, sourceNode.id, "source_reference");
    }
  }

  addFolderHierarchyEdges(parsedNotes, edges, edgeIds);

  if (commitHash) {
    await markChangedFiles(repoPath, commitHash, nodesById, edges, edgeIds, github, warnings);
  }

  const nodes = Array.from(nodesById.values());
  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(String(edge.source), (degree.get(String(edge.source)) ?? 0) + 1);
    degree.set(String(edge.target), (degree.get(String(edge.target)) ?? 0) + 1);
  }
  for (const node of nodes) {
    node.degree = degree.get(node.id) ?? 0;
  }

  return {
    nodes,
    edges,
    repo: {
      path: repoPath,
      specPath,
      github
    },
    warnings: unique(warnings).slice(0, 200)
  };
}

async function parseNote(
  repoPath: string,
  specPath: string,
  absolutePath: string,
  github: GraphResponse["repo"]["github"],
  commitHash?: string
): Promise<ParsedNote> {
  const raw = await fs.readFile(absolutePath, "utf8");
  const parsed = matter(raw);
  const repoRelativePath = toPosix(path.relative(repoPath, absolutePath));
  const specRelativePath = toPosix(path.relative(specPath, absolutePath));
  const kind = inferKind(specRelativePath, parsed.data);
  const title =
    stringFromFrontmatter(parsed.data.title) ??
    stringFromFrontmatter(parsed.data.name) ??
    extractHeading(parsed.content) ??
    titleFromFilename(absolutePath);

  return {
    node: {
      id: `note:${repoRelativePath}`,
      label: title,
      kind,
      path: repoRelativePath,
      githubUrl: githubBlobUrl(github, repoRelativePath, commitHash),
      layerIndex: KIND_LAYER[kind],
      hasDiagrams: hasPlantUml(parsed.content)
    },
    content: parsed.content,
    markdownTargets: extractMarkdownLinks(parsed.content, repoRelativePath, repoPath),
    wikiTargets: extractWikiLinks(parsed.content),
    sourceTargets: extractSourceReferences(parsed.content)
  };
}

function inferKind(specRelativePath: string, data: Record<string, unknown>): GraphNodeKind {
  const frontmatterKind = stringFromFrontmatter(data.kind) ?? stringFromFrontmatter(data.type) ?? "";
  const normalized = frontmatterKind.toLowerCase().replace(/[\s-]+/g, "_");
  if (isGraphKind(normalized)) {
    return normalized;
  }

  const lower = specRelativePath.toLowerCase();
  if (lower === "vision.md" || lower.startsWith("vision/")) return "vision";
  if (lower.startsWith("capabilities/")) return "capability";
  if (lower.startsWith("flows/")) return "flow";
  if (lower.startsWith("modules/")) return "module";
  if (lower.startsWith("contracts/")) return "contract";
  if (lower.startsWith("architecture_notes/")) return "architecture_note";
  if (lower.startsWith("domain_notes/")) return "domain_note";
  if (lower.startsWith("technology_notes/") || lower.startsWith("tech_notes/")) return "technology_note";
  return "domain_note";
}

function isGraphKind(value: string): value is GraphNodeKind {
  return [
    "vision",
    "capability",
    "flow",
    "module",
    "contract",
    "code",
    "architecture_note",
    "domain_note",
    "technology_note"
  ].includes(value);
}

function extractMarkdownLinks(content: string, fromRepoRelativePath: string, repoPath: string): string[] {
  const links: string[] = [];
  const regex = /!?\[[^\]]*]\(([^)]+)\)/g;
  for (const match of content.matchAll(regex)) {
    const rawHref = match[1].trim().replace(/^<|>$/g, "");
    if (!rawHref || rawHref.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(rawHref)) continue;

    const href = decodeURIComponent(rawHref.split("#")[0].split("?")[0]);
    if (!/\.(md|markdown)$/i.test(href)) continue;

    const resolved = path.normalize(path.resolve(repoPath, path.dirname(fromRepoRelativePath), href));
    if (!isInside(resolved, repoPath)) continue;
    links.push(toPosix(path.relative(repoPath, resolved)));
  }
  return unique(links);
}

function extractWikiLinks(content: string): string[] {
  const targets: string[] = [];
  const regex = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?]]/g;
  for (const match of content.matchAll(regex)) {
    const target = match[1].trim();
    if (target) targets.push(target);
  }
  return unique(targets);
}

function extractSourceReferences(content: string): string[] {
  const withoutCodeFences = content.replace(/```[\s\S]*?```/g, "");
  const references = new Set<string>();
  const pathRegex =
    /(?:^|[\s`("'*-])((?:[A-Za-z0-9_.@-]+\/)+(?:[A-Za-z0-9_.$@-]+)\.(?:dart|py|ts|tsx|js|jsx|sql|drift|go|rs|java|kt|swift|c|cc|cpp|h|hpp|cs|rb|php|html|css|scss|json|yaml|yml|toml|sh|mdx?))(?:$|[\s`)"'>,.;:])/gim;

  for (const match of withoutCodeFences.matchAll(pathRegex)) {
    const candidate = normalizeReference(match[1]);
    if (!candidate) continue;
    if (candidate.startsWith("spec/") && /\.(md|markdown)$/i.test(candidate)) continue;
    references.add(candidate);
  }

  return [...references].sort();
}

function normalizeReference(value: string): string | null {
  const trimmed = value.trim().replace(/^\.?\//, "").replace(/[),.;:]+$/, "");
  if (!trimmed || trimmed.includes("://") || trimmed.startsWith("../")) return null;
  return toPosix(path.normalize(trimmed));
}

function ensureCodeNode(
  nodesById: Map<string, GraphNode>,
  repoPath: string,
  sourcePath: string,
  github: GraphResponse["repo"]["github"],
  commitHash?: string
): GraphNode {
  const id = `code:${sourcePath}`;
  const existing = nodesById.get(id);
  if (existing) return existing;

  const node: GraphNode = {
    id,
    label: path.basename(sourcePath),
    kind: "code",
    path: sourcePath,
    githubUrl: githubBlobUrl(github, sourcePath, commitHash),
    layerIndex: KIND_LAYER.code
  };
  nodesById.set(id, node);
  void statOrNull(path.join(repoPath, sourcePath));
  return node;
}

function addFolderHierarchyEdges(notes: ParsedNote[], edges: GraphEdge[], edgeIds: Set<string>) {
  const byLayer = new Map<number, ParsedNote[]>();
  for (const note of notes) {
    const layer = note.node.layerIndex;
    if (layer === undefined) continue;
    pushIndex(byLayer, layer, note);
  }

  for (let layer = 0; layer < 4; layer += 1) {
    const parents = byLayer.get(layer) ?? [];
    const children = byLayer.get(layer + 1) ?? [];
    if (!parents.length || !children.length) continue;

    if (parents.length === 1) {
      for (const child of children) addEdge(edges, edgeIds, parents[0].node.id, child.node.id, "hierarchy");
      continue;
    }

    for (const parent of parents) {
      const parentKey = slugKey(parent.node.label);
      for (const child of children) {
        const childText = slugKey(`${child.node.label} ${child.content.slice(0, 400)}`);
        if (childText.includes(parentKey)) {
          addEdge(edges, edgeIds, parent.node.id, child.node.id, "hierarchy");
        }
      }
    }
  }
}

async function markChangedFiles(
  repoPath: string,
  commitHash: string,
  nodesById: Map<string, GraphNode>,
  edges: GraphEdge[],
  edgeIds: Set<string>,
  github: GraphResponse["repo"]["github"],
  warnings: string[]
) {
  try {
    const { stdout } = await execFileAsync("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", commitHash], {
      cwd: repoPath,
      maxBuffer: 1024 * 1024
    });
    const changedPaths = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const commitUrl = githubCommitUrl(github, commitHash);

    for (const changedPath of changedPaths) {
      const noteId = `note:${changedPath}`;
      const codeId = `code:${changedPath}`;
      let node = nodesById.get(noteId) ?? nodesById.get(codeId);
      if (!node && !changedPath.startsWith("spec/")) {
        node = {
          id: codeId,
          label: path.basename(changedPath),
          kind: "code",
          path: changedPath,
          githubUrl: githubBlobUrl(github, changedPath),
          githubDiffUrl: commitUrl,
          layerIndex: KIND_LAYER.code,
          changed: true
        };
        nodesById.set(node.id, node);
      }

      if (node) {
        node.changed = true;
        node.githubDiffUrl = commitUrl;
      }
    }

    const changedNodes = [...nodesById.values()].filter((node) => node.changed);
    for (let index = 0; index < changedNodes.length; index += 1) {
      const node = changedNodes[index];
      for (const other of changedNodes.slice(index + 1)) {
        addEdge(edges, edgeIds, node.id, other.id, "changed_with");
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Could not inspect commit ${commitHash}: ${message}`);
  }
}

async function getGitHubInfo(
  repoPath: string,
  commitHash: string | undefined,
  warnings: string[]
): Promise<GraphResponse["repo"]["github"]> {
  const github: GraphResponse["repo"]["github"] = { commitHash };
  try {
    const { stdout } = await execFileAsync("git", ["remote", "get-url", "origin"], { cwd: repoPath });
    github.remoteUrl = stdout.trim();
    const parsed = parseGitHubRemote(github.remoteUrl);
    if (parsed) {
      github.owner = parsed.owner;
      github.repo = parsed.repo;
      github.webUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
    } else {
      warnings.push(`Origin remote is not a recognizable GitHub URL: ${github.remoteUrl}`);
    }
  } catch {
    warnings.push("Could not read git origin remote.");
  }

  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoPath });
    const branch = stdout.trim();
    github.branch = branch && branch !== "HEAD" ? branch : "HEAD";
  } catch {
    warnings.push("Could not detect current git branch.");
  }

  return github;
}

function parseGitHubRemote(remoteUrl: string): { owner: string; repo: string } | null {
  const trimmed = remoteUrl.trim();

  try {
    const url = new URL(trimmed);
    if (url.hostname.toLowerCase() === "github.com") {
      const [owner, repo] = cleanGitHubPath(url.pathname);
      if (owner && repo) return { owner, repo };
    }
  } catch {
    // Fall through to scp-style SSH parsing below.
  }

  const sshMatch = trimmed.match(/^(?:[^@]+@)?github\.com:([^/]+)\/(.+?)(?:\.git)?\/?$/i);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2].replace(/\.git$/i, "") };
  return null;
}

function cleanGitHubPath(pathname: string): [string | undefined, string | undefined] {
  const parts = pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return [undefined, undefined];
  return [parts[0], parts[1].replace(/\.git$/i, "")];
}

function githubBlobUrl(github: GraphResponse["repo"]["github"], relativePath: string, ref?: string): string | undefined {
  if (!github.webUrl) return undefined;
  const branchOrRef = ref || github.branch || "HEAD";
  return `${github.webUrl}/blob/${encodeURIComponent(branchOrRef)}/${encodePath(relativePath)}`;
}

function githubCommitUrl(github: GraphResponse["repo"]["github"], commitHash: string): string | undefined {
  if (!github.webUrl) return undefined;
  return `${github.webUrl}/commit/${encodeURIComponent(commitHash)}`;
}

function addEdge(
  edges: GraphEdge[],
  ids: Set<string>,
  source: string,
  target: string,
  kind: GraphEdge["kind"]
) {
  if (source === target) return;
  const id = `${kind}:${source}->${target}`;
  if (ids.has(id)) return;
  ids.add(id);
  edges.push({ id, source, target, kind });
}

function edgeKindFor(sourceKind: GraphNodeKind, targetKind: GraphNodeKind): GraphEdge["kind"] {
  if (sourceKind.endsWith("_note") || targetKind.endsWith("_note")) return "cross_cutting";
  return "markdown_link";
}

async function walkFiles(root: string, extensions: string[]): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(root, entry.name);
      if (entry.isDirectory()) return walkFiles(absolutePath, extensions);
      if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) return [absolutePath];
      return [];
    })
  );
  return files.flat().sort();
}

async function statOrNull(absolutePath: string) {
  try {
    return await fs.stat(absolutePath);
  } catch {
    return null;
  }
}

function pushIndex<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}

function stringFromFrontmatter(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function extractHeading(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function titleFromFilename(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPlantUml(content: string): boolean {
  return /```plantuml|@startuml/i.test(content);
}

function basenameKey(filePath: string): string {
  return slugKey(path.basename(filePath, path.extname(filePath)));
}

function slugKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "_");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

function isInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function encodePath(relativePath: string): string {
  return relativePath.split("/").map(encodeURIComponent).join("/");
}
