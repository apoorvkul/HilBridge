# Open Node in GitHub

The user clicks a graph node. If the node is changed and has `githubDiffUrl`, the frontend opens that URL. Otherwise it opens `githubUrl`.

## Steps

1. Node click calls `openNode`.
2. Prefer `githubDiffUrl` for changed nodes, which points to the selected file's diff section on the GitHub commit page when available.
3. Fallback to `githubUrl`.
4. Open the URL in a new browser tab with `noopener,noreferrer`.

## Modules

- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)
- [GitHub URL Resolver](../modules/GitHub_URL_Resolver.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)
