# 📚 UniDeportes

## 🎯 ¿Qué es UniDeportes?

**UniDeportes** es un sistema de reserva de canchas deportivas (polideportivo digital) desarrollado con tecnologías web modernas. Permite a estudiantes universitarios reservar espacios deportivos (fútbol, tenis, badminton, etc.) en 7 escenarios diferentes, seleccionando fecha, horario y cancha específica. Es un **prototipo cliente (frontend)** sin backend ni base de datos real.

**Stack tecnológico:**

- HTML5 (estructura)
- CSS3 (estilos + responsive design)
- JavaScript vanilla (sin frameworks)
- JSON (datos estáticos de canchas)
- Google Maps API (ubicación de escenarios)
- localStorage/sessionStorage (almacenamiento local)

---

## 🏗️ Arquitectura General

### Flujo de Usuario

```
1. Usuario accede → index.html (página principal)
   ↓
2. Ve 8 deportes disponibles (grid responsive)
   ↓
3. Hace clic en un deporte → canchas/{deporte}.html
   ↓
4. Selecciona: escenario, cancha, fecha, horarios (1-3 horas)
   ↓
5. Click "Agendar" → Valida y guarda en sessionStorage
   ↓
6. Puede ir a "Mis Reservas" (login.html → mis-reservas.html)
   ↓
7. Ve, edita o cancela sus reservas (datos en localStorage)
```

### Componentes Principales

| Componente             | Archivos                          | Función                                         |
| ---------------------- | --------------------------------- | ----------------------------------------------- |
| **Página Principal**   | index.html                        | Navbar, hero, grid de 8 deportes, mapa, footer  |
| **Páginas de Canchas** | futbol.html, tenis.html, etc. (8) | Layout 2-columnas: info + selector de reserva   |
| **Login**              | html/login.html                   | Formulario email + contraseña                   |
| **Mis Reservas**       | html/mis-reservas.html            | Ver, editar, cancelar reservas                  |
| **Lógica de Reservas** | js/cancha.js                      | Selección de cancha, fecha, horario, validación |
| **Gestión de Datos**   | js/mis-reservas.js                | CRUD (crear, leer, actualizar, eliminar)        |
| **Configuración**      | js/config/canchas.json            | 7 escenarios × 8 deportes, especificaciones     |
| **Estilos**            | css/ (5 archivos)                 | Diseño responsive, variables, colores           |

---

## 📂 Estructura de Archivos (21 archivos totales)

```
Prototipo-web-html/
├── index.html (212 líneas) ← PÁGINA PRINCIPAL
├── html/
│   ├── login.html (formulario de login)
│   ├── mis-reservas.html (gestión de reservas)
│   ├── canchas/
│   │   ├── futbol.html
│   │   ├── tenis.html
│   │   ├── badminton.html
│   │   ├── baloncesto.html
│   │   ├── voleibol.html
│   │   ├── ping-pong.html
│   │   ├── balonmano.html
│   │   └── squash.html
│   └── en-construccion.html
├── css/
│   ├── variables.css (24 líneas) ← COLORES Y TIPOGRAFÍA
│   ├── menu.css (497 líneas) - Navbar, hero, grid, footer
│   ├── cancha.css (410 líneas) - Layout 2-columnas, selectors
│   ├── mis-reservas.css (367 líneas) - Cards, modal
│   └── style.css (434 líneas) - Login, inputs
├── js/
│   ├── cancha.js (442 líneas) ⭐ MÁS COMPLEJO
│   ├── mis-reservas.js (233 líneas)
│   ├── index.js (16 líneas)
│   ├── map.js (70 líneas)
│   └── config/
│       └── canchas.json (197 líneas) ← DATOS CLAVE
└── assets/ (imágenes y logos)
```

---

## 🎨 Diseño Visual y Colores

### Paleta de Colores (variables.css)

```css
/* Primarios */
--primary-600: #005cab /* Azul fuerte */ --primary-700: #004080 /* Azul medio */
  --primary-800: #001d35 /* Azul oscuro */ /* Acento */ --accent: #ff9400
  /* Naranja vivo */ /* Neutrales */ --light: #f8fafc /* Casi blanco */
  --dark: #2d3748 /* Gris oscuro */ /* Funcionales */ --success: #10b981
  /* Verde */ --warning: #f97316 /* Naranja cálido */ --error: #ef4444
  /* Rojo */;
```

