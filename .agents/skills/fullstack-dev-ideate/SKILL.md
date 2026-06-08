---
name: fullstack-dev-ideate
description: >-
  Converts a Feature Idea Summary or product brainstorm into capability-level
  spec updates under spec/. Use before fullstack-dev-plan when product intent,
  user-facing behavior, guarantees, business rules, and open questions should be
  captured without implementation detail.
---

# Full-Stack Dev — Ideate

Act as a product knowledge architect maintaining a linked spec graph.

## Project Context

- Read `AGENTS.md` first when it exists.
- Use project-specific vocabulary, principles, and domain rules from
  `AGENTS.md`, existing specs, and source code.
- Do not invent technology or architecture decisions during ideation.

## Task

Convert a user-provided Markdown **Feature Idea Summary** or conversation
brainstorm into updates under `spec/`, primarily:

- `spec/Vision.md` when product intent or principles change.
- `spec/capabilities/*.md` for user-facing capability scope.
- `spec/domain_notes/*.md` when the idea clarifies domain semantics.
- `spec/doc_issues.md` for ambiguity, conflicts, or deferred traceability.

Do not create flows, modules, contracts, architecture notes, or technology notes
during ideation unless the user explicitly asks for design migration. Add
forward links or placeholders to future lower-level docs when useful.

## Allowed

- Read `AGENTS.md`, existing specs, repository docs, and relevant source code.
- Create or update Vision, capabilities, domain notes, and `doc_issues.md`.
- Use existing project templates if present.

## Not Allowed

- Modify application code.
- Create implementation details.
- Make architecture or technology decisions.
- Create flows, modules, or contracts unless explicitly requested.

## Workflow

### 1. Extract Concepts

Identify atomic capability-level concepts:

- User-visible behavior.
- Observable system guarantees.
- Domain rules and non-goals.
- Product principles and scope boundaries.
- Open questions and unresolved edge cases.

Capability specs must avoid component names, data ownership decisions, provider
names, implementation layers, and technology choices. Put those in future
flow/module/contract placeholders or `spec/doc_issues.md`.

### 2. Discover Existing Specs

For each concept:

- Search `spec/` and project docs for related capabilities, domain notes, and
  Vision text.
- Update existing specs when the concept already exists.
- Create a new capability only when no existing capability cleanly owns it.

Do not invent links to non-existent documents unless they are deliberate forward
placeholders for future design work.

### 3. Write Capability Specs

- One coherent capability per file.
- Use concise, user-centric language.
- Preserve rules, guarantees, edge cases, non-goals, and unresolved questions.
- Link to Vision, related capabilities, domain notes, and obvious future
  flows/modules/contracts.
- Record unclear or conflicting behavior in `spec/doc_issues.md`.

### 4. Verify

After edits:

- Run the docs validation command from `AGENTS.md` when available.
- Check Markdown links resolve.
- Confirm every new capability is reachable from `spec/Vision.md`.
- Check diagram block balance if diagrams were added and validation tooling is
  unavailable.

### 5. Stage Changes

After creating or updating specs:

```bash
git add spec/
```

This lets `fullstack-dev-plan` treat staged spec changes as the active product intent.
