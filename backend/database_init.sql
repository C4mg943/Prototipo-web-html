-- ==========================================
-- SCRIPT DE INICIALIZACION DE BASE DE DATOS
-- UNIDEPORTES - PostgreSQL
-- ==========================================
-- Ejecutar con: psql -U postgres -d unideportes_db -f database_init.sql

-- NOTA: Se comenta la extensión inet porque el tipo INET es nativo en Postgres
-- CREATE EXTENSION IF NOT EXISTS inet;

-- ==========================================
-- TABLA: roles
-- ==========================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (codigo, nombre, descripcion) 
VALUES 
  ('ESTUDIANTE', 'Estudiante', 'Usuario estudiante con permisos básicos'),
  ('VIGILANTE', 'Vigilante', 'Personal de vigilancia con acceso a reservas del día'),
  ('ADMINISTRADOR', 'Administrador', 'Administrador del sistema con acceso total')
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- TABLA: usuarios
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
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

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo ON usuarios(codigo_institucional);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(id_rol);

-- ==========================================
-- TABLA: tipos_superficie
-- ==========================================
CREATE TABLE IF NOT EXISTS tipos_superficie (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO tipos_superficie (codigo, nombre, descripcion)
VALUES 
  ('CEMENTO', 'Cemento', 'Piso de cemento'),
  ('ASFALTO', 'Asfalto', 'Piso de asfalto'),
  ('GRASS_NAT', 'Grass natural', 'Grass natural'),
  ('GRASS_SIN', 'Grass sintético', 'Grass sintético'),
  ('MADERA', 'Madera', 'Piso de madera')
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- TABLA: deportes
-- ==========================================
CREATE TABLE IF NOT EXISTS deportes (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  etiqueta_campo VARCHAR(50),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO deportes (codigo, nombre, etiqueta_campo)
VALUES 
  ('FUTBOL', 'Fútbol', 'Campo'),
  ('BASKETBALL', 'Baloncesto', 'Cancha'),
  ('TENNIS', 'Tenis', 'Cancha'),
  ('VOLEIBOL', 'Voleibol', 'Cancha'),
  ('BALONMANO', 'Balonmano', 'Cancha'),
  ('BADMINTON', 'Bádminton', 'Cancha')
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- TABLA: escenarios
-- ==========================================
CREATE TABLE IF NOT EXISTS escenarios (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion_ubicacion TEXT,
  id_tipo_superficie BIGINT REFERENCES tipos_superficie(id),
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escenarios_superficie ON escenarios(id_tipo_superficie);

-- ==========================================
-- TABLA: instalaciones
-- ==========================================
CREATE TABLE IF NOT EXISTS instalaciones (
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

CREATE INDEX IF NOT EXISTS idx_instalaciones_escenario ON instalaciones(id_escenario);
CREATE INDEX IF NOT EXISTS idx_instalaciones_deporte ON instalaciones(id_deporte);

-- ==========================================
-- TABLA: franjas_horarias
-- ==========================================
CREATE TABLE IF NOT EXISTS franjas_horarias (
  id BIGSERIAL PRIMARY KEY,
  hora_inicio VARCHAR(8) NOT NULL,
  hora_fin VARCHAR(8) NOT NULL,
  orden_clasificacion INT NOT NULL UNIQUE,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO franjas_horarias (hora_inicio, hora_fin, orden_clasificacion)
VALUES 
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
  ('19:00:00', '20:00:00', 13)
ON CONFLICT (orden_clasificacion) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_franjas_orden ON franjas_horarias(orden_clasificacion);

-- ==========================================
-- TABLA: estados_reserva
-- ==========================================
CREATE TABLE IF NOT EXISTS estados_reserva (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  es_final BOOLEAN DEFAULT FALSE,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO estados_reserva (codigo, nombre, es_final)
VALUES 
  ('PENDIENTE', 'Pendiente', FALSE),
  ('CONFIRMADA', 'Confirmada', FALSE),
  ('INICIADA', 'Iniciada', FALSE),
  ('COMPLETADA', 'Completada', TRUE),
  ('CANCELADA', 'Cancelada', TRUE),
  ('NO_PRESENTO', 'No presentó', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- TABLA: reservas
-- ==========================================
CREATE TABLE IF NOT EXISTS reservas (
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

CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reservas_instalacion ON reservas(id_instalacion);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(id_estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_comienza ON reservas(comienza_en);

-- ==========================================
-- TABLA: elementos_equipo
-- ==========================================
CREATE TABLE IF NOT EXISTS elementos_equipo (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad_total INT NOT NULL,
  cantidad_disponible INT NOT NULL,
  esta_activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- TABLA: bloqueos_instalaciones
-- ==========================================
CREATE TABLE IF NOT EXISTS bloqueos_instalaciones (
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

CREATE INDEX IF NOT EXISTS idx_bloqueos_instalacion ON bloqueos_instalaciones(id_instalacion);
CREATE INDEX IF NOT EXISTS idx_bloqueos_fechas ON bloqueos_instalaciones(inicia_en, termina_en);

-- ==========================================
-- TABLA: registros_auditoria
-- ==========================================
CREATE TABLE IF NOT EXISTS registros_auditoria (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_actor BIGINT REFERENCES usuarios(id),
  accion VARCHAR(50) NOT NULL,
  nombre_entidad VARCHAR(100) NOT NULL,
  id_entidad VARCHAR(60),
  motivo VARCHAR(255),
  direccion_ip INET,
  agente_usuario VARCHAR(300),
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON registros_auditoria(id_usuario_actor);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON registros_auditoria(creado_en);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON registros_auditoria(nombre_entidad, id_entidad);

-- ==========================================
-- TABLA: logs_cambios_usuarios
-- ==========================================
CREATE TABLE IF NOT EXISTS logs_cambios_usuarios (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_afectado BIGINT NOT NULL REFERENCES usuarios(id),
  id_usuario_actor BIGINT REFERENCES usuarios(id),
  accion VARCHAR(50),
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  razon TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_usuario_afectado ON logs_cambios_usuarios(id_usuario_afectado);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_actor ON logs_cambios_usuarios(id_usuario_actor);

-- ==========================================
-- FUNCIÓN: log_auditoria_usuarios_protegida
-- ==========================================
CREATE OR REPLACE FUNCTION log_auditoria_usuarios_protegida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_id_usuario_actor BIGINT;
  v_direccion_ip INET;
  v_agente_usuario VARCHAR(300);
  v_motivo VARCHAR(255);
  v_accion VARCHAR(50);
  v_id_entidad VARCHAR(60);
  v_valores_anteriores JSONB;
  v_valores_nuevos JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NOT (
      (OLD.id_rol IS DISTINCT FROM NEW.id_rol)
      OR (OLD.esta_activo IS DISTINCT FROM NEW.esta_activo)
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  BEGIN
    v_id_usuario_actor := NULLIF(current_setting('app.current_user_id', true), '')::BIGINT;
  EXCEPTION WHEN OTHERS THEN
    v_id_usuario_actor := NULL;
  END;

  BEGIN
    v_direccion_ip := NULLIF(current_setting('app.current_ip', true), '')::INET;
  EXCEPTION WHEN OTHERS THEN
    v_direccion_ip := NULL;
  END;

  BEGIN
    v_agente_usuario := NULLIF(current_setting('app.current_user_agent', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_agente_usuario := NULL;
  END;

  BEGIN
    v_motivo := NULLIF(current_setting('app.audit_reason', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_motivo := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_accion := 'INSERT';
    v_id_entidad := COALESCE(NEW.id::TEXT, NULL);
    v_valores_anteriores := NULL;
    v_valores_nuevos := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'UPDATE';
    v_id_entidad := COALESCE(NEW.id::TEXT, OLD.id::TEXT, NULL);
    v_valores_anteriores := to_jsonb(OLD);
    v_valores_nuevos := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_accion := 'DELETE';
    v_id_entidad := COALESCE(OLD.id::TEXT, NULL);
    v_valores_anteriores := to_jsonb(OLD);
    v_valores_nuevos := NULL;
  ELSE
    RETURN NULL;
  END IF;

  INSERT INTO registros_auditoria (
    id_usuario_actor,
    accion,
    nombre_entidad,
    id_entidad,
    motivo,
    direccion_ip,
    agente_usuario,
    valores_anteriores,
    valores_nuevos,
    creado_en
  )
  VALUES (
    v_id_usuario_actor,
    v_accion,
    TG_TABLE_NAME,
    v_id_entidad,
    v_motivo,
    v_direccion_ip,
    v_agente_usuario,
    v_valores_anteriores,
    v_valores_nuevos,
    NOW()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

-- ==========================================
-- TRIGGER: tr_audit_usuarios
-- ==========================================
DROP TRIGGER IF EXISTS tr_audit_usuarios ON usuarios;

CREATE TRIGGER tr_audit_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION log_auditoria_usuarios_protegida();

-- ==========================================
-- INFORMACIÓN FINAL
-- ==========================================
-- Script completado. Se han creado:
-- - 13 tablas principales
-- - Datos base insertados en: roles, tipos_superficie, deportes, 
--   franjas_horarias, estados_reserva
-- - Índices para mejorar performance en queries frecuentes
-- - Función y trigger para auditoría de cambios en usuarios
-- 
-- BASE DE DATOS LISTA PARA USAR
