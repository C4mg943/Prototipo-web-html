# Estructura Completa del Backend Node.js - UniDeportes

## 1. ESTRUCTURA DE CARPETAS EN `/src`

```
src/
├── app.ts                           # Configuración de Express, rutas principales
├── index.ts                         # Punto de entrada, bootstrap
├── config/
│   └── env.ts                       # Validación y carga de variables de entorno
├── db/
│   ├── pool.ts                      # Conexión a PostgreSQL (pool de conexiones)
│   └── bootstrap.ts                 # Inicialización de BD y funciones PL/pgSQL
├── middleware/
│   ├── auth.middleware.ts           # JWT verification, requireAdmin, requireVigilante
│   ├── error.middleware.ts          # Manejo global de errores
│   └── upload.middleware.ts         # Multer para subida de imágenes
├── models/
│   ├── user.model.ts                # Interfaces de Usuario
│   └── reserva.model.ts             # Interfaces de Reserva y relacionadas
├── repositories/
│   ├── user.repository.ts           # Queries a BD (usuarios)
│   └── reserva.repository.ts        # Queries a BD (reservas)
├── services/
│   ├── auth.service.ts              # Lógica de registro, login, me, logout
│   ├── user.service.ts              # Actualización de perfil
│   └── reserva.service.ts           # CRUD de reservas
├── controllers/
│   ├── auth.controller.ts           # Handlers de auth endpoints
│   ├── user.controller.ts           # Handlers de user endpoints
│   ├── reserva.controller.ts        # Handlers de reserva endpoints
│   └── upload.controller.ts         # Handlers para subida de imágenes
├── routes/
│   ├── health.routes.ts             # GET /api/health
│   ├── auth.routes.ts               # POST /register, /login, GET /me, /logout
│   ├── user.routes.ts               # PATCH /me, PATCH /me/photo, GET /me
│   ├── reserva.routes.ts            # CRUD de reservas (estudiante)
│   ├── admin.routes.ts              # Endpoints administrativos
│   ├── vigilante.routes.ts          # Endpoints de vigilantes
│   └── upload.routes.ts             # POST /upload/image
└── utils/
    ├── api-error.ts                 # Clase personalizada de errores
    ├── auth.ts                      # generateAccessToken, verifyAccessToken
    └── (otros helpers si existen)
```

---

## 2. RUTAS Y ENDPOINTS

### 2.1 HEALTH CHECK (Público)
```
GET /api/health
Respuesta: { success: true, data: { status: 'ok', timestamp: ISO_STRING } }
```

### 2.2 AUTENTICACIÓN
```
POST /api/auth/register
Body: { nombres, apellidos, correo, contrasena }
Respuesta: { success: true, data: { token, usuario: {...} } }

POST /api/auth/login
Body: { correo, contrasena }
Respuesta: { success: true, data: { token, usuario: {...} } }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Respuesta: { success: true, data: { id, idRol, nombres, apellidos, correo, ... } }

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Respuesta: { success: true, message: 'Sesión cerrada exitosamente.' }
```

### 2.3 USUARIO (Requeriere autenticación)
```
GET /api/users/me
Headers: Authorization: Bearer <token>
Respuesta: { success: true, data: { usuarios completo } }

PATCH /api/users/me
Headers: Authorization: Bearer <token>
Body: { nombre_usuario?, apellido_usuario?, telefono? }
Respuesta: { success: true, data: { usuario actualizado } }

PATCH /api/users/me/photo
Headers: Authorization: Bearer <token>, multipart/form-data
Body: file (imagen)
Respuesta: { success: true, data: { fotoPerfilUrl } }
```

### 2.4 RESERVAS (Requiere autenticación)
```
GET /api/reservas
Headers: Authorization: Bearer <token>
Respuesta: { success: true, data: [ reservas del usuario ] }

GET /api/reservas/:id
Headers: Authorization: Bearer <token>
Respuesta: { success: true, data: { reserva } }

POST /api/reservas
Headers: Authorization: Bearer <token>
Body: {
  idInstalacion: number,
  fechaReserva: "YYYY-MM-DD",
  idFranjaInicio: number,
  idFranjaFin: number,
  equipoSolicitado?: boolean,
  notas?: string
}
Respuesta: { success: true, data: { reserva creada } }

PATCH /api/reservas/:id
Headers: Authorization: Bearer <token>
Body: { fechaReserva, idFranjaInicio, idFranjaFin, equipoSolicitado?, notas? }
Respuesta: { success: true, data: { reserva actualizada } }

POST /api/reservas/:id/cancel
Headers: Authorization: Bearer <token>
Body: { razonCancelacion: string }
Respuesta: { success: true, data: { reserva cancelada } }
```