### Tipografía

- **Fuente:** Inter (sans-serif)
- **Pesos:** 300, 400, 500, 600, 700, 800
- **Responsive:** Font size ajusta en 3 breakpoints (desktop, tablet 900px, móvil 560px)

### Responsive Design

- **Desktop:** Full width
- **Tablet (≤900px):** 2 columnas, padding reducido
- **Móvil (≤560px):** 1 columna, stack vertical

---

## 💻 Componentes JavaScript (El Corazón del Proyecto)

### 1. **cancha.js** (442 líneas) ⭐ **MÁS IMPORTANTE**

Este archivo maneja la lógica más compleja del sistema. Cuando un usuario accede a una página de deporte (futbol.html, tenis.html, etc.):

**Funciones clave:**

- **`loadCanchasConfig()`** → Carga el JSON desde `canchas.json` (fetch)
- **`renderFieldsFromConfig()`** → Genera dinámicamente botones para cada cancha disponible
- **`getCurrentSportKey()`** → Detecta qué deporte está viendo (del URL o DOM)
- **`selectField(fieldId)`** → Selecciona una cancha específica
- **`selectTime(timeIndex)`** → LA FUNCIÓN MÁS COMPLEJA
  - Permite seleccionar rangos de horarios (mínimo 1 hora, máximo 3 consecutivas)
  - Puede:
    - Nueva selección (clear y elegir)
    - Extender rango (agregar horas al inicio o fin)
    - Reducir rango (quitar horas del inicio o fin)
    - Resetear (vaciar todo)
  - Bloquea visualmente horarios no seleccionables
  - Valida límite de 3 horas

- **`agendarReserva()`** → Recopila: deporte, cancha, fecha, horarios, equipo
  - Valida que todos los campos estén completos
  - Guarda en `sessionStorage` (temporal durante la sesión)
    - Redirige a login

**Conceptos para estudiar:**

- Array operations: `includes()`, `filter()`, `map()`, spread operator
- DOM manipulation: `querySelector()`, `classList`, `addEventListener()`
- Data validation (verificar que un horario no esté doble-reservado)
- Estado global: `selectedTimeIndices` (array que rastrea horarios seleccionados)

### 2. **mis-reservas.js** (233 líneas)

Maneja la interfaz de "Mis Reservas". Permite ver, editar, cancelar reservas guardadas.

**Funciones:**

- **`seedDemoData()`** → Carga datos de demostración (para testing)
- **`saveData(reservations)`** → Persiste en `localStorage` (permanente)
- **`renderReservations()`** → Renderiza tarjetas de reservas
  - Muestra estado (confirmada, pendiente, cancelada) con badges de colores
  - Botones: Editar, Cancelar
  - Empty state si no hay reservas

- **`editReserva(id)`** → Abre modal con formulario prellenado
- **`cancelReserva(id)`** → Pide confirmación, luego elimina

**Conceptos:**

- CRUD básico (Create, Read, Update, Delete)
- localStorage vs sessionStorage (diferencia: permanencia)
- Manipulación de arrays: `find()`, `map()`, `splice()`
- Renderizado condicional (mostrar/ocultar elementos)

### 3. **index.js** (16 líneas)

Muy simple: toggle de visibilidad de contraseña en el login.

```javascript
// Cambia input type="password" a type="text" y viceversa
// Icono Phosphor eye ↔ eye-slash
```

### 4. **map.js** (70 líneas)

Integración con Google Maps API. Muestra 8 marcadores de los 7 escenarios.

- **`initMap()`** → Crea mapa con vista satélite, centrado en la ciudad
- **`loadGoogleMaps()`** → Carga script asincrónico de Google
- **`gm_authFailure()`** → Manejo de errores si la API key no es válida

---

## 📊 canchas.json - La Estructura de Datos

Es el **corazón de los datos dinámicos**. Contiene todos los escenarios, deportes y campos.

