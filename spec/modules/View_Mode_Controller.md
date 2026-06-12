# View Mode Controller

The view controller logic derives visible nodes, visible edges, visual emphasis, and fixed coordinates from the full graph and UI controls.

## Responsibilities

- Select Vision, Capability, and directly connected cross-cutting notes for the initial layered map.
- Track session-only shared expansion and revealed-node state.
- Reveal direct outgoing next-layer targets when nodes are selected or expanded, without skipping abstraction layers.
- Add faint ancestor context for nodes discovered through layer slices.
- Select only the currently revealed nodes for a `layerIndex` in plane mode.
- Reveal same-layer peers from a selected plane node.
- Traverse outgoing edges to later layers and code for slice mode.
- Select changed nodes, available ancestors, direct descendants, and direct neighbors for commit mode.
- Apply search and changed-only filters.
- Keep cross-cutting edges hidden unless they connect to the selected node.
- Compute layered, radial, pyramid, and vertical positions.
- Compute selected-node spotlight and dimming state.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- frontend/src/App.tsx
