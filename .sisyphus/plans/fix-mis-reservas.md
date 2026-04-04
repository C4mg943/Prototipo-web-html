# Fix "Mis Reservas" - Bugs y Nuevas Funcionalidades

## TL;DR

> **Quick Summary**: Corregir bugs de visualización (hora incorrecta, nombre de instalación feo) y agregar funcionalidad de edición de reservas con modal completo que incluye cancelación integrada.
> 
> **Deliverables**:
> - Bug fix: Hora mostrada correctamente usando franjas en lugar de timestamps UTC
> - Bug fix: Nombre de instalación legible en lugar de código técnico
> - Feature: Modal de edición de reservas con week picker dinámico
> - Feature: Cancelación integrada dentro del modal de edición
> - Feature: Validación de slots duplicados
> - Feature: Navegación semanal dinámica
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1-2 (bugs) → Task 3-4 (utils/API) → Task 5 (modal) → Task 6-7 (integration)

---

## Context

### Original Request
Usuario reportó que al reservar cancha de tenis de 7am a 10am, en "Mis Reservas" aparece "fac-tenis-1 📅 3 de abril de 2026 🕒 02:00 a. m. - 06:00 a. m." - hora incorrecta y nombre feo. Además quiere poder editar reservas, validar duplicados, y que el selector de semana sea dinámico.

### Interview Summary
**Key Discussions**:
- Hora incorrecta: El problema es que `comienzaEn`/`terminaEn` vienen en UTC y `toLocaleTimeString` interpreta incorrectamente
- Solución preferida: Usar `franja.idInicio/idFin` mapeados a `slotOptions` labels
- Nombre: Mostrar `instalacion.nombre` en lugar de `instalacion.codigo`
- Modal de edición: Debe incluir la funcionalidad de cancelación dentro
- Week picker: Debe permitir navegación entre semanas (avanzar/retroceder)
- Días: Solo lunes a viernes

**Research Findings**:
- `ReservaDto` tiene `franja.idInicio`, `franja.idFin` disponibles
- `slotOptions` en `sports.ts` mapea IDs a labels como "07:00 - 08:00"
- `BookingForm.tsx` tiene lógica de week picker reutilizable
- No existe función `updateReserva` - hay que crearla

### Metis Review
**Identified Gaps** (addressed):
- Timezone handling: Usar franjas en lugar de timestamps elimina el problema
- Scope creep: Modal NO permite cambiar instalación, solo fecha/hora/equipos/notas
- Validation consistency: Crear hook reutilizable si se necesita
- API error handling: Especificar comportamiento para cada tipo de error
- Week navigation limits: Aplicar default de 4 semanas hacia adelante

---

## Work Objectives

### Core Objective
Corregir bugs de visualización en tarjetas de reserva y agregar funcionalidad completa de edición con modal integrado.

### Concrete Deliverables
- `ReservationCard.tsx` corregido con hora y nombre correctos
- `EditReservationModal.tsx` nuevo componente
- `updateReserva()` función en `reservas.ts`
- Week picker con navegación en modal de edición
- Validación de slots duplicados
- Cancelación integrada en modal de edición

### Definition of Done
- [ ] Hora muestra "07:00 - 10:00" en lugar de "02:00 a.m. - 06:00 a.m."
- [ ] Nombre muestra "Cancha Tenis 1" en lugar de "fac-tenis-1"
- [ ] Modal de edición abre con datos pre-llenados
- [ ] Usuario puede cambiar fecha, hora, equipos y notas
- [ ] Usuario puede cancelar desde el mismo modal
- [ ] Validación previene reservas en slots ocupados
- [ ] Week picker permite navegar semanas (solo L-V)
- [ ] `npm run lint` y `npm run build` pasan sin errores

### Must Have
- Usar `franja.idInicio/idFin` para mostrar hora (no timestamps)
- Usar `instalacion.nombre` para mostrar nombre
- Modal debe pre-llenar con valores actuales de la reserva
- Week picker solo muestra lunes a viernes
- Cancelación requiere razón (mantener lógica existente)

