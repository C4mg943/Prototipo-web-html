# Resumen Rápido de Endpoints - UniDeportes

## 1. AUTENTICACIÓN (Público)

| Método | Ruta | Descripción | Autenticado |
|--------|------|-------------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener datos del usuario autenticado | Sí |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |

---

## 2. HEALTH CHECK (Público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado de la API |

---

## 3. USUARIO (Requiere autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/me` | Obtener perfil completo |
| PATCH | `/api/users/me` | Actualizar perfil (nombres, apellidos, teléfono) |
| PATCH | `/api/users/me/photo` | Subir foto de perfil |

---

## 4. RESERVAS (Requiere autenticación - rol: ESTUDIANTE)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reservas` | Listar mis reservas |
| GET | `/api/reservas/:id` | Obtener reserva por ID |
| POST | `/api/reservas` | Crear nueva reserva |
| PATCH | `/api/reservas/:id` | Actualizar reserva |
| POST | `/api/reservas/:id/cancel` | Cancelar reserva |

---

## 5. UPLOAD (Requiere autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload/image` | Subir imagen (jpg, png, jpeg) |

---

## 6. ADMIN - FRANJAS (Requiere autenticación - rol: ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/franjas` | Listar franjas horarias |
| POST | `/api/admin/franjas` | Crear franja horaria |
| PATCH | `/api/admin/franjas/:id` | Actualizar franja horaria |
| DELETE | `/api/admin/franjas/:id` | Eliminar franja horaria |

---

## 7. ADMIN - ESTADOS Y REFERENCIAS

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/estados-reserva` | Listar estados de reserva |
| GET | `/api/admin/tipos-superficie` | Listar tipos de superficie |
| GET | `/api/admin/escenarios/all` | Listar escenarios activos |
| GET | `/api/admin/deportes` | Listar deportes |

---

## 8. ADMIN - USUARIOS (Requiere autenticación - rol: ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | Listar todos los usuarios |
| GET | `/api/admin/usuarios/:id` | Obtener usuario por ID |
| POST | `/api/admin/usuarios` | Crear nuevo usuario |
| PATCH | `/api/admin/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/admin/usuarios/:id` | Eliminar usuario (soft delete) |

---

## 9. ADMIN - INSTALACIONES (Requiere autenticación - rol: ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/instalaciones` | Listar todas las instalaciones |
| POST | `/api/admin/instalaciones` | Crear instalación |
| PATCH | `/api/admin/instalaciones/:id` | Actualizar instalación |
| DELETE | `/api/admin/instalaciones/:id` | Eliminar instalación (soft delete) |

---

## 10. ADMIN - ESCENARIOS (Requiere autenticación - rol: ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/escenarios` | Listar escenarios |
| POST | `/api/admin/escenarios` | Crear escenario |
| PATCH | `/api/admin/escenarios/:id` | Actualizar escenario |
| DELETE | `/api/admin/escenarios/:id` | Eliminar escenario (soft delete) |

---

## 11. ADMIN - RESERVAS (Requiere autenticación - rol: ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/reservas` | Listar todas las reservas |
| GET | `/api/admin/reservas/:id` | Obtener reserva por ID |
| GET | `/api/admin/reservas/dia` | Reservas del día actual |
| PATCH | `/api/admin/reservas/:id` | Actualizar estado de reserva |

---

## 12. ADMIN - OTROS

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/equipamiento` | Listar equipamiento |
| GET | `/api/admin/bloqueos` | Listar bloqueos de instalaciones |
| GET | `/api/admin/estadisticas` | Estadísticas del dashboard |

---

## 13. VIGILANTE (Requiere autenticación - rol: VIGILANTE o ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/vigilante/reservas-hoy` | Reservas del día actual |
| GET | `/api/vigilante/reservas` | Reservas próximas (7 días) |
| GET | `/api/vigilante/todas-reservas` | Todas las reservas |
| GET | `/api/vigilante/instalaciones` | Instalaciones disponibles |
| POST | `/api/vigilante/reporte` | Reportar disponibilidad |
| POST | `/api/vigilante/reservas/:id/iniciar` | Iniciar reserva (verificar código) |

---

## ROLES Y PERMISOS

| Rol | ID | Acceso |
|-----|----|----|
| ESTUDIANTE | 1 | CRUD propias reservas, perfil |
| VIGILANTE | 2 | Listar reservas, verificar códigos, reportar |
| ADMIN | 3 | CRUD todo |

---

## ESTRUCTURA DE RESPUESTAS

### Éxito (200/201)
```json
{
  "success": true,
  "data": { /* contenido */ }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ /* array de errores si aplica */ ]
}
```

---

## HEADERS REQUERIDOS

### Autenticación
```
Authorization: Bearer <JWT_TOKEN>
```

### Content-Type (para requests con body)
```
Content-Type: application/json
```

### CORS
```
Origin: http://localhost:5173
```

---

## FORMATO DE DATOS

### Fechas
```
YYYY-MM-DD (para fechaReserva)
ISO 8601 (para timestamps: 2024-05-03T14:46:00.000Z)
```

### Horas
```
HH:MM:SS (para franjas: 07:00:00)
```

### Email
```
formato@unimagdalena.edu.co (requerido para institucional)
```

---

## CONSTANTES IMPORTANTES

### Estados de Reserva
- PENDIENTE = 1
- CONFIRMADA = 2
- INICIADA = 3 (aproximado)
- COMPLETADA = 4 (aprox)
- CANCELADA = 5 (aprox)
- NO_PRESENTO = 6 (aprox)

### Códigos
- Email debe terminar en: @unimagdalena.edu.co
- Password mínimo: 8 caracteres
- Token JWT expira en: 8 horas
- Códigos de verificación: 6 dígitos aleatorio

---

## FLOW TÍPICO DE USUARIO ESTUDIANTE

1. POST `/api/auth/register` → Obtiene token
2. POST `/api/reservas` → Crea reserva
3. GET `/api/reservas` → Lista sus reservas
4. PATCH `/api/reservas/:id` → Modifica si está PENDIENTE
5. POST `/api/reservas/:id/cancel` → Cancela si necesario

---

## FLOW TÍPICO DE VIGILANTE

1. GET `/api/vigilante/reservas-hoy` → Ve reservas del día
2. POST `/api/vigilante/reservas/:id/iniciar` → Verifica código
3. GET `/api/vigilante/todas-reservas` → Historial completo

---

## FLOW TÍPICO DE ADMIN

1. POST `/api/admin/usuarios` → Crea usuario
2. POST `/api/admin/escenarios` → Registra campo
3. POST `/api/admin/instalaciones` → Registra instalación
4. GET `/api/admin/reservas` → Supervisa reservas
5. GET `/api/admin/estadisticas` → Ve dashboard

