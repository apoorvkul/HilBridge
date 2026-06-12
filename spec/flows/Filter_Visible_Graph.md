# Filter Visible Graph

The frontend derives a visible graph from the full backend graph using view mode, shared expansion state, revealed-node state, layer selection, slice root, search text, changed-only state, and cross-cutting visibility.

Layered map mode starts from Vision, Capabilities, and directly connected cross-cutting context. Plane mode derives from the currently visible layered-map subset for the selected layer. Commit mode derives changed nodes plus available structural context.

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
