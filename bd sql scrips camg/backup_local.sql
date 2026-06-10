--
-- PostgreSQL database dump
--

\restrict IIR3muyg8tBTEtBwFeI6DgOlx8ZHykb0oTFpMXEYcF2RFE9FUP7ewmsX8lmMSxK

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: deportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportes (id, codigo, nombre, etiqueta_campo, esta_activo, creado_en) FROM stdin;
1	FUTBOL	Fútbol	Campo	t	2026-05-03 15:03:38.570432
2	BASKETBALL	Baloncesto	Cancha	t	2026-05-03 15:03:38.570432
3	TENNIS	Tenis	Cancha	t	2026-05-03 15:03:38.570432
4	VOLEIBOL	Voleibol	Cancha	t	2026-05-03 15:03:38.570432
5	BALONMANO	Balonmano	Cancha	t	2026-05-03 15:03:38.570432
6	BADMINTON	Bádminton	Cancha	t	2026-05-03 15:03:38.570432
7	MICROFUTBOL	Microfútbol	Cancha	t	2026-05-04 06:33:43.006974
8	PATINAJE	Patinaje	Pista	t	2026-05-04 06:33:43.006974
9	ATLETISMO	Atletismo	Pista	t	2026-05-04 06:33:43.006974
10	SOFTBALL	Softball	Campo	t	2026-05-04 06:33:43.006974
11	BALONCESTO	Baloncesto	Cancha	t	2026-05-04 06:33:43.006974
\.


--
-- Data for Name: tipos_superficie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_superficie (id, codigo, nombre, descripcion, esta_activo, creado_en) FROM stdin;
1	CEMENTO	Cemento	Piso de cemento	t	2026-05-03 15:03:38.570432
2	ASFALTO	Asfalto	Piso de asfalto	t	2026-05-03 15:03:38.570432
3	GRASS_NAT	Grass natural	Grass natural	t	2026-05-03 15:03:38.570432
4	GRASS_SIN	Grass sintético	Grass sintético	t	2026-05-03 15:03:38.570432
5	MADERA	Madera	Piso de madera	t	2026-05-03 15:03:38.570432
\.


--
-- Data for Name: escenarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.escenarios (id, codigo, nombre, descripcion_ubicacion, id_tipo_superficie, esta_activo, creado_en, actualizado_en) FROM stdin;
1	ESC-001	Escenario Principal	Bloque A	1	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
2	ESC-002	Escenario Secundario	Bloque B	2	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
3	ESC-FT-001	Cancha Múltiple Tierra	Zona Tierra	1	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
4	ESC-FT-002	Cancha Fútbol Tierra 2	Zona Tierra	1	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
5	ESC-DC-001	Cancha Doble Cemento	Zona Cemento	2	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
6	ESC-CM-001	Cancha Cemento Mixta 1	Zona Cemento	2	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
7	ESC-CM-002	Cancha Cemento Mixta 2	Zona Cemento	2	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
8	ESC-CM-003	Cancha Cemento Mixta 3	Zona Cemento	2	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
9	ESC-SB-001	Cancha de Softball	Zona Softball	3	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
\.


