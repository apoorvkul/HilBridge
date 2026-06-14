import cors from "cors";
import express from "express";
import matter from "gray-matter";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  CommitFilterOption,
  CommitOptionsRequest,
  CommitOptionsResponse,
  DiffTarget,
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

type DiffSelection =
  | {
      kind: "commit";
      commitHash: string;
    }
  | {
      kind: "staged";
    };

type GitHubCommitPayload = {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      date?: string;
    };
    committer?: {
      date?: string;
    };
  };
};
type GitHubCommitOption = Extract<CommitFilterOption, { kind: "commit" }>;

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
    const graph = await buildGraph(repoPath, diffSelectionFromRequest(body));
    response.json(graph);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    response.status(400).json({ error: message });
  }
});

app.post("/api/commit-options", async (request, response) => {
  try {
    const body = request.body as CommitOptionsRequest;
    const requestedPath = body.repoPath?.trim();
    if (!requestedPath) {
      throw new Error("Repository path is required.");
    }
    const repoPath = path.resolve(requestedPath);
    response.json(await buildCommitOptions(repoPath, body.limit));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    response.status(400).json({ error: message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Spec graph backend listening on http://127.0.0.1:${PORT}`);
});

function diffSelectionFromRequest(body: GraphRequest): DiffSelection | undefined {
  const commitHash = body.commitHash?.trim();
  const diffTarget = body.diffTarget;
  if (!diffTarget && commitHash) return { kind: "commit", commitHash };
  if (!diffTarget) return undefined;
  if (!isDiffTarget(diffTarget)) {
    throw new Error(`Unsupported diff target: ${String(diffTarget)}`);
  }
  if (diffTarget === "staged") return { kind: "staged" };
  if (!commitHash) {
    throw new Error("Commit hash is required for commit diff filtering.");
  }
  return { kind: "commit", commitHash };
}

function isDiffTarget(value: unknown): value is DiffTarget {
  return value === "commit" || value === "staged";
}

async function buildGraph(repoPath: string, diffSelection?: DiffSelection): Promise<GraphResponse> {
  const warnings: string[] = [];
  const specPath = path.join(repoPath, "spec");
  const specStats = await statOrNull(specPath);
  if (!specStats?.isDirectory()) {
    throw new Error(`No spec/ directory found at ${specPath}`);
  }

  const commitHash = diffSelection?.kind === "commit" ? diffSelection.commitHash : undefined;
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

  if (diffSelection?.kind === "commit") {
    await markChangedFiles(repoPath, diffSelection.commitHash, nodesById, edges, edgeIds, github, warnings);
  } else if (diffSelection?.kind === "staged") {
    await markStagedFiles(repoPath, nodesById, edges, edgeIds, github, warnings);
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

async function buildCommitOptions(repoPath: string, requestedLimit?: number): Promise<CommitOptionsResponse> {
  const warnings: string[] = [];
  const github = await getGitHubInfo(repoPath, undefined, warnings);
  const limit = Math.min(Math.max(Math.trunc(requestedLimit ?? 30), 1), 100);
  const options: CommitFilterOption[] = [];
  const stagedEntries = await readStagedDiffEntries(repoPath, warnings);

  if (stagedEntries.length) {
    options.push({ kind: "staged", label: "Staged Local Changes" });
  }

  options.push(...(await fetchGitHubCommitOptions(repoPath, github, limit, warnings)));

  return {
    options,
    repo: {
      path: repoPath,
      github
    },
    warnings: unique(warnings).slice(0, 200)
  };
}

async function fetchGitHubCommitOptions(
  repoPath: string,
  github: GraphResponse["repo"]["github"],
  limit: number,
  warnings: string[]
): Promise<CommitFilterOption[]> {
  if (!github.owner || !github.repo) {
    warnings.push("Commit options require a recognizable GitHub origin remote.");
    return [];
  }

  try {
    const url = new URL(`https://api.github.com/repos/${github.owner}/${github.repo}/commits`);
    url.searchParams.set("per_page", String(limit));
    if (github.branch && github.branch !== "HEAD") {
      url.searchParams.set("sha", github.branch);
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "spec-graph-visualizer"
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const githubResponse = await fetch(url, { headers });
    if (!githubResponse.ok) {
      warnings.push(`Could not load GitHub commits: ${githubResponse.status} ${githubResponse.statusText}`);
      return [];
    }

    const payload = (await githubResponse.json()) as GitHubCommitPayload[];
    const commitOptions = payload
      .map((commit): GitHubCommitOption | undefined => {
        if (!commit.sha) return undefined;
        const message = firstCommitMessageLine(commit.commit?.message) || commit.sha.slice(0, 12);
        const committedAt = commit.commit?.committer?.date ?? commit.commit?.author?.date;
        if (!committedAt) return undefined;
        return {
          kind: "commit",
          sha: commit.sha,
          message,
          committedAt,
          url: commit.html_url
        };
      })
      .filter(isDefined);

    const localOptions = (
      await Promise.all(
        commitOptions.map(async (option) => ((await commitExistsLocally(repoPath, option.sha)) ? option : undefined))
      )
    ).filter(isDefined);

    if (commitOptions.length && !localOptions.length) {
      warnings.push("GitHub commits were found, but none exist in the local checkout.");
    }

    return localOptions;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Could not load GitHub commits: ${message}`);
    return [];
  }
}

function firstCommitMessageLine(message?: string): string {
  return message?.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
}

async function commitExistsLocally(repoPath: string, commitHash: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["cat-file", "-e", `${commitHash}^{commit}`], { cwd: repoPath });
    return true;
  } catch {
    return false;
  }
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
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
    const { stdout } = await execFileAsync("git", ["diff-tree", "--no-commit-id", "--name-status", "-r", "-M", commitHash], {
      cwd: repoPath,
      maxBuffer: 1024 * 1024
    });
    applyChangedEntries(parseDiffTreeEntries(stdout), nodesById, edges, edgeIds, github, commitHash);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Could not inspect commit ${commitHash}: ${message}`);
  }
}

async function markStagedFiles(
  repoPath: string,
  nodesById: Map<string, GraphNode>,
  edges: GraphEdge[],
  edgeIds: Set<string>,
  github: GraphResponse["repo"]["github"],
  warnings: string[]
) {
  const changedEntries = await readStagedDiffEntries(repoPath, warnings);
  if (!changedEntries.length) {
    warnings.push("No staged changes found.");
  }
  applyChangedEntries(changedEntries, nodesById, edges, edgeIds, github);
}

async function readStagedDiffEntries(repoPath: string, warnings: string[]): Promise<ChangedFileEntry[]> {
  try {
    const { stdout } = await execFileAsync("git", ["diff", "--cached", "--name-status", "-M"], {
      cwd: repoPath,
      maxBuffer: 1024 * 1024
    });
    return parseDiffTreeEntries(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Could not inspect staged changes: ${message}`);
    return [];
  }
}

function applyChangedEntries(
  changedEntries: ChangedFileEntry[],
  nodesById: Map<string, GraphNode>,
  edges: GraphEdge[],
  edgeIds: Set<string>,
  github: GraphResponse["repo"]["github"],
  commitHash?: string
) {
  const commitUrl = commitHash ? githubCommitUrl(github, commitHash) : undefined;

  for (const entry of changedEntries) {
    const noteId = `note:${entry.path}`;
    const codeId = `code:${entry.path}`;
    const node = nodesById.get(noteId) ?? nodesById.get(codeId) ?? ensureChangedPlaceholderNode(nodesById, entry, github, commitHash);
    node.changed = true;
    node.changeStatus = entry.changeStatus;
    node.previousPath = entry.previousPath;
    if (commitHash) {
      node.githubDiffUrl = githubCommitFileDiffUrl(github, commitHash, entry.path) ?? commitUrl;
    } else {
      delete node.githubDiffUrl;
    }
  }

  const changedNodes = [...nodesById.values()].filter((node) => node.changed);
  for (let index = 0; index < changedNodes.length; index += 1) {
    const node = changedNodes[index];
    for (const other of changedNodes.slice(index + 1)) {
      addEdge(edges, edgeIds, node.id, other.id, "changed_with");
    }
  }
}

type ChangedFileEntry = {
  path: string;
  previousPath?: string;
  changeStatus: NonNullable<GraphNode["changeStatus"]>;
};

function parseDiffTreeEntries(stdout: string): ChangedFileEntry[] {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawStatus, firstPath, secondPath] = line.split(/\t+/);
      const code = rawStatus.charAt(0);
      const pathValue = secondPath || firstPath;
      return {
        path: pathValue,
        previousPath: secondPath ? firstPath : undefined,
        changeStatus: changeStatusForDiffCode(code)
      };
    })
    .filter((entry) => Boolean(entry.path));
}

function changeStatusForDiffCode(code: string): ChangedFileEntry["changeStatus"] {
  if (code === "A") return "added";
  if (code === "M") return "modified";
  if (code === "D") return "deleted";
  if (code === "R") return "renamed";
  if (code === "C") return "copied";
  return "unknown";
}

function ensureChangedPlaceholderNode(
  nodesById: Map<string, GraphNode>,
  entry: ChangedFileEntry,
  github: GraphResponse["repo"]["github"],
  commitHash?: string
): GraphNode {
  const isSpecNote = /^spec\/.+\.md$/i.test(entry.path) || /^spec\/.+\.markdown$/i.test(entry.path);
  const id = isSpecNote ? `note:${entry.path}` : `code:${entry.path}`;
  const existing = nodesById.get(id);
  if (existing) return existing;

  const specRelativePath = isSpecNote ? entry.path.replace(/^spec\//i, "") : "";
  const kind = isSpecNote ? inferKind(specRelativePath, {}) : "code";
  const node: GraphNode = {
    id,
    label: isSpecNote ? titleFromFilename(entry.path) : path.basename(entry.path),
    kind,
    path: entry.path,
    githubUrl: entry.changeStatus === "deleted" && commitHash ? undefined : githubBlobUrl(github, entry.path, commitHash),
    githubDiffUrl: commitHash ? githubCommitFileDiffUrl(github, commitHash, entry.path) : undefined,
    layerIndex: KIND_LAYER[kind],
    changed: true,
    changeStatus: entry.changeStatus,
    previousPath: entry.previousPath
  };
  nodesById.set(node.id, node);
  return node;
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

function githubCommitFileDiffUrl(
  github: GraphResponse["repo"]["github"],
  commitHash: string,
  relativePath: string
): string | undefined {
  const commitUrl = githubCommitUrl(github, commitHash);
  if (!commitUrl) return undefined;
  return `${commitUrl}#diff-${sha256Hex(relativePath)}`;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
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
