# Filter Visible Graph

The frontend derives a visible graph from the full backend graph using view mode, shared expansion state, revealed-node state, layer selection, slice root, search text, changed-only state, and cross-cutting visibility.

When a commit filter is active, each view mode first derives its normal visible set from the backend graph instead of entering a separate diff view mode. The frontend then keeps visible touched nodes plus visible upstream ancestors that connect those touched nodes back toward Vision. Layered map mode starts from Vision and touched top-level nodes, so unrelated unchanged capabilities are not shown by default. Lower-layer touched nodes and their unchanged ancestors appear only when the relevant downstream path is already visible or expanded. Changed lower-layer nodes, including placeholder nodes without reconstructed ancestry, do not seed themselves into the initial layered map. Plane mode derives from the currently visible layered-map subset for the selected layer.

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
