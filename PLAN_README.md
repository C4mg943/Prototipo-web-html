# UniDeportes - Sistema de Reservas Deportivas

Sistema web completo para gestión de reservas de instalaciones deportivas universitarias. Desarrollado con arquitectura moderna full-stack: backend REST API en Node.js + Express + TypeScript y frontend SPA en React + TypeScript + Vite.

## Descripción General

Plataforma que permite a usuarios universitarios reservar instalaciones deportivas (canchas, gimnasios, piscinas) con franjas horarias configurables, gestión de equipamiento opcional, y autenticación basada en JWT. El sistema incluye validaciones robustas, manejo de estados de reserva, y cancelación con justificación.

**Contexto:** Proyecto académico desarrollado en equipo (2-3 personas), aplicando arquitectura en capas, buenas prácticas de desarrollo full-stack y despliegue futuro en VPS propio.

---

## Stack Tecnológico

### Backend
| Tecnología         | Versión       | Propósito                              |
|--------------------|---------------|----------------------------------------|
| Node.js            | ≥18.x         | Runtime JavaScript                     |
| Express            | ^5.2.1        | Framework web                          |
| TypeScript         | ^6.0.2        | Tipado estático                        |
| PostgreSQL         | ≥14.x         | Base de datos relacional               |
| pg                 | ^8.20.0       | Cliente PostgreSQL                     |
| jsonwebtoken       | ^9.0.3        | Autenticación JWT                      |
| bcryptjs           | ^3.0.3        | Hash de contraseñas                    |
| Zod                | ^4.3.6        | Validación de esquemas                 |
| multer             | ^2.1.1        | Upload de archivos                     |
| helmet             | ^8.1.0        | Seguridad HTTP headers                 |
| cors               | ^2.8.6        | Manejo de CORS                         |
| morgan             | ^1.10.1       | Logger HTTP requests                   |
| dotenv             | ^17.4.0       | Variables de entorno                   |

### Frontend
| Tecnología         | Versión       | Propósito                              |
|--------------------|---------------|----------------------------------------|
| React              | ^19.2.4       | Librería UI                            |
| TypeScript         | ~5.9.3        | Tipado estático                        |
| Vite               | ^8.0.1        | Build tool y dev server                |
| React Router DOM   | ^7.13.2       | Enrutamiento SPA                       |
| Tailwind CSS       | ^4.2.2        | Framework CSS utility-first            |

### Herramientas de Desarrollo
- **ESLint** (^10.1.0 backend, ^9.39.4 frontend): Linting TypeScript
- **tsx** (^4.21.0): Ejecución TypeScript en dev
- **nodemon** (^3.1.14): Hot reload backend

---

## Arquitectura

### Backend: Arquitectura en Capas

Patrón **Controller → Service → Repository → Database** con separación clara de responsabilidades:

```
┌─────────────┐
│  Routes     │ → Define endpoints HTTP y rutas
└──────┬──────┘
       ↓
┌─────────────┐
│ Controllers │ → Recibe requests, valida entrada (Zod), llama Services
└──────┬──────┘
       ↓
┌─────────────┐
│  Services   │ → Lógica de negocio, orquestación, reglas
└──────┬──────┘
       ↓
┌─────────────┐
│Repositories │ → Acceso a datos, queries SQL (pg)
└──────┬──────┘
       ↓
┌─────────────┐
│  Database   │ → PostgreSQL
└─────────────┘
```

**Middleware:** Autenticación JWT, validación de esquemas, manejo de errores centralizado, logging.

### Frontend: Arquitectura React Modular

```
┌──────────────────┐
│   AppRouter      │ → Enrutamiento con React Router DOM
└────────┬─────────┘
         ↓
┌──────────────────┐
│   Layouts        │ → MainLayout con header/footer
└────────┬─────────┘
         ↓
┌──────────────────┐
│   Pages          │ → Vistas principales (Home, Reservas, MisReservas, Login, Register)
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Components      │ → Componentes reutilizables (Cards, Forms, Modals, etc.)
└────────┬─────────┘
         ↓
┌──────────────────┐
│   Services       │ → API client (fetch), interceptores, manejo de tokens
└────────┬─────────┘
         ↓
┌──────────────────┐
│   Context        │ → Estado global (AuthContext)
└──────────────────┘
```

**Protección de rutas:** `/mis-reservas` y otras rutas privadas protegidas por AuthContext con redirección a `/login`.

---

## Estructura del Proyecto

