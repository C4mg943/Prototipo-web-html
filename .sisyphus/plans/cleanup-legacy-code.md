# Limpieza de Código Legacy (HTML/CSS/JS Vanilla)

## TL;DR

> **Quick Summary**: Eliminar todos los archivos del prototipo vanilla (HTML/CSS/JS) que ya no se usan, ahora que el proyecto tiene frontend React + backend Node.js/TypeScript.
> 
> **Deliverables**:
> - Carpetas `html/`, `css/`, `js/`, `assets/` eliminadas de la raíz
> - Archivo `index.html` de raíz eliminado
> - Proyecto limpio con solo `frontend/`, `backend/`, `documentacion/`
> 
> **Estimated Effort**: Quick (5-10 minutos)
> **Parallel Execution**: NO - secuencial para seguridad
> **Critical Path**: Backup mental → Eliminar → Verificar → Commit

---

## Context

### Original Request
El usuario quiere eliminar todo el código viejo del prototipo HTML/CSS/JS vanilla que ya no se utiliza, ahora que el proyecto migró a React + Node.js/TypeScript.

### Estructura Actual (Antes)
```
Prototipo-web-html/
├── .git/
├── .sisyphus/
├── assets/                 ← ELIMINAR (duplicado en frontend/public/)
│   ├── canchas/
│   ├── extra.png
│   └── logo.png
├── backend/               ← MANTENER
├── css/                   ← ELIMINAR
│   ├── cancha.css
│   ├── menu.css
│   ├── mis-reservas.css
│   ├── style.css
│   └── variables.css
├── documentacion/         ← MANTENER
├── frontend/              ← MANTENER
├── html/                  ← ELIMINAR
│   ├── canchas/
│   │   ├── atletismo.html
│   │   ├── baloncesto.html
│   │   └── ... (8 archivos)
│   ├── en-construccion.html
│   ├── login.html
│   └── mis-reservas.html
├── js/                    ← ELIMINAR
│   ├── config/
│   │   └── canchas.json
│   ├── cancha.js
│   ├── index.js
│   ├── map.js
│   └── mis-reservas.js
├── index.html             ← ELIMINAR
├── flujo_de_trabajo.md    ← MANTENER
└── PLAN_README.md         ← MANTENER
```

### Estructura Objetivo (Después)
```
Prototipo-web-html/
├── .git/
├── .sisyphus/
├── backend/
├── documentacion/
├── frontend/
├── flujo_de_trabajo.md
└── PLAN_README.md
```

