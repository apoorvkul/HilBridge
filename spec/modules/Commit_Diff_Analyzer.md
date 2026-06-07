# Commit Diff Analyzer

The commit diff analyzer augments a base graph with changed-file metadata for a requested commit.

## Responsibilities

- Ask git for changed paths.
- Mark existing note or code nodes as changed.
- Create changed code nodes when changed source files were not already referenced.
- Assign commit URLs to changed nodes.
- Connect changed nodes to each other with `changed_with` edges.

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- backend/src/server.ts
