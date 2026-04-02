-- =========================================================
-- run_all.sql
-- Script maestro UniDeportes
-- Ejecuta todos los pasos en orden
-- =========================================================

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

\echo '=================================================='
\echo '   INICIANDO SETUP DE BASE DE DATOS UNIDEPORTES'
\echo '=================================================='

\echo ''
\echo '>> PASO 1: Ejecutando esquema (tablas y constraints)...'
\i '01_schema.sql'
\echo '✓ Esquema completado'

\echo ''
\echo '>> PASO 2: Ejecutando índices...'
\i '02_indexes.sql'
\echo '✓ Índices completados'

\echo ''
\echo '>> PASO 3: Ejecutando seed data (catálogos iniciales)...'
\i '03_seed_data.sql'
\echo '✓ Seed data completado'

\echo ''
\echo '>> PASO 4: Ejecutando triggers y funciones de auditoría...'
\i '04_triggers.sql'
\echo '✓ Triggers completados'

\echo ''
\echo '=================================================='
\echo '   ✓ SETUP COMPLETADO EXITOSAMENTE'
\echo '=================================================='
\echo ''
\echo 'Verifica la instalación ejecutando:'
\echo 'SELECT count(*) FROM roles;             -- debe ser 3'
\echo 'SELECT count(*) FROM deportes;          -- debe ser 8'
\echo 'SELECT count(*) FROM escenarios;        -- debe ser 7'
\echo 'SELECT count(*) FROM instalaciones;     -- debe ser 15'
\echo 'SELECT count(*) FROM franjas_horarias;  -- debe ser 13'
\echo ''
