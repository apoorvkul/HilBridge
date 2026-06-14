# Commit Diff Visualization

Users choose a commit filter from a dropdown of GitHub commit messages with commit date and time, or choose `Staged Local Changes` when the local checkout has staged changes. The backend marks changed markdown and source nodes, records change status metadata, creates missing placeholder nodes for changed files, and adds `changed_with` edges between changed nodes. The frontend applies the commit filter to the current view's visible graph so touched nodes remain visible when the view reaches them, and upstream context is added only when needed to connect already visible touched nodes back toward Vision.

Commit diff visualization should feed change-aware system understanding. Changed nodes should be explainable through their hierarchy: the capability, flow, module, contract, or code context that helps a human understand what part of the system moved. The first priority is structural orientation without forcing a separate review mode.

Diff review follows the selected graph view. Each view first derives its normal visible subset, then the commit filter keeps visible touched nodes and the visible upstream nodes needed to connect those touched nodes toward Vision. In the layered map, the initial view still follows progressive exploration by showing Vision and touched top-level nodes; lower-layer changed nodes and their unchanged ancestors appear as the user expands the relevant path. Changed lower-layer nodes do not self-seed the initial layered map, even when they lack reconstructed Vision or Capability ancestry.

## User Guarantees

- Users can apply the commit filter without leaving the current view mode.
- Users can choose recent GitHub commits by message and timestamp instead of manually entering a hash.
- Users can inspect staged local changes before they are committed.
- Changed implementation nodes can be related back to higher-level design notes when links exist.
- Touched top-level nodes are visible immediately, while lower-layer changed nodes and related upstream context are revealed incrementally instead of appearing all at once.
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