### 2.5 UPLOAD (Requiere autenticación)
```
POST /api/upload/image
Headers: Authorization: Bearer <token>, multipart/form-data
Body: file (imagen)
Respuesta: { success: true, data: { url de la imagen subida } }
```

### 2.6 ADMIN (Requiere roleId = 3)

#### Franjas Horarias
```
GET /api/admin/franjas
RESPUESTA: [ { id, hora_inicio, hora_fin, orden_clasificacion, esta_activo } ]

POST /api/admin/franjas
BODY: { hora_inicio, hora_fin, orden_clasificacion }

PATCH /api/admin/franjas/:id
BODY: { hora_inicio?, hora_fin?, orden_clasificacion?, esta_activo? }

DELETE /api/admin/franjas/:id
(Soft delete: marca esta_activo = FALSE)
```

#### Estados de Reserva
```
GET /api/admin/estados-reserva
RESPUESTA: [ { id, codigo, nombre, es_final, esta_activo } ]

GET /api/admin/tipos-superficie
RESPUESTA: [ { id, codigo, nombre, esta_activo } ]

GET /api/admin/escenarios/all
RESPUESTA: [ { id, codigo, nombre, esta_activo } ]
```

#### Usuarios
```
GET /api/admin/usuarios
RESPUESTA: [ { id, id_rol, codigo_institucional, nombre_usuario, ... } ]

GET /api/admin/usuarios/:id

POST /api/admin/usuarios
BODY: { codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, 
        contrasena, id_rol, telefono? }

PATCH /api/admin/usuarios/:id
BODY: { nombre_usuario?, apellido_usuario?, telefono?, id_rol?, esta_activo? }

DELETE /api/admin/usuarios/:id
(Soft delete: marca esta_activo = FALSE)
```

#### Instalaciones
```
GET /api/admin/instalaciones
RESPUESTA: [ { id, codigo, nombre, capacidad, esta_activo, id_escenario, 
               nombre_escenario, id_deporte, nombre_deporte } ]

POST /api/admin/instalaciones
BODY: { codigo, nombre, id_escenario, id_deporte, capacidad }

PATCH /api/admin/instalaciones/:id
BODY: { codigo?, nombre?, id_escenario?, id_deporte?, capacidad?, esta_activo? }

DELETE /api/admin/instalaciones/:id
(Soft delete)
```

#### Escenarios
```
GET /api/admin/escenarios
RESPUESTA: [ { id, codigo, nombre, descripcion_ubicacion, esta_activo, 
               id_tipo_superficie, nombre_superficie } ]

POST /api/admin/escenarios
BODY: { codigo, nombre, id_tipo_superficie, descripcion_ubicacion }

PATCH /api/admin/escenarios/:id

DELETE /api/admin/escenarios/:id
(Soft delete)
```

#### Deportes
```
GET /api/admin/deportes
POST /api/admin/deportes
BODY: { codigo, nombre, etiqueta_campo }
```

#### Equipamiento
```
GET /api/admin/equipamiento
RESPUESTA: [ { id, codigo, nombre, cantidad_total, cantidad_disponible, esta_activo } ]
```

#### Bloqueos
```
GET /api/admin/bloqueos
RESPUESTA: [ { id, id_instalacion, razon, inicia_en, termina_en, esta_activo, 
               nombre_instalacion } ]
```

#### Reservas (admin)
```
GET /api/admin/reservas
GET /api/admin/reservas/:id
PATCH /api/admin/reservas/:id
BODY: { id_estado?, razon_cancelacion? }

GET /api/admin/reservas/dia
(Reservas de hoy en estado PENDIENTE o CONFIRMADA)
```

