# Commit Diff Visualization

Users choose a commit filter from a dropdown of GitHub commit messages with commit date and time, or choose `Staged Local Changes` when the local checkout has staged changes. The backend marks changed markdown and source nodes, records change status metadata, creates missing placeholder nodes for changed files, and adds `changed_with` edges between changed nodes. The frontend filters the graph to changed nodes plus upstream nodes that connect those changes back toward Vision, then lets the current view render that filtered graph.

Commit diff visualization should feed change-aware system understanding. Changed nodes should be explainable through their hierarchy: the capability, flow, module, contract, or code context that helps a human understand what part of the system moved. The first priority is structural orientation without forcing a separate review mode.

Diff review follows the selected graph view. In the layered map, progressive graph exploration still starts from Vision and Capabilities when changed nodes have that ancestor context, then lower-layer changed nodes become visible when the user expands the relevant visible parent one layer at a time. Changed nodes with no Vision or Capability ancestor are seeded directly so orphaned or cross-cutting-only diffs remain inspectable. In the pyramid, plane, and slice views, the same commit-relevant graph filter applies before each view derives its visible nodes.

## User Guarantees

- Users can apply the commit filter without leaving the current view mode.
- Users can choose recent GitHub commits by message and timestamp instead of manually entering a hash.
- Users can inspect staged local changes before they are committed.
- Changed implementation nodes can be related back to higher-level design notes when links exist.
- Lower-layer changed and unchanged nodes are revealed incrementally instead of appearing all at once.
- Users can distinguish recognized added, modified, deleted, renamed, and copied files.
- Commit-filtered views support visual orientation before detailed textual review.

## Flows

- [Visualize Commit Changes](../flows/Visualize_Commit_Changes.md)

## Related Contracts

- [Commit Filter Options](../contracts/Commit_Filter_Options.md)
- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Related Capabilities

- [Change-Aware System Understanding](Change_Aware_System_Understanding.md)
- [Layered Understanding Map](Layered_Understanding_Map.md)
