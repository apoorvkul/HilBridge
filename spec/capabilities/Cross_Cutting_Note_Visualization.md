# Cross-Cutting Note Visualization

Architecture, domain, and technology notes are visually distinct node kinds. In the full 3D graph they can connect to any layer and are placed outside the main pyramid. In 2D plane and slice views they are currently hidden by design.

In the layered understanding map, cross-cutting notes should remain discoverable without overwhelming the hierarchy. They may appear beside the Vision area, beside a relevant layer, or in an adjacent contextual band. They should remain visually disconnected by default.

Cross-cutting edges should render only while a node is selected, and only for cross-cutting relationships directly connected to that selected node. Clearing the selection should clear those cross-cutting edges immediately.

## User Guarantees

- Users can discover cross-cutting context while exploring the hierarchy.
- Cross-cutting notes remain visually distinct from layered product and implementation nodes.
- Cross-cutting notes stay disconnected until selection makes one node's cross-cutting relationships relevant.
- Cross-cutting edges disappear when the selected node is cleared.

## Flows

- [Explore Layered Understanding Map](../flows/Explore_Layered_Understanding_Map.md)
- [Render 3D Pyramid Graph](../flows/Render_3D_Pyramid_Graph.md)
- [Filter Visible Graph](../flows/Filter_Visible_Graph.md)

## Related Modules

- [Graph Builder](../modules/Graph_Builder.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Related Capabilities

- [Layered Understanding Map](Layered_Understanding_Map.md)
- [Progressive Graph Exploration](Progressive_Graph_Exploration.md)