#### Estadísticas
```
GET /api/admin/estadisticas
RESPUESTA: {
  usuariosActivos: number,
  reservasPendientes: number,
  instalacionesDisponibles: number,
  reservasHoy: number
}
```

### 2.7 VIGILANTE (Requiere roleId = 2 o 3)
```
GET /api/vigilante/reservas-hoy
GET /api/vigilante/reservas
GET /api/vigilante/todas-reservas
GET /api/vigilante/instalaciones

POST /api/vigilante/reporte
BODY: { id_instalacion, fecha, estado, razon }

POST /api/vigilante/reservas/:id/iniciar
BODY: { codigo }
(Verifica código de verificación y marca como INICIADA)
```

---

## 3. SERVICIOS Y MODELOS

### 3.1 AuthService
```typescript
class AuthService {
  async register(input: RegisterInput): Promise<AuthSuccessResponse>
  async login(input: LoginInput): Promise<AuthSuccessResponse>
  async me(userId: number): Promise<AuthSuccessResponse['usuario']>
  async logout(): Promise<{ message: string }>
}
```

**Reglas de negocio:**
- Email debe ser institucional (@unimagdalena.edu.co)
- Password mínimo 8 caracteres (register), 6 (login)
- Hash con bcryptjs (salt: 10)
- Código institucional autogenerado: `${INICIALES}${ULTIMOS_6_DIGITOS_TIMESTAMP}`
- Rol por defecto: 1 (estudiante)

### 3.2 UserService
```typescript
class UserService {
  async updateMyPhoto(userId: number, photoUrl: string): Promise<{ fotoPerfilUrl: string }>
}
```

### 3.3 ReservaService
```typescript
class ReservaService {
  async createReserva(userId: number, input: CreateReservaInput): Promise<ReservaDto>
  async listMyReservas(userId: number): Promise<ReservaDto[]>
  async getMyReservaById(userId: number, reservaId: number): Promise<ReservaDto>
  async cancelMyReserva(userId: number, reservaId: number, input: CancelReservaInput): Promise<ReservaDto>
  async updateMyReserva(userId: number, reservaId: number, input: UpdateReservaInput): Promise<ReservaDto>
}
```

**Reglas de negocio:**
- Duración: 1 a 3 horas
- Fecha: no puede ser pasada
- Estado inicial: PENDIENTE
- Solo se puede actualizar/cancelar si está en PENDIENTE (no COMPLETADA, NO_PRESENTO, CANCELADA)
- Genera código de verificación: 6 dígitos aleatorio
- Verificación de propiedad: userId debe ser el dueño de la reserva

### 3.4 Modelos

**UserRecord:**
```typescript
interface UserRecord {
  id: number
  id_rol: number
  codigo_institucional: string
  nombre_usuario: string
  apellido_usuario: string
  correo_electronico: string
  hash_contrasena: string
  telefono: string | null
  foto_perfil_url: string | null
  esta_activo: boolean
}
```

**ReservaRecord:**
```typescript
interface ReservaRecord {
  id: number
  id_usuario: number
  id_instalacion: number
  id_estado: number
  fecha_reserva: string
  id_franja_inicio: number
  id_franja_fin: number
  comienza_en: Date
  termina_en: Date
  duracion_horas: number
  equipo_solicitado: boolean
  notas: string | null
  razon_cancelacion: string | null
  codigo_verificacion: string | null
  creado_en: Date
  actualizado_en: Date
}
```

**FranjaHorariaRecord:**
```typescript
interface FranjaHorariaRecord {
  id: number
  hora_inicio: string
  hora_fin: string
  orden_clasificacion: number
  esta_activo: boolean
}
```

**InstalacionRecord:**
```typescript
interface InstalacionRecord {
  id: number
  codigo: string
  nombre: string
  esta_activo: boolean
}
```

---

## 4. MIDDLEWARES

### 4.1 authMiddleware
- Valida token JWT en header `Authorization: Bearer <token>`
- Extrrae información del usuario (id, roleId, email)
- Asigna a `req.authUser`

### 4.2 requireAdmin
- Verifica que `req.authUser.roleId === 3`

### 4.3 requireVigilante
- Verifica que `req.authUser.roleId === 2 || roleId === 3`

