# 📋 Plan: Completar Frontend React (UniDeportes)

**Objetivo:** Implementar todo el frontend React (páginas, componentes, estilos) para que se parezca al diseño HTML vanilla existente. Mantener la paleta de colores, layout y UX del HTML como base.

**Status:** En Progreso
**Fecha:** Abril 2026

---

## 🎯 Scope

El frontend actual tiene:
- ✅ Estructura de carpetas (components, pages, layouts, services, context, hooks)
- ✅ Routing básico (React Router v7)
- ✅ Tailwind CSS configurado
- ❌ HomePage muy básica
- ❌ Componentes reutilizables NO implementados
- ❌ Diseño visual (nav, hero, cards) NO implementado
- ❌ Integración con backend NO hecha
- ❌ Estado/Context para autenticación NO funcional

**Se DEBE parecer al HTML vanilla que ya existe** (estructura, colores, responsive).

---

## 📋 TODOs

### Frontend Components & Pages

#### Paso 1: Layout Base y Navbar
- [ ] **T1.1** - Implementar `MainLayout` completa (navbar, footer, outlet)
  - Navbar con logo, links de navegación, perfil
  - Footer con info de autores y logos
  - Responsive design
  - Verificación: Layout page loads sin errores, navbar visible y links funcionan

- [ ] **T1.2** - Crear componente `Navbar` reutilizable
  - Logo y branding UniDeportes
  - Links de navegación (Canchas, Mis Reservas, Contacto)
  - Avatar/Perfil dropdown
  - Responsive menú hamburguesa
  - Verificación: Navbar renderiza, links activos, responsive en mobile

- [ ] **T1.3** - Crear componente `Footer`
  - Grid de logos de autores
  - Nombres de integrantes
  - Logos universitarios
  - Verificación: Footer visible al final de todas las páginas

#### Paso 2: HomePage con Hero + Grid de Deportes
- [ ] **T2.1** - Implementar `HomePage` completa
  - Hero section con título, descripción y botones CTA
  - Grid responsive de 8 deportes (4 columnas desktop, 2 tablet, 1 mobile)
  - Tarjetas de deporte con imagen, nombre, botón "Ver canchas"
  - Sección de ubicación con mapa integrado
  - Verificación: HomePage renderiza, grid visible, imágenes cargan, responsive

- [ ] **T2.2** - Crear componente `HeroSection`
  - Bandera/badge con "Reserva tus escenarios"
  - Título h1 principal
  - Subtítulo
  - Botones "Agendar" y "Cómo funciona"
  - Verificación: Hero se ve correctamente, texto legible, botones clickeables

- [ ] **T2.3** - Crear componente `SportCard`
  - Imagen del deporte (Unsplash o local)
  - Nombre del deporte
  - Botón "Ver canchas" que navega a /canchas/:sport
  - Hover effects
  - Verificación: 8 tarjetas en grid, navegación funciona

- [ ] **T2.4** - Crear componente `LocationSection`
  - Información de ubicación (dirección, teléfono)
  - Mapa interactivo (Google Maps o similar)
  - Botón "Ir al mapa"
  - Verificación: Ubicación visible, mapa carga, botón redirige

#### Paso 3: Página de Cancha (Booking)
- [ ] **T3.1** - Crear página `CanchaPage` (cancha/:sport)
  - Layout 2 columnas: info + formulario reserva
  - Columna izquierda: imagen, especificaciones, contacto
  - Columna derecha: formulario de reserva
  - Responsive (stack en mobile)
  - Verificación: Página carga, layouts visible, formulario funciona

- [ ] **T3.2** - Crear componente `CanchaInfo`
  - Imagen hero de la cancha
  - Nombre e icono deportivo
  - Especificaciones (seguridad, gradas, baños)
  - Contacto (teléfono, admin)
  - Botón "Contactar soporte"
  - Verificación: Información visible, estilo consistente

- [ ] **T3.3** - Crear componente `BookingForm`
  - Selector de escenario (dropdown/select)
  - Selector de cancha (radio/select)
  - Date picker para fecha
  - Time slots para hora inicio/fin (1-3 horas)
  - Checkbox para equipamiento
  - Textarea para notas
  - Botón "Agendar"
  - Validación de formulario
  - Verificación: Form renderiza, validación funciona, submit conecta con API

#### Paso 4: Autenticación (Login/Registro)
- [ ] **T4.1** - Completar `LoginPage`
  - Hero section + login card
  - Usar `LoginForm` existente
  - Integración con API /auth/login
  - Manejo de errores y success
  - Verificación: Login form visible, validación, submit a backend