```
Prototipo-web-html/
│
├── backend/
│   ├── src/
│   │   ├── config/           # Configuración (DB, JWT, env)
│   │   ├── controllers/      # Controladores (auth, reservas, users, upload)
│   │   ├── db/               # Pool de conexión PostgreSQL
│   │   ├── middleware/       # Autenticación, validación, error handling
│   │   ├── models/           # Tipos TypeScript de modelos
│   │   ├── repositories/     # Acceso a datos (queries SQL)
│   │   ├── routes/           # Definición de rutas HTTP
│   │   ├── services/         # Lógica de negocio
│   │   ├── utils/            # Utilidades (responses, validators)
│   │   ├── uploads/          # Archivos subidos (imágenes)
│   │   ├── app.ts            # Configuración Express
│   │   └── index.ts          # Entry point del servidor
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Imágenes, logos, recursos estáticos
│   │   ├── components/       # Componentes reutilizables (legacy)
│   │   ├── components_new/   # Nuevos componentes refactorizados
│   │   ├── context/          # Context API (AuthContext)
│   │   ├── data/             # Datos mock/estáticos
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Layouts (MainLayout)
│   │   ├── pages/            # Páginas (Home, Reservas, Login, etc.)
│   │   ├── services/         # API client y servicios HTTP
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades (formatters, validators)
│   │   ├── App.tsx
│   │   ├── AppRouter.tsx     # Configuración de rutas
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── documentacion/            # Diagramas, documentos de diseño
├── PLAN_README.md            # Este documento
└── README.md                 # README raíz del proyecto
```

---

## Configuración Inicial

### Prerrequisitos

- Node.js ≥18.x y npm
- PostgreSQL ≥14.x instalado y corriendo
- Git (para control de versiones)

### Backend

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y completa:

   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/unideportes
   JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion
    JWT_EXPIRES_IN=8h
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Crear base de datos:**
   Ejecuta el script SQL de inicialización (ubicado en `backend/db/` o documentación) para crear tablas (usuarios, instalaciones, franjas_horarias, reservas, etc.).

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   Backend correrá en `http://localhost:5000`

### Frontend

1. **Instalar dependencias:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y completa:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key_google_maps
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   Frontend correrá en `http://localhost:5173`

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Autenticación

| Método | Ruta                | Descripción                          | Autenticación |
|--------|---------------------|--------------------------------------|---------------|
| POST   | `/auth/register`    | Registrar nuevo usuario              | No            |
| POST   | `/auth/login`       | Iniciar sesión                       | No            |
| GET    | `/auth/me`          | Obtener usuario actual               | Sí (JWT)      |
| POST   | `/auth/logout`      | Cerrar sesión (invalidar token)      | Sí (JWT)      |

**Payload `/auth/register`:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez Gómez",
  "correo": "juan.perez@unimagdalena.edu.co",
  "contrasena": "Password123!"
}
```
*Nota: El registro se restringe a direcciones de correo institucionales con dominio `@unimagdalena.edu.co`.*

**Payload `/auth/login`:**
```json
{
  "correo": "juan.perez@estudiante.edu.co",
  "contrasena": "Password123!"
}
```

**Respuesta exitosa `/auth/login`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "idUsuario": 1,
      "nombres": "Juan Carlos",
      "apellidos": "Pérez Gómez",
      "correo": "juan.perez@estudiante.edu.co",
      "rol": "estudiante"
    }
  }
}
```

### Reservas

| Método | Ruta                       | Descripción                     | Autenticación |
|--------|----------------------------|---------------------------------|---------------|
| GET    | `/reservas`                | Listar todas las reservas       | Sí (JWT)      |
| GET    | `/reservas/:id`            | Obtener detalle de reserva      | Sí (JWT)      |
| POST   | `/reservas`                | Crear nueva reserva             | Sí (JWT)      |
| PATCH  | `/reservas/:id`            | Modificar reserva existente     | Sí (JWT)      |
| POST   | `/reservas/:id/cancel`     | Cancelar reserva                | Sí (JWT)      |

**Payload `POST /reservas`:**
```json
{
  "idInstalacion": 2,
  "fechaReserva": "2026-04-10",
  "idFranjaInicio": 3,
  "idFranjaFin": 5,
  "equipoSolicitado": "Balones de fútbol (x3)",
  "notas": "Necesitamos conos para práctica"
}
```

**Payload `PATCH /reservas/:id`:**
```json
{
  "fechaReserva": "2026-04-12",
  "idFranjaInicio": 4,
  "idFranjaFin": 6,
  "equipoSolicitado": "Balones de baloncesto (x2)",
  "notas": "Cambio de horario aprobado"
}
```

**Payload `POST /reservas/:id/cancel`:**
```json
{
  "razonCancelacion": "Lluvia pronosticada, posponer evento"
}
```

### Upload

| Método | Ruta                       | Descripción                     | Autenticación |
|--------|----------------------------|---------------------------------|---------------|
| POST   | `/upload/image`            | Subir imagen genérica           | Sí (JWT)      |

