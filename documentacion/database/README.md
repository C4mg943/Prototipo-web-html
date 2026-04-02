# UniDeportes - Setup Base de Datos PostgreSQL

## 📋 Información General
- **Descripción:** Scripts SQL completos para modelo relacional UniDeportes (13 tablas)
- **Versión:** 1.0.0
- **Motor:** PostgreSQL 12+ (recomendado 13+)
- **Esquema:** `public`
- **Autor:** Atlas (Orquestador de OpenCode)
- **Fecha:** Abril 2026

---

## 🎯 Archivos SQL

```
documentacion/database/
├── 01_schema.sql        ← Tablas y constraints (DDL)
├── 02_indexes.sql       ← Índices de performance
├── 03_seed_data.sql     ← Datos iniciales (catálogos)
├── 04_triggers.sql      ← Funciones y triggers de auditoría
├── run_all.sql          ← Script maestro (ejecuta todos)
└── README.md            ← Este archivo
```

---

## 🚀 Instalación Rápida (pgAdmin)

### Opción A: Ejecutar archivos por separado (recomendado)

1. **Abre pgAdmin** → Conéctate a tu PostgreSQL
2. **Crea base de datos nueva:**
   ```sql
   CREATE DATABASE unideportes_db ENCODING 'UTF8' TEMPLATE template0;
   ```
3. **Abre Query Tool** conectado a `unideportes_db`
4. **Copia y pega** cada archivo en orden:
   - `01_schema.sql` (Enter para ejecutar)
   - `02_indexes.sql` (Enter para ejecutar)
   - `03_seed_data.sql` (Enter para ejecutar)
   - `04_triggers.sql` (Enter para ejecutar)

### Opción B: Ejecutar script maestro (si \i está habilitado)

1. Crea la base de datos (como arriba)
2. En Query Tool, ejecuta:
   ```sql
   \i 'ruta/absoluta/a/run_all.sql'
   ```

### Opción C: Línea de comando (psql)

```bash
# Crear base de datos
createdb -U postgres -E UTF8 unideportes_db

# Ejecutar todos los scripts en orden
psql -U postgres -d unideportes_db -f 01_schema.sql
psql -U postgres -d unideportes_db -f 02_indexes.sql
psql -U postgres -d unideportes_db -f 03_seed_data.sql
psql -U postgres -d unideportes_db -f 04_triggers.sql
```

---

## ✅ Verificación Post-Instalación

Ejecuta estas queries para confirmar que todo está instalado:

```sql
-- Verificar catálogos cargados
SELECT 'roles' as tabla, count(*) FROM roles
UNION ALL
SELECT 'sports', count(*) FROM sports
UNION ALL
SELECT 'surface_types', count(*) FROM surface_types
UNION ALL
SELECT 'reservation_statuses', count(*) FROM reservation_statuses
UNION ALL
SELECT 'time_slots', count(*) FROM time_slots
UNION ALL
SELECT 'venues', count(*) FROM venues
UNION ALL
SELECT 'facilities', count(*) FROM facilities
UNION ALL
SELECT 'equipment_items', count(*) FROM equipment_items;

-- Resultado esperado:
-- tabla                | count
-- -------------------+-------
-- roles               |     3
-- sports              |     8
-- surface_types       |     2
-- reservation_statuses|     5
-- time_slots          |    13
-- venues              |     7
-- facilities          |    15
-- equipment_items     |     8
```

**Si todos los `count` coinciden, ¡la instalación fue exitosa!** ✓

---

## 📊 Estructura de Tablas

### 13 Tablas Totales

#### 1. **roles** (Catálogo)
- Roles del sistema: STUDENT, GUARD, ADMIN
- PK: id (SMALLINT)

#### 2. **users** (Transaccional)
- Usuarios del sistema
- PK: id (BIGSERIAL), FK: role_id
- Características: soft delete (`deleted_at`), password hash

#### 3. **sports** (Catálogo)
- 8 deportes: futbol, microfutbol, tenis, voleibol, patinaje, atletismo, softball, baloncesto
- PK: id (SMALLINT)

