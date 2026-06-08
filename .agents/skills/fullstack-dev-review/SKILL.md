---
name: fullstack-dev-review
description: >-
  Self-review workflow for staged software changes: audits staged changes
  against the approved plan, checks risks, contracts, docs, and validation, and
  writes current_task/changes_summary.md. No code fixes. Use after
  fullstack-dev-implement or fullstack-dev-iterate.
---

# Full-Stack Dev — Review

**Self-audit** implemented changes. The human is the final reviewer.

## Workflow Fit

Use this skill after `fullstack-dev-implement` or `fullstack-dev-iterate`, with the intended
review batch already staged.

This step does not change code. It prepares `current_task/changes_summary.md`
so the human can review faster. Use the approved plan from the current
implementation session when available; if review happens later, reopen a
saved/exported workspace copy first.

## Project Context

- Read `AGENTS.md` first when it exists.
- Review against project-specific architecture, contracts, commands, generated
  files, and conventions described there.
- When `AGENTS.md` is absent, infer review criteria from source, docs, scripts,
  and existing tests.

## Scope

- Read the approved plan from the current implementation session or saved copy.
- Review only staged changes: `git diff --cached`.
- Exclude generated files when project conventions say they are mechanical,
  while still checking that generated files are present when required.

## Checklist

### Plan Alignment

- Change set matches the approved plan.
- No hidden scope drift or unapproved extra work.
- Any deviation is explained and intentional.

### Architecture

- Existing ownership boundaries are preserved unless the plan changes them.
- Responsibilities did not drift into the wrong module, service, layer, or
  package.
- Project constraints in `AGENTS.md` are honored.

### Data And Contracts

- Public APIs, data shapes, schemas, events, messages, and generated types remain
  consistent.
- Producer and consumer sides of a contract were updated together.
- Migrations, compatibility, and lifecycle behavior are considered where
  relevant.

### Documentation (`spec/`)

- Changed user-facing behavior is reflected in relevant capabilities.
- Changed journeys/workflows are reflected in relevant flows.
- Changed responsibility boundaries are reflected in relevant modules.
- Changed state, data, API shapes, consistency rules, or lifecycle are reflected
  in relevant contracts.
- Changed rationale, assumptions, tradeoffs, or technology constraints are
  reflected in consolidated architecture/domain/technology notes.
- Changed modules/contracts list real repo-relative source paths under `## Code`.
- Markdown links in changed specs resolve.
- `spec/doc_issues.md` captures remaining ambiguity, conflicts, drift, or
  missing traceability.
- If staged diffs touch `spec/`, expect the project docs validator to have run
  or a blocker to be recorded.
- Diagram blocks are balanced if diagram validation was skipped.

### Validation

- Required formatters, code generators, linters, type checks, and tests from the
  plan or `AGENTS.md` were run.
- Missing validations are called out with concrete reasons.

## Output Artifact

Write only to `current_task/changes_summary.md`:

1. Overview.
2. Plan alignment.
3. Files modified, grouped by product area such as frontend / backend / docs /
   tests / tooling.
4. One- or two-line summary per file.
5. Reviewer focus: risks, edge cases, validation gaps, or follow-up questions.

If you find issues, call them out in the summary for the human reviewer. Do not
implement fixes in this step.
