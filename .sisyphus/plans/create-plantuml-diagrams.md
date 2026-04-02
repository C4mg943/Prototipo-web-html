# Create PlantUML Use Case Diagrams

## TL;DR
> **Quick Summary**: Create documentation folder and 4 PlantUML files with use case diagrams for the UniDeportes system.
> 
> **Deliverables**: 
> - Folder: documentacion/casos de uso/
> - 4 .puml files with use case diagrams (N0 general + N1A/N1B/N1C expansions)
> 
> **Estimated Effort**: Quick (4 simple text files)
> **Parallel Execution**: YES - 1 wave
> **Critical Path**: Create folder → Create all 4 files (parallel)

---

## Context

### Original Request
User requested to create PlantUML use case diagrams for the UniDeportes system, with N0 high-level cases and N1 expansions.

### Interview Summary
**Key Discussions**:
- Agreed on 6 high-level use cases for N0
- N1A: Expansion of Gestionar Reservas Personales
- N1B: Expansion of Monitorear Uso de Instalaciones
- N1C: Expansion of Administrar Sistema
- Actors: Estudiante, Vigilante, Administrador, Sistema

**Research Findings**:
- PlantUML syntax confirmed for use case diagrams
- Standard UML notation to be used

### Metis Review
**Identified Gaps** (addressed):
- No critical gaps - all requirements clear
- Assumed basic PlantUML syntax is sufficient
- No additional actors or cases needed

---

## Work Objectives

### Core Objective
Create PlantUML use case diagrams documenting the functional requirements of the UniDeportes reservation system.

### Concrete Deliverables
- Folder: `documentacion/casos de uso/`
- File: `casoN0.puml` - General use case diagram
- File: `casoN1A.puml` - Expansion of Gestionar Reservas Personales
- File: `casoN1B.puml` - Expansion of Monitorear Uso de Instalaciones
- File: `casoN1C.puml` - Expansion of Administrar Sistema

### Definition of Done
- [ ] All 4 .puml files exist in the correct folder
- [ ] Each file contains valid PlantUML syntax
- [ ] Diagrams render correctly (can be compiled to PNG)

### Must Have
- Actors: Estudiante, Vigilante, Administrador, Sistema
- Use cases as agreed in interview
- Standard PlantUML use case diagram syntax

### Must NOT Have (Guardrails)
- No sequence diagrams or other UML types
- No implementation details or code
- No external dependencies or complex includes

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO - No test framework needed for this task
- **Automated tests**: NONE - Manual verification of file existence and syntax

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **File Creation**: Use Bash (ls) to verify files exist
- **Syntax Validation**: Use Bash to check PlantUML compilation (if tool available)

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.
> Target: 5-8 tasks per wave. Fewer than 3 per wave (except final) = under-splitting.

```
Wave 1 (Start Immediately — folder + all files, MAX PARALLEL):
├── Task 1: Create documentacion/casos de uso/ folder [quick]
├── Task 2: Create casoN0.puml with general diagram [quick]
├── Task 3: Create casoN1A.puml with reservations expansion [quick]
├── Task 4: Create casoN1B.puml with monitoring expansion [quick]
├── Task 5: Create casoN1C.puml with administration expansion [quick]

Wave FINAL (After ALL tasks — 2 parallel reviews, then user okay):
├── Task F1: Verify all files exist and are readable (oracle)
├── Task F2: Validate PlantUML syntax (unspecified-high)
-> Present results -> Get explicit user okay
```

