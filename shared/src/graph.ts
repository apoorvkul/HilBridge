export type GraphNodeKind =
  | "vision"
  | "capability"
  | "flow"
  | "module"
  | "contract"
  | "code"
  | "architecture_note"
  | "domain_note"
  | "technology_note";

export type GraphEdgeKind =
  | "markdown_link"
  | "source_reference"
  | "hierarchy"
  | "cross_cutting"
  | "changed_with";

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  path: string;
  githubUrl?: string;
  githubDiffUrl?: string;
  layerIndex?: number;
  changed?: boolean;
  hasDiagrams?: boolean;
  degree?: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
};

export type GitHubInfo = {
  remoteUrl?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  commitHash?: string;
  webUrl?: string;
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  repo: {
    path: string;
    specPath: string;
    github: GitHubInfo;
  };
  warnings: string[];
};

export type GraphRequest = {
  repoPath: string;
  commitHash?: string;
};

export const LAYER_LABELS = [
  "Vision",
  "Capabilities",
  "Flows",
  "Modules",
  "Contracts",
  "Code"
] as const;

export const KIND_LABELS: Record<GraphNodeKind, string> = {
  vision: "Vision",
  capability: "Capability",
  flow: "Flow",
  module: "Module",
  contract: "Contract",
  code: "Code",
  architecture_note: "Architecture Note",
  domain_note: "Domain Note",
  technology_note: "Technology Note"
};

export const KIND_LAYER: Partial<Record<GraphNodeKind, number>> = {
  vision: 0,
  capability: 1,
  flow: 2,
  module: 3,
  contract: 4,
  code: 5
};
