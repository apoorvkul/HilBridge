# Knowledge Graph Domain Model

The domain model is a layered repository knowledge graph.

## Concepts

- Vision: top-level product intent.
- Capability: user-facing value.
- Flow: user or system journey.
- Module: implementation responsibility boundary.
- Contract: data, API, state, integration, or compatibility boundary with independent traceability value.
- Code: source file referenced by documentation.
- Direct code traceability: a module-to-code relationship used when no meaningful contract boundary exists between the implementation responsibility and the referenced source.
- Cross-cutting note: architecture, domain, or technology note connected to any layer.
- Changed node: graph node corresponding to a file changed by a commit.
- Layered understanding map: a hierarchical visual model that starts from Vision and progressively reveals lower abstraction layers.
- Horizontal slice: a same-layer view of currently relevant nodes and their peer relationships.
- Spotlight context: the emphasized ancestry, descendants, peers, and cross-cutting notes around a selected node.
- Cognition debt: the gap between how quickly a system changes and how well a human understands its current design and implementation.

## Linked Capabilities

- [Spec Graph Extraction](../capabilities/Spec_Graph_Extraction.md)
- [Cross-Cutting Note Visualization](../capabilities/Cross_Cutting_Note_Visualization.md)
- [Commit Diff Visualization](../capabilities/Commit_Diff_Visualization.md)
- [Layered Understanding Map](../capabilities/Layered_Understanding_Map.md)
- [Change-Aware System Understanding](../capabilities/Change_Aware_System_Understanding.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
