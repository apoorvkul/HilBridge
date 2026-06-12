# Commit Diff Analyzer

The commit diff analyzer augments a base graph with changed-file metadata for a requested commit.

## Responsibilities

- Ask git for changed paths and name-status metadata.
- Mark existing note or code nodes as changed.
- Create changed placeholder note or code nodes when changed files were not already present in the current graph.
- Record change status and previous path metadata when available.
- Assign commit URLs to changed nodes.
- Connect changed nodes to each other with `changed_with` edges.

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- backend/src/server.ts
