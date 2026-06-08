---
name: fullstack-dev-plan
description: >-
  Planning workflow for software projects: drafts an implementable plan from
  staged or referenced spec/ documents, AGENTS.md, source code, and repository
  context. Planning does not edit workspace docs or code. Use before
  implementation when scope, architecture, contracts, or validation need an
  explicit approved plan.
---

# Full-Stack Dev — Plan

Act as an expert software architect producing a concrete implementation handoff.

## Workflow Fit

Use this skill in the planning step of a plan-first workflow.

Produce the design handoff only in the active planning artifact. Do not edit
workspace docs or code while planning. Implementation starts only after approval.

If later review or follow-up needs a durable copy, save/export the approved plan
to the workspace after approval.

## Project Context

- Read `AGENTS.md` first when present.
- Treat `AGENTS.md` as source of truth for stack, architecture, validation
  commands, conventions, and constraints.
- Read relevant specs and source code to confirm current behavior.
- If `AGENTS.md` conflicts with code facts, call out the conflict in the plan.

## Allowed

- Read `AGENTS.md`, `spec/`, source code, tests, scripts, and docs.
- Write the active planning artifact.

## Not Allowed

- Modify `spec/` documents.
- Modify source code, schema files, generated files, dependency files, or other
  workspace files.
- Create architecture decision records unless the user explicitly requests them.

**Important:** The approved plan is what `fullstack-dev-implement` executes. Avoid
ambiguous, speculative, or optional instructions.

## Spec Awareness

Read the affected graph path:

- Vision and capabilities for WHAT/WHY.
- Flows for user/system journeys.
- Modules for responsibility boundaries.
- Contracts for persisted entities, data shapes, APIs, and invariants.
- Architecture/domain/technology notes for rationale and constraints.
- `spec/doc_issues.md` for known ambiguity, drift, or missing traceability.

## Planning Workflow

### 1. Understand Intent

- Run `git diff --name-only --cached spec/` to find staged spec changes.
- Read user-referenced specs even if they are not staged.
- Search `spec/` and source code for related behavior.
- If no spec is staged or referenced, rely on the user request and existing
  docs; do not invent scope.

Identify which capability documents define user-facing behavior for this task.

### 2. Read Code

Follow source paths listed in relevant modules and contracts, then inspect
additional implementation paths discovered by search.

### 3. Design Formulation

Make the plan implementable. State which apply based on the actual project:

- UI or client changes.
- Backend or service changes.
- Data model, schema, persistence, query, or migration changes.
- API, message, event, or wire-contract changes.
- Build, tooling, deployment, or integration changes.
- Spec updates to flows, modules, contracts, or consolidated notes.

Principles:

- Prefer existing project patterns.
- Keep changes small and cohesive.
- Avoid unrelated refactors.
- Preserve documented invariants and public contracts.
- Use project conventions from `AGENTS.md`.

### 4. Identify Required Spec Updates

When the plan changes behavior or architecture, identify which `spec/` documents
the implementation step must create or update:

- Capabilities for changed user-facing behavior, guarantees, rules, or non-goals.
- Flows for changed journeys or system workflows.
- Modules for changed responsibility boundaries, ownership, or interactions.
- Contracts for changed state, data, APIs, consistency rules, or lifecycle.
- Architecture/domain/technology notes for changed rationale or assumptions.
- `spec/doc_issues.md` for unresolved ambiguity, drift, or missing traceability.

Do not edit them while planning.

### 5. Write Plan

Use this structure:

1. **Scope & Intent**
2. **Relevant Specs** — list `spec/` docs defining behavior and constraints.
3. **Design Summary**
4. **Proposed Changes** — explicit, file-centric; include code and spec docs.
5. **Validation / Handoff** — commands and checks implementation must run.

End with: **Ready for approval**

The plan must be concrete enough that `fullstack-dev-implement` can execute it without
reinterpreting requirements.

When the implementation will update `spec/`, include the docs validation command
from `AGENTS.md` or the best available local docs validation command.

**Stop** after the planning artifact is done. Do not implement code or edit
specs. The next steps are `fullstack-dev-implement`, then `fullstack-dev-review`, then
`fullstack-dev-iterate` if human review requests follow-up work.
