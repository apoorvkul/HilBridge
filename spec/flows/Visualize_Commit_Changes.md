# Visualize Commit Changes

Commit mode lets the user enter a commit hash. The backend uses `git diff-tree --name-status` to identify changed files, marks matching graph nodes, records change status metadata, creates missing placeholder nodes for changed files, and attaches commit URLs.

```plantuml
@startuml
participant UI
participant Backend
participant Git
participant Graph

UI -> Backend: POST /api/graph(repoPath, commitHash)
Backend -> Graph: build base graph
Backend -> Git: git diff-tree --name-status -r -M commitHash
Git --> Backend: changed paths and statuses
Backend -> Graph: mark changed nodes and changeStatus
Backend -> Graph: add changed_with edges
Backend --> UI: GraphResponse
UI -> UI: show changed nodes in layered context
@enduml
```

Changed nodes are rendered in the change-aware layered map with available ancestors, direct descendants, directly connected context, and cross-cutting context. Deleted files may appear as placeholder nodes without reconstructed historical ancestry.

## Capabilities

- [Commit Diff Visualization](../capabilities/Commit_Diff_Visualization.md)
- [Change-Aware System Understanding](../capabilities/Change_Aware_System_Understanding.md)

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