### Decisiones del Usuario
- **documentacion/**: MANTENER todo (UML + SQL útiles)
- **assets/ raíz**: ELIMINAR (ya duplicado en frontend/public/assets/)
- **flujo_de_trabajo.md y PLAN_README.md**: MANTENER

---

## Work Objectives

### Core Objective
Eliminar archivos legacy del prototipo vanilla sin afectar el código nuevo en `frontend/` y `backend/`.

### Concrete Deliverables
- 5 carpetas eliminadas: `html/`, `css/`, `js/`, `assets/`
- 1 archivo eliminado: `index.html` (raíz)

### Definition of Done
- [ ] Las carpetas `html/`, `css/`, `js/`, `assets/` no existen
- [ ] El archivo `index.html` en raíz no existe
- [ ] `frontend/` y `backend/` intactos y funcionando
- [ ] Git muestra los archivos eliminados listos para commit

### Must Have
- Eliminar SOLO lo especificado, nada más
- No tocar `frontend/`, `backend/`, `documentacion/`

### Must NOT Have (Guardrails)
- NO eliminar `documentacion/` (contiene UML y SQL útiles)
- NO eliminar `flujo_de_trabajo.md` ni `PLAN_README.md`
- NO eliminar nada dentro de `frontend/` o `backend/`
- NO hacer cambios que rompan el proyecto

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (frontend y backend tienen lint/build)
- **Automated tests**: NO (es solo eliminación de archivos)
- **Framework**: N/A

### QA Policy
Verificar que el proyecto sigue funcionando después de la limpieza.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Eliminación):
└── Task 1: Eliminar carpetas y archivos legacy [quick]

Wave 2 (Verificación):
└── Task 2: Verificar que frontend y backend siguen funcionando [quick]

Wave 3 (Commit):
└── Task 3: Commit de limpieza [quick]

Critical Path: Task 1 → Task 2 → Task 3
```

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|------------|
| 1    | 1     | quick      |
| 2    | 1     | quick      |
| 3    | 1     | quick      |

---

## TODOs

- [ ] 1. Eliminar carpetas y archivos legacy

  **What to do**:
  - Eliminar carpeta `html/` y todo su contenido
  - Eliminar carpeta `css/` y todo su contenido
  - Eliminar carpeta `js/` y todo su contenido
  - Eliminar carpeta `assets/` y todo su contenido
  - Eliminar archivo `index.html` de la raíz

  **Must NOT do**:
  - NO tocar `frontend/`, `backend/`, `documentacion/`
  - NO eliminar `flujo_de_trabajo.md` ni `PLAN_README.md`
  - NO eliminar `.git/` ni `.sisyphus/`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Son comandos simples de eliminación, no requiere lógica compleja
  - **Skills**: `[]`
    - No se requieren skills especiales

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - Raíz del proyecto: `C:\Users\USUARIO\OneDrive - Universidad del Magdalena\Documentos\GitHub\Prototipo-web-html`

  **Acceptance Criteria**:
  - [ ] `dir html` devuelve "no existe" o error de "no encontrado"
  - [ ] `dir css` devuelve "no existe"
  - [ ] `dir js` devuelve "no existe"
  - [ ] `dir assets` devuelve "no existe"
  - [ ] `dir index.html` devuelve "no existe"

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Verificar que carpetas legacy fueron eliminadas
    Tool: Bash
    Preconditions: Comandos ejecutados en raíz del proyecto
    Steps:
      1. Ejecutar: if exist html echo FALLO || echo OK
      2. Ejecutar: if exist css echo FALLO || echo OK
      3. Ejecutar: if exist js echo FALLO || echo OK
      4. Ejecutar: if exist assets echo FALLO || echo OK
      5. Ejecutar: if exist index.html echo FALLO || echo OK
    Expected Result: Todos devuelven "OK"
    Failure Indicators: Cualquiera devuelve "FALLO"
    Evidence: .sisyphus/evidence/task-1-folders-deleted.txt

  Scenario: Verificar que carpetas importantes siguen existiendo
    Tool: Bash
    Preconditions: Comandos ejecutados en raíz del proyecto
    Steps:
      1. Ejecutar: if exist frontend echo OK || echo FALLO
      2. Ejecutar: if exist backend echo OK || echo FALLO
      3. Ejecutar: if exist documentacion echo OK || echo FALLO
    Expected Result: Todos devuelven "OK"
    Failure Indicators: Cualquiera devuelve "FALLO"
    Evidence: .sisyphus/evidence/task-1-important-folders-exist.txt
  ```

  **Commit**: NO (se hace en Task 3 junto con verificación)

---

- [ ] 2. Verificar que frontend y backend siguen funcionando

  **What to do**:
  - Ejecutar `npm run lint` en frontend
  - Ejecutar `npm run build` en frontend
  - Ejecutar `npm run lint` en backend
  - Ejecutar `npm run build` en backend

  **Must NOT do**:
  - NO hacer cambios a código
  - Solo verificar que todo sigue funcionando

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Solo ejecutar comandos de verificación
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - Frontend: `frontend/package.json` - scripts lint y build
  - Backend: `backend/package.json` - scripts lint y build

  **Acceptance Criteria**:
  - [ ] `npm run lint` en frontend → exit code 0
  - [ ] `npm run build` en frontend → exit code 0
  - [ ] `npm run lint` en backend → exit code 0
  - [ ] `npm run build` en backend → exit code 0

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Frontend lint y build exitosos
    Tool: Bash
    Preconditions: Node.js instalado, en carpeta frontend/
    Steps:
      1. cd frontend && npm run lint
      2. npm run build
    Expected Result: Ambos comandos terminan sin errores (exit code 0)
    Failure Indicators: Errores de lint o build, exit code != 0
    Evidence: .sisyphus/evidence/task-2-frontend-check.txt

  Scenario: Backend lint y build exitosos
    Tool: Bash
    Preconditions: Node.js instalado, en carpeta backend/
    Steps:
      1. cd backend && npm run lint
      2. npm run build
    Expected Result: Ambos comandos terminan sin errores (exit code 0)
    Failure Indicators: Errores de lint o build, exit code != 0
    Evidence: .sisyphus/evidence/task-2-backend-check.txt
  ```

  **Commit**: NO (se hace en Task 3)

---

- [ ] 3. Commit de limpieza

  **What to do**:
  - `git add -A` para registrar todas las eliminaciones
  - `git commit -m "chore: remove legacy HTML/CSS/JS vanilla prototype"`

  **Must NOT do**:
  - NO hacer push (el usuario decide cuándo)
  - NO incluir archivos que no deban estar

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Comandos git simples
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - Git en raíz del proyecto

  **Acceptance Criteria**:
  - [ ] `git status` muestra "nothing to commit, working tree clean"
  - [ ] `git log -1 --oneline` muestra el commit de limpieza

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Commit realizado correctamente
    Tool: Bash
    Preconditions: Tasks 1 y 2 completadas
    Steps:
      1. git status (verificar archivos eliminados staged)
      2. git add -A
      3. git commit -m "chore: remove legacy HTML/CSS/JS vanilla prototype"
      4. git log -1 --oneline
    Expected Result: Commit creado con mensaje correcto
    Failure Indicators: Error en commit, archivos no tracked
    Evidence: .sisyphus/evidence/task-3-commit.txt
  ```

  **Commit**: SÍ (este ES el commit)
  - Message: `chore: remove legacy HTML/CSS/JS vanilla prototype`
  - Files: Todas las eliminaciones de Task 1

---

## Success Criteria

### Verification Commands
```bash
# Verificar eliminaciones
dir html        # No debe existir
dir css         # No debe existir
dir js          # No debe existir
dir assets      # No debe existir
dir index.html  # No debe existir

# Verificar que lo importante sigue
dir frontend    # Debe existir
dir backend     # Debe existir
dir documentacion # Debe existir

# Verificar builds
cd frontend && npm run build  # Exit 0
cd backend && npm run build   # Exit 0

# Verificar commit
git log -1 --oneline  # Debe mostrar commit de limpieza
```

### Final Checklist
- [ ] Carpetas legacy eliminadas (html/, css/, js/, assets/)
- [ ] index.html raíz eliminado
- [ ] frontend/ intacto y builds correctamente
- [ ] backend/ intacto y builds correctamente
- [ ] documentacion/ intacta
- [ ] Commit realizado con mensaje descriptivo
