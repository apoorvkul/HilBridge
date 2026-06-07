# GitHub URL Resolver

The GitHub URL resolver converts recognized GitHub remotes and repo-relative paths into browser URLs.

```plantuml
@startuml
start
:Read origin remote;
if (HTTPS GitHub remote?) then (yes)
  :Extract owner/repo;
elseif (SSH GitHub remote?) then (yes)
  :Extract owner/repo;
else (no)
  :Warn and omit URLs;
endif
:Read current branch;
:Build blob URLs for nodes;
if (commit hash present?) then (yes)
  :Build commit URL for changed nodes;
endif
stop
@enduml
```

## Contracts

- [GitHub URL Resolution](../contracts/GitHub_URL_Resolution.md)
- [Graph Node](../contracts/Graph_Node.md)

## Code

- backend/src/server.ts