### 4.4 errorMiddleware
- Manejo global de errores
- Detecta `ApiError`, `ZodError`, y otros errores
- Retorna respuesta JSON estándar

### 4.5 uploadMiddleware (multer)
- Soporta solo imágenes (jpg, jpeg, png)
- Destino: `/uploads`
- Campo: `file`

---

## 5. CONFIGURACIÓN

### Archivo `.env` (requerido):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:123456@localhost:5432/unideportes_db
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

### Variables en `env.ts`:
```typescript
interface EnvConfig {
  port: number
  nodeEnv: string
  databaseUrl: string
  jwtSecret: string
  jwtExpiresIn: string
  corsOrigin: string
}
```

### Stack de dependencias:
- **express**: Framework web
- **pg**: Cliente PostgreSQL
- **jsonwebtoken**: JWT
- **bcryptjs**: Hash de contraseñas
- **cors**: CORS
- **helmet**: Headers de seguridad
- **morgan**: HTTP request logging
- **multer**: Subida de archivos
- **zod**: Validación de esquemas

---

## 6. TABLAS PostgreSQL NECESARIAS

### TABLA: `roles`
```sql
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('ESTUDIANTE', 'Estudiante', 'Usuario estudiante'),
('VIGILANTE', 'Vigilante', 'Personal de vigilancia'),
('ADMINISTRADOR', 'Administrador', 'Administrador del sistema');
```

### TABLA: `usuarios`
```sql
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  id_rol BIGINT NOT NULL REFERENCES roles(id),
  codigo_institucional VARCHAR(50) UNIQUE NOT NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  apellido_usuario VARCHAR(100) NOT NULL,
  correo_electronico VARCHAR(255) UNIQUE NOT NULL,
  hash_contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  foto_perfil_url VARCHAR(500),
  esta_activo BOOLEAN DEFAULT TRUE,
  ultimo_login_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX idx_usuarios_codigo ON usuarios(codigo_institucional);
```

### TABLA: `tipos_superficie`
```sql
CREATE TABLE tipos_superficie (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO tipos_superficie (codigo, nombre) VALUES
('CEMENTO', 'Cemento'),
('ASFALTO', 'Asfalto'),
('GRASS', 'Grass natural'),
('SINTÉTICO', 'Grass sintético'),
('MADERA', 'Madera');
```

### TABLA: `deportes`
```sql
CREATE TABLE deportes (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  etiqueta_campo VARCHAR(50),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO deportes (codigo, nombre, etiqueta_campo) VALUES
('FUTBOL', 'Fútbol', 'Campo'),
('BASKETBALL', 'Baloncesto', 'Cancha'),
('TENNIS', 'Tenis', 'Cancha'),
('VOLEIBOL', 'Voleibol', 'Cancha');
```

### TABLA: `escenarios`
```sql
CREATE TABLE escenarios (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion_ubicacion TEXT,
  id_tipo_superficie BIGINT REFERENCES tipos_superficie(id),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);
```

### TABLA: `instalaciones`
```sql
CREATE TABLE instalaciones (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  capacidad INT,
  id_escenario BIGINT REFERENCES escenarios(id),
  id_deporte BIGINT REFERENCES deportes(id),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instalaciones_escenario ON instalaciones(id_escenario);
CREATE INDEX idx_instalaciones_deporte ON instalaciones(id_deporte);
```

### TABLA: `franjas_horarias`
```sql
CREATE TABLE franjas_horarias (
  id BIGSERIAL PRIMARY KEY,
  hora_inicio VARCHAR(8) NOT NULL,          -- HH:MM:SS
  hora_fin VARCHAR(8) NOT NULL,             -- HH:MM:SS
  orden_clasificacion INT NOT NULL,          -- 1, 2, 3... para ordenar
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO franjas_horarias (hora_inicio, hora_fin, orden_clasificacion) VALUES
('07:00:00', '08:00:00', 1),
('08:00:00', '09:00:00', 2),
('09:00:00', '10:00:00', 3),
('10:00:00', '11:00:00', 4),
('11:00:00', '12:00:00', 5),
('12:00:00', '13:00:00', 6),
('13:00:00', '14:00:00', 7),
('14:00:00', '15:00:00', 8),
('15:00:00', '16:00:00', 9),
('16:00:00', '17:00:00', 10),
('17:00:00', '18:00:00', 11),
('18:00:00', '19:00:00', 12),
('19:00:00', '20:00:00', 13);
```