--
-- Data for Name: instalaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instalaciones (id, codigo, nombre, capacidad, id_escenario, id_deporte, esta_activo, creado_en, actualizado_en) FROM stdin;
1	INST-001	Cancha Fútbol Tierra 1	22	3	1	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
2	INST-002	Cancha Fútbol Tierra 2	22	4	1	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
3	INST-003	Cancha Microfútbol 1	12	5	7	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
4	INST-004	Cancha Microfútbol 2	12	6	7	t	2026-05-04 06:24:38.895484	2026-05-04 06:24:38.895484
5	INST-005	Cancha Microfútbol 3	12	7	7	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
6	INST-006	Cancha Microfútbol 4	12	8	7	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
7	INST-007	Cancha Tenis 1	4	5	3	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
8	INST-008	Cancha Voleibol 1	12	5	4	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
9	INST-009	Cancha Voleibol 2	12	8	4	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
10	INST-010	Pista de Patinaje 1	30	3	8	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
11	INST-011	Pista de Atletismo 1	40	3	9	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
12	INST-012	Campo Softball 1	18	9	10	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
13	INST-013	Cancha Baloncesto 1	10	6	11	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
14	INST-014	Cancha Baloncesto 2	10	7	11	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
15	INST-015	Cancha Baloncesto 3	10	8	11	t	2026-05-04 06:33:43.006974	2026-05-04 06:33:43.006974
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, codigo, nombre, descripcion, esta_activo, creado_en) FROM stdin;
1	ESTUDIANTE	Estudiante	Usuario estudiante con permisos básicos	t	2026-05-03 15:03:38.570432
2	VIGILANTE	Vigilante	Personal de vigilancia con acceso a reservas del día	t	2026-05-03 15:03:38.570432
3	ADMINISTRADOR	Administrador	Administrador del sistema con acceso total	t	2026-05-03 15:03:38.570432
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, hash_contrasena, telefono, foto_perfil_url, esta_activo, ultimo_login_en, creado_en, actualizado_en) FROM stdin;
4	1	AR080699	Andres	Rojas	user2@unimagdalena.edu.co	$2b$10$Xtjkd3zbMZ/iNf1WnAMABePljdG3o7hfDHGlQ1RMs2JlOOoENjx2e	\N	\N	t	\N	2026-05-03 15:11:20.699371	2026-05-03 15:11:20.699371
1	3	AS080436	Admin	System	admin@unimagdalena.edu.co	$2b$10$l1ydjzUFT/glIuOksK5Cse06/GPBJX7LUzV6LvSjGsEb3ZNaVuQEO	\N	\N	t	2026-05-04 07:24:36.527766	2026-05-03 15:11:20.437326	2026-05-04 07:24:36.527766
2	2	CV080536	Carlos	Vega	vigilante@unimagdalena.edu.co	$2b$10$MD9K5LBo8OirAxw0opY0QuQDH0I2rU0z0yfRrLvYYWeSAlr0OIcGi	\N	\N	t	2026-05-04 07:25:42.869851	2026-05-03 15:11:20.536812	2026-05-04 07:25:42.869851
5	1	ABC123DE	Camilo	Monsalve	camilomonsalveag@unimagdalena.edu.co	$2b$10$ZsxZTocZpIspZUy9UVKgfeuox/SZ7JOecJqG56cC2Xwb14roLw2ge	3113331173	\N	t	2026-05-04 07:26:21.489752	2026-05-04 06:45:23.102213	2026-05-04 07:26:21.489752
3	1	LP080619	Laura	Perez	user1@unimagdalena.edu.co	$2b$10$XRxcZG1nZ/0a1kUduo6p6edmFJprX.1YfbCUm6NKBVO6JFDvAkocW	\N	\N	t	2026-05-04 07:26:26.033833	2026-05-03 15:11:20.62017	2026-05-04 07:26:26.033833
\.


