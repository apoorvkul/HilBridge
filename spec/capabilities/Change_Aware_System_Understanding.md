# Change-Aware System Understanding

Users can understand how a repository changes over time in the same visual hierarchy they use to understand the system. This is especially important when coding agents modify design notes, implementation files, or graph relationships faster than a human can reread the full repository.

The change view should prioritize structural understanding first: which nodes changed, which links changed, which higher-level ancestors are affected, and which parts of the system gained or lost detail. Users should be able to start from changed nodes and move upward to design intent or downward to implementation context.

Change-aware exploration should reuse the layered understanding model instead of becoming an isolated diff surface. A changed flow, module, contract, or code node should be understandable through its capability and Vision context. Changed cross-cutting notes should show the layers or nodes they affect.

## User Guarantees

- Users can see changed graph nodes in their hierarchical context.
- Users can identify affected ancestors and descendants without manually tracing every edge.
- Users can distinguish new, modified, removed, and related unchanged context when that information is available.
- Users can keep their system mental model current after agent-driven changes.

## Non-Goals

- This capability does not require explaining the full rationale for every change.
- This capability does not require automatically judging whether a change is correct.
- This capability does not replace textual diffs, commit summaries, or review tools.

## Flows

- [Visualize Commit Changes](../flows/Visualize_Commit_Changes.md)

## Modules

- [Commit Diff Analyzer](../modules/Commit_Diff_Analyzer.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Related Capabilities

- [Commit Diff Visualization](Commit_Diff_Visualization.md)
- [Layered Understanding Map](Layered_Understanding_Map.md)
- [Progressive Graph Exploration](Progressive_Graph_Exploration.md)
- [Vertical Slice Traceability](Vertical_Slice_Traceability.md)
