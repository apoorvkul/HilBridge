# Visualize Commit Changes

Commit mode lets the user enter a commit hash. The backend uses `git diff-tree` to identify changed files, marks matching graph nodes, creates missing code nodes for changed source files, and attaches commit URLs.

```plantuml
@startuml
participant UI
participant Backend
participant Git
participant Graph

UI -> Backend: POST /api/graph(repoPath, commitHash)
Backend -> Graph: build base graph
Backend -> Git: git diff-tree --name-only -r commitHash
Git --> Backend: changed paths
Backend -> Graph: mark changed nodes
Backend -> Graph: add changed_with edges
Backend --> UI: GraphResponse
UI -> UI: show changed nodes plus neighbors
@enduml
```

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
