import fs from 'fs';
import path from 'path';
import { pool } from './pool';

export async function ensureDatabaseCompatibility(): Promise<void> {
  console.log('Checking database initialization...');
  try {
    const sqlPath = path.join(process.cwd(), 'database_init.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      console.log('Running database_init.sql to ensure tables exist...');
      await pool.query(sqlContent);
      console.log('Database initialized successfully.');
    } else {
      console.log('database_init.sql not found at', sqlPath);
    }
  } catch (error) {
    console.error('Error running database_init.sql:', error);
  }

  await pool.query(`
    ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS foto_perfil_url VARCHAR(500);
  `);

  await pool.query(`
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
  `);
}
