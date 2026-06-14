# Graph Visualization UI

This module renders visible graph data in either 3D or 2D. Pyramid mode uses `ForceGraph3D`; layered map, plane, and slice modes use an inline SVG renderer.

## Responsibilities

- Build Three.js sphere-and-label objects for 3D nodes.
- Select graph nodes without immediately opening GitHub.
- Toggle node expansion or collapse from single-click/tap node interaction in progressive graph views.
- Show a selected-node action bar with expand peers, open, clear, and reset actions.
- Render layered map rows and clickable layer labels.
- Keep the fixed layer-label rail outside horizontal graph scrolling.
- Center the layered map viewport on Vision by default and on the selected focus branch after expansion.
- Animate SVG node and edge coordinate changes when the layered map rearranges, unless the browser requests reduced motion.
- Render SVG `line`, `circle`, and `text` elements for 2D graphs.
- Color nodes by kind while using a separate subdued edge palette for normal, changed, selected-neighborhood, and dimmed relationship states.
- Show changed and diagram indicators.
- Show change-status badges when commit metadata is available.
- Render faint ancestor context and selected-node spotlight emphasis, dimming relationships outside the active selected or hovered neighborhood.
- Render cross-cutting edges only for the selected node.
- Open GitHub URLs from the selected-node action bar or a node double-click.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)

## Code

- frontend/src/App.tsx
- frontend/src/styles.css
- frontend/src/three-spritetext.d.ts
