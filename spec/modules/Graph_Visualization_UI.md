# Graph Visualization UI

This module renders visible graph data in either 3D or 2D. Pyramid and commit modes use `ForceGraph3D`; plane and slice modes use an inline SVG renderer.

## Responsibilities

- Build Three.js sphere-and-label objects for 3D nodes.
- Select Pyramid nodes without immediately opening GitHub.
- Show a selected-node action bar with expand, open, clear, and reset actions.
- Render SVG `line`, `circle`, and `text` elements for 2D graphs.
- Color nodes and edges by kind.
- Show changed and diagram indicators.
- Open GitHub URLs from node clicks in non-Pyramid views and from the Pyramid action bar.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Code

- frontend/src/App.tsx
- frontend/src/styles.css
- frontend/src/three-spritetext.d.ts