**Payload:** `multipart/form-data` con campo `image` (archivo de imagen).

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/1712234567890-foto.jpg"
  }
}
```

### Usuarios

| Método | Ruta                       | Descripción                     | Autenticación |
|--------|----------------------------|---------------------------------|---------------|
| PATCH  | `/users/me/photo`          | Actualizar foto de perfil       | Sí (JWT)      |

**Payload:** `multipart/form-data` con campo `image`.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "fotoPerfilUrl": "/uploads/1712234567890-perfil.jpg"
  }
}
```

### Health

| Método | Ruta         | Descripción                          | Autenticación |
|--------|--------------|--------------------------------------|---------------|
| GET    | `/health`    | Verificar estado del servidor        | No            |

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2026-04-04T15:30:00.000Z"
  }
}
```

---

## Scripts Disponibles

### Backend

| Comando           | Descripción                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Ejecutar servidor en modo desarrollo (hot reload con tsx + nodemon) |
| `npm run build`   | Compilar TypeScript a JavaScript (carpeta `dist/`) |
| `npm start`       | Ejecutar servidor compilado (producción)     |
| `npm run lint`    | Ejecutar ESLint en código fuente            |
| `npm run typecheck` | Verificar tipos TypeScript sin compilar    |

### Frontend

| Comando           | Descripción                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Ejecutar dev server Vite en `http://localhost:5173` |
| `npm run build`   | Compilar TypeScript + construir build de producción |
| `npm run lint`    | Ejecutar ESLint en código fuente            |
| `npm run preview` | Preview del build de producción localmente  |

---

## Conceptos Clave

### Franjas Horarias
Las reservas no usan horas exactas sino **franjas predefinidas** (registros en tabla `franjas_horarias` con `id`, `horaInicio`, `horaFin`). Una reserva abarca desde `idFranjaInicio` hasta `idFranjaFin`, permitiendo reservas de múltiples franjas consecutivas.

**Ejemplo:**
- Franja 3: 10:00 - 11:00
- Franja 4: 11:00 - 12:00
- Franja 5: 12:00 - 13:00

Reserva con `idFranjaInicio=3` y `idFranjaFin=5` bloquea de 10:00 a 13:00.

### Estados de Reserva
- **pendiente:** Reserva creada, esperando confirmación/revisión.
- **confirmada:** Reserva aprobada y lista.
- **cancelada:** Reserva cancelada por usuario o admin (requiere `razonCancelacion`).
- **completada:** Reserva finalizada (posterior a fecha/hora de fin).

### Autenticación JWT
El token se devuelve en el body del login. El frontend lo almacena (localStorage/sessionStorage) y lo envía en header `Authorization: Bearer <token>` en cada request protegido. Backend valida token en middleware `authMiddleware`.

### Equipamiento Opcional
Campo `equipoSolicitado` en reservas permite especificar recursos adicionales (balones, conos, redes, etc.). Es opcional y de texto libre (en versiones futuras puede vincularse a tabla de equipamiento).

### Validación con Zod
Todos los payloads en controllers se validan con esquemas Zod antes de procesarse. Respuestas de error incluyen detalles de validación.

---

## Guía de Presentación (25-30 min)

### Estructura Recomendada

**1. Introducción (3 min)**
- Problema: Gestión manual de reservas deportivas en universidades (conflictos, doble reserva, falta de trazabilidad).
- Solución: Sistema web centralizado con autenticación, validación de disponibilidad, y gestión de estados.
- Alcance: MVP con auth, CRUD de reservas, franjas horarias, upload de imágenes.

**2. Demostración en Vivo (10-12 min)**
- Registro de usuario nuevo.
- Login y visualización de instalaciones disponibles.
- Creación de reserva con selección de fecha, franjas, equipamiento.
- Consulta de "Mis Reservas".
- Modificación de reserva existente.
- Cancelación de reserva con justificación.
- (Opcional) Upload de foto de perfil.

**3. Arquitectura y Stack (5-6 min)**
- Diagrama de arquitectura en capas (mostrar slide o pizarra).
- Explicación del flujo: Frontend (React) → API REST (Express) → Services → Repositories → PostgreSQL.
- Mencionar tecnologías clave: TypeScript para type safety, JWT para auth, Zod para validación.
- Arquitectura frontend: Context API para estado global, React Router para rutas protegidas.

**4. Decisiones Técnicas Relevantes (4-5 min)**
- **Franjas horarias vs horas libres:** Mayor control, evita solapamientos, facilita reglas de negocio.
- **Autenticación JWT:** Stateless, escalable, compatible con microservicios futuros.
- **Validación en capas:** Zod en controllers + validación de negocio en services (double-check).
- **Upload centralizado:** Ruta `/upload/image` reutilizable para múltiples features.
- **Estados de reserva:** Flujo claro (pendiente → confirmada/cancelada → completada).

