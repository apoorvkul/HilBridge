# Git Adapter

The git adapter uses local git commands through `child_process.execFile`.

## Responsibilities

- Read `origin` with `git remote get-url origin`.
- Read the current branch with `git rev-parse --abbrev-ref HEAD`.
- Read changed paths and statuses with `git diff-tree --no-commit-id --name-status -r -M <commitHash>`.
- Return warnings when git metadata cannot be read.

## Contracts

- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)
- [Commit Diff Request](../contracts/Commit_Diff_Request.md)

## Code

- backend/src/server.ts
