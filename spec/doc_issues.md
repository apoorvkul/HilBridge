# Documentation Issues

This note records implementation gaps, naming drift, and documentation caveats discovered while generating the self-hosting spec.

## Implementation Gaps

- Commit diff node clicks open the commit URL, not a file-specific diff anchor.
- Commit mode shows changed nodes and direct neighbors in the frontend, but the backend also creates complete pairwise `changed_with` edges between changed nodes; this can become dense for large commits.
- Deleted commit placeholder nodes do not reconstruct historical hierarchy or ancestry from the deleted file contents.
- Source-reference detection is regex-based and may miss unusual paths or include false positives from prose.
- Code nodes are created for referenced paths without verifying file existence; `ensureCodeNode` calls `statOrNull` but does not use the result.
- Hierarchy edges are heuristic: single-parent layers connect to every child, and multi-parent layers use title mentions in child text.
- Plane and slice views intentionally hide cross-cutting notes after the latest UI change, while the original UI toggle still exists globally.
- PlantUML is detected and displayed as metadata only; diagrams are not rendered.
- Progressive 3D Pyramid expansion is implemented in the frontend only. Expansion state is session-only and is not persisted across graph reloads.

## Ownership and Naming Caveats

- Most backend responsibilities live in one file, `backend/src/server.ts`.
- Most frontend responsibilities live in one file, `frontend/src/App.tsx`.
- The UI calls the contracts layer `Contracts`, while this spec describes the layer as State, Data & Graph Contracts.
- `Commit Diff Visualization` is implemented as commit-level navigation rather than file-anchor navigation.

## Documentation Gaps

- There are no dedicated tests to verify graph extraction, link resolution, or renderer filtering.
- There are no screenshots checked into the repository.
- The README does not describe the new self-hosting `spec/` directory yet.
- Self-hosting verification on `/Users/apoorvkul/Projects/xfer` succeeded after these docs were added: the API returned 61 nodes, 239 edges, 65 source-reference edges, 20 code nodes, no orphan documents, and Vision reached code nodes.
- A later self-hosting verification after connecting the GitHub remote and adding username-qualified HTTPS remote parsing returned no warnings.

## Resolved Product Questions

- The layered understanding map is the default graph view; the 3D pyramid remains available as an alternate overview.
- Horizontal slice discoveries sync back into the layered map with available higher-layer ancestors rendered as faint context.
- The first change-aware version focuses on structural context, not rationale or correctness judgment.

## Linked Notes

- [System Architecture](architecture_notes/System_Architecture.md)
- [Commit Diff Visualization](capabilities/Commit_Diff_Visualization.md)
- [Progressive Graph Exploration](capabilities/Progressive_Graph_Exploration.md)
- [Layered Understanding Map](capabilities/Layered_Understanding_Map.md)
- [Horizontal Plane Visualization](capabilities/Horizontal_Plane_Visualization.md)
- [Vertical Slice Traceability](capabilities/Vertical_Slice_Traceability.md)
- [Change-Aware System Understanding](capabilities/Change_Aware_System_Understanding.md)
