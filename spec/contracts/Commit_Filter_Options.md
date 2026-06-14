# Commit Filter Options Contract

The frontend loads selectable commit filter options from `POST /api/commit-options`.

## Request Fields

- `repoPath`: required local repository path. The frontend and backend both trim it.
- `limit`: optional maximum number of recent GitHub commits to request. The backend bounds the value.

## Response Shape

- `options`: ordered list of dropdown options.
- `repo.path`: resolved repository path.
- `repo.github`: [GitHub URL Resolution](GitHub_URL_Resolution.md) metadata.
- `warnings`: bounded list of option-loading warnings.

## Option Shapes

- Staged option: `{ kind: "staged", label: "Staged Local Changes" }`.
- Commit option: `{ kind: "commit", sha, message, committedAt, url? }`.

## Behavior

- The staged option appears only when `git diff --cached --name-status -M` returns staged entries.
- Commit options are fetched from GitHub using the recognized `origin` owner, repository, and current branch when available.
- Commit options include the first commit-message line and GitHub commit timestamp.
- Commit options are filtered to commits that exist in the local checkout, because graph filtering uses local git diff commands.
- `GITHUB_TOKEN` may be used by the backend for private repositories or higher GitHub API rate limits.

## Modules

- [Frontend App Shell](../modules/Frontend_App_Shell.md)
- [Backend Graph API](../modules/Backend_Graph_API.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [Shared Graph Types](../modules/Shared_Graph_Types.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
