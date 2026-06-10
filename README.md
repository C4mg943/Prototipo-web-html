# 🏟️ UniDeportes

**Sistema de Reserva de Escenarios Deportivos — Universidad del Magdalena**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📋 Descripción

UniDeportes es una plataforma web que permite a la comunidad universitaria reservar instalaciones deportivas de forma ágil y organizada. Resuelve la problemática de la reserva manual, la falta de visibilidad de disponibilidad en tiempo real y la duplicidad de reservas.

### Deportes disponibles

Fútbol · Microfútbol · Tenis · Voleibol · Patinaje · Atletismo · Softball · Baloncesto

---

## ✨ Características

### Autenticación y seguridad
- [x] Registro con correo institucional (`@unimagdalena.edu.co`)
- [x] Login con JWT (expiración configurable, 8h por defecto)
- [x] **Autenticación de dos factores (2FA)** via TOTP (Google Authenticator / Authy)
- [x] Código QR para configuración de 2FA
- [x] Código de verificación de 6 dígitos por reserva

### Gestión de reservas (Estudiante)
- [x] Crear reservas seleccionando instalación, fecha y franja horaria
- [x] Duración flexible: 1 a 3 horas
- [x] Consultar, modificar y cancelar reservas
- [x] Solicitar equipamiento opcional
- [x] Selector semanal de fechas

### Panel de vigilante
- [x] Visualizar reservas del día actual
- [x] Verificar código de verificación para iniciar una reserva
- [x] Reportar disponibilidad de instalaciones
- [x] Dashboard con indicadores clave

### Panel de administración
- [x] CRUD completo de usuarios, instalaciones, escenarios, deportes
- [x] Gestión de franjas horarias, equipamiento y bloqueos
- [x] Dashboard con estadísticas en tiempo real
- [x] Auditoría de cambios en usuarios (vía triggers PL/pgSQL)