--
-- Data for Name: bloqueos_instalaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloqueos_instalaciones (id, id_instalacion, razon, inicia_en, termina_en, creado_por, esta_activo, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: elementos_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.elementos_equipo (id, codigo, nombre, cantidad_total, cantidad_disponible, esta_activo, creado_en, actualizado_en) FROM stdin;
1	BALON-FT	Balón de Fútbol	20	20	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
2	BALON-BK	Balón de Baloncesto	15	15	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
3	BALON-VB	Balón de Voleibol	12	12	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
4	BALON-TN	Pelotas de Tenis (tubo)	30	30	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
5	RED-VB	Red de Voleibol	6	6	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
6	RAQ-TN	Raquetas de Tenis	16	16	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
7	CON-ENT	Conos de Entrenamiento	50	50	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
8	CHAL-ENT	Chalecos de Entrenamiento	40	40	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
9	SILB-AR	Silbatos de Árbitro	10	10	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
10	GUAN-AR	Guantes de Arquero	8	8	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
11	PET-AG	Petos de entrenamiento	30	30	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
12	BATE-SB	Bates de Softball	8	8	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
13	CASC-SB	Cascos de Softball	10	10	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
14	PAT-SET	Set de Patines	25	25	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
15	CRON-MET	Cronómetros	12	12	t	2026-05-04 06:38:00.173283	2026-05-04 06:38:00.173283
\.


--
-- Data for Name: estados_reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_reserva (id, codigo, nombre, es_final, esta_activo, creado_en) FROM stdin;
1	PENDIENTE	Pendiente	f	t	2026-05-03 15:03:38.570432
2	CONFIRMADA	Confirmada	f	t	2026-05-03 15:03:38.570432
3	INICIADA	Iniciada	f	t	2026-05-03 15:03:38.570432
4	COMPLETADA	Completada	t	t	2026-05-03 15:03:38.570432
5	CANCELADA	Cancelada	t	t	2026-05-03 15:03:38.570432
6	NO_PRESENTO	No presentó	t	t	2026-05-03 15:03:38.570432
\.


--
-- Data for Name: franjas_horarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.franjas_horarias (id, hora_inicio, hora_fin, orden_clasificacion, esta_activo, creado_en) FROM stdin;
1	07:00:00	08:00:00	1	t	2026-05-03 15:03:38.570432
2	08:00:00	09:00:00	2	t	2026-05-03 15:03:38.570432
3	09:00:00	10:00:00	3	t	2026-05-03 15:03:38.570432
4	10:00:00	11:00:00	4	t	2026-05-03 15:03:38.570432
5	11:00:00	12:00:00	5	t	2026-05-03 15:03:38.570432
6	12:00:00	13:00:00	6	t	2026-05-03 15:03:38.570432
7	13:00:00	14:00:00	7	t	2026-05-03 15:03:38.570432
8	14:00:00	15:00:00	8	t	2026-05-03 15:03:38.570432
9	15:00:00	16:00:00	9	t	2026-05-03 15:03:38.570432
10	16:00:00	17:00:00	10	t	2026-05-03 15:03:38.570432
11	17:00:00	18:00:00	11	t	2026-05-03 15:03:38.570432
12	18:00:00	19:00:00	12	t	2026-05-03 15:03:38.570432
13	19:00:00	20:00:00	13	t	2026-05-03 15:03:38.570432
\.


--
-- Data for Name: logs_cambios_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_cambios_usuarios (id, id_usuario_afectado, id_usuario_actor, accion, valores_anteriores, valores_nuevos, razon, creado_en) FROM stdin;
\.


--
-- Data for Name: registros_auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registros_auditoria (id, id_usuario_actor, accion, nombre_entidad, id_entidad, motivo, direccion_ip, agente_usuario, valores_anteriores, valores_nuevos, creado_en) FROM stdin;
1	\N	INSERT	usuarios	1	\N	\N	\N	\N	{"id": 1, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.437326", "esta_activo": true, "actualizado_en": "2026-05-03T15:11:20.437326", "nombre_usuario": "Admin", "foto_perfil_url": null, "hash_contrasena": "$2b$10$l1ydjzUFT/glIuOksK5Cse06/GPBJX7LUzV6LvSjGsEb3ZNaVuQEO", "ultimo_login_en": null, "apellido_usuario": "System", "correo_electronico": "admin@unimagdalena.edu.co", "codigo_institucional": "AS080436"}	2026-05-03 15:11:20.437326
2	\N	INSERT	usuarios	2	\N	\N	\N	\N	{"id": 2, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.536812", "esta_activo": true, "actualizado_en": "2026-05-03T15:11:20.536812", "nombre_usuario": "Carlos", "foto_perfil_url": null, "hash_contrasena": "$2b$10$MD9K5LBo8OirAxw0opY0QuQDH0I2rU0z0yfRrLvYYWeSAlr0OIcGi", "ultimo_login_en": null, "apellido_usuario": "Vega", "correo_electronico": "vigilante@unimagdalena.edu.co", "codigo_institucional": "CV080536"}	2026-05-03 15:11:20.536812
3	\N	INSERT	usuarios	3	\N	\N	\N	\N	{"id": 3, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.62017", "esta_activo": true, "actualizado_en": "2026-05-03T15:11:20.62017", "nombre_usuario": "Laura", "foto_perfil_url": null, "hash_contrasena": "$2b$10$XRxcZG1nZ/0a1kUduo6p6edmFJprX.1YfbCUm6NKBVO6JFDvAkocW", "ultimo_login_en": null, "apellido_usuario": "Perez", "correo_electronico": "user1@unimagdalena.edu.co", "codigo_institucional": "LP080619"}	2026-05-03 15:11:20.62017
4	\N	INSERT	usuarios	4	\N	\N	\N	\N	{"id": 4, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.699371", "esta_activo": true, "actualizado_en": "2026-05-03T15:11:20.699371", "nombre_usuario": "Andres", "foto_perfil_url": null, "hash_contrasena": "$2b$10$Xtjkd3zbMZ/iNf1WnAMABePljdG3o7hfDHGlQ1RMs2JlOOoENjx2e", "ultimo_login_en": null, "apellido_usuario": "Rojas", "correo_electronico": "user2@unimagdalena.edu.co", "codigo_institucional": "AR080699"}	2026-05-03 15:11:20.699371
5	\N	UPDATE	usuarios	1	\N	\N	\N	{"id": 1, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.437326", "esta_activo": true, "actualizado_en": "2026-05-03T15:24:53.326114", "nombre_usuario": "Admin", "foto_perfil_url": null, "hash_contrasena": "$2b$10$l1ydjzUFT/glIuOksK5Cse06/GPBJX7LUzV6LvSjGsEb3ZNaVuQEO", "ultimo_login_en": "2026-05-03T15:24:53.326114", "apellido_usuario": "System", "correo_electronico": "admin@unimagdalena.edu.co", "codigo_institucional": "AS080436"}	{"id": 1, "id_rol": 3, "telefono": null, "creado_en": "2026-05-03T15:11:20.437326", "esta_activo": true, "actualizado_en": "2026-05-03T15:24:53.326114", "nombre_usuario": "Admin", "foto_perfil_url": null, "hash_contrasena": "$2b$10$l1ydjzUFT/glIuOksK5Cse06/GPBJX7LUzV6LvSjGsEb3ZNaVuQEO", "ultimo_login_en": "2026-05-03T15:24:53.326114", "apellido_usuario": "System", "correo_electronico": "admin@unimagdalena.edu.co", "codigo_institucional": "AS080436"}	2026-05-03 15:27:13.769808
6	\N	UPDATE	usuarios	2	\N	\N	\N	{"id": 2, "id_rol": 1, "telefono": null, "creado_en": "2026-05-03T15:11:20.536812", "esta_activo": true, "actualizado_en": "2026-05-03T15:24:58.741218", "nombre_usuario": "Carlos", "foto_perfil_url": null, "hash_contrasena": "$2b$10$MD9K5LBo8OirAxw0opY0QuQDH0I2rU0z0yfRrLvYYWeSAlr0OIcGi", "ultimo_login_en": "2026-05-03T15:24:58.741218", "apellido_usuario": "Vega", "correo_electronico": "vigilante@unimagdalena.edu.co", "codigo_institucional": "CV080536"}	{"id": 2, "id_rol": 2, "telefono": null, "creado_en": "2026-05-03T15:11:20.536812", "esta_activo": true, "actualizado_en": "2026-05-03T15:24:58.741218", "nombre_usuario": "Carlos", "foto_perfil_url": null, "hash_contrasena": "$2b$10$MD9K5LBo8OirAxw0opY0QuQDH0I2rU0z0yfRrLvYYWeSAlr0OIcGi", "ultimo_login_en": "2026-05-03T15:24:58.741218", "apellido_usuario": "Vega", "correo_electronico": "vigilante@unimagdalena.edu.co", "codigo_institucional": "CV080536"}	2026-05-03 15:27:13.865303
7	\N	INSERT	usuarios	5	\N	\N	\N	\N	{"id": 5, "id_rol": 1, "telefono": "3113331173", "creado_en": "2026-05-04T06:45:23.102213", "esta_activo": true, "actualizado_en": "2026-05-04T06:45:23.102213", "nombre_usuario": "Camilo", "foto_perfil_url": null, "hash_contrasena": "$2b$10$ZsxZTocZpIspZUy9UVKgfeuox/SZ7JOecJqG56cC2Xwb14roLw2ge", "ultimo_login_en": null, "apellido_usuario": "Monsalve", "correo_electronico": "camilomonsalveag@unimagdalena.edu.co", "codigo_institucional": "ABC123DE"}	2026-05-04 06:45:23.102213
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (id, id_usuario, id_instalacion, id_estado, fecha_reserva, id_franja_inicio, id_franja_fin, comienza_en, termina_en, duracion_horas, equipo_solicitado, notas, razon_cancelacion, codigo_verificacion, creado_por, actualizado_por, creado_en, actualizado_en) FROM stdin;
2	3	1	5	2026-05-04	1	2	2026-05-04 02:00:00	2026-05-04 04:00:00	1	f	\N	\N	923717	3	3	2026-05-04 06:39:53.717558	2026-05-04 06:42:32.508214
3	3	1	5	2026-05-04	1	2	2026-05-04 02:00:00	2026-05-04 04:00:00	1	f	\N	\N	869170	3	3	2026-05-04 06:40:11.835646	2026-05-04 06:42:37.040863
4	5	1	1	2026-05-04	6	9	2026-05-04 07:00:00	2026-05-04 11:00:00	3	t	\N	\N	397993	5	5	2026-05-04 06:46:05.918978	2026-05-04 06:46:05.918978
1	3	1	3	2026-05-04	1	4	2026-05-04 02:00:00	2026-05-04 06:00:00	3	t	varias personas	\N	910290	3	3	2026-05-04 06:25:06.140288	2026-05-04 07:26:11.784614
\.


--
-- Name: bloqueos_instalaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloqueos_instalaciones_id_seq', 1, false);


--
-- Name: deportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deportes_id_seq', 11, true);


--
-- Name: elementos_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.elementos_equipo_id_seq', 15, true);


--
-- Name: escenarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.escenarios_id_seq', 9, true);


--
-- Name: estados_reserva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_reserva_id_seq', 6, true);


--
-- Name: franjas_horarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.franjas_horarias_id_seq', 13, true);


--
-- Name: instalaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instalaciones_id_seq', 15, true);


--
-- Name: logs_cambios_usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_cambios_usuarios_id_seq', 1, false);


--
-- Name: registros_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registros_auditoria_id_seq', 7, true);


--
-- Name: reservas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_id_seq', 4, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: tipos_superficie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_superficie_id_seq', 5, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict IIR3muyg8tBTEtBwFeI6DgOlx8ZHykb0oTFpMXEYcF2RFE9FUP7ewmsX8lmMSxK

