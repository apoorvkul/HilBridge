# Graph Edge Contract

A graph edge connects two graph nodes by id.

## Fields

- `id`: stable string including edge kind and endpoints.
- `source`: source node id.
- `target`: target node id.
- `kind`: one of `markdown_link`, `source_reference`, `hierarchy`, `cross_cutting`, or `changed_with`.

`source_reference` edges connect documentation notes to code nodes. They can also carry direct module-to-code traceability when a module references code without an intervening contract node.

## Modules

- [Shared Graph Types](../modules/Shared_Graph_Types.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
