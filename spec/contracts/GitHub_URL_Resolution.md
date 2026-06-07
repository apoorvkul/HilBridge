# GitHub URL Resolution Contract

GitHub metadata is optional and derived from local git commands.

## Fields

- `remoteUrl`: raw origin remote.
- `owner`: GitHub owner when remote parsing succeeds.
- `repo`: GitHub repository when remote parsing succeeds.
- `branch`: current branch, or `HEAD` for detached state.
- `commitHash`: requested commit hash when present.
- `webUrl`: `https://github.com/<owner>/<repo>`.

## URL Rules

- Blob URL: `https://github.com/<owner>/<repo>/blob/<branch-or-ref>/<path>`.
- Commit URL: `https://github.com/<owner>/<repo>/commit/<commitHash>`.
- SSH and HTTPS GitHub remotes are recognized.
- Non-GitHub remotes leave URLs undefined and add warnings.

## Modules

- [Git Adapter](../modules/Git_Adapter.md)
- [GitHub URL Resolver](../modules/GitHub_URL_Resolver.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Code

- shared/src/graph.ts
- backend/src/server.ts
- frontend/src/App.tsx
