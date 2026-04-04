# Fix Body Sections - Agendar, Contacto, Ubicación y Mapa

## TL;DR

> **Quick Summary**: Corregir el botón "Agendar" para usuarios autenticados, crear página de mantenimiento, mejorar sección de ubicación y traer el mapa con Google Maps API desde el HTML vanilla.
> 
> **Deliverables**:
> - Página de "En Construcción" en React
> - Botón "Agendar" redirige a /en-construccion cuando está autenticado
> - Contacto en header redirige a /en-construccion
> - Sección de ubicación mejorada (centrada, texto más grande)
> - Mapa con Google Maps API y marcadores de canchas
> - API key segura via variables de entorno (VITE_GOOGLE_MAPS_API_KEY)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 4

---

## Context

### Original Request
El usuario reporta:
1. Botón "Agendar" manda a login aunque ya está autenticado - debe ir a página de mantenimiento
2. Link "Contacto" en header debe ir a página de mantenimiento
3. Sección "Nuestra ubicación" tiene texto feo a la derecha - debe estar centrado y más grande
4. El mapa actual es un iframe genérico - quiere el mapa original con Google Maps API y marcadores de las canchas
5. La API key debe guardarse de forma segura (no pública)

### Estado Actual

**HeroSection.tsx (línea 11)**:
```tsx
<Link to="/login" className="btn-agendar">
  Agendar
</Link>
```
- Siempre va a /login, sin importar si está autenticado

**Navbar.tsx (línea 7)**:
```tsx
{ to: '/contacto', label: 'Contacto' }
```
- Va a ContactPage que muestra info de contacto, no página de mantenimiento

**LocationSection.tsx**:
- Usa iframe genérico de Google Maps embed
- Layout en grid con texto a la izquierda (se ve desbalanceado)

**js/map.js (HTML vanilla)**:
- Tiene Google Maps API con marcadores de 8 canchas
- Usa `window.localStorage.getItem('UNIDEPORTES_MAPS_API_KEY')` para la key
- Tiene función `initMap()` que crea mapa satelital con marcadores

---

## Work Objectives

### Core Objective
Mejorar la experiencia de navegación para usuarios autenticados y la presentación visual de la sección de ubicación con mapa interactivo.

### Concrete Deliverables
- `frontend/src/pages/UnderConstructionPage.tsx` - Nueva página de mantenimiento
- `frontend/src/components/HeroSection.tsx` - Lógica condicional para botón Agendar
- `frontend/src/components/Navbar.tsx` - Contacto → /en-construccion
- `frontend/src/components/LocationSection.tsx` - Rediseño centrado + mapa Google Maps
- `frontend/src/components/GoogleMap.tsx` - Componente del mapa con marcadores
- `frontend/.env.example` - Documentar variable VITE_GOOGLE_MAPS_API_KEY
- `frontend/src/index.css` - Estilos mejorados para ubicación

### Definition of Done
- [ ] Usuario autenticado: "Agendar" → /en-construccion
- [ ] Usuario no autenticado: "Agendar" → /login
- [ ] "Contacto" en navbar → /en-construccion
- [ ] Sección ubicación centrada con texto más grande y legible
- [ ] Mapa con Google Maps API y 8 marcadores de canchas
- [ ] API key cargada desde `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Fallback si no hay API key configurada

### Must NOT Have (Guardrails)
- NO hardcodear la API key en el código
- NO romper la navegación existente
- NO cambiar la lógica de autenticación
- NO agregar dependencias externas para el mapa (usar script dinámico)

---

## Verification Strategy

### Test Decision
- **Automated tests**: None (cambios visuales y de navegación)
- **Agent-Executed QA**: Verificación con Playwright

### QA Policy
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — páginas y componentes independientes):
├── Task 1: Crear UnderConstructionPage [quick]
├── Task 3: Mejorar estilos de LocationSection [quick]
└── Task 4: Crear componente GoogleMap [quick]

Wave 2 (Después de Wave 1 — integración):
├── Task 2: Actualizar HeroSection y Navbar (depende: Task 1) [quick]
└── Task 5: Integrar GoogleMap en LocationSection (depende: Task 3, 4) [quick]

Wave 3 (Final):
└── Task 6: Crear .env.example y documentar [quick]
```

### Dependency Matrix
| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 2 |
| 2 | 1 | — |
| 3 | — | 5 |
| 4 | — | 5 |
| 5 | 3, 4 | — |
| 6 | — | — |

