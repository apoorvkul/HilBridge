# Commit Diff Request Contract

Commit diff mode uses the same graph endpoint as repository loading, with `commitHash` set.

## Behavior

- The backend builds the normal graph first.
- The backend runs `git diff-tree --no-commit-id --name-only -r <commitHash>`.
- Matching graph nodes receive `changed: true`.
- Changed nodes receive `githubDiffUrl` when a GitHub remote is available.
- Changed source paths without existing nodes become code nodes.

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
