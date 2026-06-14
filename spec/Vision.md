# 3D Knowledge Graph Visualizer Vision

The app exists to make spec-driven repositories inspectable as a local knowledge graph. It reads markdown notes under a repository `spec/` directory, links those notes to referenced source files, and renders the result as a navigable graph that preserves the abstraction gradient from Vision down to Code.

The product should help humans stay oriented in dense AI-native development graphs. Coding agents can change a system faster than humans can read all produced text, which creates cognition debt around design intent, implementation boundaries, and recent change impact. The app should bridge that gap by making high-level system shape visible first, then letting users selectively dig into complex areas without losing context.

The primary exploration experience supports hierarchical visual understanding: Vision leads to Capabilities, then Flows, Modules, and implementation detail through optional Contracts and Code. Contracts are first-class when they capture a meaningful API, data, state, integration, or compatibility boundary, but modules may link directly to code when no separate contract is worth maintaining. Users can progressively expand this structure, inspect peer relationships within any layer, and keep cross-cutting notes discoverable without overwhelming the main hierarchy. The current implementation supports a default 2D layered map, an alternate 3D pyramid, true 2D horizontal planes and vertical slices, GitHub blob navigation, GitHub commit navigation for changed files, search, filtering, and cross-cutting note visibility.

## Capabilities

- [Repository Loading](capabilities/Repository_Loading.md)
- [Spec Graph Extraction](capabilities/Spec_Graph_Extraction.md)
- [3D Pyramid Visualization](capabilities/3D_Pyramid_Visualization.md)
- [Progressive Graph Exploration](capabilities/Progressive_Graph_Exploration.md)
- [Layered Understanding Map](capabilities/Layered_Understanding_Map.md)
- [Horizontal Plane Visualization](capabilities/Horizontal_Plane_Visualization.md)
- [Vertical Slice Traceability](capabilities/Vertical_Slice_Traceability.md)
- [GitHub Navigation](capabilities/GitHub_Navigation.md)
- [Commit Diff Visualization](capabilities/Commit_Diff_Visualization.md)
- [Change-Aware System Understanding](capabilities/Change_Aware_System_Understanding.md)
- [Search and Filtering](capabilities/Search_and_Filtering.md)
- [Cross-Cutting Note Visualization](capabilities/Cross_Cutting_Note_Visualization.md)

## Cross-Cutting Notes

- [System Architecture](architecture_notes/System_Architecture.md)
- [Knowledge Graph Domain Model](domain_notes/Knowledge_Graph_Domain_Model.md)
- [Platform Technology](technology_notes/Platform_Technology.md)
- [Documentation Issues](doc_issues.md)
