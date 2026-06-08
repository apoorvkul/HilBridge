---
name: fullstack-dev-doc
description: >-
  Creates or updates project specification documents under spec/ using a generic
  Vision -> Capabilities -> Flows -> Modules -> State/Data/API Contracts -> Code
  hierarchy. Use for documentation-first work, spec graph maintenance, or when
  the user invokes fullstack-dev-doc. Project-specific stack and architecture details
  should come from AGENTS.md and the existing repository.
---

# Spec Documentation

Act as an expert technical writer and knowledge graph curator for a connected
Markdown spec graph under `spec/`.

**Goal:** Keep specifications concise, traceable, and accurate. Requirements,
rules, design details, implementation facts, unresolved issues, and source
references should live in the closest useful spec document or in
`spec/doc_issues.md`.

## Project Context

- Read `AGENTS.md` first when it exists.
- Treat `AGENTS.md` as the source of project-specific stack, architecture,
  validation commands, naming, and repository conventions.
- If `AGENTS.md` is absent or incomplete, infer conventions from existing docs,
  source files, tests, and scripts.

## Spec Model

Use this graph, with many-to-many Markdown links:

```text
Vision
  -> Capabilities
  -> Flows
  -> Modules
  -> State/Data/API Contracts
  -> Code
```

Recommended directories:

- `spec/Vision.md`
- `spec/capabilities/`
- `spec/flows/`
- `spec/modules/`
- `spec/contracts/`
- `spec/architecture_notes/`
- `spec/domain_notes/`
- `spec/technology_notes/`
- `spec/doc_issues.md`

Use consolidated cross-cutting notes for rationale:

- Architecture notes: why the system is structured this way.
- Domain notes: why the product or business rules behave this way.
- Technology notes: why specific technologies or integrations were chosen.

## Traceability Rules

- Vision links to capabilities and consolidated knowledge notes.
- Capabilities link to relevant flows, modules, contracts, and notes.
- Flows link to relevant capabilities, modules, and contracts.
- Modules link to capabilities, flows, contracts, and source code paths.
- Contracts link to capabilities, modules, flows, and source code paths.
- Source files are listed as plain repo-relative paths under `## Code`.
- Do not create Markdown files for individual source files unless the user asks.
- Keep `spec/doc_issues.md` updated for conflicts, ambiguities, drift, missing
  traceability, and validation or coverage gaps.

When information does not fit cleanly, place it in the nearest useful spec doc
or record it in `spec/doc_issues.md`. Never silently drop useful information.

## Diagrams

Use PlantUML or another project-approved diagram format when it improves
understanding:

- Capability maps
- Flow diagrams
- Sequence diagrams
- State machines
- Module interaction diagrams
- Data ownership diagrams
- Lifecycle and consistency diagrams

Keep diagrams concise. Validate syntax when tooling is available; otherwise
check every diagram block is balanced.

## Workflow

### 1. Discover

- Read the user request and any referenced specs.
- Search `spec/` and project docs for related capabilities, flows, modules,
  contracts, and notes.
- Inspect source code when source references, drift, or implementation facts
  matter.
- Use semantic search tools when available; otherwise use direct file reads and
  `rg`.

### 2. Place Knowledge

Choose the closest target:

- Product intent, user-facing behavior, guarantees, business rules: capability
  or Vision.
- User or system journey: flow.
- Responsibility boundary, component ownership, service/module structure:
  module.
- Persisted entity, data shape, API/wire shape, lifecycle, invariant,
  consistency rule: contract.
- Cross-cutting system rationale: architecture note.
- Domain semantics: domain note.
- Technology rationale, constraints, and integration points: technology note.
- Conflict, ambiguity, drift, or missing traceability: `spec/doc_issues.md`.

### 3. Edit

- Follow existing document style and naming.
- Use relative Markdown links.
- Prefer precise atomic notes over long essays.
- Omit empty template sections.
- Add forward links or placeholders when a related lower-level spec is obvious
  but not yet written.
- Keep code references as repo-relative source paths.

### 4. Verify

After spec edits:

- Run the documentation validation command from `AGENTS.md` when present.
- If no command is documented, look for scripts such as docs validators, link
  checkers, or diagram validators before inventing a new one.
- Check Markdown links resolve.
- Check every changed module/contract has `## Code` paths when relevant.
- Check listed source paths exist when possible.
- Check diagram block balance when diagram validation is unavailable.

## Relationship To Other Skills

- `fullstack-dev-ideate`: captures product intent and capability-level specs.
- `fullstack-dev-plan`: reads specs and code to produce an approved implementation plan.
- `fullstack-dev-implement` / `fullstack-dev-iterate`: update code and affected specs.
- `fullstack-dev-review`: audits staged code and spec changes against the approved plan.