### Experiencia de usuario
- [x] Diseño responsive (mobile-first)
- [x] Mapa interactivo con Google Maps
- [x] Subida de foto de perfil
- [x] Notificaciones visuales en frontend

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA)                      │
│        React 19 + TypeScript + Vite + Tailwind CSS       │
│                                                          │
│  Pages → Components → Services (fetch API) → Backend     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP REST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND (API)                       │
│            Node.js + Express 5 + TypeScript              │
│                                                          │
│  Routes → authMiddleware → Controller → Service →       │
│                                                          │
│  Service → Repository → PostgreSQL Pool                  │
└─────────────────────────┬───────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                          │
│          PostgreSQL 14+ — 13 tablas                      │
│          Triggers PL/pgSQL + índices                     │
└─────────────────────────────────────────────────────────┘
```

### Patrón backend: Controller → Service → Repository → Database

Cada capa tiene una responsabilidad única:
- **Controller**: Maneja request/response HTTP
- **Service**: Lógica de negocio y reglas de validación
- **Repository**: Consultas SQL a la base de datos
- **Middleware**: Autenticación JWT, autorización por rol, manejo global de errores, subida de archivos

---

## 👥 Roles del sistema

| Rol | ID | Acceso |
|---|---|---|
| **Estudiante** | 1 | Crear, listar, editar y cancelar sus propias reservas. Gestionar perfil y 2FA. |
| **Vigilante** | 2 | Listar reservas del día, verificar códigos de verificación, reportar disponibilidad. |
| **Administrador** | 3 | CRUD completo del sistema: usuarios, instalaciones, deportes, franjas, bloqueos, equipamiento. |

---

## 🛠️ Stack tecnológico

### Frontend (`/frontend`)

| Tecnología | Versión | Propósito |
|---|---|---|
| React | ^19.2.4 | Biblioteca UI |
| TypeScript | ~5.9.3 | Tipado estático |
| Vite | ^8.0.1 | Bundler y dev server |
| React Router DOM | ^7.13.2 | Enrutamiento SPA |
| Tailwind CSS | ^4.2.2 | Framework CSS utilitario |
| ESLint | ^9.39.4 | Linter |

### Backend (`/backend`)

| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 20+ | Runtime |
| TypeScript | ^6.0.2 | Tipado estático |
| Express | ^5.2.1 | Framework web |
| PostgreSQL (pg) | ^8.20.0 | Cliente de base de datos |
| jsonwebtoken | ^9.0.3 | Autenticación JWT |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| zod | ^4.3.6 | Validación de esquemas |
| multer | ^2.1.1 | Subida de archivos |
| helmet | ^8.1.0 | Seguridad HTTP |
| speakeasy | ^1.0.0 | TOTP para 2FA |
| qrcode | ^1.5.3 | Generación de códigos QR |
| resend | ^4.0.0 | Servicio de correo electrónico |

### Base de datos

| Componente | Detalle |
|---|---|
| Motor | PostgreSQL 14+ |
| Tablas | 13 (roles, usuarios, instalaciones, reservas, franjas_horarias, etc.) |
| Funciones | PL/pgSQL para triggers de auditoría |
| Índices | 10+ índices para optimización de consultas |

---

## 📁 Estructura del proyecto

```
/
├── backend/                          # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/                   # Variables de entorno
│   │   ├── controllers/              # Handlers HTTP
│   │   ├── db/                       # Pool de conexión y bootstrap
│   │   ├── middleware/               # JWT, errores, multer
│   │   ├── models/                   # Interfaces TypeScript
│   │   ├── repositories/            # Consultas SQL
│   │   ├── routes/                   # Definición de rutas
│   │   ├── services/                 # Lógica de negocio
│   │   ├── utils/                    # Utilidades (JWT, errores)
│   │   ├── app.ts                    # Configuración Express
│   │   └── index.ts                  # Punto de entrada
│   ├── database_init.sql             # Script completo de BD
│   ├── .env.example                  # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/                         # SPA (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── admin/                # Componentes del panel admin
│   │   │   ├── vigilante/            # Componentes del panel vigilante
│   │   │   └── ...                   # Componentes generales
│   │   ├── context/                  # AuthContext (React Context)
│   │   ├── data/                     # Datos de deportes e instalaciones
│   │   ├── hooks/                    # Custom hooks
│   │   ├── layouts/                  # Layouts por rol
│   │   ├── pages/                    # Páginas de la aplicación
│   │   │   ├── admin/                # 9 páginas de administración
│   │   │   ├── vigilante/            # 2 páginas de vigilante
│   │   │   └── ...                   # Páginas públicas
│   │   ├── services/                 # Llamadas a la API
│   │   ├── types/                    # Tipos TypeScript del dominio
│   │   ├── utils/                    # Utilidades
│   │   └── AppRouter.tsx             # Definición de rutas
│   ├── public/
│   │   └── assets/canchas/           # Imágenes de los 8 deportes
│   └── package.json
│
├── documentacion/
│   ├── casos de uso/                 # Diagramas UML (PlantUML)
│   └── database/                     # Diagrama entidad-relación
│
└── bd sql scrips camg/              # Backups de base de datos
```

---

## 🔧 Instalación y uso

### Requisitos previos

- **Node.js** v20 o superior
- **PostgreSQL** 14 o superior
- **npm** (incluido con Node.js)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/unideportes.git
cd unideportes
```

### 2. Base de datos

```bash
# Crear la base de datos
createdb -U postgres unideportes_db

# Ejecutar script de inicialización
psql -U postgres -d unideportes_db -f backend/database_init.sql
```

### 3. Backend

```bash
cd backend

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos:
#   DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc.

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:5000`.

### 4. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 5. Poblar datos de prueba (opcional)

```bash
cd backend
bash scripts/seed-users.sh
```

Esto crea 4 usuarios de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@unimagdalena.edu.co` | `Admin123*` |
| Vigilante | `vigilante@unimagdalena.edu.co` | `Vigi123*` |
| Estudiante 1 | `estudiante1@unimagdalena.edu.co` | `Estu123*` |
| Estudiante 2 | `estudiante2@unimagdalena.edu.co` | `Estu123*` |

---

## 🔐 Variables de entorno

### Backend (`.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:123456@localhost:5432/unideportes_db
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

---

## 📡 API endpoints principales

### Públicos
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check del servidor |

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Obtener usuario autenticado |
| `POST` | `/api/auth/logout` | Cerrar sesión |

### Usuario
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/users/me` | Perfil del usuario |
| `PATCH` | `/api/users/me` | Actualizar perfil |
| `PATCH` | `/api/users/me/photo` | Subir foto de perfil |

### Reservas (Estudiante)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/reservas` | Listar mis reservas |
| `POST` | `/api/reservas` | Crear reserva |
| `GET` | `/api/reservas/:id` | Detalle de reserva |
| `PATCH` | `/api/reservas/:id` | Actualizar reserva |
| `POST` | `/api/reservas/:id/cancel` | Cancelar reserva |

