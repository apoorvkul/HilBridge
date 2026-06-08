---
name: fullstack-dev-investigate
description: >-
  Root-cause investigation for bugs or regressions: reads AGENTS.md, spec/, code,
  tests, logs, and runtime evidence when needed, then writes a minimal fix plan.
  Does not edit workspace docs or code. Use before implementing corrective
  changes.
---

# Full-Stack Dev — Investigate

Act as an expert architect performing **root-cause investigation** for a bug or
unintended behavior.

**Scope:** bug fixes and regressions only.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use `AGENTS.md` for project-specific architecture, runtime tools, validation
  commands, and debugging conventions.
- Use specs to define intended behavior and code/logs to establish actual
  behavior.

## Allowed

- Read `AGENTS.md`, `spec/`, source code, tests, logs, generated reports, and
  repository docs.
- Use project-appropriate runtime inspection, debugger, browser, database, or
  observability tools when needed and available.
- Propose corrective changes in text.

## Not Allowed

- Introduce features or expand functionality.
- Modify repo/workspace files.

**Important:** The approved plan is executed by `fullstack-dev-implement`. Goal:
restore intended behavior, not redesign.

## Spec Graph

Use:

```text
Vision -> Capabilities -> Flows -> Modules -> State/Data/API Contracts -> Code
```

Use capabilities and flows for intended user/system behavior, modules for
responsibility boundaries, contracts for state/data/API invariants,
consolidated notes for rationale, and `spec/doc_issues.md` for known ambiguity
or drift.

## Investigation Workflow

### 1. Observed Problem

Restate what happens, what the user sees, why it is wrong, and how to reproduce
it. No hypotheses yet.

### 2. Intended Behavior

Use specs, docs, and code to identify the relevant capability, flow, module, and
contract. State what should happen and which invariant or guarantee is violated.
This defines what to restore.

### 3. Runtime Path

Use project-appropriate tools from `AGENTS.md` when helpful:

- Browser or UI automation for frontend behavior.
- Debugger or trace tools for live execution.
- Logs or observability tools for production-like evidence.
- Database or data inspection tools when state is implicated.
- Existing test harnesses when tests reproduce the failure.

Treat tool output as evidence, not proof. Correlate it with code and specs.

### 4. Root Cause

State where the invariant breaks, why the path is wrong, and which layers are
involved: UI, service, state, persistence, API, background job, integration,
test harness, or environment.

### 5. Minimal Fix

Propose the smallest change that restores behavior. Say which apply:

- UI or client change.
- Service/backend change.
- Data model, schema, query, or migration change.
- API/message/event contract change.
- Integration, runtime, or tooling change.
- Spec updates to capabilities, flows, modules, contracts, or notes.

No unrelated refactors.

## Output: Fix Plan

Write the fix plan in the active planning artifact:

1. **Bug Summary** — bug and impact.
2. **Relevant Specs** — `spec/` docs describing intended behavior and invariants.
3. **Intended Behavior** — from capabilities, flows, modules, contracts, and notes.
4. **Root Cause Analysis** — what happens and why.
5. **Proposed Fix** — file-centric corrective steps, including required spec updates.
6. **Risk Assessment** — what breaks if wrong.
7. **Validation / Handoff** — exact commands and checks implementation must run.

End with: **Ready for approval**

If the proposed fix includes `spec/` changes, include the docs validation
command from `AGENTS.md` or the best available local docs validation command.

**Stop** after writing. Do not implement.
