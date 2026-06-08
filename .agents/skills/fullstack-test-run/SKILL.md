---
name: fullstack-test-run
description: >-
  Runs automated tests, analyzes logs and failing scenarios, distinguishes likely
  product bugs from test harness or environment problems, and writes
  current_task/bugs.md. Does not fix code.
---

# Full-Stack Testing — Run And Triage

Act as an expert test investigator executing automated suites and turning
failures into actionable bug reports.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use `AGENTS.md` for test commands, environment requirements, report locations,
  and failure-triage conventions.
- Use specs and scenario docs to judge intended behavior.

## Allowed

- Read source code and tests.
- Read `AGENTS.md`, `spec/`, scenario docs, repository docs, logs, and generated
  reports.
- Run automated test commands.
- Inspect logs and reports.
- Write `current_task/bugs.md`.

## Not Allowed

- Modify application code.
- Modify test code.
- Modify `spec/` documents.
- Rewrite `current_task/plan.md` unless the user explicitly asks.
- Suppress failures or weaken assertions just to get green.

## Test Execution Defaults

- Run the smallest relevant suite first, then widen only if needed.
- If `current_task/plan.md` exists, use it to choose scope and commands first.
- For named scenarios, first read the matching scenario doc when present.
- Use specs to gather intended behavior before classifying failures as product
  bugs.
- If environment prerequisites are missing, record the blocker with evidence
  instead of guessing.

## Analysis Workflow

### 1. Determine Execution Scope

Use `current_task/plan.md` when present. For named scenarios, read the matching
scenario doc before running or classifying results. Otherwise infer the
narrowest meaningful suite from the user request and changed area, then confirm
expectations through specs or source.

### 2. Run Tests And Capture Evidence

Collect the exact commands run, failing tests or scenarios, stack traces,
assertion messages, logs, screenshots, traces, and generated reports.

### 3. Classify Failures

For each failure, decide which bucket it belongs to:

- **Product bug** — application behavior is wrong.
- **Test bug** — stale assertion, broken fixture, or incorrect expectation.
- **Environment or infrastructure blocker** — missing database, device,
  credentials, network, service, or setup.

Do not label something a product bug unless logs and code support that
conclusion. Correlate failures against retrieved specs before calling them
regressions.

### 4. Localize Likely Ownership

For product bugs, identify:

- failing invariant or behavior.
- likely layer, module, service, or package.
- relevant capability, flow, module, or contract.
- relevant scenario doc when the failure is scenario-based.
- minimal reproduction path from the failing test.

### 5. Write The Bug Report

Write only to `current_task/bugs.md`.

## Output: `bugs.md`

Use this structure:

1. **Execution Summary** — commands run, suites covered, pass/fail status.
2. **Relevant Specs** — docs and context used to judge intended behavior.
3. **Environment Notes** — missing prerequisites, flaky infra, setup blockers.
4. **Bugs** — one subsection per product bug with:
   - title
   - failing tests
   - observed behavior
   - expected behavior
   - likely area or files
   - evidence from logs or assertions
   - suspected root cause
   - rerun command
   - severity
5. **Non-bug Failures** — test defects or environment issues.
6. **Recommended Next Step** — smallest next action for a human or follow-up skill.

If no product bugs are found, say so explicitly and summarize the clean or
blocked test run.

**Stop** after writing `current_task/bugs.md`. Do not implement fixes.
