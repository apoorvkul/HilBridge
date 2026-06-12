# Progressive Graph Exploration

Users should be able to explore the knowledge graph incrementally instead of starting with the full dense graph. The initial view should show the highest-level system shape so Vision and Capability nodes are immediately legible.

Selecting a node should expand the graph one layer downward from that node when direct next-layer targets exist. The UI should also expose contextual actions to expand or collapse the graph from the selected node. Selection should highlight the node's ancestry, directly visible descendants, and relevant peer or cross-cutting context.

Expansion reveals only the next abstraction layer from the selected node while preserving the abstraction direction:

- Vision expands to capabilities.
- Capabilities expand to flows.
- Flows expand to modules.
- Modules expand to contracts.
- Contracts expand to code.

Expansion should not skip layers. A capability expansion should reveal directly connected flows only; those flows must then be selected and expanded before modules appear. This keeps unrelated or deeper lower-layer nodes hidden until their parent path is selected.

Progressive exploration should work across the main hierarchy and layer-specific slice views. If a layer slice reveals additional connected nodes, those nodes should be reflected in the main exploration state with enough ancestor context to make their appearance understandable.

## User Guarantees

- The first graph view is readable without manual filtering.
- Selecting a node reveals its direct next-layer targets when available and makes actions explicit.
- Expansion follows the hierarchy one layer at a time from higher abstraction to lower implementation detail.
- Collapse lets users reduce local detail after exploring it.
- Selection can act as a spotlight without hiding all surrounding context.
- Hidden nodes are not lost; they remain discoverable through expansion, search, plane views, slice views, or other explicit navigation.

## Non-Goals

- This capability does not define the final visual layout algorithm.
- This capability does not require a specific 2D or 3D renderer.
- This capability does not define persistence of expansion state across sessions.

## Flows

- [Explore Layered Understanding Map](../flows/Explore_Layered_Understanding_Map.md)
- [Expand Horizontal Layer Peers](../flows/Expand_Horizontal_Layer_Peers.md)
- [Expand 3D Pyramid Node](../flows/Expand_3D_Pyramid_Node.md)

## Modules

- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)

## Related Capabilities

- [3D Pyramid Visualization](3D_Pyramid_Visualization.md)
- [Layered Understanding Map](Layered_Understanding_Map.md)
- [Horizontal Plane Visualization](Horizontal_Plane_Visualization.md)
- [Search and Filtering](Search_and_Filtering.md)
- [Vertical Slice Traceability](Vertical_Slice_Traceability.md)
