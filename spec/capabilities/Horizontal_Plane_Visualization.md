# Horizontal Plane Visualization

Users can select one graph layer and inspect the currently relevant nodes in that layer as a horizontal slice. The current implementation hides all other nodes and only renders edges whose endpoints are both visible.

The desired interaction should support the layered understanding map. A user can click a layer label, such as Flows or Modules, to replace the hierarchy with a peer graph for the nodes already revealed in that layer. This helps users understand same-layer relationships, reuse, coupling, or missing links without leaving the progressive exploration model.

Within the horizontal slice, selecting or expanding a node can reveal directly connected same-layer nodes that were not already visible. Newly discovered nodes should sync back to the layered map with faint ancestry or nearby context so users understand how the slice discovery relates to the overall hierarchy.

## User Guarantees

- Users can focus on one abstraction layer without losing the meaning of the currently expanded subset.
- Same-layer relationships can be inspected separately from parent-child hierarchy.
- Slice expansion can discover additional related peers.
- Discoveries made in the slice remain understandable when returning to the layered map.

## Non-Goals

- This capability does not require showing every node in the selected layer by default.
- This capability does not define the final peer graph layout.

## Flows

- [Select Horizontal Plane](../flows/Select_Horizontal_Plane.md)
- [Expand Horizontal Layer Peers](../flows/Expand_Horizontal_Layer_Peers.md)

## Related Modules

- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)

## Related Capabilities

- [Layered Understanding Map](Layered_Understanding_Map.md)
- [Progressive Graph Exploration](Progressive_Graph_Exploration.md)