---

## TODOs

- [ ] 1. Crear página UnderConstructionPage

  **What to do**:
  - Crear `frontend/src/pages/UnderConstructionPage.tsx`
  - Replicar diseño de `html/en-construccion.html`:
    - Iconos de conos y barricada (usar emojis o SVG inline, no Phosphor)
    - Título "Estamos trabajando para ti"
    - Mensaje de construcción
    - Botón "Volver al Inicio" → Link to="/"
  - Agregar ruta `/en-construccion` en AppRouter.tsx
  - Usar clases CSS: `.construction-page`, `.construction-content`, `.construction-icons`

  **Must NOT do**:
  - No agregar Phosphor Icons como dependencia
  - No copiar los estilos inline del HTML, crear clases CSS

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (con Tasks 3, 4)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `html/en-construccion.html:1-144` - Diseño original a replicar
  - `frontend/src/pages/NotFoundPage.tsx` - Patrón de página simple existente
  - `frontend/src/AppRouter.tsx` - Donde agregar la nueva ruta

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Página de construcción se renderiza correctamente
    Tool: Playwright
    Preconditions: App corriendo en localhost:5173
    Steps:
      1. Navegar a http://localhost:5173/en-construccion
      2. Verificar que existe elemento con clase `.construction-page`
      3. Verificar que existe título "Estamos trabajando para ti"
      4. Verificar que existe botón/link "Volver al Inicio"
      5. Click en "Volver al Inicio"
      6. Verificar URL es http://localhost:5173/
    Expected Result: Página muestra contenido de construcción y navegación funciona
    Evidence: .sisyphus/evidence/task-1-construction-page.png
  ```

  **Commit**: YES
  - Message: `feat(pages): add under construction page`
  - Files: `frontend/src/pages/UnderConstructionPage.tsx`, `frontend/src/AppRouter.tsx`, `frontend/src/index.css`

---

- [ ] 2. Actualizar HeroSection y Navbar para redirecciones

  **What to do**:
  - **HeroSection.tsx**:
    - Importar `useAuth` hook
    - Si `isAuthenticated` → Link to="/en-construccion"
    - Si no autenticado → Link to="/login" (comportamiento actual)
  - **Navbar.tsx**:
    - Cambiar ruta de Contacto de `/contacto` a `/en-construccion`
    - En `publicNavItems`, cambiar `{ to: '/contacto', label: 'Contacto' }` → `{ to: '/en-construccion', label: 'Contacto' }`

  **Must NOT do**:
  - No eliminar la página ContactPage.tsx (puede usarse en el futuro)
  - No cambiar la lógica del dropdown del avatar

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/components/HeroSection.tsx:1-26` - Componente actual
  - `frontend/src/components/Navbar.tsx:5-8` - Array de navegación
  - `frontend/src/hooks/useAuth.ts` - Hook para verificar autenticación
  - `index.html:40-41` - Comportamiento esperado en HTML vanilla

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Usuario autenticado - Agendar va a construcción
    Tool: Playwright
    Preconditions: Usuario logueado en la app
    Steps:
      1. Navegar a http://localhost:5173
      2. Verificar que está autenticado (avatar muestra iniciales, no "U")
      3. Click en botón "Agendar" (selector: `.btn-agendar`)
      4. Verificar URL es http://localhost:5173/en-construccion
    Expected Result: Usuario autenticado es redirigido a página de construcción
    Evidence: .sisyphus/evidence/task-2-agendar-authenticated.png

  Scenario: Usuario no autenticado - Agendar va a login
    Tool: Playwright
    Preconditions: Usuario NO logueado
    Steps:
      1. Navegar a http://localhost:5173 (sin sesión)
      2. Click en botón "Agendar"
      3. Verificar URL es http://localhost:5173/login
    Expected Result: Usuario no autenticado es redirigido a login
    Evidence: .sisyphus/evidence/task-2-agendar-guest.png

  Scenario: Contacto en navbar va a construcción
    Tool: Playwright
    Preconditions: App corriendo
    Steps:
      1. Navegar a http://localhost:5173
      2. Click en link "Contacto" en navbar (selector: `.nav-links a[href="/en-construccion"]`)
      3. Verificar URL es http://localhost:5173/en-construccion
    Expected Result: Link de contacto lleva a página de construcción
    Evidence: .sisyphus/evidence/task-2-contacto-navbar.png
  ```

  **Commit**: YES
  - Message: `fix(nav): redirect agendar and contacto to under-construction page`
  - Files: `frontend/src/components/HeroSection.tsx`, `frontend/src/components/Navbar.tsx`

---

- [ ] 3. Mejorar estilos de sección de ubicación

  **What to do**:
  - Modificar `frontend/src/index.css` sección `.location-section`:
    - Cambiar layout de grid 2 columnas a diseño centrado
    - Hacer el contenedor de texto más ancho y centrado
    - Aumentar tamaño de fuente del título (2rem → 2.5rem)
    - Aumentar tamaño de fuente del párrafo
    - Agregar más padding y espaciado
    - El mapa debajo del texto, ancho completo
  - Referencia: `css/menu.css:295-374` para estilos del HTML vanilla

  **Must NOT do**:
  - No cambiar el contenido del texto
  - No eliminar el botón "Ir al mapa"

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (con Tasks 1, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `frontend/src/index.css:378-423` - Estilos actuales de location-section
  - `css/menu.css:295-374` - Estilos originales del HTML vanilla (referencia visual)

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Sección ubicación se ve centrada y legible
    Tool: Playwright
    Preconditions: App corriendo
    Steps:
      1. Navegar a http://localhost:5173
      2. Scroll hasta sección de ubicación (selector: `#ubicacion`)
      3. Tomar screenshot de la sección completa
      4. Verificar que el texto está centrado visualmente
      5. Verificar que el título es legible (font-size >= 2rem)
    Expected Result: Sección centrada con texto grande y legible
    Evidence: .sisyphus/evidence/task-3-location-styled.png
  ```

  **Commit**: YES
  - Message: `style(location): center content and increase text size`
  - Files: `frontend/src/index.css`

---

- [ ] 4. Crear componente GoogleMap con marcadores

  **What to do**:
  - Crear `frontend/src/components/GoogleMap.tsx`:
    - Cargar Google Maps API dinámicamente via script tag
    - Leer API key desde `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
    - Si no hay key, mostrar mensaje de fallback (mapa no disponible)
    - Implementar función `initMap()` basada en `js/map.js`:
      - Centro: `{ lat: 11.22769, lng: -74.18696 }`
      - Zoom: 17, tipo: satellite
      - 8 marcadores con InfoWindow al hacer click
    - Usar `useEffect` para cargar el script y `useRef` para el contenedor
    - Manejar error de autenticación con `window.gm_authFailure`

  **Must NOT do**:
  - No usar librerías como @react-google-maps/api
  - No hardcodear la API key
  - No bloquear el render si no hay API key

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (con Tasks 1, 3)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `js/map.js:1-70` - Implementación original del mapa (COPIAR LÓGICA)
  - `frontend/src/components/LocationSection.tsx` - Donde se integrará
  - Vite env vars: https://vite.dev/guide/env-and-mode.html

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Mapa muestra fallback sin API key
    Tool: Playwright
    Preconditions: App corriendo SIN VITE_GOOGLE_MAPS_API_KEY configurada
    Steps:
      1. Navegar a http://localhost:5173
      2. Scroll hasta sección de ubicación
      3. Verificar que el contenedor del mapa muestra mensaje de fallback
      4. Verificar que NO hay errores en consola por script no cargado
    Expected Result: Mensaje "Mapa no disponible" visible, sin errores
    Evidence: .sisyphus/evidence/task-4-map-fallback.png

  Scenario: Mapa carga con API key válida
    Tool: Playwright
    Preconditions: App corriendo CON VITE_GOOGLE_MAPS_API_KEY válida en .env
    Steps:
      1. Navegar a http://localhost:5173
      2. Scroll hasta sección de ubicación
      3. Esperar que el mapa cargue (selector: `#google-map canvas` o similar)
      4. Verificar que hay marcadores visibles
    Expected Result: Mapa satelital con marcadores de canchas
    Evidence: .sisyphus/evidence/task-4-map-loaded.png
  ```

  **Commit**: YES
  - Message: `feat(map): add GoogleMap component with markers`
  - Files: `frontend/src/components/GoogleMap.tsx`, `frontend/src/index.css`

---

- [ ] 5. Integrar GoogleMap en LocationSection

  **What to do**:
  - Modificar `frontend/src/components/LocationSection.tsx`:
    - Importar componente `GoogleMap`
    - Reemplazar el `<iframe>` por `<GoogleMap />`
    - Ajustar estructura HTML para nuevo layout centrado:
      ```tsx
      <section id="ubicacion" className="location-section">
        <div className="location-content">
          <h2>Nuestra ubicación</h2>
          <p>Carrera 32 No 22-08, Santa Marta, Magdalena 470004</p>
          <a href="..." className="btn-mapa">Ir al mapa →</a>
        </div>
        <div className="map-container">
          <GoogleMap />
        </div>
      </section>
      ```
    - El texto puede estar en una sola línea o con saltos según diseño

  **Must NOT do**:
  - No eliminar el link "Ir al mapa" externo
  - No cambiar la URL del link externo

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `frontend/src/components/LocationSection.tsx:1-38` - Componente actual
  - `frontend/src/components/GoogleMap.tsx` - Componente creado en Task 4
  - `index.html:155-177` - Estructura original del HTML vanilla

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: LocationSection usa GoogleMap component
    Tool: Playwright
    Preconditions: App corriendo
    Steps:
      1. Navegar a http://localhost:5173
      2. Scroll hasta sección de ubicación
      3. Verificar que NO existe iframe (selector: `.map-iframe` no existe)
      4. Verificar que existe contenedor de GoogleMap (selector: `#google-map`)
      5. Verificar estructura centrada del contenido
    Expected Result: Sección usa componente GoogleMap, no iframe
    Evidence: .sisyphus/evidence/task-5-integrated-map.png
  ```

  **Commit**: YES
  - Message: `refactor(location): integrate GoogleMap component`
  - Files: `frontend/src/components/LocationSection.tsx`

---

- [ ] 6. Crear .env.example y documentar configuración

  **What to do**:
  - Crear `frontend/.env.example` con:
    ```
    # Google Maps API Key (obtener en https://console.cloud.google.com/)
    # Habilitar "Maps JavaScript API" en el proyecto
    VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
    ```
  - Verificar que `.env` está en `.gitignore` del frontend
  - Si no existe `.gitignore` en frontend, crearlo con `.env` y `*.local`

  **Must NOT do**:
  - No commitear ningún archivo .env real con keys
  - No modificar el .gitignore raíz si ya ignora .env

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (independiente)
  - **Blocked By**: None

  **References**:
  - `js/map.js:43-49` - Cómo se manejaba la key en vanilla (localStorage)
  - Vite env: https://vite.dev/guide/env-and-mode.html

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: .env.example existe y tiene formato correcto
    Tool: Bash
    Preconditions: Tareas anteriores completadas
    Steps:
      1. Verificar que existe `frontend/.env.example`
      2. Verificar que contiene `VITE_GOOGLE_MAPS_API_KEY`
      3. Verificar que `.env` está en gitignore
    Expected Result: Archivo de ejemplo presente y .env ignorado
    Evidence: .sisyphus/evidence/task-6-env-example.txt
  ```

  **Commit**: YES
  - Message: `docs(env): add .env.example for Google Maps API key`
  - Files: `frontend/.env.example`, `frontend/.gitignore` (si se crea/modifica)

---

## Commit Strategy

| Task | Commit Message | Files |
|------|----------------|-------|
| 1 | `feat(pages): add under construction page` | UnderConstructionPage.tsx, AppRouter.tsx, index.css |
| 2 | `fix(nav): redirect agendar and contacto to under-construction page` | HeroSection.tsx, Navbar.tsx |
| 3 | `style(location): center content and increase text size` | index.css |
| 4 | `feat(map): add GoogleMap component with markers` | GoogleMap.tsx, index.css |
| 5 | `refactor(location): integrate GoogleMap component` | LocationSection.tsx |
| 6 | `docs(env): add .env.example for Google Maps API key` | .env.example, .gitignore |

---

## Success Criteria

### Verification Commands
```bash
cd frontend && npm run build  # Build sin errores
cd frontend && npm run lint   # Lint sin errores
```

### Final Checklist
- [ ] Página /en-construccion existe y se renderiza
- [ ] Botón "Agendar" redirige según estado de autenticación
- [ ] Link "Contacto" va a /en-construccion
- [ ] Sección de ubicación centrada y con texto grande
- [ ] GoogleMap component funciona con/sin API key
- [ ] .env.example documenta la configuración
- [ ] Build y lint pasan sin errores
