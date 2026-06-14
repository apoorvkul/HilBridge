# Toggle 3D Pyramid Node Expansion

The user clicks a node in the 3D Pyramid view to expand or collapse direct outgoing targets from that node. The flow keeps the graph readable by revealing only connected meaningful downstream nodes.

## Steps

1. Load a graph and enter 3D Pyramid mode.
2. Render the initial Pyramid with Vision and Capability nodes only.
3. Click a visible Pyramid node.
4. Show the selected-node action bar.
5. Expand the selected node when it is collapsed, or collapse it when it is already expanded.
6. Add direct outgoing targets whose layer is exactly one step below the selected node when expanding.
7. Keep unrelated or deeper lower-layer nodes hidden.
8. Allow repeated expansion from newly visible nodes.

## Capabilities

- [Progressive Graph Exploration](../capabilities/Progressive_Graph_Exploration.md)
- [3D Pyramid Visualization](../capabilities/3D_Pyramid_Visualization.md)

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
