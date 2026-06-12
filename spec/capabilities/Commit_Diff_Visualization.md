# Commit Diff Visualization

Users can enter a commit hash in commit mode. The backend marks changed markdown and source nodes, records change status metadata, creates missing placeholder nodes for changed files, and adds `changed_with` edges between changed nodes. The frontend highlights changed nodes in a change-aware layered map with directly connected context.

Commit diff visualization should feed change-aware system understanding. Changed nodes should be explainable through their hierarchy: the capability, flow, module, contract, or code context that helps a human understand what part of the system moved. The first priority is structural orientation: what changed, what nearby context changed with it, and which higher-level areas are affected.

## User Guarantees

- Users can inspect changed nodes together with directly relevant context.
- Changed implementation nodes can be related back to higher-level design notes when links exist.
- Users can distinguish recognized added, modified, deleted, renamed, and copied files.
- Commit mode supports visual orientation before detailed textual review.

## Flows

- [Visualize Commit Changes](../flows/Visualize_Commit_Changes.md)

## Related Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Related Capabilities

- [Change-Aware System Understanding](Change_Aware_System_Understanding.md)
- [Layered Understanding Map](Layered_Understanding_Map.md)
