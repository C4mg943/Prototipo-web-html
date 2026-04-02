-- =========================================================
-- 04_triggers.sql
-- UniDeportes - Funciones y triggers de auditoría
-- =========================================================

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

BEGIN;

-- ---------------------------------------------------------
-- Función genérica: log_auditoria()
-- id_usuario_actor: se toma de current_setting('app.current_user_id', true)
-- direccion_ip:     current_setting('app.current_ip', true)
-- agente_usuario:   current_setting('app.current_user_agent', true)
-- motivo:           current_setting('app.audit_reason', true)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION log_auditoria()
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
    -- Lectura segura de variables de sesión (si no existen, retorna NULL)
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

-- ---------------------------------------------------------
-- Trigger específico para usuarios:
-- solo audita cambios de id_rol o esta_activo en UPDATE
-- (INSERT/DELETE sí se auditan completos)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION log_auditoria_usuarios_protegida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF (OLD.id_rol IS DISTINCT FROM NEW.id_rol)
           OR (OLD.esta_activo IS DISTINCT FROM NEW.esta_activo) THEN
            PERFORM log_auditoria();
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM log_auditoria();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_auditoria();
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

-- Limpieza previa para idempotencia
DROP TRIGGER IF EXISTS trg_auditoria_reservas ON reservas;
DROP TRIGGER IF EXISTS trg_auditoria_solicitudes_equipo ON solicitudes_equipo;
DROP TRIGGER IF EXISTS trg_auditoria_bloqueos_instalaciones ON bloqueos_instalaciones;
DROP TRIGGER IF EXISTS trg_auditoria_usuarios ON usuarios;

-- Triggers principales
CREATE TRIGGER trg_auditoria_reservas
AFTER INSERT OR UPDATE OR DELETE ON reservas
FOR EACH ROW
EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trg_auditoria_solicitudes_equipo
AFTER INSERT OR UPDATE OR DELETE ON solicitudes_equipo
FOR EACH ROW
EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trg_auditoria_bloqueos_instalaciones
AFTER INSERT OR UPDATE OR DELETE ON bloqueos_instalaciones
FOR EACH ROW
EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trg_auditoria_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION log_auditoria_usuarios_protegida();

COMMIT;
