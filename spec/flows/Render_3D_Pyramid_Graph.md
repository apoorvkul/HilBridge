# Render 3D Pyramid Graph

The full graph is rendered with `react-force-graph-3d`. Nodes receive fixed coordinates based on layer, and custom Three.js node objects provide colored spheres, labels, changed indicators, and diagram rings.

```plantuml
@startuml
participant "React State" as State
participant "View Mode Controller" as Controller
participant "Graph Visualization UI" as Graph
participant "ForceGraph3D" as Force

State -> Controller: graph + pyramid mode
Controller -> Controller: select all visible nodes
Controller -> Controller: position by layer
Controller -> Graph: VisibleGraph
Graph -> Force: nodes, links, nodeThreeObject
@enduml
```

## Modules

- [Frontend App Shell](../modules/Frontend_App_Shell.md)
- [View Mode Controller](../modules/View_Mode_Controller.md)
- [Graph Visualization UI](../modules/Graph_Visualization_UI.md)

## Contracts

- [Graph Node](../contracts/Graph_Node.md)
- [Graph Edge](../contracts/Graph_Edge.md)
