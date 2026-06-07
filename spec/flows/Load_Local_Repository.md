# Load Local Repository

The user enters a path, clicks Load, and the frontend posts the path to the backend graph endpoint. Empty paths are rejected in the UI and backend.

## Steps

1. Read repository path state from the input.
2. Trim the path and reject it if empty.
3. Send `POST /api/graph`.
4. Save the path in local storage after a successful response.
5. Store the returned graph in React state.

## Modules

- [Repository Input UI](../modules/Repository_Input_UI.md)
- [Frontend App Shell](../modules/Frontend_App_Shell.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)

## Contracts

- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
- [Graph Response](../contracts/Graph_Response.md)
