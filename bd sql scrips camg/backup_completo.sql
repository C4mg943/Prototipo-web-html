--
-- PostgreSQL database dump
--



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
-- Name: log_auditoria_usuarios_protegida(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_auditoria_usuarios_protegida() RETURNS trigger
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


ALTER FUNCTION public.log_auditoria_usuarios_protegida() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bloqueos_instalaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bloqueos_instalaciones (
    id bigint NOT NULL,
    id_instalacion bigint NOT NULL,
    razon text NOT NULL,
    inicia_en timestamp without time zone NOT NULL,
    termina_en timestamp without time zone NOT NULL,
    creado_por bigint,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bloqueos_instalaciones OWNER TO postgres;

--
-- Name: bloqueos_instalaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bloqueos_instalaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bloqueos_instalaciones_id_seq OWNER TO postgres;

--
-- Name: bloqueos_instalaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bloqueos_instalaciones_id_seq OWNED BY public.bloqueos_instalaciones.id;


--
-- Name: deportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportes (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    etiqueta_campo character varying(50),
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.deportes OWNER TO postgres;

--
-- Name: deportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deportes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deportes_id_seq OWNER TO postgres;

--
-- Name: deportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deportes_id_seq OWNED BY public.deportes.id;


--
-- Name: elementos_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.elementos_equipo (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    cantidad_total integer NOT NULL,
    cantidad_disponible integer NOT NULL,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.elementos_equipo OWNER TO postgres;

--
-- Name: elementos_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.elementos_equipo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elementos_equipo_id_seq OWNER TO postgres;

--
-- Name: elementos_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.elementos_equipo_id_seq OWNED BY public.elementos_equipo.id;


--
-- Name: escenarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.escenarios (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion_ubicacion text,
    id_tipo_superficie bigint,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.escenarios OWNER TO postgres;

--
-- Name: escenarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.escenarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escenarios_id_seq OWNER TO postgres;

--
-- Name: escenarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.escenarios_id_seq OWNED BY public.escenarios.id;


--
-- Name: estados_reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_reserva (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    es_final boolean DEFAULT false,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.estados_reserva OWNER TO postgres;

--
-- Name: estados_reserva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_reserva_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_reserva_id_seq OWNER TO postgres;

--
-- Name: estados_reserva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_reserva_id_seq OWNED BY public.estados_reserva.id;


--
-- Name: franjas_horarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.franjas_horarias (
    id bigint NOT NULL,
    hora_inicio character varying(8) NOT NULL,
    hora_fin character varying(8) NOT NULL,
    orden_clasificacion integer NOT NULL,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.franjas_horarias OWNER TO postgres;

--
-- Name: franjas_horarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.franjas_horarias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.franjas_horarias_id_seq OWNER TO postgres;

--
-- Name: franjas_horarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.franjas_horarias_id_seq OWNED BY public.franjas_horarias.id;


--
-- Name: instalaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instalaciones (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(150) NOT NULL,
    capacidad integer,
    id_escenario bigint,
    id_deporte bigint,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.instalaciones OWNER TO postgres;

--
-- Name: instalaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instalaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instalaciones_id_seq OWNER TO postgres;

--
-- Name: instalaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instalaciones_id_seq OWNED BY public.instalaciones.id;


--
-- Name: logs_cambios_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_cambios_usuarios (
    id bigint NOT NULL,
    id_usuario_afectado bigint NOT NULL,
    id_usuario_actor bigint,
    accion character varying(50),
    valores_anteriores jsonb,
    valores_nuevos jsonb,
    razon text,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.logs_cambios_usuarios OWNER TO postgres;

--
-- Name: logs_cambios_usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_cambios_usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_cambios_usuarios_id_seq OWNER TO postgres;

--
-- Name: logs_cambios_usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_cambios_usuarios_id_seq OWNED BY public.logs_cambios_usuarios.id;


--
-- Name: registros_auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_auditoria (
    id bigint NOT NULL,
    id_usuario_actor bigint,
    accion character varying(50) NOT NULL,
    nombre_entidad character varying(100) NOT NULL,
    id_entidad character varying(60),
    motivo character varying(255),
    direccion_ip inet,
    agente_usuario character varying(300),
    valores_anteriores jsonb,
    valores_nuevos jsonb,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.registros_auditoria OWNER TO postgres;

--
-- Name: registros_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registros_auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registros_auditoria_id_seq OWNER TO postgres;

--
-- Name: registros_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registros_auditoria_id_seq OWNED BY public.registros_auditoria.id;


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id bigint NOT NULL,
    id_usuario bigint NOT NULL,
    id_instalacion bigint NOT NULL,
    id_estado bigint NOT NULL,
    fecha_reserva date NOT NULL,
    id_franja_inicio bigint NOT NULL,
    id_franja_fin bigint NOT NULL,
    comienza_en timestamp without time zone NOT NULL,
    termina_en timestamp without time zone NOT NULL,
    duracion_horas integer NOT NULL,
    equipo_solicitado boolean DEFAULT false,
    notas text,
    razon_cancelacion text,
    codigo_verificacion character varying(10),
    creado_por bigint,
    actualizado_por bigint,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: reservas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_id_seq OWNER TO postgres;

--
-- Name: reservas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_id_seq OWNED BY public.reservas.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: tipos_superficie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_superficie (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    esta_activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tipos_superficie OWNER TO postgres;

--
-- Name: tipos_superficie_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_superficie_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_superficie_id_seq OWNER TO postgres;

--
-- Name: tipos_superficie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_superficie_id_seq OWNED BY public.tipos_superficie.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    id_rol bigint NOT NULL,
    codigo_institucional character varying(50) NOT NULL,
    nombre_usuario character varying(100) NOT NULL,
    apellido_usuario character varying(100) NOT NULL,
    correo_electronico character varying(255) NOT NULL,
    hash_contrasena character varying(255) NOT NULL,
    telefono character varying(20),
    foto_perfil_url character varying(500),
    esta_activo boolean DEFAULT true,
    ultimo_login_en timestamp without time zone,
    creado_en timestamp without time zone DEFAULT now(),
    actualizado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: bloqueos_instalaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloqueos_instalaciones ALTER COLUMN id SET DEFAULT nextval('public.bloqueos_instalaciones_id_seq'::regclass);


--
-- Name: deportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes ALTER COLUMN id SET DEFAULT nextval('public.deportes_id_seq'::regclass);


--
-- Name: elementos_equipo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.elementos_equipo ALTER COLUMN id SET DEFAULT nextval('public.elementos_equipo_id_seq'::regclass);


--
-- Name: escenarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escenarios ALTER COLUMN id SET DEFAULT nextval('public.escenarios_id_seq'::regclass);


--
-- Name: estados_reserva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_reserva ALTER COLUMN id SET DEFAULT nextval('public.estados_reserva_id_seq'::regclass);


--
-- Name: franjas_horarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franjas_horarias ALTER COLUMN id SET DEFAULT nextval('public.franjas_horarias_id_seq'::regclass);


--
-- Name: instalaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones ALTER COLUMN id SET DEFAULT nextval('public.instalaciones_id_seq'::regclass);


--
-- Name: logs_cambios_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_cambios_usuarios ALTER COLUMN id SET DEFAULT nextval('public.logs_cambios_usuarios_id_seq'::regclass);


--
-- Name: registros_auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_auditoria ALTER COLUMN id SET DEFAULT nextval('public.registros_auditoria_id_seq'::regclass);


--
-- Name: reservas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id SET DEFAULT nextval('public.reservas_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tipos_superficie id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_superficie ALTER COLUMN id SET DEFAULT nextval('public.tipos_superficie_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: bloqueos_instalaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloqueos_instalaciones (id, id_instalacion, razon, inicia_en, termina_en, creado_por, esta_activo, creado_en, actualizado_en) FROM stdin;
\.


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
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, codigo, nombre, descripcion, esta_activo, creado_en) FROM stdin;
1	ESTUDIANTE	Estudiante	Usuario estudiante con permisos básicos	t	2026-05-03 15:03:38.570432
2	VIGILANTE	Vigilante	Personal de vigilancia con acceso a reservas del día	t	2026-05-03 15:03:38.570432
3	ADMINISTRADOR	Administrador	Administrador del sistema con acceso total	t	2026-05-03 15:03:38.570432
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
-- Name: bloqueos_instalaciones bloqueos_instalaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloqueos_instalaciones
    ADD CONSTRAINT bloqueos_instalaciones_pkey PRIMARY KEY (id);


--
-- Name: deportes deportes_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_codigo_key UNIQUE (codigo);


--
-- Name: deportes deportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_pkey PRIMARY KEY (id);


--
-- Name: elementos_equipo elementos_equipo_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.elementos_equipo
    ADD CONSTRAINT elementos_equipo_codigo_key UNIQUE (codigo);


--
-- Name: elementos_equipo elementos_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.elementos_equipo
    ADD CONSTRAINT elementos_equipo_pkey PRIMARY KEY (id);


--
-- Name: escenarios escenarios_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escenarios
    ADD CONSTRAINT escenarios_codigo_key UNIQUE (codigo);


--
-- Name: escenarios escenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escenarios
    ADD CONSTRAINT escenarios_pkey PRIMARY KEY (id);


--
-- Name: estados_reserva estados_reserva_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_reserva
    ADD CONSTRAINT estados_reserva_codigo_key UNIQUE (codigo);


--
-- Name: estados_reserva estados_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_reserva
    ADD CONSTRAINT estados_reserva_pkey PRIMARY KEY (id);


--
-- Name: franjas_horarias franjas_horarias_orden_clasificacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franjas_horarias
    ADD CONSTRAINT franjas_horarias_orden_clasificacion_key UNIQUE (orden_clasificacion);


--
-- Name: franjas_horarias franjas_horarias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franjas_horarias
    ADD CONSTRAINT franjas_horarias_pkey PRIMARY KEY (id);


--
-- Name: instalaciones instalaciones_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_codigo_key UNIQUE (codigo);


--
-- Name: instalaciones instalaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_pkey PRIMARY KEY (id);


--
-- Name: logs_cambios_usuarios logs_cambios_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_cambios_usuarios
    ADD CONSTRAINT logs_cambios_usuarios_pkey PRIMARY KEY (id);


--
-- Name: registros_auditoria registros_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_auditoria
    ADD CONSTRAINT registros_auditoria_pkey PRIMARY KEY (id);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id);


--
-- Name: roles roles_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_codigo_key UNIQUE (codigo);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tipos_superficie tipos_superficie_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_superficie
    ADD CONSTRAINT tipos_superficie_codigo_key UNIQUE (codigo);


--
-- Name: tipos_superficie tipos_superficie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_superficie
    ADD CONSTRAINT tipos_superficie_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_codigo_institucional_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_codigo_institucional_key UNIQUE (codigo_institucional);


--
-- Name: usuarios usuarios_correo_electronico_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_auditoria_entidad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_entidad ON public.registros_auditoria USING btree (nombre_entidad, id_entidad);


--
-- Name: idx_auditoria_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_fecha ON public.registros_auditoria USING btree (creado_en);


--
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_usuario ON public.registros_auditoria USING btree (id_usuario_actor);


--
-- Name: idx_bloqueos_fechas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bloqueos_fechas ON public.bloqueos_instalaciones USING btree (inicia_en, termina_en);


--
-- Name: idx_bloqueos_instalacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bloqueos_instalacion ON public.bloqueos_instalaciones USING btree (id_instalacion);


--
-- Name: idx_escenarios_superficie; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_escenarios_superficie ON public.escenarios USING btree (id_tipo_superficie);


--
-- Name: idx_franjas_orden; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_franjas_orden ON public.franjas_horarias USING btree (orden_clasificacion);


--
-- Name: idx_instalaciones_deporte; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_instalaciones_deporte ON public.instalaciones USING btree (id_deporte);


--
-- Name: idx_instalaciones_escenario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_instalaciones_escenario ON public.instalaciones USING btree (id_escenario);


--
-- Name: idx_logs_usuario_actor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_usuario_actor ON public.logs_cambios_usuarios USING btree (id_usuario_actor);


--
-- Name: idx_logs_usuario_afectado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_usuario_afectado ON public.logs_cambios_usuarios USING btree (id_usuario_afectado);


--
-- Name: idx_reservas_comienza; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_comienza ON public.reservas USING btree (comienza_en);


--
-- Name: idx_reservas_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_estado ON public.reservas USING btree (id_estado);


--
-- Name: idx_reservas_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_fecha ON public.reservas USING btree (fecha_reserva);


--
-- Name: idx_reservas_instalacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_instalacion ON public.reservas USING btree (id_instalacion);


--
-- Name: idx_reservas_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_usuario ON public.reservas USING btree (id_usuario);


--
-- Name: idx_usuarios_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_codigo ON public.usuarios USING btree (codigo_institucional);


--
-- Name: idx_usuarios_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_correo ON public.usuarios USING btree (correo_electronico);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (id_rol);


--
-- Name: usuarios tr_audit_usuarios; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_audit_usuarios AFTER INSERT OR DELETE OR UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.log_auditoria_usuarios_protegida();


--
-- Name: bloqueos_instalaciones bloqueos_instalaciones_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloqueos_instalaciones
    ADD CONSTRAINT bloqueos_instalaciones_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id);


--
-- Name: bloqueos_instalaciones bloqueos_instalaciones_id_instalacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloqueos_instalaciones
    ADD CONSTRAINT bloqueos_instalaciones_id_instalacion_fkey FOREIGN KEY (id_instalacion) REFERENCES public.instalaciones(id);


--
-- Name: escenarios escenarios_id_tipo_superficie_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escenarios
    ADD CONSTRAINT escenarios_id_tipo_superficie_fkey FOREIGN KEY (id_tipo_superficie) REFERENCES public.tipos_superficie(id);


--
-- Name: instalaciones instalaciones_id_deporte_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_id_deporte_fkey FOREIGN KEY (id_deporte) REFERENCES public.deportes(id);


--
-- Name: instalaciones instalaciones_id_escenario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_id_escenario_fkey FOREIGN KEY (id_escenario) REFERENCES public.escenarios(id);


--
-- Name: logs_cambios_usuarios logs_cambios_usuarios_id_usuario_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_cambios_usuarios
    ADD CONSTRAINT logs_cambios_usuarios_id_usuario_actor_fkey FOREIGN KEY (id_usuario_actor) REFERENCES public.usuarios(id);


--
-- Name: logs_cambios_usuarios logs_cambios_usuarios_id_usuario_afectado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_cambios_usuarios
    ADD CONSTRAINT logs_cambios_usuarios_id_usuario_afectado_fkey FOREIGN KEY (id_usuario_afectado) REFERENCES public.usuarios(id);


--
-- Name: registros_auditoria registros_auditoria_id_usuario_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_auditoria
    ADD CONSTRAINT registros_auditoria_id_usuario_actor_fkey FOREIGN KEY (id_usuario_actor) REFERENCES public.usuarios(id);


--
-- Name: reservas reservas_actualizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_actualizado_por_fkey FOREIGN KEY (actualizado_por) REFERENCES public.usuarios(id);


--
-- Name: reservas reservas_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id);


--
-- Name: reservas reservas_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estados_reserva(id);


--
-- Name: reservas reservas_id_franja_fin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_franja_fin_fkey FOREIGN KEY (id_franja_fin) REFERENCES public.franjas_horarias(id);


--
-- Name: reservas reservas_id_franja_inicio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_franja_inicio_fkey FOREIGN KEY (id_franja_inicio) REFERENCES public.franjas_horarias(id);


--
-- Name: reservas reservas_id_instalacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_instalacion_fkey FOREIGN KEY (id_instalacion) REFERENCES public.instalaciones(id);


--
-- Name: reservas reservas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict GKhe2LtMnVRgzA0LOz3f8InbplKi1KssKYPvwJXnuOQayN9bCdhmMmmPhuU1ifP

