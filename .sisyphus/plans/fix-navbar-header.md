# Fix Navbar Header - Espaciado y Menú de Perfil

## TL;DR

> **Quick Summary**: Mejorar el espaciado del navbar (elementos más separados izquierda/derecha) y reemplazar el botón "Cerrar sesión" por un menú desplegable en el avatar.
> 
> **Deliverables**:
> - Navbar con elementos mejor distribuidos (logo a la izquierda, acciones a la derecha)
> - Avatar clickeable con menú dropdown
> - Opción "Cerrar sesión" dentro del menú dropdown
> - Eliminar botón grande "Cerrar sesión"
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential (2 tareas dependientes)
> **Critical Path**: Task 1 (CSS) → Task 2 (Dropdown Component)

---

## Context

### Original Request
El usuario reporta que:
1. Los elementos del navbar están muy centrados, quiere más separación (izquierda más a la izquierda, derecha más a la derecha)
2. El botón grande "Cerrar sesión" debe eliminarse
3. Al hacer clic en el avatar/imagen de perfil debe desplegarse un menú con opciones (principalmente "Cerrar sesión")

### Estado Actual del Código

**Navbar.tsx (líneas 57-70):**
```tsx
{isAuthenticated ? (
  <button type="button" onClick={logout} className="btn-reservar">
    Cerrar sesión
  </button>
) : (
  <Link to="/login" className="btn-reservar">
    Reservar
  </Link>
)}

<div className="avatar-placeholder" title={displayName}>
  {avatarText}
</div>
```

**CSS actual (.navbar-inner):**
```css
.navbar-inner {
  width: min(1200px, 100% - 2rem);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;  /* Ya tiene space-between */
  gap: 1rem;
  padding: 0.85rem 0;
}
```

---

## Work Objectives

### Core Objective
Mejorar la UX del navbar con mejor distribución visual y un menú dropdown en el avatar para acciones de usuario.

### Concrete Deliverables
- `frontend/src/index.css` - CSS actualizado para mayor separación
- `frontend/src/components/Navbar.tsx` - Avatar con dropdown menu
- Nuevo CSS para el dropdown menu

### Definition of Done
- [ ] Elementos del navbar visualmente más separados (logo pegado a la izquierda, acciones pegadas a la derecha)
- [ ] Botón grande "Cerrar sesión" eliminado del navbar
- [ ] Click en avatar abre menú dropdown
- [ ] Menú dropdown contiene opción "Cerrar sesión"
- [ ] Click fuera del menú lo cierra
- [ ] Funciona en desktop y mobile

### Must NOT Have (Guardrails)
- NO agregar librerías externas (hacer el dropdown con React puro + CSS)
- NO romper la funcionalidad de logout existente
- NO cambiar la lógica de autenticación
- NO modificar otros componentes

---

## Verification Strategy

### Test Decision
- **Automated tests**: None (es un fix visual)
- **Agent-Executed QA**: Verificación manual con Playwright

### QA Policy
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Dependency Flow
```
Task 1 (CSS Spacing) 
    ↓
Task 2 (Dropdown Component) - depende del CSS base
```

---

## TODOs

