# Select Horizontal Plane

The user selects a horizontal layer from the control rail or by clicking a layer label in the layered map. The frontend filters to the currently revealed layered-map subset for that layer and renders those nodes in a 2D SVG peer graph.

## Steps

1. Select view mode `plane` or click a layer label in the layered map.
2. Select a layer index from `LAYER_LABELS`.
3. Build the current layered-map visible set from expanded and revealed nodes.
4. Filter that visible set to nodes whose `layerIndex` matches the selected layer.
5. Filter edges to endpoints present in that visible set.
6. Render `Graph2D`.
7. Allow same-layer peer expansion through [Expand Horizontal Layer Peers](Expand_Horizontal_Layer_Peers.md).

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
