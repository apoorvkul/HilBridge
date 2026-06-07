# Graph Visualization UI

This module renders visible graph data in either 3D or 2D. Pyramid and commit modes use `ForceGraph3D`; plane and slice modes use an inline SVG renderer.

## Responsibilities

- Build Three.js sphere-and-label objects for 3D nodes.
- Render SVG `line`, `circle`, and `text` elements for 2D graphs.
- Color nodes and edges by kind.
- Show changed and diagram indicators.
- Open GitHub URLs on node click.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Code

- frontend/src/App.tsx
- frontend/src/styles.css
- frontend/src/three-spritetext.d.ts
