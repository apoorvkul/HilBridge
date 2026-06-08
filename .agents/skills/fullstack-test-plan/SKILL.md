---
name: fullstack-test-plan
description: >-
  Produces an implementable automated testing plan in current_task/plan.md from
  source code, existing tests, repository infrastructure, AGENTS.md, and spec/
  context. Does not write tests or modify workspace files except
  current_task/plan.md.
---

# Full-Stack Testing — Plan

Act as an expert test architect for automated coverage.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use `AGENTS.md` for test commands, supported frameworks, environment setup,
  and CI conventions.
- Reuse existing project frameworks before introducing anything new.

## Allowed

- Read source code.
- Read existing tests, fixtures, and test support files.
- Read `AGENTS.md`, `spec/`, repository docs, and task notes.
- Write `current_task/plan.md` (mandatory).

## Not Allowed

- Modify application code.
- Modify test code.
- Modify `spec/` documents directly. Instead, list required documentation work
  for the implementation step.
- Modify dependency or CI files.
- Write any file other than `current_task/plan.md`.

**Important:** The plan is executed verbatim by the implementation step. Avoid
optional, ambiguous, or speculative instructions.

## Tools And Inputs

- Source code, tests, fixtures, and runners in the repo.
- `AGENTS.md` for project-specific testing conventions.
- `spec/` graph for intended behavior and boundaries:
  `Vision -> Capabilities -> Flows -> Modules -> State/Data/API Contracts -> Code`.
- Optional `spec/test_scenarios/` for named E2E or scenario coverage.
- Semantic search tools when available; otherwise direct reads and `rg`.

## Testing Defaults

- Reuse existing frameworks before introducing anything new.
- Prefer deterministic, high-signal tests over broad or brittle suites.
- Match local naming and folder conventions.
- Choose the smallest layer that proves the behavior.
- If existing frameworks are insufficient, call out the exact gap and the
  minimum framework change needed.

## Planning Workflow

### 1. Define The Risk Surface

Identify relevant capabilities, flows, modules, contracts, scenarios, and notes
that define intended behavior for the area under test.

State what behavior needs automated protection and why that behavior is risky
enough to merit tests.

### 2. Read Existing Test Infrastructure

Inspect nearby tests, fixtures, support helpers, and runners first, alongside
the specs that define expected behavior.

- Avoid duplicating harness code that already exists.
- Prefer extending existing fixtures, fakes, builders, helpers, and support
  utilities.
- Match local naming and folder conventions.

### 3. Choose The Right Coverage Layers

For each behavior, choose the smallest layer that provides meaningful confidence:

- Unit tests for pure logic, parsing, normalization, transformations, helpers.
- Component/UI tests for rendering, validation, state, and isolated interaction.
- Integration tests for multi-module workflows, persistence, API boundaries, and
  realistic state transitions.
- End-to-end tests for user journeys, cross-service flows, and regression-prone
  critical paths.

### 4. Plan Base Framework Work

If automated testing needs shared infrastructure, specify exact file-level
changes such as:

- new or updated test helpers.
- fixtures, seed data, factories, or builders.
- fake services, dependency overrides, or mocked integrations.
- runner, report, or environment setup changes.

### 5. Plan Concrete Test Cases

List explicit, assertable scenarios. Each case should say:

- target suite and file location.
- scenario or behavior under test.
- setup or fixtures needed.
- key assertions.

### 6. Plan Scenario Documentation

When named scenarios are part of the project conventions, include exact
documentation work for the implementation step:

- target file under `spec/test_scenarios/`.
- title, goal, setup, flow, assertions, artifact focus, and current status.
- owning capabilities that should link to the scenario.
- related flows/modules/contracts that define behavior or implementation context.

### 7. Plan Validation Commands

List the exact commands that should be run after implementation. Prefer the
smallest validating set first, then broader suites only if justified.

If the plan includes `spec/` edits, include the docs validation command from
`AGENTS.md` or the best available local validator.

## Output: Test Plan

Write `current_task/plan.md` using this structure:

1. **Scope & Intent** — behavior to protect and why.
2. **Relevant Specs** — docs and context that define intended behavior.
3. **Relevant Existing Test Surface** — tests, helpers, fixtures, runners.
4. **Test Strategy** — chosen layers and rationale.
5. **Base Framework Changes** — file-centric harness, fixture, or runner work.
6. **Planned Test Cases** — concrete scenarios grouped by suite.
7. **Scenario Documentation** — spec scenario docs and links to add/update.
8. **Validation Commands** — exact commands to run.
9. **Risks / Gaps** — known limits, blockers, or deferred coverage.

End with: **Ready for approval**

**Stop** after writing `current_task/plan.md`. Do not implement tests.