### TABLA: `estados_reserva`
```sql
CREATE TABLE estados_reserva (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  es_final BOOLEAN DEFAULT FALSE,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO estados_reserva (codigo, nombre, es_final) VALUES
('PENDIENTE', 'Pendiente', FALSE),
('CONFIRMADA', 'Confirmada', FALSE),
('INICIADA', 'Iniciada', FALSE),
('COMPLETADA', 'Completada', TRUE),
('CANCELADA', 'Cancelada', TRUE),
('NO_PRESENTO', 'No presentó', TRUE);
```

### TABLA: `reservas`
```sql
CREATE TABLE reservas (
  id BIGSERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL REFERENCES usuarios(id),
  id_instalacion BIGINT NOT NULL REFERENCES instalaciones(id),
  id_estado BIGINT NOT NULL REFERENCES estados_reserva(id),
  fecha_reserva DATE NOT NULL,
  id_franja_inicio BIGINT NOT NULL REFERENCES franjas_horarias(id),
  id_franja_fin BIGINT NOT NULL REFERENCES franjas_horarias(id),
  comienza_en TIMESTAMP NOT NULL,
  termina_en TIMESTAMP NOT NULL,
  duracion_horas INT NOT NULL,
  equipo_solicitado BOOLEAN DEFAULT FALSE,
  notas TEXT,
  razon_cancelacion TEXT,
  codigo_verificacion VARCHAR(10),
  creado_por BIGINT REFERENCES usuarios(id),
  actualizado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX idx_reservas_instalacion ON reservas(id_instalacion);
CREATE INDEX idx_reservas_estado ON reservas(id_estado);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_reserva);
CREATE CONSTRAINT UNIQUE (id_instalacion, fecha_reserva, id_franja_inicio, id_franja_fin) 
  WHERE id_estado IN (1, 2);  -- PENDIENTE, CONFIRMADA
```

### TABLA: `elementos_equipo`
```sql
CREATE TABLE elementos_equipo (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad_total INT NOT NULL,
  cantidad_disponible INT NOT NULL,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);
```

### TABLA: `bloqueos_instalaciones`
```sql
CREATE TABLE bloqueos_instalaciones (
  id BIGSERIAL PRIMARY KEY,
  id_instalacion BIGINT NOT NULL REFERENCES instalaciones(id),
  razon TEXT NOT NULL,
  inicia_en TIMESTAMP NOT NULL,
  termina_en TIMESTAMP NOT NULL,
  creado_por BIGINT REFERENCES usuarios(id),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bloqueos_instalacion ON bloqueos_instalaciones(id_instalacion);
```

### TABLA: `registros_auditoria`
```sql
CREATE TABLE registros_auditoria (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_actor BIGINT REFERENCES usuarios(id),
  accion VARCHAR(50) NOT NULL,             -- INSERT, UPDATE, DELETE
  nombre_entidad VARCHAR(100) NOT NULL,     -- Tabla afectada
  id_entidad VARCHAR(60),                   -- ID del registro afectado
  motivo VARCHAR(255),
  direccion_ip INET,
  agente_usuario VARCHAR(300),
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auditoria_usuario ON registros_auditoria(id_usuario_actor);
CREATE INDEX idx_auditoria_fecha ON registros_auditoria(creado_en);
```

### TABLA: `logs_cambios_usuarios` (Auditoría de cambios en roles)
```sql
CREATE TABLE logs_cambios_usuarios (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_afectado BIGINT REFERENCES usuarios(id),
  id_usuario_actor BIGINT REFERENCES usuarios(id),
  accion VARCHAR(50),                       -- UPDATE_ROL, UPDATE_ESTADO, etc
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  razon TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);
```

---

## 7. TRIGGERS Y FUNCIONES PL/pgSQL

Se crea automáticamente en `bootstrap.ts`:

```sql
CREATE OR REPLACE FUNCTION log_auditoria_usuarios_protegida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
-- Registra cambios en usuarios (especialmente rol y estado)
-- Consulta variables de session para contexto: app.current_user_id, app.current_ip, etc.
END;
$$;

CREATE TRIGGER tr_audit_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION log_auditoria_usuarios_protegida();
```

