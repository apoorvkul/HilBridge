# System Architecture

The app is a local-first TypeScript web application with a React/Vite frontend, an Express backend, and shared graph contracts.

```plantuml
@startuml
node "Browser" {
  component "React App Shell" as UI
  component "3D and 2D Graph Renderers" as Renderer
}

node "Local API Server" {
  component "Express /api/graph" as API
  component "Markdown Parser" as Parser
  component "Graph Builder" as Builder
  component "Git Adapter" as Git
}

folder "Selected Git Checkout" as Repo {
  folder "spec/" as Spec
  folder "source files" as Source
}

UI --> API : POST /api/graph
API --> Spec : read markdown
Parser --> Builder : parsed notes
Builder --> Source : source references
API --> Git : git commands
API --> UI : GraphResponse
UI --> Renderer : visible graph
@enduml
```

## Linked Capabilities

- [Repository Loading](../capabilities/Repository_Loading.md)
- [Spec Graph Extraction](../capabilities/Spec_Graph_Extraction.md)
- [3D Pyramid Visualization](../capabilities/3D_Pyramid_Visualization.md)
- [Horizontal Plane Visualization](../capabilities/Horizontal_Plane_Visualization.md)
- [Vertical Slice Traceability](../capabilities/Vertical_Slice_Traceability.md)

## Code

- backend/src/server.ts
- frontend/src/App.tsx
- shared/src/graph.ts
- frontend/vite.config.ts