**5. Desafíos y Aprendizajes (3-4 min)**
- **Desafío 1:** Validación de disponibilidad (verificar solapamiento de franjas en fecha).
- **Desafío 2:** Manejo de tokens en frontend (refresh, expiración, redirección).
- **Desafío 3:** Migración de código legacy (vanilla JS) a arquitectura moderna (React + TypeScript).
- **Aprendizaje:** Importancia de arquitectura en capas para mantenibilidad y testing futuro.

**6. Trabajo Futuro y Q&A (3-4 min)**
- **Mejoras planificadas:** Notificaciones por correo, calendario visual, roles avanzados (admin, coordinador), reportes de uso.
- **Escalabilidad:** Migración a Prisma ORM, implementación de cache (Redis), testing automatizado (Jest).
- **Despliegue:** VPS propio con nginx, SSL (Let's Encrypt), CI/CD con GitHub Actions.
- Abrir espacio para preguntas.

### Tips de Presentación

- **Preparar datos de prueba:** Usuario demo, instalaciones cargadas, franjas configuradas.
- **Conexión estable:** Tener backend y frontend corriendo antes de iniciar.
- **Slides minimalistas:** Diagramas claros, evitar texto excesivo.
- **Ensayar timing:** Practicar demo para evitar sorpresas en vivo.
- **Backup plan:** Screenshots o video grabado por si falla conexión/servidor.

---

## Convenciones de Código

### General
- **Tipado estricto:** TypeScript en modo strict (`noImplicitAny`, `strictNullChecks`).
- **Naming:** camelCase para variables/funciones, PascalCase para clases/componentes/tipos.
- **Commits:** Mensajes en inglés con formato `type(scope): description` (ej: `feat(auth): add JWT refresh endpoint`).
- **Secrets:** Jamás hardcodear credenciales; siempre usar `.env` y `.env.example`.

### Backend
- **Estructura:** Controller → Service → Repository → Database (nunca saltarse capas).
- **Responses:** Siempre formato `{ success: boolean, data?: any, message?: string, errors?: any }`.
- **Error handling:** Middleware centralizado, nunca swallow exceptions.
- **Logging:** Usar morgan en desarrollo, preparar para Winston/Pino en producción.

### Frontend
- **Componentes:** Funcionales con hooks, evitar class components.
- **Props typing:** Siempre definir interfaces para props.
- **Estado:** Context API para global, useState/useReducer para local.
- **API calls:** Centralizar en `services/`, manejar loading/error en UI.
- **Estilos:** Tailwind CSS utility classes, evitar CSS inline salvo excepciones.

---

## Troubleshooting Común

### Backend no inicia
- **Error:** `ECONNREFUSED` al conectar PostgreSQL.
  - **Solución:** Verificar que PostgreSQL esté corriendo (`systemctl status postgresql` o equivalente). Revisar `DATABASE_URL` en `.env`.

- **Error:** `JWT_SECRET is not defined`.
  - **Solución:** Asegurar que `.env` exista y contenga `JWT_SECRET`.

### Frontend no conecta con backend
- **Error:** CORS policy blocked.
  - **Solución:** Verificar `CORS_ORIGIN` en backend `.env` coincide con URL del frontend (ej: `http://localhost:5173`).

- **Error:** 401 Unauthorized en endpoints protegidos.
  - **Solución:** Verificar que token se envíe en header `Authorization: Bearer <token>`. Revisar que token no haya expirado.

### Upload de imágenes falla
- **Error:** `LIMIT_FILE_SIZE` excedido.
  - **Solución:** Reducir tamaño de imagen (límite configurado en multer, típicamente 5MB).

- **Error:** Ruta `/uploads/` no accesible.
  - **Solución:** Verificar que Express sirva estáticos con `express.static('uploads')` en `app.ts`.

---

## Recursos Adicionales

- **Documentación PostgreSQL:** https://www.postgresql.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vite.dev/
- **JWT.io:** https://jwt.io/ (decodificar/verificar tokens)
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Equipo y Contacto

Proyecto desarrollado como trabajo académico en equipo de 2-3 estudiantes de ingeniería/sistemas.

**Licencia:** Proyecto académico sin licencia comercial definida.

**Contribuciones:** Este proyecto es de uso académico. No se aceptan contribuciones externas al equipo asignado.

---

## Changelog Importante

- **v1.0.0 (Actual):** Migración completa a arquitectura React + TypeScript + Express. Implementación de autenticación JWT, CRUD de reservas, upload de imágenes, protección de rutas frontend.
- **v0.x (Legacy):** Versión inicial en HTML/CSS/JS vanilla (deprecada, código legacy en `frontend/components/`).

---

**Última actualización:** Abril 2026  
**Versión del documento:** 1.0
