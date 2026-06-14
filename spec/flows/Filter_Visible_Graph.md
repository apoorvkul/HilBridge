# Filter Visible Graph

The frontend derives a visible graph from the full backend graph using view mode, shared expansion state, revealed-node state, layer selection, slice root, search text, changed-only state, and cross-cutting visibility.

When a commit filter is active, the frontend first filters the backend graph to changed nodes plus available upstream ancestors that connect those changes back toward Vision. Layered map mode then starts from Vision, Capabilities, and directly connected cross-cutting context within that filtered graph. If a changed node has no Vision or Capability ancestor in the filtered graph, the layered map seeds that changed node directly so the commit-filtered view is never empty only because the changed path is orphaned. Plane mode derives from the currently visible layered-map subset for the selected layer.

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