#### 4. **surface_types** (Catálogo)
- Tipos de superficie: tierra, cemento
- PK: id (SMALLINT)

#### 5. **venues** (Catálogo/Transaccional)
- 7 escenarios deportivos
- PK: id (BIGSERIAL), FK: surface_type_id

#### 6. **facilities** (Catálogo/Transaccional)
- 15 canchas/pistas/campos específicas
- PK: id (BIGSERIAL), FK: venue_id, sport_id

#### 7. **time_slots** (Catálogo)
- 13 franjas horarias: 07:00-20:00 (bloques de 1h)
- PK: id (SMALLINT)

#### 8. **reservation_statuses** (Catálogo)
- Estados de reserva: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- PK: id (SMALLINT)

#### 9. **reservations** ⭐ (Principal)
- Reservas de usuarios
- PK: id (BIGSERIAL), FK: user_id, facility_id, status_id, start_slot_id, end_slot_id, created_by, updated_by
- **Constraint exclusión:** `EXCLUDE USING gist` evita solapamientos para reservas activas

#### 10. **equipment_items** (Catálogo/Transaccional)
- Implementos deportivos (pelotas, raquetas, etc.)
- PK: id (BIGSERIAL), FK: sport_id

#### 11. **equipment_requests** (Transaccional)
- Solicitudes de equipamiento ligadas a reserva
- PK: id (BIGSERIAL), FK: reservation_id, equipment_item_id

#### 12. **facility_blocks** (Transaccional)
- Bloqueos de canchas (mantenimiento, eventos)
- PK: id (BIGSERIAL), FK: facility_id

#### 13. **audit_logs** 📋 (Auditoría)
- Bitácora de cambios en el sistema (CU-20)
- PK: id (BIGSERIAL), FK: actor_user_id
- Registra: INSERT, UPDATE, DELETE, LOGIN, CANCEL

---

## 🔒 Características de Seguridad

### Validaciones en Base de Datos (CHECKs)
- ✅ Email válido (debe contener @)
- ✅ Duración de reserva 1-3 horas
- ✅ Horarios en orden (start < end)
- ✅ Inventario de equipamiento consistente
- ✅ Motivo de cancelación obligatorio

### Constraint de Exclusión (No Doble-Booking)
```sql
-- En tabla reservations
EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (status_id IN (1, 2));  -- Solo PENDING y CONFIRMED
```
**Efecto:** Imposible que 2 reservas activas se solapen en la misma cancha.

### Integridad Referencial
- ✅ Foreign keys con ON DELETE/UPDATE apropiadas
- ✅ Soft delete en `users` (deleted_at)
- ✅ Cascada en reservas cuando se cancela equipamiento

---

## 📊 Índices Clave

Se crearon **25+ índices** optimizados para:

| Caso de Uso | Índices |
|---|---|
| **Consultar disponibilidad (CU-03)** | `idx_reservations_facility_date`, `idx_reservations_active_by_facility_time` |
| **Crear reserva (CU-05)** | `idx_facilities_sport_id`, `idx_time_slots` |
| **Mis reservas (CU-06)** | `idx_reservations_user_id`, `idx_reservations_created_at` |
| **Reportes (CU-18)** | `idx_audit_entity`, `idx_audit_created_at` |
| **Auditoría (CU-20)** | `idx_audit_actor_date`, `idx_audit_action` |

---

## 🔄 Triggers de Auditoría

Automáticamente registra cambios en `audit_logs` cuando ocurren:

- **Crear/editar/cancelar reserva** → trigger `trg_audit_reservations`
- **Solicitar/aprobar equipamiento** → trigger `trg_audit_equipment_requests`
- **Bloquear/desbloquear cancha** → trigger `trg_audit_facility_blocks`
- **Cambiar rol/estado usuario** → trigger `trg_audit_users`

### Variables de Sesión (para auditoría)

Desde tu backend/API, establece estas variables antes de operar:

```sql
-- Ejemplo: Usuario 42, desde IP 10.0.0.1, cambio de estado
SET app.current_user_id = '42';
SET app.current_ip = '10.0.0.1';
SET app.current_user_agent = 'Mozilla/5.0 (Windows; U; Windows NT 10.0...)';
SET app.audit_reason = 'Cambio de disponibilidad notificado por vigilante';

-- Ahora cualquier INSERT/UPDATE/DELETE registrará estos datos
INSERT INTO reservations (...) VALUES (...);  -- Se audita automáticamente
```

Si **no estableces** estas variables, los campos quedan como `NULL` (modo sistema).

---

## 📈 Información para Desarrolladores

### Conexión desde Node.js + Prisma

```javascript
// .env
DATABASE_URL="postgresql://user:password@localhost:5432/unideportes_db"

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Usar en app
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ejemplo: crear reserva
await prisma.reservations.create({
  data: {
    user_id: 1,
    facility_id: 1,
    status_id: 1,  // PENDING
    reservation_date: '2026-04-15',
    start_slot_id: 1,
    end_slot_id: 3,  // 3 horas
    start_at: new Date('2026-04-15T07:00:00Z'),
    end_at: new Date('2026-04-15T10:00:00Z'),
    duration_hours: 3,
    created_by: 1,
  }
});
```

### Conexión desde FastAPI + SQLAlchemy

```python
# requirements.txt
sqlalchemy==2.0.23
psycopg2-binary==2.9.9

# models.py
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "postgresql://user:password@localhost/unideportes_db"
engine = create_engine(DATABASE_URL)

# Usar en app
from sqlalchemy.orm import Session
db = Session(bind=engine)

# Ejemplo: crear reserva
new_reservation = Reservations(
    user_id=1,
    facility_id=1,
    status_id=1,  # PENDING
    # ... resto de campos
)
db.add(new_reservation)
db.commit()
```

---

## 🆘 Troubleshooting

### Error: `btree_gist extension does not exist`
```sql
CREATE EXTENSION btree_gist;
```

### Error: `permission denied for schema public`
Asegúrate que el usuario de PostgreSQL tenga permisos:
```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Error: `duplicate key value violates unique constraint`
Significa que intentaste insertar datos que ya existen (idempotencia). Usa `ON CONFLICT` (ya incluido en seed_data.sql).

### Las reservas se pueden sobreponer
Comprueba que:
1. El constraint de exclusión existe: `\d reservations`
2. Las reservas tienen `status_id IN (1,2)` (PENDING o CONFIRMED)
3. Los ranges de tiempo se superponen realmente

---

## 🔄 Actualizar Catálogos

Si agregas nuevos deportes, escenarios, etc.:

```sql
-- Agregar nuevo deporte
INSERT INTO sports (code, name, field_label, is_active)
VALUES ('handball', 'Balonmano', 'Cancha', TRUE);

-- Agregar nueva cancha
INSERT INTO facilities (venue_id, sport_id, code, name, is_active)
VALUES (1, (SELECT id FROM sports WHERE code = 'handball'), 'fac-handball-1', 'Cancha Balonmano 1', TRUE);
```

---

## 📞 Soporte

Para dudas sobre:
- **SQL/DDL:** Revisá `01_schema.sql` y comentarios en cada tabla
- **Índices:** Consultá `02_indexes.sql`
- **Triggers:** Revisá `04_triggers.sql`
- **Integridad de datos:** Chequeá los CHECKs en `01_schema.sql`

---

## ✨ Notas Finales

- ✅ **Profesional:** SQL listo para producción
- ✅ **Idempotente:** Puedes ejecutar múltiples veces sin problemas
- ✅ **Escalable:** Índices y estructura optimizada para crecimiento
- ✅ **Auditable:** Todo cambio importante se registra automáticamente
- ✅ **Documentado:** Comentarios claros en el código SQL

**¡Listo para usar con tu backend!** 🚀

---

**Última actualización:** Abril 2026  
**Versión DB:** 1.0.0  
**Estado:** Producción