- [ ] **T4.2** - Mejorar `LoginForm`
  - Campos: email, contraseña
  - Botón login
  - Link a "Registrarse"
  - Validación de campos
  - Loading state durante submit
  - Error messages claros
  - Verificación: Form valida, errores mostrados, loading state funciona

- [ ] **T4.3** - Completar `RegisterPage`
  - Usar `RegisterForm` existente
  - Hero section + register card
  - Integración con API /auth/register
  - Validación de contraseñas
  - Link a "Iniciar sesión"
  - Verificación: Register form visible, validación, submit a backend

- [ ] **T4.4** - Mejorar `RegisterForm`
  - Campos: nombre, email, contraseña, confirmar contraseña
  - Validación de email y contraseña fuerte
  - Botón register
  - Loading state
  - Error messages
  - Success redirect a login
  - Verificación: Form valida, contraseñas match, submit funciona

#### Paso 5: Context/State Management
- [ ] **T5.1** - Crear `AuthContext` y `AuthProvider`
  - Estado: user, isAuthenticated, loading, error
  - Acciones: login, register, logout, refreshToken
  - Persistencia en localStorage
  - Verificación: Context funciona, state persiste, logout borra data

- [ ] **T5.2** - Crear `useAuth` hook
  - Wrapper del AuthContext
  - Funciones: login, register, logout
  - Verificación: Hook disponible en componentes, funciona correctamente

- [ ] **T5.3** - Crear `ProtectedRoute` componente
  - Verifica autenticación
  - Redirige a login si no authenticated
  - Renderiza ruta si authenticated
  - Verificación: Ruta protegida, redirección funciona

#### Paso 6: Página de Mis Reservas
- [ ] **T6.1** - Implementar `MyReservationsPage`
  - Fetch reservas del usuario (GET /api/reservas)
  - Grid de tarjetas de reserva
  - Cada tarjeta: deporte, escenario, cancha, fecha/hora, estado, acciones
  - Botones: Editar, Cancelar
  - Estado vacío si no hay reservas
  - Verificación: Reservas cargan, grid visible, acciones funcionales

- [ ] **T6.2** - Crear componente `ReservationCard`
  - Mostrar info de reserva (deporte, escenario, cancha)
  - Fecha y horario
  - Estado de reserva (colores según status)
  - Botones editar/cancelar
  - Verificación: Card renderiza, botones clickeables

- [ ] **T6.3** - Crear `EditReservationModal`
  - Modal con formulario para editar
  - Campos editables: fecha, horario, notas
  - Botones: Guardar, Cancelar
  - Validación
  - Integración con API PUT /api/reservas/:id
  - Verificación: Modal abre/cierra, form edita, API update funciona

- [ ] **T6.4** - Crear `CancelReservationModal`
  - Modal para confirmar cancelación
  - Campo: razón de cancelación
  - Botones: Confirmar, Cancelar
  - Integración con API DELETE /api/reservas/:id
  - Verificación: Modal funciona, cancelación funciona, lista actualiza

