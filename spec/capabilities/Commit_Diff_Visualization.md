# Commit Diff Visualization

Users can enter a commit hash in commit mode. The backend marks changed markdown and source nodes, creates missing code nodes for changed source files, and adds `changed_with` edges between changed nodes. The frontend highlights changed nodes and shows directly connected context nodes.

## Flows

- [Visualize Commit Changes](../flows/Visualize_Commit_Changes.md)

## Related Contracts

- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)