### Must NOT Have (Guardrails)
- NO cambiar instalación/cancha desde el modal de edición
- NO agregar nuevos patrones UI - reutilizar componentes existentes
- NO modificar lógica de backend (solo frontend)
- NO permitir editar reservas ya canceladas o completadas
- NO navegación de semana más allá de 4 semanas futuras

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (bun test disponible en package.json)
- **Automated tests**: Tests-after (agregar tests después de implementación)
- **Framework**: bun test

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — bug fixes + utilities):
├── Task 1: Fix time display bug in ReservationCard [quick]
├── Task 2: Fix facility name display in ReservationCard [quick]
├── Task 3: Create time formatting utilities [quick]
└── Task 4: Add updateReserva API function [quick]

Wave 2 (After Wave 1 — modal component):
├── Task 5: Create EditReservationModal component [visual-engineering]
└── Task 6: Add week navigation to week picker [quick]

Wave 3 (After Wave 2 — integration):
├── Task 7: Integrate EditReservationModal in MyReservationsPage [quick]
└── Task 8: Add duplicate slot validation [quick]

Wave FINAL (After ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Full QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 5, 7 |
| 2 | — | 5, 7 |
| 3 | — | 5 |
| 4 | — | 5, 7 |
| 5 | 1, 2, 3, 4 | 7 |
| 6 | — | 5 |
| 7 | 5 | F1-F4 |
| 8 | 4 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **2 tasks** — T5 → `visual-engineering`, T6 → `quick`
- **Wave 3**: **2 tasks** — T7 → `quick`, T8 → `quick`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix time display bug in ReservationCard

  **What to do**:
  - Modificar `ReservationCard.tsx` para usar `franja.idInicio` y `franja.idFin` en lugar de `comienzaEn`/`terminaEn`
  - Importar `slotOptions` de `../data/sports`
  - Crear función `getSlotLabel(id: number)` que busca el label en `slotOptions`
  - Reemplazar `formatTime(reserva.comienzaEn) - formatTime(reserva.terminaEn)` por labels de franjas
  - Mostrar formato "07:00 - 10:00" extrayendo inicio del primer slot y fin del último

  **Must NOT do**:
  - NO modificar la estructura del componente
  - NO tocar otros campos de la tarjeta
  - NO crear dependencias de timezone libraries

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio simple en un solo archivo, lógica directa de mapeo
  - **Skills**: `[]`
    - No requiere skills especializados

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 7
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `frontend/src/components/ReservationCard.tsx:25-31` - Funciones actuales `formatTime` que hay que reemplazar
  - `frontend/src/components/ReservationCard.tsx:46-48` - Líneas donde se usa formatTime que hay que modificar

  **API/Type References**:
  - `frontend/src/types/domain.ts:37-40` - `franja: { idInicio: number; idFin: number; }` estructura disponible
  - `frontend/src/data/sports.ts:201-215` - `slotOptions` con mapeo id → label

  **WHY Each Reference Matters**:
  - `ReservationCard.tsx:25-31`: Entender qué funciones existen y cómo reemplazarlas
  - `ReservationCard.tsx:46-48`: Ubicación exacta del código a modificar
  - `domain.ts:37-40`: Confirmar que `franja` tiene los campos necesarios
  - `sports.ts:201-215`: Fuente de datos para mapear IDs a labels

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — Hora mostrada correctamente
    Tool: Playwright
    Preconditions: Usuario logueado con al menos 1 reserva activa (franja 7am-10am)
    Steps:
      1. Navegar a /mis-reservas
      2. Esperar selector `.reserva-card` visible (timeout: 10s)
      3. Leer texto del elemento `.reserva-time`
      4. Verificar que contiene "07:00" y "10:00" (no "02:00" ni "06:00")
    Expected Result: Texto muestra "🕒 07:00 - 10:00" o similar con horas correctas
    Failure Indicators: Texto contiene "02:00", "06:00", "a.m.", "a. m."
    Evidence: .sisyphus/evidence/task-1-time-display-correct.png

  Scenario: Edge case — Reserva de 1 hora (misma franja inicio/fin)
    Tool: Playwright
    Preconditions: Reserva con franja idInicio=1, idFin=2 (07:00-08:00)
    Steps:
      1. Navegar a /mis-reservas
      2. Encontrar tarjeta con duración "1h"
      3. Leer texto del elemento `.reserva-time`
    Expected Result: Muestra "🕒 07:00 - 08:00"
    Evidence: .sisyphus/evidence/task-1-single-hour-slot.png
  ```

  **Commit**: YES
  - Message: `fix(reservations): display time from franja slots`
  - Files: `frontend/src/components/ReservationCard.tsx`

- [ ] 2. Fix facility name display in ReservationCard

  **What to do**:
  - En `ReservationCard.tsx` línea 45, cambiar `reserva.instalacion.codigo` por `reserva.instalacion.nombre`
  - El campo `instalacion.nombre` ya existe en la respuesta del API

  **Must NOT do**:
  - NO agregar lookup adicional a `facilitiesBySport`
  - NO modificar otros campos

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio de una sola línea, trivial
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `frontend/src/components/ReservationCard.tsx:45` - Línea exacta a modificar: `<h3>{reserva.instalacion.codigo}</h3>`

  **API/Type References**:
  - `frontend/src/types/domain.ts:27-30` - `instalacion: { codigo: string; nombre: string; }` confirma que `nombre` existe

  **WHY Each Reference Matters**:
  - `ReservationCard.tsx:45`: Ubicación exacta del código incorrecto
  - `domain.ts:27-30`: Confirma que el campo `nombre` está disponible

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — Nombre de instalación legible
    Tool: Playwright
    Preconditions: Usuario con reserva en cancha de tenis
    Steps:
      1. Navegar a /mis-reservas
      2. Esperar selector `.reserva-card` visible
      3. Leer texto del elemento `.reserva-info h3`
      4. Verificar que NO contiene "fac-" ni guiones bajos
      5. Verificar que contiene texto legible como "Cancha" o "Pista"
    Expected Result: Texto muestra "Cancha Tenis 1" o nombre similar legible
    Failure Indicators: Texto contiene "fac-tenis-1", "fac-", guiones, códigos técnicos
    Evidence: .sisyphus/evidence/task-2-facility-name-readable.png

  Scenario: Edge case — Múltiples reservas muestran nombres distintos
    Tool: Playwright
    Preconditions: Usuario con reservas en diferentes instalaciones
    Steps:
      1. Navegar a /mis-reservas
      2. Leer todos los `.reserva-info h3`
      3. Verificar que ninguno contiene patrón "fac-"
    Expected Result: Todos los nombres son legibles
    Evidence: .sisyphus/evidence/task-2-multiple-facilities.png
  ```

  **Commit**: YES
  - Message: `fix(reservations): show facility name instead of code`
  - Files: `frontend/src/components/ReservationCard.tsx`

- [ ] 3. Create time formatting utilities

  **What to do**:
  - Crear archivo `frontend/src/utils/timeSlots.ts`
  - Exportar función `getSlotLabel(slotId: number): string` que busca en `slotOptions`
  - Exportar función `formatTimeRange(startId: number, endId: number): string` que retorna "HH:MM - HH:MM"
  - Extraer hora de inicio del label del slot inicio y hora de fin del label del slot fin
  - Ejemplo: `formatTimeRange(1, 4)` → "07:00 - 10:00"

  **Must NOT do**:
  - NO depender de Date objects
  - NO usar timezone libraries
  - NO duplicar slotOptions, importar de sports.ts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Utilidad simple de mapeo
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `frontend/src/data/sports.ts:201-215` - Estructura de `slotOptions` para entender el formato de labels
  - `frontend/src/data/sports.ts:217-219` - `getSportName()` como ejemplo de función de lookup

  **WHY Each Reference Matters**:
  - `sports.ts:201-215`: Ver formato de labels "07:00 - 08:00" para extraer hora inicio/fin
  - `sports.ts:217-219`: Patrón de función de lookup a seguir

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — formatTimeRange funciona correctamente
    Tool: Bash (bun)
    Preconditions: Archivo utils/timeSlots.ts creado
    Steps:
      1. Ejecutar: bun -e "import {formatTimeRange} from './frontend/src/utils/timeSlots'; console.log(formatTimeRange(1, 4))"
      2. Verificar output
    Expected Result: Output es "07:00 - 10:00"
    Failure Indicators: Output diferente, error de importación
    Evidence: .sisyphus/evidence/task-3-format-time-range.txt

  Scenario: Edge case — getSlotLabel con ID inválido
    Tool: Bash (bun)
    Steps:
      1. Ejecutar: bun -e "import {getSlotLabel} from './frontend/src/utils/timeSlots'; console.log(getSlotLabel(999))"
    Expected Result: Retorna string vacío o valor por defecto, NO lanza error
    Evidence: .sisyphus/evidence/task-3-invalid-slot-id.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add time slot formatting utilities`
  - Files: `frontend/src/utils/timeSlots.ts`

- [ ] 4. Add updateReserva API function

  **What to do**:
  - En `frontend/src/services/reservas.ts` agregar función `updateReserva(id: number, payload: UpdateReservaPayload): Promise<ReservaDto>`
  - Usar endpoint `PUT /api/reservas/{id}` o `POST /api/reservas/{id}/update` (verificar con backend)
  - En `frontend/src/types/domain.ts` agregar interface `UpdateReservaPayload` con campos: `fechaReserva`, `idFranjaInicio`, `idFranjaFin`, `equipoSolicitado`, `notas`
  - Reutilizar `reservasRequest` helper existente

  **Must NOT do**:
  - NO modificar funciones existentes
  - NO cambiar estructura de error handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Agregar función siguiendo patrón existente
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `frontend/src/services/reservas.ts:50-57` - `cancelReserva()` como patrón a seguir para estructura de función
  - `frontend/src/services/reservas.ts:11-34` - `reservasRequest` helper que debe reutilizar

  **API/Type References**:
  - `frontend/src/types/domain.ts:51-58` - `CreateReservaPayload` como referencia para campos del payload
  - `frontend/src/types/domain.ts:23-49` - `ReservaDto` tipo de retorno

  **WHY Each Reference Matters**:
  - `reservas.ts:50-57`: Copiar estructura de `cancelReserva` adaptando a update
  - `reservas.ts:11-34`: Reutilizar helper para consistencia
  - `domain.ts:51-58`: Base para definir `UpdateReservaPayload`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — TypeScript compila sin errores
    Tool: Bash
    Steps:
      1. Ejecutar: cd frontend && npm run lint
      2. Ejecutar: cd frontend && npm run build
    Expected Result: Ambos comandos exitosos (exit code 0)
    Evidence: .sisyphus/evidence/task-4-build-success.txt

  Scenario: Edge case — Tipo UpdateReservaPayload exportado correctamente
    Tool: Bash (grep)
    Steps:
      1. Buscar "UpdateReservaPayload" en domain.ts
      2. Verificar que está exportado
    Expected Result: Interface existe y está exportada
    Evidence: .sisyphus/evidence/task-4-type-exported.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add updateReserva function`
  - Files: `frontend/src/services/reservas.ts`, `frontend/src/types/domain.ts`

- [ ] 5. Create EditReservationModal component

  **What to do**:
  - Crear `frontend/src/components/EditReservationModal.tsx`
  - Props: `reserva: ReservaDto | null`, `isSubmitting: boolean`, `onSave: (payload) => Promise<void>`, `onCancel: (reason: string) => Promise<void>`, `onClose: () => void`
  - Estado interno: formulario con `fechaReserva`, `idFranjaInicio`, `idFranjaFin`, `equipoSolicitado`, `notas`
  - Pre-llenar formulario con valores actuales de la reserva
  - Week picker con navegación (botones ← →) para cambiar semana
  - Solo lunes a viernes
  - Límite de 4 semanas hacia adelante
  - Selectores de hora inicio/fin (reutilizar patrón de BookingForm)
  - Checkbox de equipos
  - Textarea de notas
  - Sección de cancelación: botón "Cancelar Reserva" que expande textarea para razón + botón confirmar
  - Dos botones principales: "Guardar Cambios" y "Cerrar"
  - Estilos: reutilizar clases existentes de modal y booking form

  **Must NOT do**:
  - NO permitir cambiar instalación
  - NO crear nuevos patrones de UI
  - NO agregar campos no especificados

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Componente UI complejo con múltiples estados y interacciones
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2, 3, 4, 6

  **References**:

  **Pattern References**:
  - `frontend/src/components/CancelReservationModal.tsx:1-72` - Estructura de modal existente para seguir
  - `frontend/src/components/BookingForm.tsx:161-186` - Week picker UI a reutilizar
  - `frontend/src/components/BookingForm.tsx:188-234` - Selectores de hora inicio/fin
  - `frontend/src/components/BookingForm.tsx:236-245` - Checkbox de equipos
  - `frontend/src/components/BookingForm.tsx:247-260` - Textarea de notas
  - `frontend/src/components/BookingForm.tsx:30-59` - Funciones de week picker a reutilizar

  **API/Type References**:
  - `frontend/src/types/domain.ts:23-49` - `ReservaDto` para tipar props
  - `frontend/src/data/sports.ts:201-215` - `slotOptions` para selectores de hora

  **External References**:
  - `frontend/src/index.css` - Buscar `.modal-overlay`, `.modal-content`, `.week-picker` para estilos existentes

  **WHY Each Reference Matters**:
  - `CancelReservationModal.tsx`: Estructura base del modal (overlay, header, form, actions)
  - `BookingForm.tsx:161-186`: Week picker visual completo para copiar/adaptar
  - `BookingForm.tsx:30-59`: Funciones helper que se pueden extraer o copiar
  - `domain.ts:23-49`: Entender estructura de reserva para pre-llenar form

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — Modal abre con datos pre-llenados
    Tool: Playwright
    Preconditions: Usuario con reserva activa
    Steps:
      1. Navegar a /mis-reservas
      2. Click en botón "Editar" de primera tarjeta (selector: `.btn-editar` o similar)
      3. Esperar modal visible (selector: `.modal-overlay.active`)
      4. Verificar que select de hora inicio tiene valor seleccionado
      5. Verificar que checkbox de equipos refleja estado actual
    Expected Result: Modal abierto con formulario pre-llenado
    Failure Indicators: Modal no abre, campos vacíos, error JS
    Evidence: .sisyphus/evidence/task-5-modal-opens-prefilled.png

  Scenario: Happy path — Navegación de semana funciona
    Tool: Playwright
    Steps:
      1. Abrir modal de edición
      2. Click en botón "→" (siguiente semana)
      3. Verificar que fechas cambian
      4. Click en botón "←" (semana anterior)
      5. Verificar que vuelve a semana original
    Expected Result: Fechas cambian correctamente entre semanas
    Evidence: .sisyphus/evidence/task-5-week-navigation.png

  Scenario: Happy path — Sección de cancelación expandible
    Tool: Playwright
    Steps:
      1. Abrir modal de edición
      2. Click en "Cancelar Reserva"
      3. Verificar que aparece textarea para razón
      4. Escribir razón: "Test cancelación"
      5. Verificar botón "Confirmar Cancelación" visible
    Expected Result: Sección de cancelación se expande correctamente
    Evidence: .sisyphus/evidence/task-5-cancel-section.png

  Scenario: Edge case — Límite de 4 semanas hacia adelante
    Tool: Playwright
    Steps:
      1. Abrir modal de edición
      2. Click "→" repetidamente (5+ veces)
      3. Verificar que botón "→" se deshabilita después de 4 semanas
    Expected Result: No se puede navegar más de 4 semanas adelante
    Evidence: .sisyphus/evidence/task-5-week-limit.png
  ```

  **Commit**: YES
  - Message: `feat(reservations): add EditReservationModal`
  - Files: `frontend/src/components/EditReservationModal.tsx`, `frontend/src/index.css`

- [ ] 6. Add week navigation to week picker (shared utility)

  **What to do**:
  - Extraer funciones de week picker de `BookingForm.tsx` a `frontend/src/utils/weekPicker.ts`:
    - `startOfWeek(date: Date): Date`
    - `toIsoDate(date: Date): string`
    - `formatWeekdayLabel(date: Date): string`
    - `formatDayLabel(date: Date): string`
    - `getWeekDays(baseDate: Date): Date[]` (renombrar de getCurrentWeekDays)
  - Agregar función `getNextWeek(currentWeekStart: Date): Date`
  - Agregar función `getPrevWeek(currentWeekStart: Date): Date`
  - Agregar función `canNavigateForward(currentWeekStart: Date, maxWeeks: number): boolean`
  - Actualizar `BookingForm.tsx` para importar de utils en lugar de definir localmente

  **Must NOT do**:
  - NO cambiar comportamiento actual de BookingForm
  - NO agregar dependencias externas

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Refactor de extracción de funciones
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (puede empezar inmediatamente)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `frontend/src/components/BookingForm.tsx:30-59` - Funciones a extraer

  **WHY Each Reference Matters**:
  - Ubicación exacta del código a mover a utils

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — BookingForm sigue funcionando
    Tool: Playwright
    Steps:
      1. Navegar a /canchas/tenis
      2. Verificar week picker visible
      3. Click en diferentes días
      4. Verificar que selección cambia
    Expected Result: BookingForm funciona igual que antes
    Evidence: .sisyphus/evidence/task-6-booking-form-works.png

  Scenario: Happy path — Utilidades exportadas correctamente
    Tool: Bash
    Steps:
      1. Ejecutar: cd frontend && npm run build
    Expected Result: Build exitoso sin errores de importación
    Evidence: .sisyphus/evidence/task-6-build-success.txt
  ```

  **Commit**: YES
  - Message: `refactor(utils): extract week picker utilities`
  - Files: `frontend/src/utils/weekPicker.ts`, `frontend/src/components/BookingForm.tsx`

- [ ] 7. Integrate EditReservationModal in MyReservationsPage

  **What to do**:
  - En `MyReservationsPage.tsx`:
    - Importar `EditReservationModal`
    - Agregar estado `editingReserva: ReservaDto | null`
    - Agregar handler `handleSaveEdit` que llama `updateReserva` y actualiza lista
    - Agregar handler `handleCancelFromEdit` que llama `cancelReserva` y actualiza lista
    - Renderizar `EditReservationModal` con props apropiados
  - En `ReservationCard.tsx`:
    - Cambiar texto del botón de "Cancelar Reserva" a "Editar"
    - Cambiar callback de `onCancel` a `onEdit`
  - Remover uso directo de `CancelReservationModal` en la página (ahora está dentro de EditModal)

  **Must NOT do**:
  - NO cambiar la lógica de carga de reservas
  - NO modificar estilos de las tarjetas

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Integración siguiendo patrones existentes
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `frontend/src/pages/MyReservationsPage.tsx:29-45` - `handleConfirmCancel` como patrón para `handleSaveEdit`
  - `frontend/src/pages/MyReservationsPage.tsx:68-74` - Cómo se renderiza el modal actual

  **API/Type References**:
  - `frontend/src/services/reservas.ts` - `updateReserva`, `cancelReserva`

  **WHY Each Reference Matters**:
  - `MyReservationsPage.tsx:29-45`: Patrón de handler con try/catch y actualización de estado
  - `MyReservationsPage.tsx:68-74`: Dónde agregar el nuevo modal

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — Flujo completo de edición
    Tool: Playwright
    Steps:
      1. Navegar a /mis-reservas
      2. Click "Editar" en primera reserva
      3. Cambiar fecha a otro día de la semana
      4. Click "Guardar Cambios"
      5. Verificar modal cierra
      6. Verificar tarjeta actualizada con nueva fecha
    Expected Result: Reserva actualizada y reflejada en UI
    Evidence: .sisyphus/evidence/task-7-edit-flow-complete.png

  Scenario: Happy path — Flujo completo de cancelación desde edit modal
    Tool: Playwright
    Steps:
      1. Abrir modal de edición
      2. Click "Cancelar Reserva"
      3. Escribir razón: "Ya no puedo asistir"
      4. Click "Confirmar Cancelación"
      5. Verificar modal cierra
      6. Verificar tarjeta muestra estado "Cancelada"
    Expected Result: Reserva cancelada correctamente
    Evidence: .sisyphus/evidence/task-7-cancel-from-edit.png

  Scenario: Error case — API error muestra mensaje
    Tool: Playwright
    Preconditions: Backend devuelve error 500 (simular o usar mock)
    Steps:
      1. Abrir modal, intentar guardar
      2. Verificar mensaje de error visible en modal
    Expected Result: Error mostrado en UI, modal permanece abierto
    Evidence: .sisyphus/evidence/task-7-error-handling.png
  ```

  **Commit**: YES
  - Message: `feat(reservations): integrate edit modal in page`
  - Files: `frontend/src/pages/MyReservationsPage.tsx`, `frontend/src/components/ReservationCard.tsx`

- [ ] 8. Add duplicate slot validation

  **What to do**:
  - En `EditReservationModal.tsx`:
    - Antes de llamar `onSave`, verificar si el nuevo slot está disponible
    - Opción A: Llamar endpoint de disponibilidad del backend si existe
    - Opción B: Pasar lista de reservas existentes como prop y validar client-side
    - Mostrar error "Este horario ya está reservado" si hay conflicto
  - Validación debe considerar: misma instalación, misma fecha, franjas que se solapan

  **Must NOT do**:
  - NO bloquear UI si validación es async
  - NO modificar lógica de otros componentes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Agregar validación con lógica simple
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (después de Task 4)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `frontend/src/components/BookingForm.tsx:103-111` - Validación existente de duración como patrón

  **API/Type References**:
  - `frontend/src/types/domain.ts:23-49` - `ReservaDto` para comparar reservas

  **WHY Each Reference Matters**:
  - `BookingForm.tsx:103-111`: Patrón de validación con setError

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — Slot disponible permite guardar
    Tool: Playwright
    Steps:
      1. Abrir modal de edición
      2. Cambiar a fecha/hora sin conflictos
      3. Click "Guardar Cambios"
    Expected Result: Reserva guardada exitosamente
    Evidence: .sisyphus/evidence/task-8-slot-available.png

  Scenario: Error case — Slot ocupado muestra error
    Tool: Playwright
    Preconditions: Existe otra reserva en el mismo horario
    Steps:
      1. Abrir modal de edición
      2. Cambiar a fecha/hora que tiene otra reserva
      3. Click "Guardar Cambios"
      4. Verificar mensaje de error visible
    Expected Result: Error "Este horario ya está reservado" visible, modal no cierra
    Evidence: .sisyphus/evidence/task-8-slot-conflict.png
  ```

  **Commit**: YES
  - Message: `feat(reservations): validate duplicate slot bookings`
  - Files: `frontend/src/components/EditReservationModal.tsx`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Full QA with Playwright** — `unspecified-high` + skill `playwright`
  Execute ALL QA scenarios from ALL tasks. Test cross-task integration. Save evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 match. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Task | Commit Message | Files |
|------|----------------|-------|
| 1 | `fix(reservations): display time from franja slots` | ReservationCard.tsx |
| 2 | `fix(reservations): show facility name instead of code` | ReservationCard.tsx |
| 3 | `feat(utils): add time slot formatting utilities` | utils/timeSlots.ts |
| 4 | `feat(api): add updateReserva function` | services/reservas.ts, types/domain.ts |
| 5 | `feat(reservations): add EditReservationModal` | components/EditReservationModal.tsx, index.css |
| 6 | `feat(booking): add week navigation to picker` | components/BookingForm.tsx (or shared) |
| 7 | `feat(reservations): integrate edit modal in page` | pages/MyReservationsPage.tsx |
| 8 | `feat(reservations): validate duplicate slot bookings` | components/EditReservationModal.tsx |

---

## Success Criteria

### Verification Commands
```bash
npm run lint          # Expected: no errors
npm run build         # Expected: build successful
npm run test          # Expected: all tests pass (if added)
```

### Final Checklist
- [ ] Hora muestra formato correcto (ej: "07:00 - 10:00")
- [ ] Nombre muestra texto legible (ej: "Cancha Tenis 1")
- [ ] Modal de edición funciona correctamente
- [ ] Cancelación funciona desde modal de edición
- [ ] Week picker navega entre semanas
- [ ] Validación de duplicados funciona
- [ ] Todos los "Must Have" presentes
- [ ] Todos los "Must NOT Have" ausentes
