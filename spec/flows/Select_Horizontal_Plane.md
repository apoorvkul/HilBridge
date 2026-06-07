# Select Horizontal Plane

The user selects Horizontal Plane and a layer. The frontend filters to nodes whose `layerIndex` matches that layer and renders them in a 2D SVG radial layout.

## Steps

1. Select view mode `plane`.
2. Select a layer index from `LAYER_LABELS`.
3. Filter nodes to the selected layer.
4. Filter edges to endpoints present in that visible set.
5. Render `Graph2D`.

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
