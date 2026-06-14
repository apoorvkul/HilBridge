# Changes Summary

## Overview

This staged batch combines the earlier commit-filter dropdown/staged-diff work with the optional contract traceability implementation. The optional contract change is aligned with the approved plan: module expansion now treats direct module-to-code `source_reference` edges as meaningful downstream links, while keeping contract nodes first-class.

The reviewed P1 bug has been fixed in the follow-up iteration.

## Findings

- Fixed [P1] Commit-filtered Layered Map can render empty for changed nodes without Vision/Capability ancestors.
  `layeredMapVisibility` now seeds changed nodes directly when they have no Vision or Capability ancestor in the filtered graph. Normally connected lower-layer changed nodes still rely on progressive expansion from their visible ancestors.

## Plan Alignment

- Optional contract traceability matches the approved plan.
- `KIND_LAYER` and shared graph wire types remain unchanged for the optional contract work.
- No synthetic contract nodes were added.
- Module expansion and layered centering now share one downstream predicate for adjacent layers plus module-to-code `source_reference`.
- Docs were updated across README, capabilities, flows, modules, contracts, and `spec/doc_issues.md`.
- The staged batch still contains the earlier commit-filter feature beyond the optional-contract plan; that scope was already staged before this implementation and is reviewed here because it is part of `git diff --cached`.

## Files Modified

### Frontend

- `frontend/src/App.tsx`
  Adds commit-filter dropdown state, graph filtering for changed nodes plus ancestors, staged/commit filter labels, and optional module-to-code expansion through `isMeaningfulDownstreamEdge`.

- `frontend/src/styles.css`
  Adds `.field-note` styling for commit-option warnings.

### Backend

- `backend/src/server.ts`
  Adds `/api/commit-options`, GitHub commit option loading, staged diff detection, `diffTarget` handling, changed-file placeholder handling, and GitHub commit file-diff URL anchors.

### Shared Contracts

- `shared/src/graph.ts`
  Adds `DiffTarget`, commit filter option request/response types, and extends graph requests with optional `diffTarget`.

### Docs And Specs

- `README.md`
  Documents optional contracts, module-to-code traceability, commit filter dropdowns, staged local changes, and commit-filter limitations.

- `spec/Vision.md`, `spec/capabilities/Layered_Understanding_Map.md`, `spec/capabilities/Progressive_Graph_Exploration.md`, `spec/capabilities/Vertical_Slice_Traceability.md`, `spec/domain_notes/Knowledge_Graph_Domain_Model.md`
  Capture optional contracts and direct module-to-code traceability.

- `spec/flows/Explore_Layered_Understanding_Map.md`, `spec/flows/Trace_Vertical_Feature_Slice.md`, `spec/flows/Expand_3D_Pyramid_Node.md`, `spec/modules/View_Mode_Controller.md`, `spec/contracts/Graph_Edge.md`
  Align workflows, controller responsibilities, and edge semantics with meaningful downstream traversal.

- Commit-filter specs under `spec/capabilities`, `spec/contracts`, `spec/flows`, and `spec/modules`
  Document GitHub commit options, staged local changes, graph filtering, and changed-node metadata.

## Validation

- `npm run typecheck` passed.
- `npm run build` passed; Vite reported the existing large chunk-size warning.
- Local Markdown link check passed for 48 spec files.
- `git diff --cached --check` passed.

## Reviewer Focus

- There are still no dedicated automated tests for commit-filter visibility, staged diff behavior, or optional module-to-code expansion.
- Commit/staged graph extraction still reads the working tree, not an exact historical/index snapshot, so staged files with additional unstaged edits may render content from the working tree.
