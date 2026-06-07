# Parsed Markdown Note Contract

`ParsedNote` is an internal backend shape produced from each markdown note.

## Fields

- `node`: [Graph Node](Graph_Node.md) for the markdown file.
- `content`: markdown body after frontmatter parsing.
- `markdownTargets`: resolved repo-relative markdown link paths.
- `wikiTargets`: raw wikilink targets.
- `sourceTargets`: repo-relative source-code paths extracted from prose.

## Modules

- [Markdown Parser](../modules/Markdown_Parser.md)
- [Graph Builder](../modules/Graph_Builder.md)

## Code

- backend/src/server.ts
