# Commit Diff Request Contract

Commit diff mode uses the same graph endpoint as repository loading, with `commitHash` set.

## Behavior

- The backend builds the normal graph first.
- The backend runs `git diff-tree --no-commit-id --name-status -r -M <commitHash>`.
- Matching graph nodes receive `changed: true`.
- Matching graph nodes receive `changeStatus` when the git status is recognized.
- Renamed and copied nodes receive `previousPath`.
- Changed nodes receive `githubDiffUrl` when a GitHub remote is available.
- Changed paths without existing nodes become placeholder note or code nodes.
- Deleted placeholder nodes do not reconstruct historical ancestors.

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
