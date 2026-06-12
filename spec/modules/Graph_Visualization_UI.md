# Graph Visualization UI

This module renders visible graph data in either 3D or 2D. Pyramid mode uses `ForceGraph3D`; layered map, plane, slice, and commit modes use an inline SVG renderer.

## Responsibilities

- Build Three.js sphere-and-label objects for 3D nodes.
- Select graph nodes without immediately opening GitHub.
- Show a selected-node action bar with expand, collapse, expand peers, open, clear, and reset actions.
- Render layered map rows and clickable layer labels.
- Keep the fixed layer-label rail outside horizontal graph scrolling.
- Center the layered map viewport on Vision by default and on the selected focus branch after expansion.
- Animate SVG node and edge coordinate changes when the layered map rearranges, unless the browser requests reduced motion.
- Render SVG `line`, `circle`, and `text` elements for 2D graphs.
- Color nodes and edges by kind.
- Show changed and diagram indicators.
- Show change-status badges when commit metadata is available.
- Render faint ancestor context and selected-node spotlight emphasis.
- Render cross-cutting edges only for the selected node.
- Open GitHub URLs from the selected-node action bar.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Code

- frontend/src/App.tsx
- frontend/src/styles.css
- frontend/src/three-spritetext.d.ts