Critical Path: Task 1 → Tasks 2-5 (parallel) → F1-F2 → user okay
Parallel Speedup: ~80% faster than sequential
Max Concurrent: 4 (Tasks 2-5)
```

### Dependency Matrix (abbreviated — show ALL tasks in your generated plan)

- **1**: — 2, 3, 4, 5
- **2-5**: 1 — F1, F2

### Agent Dispatch Summary

- **1**: **1** — T1 → `quick`
- **Wave 1**: **4** — T2-T5 → `quick`
- **FINAL**: **2** — F1 → `oracle`, F2 → `unspecified-high`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. Create documentacion/casos de uso/ folder

  **What to do**:
  - Create the folder structure: `documentacion/casos de uso/`
  - Ensure the folder is created in the project root

  **Must NOT do**:
  - Do not create any files yet
  - Do not modify existing files

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple file system operation, single command
  - **Skills**: []
    - Reason: No special skills needed for basic folder creation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - must complete before creating files
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):
  > The executor has NO context from your interview. References are their ONLY guide.

  **Pattern References** (existing code to follow):
  - Project root structure shows folders like `css/`, `html/`, `js/` - follow this pattern for `documentacion/`

  **API/Type References** (contracts to implement against):
  - Standard filesystem: create directory with mkdir

  **Test References** (testing patterns to follow):
  - N/A - no tests needed

  **External References** (libraries and frameworks):
  - Bash mkdir command: `mkdir -p documentacion/casos\ de\ uso/`

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.

  \`\`\`
  Scenario: Verify folder creation success
    Tool: Bash
    Preconditions: Project root directory exists
    Steps:
      1. Run mkdir -p documentacion/casos\ de\ uso/
      2. Run ls -la documentacion/
      3. Verify "casos de uso" directory appears in output
    Expected Result: Directory exists and is empty
    Failure Indicators: Directory not created, permission denied
    Evidence: .sisyphus/evidence/task-1-folder-creation.txt

  Scenario: Verify folder is in correct location
    Tool: Bash
    Preconditions: Folder creation completed
    Steps:
      1. Run pwd to confirm current directory
      2. Run ls documentacion/casos\ de\ uso/
      3. Confirm it's empty (no files yet)
    Expected Result: Empty folder in correct path
    Evidence: .sisyphus/evidence/task-1-folder-location.txt
  \`\`\`

  **Evidence to Capture:**
  - [ ] ls output showing folder creation
  - [ ] pwd confirmation of location

  **Commit**: YES | NO (groups with N)
  - Message: `docs: create casos de uso folder`
  - Files: `documentacion/casos de uso/`
  - Pre-commit: none

- [ ] 2. Create casoN0.puml with general diagram

  **What to do**:
  - Create file `documentacion/casos de uso/casoN0.puml`
  - Include PlantUML use case diagram with 6 high-level cases
  - Actors: Estudiante, Vigilante, Administrador, Sistema
  - Use cases: CU-N0.1 through CU-N0.6

  PlantUML Content:
  ```
  @startuml Caso de Uso Nivel 0 - UniDeportes
  actor Estudiante as E
  actor Vigilante as V
  actor Administrador as A
  actor Sistema as S

  usecase "CU-N0.1: Acceder al Sistema de Reservas" as UC1
  usecase "CU-N0.2: Consultar Disponibilidad de Canchas" as UC2
  usecase "CU-N0.3: Gestionar Reservas Personales" as UC3
  usecase "CU-N0.4: Monitorear Uso de Instalaciones" as UC4
  usecase "CU-N0.5: Administrar Sistema" as UC5
  usecase "CU-N0.6: Proporcionar Servicios Institucionales" as UC6

  E --> UC1
  E --> UC2
  E --> UC3
  V --> UC4
  A --> UC5
  S --> UC6
  @enduml
  ```

  **Must NOT do**:
  - Do not include detailed sub-cases (that's for N1)
  - Do not add sequence diagrams or other artifacts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text file creation with known content
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3,4,5)
  - **Blocks**: None
  - **Blocked By**: Task 1 (folder must exist)

  **References** (CRITICAL):
  - PlantUML use case syntax: actors with :Actor:, use cases with (Use Case)
  - Associations: actor --> (Use Case)

  **Acceptance Criteria**:

  **QA Scenarios:**

  \`\`\`
  Scenario: Verify file creation and basic syntax
    Tool: Bash
    Preconditions: Folder exists from Task 1
    Steps:
      1. Create file with PlantUML content
      2. Run head -5 documentacion/casos\ de\ uso/casoN0.puml
      3. Verify starts with @startuml usecase
      4. Verify contains actor definitions
    Expected Result: File exists with correct PlantUML header
    Evidence: .sisyphus/evidence/task-2-n0-creation.txt
  \`\`\`

  **Evidence to Capture:**
  - [ ] File creation confirmation
  - [ ] Syntax validation

  **Commit**: NO (groups with Task 1)

- [ ] 3. Create casoN1A.puml with reservations expansion

  **What to do**:
  - Create file `documentacion/casos de uso/casoN1A.puml`
  - Expand CU-N0.3 Gestionar Reservas Personales
  - Include sub-cases: Realizar Reserva, Consultar Mis Reservas, Modificar Reserva, Cancelar Reserva

  PlantUML Content:
  ```
  @startuml Caso de Uso Nivel 1A - Gestionar Reservas Personales
  actor Estudiante as E

  usecase "CU-N0.3: Gestionar Reservas Personales" as UC3
  usecase "Realizar Reserva" as UC3.1
  usecase "Consultar Mis Reservas" as UC3.2
  usecase "Modificar Reserva" as UC3.3
  usecase "Cancelar Reserva" as UC3.4

  E --> UC3
  UC3 ..> UC3.1 : include
  UC3 ..> UC3.2 : include
  UC3 ..> UC3.3 : include
  UC3 ..> UC3.4 : include
  @enduml
  ```

  **Must NOT do**:
  - Do not include cases from other actors

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2,4,5)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - Same PlantUML syntax as N0

  **Acceptance Criteria**:

  **QA Scenarios:**

  \`\`\`
  Scenario: Verify N1A file and content
    Tool: Bash
    Preconditions: Folder exists
    Steps:
      1. Create file with expansion content
      2. Run grep "Gestionar Reservas" documentacion/casos\ de\ uso/casoN1A.puml
      3. Verify contains 4 sub-cases
    Expected Result: File with correct expansion content
    Evidence: .sisyphus/evidence/task-3-n1a-creation.txt
  \`\`\`

  **Commit**: NO

- [ ] 4. Create casoN1B.puml with monitoring expansion

  **What to do**:
  - Create file `documentacion/casos de uso/casoN1B.puml`
  - Expand CU-N0.4 Monitorear Uso de Instalaciones
  - Include sub-cases for Vigilante: Consultar Reservas del Día, Verificar Cumplimiento, Notificar Disponibilidad

  PlantUML Content:
  ```
  @startuml Caso de Uso Nivel 1B - Monitorear Uso de Instalaciones
  actor Vigilante as V

  usecase "CU-N0.4: Monitorear Uso de Instalaciones" as UC4
  usecase "Consultar Reservas del Día" as UC4.1
  usecase "Verificar Cumplimiento de Reserva" as UC4.2
  usecase "Notificar Disponibilidad de Cancha" as UC4.3

  V --> UC4
  UC4 ..> UC4.1 : include
  UC4 ..> UC4.2 : include
  UC4 ..> UC4.3 : include
  @enduml
  ```

  **Must NOT do**:
  - Do not include admin or student cases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2,3,5)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - PlantUML syntax

  **Acceptance Criteria**:

  **QA Scenarios:**

  \`\`\`
  Scenario: Verify N1B file and vigilante cases
    Tool: Bash
    Preconditions: Folder exists
    Steps:
      1. Create file with monitoring content
      2. Run grep "Vigilante" documentacion/casos\ de\ uso/casoN1B.puml
      3. Verify contains 3 sub-cases
    Expected Result: File with correct vigilante expansion
    Evidence: .sisyphus/evidence/task-4-n1b-creation.txt
  \`\`\`

  **Commit**: NO

- [ ] 5. Create casoN1C.puml with administration expansion

  **What to do**:
  - Create file `documentacion/casos de uso/casoN1C.puml`
  - Expand CU-N0.5 Administrar Sistema
  - Include sub-cases for Administrador: Gestionar Usuarios, Gestionar Canchas, Generar Reportes, Gestionar Disponibilidad

  PlantUML Content:
  ```
  @startuml Caso de Uso Nivel 1C - Administrar Sistema
  actor Administrador as A

  usecase "CU-N0.5: Administrar Sistema" as UC5
  usecase "Gestionar Usuarios" as UC5.1
  usecase "Gestionar Canchas" as UC5.2
  usecase "Generar Reportes" as UC5.3
  usecase "Gestionar Disponibilidad" as UC5.4

  A --> UC5
  UC5 ..> UC5.1 : include
  UC5 ..> UC5.2 : include
  UC5 ..> UC5.3 : include
  UC5 ..> UC5.4 : include
  @enduml
  ```

  **Must NOT do**:
  - Do not include other actor cases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2,3,4)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - PlantUML syntax

  **Acceptance Criteria**:

  **QA Scenarios:**

  \`\`\`
  Scenario: Verify N1C file and admin cases
    Tool: Bash
    Preconditions: Folder exists
    Steps:
      1. Create file with administration content
      2. Run grep "Administrador" documentacion/casos\ de\ uso/casoN1C.puml
      3. Verify contains 4 sub-cases
    Expected Result: File with correct admin expansion
    Evidence: .sisyphus/evidence/task-5-n1c-creation.txt
  \`\`\`

  **Commit**: NO

---

## Final Verification Wave

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 2 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F2 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Verify File Creation** — `oracle`
  Check that folder `documentacion/casos de uso/` exists and contains exactly 4 .puml files. Read each file to confirm it has PlantUML content (starts with @startuml). Compare file list against expected deliverables.
  Output: `Files [4/4] | Folder exists [YES] | Content valid [YES/NO] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Validate PlantUML Syntax** — `unspecified-high`
  For each .puml file, check basic syntax: @startuml/@enduml present, actors and use cases defined properly. If PlantUML CLI available, attempt to compile to verify syntax correctness.
  Output: `Syntax check [4/4 pass] | Compilation [SUCCESS/FAIL] | VERDICT`

---

## Commit Strategy

- **1**: `docs: add use case diagrams folder and files`
  - Files: `documentacion/casos de uso/*.puml`

---

## Success Criteria

### Verification Commands
```bash
ls -la documentacion/casos\ de\ uso/
head -5 documentacion/casos\ de\ uso/casoN0.puml
```

### Final Checklist
- [ ] Folder `documentacion/casos de uso/` exists
- [ ] All 4 .puml files present
- [ ] Each file starts with @startuml
- [ ] Diagrams contain agreed use cases and actors