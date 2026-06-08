---
name: fullstack-test-implement
description: >-
  Implements an approved current_task/plan.md for automated testing by adding or
  extending test harness code, fixtures, concrete test cases, and any approved
  scenario documentation. Runs targeted validations and stages changes.
---

# Full-Stack Testing — Implement

Act as an expert test developer implementing an **explicitly approved**
automated testing plan.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use `AGENTS.md` for test frameworks, commands, environment requirements, and
  CI conventions.
- Reuse existing tests and helpers before creating new infrastructure.

## Preconditions

- `current_task/plan.md` exists.
- Treat the plan as the single source of truth.
- Relevant application behavior is already understood well enough to test.

If the plan materially disagrees with the codebase, specs, or existing test
infrastructure, **stop** and update the plan before continuing.

## Must

- Read `current_task/plan.md` first.
- Read relevant `spec/` docs when the plan references behavior, boundaries,
  contracts, or prior docs.
- Implement only what the plan describes.
- Create or update scenario docs only when the approved plan calls for them.
- Prefer extending existing test utilities before creating new frameworks.
- Stage changes only at the end: `git add .`.

## Testing Rules

- Tests must be deterministic, isolated, and readable.
- Keep assertions behavior-focused, not implementation-detail focused.
- Minimal production-code changes are allowed only when strictly required for
  testability and approved by the plan.
- No framework churn, refactors, or opportunistic cleanup outside the approved
  plan.
- Add dependencies only if the plan requires them and the existing toolchain
  cannot support the tests.
- If the plan and specs disagree on intended behavior, **stop** and get the plan
  updated before continuing.

## Execution Order

1. Read `current_task/plan.md`.
2. Read `AGENTS.md`.
3. Read relevant specs and source files to confirm intended behavior and design
   context.
4. Implement base framework or harness changes.
5. Add or update fixtures, seed data, fakes, mocks, builders, and support
   helpers.
6. Add the planned test cases.
7. Add or update scenario docs and capability links if the plan calls for them.
8. Add dependencies only if approved.
9. Run docs validation if the approved plan includes `spec/` edits.
10. Run the planned validation commands, preferring narrow suites first.
11. `git add .`.

## Validation Guidance

Use the smallest validating command set that proves the work:

- Run the exact commands from `current_task/plan.md`.
- If commands are missing, use `AGENTS.md` and local scripts to choose the
  narrowest relevant suite.
- If a required environment is unavailable, record exactly what blocked
  execution instead of guessing.

## Output

Confirm:

- implementation matches `current_task/plan.md`.
- planned test framework changes are in place.
- planned test cases were added.
- planned scenario docs and links were added or updated when required.
- docs validation was run if `spec/` changed.
- validation commands were run, or blockers were recorded.
- changes are staged.
