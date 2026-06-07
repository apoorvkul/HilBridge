# Graph Response Contract

The graph endpoint returns graph JSON consumed directly by the frontend.

## Shape

- `nodes`: array of [Graph Node](Graph_Node.md).
- `edges`: array of [Graph Edge](Graph_Edge.md).
- `repo.path`: resolved repository path.
- `repo.specPath`: resolved `spec/` path.
- `repo.github`: [GitHub URL Resolution](GitHub_URL_Resolution.md) metadata.
- `warnings`: bounded list of extraction warnings.

## Modules

- [Backend Graph API](../modules/Backend_Graph_API.md)
- [Shared Graph Types](../modules/Shared_Graph_Types.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