---

## 8. ROLES Y PERMISOS

| Role ID | Código | Nivel | Acceso |
|---------|--------|-------|--------|
| 1 | ESTUDIANTE | Bajo | Crear/listar/editar/cancelar sus propias reservas |
| 2 | VIGILANTE | Medio | Listar reservas del día, verificar códigos, reportar disponibilidad |
| 3 | ADMINISTRADOR | Alto | CRUD completo (usuarios, instalaciones, franjas, deportes, etc.) |

---

## 9. ERRORES CONOCIDOS EN EL CÓDIGO

1. **admin.routes.ts línea 732:** Comentario menciona que hay un error con nombre "escenario" vs "escenarios"
2. **vigilante.routes.ts línea 37-49:** Field `estado` no mapeado correctamente (debería ser `id_estado`)
3. **La tabla no tiene constraint UNIQUE para evitar reservas duplicadas:** Está comentada

---

## 10. FLUJO DE AUTENTICACIÓN

1. **POST /api/auth/register**
   - Valida email institucional
   - Genera hash de contraseña (bcryptjs)
   - Auto-genera código institucional
   - Crea usuario con rol ESTUDIANTE
   - Retorna token JWT

2. **POST /api/auth/login**
   - Busca usuario por email
   - Verifica contraseña
   - Actualiza `ultimo_login_en`
   - Genera token JWT

3. **Todas las rutas protegidas**
   - Leen `Authorization: Bearer <token>`
   - Verifican JWT
   - Asignan `req.authUser`

4. **Token JWT payload:**
   ```json
   {
     "sub": 123,
     "roleId": 1,
     "email": "user@unimagdalena.edu.co",
     "iat": 1234567890,
     "exp": 1234671490
   }
   ```

---

## 11. INSTANCIACIÓN DE DEPENDENCIAS

Cada ruta instancia sus propias dependencias (patrón simple, no inyección de dependencias):

```typescript
// routes/auth.routes.ts
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
```

Este patrón se repite en todas las rutas. Para un proyecto empresarial, sería mejor usar un contenedor de IoC como Awilix.

---

## 12. VALIDACIÓN CON ZOD

- **registerSchema:** nombres, apellidos, correo (email), contrasena (min 8)
- **loginSchema:** correo (email), contrasena (min 6)
- Otros esquemas se pueden definir según necesidad

---

## 13. RESUMEN: QUÉ DEBES CREAR EN PostgreSQL

1. ✅ **roles** - Insert datos base (ESTUDIANTE, VIGILANTE, ADMINISTRADOR)
2. ✅ **usuarios** - La tabla principal de usuarios
3. ✅ **tipos_superficie** - Insert datos base (CEMENTO, ASFALTO, GRASS, etc.)
4. ✅ **deportes** - Insert datos base (FUTBOL, BASKETBALL, etc.)
5. ✅ **escenarios** - Campos/canchas (puede estar vacío al inicio)
6. ✅ **instalaciones** - Instalaciones específicas (puede estar vacío)
7. ✅ **franjas_horarias** - Insert datos base (horarios 07:00 a 20:00)
8. ✅ **estados_reserva** - Insert datos base (PENDIENTE, CONFIRMADA, etc.)
9. ✅ **reservas** - La tabla de reservas
10. ✅ **elementos_equipo** - Equipamiento disponible (puede estar vacío)
11. ✅ **bloqueos_instalaciones** - Registra mantenimientos/no disponibilidad
12. ✅ **registros_auditoria** - Auditoría de cambios
13. ✅ **logs_cambios_usuarios** - Auditoría específica de usuarios

**Total: 13 tablas principales**

---

## 14. SCRIPT INICIAL RECOMENDADO

El backend espera que estas tablas Y datos base ya existan en la base de datos. 

**Crear archivo: `database/init.sql` en la raíz del proyecto:**
- Contener todas las definiciones de tablas
- Inserts de datos maestros (roles, franjas horarias, estados de reserva, etc.)
- Triggers y funciones

**Ejecutar antes de iniciar el backend:**
```bash
psql -U postgres -d unideportes_db -f database/init.sql
```

