# Expand Horizontal Layer Peers

The user opens a horizontal layer slice from the layered map and expands same-layer peers connected to a selected node. Newly discovered peers are synced back into the layered map with faint ancestor context.

## Steps

1. Click a layer label in the layered map.
2. Render the currently revealed nodes in that layer as a horizontal slice.
3. Select a visible node in the slice.
4. Show the shared selected-node action bar.
5. Expand peers from the selected node.
6. Add same-layer connected peers that are not already visible.
7. Return to the layered map with the discovered peers still revealed.
8. Add available higher-layer ancestors as faint context for those peers.

## Capabilities

- [Horizontal Plane Visualization](../capabilities/Horizontal_Plane_Visualization.md)
- [Layered Understanding Map](../capabilities/Layered_Understanding_Map.md)
- [Progressive Graph Exploration](../capabilities/Progressive_Graph_Exploration.md)

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
