# Frontend App Shell

The React app shell owns UI state, repository loading, controls, metrics, notices, and handoff to the graph renderer.

## Responsibilities

- Keep repository path, commit filter options, selected commit filter, graph response, view mode, filters, loading state, and errors in React state.
- Load the graph from `/api/graph`.
- Load commit filter dropdown options from `/api/commit-options`.
- Restore and persist the last loaded repository path through local storage.
- Render control rail, stage header, warnings, metrics, and legend.

## Contracts

- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
- [Commit Filter Options](../contracts/Commit_Filter_Options.md)
- [Graph Response](../contracts/Graph_Response.md)
- [Graph Node](../contracts/Graph_Node.md)

## Code

- frontend/src/App.tsx
- frontend/src/main.tsx
- frontend/src/styles.css
- frontend/index.html
