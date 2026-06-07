# Graph Builder

The graph builder turns parsed notes and source references into `GraphNode` and `GraphEdge` records.

## Responsibilities

- Create note nodes.
- Create source-code nodes for referenced paths.
- Resolve markdown links and wikilinks.
- Add markdown, source-reference, cross-cutting, hierarchy, and changed-with edges.
- Add degree counts after edge creation.
- Return warnings for unresolved links or git inspection failures.

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
- [Graph Response](../contracts/Graph_Response.md)
- [Parsed Markdown Note](../contracts/Parsed_Markdown_Note.md)

## Code

- backend/src/server.ts
