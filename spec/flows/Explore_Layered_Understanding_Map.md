# Explore Layered Understanding Map

The user loads a repository and lands on a 2D layered map. The map starts with Vision, Capabilities, and directly connected cross-cutting context, then reveals lower layers only when the user expands selected nodes.

## Steps

1. Load a repository graph.
2. Render Vision and Capability nodes in fixed horizontal layers with Vision centered in the visible map.
3. Render directly connected cross-cutting notes in the contextual side area when enabled.
4. Select a visible node.
5. Reveal direct next-layer targets only when the selected node has them.
6. Animate nodes and edges into a layout centered around the selected node's ancestor path and visible descendant branch.
7. Show the shared selected-node action bar.
8. Select a newly visible next-layer node before revealing the layer below it.
9. Collapse the selected node to reduce local detail.
10. Keep revealed slice discoveries visible with faint ancestor context.
11. Apply spotlight emphasis around the selected node, ancestors, descendants, peers, and directly connected cross-cutting context.
12. Render cross-cutting edges only when they connect to the selected node.
13. Clear cross-cutting edges as soon as the node selection is cleared.

## Capabilities

- [Layered Understanding Map](../capabilities/Layered_Understanding_Map.md)
- [Progressive Graph Exploration](../capabilities/Progressive_Graph_Exploration.md)

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
