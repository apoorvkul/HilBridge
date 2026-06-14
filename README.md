# HilBridge

A 2-way context bridge (AI <-> Human) for a faster "Humans In the Loop".

A local-first TypeScript app for exploring spec-driven repositories as an interactive knowledge graph.

The app is generic: any local Git checkout with a `spec/` directory and markdown notes can be loaded.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Then open the Vite URL printed by the frontend, usually:

```text
http://127.0.0.1:5173
```

The backend runs on:

```text
http://127.0.0.1:4317
```

## Load a Repository

Enter a local Git checkout path and press **Load**. The app reads:

```text
<repository>/spec/
```

The most recently loaded path is saved in browser local storage and restored the next time you open the UI. On the first visit, the path field is empty.

No cloud service or GitHub API token is required.

## Expected `spec/` Structure

The parser infers node type and graph layer from paths such as:

```text
spec/Vision.md                         -> Vision
spec/capabilities/*.md                 -> Capability
spec/flows/*.md                        -> Flow
spec/modules/*.md                      -> Module
spec/contracts/*.md                    -> State/Data/API Contract
spec/architecture_notes/*.md           -> Architecture Note
spec/domain_notes/*.md                 -> Domain Note
spec/technology_notes/*.md             -> Technology Note
```

Source files referenced by notes become `Code` nodes at the bottom of the graph. Contract notes are optional boundary nodes; module notes can link directly to code when no separate contract is useful.

Frontmatter is optional. When present, `title`, `name`, `kind`, or `type` are used as hints. Without frontmatter, the parser falls back to the first `# Heading` and then the file name.

## Parsed Relationships

The backend extracts:

- Standard markdown links, for example `[Budgeting](../capabilities/Budgeting.md)`
- Wikilinks, for example `[[Budgeting]]`
- Source references that look like repo-relative file paths, for example `ui/lib/schema_v1.drift`
- PlantUML markers, including fenced `plantuml` blocks and `@startuml`

Markdown links become note-to-note edges. Source references become note-to-code edges.

## GitHub URL Detection

The backend runs local git commands in the selected repository:

```bash
git remote get-url origin
git rev-parse --abbrev-ref HEAD
```

Recognized GitHub remotes are converted to browser URLs:

```text
https://github.com/<owner>/<repo>/blob/<branch>/<path>
```

SSH remotes such as `git@github.com:owner/repo.git`, HTTPS remotes, and HTTPS remotes with an embedded username are supported. If the remote is not a GitHub URL, graph extraction still works, but node clicks will not have GitHub destinations.

## Views

**Layered Map** is the default view. It shows the hierarchy as a 2D map:

```text
Vision
Capabilities
Flows
Modules
Contracts
Code
```

Contracts are optional in a path; a module can expand to both contract nodes and direct code references. The map starts with Vision, Capabilities, and directly connected cross-cutting context. Cross-cutting notes stay disconnected until a node is selected; then only that selected node's cross-cutting edges are shown. Selecting a node expands exactly one meaningful downstream layer when available, animates the visible tree around that focus branch, and acts as a spotlight for ancestry, descendants, and peers.

**Horizontal Plane** shows one selected layer from the currently revealed map subset as a true 2D peer graph. Click a layer label in the layered map to open that layer. Selecting a node in the plane can expand same-layer peers, and those discoveries remain visible when you return to the layered map.

**Vertical Slice** starts from a selected note and follows outgoing relationships down toward modules, optional contracts, and code as a true 2D graph with selected-path spotlight context.

**3D Pyramid** remains available as an alternate overview of the stacked hierarchy.

**Commit Filter** presents a dropdown of recent GitHub commits using commit messages plus date/time. The backend fetches commit metadata from the selected repository's GitHub origin and filters options to commits that exist in the local checkout. Set `GITHUB_TOKEN` before starting the backend when private repositories or higher GitHub API rate limits are needed.

```bash
git diff-tree --no-commit-id --name-status -r -M <commitHash>
```

When local staged changes exist, the dropdown also includes `Staged Local Changes`, backed by:

```bash
git diff --cached --name-status -M
```

The commit filter applies to every view. It keeps files touched by the selected commit or staged diff plus upstream nodes that connect those changed nodes back toward Vision, then lets the selected view render that filtered graph. Visible changed nodes show change-status badges. Clicking **Open in GitHub** for a committed changed node opens the GitHub commit page at that file's diff section when GitHub supports the file anchor.

## Current Limitations

- Commit-filtered clicks scroll to the selected file's diff on the commit page; GitHub still shows the full commit around that file.
- Staged local changes do not have commit diff URLs until they are committed.
- Deleted-file commit placeholders do not reconstruct historical hierarchy.
- Hierarchy edges are best-effort and inferred from links, layers, and title mentions.
- Source references are pattern-matched from markdown text; very unusual file names may be missed.
- PlantUML is detected as metadata only. Diagrams are not rendered yet.
- The app reads local files through the backend and is intended for trusted local development use.