```json
{
  "meta": {
    "version": "1.0",
    "description": "Configuración del polideportivo"
  },
  "escenarios": [
    {
      "id": "poli1",
      "nombre": "Polideportivo 1",
      "superficie": "cemento",
      "deportes": ["futbol", "tenis", "badminton"],
      "imagen": "assets/poli1.jpg"
    }
    // ... 6 escenarios más
  ],
  "deportes": [
    {
      "id": "futbol",
      "displayName": "Fútbol",
      "fieldLabel": "Cancha",
      "fields": [
        { "id": "fut1", "nombre": "Cancha 1" },
        { "id": "fut2", "nombre": "Cancha 2" }
      ]
    }
    // ... 7 deportes más
  ]
}
```

**Cómo funciona:**

1. `cancha.js` hace `fetch('config/canchas.json')`
2. Parsea el JSON
3. Valida estructura con `isValidConfigShape()`
4. Renderiza dinámicamente botones de canchas basado en el deporte actual

---

## 🌐 Páginas HTML

### **index.html** (página principal)

- Navbar: Logo + links + botón "Agendar"
- Hero: Gradiente, frase inspiradora, CTA
- Grid de 8 deportes: Cards con imagen, nombre, link
- Mapa: Ubicación de los 7 escenarios
- Footer: Créditos del equipo

### **Páginas de Canchas** (futbol.html, tenis.html, etc. × 8)

**Layout 2-columnas:**

- **Columna izquierda (35%):**
  - Imagen hero del deporte
  - Card de información (nombre, descripción)
  - Specs (cancha tamaño, superficie)
  - Contacto

- **Columna derecha (65%):**
  - Selector dinámico de canchas (botones)
  - Selector de fecha (5 días de ejemplo)
  - Selector de horarios (7am-8pm, bloques de 1 hora)
  - Checkbox "Prestar equipación"
  - Botón "Agendar Reserva"

**Data attributes importantes:**

- `data-field-id="fut1"` → Identifica cancha
- `data-time-index="0"` → Índice de horario

### **login.html**

- Header logo
- Formulario: email, password (con toggle), checkbox "Recordarme", submit
- Validación visual

### **mis-reservas.html**

- Navbar
- Header de página
- Grid de tarjetas con reservas existentes
- Modal para editar
- Confirmación para cancelar

---

## 📌 Conceptos Clave para Estudiar

### 1. **Separación de responsabilidades**

- HTML = Estructura
- CSS = Presentación
- JavaScript = Comportamiento

### 2. **Data-driven UI**

- Los datos (JSON) **generan** la interfaz dinámicamente
- Si cambias canchas.json, la UI se actualiza automáticamente
- No hay HTML hardcodeado para cada cancha

### 3. **Client-side storage**

- **sessionStorage:** Temporal (se borra al cerrar pestaña) - Datos de reserva en progreso
- **localStorage:** Permanente (sobrevive recargas) - Reservas guardadas

### 4. **Array operations**

Muy importante en `cancha.js`:

- `array.includes(x)` → ¿Contiene elemento?
- `array.filter(fn)` → Nuevos elementos que cumplen condición
- `array.map(fn)` → Transforma cada elemento
- `array.splice()` → Inserta/elimina elementos
- Spread operator `[...array]` → Copia array

### 5. **DOM manipulation**

- `querySelector()` → Busca elemento
- `classList.add/remove/toggle()` → Modifica clases CSS
- `addEventListener()` → Escucha clicks/eventos
- `textContent`, `innerHTML` → Modifica contenido

### 6. **Event listeners y event delegation**

Los horarios se cargan dinámicamente. ¿Cómo sabe JS que pasó? Event delegation:

```javascript
container.addEventListener("click", (e) => {
  if (e.target.dataset.timeIndex) {
    selectTime(e.target.dataset.timeIndex);
  }
});
```

### 7. **Validación de datos**

- Verificar que escenario existe en JSON
- Verificar que horarios no se solapen
- Verificar que cancha pertenece a ese deporte

### 8. **Responsive design**

- 3 media queries (900px y 560px)
- Flexbox y Grid
- Mobile-first approach

### 9. **Accesibilidad (a11y)**

- `aria-label` en botones
- `role="button"` en elementos interactivos
- Contraste de colores
- Navegación por teclado

### 10. **API Fetch y JSON**

