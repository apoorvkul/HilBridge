# View Mode Controller

The view controller logic derives visible nodes, visible edges, and fixed coordinates from the full graph and UI controls.

## Responsibilities

- Select all nodes for pyramid mode.
- Select only one `layerIndex` for plane mode.
- Traverse outgoing edges to later layers and code for slice mode.
- Select changed nodes and direct neighbors for commit mode.
- Apply search and changed-only filters.
- Compute radial, pyramid, and vertical positions.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- frontend/src/App.tsx
