-- =========================================================
-- 03_seed_data.sql
-- UniDeportes - Datos iniciales de catálogos
-- Idempotente usando ON CONFLICT
-- =========================================================

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

BEGIN;

-- -----------------------------
-- ROLES (3)
-- -----------------------------
INSERT INTO roles (id, codigo, nombre, esta_activo)
VALUES
    (1, 'ESTUDIANTE', 'Estudiante', TRUE),
    (2, 'VIGILANTE',  'Vigilante', TRUE),
    (3, 'ADMINISTRADOR', 'Administrador', TRUE)
ON CONFLICT (id) DO UPDATE
SET codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- DEPORTES (8)
-- -----------------------------
INSERT INTO deportes (codigo, nombre, etiqueta_campo, esta_activo)
VALUES
    ('futbol',      'Fútbol',      'Cancha', TRUE),
    ('microfutbol', 'Microfútbol', 'Cancha', TRUE),
    ('tenis',       'Tenis',       'Cancha', TRUE),
    ('voleibol',    'Voleibol',    'Cancha', TRUE),
    ('patinaje',    'Patinaje',    'Pista',  TRUE),
    ('atletismo',   'Atletismo',   'Pista',  TRUE),
    ('softball',    'Softball',    'Campo',  TRUE),
    ('baloncesto',  'Baloncesto',  'Cancha', TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    etiqueta_campo = EXCLUDED.etiqueta_campo,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- TIPOS_SUPERFICIE (2)
-- -----------------------------
INSERT INTO tipos_superficie (codigo, nombre, esta_activo)
VALUES
    ('tierra',  'Tierra',  TRUE),
    ('cemento', 'Cemento', TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- ESTADOS_RESERVA (5)
-- -----------------------------
INSERT INTO estados_reserva (id, codigo, nombre, es_final, esta_activo)
VALUES
    (1, 'PENDIENTE',   'Pendiente',   FALSE, TRUE),
    (2, 'CONFIRMADA',  'Confirmada',  FALSE, TRUE),
    (3, 'CANCELADA',   'Cancelada',   TRUE,  TRUE),
    (4, 'COMPLETADA',  'Completada',  TRUE,  TRUE),
    (5, 'NO_PRESENTO', 'No presentó', TRUE,  TRUE)
ON CONFLICT (id) DO UPDATE
SET codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    es_final = EXCLUDED.es_final,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- FRANJAS_HORARIAS (13): 07:00 a 20:00
-- -----------------------------
INSERT INTO franjas_horarias (id, hora_inicio, hora_fin, orden_clasificacion, esta_activo)
VALUES
    (1,  '07:00', '08:00', 1,  TRUE),
    (2,  '08:00', '09:00', 2,  TRUE),
    (3,  '09:00', '10:00', 3,  TRUE),
    (4,  '10:00', '11:00', 4,  TRUE),
    (5,  '11:00', '12:00', 5,  TRUE),
    (6,  '12:00', '13:00', 6,  TRUE),
    (7,  '13:00', '14:00', 7,  TRUE),
    (8,  '14:00', '15:00', 8,  TRUE),
    (9,  '15:00', '16:00', 9,  TRUE),
    (10, '16:00', '17:00', 10, TRUE),
    (11, '17:00', '18:00', 11, TRUE),
    (12, '18:00', '19:00', 12, TRUE),
    (13, '19:00', '20:00', 13, TRUE)
ON CONFLICT (id) DO UPDATE
SET hora_inicio = EXCLUDED.hora_inicio,
    hora_fin = EXCLUDED.hora_fin,
    orden_clasificacion = EXCLUDED.orden_clasificacion,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- ESCENARIOS (7) desde canchas.json
-- -----------------------------
INSERT INTO escenarios (codigo, nombre, id_tipo_superficie, esta_activo)
SELECT v.codigo, v.nombre, ts.id, TRUE
FROM (
    VALUES
        ('escenario-softball',         'Cancha de Softball',         'tierra'),
        ('escenario-multiple-tierra',  'Cancha Múltiple Tierra',     'tierra'),
        ('escenario-doble-cemento',    'Cancha Doble Cemento',       'cemento'),
        ('escenario-cemento-mixto-1',  'Cancha Cemento Mixta 1',     'cemento'),
        ('escenario-cemento-mixto-2',  'Cancha Cemento Mixta 2',     'cemento'),
        ('escenario-cemento-mixto-3',  'Cancha Cemento Mixta 3',     'cemento'),
        ('escenario-futbol-tierra-2',  'Cancha Fútbol Tierra 2',     'tierra')
) AS v(codigo, nombre, codigo_superficie)
JOIN tipos_superficie ts ON ts.codigo = v.codigo_superficie
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    id_tipo_superficie = EXCLUDED.id_tipo_superficie,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- INSTALACIONES (~15)
-- Mapeadas 1:1 según configuración aprobada
-- -----------------------------
INSERT INTO instalaciones (id_escenario, id_deporte, codigo, nombre, esta_activo)
SELECT es.id, dp.id, i.codigo, i.nombre, TRUE
FROM (
    VALUES
        ('escenario-multiple-tierra', 'futbol',      'fac-futbol-1',       'Cancha Fútbol Tierra 1'),
        ('escenario-futbol-tierra-2', 'futbol',      'fac-futbol-2',       'Cancha Fútbol Tierra 2'),

        ('escenario-doble-cemento',   'microfutbol', 'fac-microfutbol-1',  'Cancha Microfútbol 1'),
        ('escenario-cemento-mixto-1', 'microfutbol', 'fac-microfutbol-2',  'Cancha Microfútbol 2'),
        ('escenario-cemento-mixto-2', 'microfutbol', 'fac-microfutbol-3',  'Cancha Microfútbol 3'),
        ('escenario-cemento-mixto-3', 'microfutbol', 'fac-microfutbol-4',  'Cancha Microfútbol 4'),

        ('escenario-doble-cemento',   'tenis',       'fac-tenis-1',        'Cancha Tenis 1'),

        ('escenario-doble-cemento',   'voleibol',    'fac-voleibol-1',     'Cancha Voleibol 1'),
        ('escenario-cemento-mixto-3', 'voleibol',    'fac-voleibol-2',     'Cancha Voleibol 2'),

        ('escenario-multiple-tierra', 'patinaje',    'fac-patinaje-1',     'Pista de Patinaje 1'),
        ('escenario-multiple-tierra', 'atletismo',   'fac-atletismo-1',    'Pista de Atletismo 1'),

        ('escenario-softball',        'softball',    'fac-softball-1',     'Campo Softball 1'),

        ('escenario-cemento-mixto-1', 'baloncesto',  'fac-baloncesto-1',   'Cancha Baloncesto 1'),
        ('escenario-cemento-mixto-2', 'baloncesto',  'fac-baloncesto-2',   'Cancha Baloncesto 2'),
        ('escenario-cemento-mixto-3', 'baloncesto',  'fac-baloncesto-3',   'Cancha Baloncesto 3')
) AS i(codigo_escenario, codigo_deporte, codigo, nombre)
JOIN escenarios es ON es.codigo = i.codigo_escenario
JOIN deportes dp ON dp.codigo = i.codigo_deporte
ON CONFLICT (codigo) DO UPDATE
SET id_escenario = EXCLUDED.id_escenario,
    id_deporte = EXCLUDED.id_deporte,
    nombre = EXCLUDED.nombre,
    esta_activo = EXCLUDED.esta_activo;

-- -----------------------------
-- ELEMENTOS_EQUIPO (8)
-- -----------------------------
INSERT INTO elementos_equipo (codigo, id_deporte, nombre, cantidad_total, cantidad_disponible, esta_activo)
SELECT e.codigo, dp.id, e.nombre, e.cantidad_total, e.cantidad_disponible, TRUE
FROM (
    VALUES
        ('pelotas-futbol',     'futbol',      'Pelotas de Fútbol',     10, 10),
        ('petos-futbol',       'futbol',      'Petos de Entrenamiento',20, 20),
        ('pelotas-tenis',      'tenis',       'Pelotas de Tenis',      20, 20),
        ('raquetas-tenis',     'tenis',       'Raquetas de Tenis',     15, 15),
        ('red-voleibol',       'voleibol',    'Red de Voleibol',        5,  5),
        ('balones-baloncesto', 'baloncesto',  'Balones de Baloncesto', 12, 12),
        ('bates-softball',     'softball',    'Bates de Softball',      8,  8),
        ('cronometro',         NULL,          'Cronómetro',             3,  3)
) AS e(codigo, codigo_deporte, nombre, cantidad_total, cantidad_disponible)
LEFT JOIN deportes dp ON dp.codigo = e.codigo_deporte
ON CONFLICT (codigo) DO UPDATE
SET id_deporte = EXCLUDED.id_deporte,
    nombre = EXCLUDED.nombre,
    cantidad_total = EXCLUDED.cantidad_total,
    cantidad_disponible = EXCLUDED.cantidad_disponible,
    esta_activo = EXCLUDED.esta_activo;

COMMIT;
