---
name: fullstack-dev-implement
description: >-
  Implementation workflow for an approved software plan: implements the plan,
  updates affected spec/ documents, validates using project commands from
  AGENTS.md, and stages changes. Use after explicit approval, then hand off to
  fullstack-dev-review.
---

# Full-Stack Dev — Implement

Act as an expert developer implementing an **explicitly approved** plan.

## Workflow Fit

Use this skill in the implementation step after explicit approval.

This is the execution step in the plan -> implement -> review loop. Stop after
code, required spec updates, validations, and staging are complete.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use `AGENTS.md` for project-specific stack, architecture, commands,
  formatting, testing, generation, and deployment constraints.
- When `AGENTS.md` is incomplete, follow existing source patterns and local
  scripts.

## Preconditions

- The approved plan is available in the current session, or a saved/exported
  workspace copy is available.
- Treat the approved plan as the single source of truth.
- Use referenced `spec/` documents as context and update affected specs where
  the plan requires it.

## Must

- Read the approved plan first.
- Implement only what is described.
- If no approved plan is available, **STOP** and ask the user to reopen or
  export it before implementing.
- If the plan is missing, ambiguous, or contradicted by code facts in a way the
  plan does not account for, **STOP** and route back to `fullstack-dev-plan`.
- Stage changes only at the end: `git add .`.

## Implementation Rules

- Preserve existing architecture and ownership boundaries unless the approved
  plan changes them.
- Use existing frameworks, helpers, style, and naming.
- Keep public APIs, data models, and wire contracts symmetric across producer
  and consumer sides.
- Add dependencies only when the plan explicitly justifies them.
- Keep changes cohesive and avoid opportunistic cleanup.
- Use generated-code and formatting workflows only when the project requires
  them.
- Do not modify unrelated files.

## Documentation (`spec/`)

Use the hierarchy:

```text
Vision -> Capabilities -> Flows -> Modules -> State/Data/API Contracts -> Code
```

Do not create architecture decision records unless the user asks. Use
consolidated notes in `spec/architecture_notes/`, `spec/domain_notes/`, and
`spec/technology_notes/` when rationale changes.

### Scope

- Update capabilities when user-facing behavior, guarantees, rules, non-goals,
  or product intent changed.
- Update flows when journeys or system workflows changed.
- Update modules when responsibility boundaries, data ownership, dependencies,
  or interactions changed.
- Update contracts when persisted state, data shape, API/wire shape, lifecycle,
  consistency, or invariants changed.
- Update consolidated notes when rationale, assumptions, tradeoffs, or
  technology constraints changed.
- Update `spec/doc_issues.md` for unresolved conflicts, ambiguity, drift,
  missing traceability, or coverage gaps.

### Traceability

- Changed capabilities link to relevant flows, modules, contracts, and notes.
- Changed flows link to relevant capabilities, modules, and contracts.
- Changed modules link to relevant capabilities, flows, and contracts.
- Changed contracts link to relevant capabilities, modules, and flows.
- Changed modules/contracts list source paths under `## Code` when they own
  implementation traceability.
- Code references are plain repo-relative paths; do not create Markdown files
  for code.

### Validation

- Run the docs validation command from `AGENTS.md` when `spec/` changes.
- If no docs validation command is documented, find the nearest local validator
  before inventing one.
- Check Markdown links, source paths, and diagram block balance when tooling is
  unavailable.

## Execution Order

1. Read the approved plan from the current handoff or saved/exported copy.
2. Read `AGENTS.md` and relevant `spec/` docs.
3. Read source paths listed by modules/contracts and any discovered related code.
4. Implement changes in the order described by the plan.
5. Update shared contracts, generated artifacts, or dependent call sites as
   required by the plan.
6. Run project-required code generation or formatting commands.
7. Update required `spec/` capabilities, flows, modules, contracts, and notes.
8. Update `spec/doc_issues.md` when ambiguity, drift, or missing traceability
   remains.
9. Run docs validation if `spec/` changed.
10. Run code validations and targeted tests from the plan.
11. `git add .`.
12. Stop and hand off to `fullstack-dev-review`.

## Output

Confirm that implementation matches the plan, spec graph updates are complete,
module/contract `## Code` listings are synced, required validations pass or are
explicitly reported, changes are staged, and the work is ready for
`fullstack-dev-review`.
