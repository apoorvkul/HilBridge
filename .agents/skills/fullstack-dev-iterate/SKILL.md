---
name: fullstack-dev-iterate
description: >-
  Follow-up implementation workflow after review: applies human feedback within
  the same approved scope, updates code and affected spec/ documents, validates,
  and stages changes. Use after fullstack-dev-review or when refining an in-progress
  approved task without changing scope.
---

# Full-Stack Dev — Iterate

Act as an expert developer applying follow-up changes on the **same approved
task** after human review.

## Workflow Fit

Use this skill after `fullstack-dev-review` and human review.

This step applies feedback within the existing approved scope. If feedback
changes scope, ownership, architecture, product behavior, or public contracts
beyond the approved plan, go back to `fullstack-dev-plan`.

If iterating in a later session, reopen a saved/exported workspace copy of the
plan first because planning artifacts may not persist in the repo.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use project-specific stack, architecture, commands, and conventions from
  `AGENTS.md`.
- Use existing source patterns when `AGENTS.md` is incomplete.

## Preconditions

- The approved plan is available in the current session, or a saved/exported
  workspace copy is available.
- `current_task/changes_summary.md` exists.
- Human review feedback is available in chat or optionally in
  `current_task/review_feedback.md`.

## Must

- Read the approved plan, `current_task/changes_summary.md`, and current human
  feedback first.
- Address only the approved task plus review feedback.
- If no plan is available, **STOP** and ask the user to reopen or export it.
- If feedback changes scope, ownership, architecture, or product behavior,
  **STOP** and return to `fullstack-dev-plan`.
- Stage only at the end: `git add .`.

## Implementation Rules

- Preserve project conventions from `AGENTS.md`.
- Keep public contracts synchronized across all affected producers and consumers.
- Avoid unrelated refactors or opportunistic cleanup.
- Add dependencies only if already approved.
- Run required generation, formatting, and validation commands.

## Documentation (`spec/`)

Same rules as `fullstack-dev-implement`:

- Keep the graph `Vision -> Capabilities -> Flows -> Modules -> Contracts -> Code`.
- Update only specs affected by the approved plan and in-scope feedback.
- Keep module/contract `## Code` source listings current.
- Update `spec/doc_issues.md` for unresolved ambiguity, drift, or missing
  traceability.
- Verify Markdown links and source paths for changed specs.
- Use diagrams when they improve clarity and keep blocks balanced.
- Run the docs validation command from `AGENTS.md` whenever `spec/` changes.

If existing specs lag the approved plan or approved in-scope feedback, update
them in this step.

If code or facts on the ground reveal that the approved plan is wrong,
ambiguous, or exceeded by the requested follow-up, **STOP** and return to
`fullstack-dev-plan`.

## Execution Order

1. Read the approved plan, change summary, and human review feedback.
2. Confirm feedback stays within approved scope; re-plan if it does not.
3. Read `AGENTS.md`, relevant specs, and affected source files.
4. Implement the requested follow-up changes.
5. Update shared contracts, generated artifacts, or dependent call sites as
   needed.
6. Run required generation or formatting commands.
7. Update affected `spec/` docs.
8. Update `spec/doc_issues.md` if needed.
9. Run docs validation if `spec/` changed.
10. Run validations and targeted tests from the plan or review feedback.
11. `git add .`.
12. For substantial follow-up batches, run `fullstack-dev-review` again before handing
    back to the human reviewer.

## Output

Confirm validations clean or reported, spec updates complete, module/contract
source listings synced, docs validation run when required, changes staged, and
work ready for re-review.
