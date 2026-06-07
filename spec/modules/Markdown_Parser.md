# Markdown Parser

The markdown parser reads notes from `spec/`, extracts title and kind metadata, detects diagrams, and extracts note links and source references.

## Responsibilities

- Parse optional frontmatter with `gray-matter`.
- Infer node kind from folder path or frontmatter.
- Extract titles from frontmatter, first heading, or file name.
- Extract standard markdown links to markdown files.
- Extract wikilinks by title or basename.
- Extract source references from markdown text outside fenced code blocks.
- Detect PlantUML content with fenced `plantuml` or `@startuml`.

## Contracts

- [Parsed Markdown Note](../contracts/Parsed_Markdown_Note.md)
- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)

## Code

- backend/src/server.ts
