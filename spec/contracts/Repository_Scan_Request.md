# Repository Scan Request Contract

The frontend sends a repository scan request to `POST /api/graph`.

## Fields

- `repoPath`: required local repository path. The frontend and backend both trim it.
- `diffTarget`: optional diff target, either `commit` or `staged`.
- `commitHash`: optional commit hash, supplied when `diffTarget` is `commit`.

## Modules

- [Repository Input UI](../modules/Repository_Input_UI.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)
- [Shared Graph Types](../modules/Shared_Graph_Types.md)

## Code

- shared/src/graph.ts
- frontend/src/App.tsx
- backend/src/server.ts
