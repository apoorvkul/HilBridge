# Visualize Commit Changes

The commit filter lets the user choose recent GitHub commits by message and date/time, or choose `Staged Local Changes` when the local checkout has staged changes. The backend uses GitHub commit metadata for dropdown options, then uses local git diff commands to identify changed files, mark matching graph nodes, record change status metadata, create missing placeholder nodes for changed files, and attach commit URLs anchored to each changed file's diff section when GitHub metadata is available.

```plantuml
@startuml
participant UI
participant Backend
participant GitHub
participant Git
participant Graph

UI -> Backend: POST /api/commit-options(repoPath)
Backend -> GitHub: fetch recent commits
Backend -> Git: git diff --cached --name-status -M
Backend --> UI: CommitOptionsResponse
UI -> Backend: POST /api/graph(repoPath, diffTarget, commitHash?)
Backend -> Graph: build base graph
Backend -> Git: git diff-tree or staged diff
Git --> Backend: changed paths and statuses
Backend -> Graph: mark changed nodes and changeStatus
Backend -> Graph: add changed_with edges
Backend --> UI: GraphResponse
UI -> UI: filter graph to changed nodes plus upstream ancestors
UI -> UI: render selected view from filtered graph
@enduml
```

When a commit or staged diff target is active, the frontend first filters the graph to touched nodes plus available upstream nodes that connect those changes back toward Vision. The selected view then behaves normally on that filtered graph. In the layered map, exploration still starts with Vision and Capabilities when those nodes are present, and changed lower-layer nodes become visible only when the user selects and expands their direct parent one abstraction layer at a time. Deleted files may appear as placeholder nodes without reconstructed historical ancestry and are only visible when their inferred layer is reached.

## Capabilities

- [Commit Diff Visualization](../capabilities/Commit_Diff_Visualization.md)
- [Change-Aware System Understanding](../capabilities/Change_Aware_System_Understanding.md)

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Commit Filter Options](../contracts/Commit_Filter_Options.md)
- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