### Administración
| Método | Ruta | Descripción |
|---|---|---|
| `GET/POST/PATCH/DELETE` | `/api/admin/usuarios` | CRUD usuarios |
| `GET/POST/PATCH/DELETE` | `/api/admin/instalaciones` | CRUD instalaciones |
| `GET/POST/PATCH/DELETE` | `/api/admin/escenarios` | CRUD escenarios |
| `GET/POST` | `/api/admin/deportes` | CRUD deportes |
| `GET/POST/PATCH/DELETE` | `/api/admin/franjas` | CRUD franjas horarias |
| `GET` | `/api/admin/equipamiento` | Listar equipamiento |
| `GET/POST/PATCH/DELETE` | `/api/admin/bloqueos` | CRUD bloqueos |
| `GET/PATCH` | `/api/admin/reservas` | Gestionar reservas |
| `GET` | `/api/admin/estadisticas` | Dashboard stats |

### Vigilante
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/vigilante/reservas-hoy` | Reservas del día |
| `POST` | `/api/vigilante/reporte` | Reportar instalación |
| `POST` | `/api/vigilante/reservas/:id/iniciar` | Iniciar reserva con código |

---

## 🗄️ Base de datos

### Modelo entidad-relación

![Diagrama ER](documentacion/database/Diagrama%20er.png)

### Tablas principales (13)

| Tabla | Propósito |
|---|---|
| `roles` | Roles del sistema (ESTUDIANTE, VIGILANTE, ADMINISTRADOR) |
| `usuarios` | Usuarios registrados |
| `tipos_superficie` | Tipos de superficie (CEMENTO, ASFALTO, GRASS, etc.) |
| `deportes` | Deportes disponibles |
| `escenarios` | Campos o canchas deportivas |
| `instalaciones` | Instalaciones específicas por escenario y deporte |
| `franjas_horarias` | Bloques horarios (07:00 - 20:00) |
| `estados_reserva` | Estados del ciclo de vida de una reserva |
| `reservas` | Registro de reservas |
| `elementos_equipo` | Inventario de equipamiento deportivo |
| `bloqueos_instalaciones` | Mantenimiento y no disponibilidad |
| `registros_auditoria` | Auditoría general de cambios |
| `logs_cambios_usuarios` | Auditoría específica de cambios en usuarios |

---

## 📚 Documentación adicional

| Archivo | Contenido |
|---|---|
| [`backend/ESTRUCTURA_BACKEND.md`](backend/ESTRUCTURA_BACKEND.md) | Documentación exhaustiva del backend: arquitectura, modelos, servicios, endpoints, tablas, errores conocidos |
| [`backend/RESUMEN_ENDPOINTS.md`](backend/RESUMEN_ENDPOINTS.md) | Resumen de todos los endpoints por rol |
| [`backend/DATABASE_SETUP.md`](backend/DATABASE_SETUP.md) | Guía detallada de configuración de base de datos |
| [`documentacion/casos de uso/`](documentacion/casos%20de%20uso/) | Diagramas UML de casos de uso (PlantUML) |
| [`documentacion/database/Diagrama er.png`](documentacion/database/Diagrama%20er.png) | Diagrama entidad-relación |

---

## 📦 Scripts disponibles

### Backend

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor con recarga automática |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm run start` | Iniciar servidor en producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run typecheck` | Verificar tipos TypeScript |

### Frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo Vite |
| `npm run build` | Compilar para producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run preview` | Vista previa de compilación |

---

## 💡 Funcionalidades destacadas

### Autenticación de dos factores (2FA)

El sistema implementa 2FA mediante TOTP (Time-based One-Time Password):
- Configuración escaneando un código QR con Google Authenticator o Authy
- Códigos de 6 dígitos con ventana de tolerancia de ±30 segundos
- Deshabilitación segura con confirmación de contraseña

### Código de verificación por reserva

Cada reserva genera un código único de 6 dígitos que el vigilante verifica para confirmar que el estudiante se presentó.

### Selector semanal de fechas

Interfaz intuitiva que permite navegar entre semanas para seleccionar la fecha de reserva.

---

## ⚠️ Áreas de mejora conocidas

- **Tests automatizados**: No hay tests implementados actualmente
- **Contenedores Docker**: No hay Dockerfile ni docker-compose
- **Inyección de dependencias**: Las dependencias se instancian manualmente en cada ruta (sin contenedor IoC)
- **Constraint UNIQUE**: La restricción para evitar reservas duplicadas está comentada en la base de datos

---

## 🤝 Contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

---

## 👨‍💻 Desarrollado por

Proyecto académico — Universidad del Magdalena  
Ingeniería de Sistemas
