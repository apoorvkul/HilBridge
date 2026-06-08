# Progressive Graph Exploration

Users should be able to explore the 3D pyramid incrementally instead of starting with the full dense graph. The initial 3D view should show only Vision and Capability nodes so the top-level product shape is immediately legible.

After selecting a node, the UI should expose a contextual action menu near the top of the graph area. That menu should only appear while a node is selected and should offer an action to expand the graph downward from the selected node.

Expansion reveals direct outgoing targets from the selected node while preserving the abstraction direction:

- Vision expands to capabilities.
- Capabilities expand to flows.
- Flows expand to modules.
- Modules expand to contracts.
- Contracts expand to code.
- Cross-cutting notes may appear when directly connected to an expanded node.

Expansion should keep unrelated lower-layer nodes hidden until their parent path is selected. This keeps the graph sparse at the top and progressively denser only where the user asks for detail.

## User Guarantees

- The first 3D graph view is readable without manual filtering.
- Selecting a node makes available actions explicit.
- Expansion follows the hierarchy from higher abstraction to lower implementation detail.
- Hidden nodes are not lost; they remain discoverable through expansion, search, plane views, slice views, or other explicit navigation.

## Non-Goals

- This capability does not define the final visual layout algorithm.
- This capability does not require changing 2D plane or vertical slice semantics.
- This capability does not define persistence of expansion state across sessions.

## Flows

- [Expand 3D Pyramid Node](../flows/Expand_3D_Pyramid_Node.md)

## Modules

- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)

## Related Capabilities

- [3D Pyramid Visualization](3D_Pyramid_Visualization.md)
- [Search and Filtering](Search_and_Filtering.md)
- [Vertical Slice Traceability](Vertical_Slice_Traceability.md)