- `fetch(url)` → Descarga recurso
- `.json()` → Parsea JSON
- Manejo de promesas con `.then()` o `async/await`

---

## 🎤 Preguntas Frecuentes para Expo (Q&A Preparadas)

### **P: ¿Cómo funciona la selección de horarios?**

**R:** El usuario elige rangos de 1-3 horas consecutivas. `selectTime()` rastrea índices en un array. Cada click puede:

- Iniciar nueva selección
- Extender rango (agregar horas)
- Reducir rango (quitar horas)
- Resetear todo

### **P: ¿Dónde se guardan las reservas?**

**R:** En dos lugares:

- **Mientras se completa (en progreso):** `sessionStorage` (temporal)
- **Después de confirmar:** `localStorage` (permanente)

### **P: ¿Por qué sin backend?**

**R:** Es un prototipo educativo. Sin backend significa:

- Rápido de desarrollar (solo frontend)
- Datos no persisten realmente (localStorage es local al navegador)
- Listo para mostrar concepto sin infraestructura

### **P: ¿Cómo se generan dinámicamente las canchas?**

**R:** El JSON `canchas.json` contiene la configuración. `cancha.js` lo carga con `fetch()` y renderiza botones según el deporte actual.

### **P: ¿Y si falla Google Maps?**

**R:** Hay `gm_authFailure()` que maneja la falla. Si no hay clave válida, muestra un fallback amigable.

### **P: ¿Es responsive?**

**R:** Sí. 3 breakpoints:

- Desktop (completo)
- Tablet (≤900px)
- Móvil (≤560px)

---

## ✨ Puntos Fuertes del Proyecto

✅ **Separación clara** HTML/CSS/JS
✅ **Responsive design** desde el inicio
✅ **Data-driven UI** (JSON genera interfaz)
✅ **Lógica compleja** bien implementada (selectTime)
✅ **Accesibilidad** considerada (aria-\*, keyboard nav)
✅ **UI/UX intuitiva** (colores, iconografía)
✅ **Sin dependencias externas** (vanilla JS)

---

## 🔮 Oportunidades de Mejora (Para Mención)

- Backend real (Node.js/Express + PostgreSQL)
- Autenticación real (JWT)
- Base de datos persistente
- Sistema de pagos
- Notificaciones (email, SMS)
- Reservas recurrentes (entrenamientos)
- Disponibilidad en tiempo real
- App móvil (React Native)

---

## 📋 Estructura Recomendada para la Exposición (30-40 minutos)

1. **Demo en vivo** (2 min)
   - Mostrar index.html
   - Hacer una reserva completa
   - Ver mis reservas

2. **Arquitectura y Stack** (5 min)
   - Qué es, por qué estas tecnologías
   - 21 archivos, estructura

3. **Flujo de Usuario** (8 min)
   - Desde index → hacer reserva → guardar
   - Pantalla de mis reservas

4. **Code Walkthrough** (15 min)
   - Mostrar cancha.js (selectTime es la joya)
   - Mostrar canchas.json (cómo genera UI)
   - Mostrar mis-reservas.js (CRUD)
   - Mostrar CSS (colores, responsive)

5. **Decisiones de Diseño** (5 min)
   - Por qué localStorage
   - Por qué 2-columnas
   - Por qué vanilla JS

6. **Q&A** (5 min)
   - Responder preguntas

---

## 📚 Archivos Clave para Memorizar

**Para la exposición, memoriza ESTOS archivos:**

1. **cancha.js** - La lógica más compleja
2. **canchas.json** - Datos que generan UI
3. **mis-reservas.js** - CRUD básico
4. **index.html** - Estructura principal
5. **variables.css** - Colores y tipografía

---

## ✅ Preparación Final

Antes de la expo:

- [ ] Lee esta guía completa
- [ ] Abre cada archivo en VSCode y explóralo
- [ ] Prueba hacer una reserva manualmente
- [ ] Entiende el flujo de selectTime()
- [ ] Memoriza los 5 archivos clave
- [ ] Prepara respuestas para las 6 preguntas Q&A
- [ ] Practica tu demo (2 min rápido)

---

**Última actualización:** 15 de marzo de 2026
**Proyecto:** UniDeportes
**Destino:** Exposición académica + Material de estudio