- [ ] 1. Ajustar CSS del Navbar para mayor separación

  **What to do**:
  - Modificar `.navbar-inner` para usar más ancho (cambiar `min(1200px, 100% - 2rem)` a `min(1400px, 100% - 4rem)`)
  - Agregar `padding-inline` al `.navbar-inner` para empujar elementos hacia los extremos
  - Aumentar el `gap` en `.nav-right` de `0.9rem` a `1.5rem`
  - Preparar estilos base para el dropdown menu que se agregará en Task 2

  **Must NOT do**:
  - No cambiar colores ni tipografía
  - No modificar el HTML/TSX en esta tarea

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `frontend/src/index.css:48-125` - Estilos actuales del navbar
  - `frontend/src/components/Navbar.tsx` - Estructura HTML a considerar

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Verificar espaciado visual del navbar
    Tool: Playwright
    Preconditions: App corriendo en localhost:5173
    Steps:
      1. Navegar a http://localhost:5173
      2. Tomar screenshot del navbar
      3. Verificar que el logo está más cerca del borde izquierdo
      4. Verificar que los elementos de la derecha están más cerca del borde derecho
    Expected Result: Espaciado visual mejorado, elementos en extremos
    Evidence: .sisyphus/evidence/task-1-navbar-spacing.png
  ```

  **Commit**: YES
  - Message: `style(navbar): improve spacing and element distribution`
  - Files: `frontend/src/index.css`

---

- [ ] 2. Implementar Dropdown Menu en Avatar

  **What to do**:
  - Crear estado `isDropdownOpen` con useState
  - Envolver el avatar en un contenedor con `position: relative`
  - Hacer el avatar clickeable (cambiar div a button)
  - Crear el menú dropdown con las opciones:
    - "Mi Perfil" (link a futuro, por ahora deshabilitado o placeholder)
    - "Cerrar sesión" (ejecuta logout)
  - Implementar click outside para cerrar el dropdown
  - Eliminar el botón grande "Cerrar sesión" (líneas 57-65 del JSX actual)
  - Agregar estilos CSS para el dropdown

  **Must NOT do**:
  - No usar librerías como Headless UI o Radix
  - No cambiar la lógica de autenticación
  - No agregar más opciones al menú (solo las especificadas)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/components/Navbar.tsx:24-74` - Componente actual completo
  - `frontend/src/hooks/useAuth.ts` - Hook de autenticación (logout viene de aquí)
  - `frontend/src/index.css:97-125` - Estilos de `.nav-right` y elementos relacionados

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Happy path - Abrir y usar dropdown menu
    Tool: Playwright
    Preconditions: Usuario autenticado en la app
    Steps:
      1. Navegar a http://localhost:5173
      2. Hacer login con credenciales válidas
      3. Verificar que NO existe botón grande "Cerrar sesión" visible
      4. Click en el avatar (selector: `.avatar-btn` o similar)
      5. Verificar que aparece dropdown (selector: `.avatar-dropdown`)
      6. Verificar que contiene opción "Cerrar sesión"
      7. Click en "Cerrar sesión"
      8. Verificar redirección a login o estado no autenticado
    Expected Result: Dropdown funciona, logout ejecuta correctamente
    Evidence: .sisyphus/evidence/task-2-dropdown-open.png

  Scenario: Click outside cierra dropdown
    Tool: Playwright
    Preconditions: Usuario autenticado, dropdown abierto
    Steps:
      1. Con dropdown abierto, hacer click fuera del menú
      2. Verificar que el dropdown se cierra
    Expected Result: Dropdown se oculta al hacer click fuera
    Evidence: .sisyphus/evidence/task-2-dropdown-close.png

  Scenario: Usuario no autenticado - sin dropdown
    Tool: Playwright
    Preconditions: Usuario NO autenticado
    Steps:
      1. Navegar a http://localhost:5173 sin login
      2. Verificar que el avatar muestra "Invitado" o inicial
      3. Click en avatar NO debe abrir dropdown (o muestra opción de login)
    Expected Result: Comportamiento apropiado para usuario no autenticado
    Evidence: .sisyphus/evidence/task-2-guest-state.png
  ```

  **Commit**: YES
  - Message: `feat(navbar): add profile dropdown menu with logout option`
  - Files: `frontend/src/components/Navbar.tsx`, `frontend/src/index.css`

---

## Success Criteria

### Verification Commands
```bash
cd frontend && npm run dev  # Iniciar app
# Verificar visualmente en http://localhost:5173
```

### Final Checklist
- [ ] Navbar con mejor distribución espacial
- [ ] Botón grande "Cerrar sesión" eliminado
- [ ] Avatar clickeable con dropdown
- [ ] Dropdown contiene "Cerrar sesión"
- [ ] Click outside cierra dropdown
- [ ] No hay errores en consola
- [ ] Funciona en modo autenticado y no autenticado
