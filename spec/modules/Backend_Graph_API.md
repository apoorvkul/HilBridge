# Backend Graph API

The backend exposes Express endpoints for health and graph extraction.

## Responsibilities

- Serve `GET /api/health`.
- Serve `POST /api/graph`.
- Validate that `repoPath` is present.
- Resolve the repository path.
- Return graph JSON or a `400` error payload.

## Contracts

- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
- [Commit Diff Request](../contracts/Commit_Diff_Request.md)
- [Graph Response](../contracts/Graph_Response.md)

## Code

- backend/src/server.ts
