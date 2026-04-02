# Draft: Create PlantUML Use Case Diagrams

## Requirements (confirmed)
- Create folder: documentacion/casos de uso/
- Create 4 .puml files: casoN0.puml, casoN1A.puml, casoN1B.puml, casoN1C.puml
- N0: General diagram with 6 high-level use cases
- N1A: Expansion of CU-N0.3 Gestionar Reservas Personales
- N1B: Expansion of CU-N0.4 Monitorear Uso de Instalaciones  
- N1C: Expansion of CU-N0.5 Administrar Sistema
- Actors: Estudiante, Vigilante, Administrador, Sistema
- Use PlantUML syntax for use case diagrams

## Technical Decisions
- Use PlantUML for diagrams (.puml files)
- Follow standard UML use case notation
- Include actors, use cases, and associations
- No includes or complex structures needed

## Research Findings
- PlantUML supports use case diagrams with @startuml usecase
- Actors defined with :actor_name:
- Use cases with (Use Case Name)
- Associations with actor --> (Use Case)

## Open Questions
- Specific PlantUML rendering options?
- Color scheme preferences?
- Include package or notes?

## Scope Boundaries
- INCLUDE: Only the 6 N0 cases and their N1 expansions
- EXCLUDE: No sequence diagrams, no class diagrams, no other artifacts
- EXCLUDE: No backend or implementation details