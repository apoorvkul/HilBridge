# Vertical Slice Traceability

Users can select a note and trace outgoing graph relationships downward through later layers and code nodes. The current UI renders the slice as a 2D SVG graph rather than a rotatable 3D scene.

Vertical traceability should support selective digging into complex parts of the system. Selecting a capability, flow, module, contract, or code node should reveal how that node fits into the abstraction chain above and below it. A focused path may pass through a contract when that boundary is meaningful, or move directly from a module to code when the module has no explicit contract. A focused path is not a separate replacement for progressive exploration; it is a spotlight state within the broader hierarchy.

The selected path and directly relevant neighbors should be visually prominent, while sibling context remains available for orientation. This lets users understand one feature or implementation area without pretending that reused modules, shared contracts, or cross-cutting notes do not exist.

## User Guarantees

- Users can trace a selected node through higher-level intent and lower-level implementation context.
- Traceability paths do not require synthetic contract nodes between modules and code.
- Focused selection emphasizes relevance without destroying surrounding orientation.
- Shared or reused graph context remains discoverable from the selected path.

## Flows

- [Trace Vertical Feature Slice](../flows/Trace_Vertical_Feature_Slice.md)

## Related Modules

- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)

## Related Capabilities

- [Layered Understanding Map](Layered_Understanding_Map.md)
- [Progressive Graph Exploration](Progressive_Graph_Exploration.md)
