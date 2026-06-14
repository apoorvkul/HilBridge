# Graph Node Contract

A graph node represents either a markdown note or a source-code file.

## Fields

- `id`: stable string identifier, prefixed with `note:` or `code:`.
- `label`: display label.
- `kind`: node kind from the shared union.
- `path`: repo-relative file path.
- `githubUrl`: optional GitHub blob URL.
- `githubDiffUrl`: optional commit URL, anchored to the changed file's diff when a GitHub file anchor can be generated.
- `layerIndex`: optional abstraction-layer index.
- `changed`: optional commit-diff marker.
- `changeStatus`: optional commit-diff status, one of `added`, `modified`, `deleted`, `renamed`, `copied`, or `unknown`.
- `previousPath`: optional previous repo-relative path for renamed or copied files.
- `hasDiagrams`: optional PlantUML marker.
- `degree`: optional edge count computed by the backend.

## Modules

- [Shared Graph Types](../modules/Shared_Graph_Types.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
