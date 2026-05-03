# Setup de Base de Datos - UniDeportes

## Pasos Rápidos

### 1. Crear la base de datos
```bash
createdb -U postgres unideportes_db
```

O si usando psql:
```sql
CREATE DATABASE unideportes_db;
```

### 2. Inicializar tablas y datos
```bash
psql -U postgres -d unideportes_db -f database_init.sql
```

### 3. Verificar creación
```bash
psql -U postgres -d unideportes_db -c "\dt"
```

Deberías ver 13 tablas creadas.

### 4. Configurar .env en el backend
```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/unideportes_db
```

### 5. Iniciar backend
```bash
npm run dev
```

El backend debería conectarse sin errores.

---

## Archivo de Inicialización

- `database_init.sql`: Script completo con todas las tablas, índices, funciones y triggers
- Contiene datos base para: roles, deportes, tipos_superficie, franjas_horarias, estados_reserva

---

## Estructura de Tablas Creadas

```
1.  roles                      - Tipos de usuarios (ESTUDIANTE, VIGILANTE, ADMINISTRADOR)
2.  usuarios                   - Datos de usuarios
3.  tipos_superficie           - Tipos de pisos (CEMENTO, ASFALTO, GRASS, etc.)
4.  deportes                   - Deportes disponibles
5.  escenarios                 - Campos/canchas
6.  instalaciones              - Instalaciones específicas
7.  franjas_horarias           - Horarios (07:00 a 20:00)
8.  estados_reserva            - Estados de las reservas
9.  reservas                   - Registro de reservas
10. elementos_equipo           - Equipamiento disponible
11. bloqueos_instalaciones     - Mantenimientos/no disponibilidad
12. registros_auditoria        - Auditoría de cambios
13. logs_cambios_usuarios      - Auditoría específica de usuarios
```

---

## Datos Base Insertados

### Roles (3)
- ESTUDIANTE (id: 1)
- VIGILANTE (id: 2)
- ADMINISTRADOR (id: 3)

### Deportes (6)
- FUTBOL
- BASKETBALL
- TENNIS
- VOLEIBOL
- BALONMANO
- BADMINTON

### Tipos de Superficie (5)
- CEMENTO
- ASFALTO
- GRASS_NAT
- GRASS_SIN
- MADERA

### Franjas Horarias (13)
- 07:00-08:00 hasta 19:00-20:00 (13 franjas de 1 hora cada una)

### Estados de Reserva (6)
- PENDIENTE
- CONFIRMADA
- INICIADA
- COMPLETADA
- CANCELADA
- NO_PRESENTO

---

## Primeros Pasos Después de la Inicialización

1. Registra escenarios a través de admin panel o directamente en BD:
```sql
INSERT INTO escenarios (codigo, nombre, id_tipo_superficie) 
VALUES ('CANCHA_A', 'Cancha A', 1);
```

2. Registra instalaciones:
```sql
INSERT INTO instalaciones (codigo, nombre, capacidad, id_escenario, id_deporte)
VALUES ('CANCHA_A_FUTBOL', 'Cancha A - Fútbol', 50, 1, 1);
```

3. Crea un usuario admin:
```sql
INSERT INTO usuarios (id_rol, codigo_institucional, nombre_usuario, apellido_usuario, 
                      correo_electronico, hash_contrasena)
VALUES (3, 'ADMIN001', 'Administrador', 'Sistema', 
        'admin@unimagdalena.edu.co', '$2a$10$...');
-- Nota: el hash debe ser generado con bcryptjs
```

---

## Troubleshooting

### Error: database "unideportes_db" does not exist
```bash
createdb -U postgres unideportes_db
```

### Error: permission denied for schema public
```sql
GRANT ALL ON SCHEMA public TO postgres;
```

### Las tablas no se crearon
```bash
# Verifica que el script se ejecutó sin errores
psql -U postgres -d unideportes_db -f database_init.sql 2>&1 | tail -20

# O importa línea por línea para ver dónde falla
psql -U postgres -d unideportes_db < database_init.sql
```

### El backend no se conecta
```bash
# Verifica la conexión desde CLI
psql -U postgres -d unideportes_db -c "SELECT 1"

# Verifica el .env tiene la URL correcta
cat .env | grep DATABASE_URL
```

---

## Variables de Entorno Requeridas

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:123456@localhost:5432/unideportes_db
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

---

## Comandos Útiles

```bash
# Conectar a la BD
psql -U postgres -d unideportes_db

# Listar tablas
\dt

# Ver estructura de una tabla
\d usuarios

# Contar registros
SELECT COUNT(*) FROM usuarios;

# Ver datos de roles
SELECT * FROM roles;

# Ver datos de franjas_horarias
SELECT * FROM franjas_horarias ORDER BY orden_clasificacion;
```

---

## Documentación Completa

Para entender toda la estructura del backend, ver: `ESTRUCTURA_BACKEND.md`
