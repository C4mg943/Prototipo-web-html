-- =========================================================
-- 02_indexes.sql
-- UniDeportes - Índices de rendimiento y consulta
-- =========================================================

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

BEGIN;

-- USUARIOS
CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_esta_activo ON usuarios(esta_activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_eliminado_en ON usuarios(eliminado_en);
CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_login_en ON usuarios(ultimo_login_en DESC);

-- ESCENARIOS / INSTALACIONES
CREATE INDEX IF NOT EXISTS idx_escenarios_id_tipo_superficie ON escenarios(id_tipo_superficie);
CREATE INDEX IF NOT EXISTS idx_instalaciones_id_escenario ON instalaciones(id_escenario);
CREATE INDEX IF NOT EXISTS idx_instalaciones_id_deporte ON instalaciones(id_deporte);
CREATE INDEX IF NOT EXISTS idx_instalaciones_esta_activo ON instalaciones(esta_activo);
CREATE UNIQUE INDEX IF NOT EXISTS uq_instalaciones_escenario_deporte_nombre ON instalaciones(id_escenario, id_deporte, nombre);

-- RESERVAS
CREATE INDEX IF NOT EXISTS idx_reservas_id_usuario ON reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reservas_instalacion_fecha ON reservas(id_instalacion, fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_id_estado ON reservas(id_estado);
CREATE INDEX IF NOT EXISTS idx_reservas_creado_en ON reservas(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_reservas_comienza_en ON reservas(comienza_en);
CREATE INDEX IF NOT EXISTS idx_reservas_termina_en ON reservas(termina_en);
CREATE INDEX IF NOT EXISTS idx_reservas_activas_por_instalacion_tiempo
    ON reservas(id_instalacion, comienza_en, termina_en)
    WHERE id_estado IN (1, 2);

-- ELEMENTOS DE EQUIPO
CREATE INDEX IF NOT EXISTS idx_elementos_equipo_id_deporte ON elementos_equipo(id_deporte);
CREATE INDEX IF NOT EXISTS idx_elementos_equipo_esta_activo ON elementos_equipo(esta_activo);

CREATE INDEX IF NOT EXISTS idx_solicitudes_equipo_id_reserva ON solicitudes_equipo(id_reserva);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipo_id_elemento ON solicitudes_equipo(id_elemento_equipo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipo_estado ON solicitudes_equipo(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipo_creado_en ON solicitudes_equipo(creado_en DESC);

-- BLOQUEOS DE INSTALACIONES
CREATE INDEX IF NOT EXISTS idx_bloqueos_instalaciones_id_instalacion ON bloqueos_instalaciones(id_instalacion);
CREATE INDEX IF NOT EXISTS idx_bloqueos_instalaciones_ventana_activa ON bloqueos_instalaciones(id_instalacion, inicia_en, termina_en) WHERE esta_activo = TRUE;

-- REGISTROS DE AUDITORÍA (requeridos)
CREATE INDEX IF NOT EXISTS idx_auditoria_actor_fecha ON registros_auditoria(id_usuario_actor, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON registros_auditoria(nombre_entidad, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON registros_auditoria(accion, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_creado_en ON registros_auditoria(creado_en DESC);

-- Opcionales JSONB (útiles para forense/filtrado por campos)
CREATE INDEX IF NOT EXISTS idx_auditoria_valores_anteriores_gin ON registros_auditoria USING GIN (valores_anteriores);
CREATE INDEX IF NOT EXISTS idx_auditoria_valores_nuevos_gin ON registros_auditoria USING GIN (valores_nuevos);

COMMIT;
