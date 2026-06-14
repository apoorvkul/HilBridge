# Layered Understanding Map

Users can inspect the repository graph as a 2D layered understanding map. Vision appears at the top, capabilities spread across the next horizontal layer, and lower layers continue downward through flows, modules, optional contracts, and code.

The map should privilege human comprehension over complete graph density. It should start with the highest-level system shape and let the user progressively expand selected nodes downward. Selecting a node reveals directly related meaningful downstream nodes while preserving visible ancestry so users can understand where each detail fits.

The visible hierarchy should stay visually centered around the current focus. With no selection, Vision is centered in the visible map. When a user selects and expands a node, the selected node, its ancestor path, and its visible descendant branch form a centered visual spine while peer context remains available around it. Nodes and edges should animate into their new positions so the rearrangement explains itself instead of feeling like a jump cut.

Layer labels are part of the exploration surface. Selecting a layer lets the user inspect the currently revealed nodes in that layer as a horizontal slice graph, including peer relationships that are hard to see in a strict tree. When that slice reveals connected nodes that were not already expanded in the main map, those nodes should sync back into the layered map with faint ancestor context so the new context does not feel disconnected.

Selection should act like a spotlight rather than a separate mode. The selected node, its ancestry, directly expanded descendants, sibling context, and directly connected cross-cutting links become visually prominent while less relevant context remains available but quieter.

Cross-cutting notes should remain discoverable beside the main hierarchy or in an adjacent contextual area. They should stay disconnected by default, with edges shown only for the currently selected node and cleared when selection is cleared.

## User Guarantees

- Users can build a mental model from high-level design before inspecting implementation detail.
- Expansion follows the abstraction direction from Vision toward Code one meaningful layer at a time.
- The map can show module-to-code traceability directly when a separate contract layer would not add useful boundary meaning.
- Selecting a node preserves orientation by showing ancestry and nearby context.
- The focused branch remains centered enough that users do not need to manually pan after every expansion.
- Layout changes animate smoothly, while respecting reduced-motion preferences.
- Layer slice exploration can reveal additional connected peers without losing the main hierarchy.
- Newly discovered slice nodes are reflected in the layered map with enough ancestor context to explain why they appeared.

## Non-Goals

- This capability does not require replacing every existing view mode.
- This capability does not define a specific drawing algorithm, spacing rule, animation duration, easing curve, or persistence model.
- This capability does not require showing the entire graph at once.

## Flows

- [Explore Layered Understanding Map](../flows/Explore_Layered_Understanding_Map.md)
- [Expand Horizontal Layer Peers](../flows/Expand_Horizontal_Layer_Peers.md)

## Modules

- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Related Capabilities

- [Progressive Graph Exploration](Progressive_Graph_Exploration.md)
- [Horizontal Plane Visualization](Horizontal_Plane_Visualization.md)
- [Vertical Slice Traceability](Vertical_Slice_Traceability.md)
- [Cross-Cutting Note Visualization](Cross_Cutting_Note_Visualization.md)
- [Change-Aware System Understanding](Change_Aware_System_Understanding.md)
