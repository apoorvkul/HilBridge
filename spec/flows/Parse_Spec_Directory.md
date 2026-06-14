# Parse Spec Directory

The backend builds graph JSON by reading markdown notes from a local repository and deriving nodes, edges, source references, and git metadata.

```plantuml
@startuml
actor UI
participant "Backend Graph API" as API
participant "Markdown Parser" as Parser
participant "Graph Builder" as Builder
participant "Git Adapter" as Git

UI -> API: POST /api/graph(repoPath, diffTarget?, commitHash?)
API -> Git: read origin and branch
API -> Parser: walk spec markdown files
Parser -> Builder: parsed notes, links, source refs
Builder -> Builder: add nodes and edges
Builder -> Git: mark changed files when diffTarget exists
Builder --> API: GraphResponse
API --> UI: JSON
@enduml
```

## Modules

- [Backend Graph API](../modules/Backend_Graph_API.md)
- [Markdown Parser](../modules/Markdown_Parser.md)
- [Graph Builder](../modules/Graph_Builder.md)
- [Git Adapter](../modules/Git_Adapter.md)
- [GitHub URL Resolver](../modules/GitHub_URL_Resolver.md)

## Contracts

- [Parsed Markdown Note](../contracts/Parsed_Markdown_Note.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [Graph Response](../contracts/Graph_Response.md)
- [Repository Scan Request](../contracts/Repository_Scan_Request.md)
