# Commit Diff Analyzer

The commit diff analyzer augments a base graph with changed-file metadata for a requested commit or the staged local diff.

## Responsibilities

- Ask git for changed paths and name-status metadata for either a commit or staged local changes.
- Mark existing note or code nodes as changed.
- Create changed placeholder note or code nodes when changed files were not already present in the current graph.
- Record change status and previous path metadata when available.
- Assign commit-page file-diff URLs to committed changed nodes when GitHub metadata is available.
- Leave staged changed nodes without commit diff URLs because no commit page exists yet.
- Connect changed nodes to each other with `changed_with` edges.

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- backend/src/server.ts
