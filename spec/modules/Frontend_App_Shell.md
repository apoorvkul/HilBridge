# Frontend App Shell

The React app shell owns UI state, repository loading, controls, metrics, notices, and handoff to the graph renderer.

## Responsibilities

- Keep repository path, commit hash, graph response, view mode, filters, loading state, and errors in React state.
- Load the graph from `/api/graph`.
- Restore and persist the last loaded repository path through local storage.
- Render control rail, stage header, warnings, metrics, and legend.

## Contracts

- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
- [Graph Response](../contracts/Graph_Response.md)
- [Graph Node](../contracts/Graph_Node.md)

## Code

- frontend/src/App.tsx
- frontend/src/main.tsx
- frontend/src/styles.css
- frontend/index.html
