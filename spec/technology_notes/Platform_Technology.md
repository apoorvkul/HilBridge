# Platform Technology

The implementation uses TypeScript across frontend, backend, and shared contracts.

## Libraries

- React and React DOM for UI.
- Vite for frontend dev server and bundling.
- Express and CORS for the local API server.
- `gray-matter` for markdown frontmatter.
- `react-force-graph-3d`, Three.js, and `three-spritetext` for 3D graph rendering.
- Inline SVG for 2D graph rendering.
- Node `child_process`, `fs/promises`, and `path` for local repository work.

## Linked Modules

- [Frontend Platform](../modules/Frontend_Platform.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)
- [Shared Graph Types](../modules/Shared_Graph_Types.md)

## Code

- package.json
- frontend/vite.config.ts
- frontend/src/main.tsx
- frontend/src/App.tsx
- backend/src/server.ts
- shared/src/graph.ts
