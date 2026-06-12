# Shared Graph Types

Shared graph types define the wire model used by backend responses and frontend rendering.

## Responsibilities

- Define graph node and edge kinds.
- Define graph request and response payloads.
- Define GitHub metadata fields.
- Define optional commit change metadata fields.
- Define layer and kind labels.
- Define canonical layer indices.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [Graph Response](../contracts/Graph_Response.md)
- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Code

- shared/src/graph.ts
