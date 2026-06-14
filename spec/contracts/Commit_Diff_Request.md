# Commit Diff Request Contract

The commit filter uses the same graph endpoint as repository loading, with `diffTarget` set to either `commit` or `staged`.

## Behavior

- The backend builds the normal graph first.
- When `diffTarget` is `commit`, the backend runs `git diff-tree --no-commit-id --name-status -r -M <commitHash>`.
- When `diffTarget` is `staged`, the backend runs `git diff --cached --name-status -M`.
- Matching graph nodes receive `changed: true`.
- Matching graph nodes receive `changeStatus` when the git status is recognized.
- Renamed and copied nodes receive `previousPath`.
- Changed nodes receive `githubDiffUrl` with a commit-page file-diff anchor when a GitHub remote is available.
- Staged changed nodes do not receive commit diff URLs because no commit page exists yet.
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