#### Paso 7: Estilos Tailwind
- [ ] **T7.1** - Configurar paleta Tailwind según HTML vanilla
  - Colores primarios: azul (005cab, 004080, 001d35)
  - Acento: naranja (#ff9400)
  - Neutrales: light, dark, grises
  - Funcionales: success, warning, error
  - Verificación: Colores aplicados, consistencia visual

- [ ] **T7.2** - Implementar componentes reutilizables Tailwind
  - Botones (primary, secondary, outline)
  - Cards (standard, hover effects)
  - Forms (inputs, labels, validación)
  - Alerts (success, error, warning)
  - Verificación: Componentes visuales consistentes

- [ ] **T7.3** - Responsive design Tailwind
  - Breakpoints: mobile (sm), tablet (md), desktop (lg)
  - Grid 1 → 2 → 4 columnas
  - Navbar hamburguesa en mobile
  - Stack 2-col layout en mobile
  - Verificación: Responsive en 3 tamaños de pantalla

#### Paso 8: Integración con API Backend
- [ ] **T8.1** - Crear servicio `authService`
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - Manejo de tokens JWT
  - Verificación: Endpoints llamados, tokens guardados

- [ ] **T8.2** - Crear servicio `reservaService`
  - GET /api/reservas (lista mis reservas)
  - POST /api/reservas (crear reserva)
  - PUT /api/reservas/:id (editar)
  - DELETE /api/reservas/:id (cancelar)
  - GET /api/reservas/disponibilidad (check slots)
  - Verificación: Todas las llamadas funcionan, responses correctas

- [ ] **T8.3** - Crear servicio `facilitiesService`
  - GET /api/facilities (lista escenarios y canchas)
  - GET /api/sports (lista deportes)
  - GET /api/time-slots (lista franjas horarias)
  - Caché en estado
  - Verificación: Datos cargan, se usan en forms

- [ ] **T8.4** - Configurar axios/fetch con interceptores
  - Agregar token JWT a headers
  - Manejo de errores 401 (token expirado)
  - Refresh token automático
  - Loading/error states globales
  - Verificación: Interceptores funcionan, token incluido en requests

#### Paso 9: Hooks Personalizados
- [ ] **T9.1** - Crear `useFetch` hook
  - Fetch genérico con loading, error, data
  - Usado en HomePage, CanchaPage, etc.
  - Verificación: Hook reutilizable, loading/error funciona

- [ ] **T9.2** - Crear `useForm` hook
  - Manejo de form state y validación
  - onchange, onSubmit, errors
  - Usado en LoginForm, RegisterForm, BookingForm
  - Verificación: Hook funciona, validación aplica

- [ ] **T9.3** - Crear `useDebounce` hook
  - Para búsquedas en selects (escenarios, canchas)
  - Verificación: Búsqueda de-bounced, responsivo

#### Paso 10: Error Handling y Validación
- [ ] **T10.1** - Error boundaries
  - Error boundary en root
  - FallbackUI cuando algo falla
  - Verificación: Error boundary detecta errores

- [ ] **T10.2** - Validación con zod
  - Schemas de validación (mismo que backend)
  - Usar en forms
  - Mensajes de error en español
  - Verificación: Validación aplica, errores claros

- [ ] **T10.3** - Toasts/Notifications
  - Toast para success/error
  - Auto-dismiss después de 5s
  - Queue de múltiples toasts
  - Verificación: Toasts aparecen, se cierran

#### Paso 11: Testing Frontend
- [ ] **T11.1** - Tests de componentes (Vitest + React Testing Library)
  - Test HomePage renders
  - Test LoginForm validación
  - Test BookingForm submit
  - Verificación: Tests pasan, cobertura > 60%

- [ ] **T11.2** - E2E tests (Playwright)
  - Flow: Home → Login → Ver canchas → Hacer reserva → Mis reservas
  - Verificación: Flow completo funciona end-to-end

#### Paso 12: Documentación y Cleanup
- [ ] **T12.1** - README.md del frontend
  - Instrucciones de setup
  - Estructura de carpetas explicada
  - Cómo agregar componentes
  - Variables de entorno
  - Verificación: README claro y completo

- [ ] **T12.2** - Limpiar código
  - Eliminar console.logs
  - Organizar imports
  - Nombrar archivos consistentemente
  - Verificación: Code clean, no warnings

---

## 📊 Final Verification Wave

- [ ] **F1 - Code Review**
  - Revisar todos los componentes
  - Verificar patrones React (hooks, lazy loading)
  - Verificar TypeScript tipado
  - Resultado: APPROVE / REJECT

- [ ] **F2 - Visual QA**
  - Revisar diseño vs HTML vanilla
  - Colores, espaciado, tipografía
  - Responsive en 3 tamaños
  - Resultado: APPROVE / REJECT

- [ ] **F3 - Functional QA**
  - Flujo completo: Home → Login → Reserva → Mis Reservas
  - Validación de forms
  - Errores y edge cases
  - Resultado: APPROVE / REJECT

- [ ] **F4 - API Integration**
  - Todas las llamadas a backend funcionan
  - Errores manejados
  - Tokens JWT funcionales
  - Resultado: APPROVE / REJECT

---

## 🏗️ Notas Arquitectura

- **Estado:** AuthContext + Local State en componentes
- **Routing:** React Router v7 con ProtectedRoutes
- **Estilos:** Tailwind CSS (no CSS modules)
- **Validación:** Zod schemas + form hooks
- **API:** Axios + interceptores JWT
- **Testing:** Vitest + React Testing Library + Playwright

---

## 📦 Dependencias a Agregar (si necesario)

```json
{
  "axios": "^1.6.0",
  "zod": "^4.3.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0"
}
```

**Nota:** Evaluar si realmente necesitamos todas. Por ahora con AuthContext + useState está bien.

---

## ✅ Definición de Hecho (DoD)

- ✅ Código compila sin errores TypeScript
- ✅ Linting (ESLint) pasa
- ✅ Build (vite build) pasa
- ✅ Tests implementados (Vitest) - pasan
- ✅ Diseño coincide con HTML vanilla (colores, layout, responsive)
- ✅ Flujo completo de usuario funciona
- ✅ Backend integrado (login, reserva, listado)
- ✅ Errores manejados gracefully
- ✅ Documentación actualizada
- ✅ Sin console.logs en código

---

**Próximo paso:** Comenzar Paso 1 (Layout base y Navbar)
