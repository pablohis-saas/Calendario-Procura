--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AlxoidType; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."AlxoidType" AS ENUM (
    'A',
    'B'
);


ALTER TYPE public."AlxoidType" OWNER TO paul;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."MovementType" AS ENUM (
    'ENTRY',
    'EXIT'
);


ALTER TYPE public."MovementType" OWNER TO paul;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."ProductType" AS ENUM (
    'SIMPLE',
    'COMPLEX'
);


ALTER TYPE public."ProductType" OWNER TO paul;

--
-- Name: ProductUnit; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."ProductUnit" AS ENUM (
    'ML',
    'PIECE'
);


ALTER TYPE public."ProductUnit" OWNER TO paul;

--
-- Name: TipoTratamiento; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."TipoTratamiento" AS ENUM (
    'INMUNOTERAPIA',
    'PRUEBAS',
    'GAMMAGLOBULINA',
    'VACUNAS_PEDIATRICAS',
    'MEDICAMENTOS_EXTRAS',
    'CONSULTA'
);


ALTER TYPE public."TipoTratamiento" OWNER TO paul;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: paul
--

CREATE TYPE public."UserRole" AS ENUM (
    'DOCTOR',
    'NURSE',
    'SECRETARY'
);


ALTER TYPE public."UserRole" OWNER TO paul;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Allergen; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."Allergen" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "alxoidType" public."AlxoidType",
    "isAlxoidExclusive" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Allergen" OWNER TO paul;

--
-- Name: InventoryUsage; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."InventoryUsage" (
    id text NOT NULL,
    "nombrePaciente" text NOT NULL,
    "tipoTratamiento" public."TipoTratamiento" NOT NULL,
    observaciones text,
    "tuvoReaccion" boolean NOT NULL,
    "descripcionReaccion" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sedeId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."InventoryUsage" OWNER TO paul;

--
-- Name: InventoryUsageDetail; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."InventoryUsageDetail" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    doses integer,
    "frascoLevel" integer,
    "inventoryUsageId" text NOT NULL,
    "movementId" text,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "totalCost" numeric(10,2) NOT NULL,
    "unitCost" numeric(10,2) NOT NULL,
    units integer,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InventoryUsageDetail" OWNER TO paul;

--
-- Name: Movement; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."Movement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sedeId" text NOT NULL,
    "productId" text NOT NULL,
    type public."MovementType" NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitCost" numeric(10,2) NOT NULL,
    "totalCost" numeric(10,2) NOT NULL,
    "batchNumber" text,
    "expiryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Movement" OWNER TO paul;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    type public."ProductType" NOT NULL,
    unit public."ProductUnit" NOT NULL,
    description text,
    "costPerUnit" numeric(10,2) NOT NULL,
    "minStockLevel" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text
);


ALTER TABLE public."Product" OWNER TO paul;

--
-- Name: ProductAllergen; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."ProductAllergen" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "allergenId" text NOT NULL,
    "mlPerDose" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductAllergen" OWNER TO paul;

--
-- Name: ProductExpiration; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."ProductExpiration" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "sedeId" text NOT NULL,
    "batchNumber" text NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductExpiration" OWNER TO paul;

--
-- Name: Sede; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."Sede" (
    id text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Sede" OWNER TO paul;

--
-- Name: StockBySede; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."StockBySede" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "sedeId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StockBySede" OWNER TO paul;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    "invoiceNumber" text,
    "amountSupplied" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO paul;

--
-- Name: User; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role public."UserRole" NOT NULL,
    "sedeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO paul;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: paul
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO paul;

--
-- Data for Name: Allergen; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."Allergen" (id, name, "createdAt", "updatedAt", "alxoidType", "isAlxoidExclusive") FROM stdin;
b7778695-d8c3-4afd-84eb-c3359c0f3c9d	Abedul	2025-06-25 23:29:59.405	2025-06-25 23:29:59.405	\N	f
05dba5e5-fd13-46e6-8619-0e89002ec79f	Ácaros	2025-06-25 23:29:59.408	2025-06-25 23:29:59.408	\N	f
a13062d1-7e35-4cf2-b890-f038b50b7526	Álamo del este	2025-06-25 23:29:59.41	2025-06-25 23:29:59.41	\N	f
b550d7e2-4698-472d-a22d-a3ebfa1cd9c4	Ambrosía	2025-06-25 23:29:59.413	2025-06-25 23:29:59.413	\N	f
58c80de9-5e5a-4cc3-a958-59e1b2555efd	Caballo	2025-06-25 23:29:59.414	2025-06-25 23:29:59.414	\N	f
29636c5d-1c89-4c2d-843f-03fbe8e99b1c	Camarón	2025-06-25 23:29:59.417	2025-06-25 23:29:59.417	\N	f
79b2288e-b6e2-434b-ad3b-f7ee4b412650	Ciprés de Arizona	2025-06-25 23:29:59.418	2025-06-25 23:29:59.418	\N	f
684d81f3-b64e-4092-a259-d753d12172b9	Encino	2025-06-25 23:29:59.419	2025-06-25 23:29:59.419	\N	f
c669349c-14fb-4858-bd7c-694093b65946	Fresno blanco	2025-06-25 23:29:59.419	2025-06-25 23:29:59.419	\N	f
6aa9aabf-e1bb-4bf9-a4cb-cfc8f8539d39	Gato	2025-06-25 23:29:59.42	2025-06-25 23:29:59.42	\N	f
26321f74-7200-49b0-bba7-c94172ec77f4	Manzana	2025-06-25 23:29:59.42	2025-06-25 23:29:59.42	\N	f
ebb58daf-0e34-4bc7-9d70-790e618c8124	Cucaracha	2025-06-25 23:29:59.421	2025-06-25 23:29:59.421	\N	f
232a6e05-8a13-40c0-b9d2-d983753f77c4	Mezcla pastos	2025-06-25 23:29:59.421	2025-06-25 23:29:59.421	\N	f
28cf13c4-f35e-4be1-bf74-7918799af5d2	Perro	2025-06-25 23:29:59.422	2025-06-25 23:29:59.422	\N	f
7771826e-06a0-41b2-8523-6cda7d7fd7d2	Pescado varios	2025-06-25 23:29:59.422	2025-06-25 23:29:59.422	\N	f
dc296972-db52-47e4-89a6-7ee89d609b7d	Pino blanco	2025-06-25 23:29:59.422	2025-06-25 23:29:59.422	\N	f
b460f0b1-a5ea-455b-8c31-bb9e0f3b71b8	Pistache	2025-06-25 23:29:59.423	2025-06-25 23:29:59.423	\N	f
9770edf2-5991-47df-bdb2-e86d82376a73	Trueno	2025-06-25 23:29:59.423	2025-06-25 23:29:59.423	\N	f
1ab2f395-9579-4c6a-bf5b-e857756e86a9	Alheña	2025-06-25 23:29:59.424	2025-06-25 23:29:59.424	\N	f
fe7d8b4a-e695-4385-8232-73110686eb06	Mezcla cucarachas	2025-06-25 23:29:59.424	2025-06-25 23:29:59.424	\N	f
4eca7274-60ea-4ca8-88d9-a4fea954353b	Mezquite	2025-06-25 23:29:59.425	2025-06-25 23:29:59.425	\N	f
99eb3810-473b-4275-8cf6-b4aa5c61b31b	Sweet gum	2025-06-25 23:29:59.425	2025-06-25 23:29:59.425	\N	f
a2a1aed6-abab-483e-ad46-3a8d1753fe67	Cupressus Arizónica	2025-06-25 23:29:59.425	2025-06-25 23:29:59.425	A	t
2a273db3-7121-47bb-986d-7d3589471c71	Fresno	2025-06-25 23:29:59.426	2025-06-25 23:29:59.426	A	t
22ea1f7b-7039-4e61-afd1-477fd41ec3ca	Gramínea con sinodon	2025-06-25 23:29:59.427	2025-06-25 23:29:59.427	A	t
a911fc52-7191-4ad4-9506-8c4763587dfd	Sinodon	2025-06-25 23:29:59.427	2025-06-25 23:29:59.427	A	t
075d335f-3890-401d-a710-fcffb0a4774b	6 Gramíneas	2025-06-25 23:29:59.427	2025-06-25 23:29:59.427	A	t
b78e58de-b542-459d-adcf-e22bf4f5e7f4	Ambrosía A	2025-06-25 23:29:59.428	2025-06-25 23:29:59.428	A	t
782c7099-1976-42d1-92a2-922a59da1946	Ácaros A	2025-06-25 23:29:59.43	2025-06-25 23:29:59.43	A	t
9c8ba584-4932-4b98-a1a4-57e3a42d4f3e	Encino A	2025-06-25 23:29:59.43	2025-06-25 23:29:59.43	A	t
830998ee-228d-49c5-821b-d194ce493802	Gato A	2025-06-25 23:29:59.431	2025-06-25 23:29:59.431	A	t
a1036c36-7194-4b1a-ba8a-4bd35dee92eb	Perro A	2025-06-25 23:29:59.431	2025-06-25 23:29:59.431	A	t
1b5a704e-6480-4cf4-beea-8dbf5b62490e	Cupressus Arizónica B	2025-06-25 23:29:59.432	2025-06-25 23:29:59.432	B	t
05d8582b-e1bc-4d0c-8cf8-2359315aa0ec	Fresno B	2025-06-25 23:29:59.433	2025-06-25 23:29:59.433	B	t
248d9e7d-e78e-4d2e-a11e-d52d4adbb468	Gramínea con sinodon B	2025-06-25 23:29:59.433	2025-06-25 23:29:59.433	B	t
7afc8544-003b-49c3-af2b-bd4b4934a821	Sinodon B	2025-06-25 23:29:59.434	2025-06-25 23:29:59.434	B	t
6b5bd7a0-a13a-4b80-96b6-4b59eb183f5c	6 Gramíneas B	2025-06-25 23:29:59.435	2025-06-25 23:29:59.435	B	t
c9298254-bcd1-4f40-9b1f-2e816524df80	Ambrosía B	2025-06-25 23:29:59.435	2025-06-25 23:29:59.435	B	t
13a9bc43-e1eb-4df8-8d10-fdd8b79194e5	Ácaros B	2025-06-25 23:29:59.436	2025-06-25 23:29:59.436	B	t
582f0fef-96f6-4ccc-b8d4-62d30c7ea374	Encino B	2025-06-25 23:29:59.437	2025-06-25 23:29:59.437	B	t
2620c756-e7af-4a79-9125-3542ebc477db	Gato B	2025-06-25 23:29:59.437	2025-06-25 23:29:59.437	B	t
0656b1bf-ba74-4c0f-8afd-59e177b399f4	Perro B	2025-06-25 23:29:59.438	2025-06-25 23:29:59.438	B	t
\.


--
-- Data for Name: InventoryUsage; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."InventoryUsage" (id, "nombrePaciente", "tipoTratamiento", observaciones, "tuvoReaccion", "descripcionReaccion", "createdAt", "sedeId", "updatedAt", "userId") FROM stdin;
75fc3a3f-0e84-4f99-8a2f-9b4e8016a0e7	are	INMUNOTERAPIA		f		2025-06-25 23:31:19.149	sede-tecamachalco	2025-06-25 23:31:19.149	c483e5e9-9d33-44cb-987b-5660b61e4851
543b79b7-ea78-4cfa-962c-ff6b77f07668	mame	INMUNOTERAPIA		f		2025-06-25 23:36:42.29	sede-tecamachalco	2025-06-25 23:36:42.29	c483e5e9-9d33-44cb-987b-5660b61e4851
320fc195-43f1-4ad1-992f-023635c246a0	jared	INMUNOTERAPIA		f		2025-06-25 23:38:47.976	sede-tecamachalco	2025-06-25 23:38:47.976	c483e5e9-9d33-44cb-987b-5660b61e4851
dc94eea9-13fb-4c02-b2d5-b9df9edc8654	tor	INMUNOTERAPIA		f		2025-06-25 23:40:51.124	sede-tecamachalco	2025-06-25 23:40:51.124	c483e5e9-9d33-44cb-987b-5660b61e4851
b26544a4-38ca-4a81-8f47-44c73e93fadb	mierda	INMUNOTERAPIA		f		2025-06-25 23:42:07.558	sede-tecamachalco	2025-06-25 23:42:07.558	c483e5e9-9d33-44cb-987b-5660b61e4851
c2514ec9-c3c0-4d2f-a033-4f6c26989ab1	hahaha	INMUNOTERAPIA		f		2025-06-25 23:43:27.569	sede-tecamachalco	2025-06-25 23:43:27.569	c483e5e9-9d33-44cb-987b-5660b61e4851
7ca341cd-fefb-4899-a23c-66d660db780b	ff	INMUNOTERAPIA		f		2025-06-25 23:45:19.309	sede-tecamachalco	2025-06-25 23:45:19.309	c483e5e9-9d33-44cb-987b-5660b61e4851
a38a329c-c0a4-4357-a31f-3088307a1d50	coño	INMUNOTERAPIA		f		2025-06-25 23:46:28.599	sede-tecamachalco	2025-06-25 23:46:28.599	c483e5e9-9d33-44cb-987b-5660b61e4851
c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	putear	INMUNOTERAPIA		f		2025-06-25 23:50:37.278	sede-tecamachalco	2025-06-25 23:50:37.278	c483e5e9-9d33-44cb-987b-5660b61e4851
981e519c-9ddf-4272-84b7-a2a6727668de	prueba 4	INMUNOTERAPIA		f		2025-06-25 23:51:22.587	sede-tecamachalco	2025-06-25 23:51:22.587	c483e5e9-9d33-44cb-987b-5660b61e4851
78480f88-94e6-4212-953b-40cbf3df6654	Serpiente	INMUNOTERAPIA		f		2025-06-25 23:56:44.298	sede-tecamachalco	2025-06-25 23:56:44.298	c483e5e9-9d33-44cb-987b-5660b61e4851
4db74cf8-9db0-43a6-9fc0-3affb4636482	alxoid 2	INMUNOTERAPIA		f		2025-06-25 23:59:05.433	sede-tecamachalco	2025-06-25 23:59:05.433	c483e5e9-9d33-44cb-987b-5660b61e4851
bea234a4-8fef-4217-87e5-b569b9fdb03f	alxoid b	INMUNOTERAPIA		f		2025-06-25 23:59:39.638	sede-tecamachalco	2025-06-25 23:59:39.638	c483e5e9-9d33-44cb-987b-5660b61e4851
f7fed416-a272-4966-b425-8bc1c3f03e57	alxoid .2	INMUNOTERAPIA		f		2025-06-26 00:00:16.746	sede-tecamachalco	2025-06-26 00:00:16.746	c483e5e9-9d33-44cb-987b-5660b61e4851
4158398e-62cf-4696-af49-5de75f8600cc	alxoid final	INMUNOTERAPIA		f		2025-06-26 00:00:52.001	sede-tecamachalco	2025-06-26 00:00:52.001	c483e5e9-9d33-44cb-987b-5660b61e4851
d61e00fa-50f2-4aa0-b327-27267e695921	polo	INMUNOTERAPIA		f		2025-06-26 00:01:27.622	sede-tecamachalco	2025-06-26 00:01:27.622	c483e5e9-9d33-44cb-987b-5660b61e4851
ca58641f-8439-4fb7-afcc-16a5e2222e69	popo	INMUNOTERAPIA		f		2025-06-26 00:02:59.13	sede-tecamachalco	2025-06-26 00:02:59.13	c483e5e9-9d33-44cb-987b-5660b61e4851
5f10120a-0540-4fa5-9e8e-08223cbf3024	crisis	INMUNOTERAPIA		f		2025-06-26 00:08:48.189	sede-tecamachalco	2025-06-26 00:08:48.189	c483e5e9-9d33-44cb-987b-5660b61e4851
06da3404-a076-4257-b579-51a8f34488a3	jolliness	PRUEBAS		f		2025-06-26 00:12:13.077	sede-tecamachalco	2025-06-26 00:12:13.077	c483e5e9-9d33-44cb-987b-5660b61e4851
ed9dc77d-4f4d-4720-87e2-b547e3e5047d	kokolizo	PRUEBAS		f		2025-06-26 00:12:58.145	sede-tecamachalco	2025-06-26 00:12:58.145	c483e5e9-9d33-44cb-987b-5660b61e4851
ac6b0e4a-c58b-4495-8a47-6f8ba9523cb9	pene	PRUEBAS		f		2025-06-26 01:02:15.031	sede-tecamachalco	2025-06-26 01:02:15.031	c483e5e9-9d33-44cb-987b-5660b61e4851
06bfcb23-5da3-4340-8fe6-2a58be5ae259	legit	PRUEBAS		f		2025-06-26 01:05:04.633	sede-tecamachalco	2025-06-26 01:05:04.633	c483e5e9-9d33-44cb-987b-5660b61e4851
cb889770-e00b-483b-90aa-23976a81977e	coñol sanguíneo	PRUEBAS		f		2025-06-26 01:06:36.337	sede-tecamachalco	2025-06-26 01:06:36.337	c483e5e9-9d33-44cb-987b-5660b61e4851
aaf9b496-1820-40ee-bfec-940df6202d63	prueba	PRUEBAS		f		2025-06-26 01:06:56.703	sede-tecamachalco	2025-06-26 01:06:56.703	c483e5e9-9d33-44cb-987b-5660b61e4851
ff2cd6c9-095a-4780-b526-998def10de97	fracas	PRUEBAS		f		2025-06-26 01:09:17.937	sede-tecamachalco	2025-06-26 01:09:17.937	c483e5e9-9d33-44cb-987b-5660b61e4851
aceb7cc1-4424-4291-8b10-ad369aed6df0	angel	PRUEBAS		f		2025-06-26 01:09:45.92	sede-tecamachalco	2025-06-26 01:09:45.92	c483e5e9-9d33-44cb-987b-5660b61e4851
dab12c17-248c-4c05-8a9b-92f6d7b15e34	proyecto	PRUEBAS		f		2025-06-26 01:11:04.948	sede-tecamachalco	2025-06-26 01:11:04.948	c483e5e9-9d33-44cb-987b-5660b61e4851
f0e15a7f-16e1-4b92-8830-7da6c2a979cf	Jorge el león	PRUEBAS		f		2025-06-26 01:12:01.975	sede-tecamachalco	2025-06-26 01:12:01.975	c483e5e9-9d33-44cb-987b-5660b61e4851
5d3f7c58-55a3-4bce-91e4-58df0dea133f	oo	PRUEBAS		f		2025-06-26 01:12:15.708	sede-tecamachalco	2025-06-26 01:12:15.708	c483e5e9-9d33-44cb-987b-5660b61e4851
6959423e-74e0-4b96-aac5-f0e14e509248	poño	PRUEBAS		f		2025-06-26 01:27:18.343	sede-tecamachalco	2025-06-26 01:27:18.343	c483e5e9-9d33-44cb-987b-5660b61e4851
383833fd-13cc-45ae-b9f4-7e7ab85c107d	cram elk	PRUEBAS		f		2025-06-26 01:29:41.369	sede-tecamachalco	2025-06-26 01:29:41.369	c483e5e9-9d33-44cb-987b-5660b61e4851
4e6b4c7f-2924-4ad1-b14d-bbdac53fbf2c	yosemite	PRUEBAS		f		2025-06-26 01:40:09.918	sede-tecamachalco	2025-06-26 01:40:09.918	c483e5e9-9d33-44cb-987b-5660b61e4851
1bc9a756-7714-4917-933e-1532783808df	gamma	GAMMAGLOBULINA		f		2025-06-26 01:41:51.239	sede-tecamachalco	2025-06-26 01:41:51.239	c483e5e9-9d33-44cb-987b-5660b61e4851
0135edd8-ecca-48d8-83db-01cd9615af9e	uva	VACUNAS_PEDIATRICAS		f		2025-06-26 01:42:19.235	sede-tecamachalco	2025-06-26 01:42:19.235	c483e5e9-9d33-44cb-987b-5660b61e4851
047beb0f-75a4-47f5-aca5-d1324077775d	vacubaby	MEDICAMENTOS_EXTRAS		f		2025-06-26 01:42:52.665	sede-tecamachalco	2025-06-26 01:42:52.665	c483e5e9-9d33-44cb-987b-5660b61e4851
90179e80-31df-401c-afc6-724028927bf7	penes	MEDICAMENTOS_EXTRAS		f		2025-06-26 01:43:15.425	sede-tecamachalco	2025-06-26 01:43:15.425	c483e5e9-9d33-44cb-987b-5660b61e4851
681d8fbe-cf19-4b18-bec3-343e01fdd8f9	Varuna	VACUNAS_PEDIATRICAS		f		2025-06-26 01:43:37.829	sede-tecamachalco	2025-06-26 01:43:37.829	c483e5e9-9d33-44cb-987b-5660b61e4851
fffea460-547e-415f-a8f4-f64e3b6503a7	minion	CONSULTA		f		2025-06-26 01:47:17.559	sede-tecamachalco	2025-06-26 01:47:17.559	c483e5e9-9d33-44cb-987b-5660b61e4851
2d22b78f-ea12-4e82-a141-97b937cde117	p	INMUNOTERAPIA		f		2025-06-28 20:51:04.179	sede-tecamachalco	2025-06-28 20:51:04.179	c483e5e9-9d33-44cb-987b-5660b61e4851
\.


--
-- Data for Name: InventoryUsageDetail; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."InventoryUsageDetail" (id, "createdAt", doses, "frascoLevel", "inventoryUsageId", "movementId", "productId", quantity, "totalCost", "unitCost", units, "updatedAt") FROM stdin;
85d51d29-a289-415e-9168-5673992fd644	2025-06-26 01:02:15.058	\N	\N	ac6b0e4a-c58b-4495-8a47-6f8ba9523cb9	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	2.00	1000.00	500.00	\N	2025-06-26 01:02:15.058
c0268611-227d-45f9-a003-307ed3723819	2025-06-26 01:05:04.648	\N	\N	06bfcb23-5da3-4340-8fe6-2a58be5ae259	\N	4998cdde-f9bd-4f35-a0fc-ed93d752317d	5.00	2500.00	500.00	\N	2025-06-26 01:05:04.648
4c7d569d-d5f6-4d29-b508-d636fea6810b	2025-06-26 01:05:04.655	\N	\N	06bfcb23-5da3-4340-8fe6-2a58be5ae259	\N	fa818135-51c0-4680-97cb-557ea5308a26	2.00	900.00	450.00	\N	2025-06-26 01:05:04.655
e4b2fb1e-7f12-47e5-9658-fd87f44f131a	2025-06-25 23:40:51.141	\N	\N	dc94eea9-13fb-4c02-b2d5-b9df9edc8654	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.05	1.25	25.00	\N	2025-06-25 23:40:51.141
1dbe98f1-da74-4751-a4a2-53bdf914f6d8	2025-06-25 23:40:51.147	\N	\N	dc94eea9-13fb-4c02-b2d5-b9df9edc8654	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.10	5.00	50.00	\N	2025-06-25 23:40:51.147
de3276e0-dc06-4d76-8224-4ce3510ee9b7	2025-06-25 23:40:51.15	\N	\N	dc94eea9-13fb-4c02-b2d5-b9df9edc8654	\N	f711c032-4afd-4486-97dc-56361adcd336	4.95	148.50	30.00	\N	2025-06-25 23:40:51.15
a303706a-ab7b-4b89-9d29-bc305f97d947	2025-06-25 23:40:51.144	\N	\N	dc94eea9-13fb-4c02-b2d5-b9df9edc8654	\N	c771ed38-178d-4838-a8c4-162e08db40b9	0.05	1.25	25.00	\N	2025-06-25 23:40:51.144
1950046b-1ab6-49d3-85c1-b090a7c727f9	2025-06-26 01:06:36.344	\N	\N	cb889770-e00b-483b-90aa-23976a81977e	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 01:06:36.344
f41c9224-5c5d-4bf4-9b95-899a6a30431e	2025-06-25 23:42:07.592	\N	\N	b26544a4-38ca-4a81-8f47-44c73e93fadb	\N	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	0.06	1.50	25.00	\N	2025-06-25 23:42:07.592
13d11d08-55e7-4789-abf5-40cee11eb08a	2025-06-25 23:42:07.58	\N	\N	b26544a4-38ca-4a81-8f47-44c73e93fadb	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.06	1.50	25.00	\N	2025-06-25 23:42:07.58
b7db8d56-d113-4cb3-9f2a-523c3cf25118	2025-06-25 23:42:07.597	\N	\N	b26544a4-38ca-4a81-8f47-44c73e93fadb	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.10	5.00	50.00	\N	2025-06-25 23:42:07.597
281246ed-3208-4646-85b9-73ad06e0dd33	2025-06-25 23:42:07.603	\N	\N	b26544a4-38ca-4a81-8f47-44c73e93fadb	\N	f711c032-4afd-4486-97dc-56361adcd336	0.54	16.20	30.00	\N	2025-06-25 23:42:07.603
933ce83b-43ec-422f-8110-ccb485a07508	2025-06-25 23:43:27.595	\N	\N	c2514ec9-c3c0-4d2f-a033-4f6c26989ab1	\N	f711c032-4afd-4486-97dc-56361adcd336	0.01	0.30	30.00	\N	2025-06-25 23:43:27.595
2fd66b68-0177-434a-ac5f-a215044bcaae	2025-06-25 23:43:27.584	\N	\N	c2514ec9-c3c0-4d2f-a033-4f6c26989ab1	\N	c771ed38-178d-4838-a8c4-162e08db40b9	0.00	0.00	25.00	\N	2025-06-25 23:43:27.584
98073f78-544c-43e8-8d96-8c6e230fabf6	2025-06-25 23:43:27.589	\N	\N	c2514ec9-c3c0-4d2f-a033-4f6c26989ab1	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.10	5.00	50.00	\N	2025-06-25 23:43:27.589
91e94580-3453-4fbc-8c72-cf42ce5f9fa9	2025-06-25 23:43:27.577	\N	\N	c2514ec9-c3c0-4d2f-a033-4f6c26989ab1	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.00	0.00	25.00	\N	2025-06-25 23:43:27.577
8bcaf478-19a2-4809-9033-09f4b1af212b	2025-06-25 23:45:19.326	\N	\N	7ca341cd-fefb-4899-a23c-66d660db780b	\N	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	0.30	7.50	25.00	\N	2025-06-25 23:45:19.326
c560ebb1-f9d4-44d0-a19d-d59857bfddec	2025-06-25 23:45:19.319	\N	\N	7ca341cd-fefb-4899-a23c-66d660db780b	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.30	7.50	25.00	\N	2025-06-25 23:45:19.319
d08e704a-0a27-4c17-9fa9-50a5ce3e01ff	2025-06-25 23:45:19.332	\N	\N	7ca341cd-fefb-4899-a23c-66d660db780b	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.10	5.00	50.00	\N	2025-06-25 23:45:19.332
8ee905e7-32d8-46a6-8a78-2a1c06a76770	2025-06-25 23:46:28.606	\N	\N	a38a329c-c0a4-4357-a31f-3088307a1d50	\N	c6e72fab-7bd0-49f3-920e-67ebe5b68968	0.90	22.50	25.00	\N	2025-06-25 23:46:28.606
813aaaae-f006-4754-8e91-dbcf25bb28a5	2025-06-25 23:46:28.61	\N	\N	a38a329c-c0a4-4357-a31f-3088307a1d50	\N	f8958811-1ba7-4091-95dd-04adce74999b	0.90	22.50	25.00	\N	2025-06-25 23:46:28.61
9c93c137-47c1-4736-bb9b-d7b21d9a919a	2025-06-25 23:46:28.614	\N	\N	a38a329c-c0a4-4357-a31f-3088307a1d50	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.30	15.00	50.00	\N	2025-06-25 23:46:28.614
f179f044-20f9-4698-9693-0732e2dc7967	2025-06-25 23:50:37.322	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	f711c032-4afd-4486-97dc-56361adcd336	5.86	175.80	30.00	\N	2025-06-25 23:50:37.322
4f915588-299e-4e12-94b4-c4e8047e8f69	2025-06-25 23:50:37.311	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	0.05	1.25	25.00	\N	2025-06-25 23:50:37.311
a032c9c5-1389-43ca-aac9-32c08f9bd4a6	2025-06-25 23:50:37.305	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	c771ed38-178d-4838-a8c4-162e08db40b9	0.02	0.50	25.00	\N	2025-06-25 23:50:37.305
a32bbb6e-1046-4a3b-816c-786975e7bd44	2025-06-25 23:50:37.329	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	4.00	200.00	50.00	\N	2025-06-25 23:50:37.329
5dfa6b54-cc2f-49c7-9ada-c874a8336833	2025-06-25 23:50:37.294	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	0.02	0.50	25.00	\N	2025-06-25 23:50:37.294
2157d2b5-47e1-459f-a28a-0f30bea24c98	2025-06-25 23:50:37.317	\N	\N	c8dd05b4-97dc-4ecd-9fd5-b51fcbebefdd	\N	c771ed38-178d-4838-a8c4-162e08db40b9	0.05	1.25	25.00	\N	2025-06-25 23:50:37.317
101bc90d-d50b-409f-b33e-17481c5e52fb	2025-06-25 23:51:22.604	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	0.10	2.50	25.00	\N	2025-06-25 23:51:22.604
835342df-d3e1-407b-8f22-4f19d917e5b5	2025-06-25 23:51:22.608	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.04	1.00	25.00	\N	2025-06-25 23:51:22.608
34707fe8-9786-42f3-80f1-af903005a9da	2025-06-25 23:51:22.598	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	5b50199d-8229-48e9-aebd-671b62743e3a	0.10	2.50	25.00	\N	2025-06-25 23:51:22.598
394f5359-bb2c-4986-91dc-7e65ac137f98	2025-06-25 23:51:22.618	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	f711c032-4afd-4486-97dc-56361adcd336	11.72	351.60	30.00	\N	2025-06-25 23:51:22.618
7ea8cfc3-cbbc-4268-9fc5-261487d8b2f1	2025-06-25 23:51:22.622	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	8.00	400.00	50.00	\N	2025-06-25 23:51:22.622
3a1ae4fc-7af4-4aeb-ba32-54c7dd458690	2025-06-25 23:51:22.613	\N	\N	981e519c-9ddf-4272-84b7-a2a6727668de	\N	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	0.04	1.00	25.00	\N	2025-06-25 23:51:22.613
f865bdd5-108b-424b-99ab-d8192c8356ce	2025-06-26 00:12:58.15	\N	\N	ed9dc77d-4f4d-4720-87e2-b547e3e5047d	\N	1cf46547-64ac-43c4-b728-261e6602ec50	1.00	300.00	300.00	\N	2025-06-26 00:12:58.15
f31c393e-a767-4eba-9a99-45428625c4d7	2025-06-25 23:56:44.354	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	f711c032-4afd-4486-97dc-56361adcd336	17.58	527.40	30.00	\N	2025-06-25 23:56:44.354
ac4e9e01-6db2-4134-ae77-cc3d6ac5298a	2025-06-25 23:56:44.35	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	0.06	1.50	25.00	\N	2025-06-25 23:56:44.35
d743781a-e317-4e1c-b8de-8fa0b89c026f	2025-06-25 23:56:44.325	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	f8958811-1ba7-4091-95dd-04adce74999b	0.15	3.75	25.00	\N	2025-06-25 23:56:44.325
0945c401-488b-4890-9f6e-49973314e05e	2025-06-25 23:56:44.337	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	0.15	3.75	25.00	\N	2025-06-25 23:56:44.337
b6f5b731-4b26-4cd4-9ac5-20e14425a00d	2025-06-25 23:56:44.358	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	f3edc4b3-ac9c-4279-8f12-46fbbd475337	12.00	600.00	50.00	\N	2025-06-25 23:56:44.358
98e2e029-f848-410a-8ac5-8926f02d9a81	2025-06-25 23:56:44.344	\N	\N	78480f88-94e6-4212-953b-40cbf3df6654	\N	f8958811-1ba7-4091-95dd-04adce74999b	0.06	1.50	25.00	\N	2025-06-25 23:56:44.344
3d37bcc9-e06e-4cd8-ac2f-b92de2d51c77	2025-06-26 01:09:17.965	\N	\N	ff2cd6c9-095a-4780-b526-998def10de97	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 01:09:17.965
78d48b16-3eb0-4ac1-b494-32dcb86d4ed3	2025-06-26 01:29:41.381	\N	\N	383833fd-13cc-45ae-b9f4-7e7ab85c107d	\N	f09bdd01-a9eb-4e15-9717-fa18d30293c3	4.00	1400.00	350.00	\N	2025-06-26 01:29:41.381
3d4a5fd7-70d1-45d4-b438-bd4dc7ae5ecd	2025-06-26 01:11:04.958	\N	\N	dab12c17-248c-4c05-8a9b-92f6d7b15e34	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	2.00	800.00	400.00	\N	2025-06-26 01:11:04.958
b83f3c03-b070-4981-9976-19a1b5a33ce5	2025-06-26 01:12:01.987	\N	\N	f0e15a7f-16e1-4b92-8830-7da6c2a979cf	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	2.00	1000.00	500.00	\N	2025-06-26 01:12:01.987
7cd224fc-89aa-49ef-bfa9-340db85aed5f	2025-06-26 01:40:09.972	\N	\N	4e6b4c7f-2924-4ad1-b14d-bbdac53fbf2c	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	2.00	800.00	400.00	\N	2025-06-26 01:40:09.972
9f55cf3a-6492-4c67-8e0a-98cb5066cc3a	2025-06-26 01:06:56.719	\N	\N	aaf9b496-1820-40ee-bfec-940df6202d63	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	7.00	2800.00	400.00	\N	2025-06-26 01:06:56.719
cb09b6bb-788a-4f13-8e79-f985017a9536	2025-06-25 23:59:05.449	\N	\N	4db74cf8-9db0-43a6-9fc0-3affb4636482	\N	f76238a9-2735-46f4-8e7b-5268f585742e	0.50	12.50	25.00	\N	2025-06-25 23:59:05.449
cadff638-8597-4dab-836e-addd6371ea69	2025-06-25 23:59:39.653	\N	\N	bea234a4-8fef-4217-87e5-b569b9fdb03f	\N	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	0.50	12.50	25.00	\N	2025-06-25 23:59:39.653
b1b9b509-fefd-43c9-be62-2eb27f5505ec	2025-06-25 23:59:05.443	\N	\N	4db74cf8-9db0-43a6-9fc0-3affb4636482	\N	4acf0843-ba8d-4c7c-84ce-616f387115e5	0.50	12.50	25.00	\N	2025-06-25 23:59:05.443
daae20f2-9d82-498b-ae64-c31023b52180	2025-06-25 23:59:39.647	\N	\N	bea234a4-8fef-4217-87e5-b569b9fdb03f	\N	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	0.50	12.50	25.00	\N	2025-06-25 23:59:39.647
9c5e2ee1-961e-41c9-abce-e08cdb474bc3	2025-06-26 00:00:16.761	\N	\N	f7fed416-a272-4966-b425-8bc1c3f03e57	\N	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	0.20	5.00	25.00	\N	2025-06-26 00:00:16.761
916bff89-c96d-42bf-8109-37e5cfbfa695	2025-06-26 00:00:16.755	\N	\N	f7fed416-a272-4966-b425-8bc1c3f03e57	\N	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	0.20	5.00	25.00	\N	2025-06-26 00:00:16.755
a0b2f775-91fa-412d-bce7-a44839b69d13	2025-06-26 00:00:52.12	\N	\N	4158398e-62cf-4696-af49-5de75f8600cc	\N	4acf0843-ba8d-4c7c-84ce-616f387115e5	0.50	12.50	25.00	\N	2025-06-26 00:00:52.12
6af3f030-0532-440c-9424-0d42a46d4e77	2025-06-26 00:00:52.215	\N	\N	4158398e-62cf-4696-af49-5de75f8600cc	\N	f76238a9-2735-46f4-8e7b-5268f585742e	0.50	12.50	25.00	\N	2025-06-26 00:00:52.215
d29d324d-2145-4dbc-9064-5828ce5f092a	2025-06-26 01:09:45.93	\N	\N	aceb7cc1-4424-4291-8b10-ad369aed6df0	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 01:09:45.93
2331e536-ca85-4d7e-ad5d-0258ffff3f7a	2025-06-26 01:12:15.717	\N	\N	5d3f7c58-55a3-4bce-91e4-58df0dea133f	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	1.00	400.00	400.00	\N	2025-06-26 01:12:15.717
2ee6e1e1-7fb5-4e3b-91f8-2f3bcca55466	2025-06-26 01:40:09.95	\N	\N	4e6b4c7f-2924-4ad1-b14d-bbdac53fbf2c	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 01:40:09.95
23543e85-a048-4ddc-b0bd-fed8040a89ac	2025-06-26 01:27:18.378	\N	\N	6959423e-74e0-4b96-aac5-f0e14e509248	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	2.00	800.00	400.00	\N	2025-06-26 01:27:18.378
b44a7272-c9a2-4fdb-9774-bc48f5b3685a	2025-06-26 00:01:27.666	\N	\N	d61e00fa-50f2-4aa0-b327-27267e695921	\N	4acf0843-ba8d-4c7c-84ce-616f387115e5	0.50	12.50	25.00	\N	2025-06-26 00:01:27.666
c48ee596-2644-441d-b333-6edf6fecbec9	2025-06-26 00:01:27.676	\N	\N	d61e00fa-50f2-4aa0-b327-27267e695921	\N	f76238a9-2735-46f4-8e7b-5268f585742e	0.50	12.50	25.00	\N	2025-06-26 00:01:27.676
b268bb30-12a7-4c85-accf-3c87ffe448e3	2025-06-26 00:02:59.17	\N	\N	ca58641f-8439-4fb7-afcc-16a5e2222e69	\N	9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	1.50	37.50	25.00	\N	2025-06-26 00:02:59.17
11fae447-0c66-48aa-b436-59093849e31a	2025-06-26 00:02:59.158	\N	\N	ca58641f-8439-4fb7-afcc-16a5e2222e69	\N	faf767b4-e52e-4092-85cf-2bf5318f3687	1.50	37.50	25.00	\N	2025-06-26 00:02:59.158
40523d45-bde4-4370-9d0c-060e0ce93a23	2025-06-26 00:08:48.215	\N	\N	5f10120a-0540-4fa5-9e8e-08223cbf3024	\N	c1415bee-5de0-4ad5-b8b6-98f90b26716d	0.04	1.00	25.00	\N	2025-06-26 00:08:48.215
abb85a38-7cd5-4caf-b255-0e8e48ea7360	2025-06-26 00:08:48.233	\N	\N	5f10120a-0540-4fa5-9e8e-08223cbf3024	\N	9c86d8ec-3564-450a-9d29-cef1ac5de2a4	4.80	192.00	40.00	\N	2025-06-26 00:08:48.233
9c5424e9-4272-4957-a08b-5b5bebca3f03	2025-06-26 00:08:48.228	\N	\N	5f10120a-0540-4fa5-9e8e-08223cbf3024	\N	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	0.04	1.00	25.00	\N	2025-06-26 00:08:48.228
b1503998-bb7c-4be1-a19e-419d389ce077	2025-06-26 00:12:13.094	\N	\N	06da3404-a076-4257-b579-51a8f34488a3	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 00:12:13.094
2bd0d018-cde6-4066-b6a8-ff54e3dbdae0	2025-06-26 01:29:41.376	\N	\N	383833fd-13cc-45ae-b9f4-7e7ab85c107d	\N	4a42fa1e-a6e7-49c1-874a-01b4612873b1	1.00	400.00	400.00	\N	2025-06-26 01:29:41.376
ce6865e2-22bc-4b66-8514-3c26bd565a10	2025-06-26 01:27:18.368	\N	\N	6959423e-74e0-4b96-aac5-f0e14e509248	\N	e8eb7443-7e41-4f70-a382-a49cbf61fe50	1.00	500.00	500.00	\N	2025-06-26 01:27:18.368
35fe80ad-ba0e-49a6-bd8d-e33819e50e59	2025-06-26 01:41:51.257	\N	\N	1bc9a756-7714-4917-933e-1532783808df	\N	916822f7-dd60-4a21-aa0a-f6552a4bfe31	2.00	20000.00	10000.00	\N	2025-06-26 01:41:51.257
5bf2b9c8-cbe0-4336-8323-e9168b6177d9	2025-06-26 01:41:51.249	\N	\N	1bc9a756-7714-4917-933e-1532783808df	\N	8a624d62-3be3-4dd5-9f32-dc15481d9c23	2.00	16000.00	8000.00	\N	2025-06-26 01:41:51.249
06aa78a8-6d09-4664-a4af-6e5c4692384e	2025-06-26 01:42:19.248	\N	\N	0135edd8-ecca-48d8-83db-01cd9615af9e	\N	727f19d9-75aa-4bf8-bcb8-41ef9c33930c	1.00	1200.00	1200.00	\N	2025-06-26 01:42:19.248
e1a73c61-4855-4abc-9009-07e7491068c5	2025-06-26 01:42:19.242	\N	\N	0135edd8-ecca-48d8-83db-01cd9615af9e	\N	b2549870-d709-44b4-8f94-e14ceb8b7286	2.00	1600.00	800.00	\N	2025-06-26 01:42:19.242
cad450a9-6ad2-4e5f-8fb4-166c4032a4b4	2025-06-26 01:42:52.673	\N	\N	047beb0f-75a4-47f5-aca5-d1324077775d	\N	4afbe49f-8899-435f-9ba8-2355d1dc45ea	2.00	300.00	150.00	\N	2025-06-26 01:42:52.673
b18fe6f9-624c-4e02-9e55-1d050dd97ff5	2025-06-26 01:42:52.679	\N	\N	047beb0f-75a4-47f5-aca5-d1324077775d	\N	169e9c59-4521-48fc-aae9-9f3a9a00ba13	4.00	320.00	80.00	\N	2025-06-26 01:42:52.679
028e0081-056f-4fb9-84a2-990fbd7901a7	2025-06-26 01:43:15.433	\N	\N	90179e80-31df-401c-afc6-724028927bf7	\N	69e9b832-d342-474d-a507-133f2d5c1553	1.00	100.00	100.00	\N	2025-06-26 01:43:15.433
1363d844-95ab-4101-b1a6-02b8a6877de3	2025-06-26 01:43:37.84	\N	\N	681d8fbe-cf19-4b18-bec3-343e01fdd8f9	\N	b2549870-d709-44b4-8f94-e14ceb8b7286	1.00	800.00	800.00	\N	2025-06-26 01:43:37.84
8158445f-7e97-4cd0-bcda-1d0afd12a91a	2025-06-26 01:47:17.587	\N	\N	fffea460-547e-415f-a8f4-f64e3b6503a7	3a28543a-aa75-4609-9204-d1d7fc5aba95	9996676c-7438-472c-9e9e-d84df1d12b25	1.00	500.00	500.00	\N	2025-06-26 01:47:17.587
7b77258b-b6e9-4175-b2ce-e8ee315d6b86	2025-06-28 20:51:04.233	\N	\N	2d22b78f-ea12-4e82-a141-97b937cde117	a6cbb4c9-4af4-4acf-9f55-e6ee59abf8e7	c771ed38-178d-4838-a8c4-162e08db40b9	0.38	9.50	25.00	\N	2025-06-28 20:51:04.233
a926715b-ce22-4c34-a919-55124e47b8f3	2025-06-28 20:51:04.249	\N	\N	2d22b78f-ea12-4e82-a141-97b937cde117	c2ef667e-e3bd-4688-8300-26886a95e4b1	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	0.38	9.50	25.00	\N	2025-06-28 20:51:04.249
70096232-09de-4afb-ac7d-8c9be81bdadd	2025-06-28 20:51:04.254	\N	\N	2d22b78f-ea12-4e82-a141-97b937cde117	f299ae8a-6904-4e79-a00f-ca0db7ca10ff	f3edc4b3-ac9c-4279-8f12-46fbbd475337	0.20	10.00	50.00	\N	2025-06-28 20:51:04.254
\.


--
-- Data for Name: Movement; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."Movement" (id, "userId", "sedeId", "productId", type, quantity, "unitCost", "totalCost", "batchNumber", "expiryDate", "createdAt") FROM stdin;
3a28543a-aa75-4609-9204-d1d7fc5aba95	c483e5e9-9d33-44cb-987b-5660b61e4851	sede-tecamachalco	9996676c-7438-472c-9e9e-d84df1d12b25	EXIT	1.00	500.00	500.00	BATCH-9996676c	2026-06-26 01:46:14.282	2025-06-26 01:47:17.585
b7fbe9e4-5c97-488b-ba36-c24815152c1e	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	b2549870-d709-44b4-8f94-e14ceb8b7286	ENTRY	3.00	600.00	1800.00	\N	\N	2025-06-28 00:16:49.401
1e5e1214-181d-4890-a476-832f830df088	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	b2549870-d709-44b4-8f94-e14ceb8b7286	ENTRY	1.00	6000.00	6000.00	\N	\N	2025-06-28 00:19:08.487
0b4a2a9b-29ea-4d02-be69-bb29ec5df1af	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	5b50199d-8229-48e9-aebd-671b62743e3a	ENTRY	50.00	700.00	35000.00	\N	\N	2025-06-28 00:35:11.479
51cd0a2d-1803-405b-aed4-d4bfebd0eab6	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	4acf0843-ba8d-4c7c-84ce-616f387115e5	ENTRY	15.00	600.00	9000.00	\N	\N	2025-06-28 00:35:43.182
be2a7111-edc2-47b8-beb1-ec7b2724a289	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	51bfbc07-105c-44fd-9512-1b07c663266f	ENTRY	100.00	600.00	60000.00	\N	\N	2025-06-28 00:37:14.536
9230a516-d687-46e7-ac88-da7f748adb8d	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	4acf0843-ba8d-4c7c-84ce-616f387115e5	ENTRY	25.00	600.00	15000.00	\N	\N	2025-06-28 00:37:14.543
fab8d0ca-9132-45e5-a848-c30aad1562d0	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	ENTRY	24.00	700.00	16800.00	\N	\N	2025-06-28 00:37:59.098
67eb1c23-84f1-4196-a13e-0d868a5405fd	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	6a762bfe-9350-4efd-afea-7d3821d39cdd	ENTRY	1.00	700.00	700.00	\N	\N	2025-06-28 01:26:15.6
565efb89-db06-4207-9cad-4d15a004d59c	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	1d0b348f-ee58-44f0-8318-8a4b8715e847	ENTRY	10.00	800.00	8000.00	\N	\N	2025-06-28 01:42:34.626
6e0b9df7-9d11-4743-9a04-37c0f6f80f68	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	3d801e89-876b-4261-a69d-d3414d366120	ENTRY	10.00	6000.00	60000.00	\N	\N	2025-06-28 02:01:01.907
9fe90217-5bf5-4f1c-81ac-7c3d9e76aec1	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	f67d1474-1189-45f6-8e73-1e99e727117b	ENTRY	10.00	8000.00	80000.00	\N	\N	2025-06-28 02:04:10.423
f0a16db4-1d61-46fd-abbb-e827284fa52b	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	9ad09fa7-3de3-4bed-9a54-f9e391e26035	ENTRY	10.00	1000.00	10000.00	\N	\N	2025-06-28 02:21:22.101
a9c141b3-d0fd-41aa-981d-cac24a16b410	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	a4be1035-d7f6-480e-a1ef-7ffb1cdda671	ENTRY	10.00	1000.00	10000.00	\N	\N	2025-06-28 02:21:53.533
a6cbb4c9-4af4-4acf-9f55-e6ee59abf8e7	c483e5e9-9d33-44cb-987b-5660b61e4851	sede-tecamachalco	c771ed38-178d-4838-a8c4-162e08db40b9	EXIT	0.38	25.00	9.50	BATCH-c771ed38	2026-06-25 23:29:59.708	2025-06-28 20:51:04.229
c2ef667e-e3bd-4688-8300-26886a95e4b1	c483e5e9-9d33-44cb-987b-5660b61e4851	sede-tecamachalco	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	EXIT	0.38	25.00	9.50	BATCH-bc509bc0	2026-06-25 23:29:59.75	2025-06-28 20:51:04.248
f299ae8a-6904-4e79-a00f-ca0db7ca10ff	c483e5e9-9d33-44cb-987b-5660b61e4851	sede-tecamachalco	f3edc4b3-ac9c-4279-8f12-46fbbd475337	EXIT	0.20	50.00	10.00	BATCH-f3edc4b3	2026-06-25 23:29:59.689	2025-06-28 20:51:04.252
1a710f23-a108-430f-b301-9d52cbc2c1a7	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	33ba649a-c16a-4034-8572-a4cbebfb1466	ENTRY	5.00	900.00	4500.00	\N	\N	2025-06-28 20:51:30.267
93e685a3-6ca8-4075-8518-29a7af8be0c8	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	ENTRY	20.00	100.00	2000.00	\N	\N	2025-07-01 00:18:00.554
3eec061d-64db-4f4f-b0db-2dcc2ba1f36b	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	b2549870-d709-44b4-8f94-e14ceb8b7286	ENTRY	10.00	7000.00	70000.00	\N	\N	2025-07-01 00:18:48.489
0fdb0ddb-96ce-40cb-bc82-08e0de750ef9	590c7231-dabf-4224-abb4-25576c349cb8	sede-tecamachalco	4afbe49f-8899-435f-9ba8-2355d1dc45ea	ENTRY	10.00	800.00	8000.00	\N	\N	2025-07-01 00:24:23.671
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."Product" (id, name, type, unit, description, "costPerUnit", "minStockLevel", "createdAt", "updatedAt", category) FROM stdin;
249e50ad-95aa-4479-a343-aff4c08d7b90	Glicerinado Frasco #1	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.44	2025-06-25 23:29:59.44	\N
7e7c2791-ace4-4595-a311-0dcd3ef808c0	Glicerinado Frasco #2	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.443	2025-06-25 23:29:59.443	\N
c42bd3ae-d693-4e17-9051-ba867aadeb0a	Glicerinado Frasco #3	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.443	2025-06-25 23:29:59.443	\N
99123789-b161-4b25-bb40-d35f2fc33658	Glicerinado Frasco #4	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.444	2025-06-25 23:29:59.444	\N
574d9e50-49e1-47cc-affd-9a67512c60cf	Glicerinado Frasco #5	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.445	2025-06-25 23:29:59.445	\N
9a3e07fc-f69a-46c5-a4c4-188779f38a8d	Glicerinado Frasco #6	COMPLEX	ML	Producto glicerinado para inmunoterapia	150.00	10	2025-06-25 23:29:59.445	2025-06-25 23:29:59.445	\N
da4226b2-86f1-4509-840a-b93dc8d55cbd	Glicerinado Bacteriana	COMPLEX	ML	Producto glicerinado para inmunoterapia	200.00	10	2025-06-25 23:29:59.446	2025-06-25 23:29:59.446	\N
6b77c255-c412-4fd7-95dd-dcdf1516a6e3	Alxoid Tipo A	COMPLEX	ML	Producto Alxoid para inmunoterapia	300.00	5	2025-06-25 23:29:59.447	2025-06-25 23:29:59.447	\N
5113a8cd-ee6b-4b68-987a-c3a5787d84de	Alxoid Tipo B	COMPLEX	ML	Producto Alxoid para inmunoterapia	300.00	5	2025-06-25 23:29:59.449	2025-06-25 23:29:59.449	\N
43c78bf4-2668-4355-85cc-33e914299d9f	Alxoid Tipo B.2	COMPLEX	ML	Producto Alxoid para inmunoterapia	300.00	5	2025-06-25 23:29:59.45	2025-06-25 23:29:59.45	\N
af1aaeaa-a196-4c41-95ab-31fed7d4ab37	Sublingual Frasco 1	COMPLEX	ML	Producto sublingual para inmunoterapia	250.00	8	2025-06-25 23:29:59.451	2025-06-25 23:29:59.451	\N
c53b40ac-9137-4479-8a4a-e81afde0d559	Sublingual Frasco 2	COMPLEX	ML	Producto sublingual para inmunoterapia	250.00	8	2025-06-25 23:29:59.452	2025-06-25 23:29:59.452	\N
2694e937-ba38-404d-b57f-e746d2dcb37f	Sublingual Frasco 3	COMPLEX	ML	Producto sublingual para inmunoterapia	250.00	8	2025-06-25 23:29:59.452	2025-06-25 23:29:59.452	\N
0bc09c44-68e0-4c81-8ae9-f4bf19ffd40c	Sublingual Frasco 4	COMPLEX	ML	Producto sublingual para inmunoterapia	250.00	8	2025-06-25 23:29:59.453	2025-06-25 23:29:59.453	\N
1cf46547-64ac-43c4-b728-261e6602ec50	Prick	SIMPLE	PIECE	Prueba de diagnóstico	300.00	20	2025-06-25 23:29:59.455	2025-06-25 23:29:59.455	\N
d5783698-a8c6-479b-b945-55c057cb3a78	Suero	SIMPLE	PIECE	Prueba de diagnóstico	200.00	20	2025-06-25 23:29:59.456	2025-06-25 23:29:59.456	\N
d787c319-95cf-4f35-a876-cc06d6b1b420	FeNO	SIMPLE	PIECE	Prueba de diagnóstico	600.00	20	2025-06-25 23:29:59.456	2025-06-25 23:29:59.456	\N
dc97705a-d682-4d8b-9e8c-0c94f17169e8	COVID/Influenza	SIMPLE	PIECE	Prueba de diagnóstico	400.00	20	2025-06-25 23:29:59.457	2025-06-25 23:29:59.457	\N
d4a4dca9-ba0a-45d0-a0e4-c0ed76d7a84e	Estreptococo B	SIMPLE	PIECE	Prueba de diagnóstico	350.00	20	2025-06-25 23:29:59.458	2025-06-25 23:29:59.458	\N
f3edc4b3-ac9c-4279-8f12-46fbbd475337	Bacteriana	SIMPLE	ML	Diluyente para inmunoterapia	50.00	100	2025-06-25 23:29:59.474	2025-06-25 23:29:59.474	\N
c771ed38-178d-4838-a8c4-162e08db40b9	Caballo	SIMPLE	ML	Alérgeno: Caballo	25.00	50	2025-06-25 23:29:59.48	2025-07-01 00:29:32.945	Alérgenos
f283463f-2bab-4f0e-8ed5-fefda64e18e9	Ácaros	SIMPLE	ML	Alérgeno: Ácaros	25.00	50	2025-06-25 23:29:59.478	2025-07-01 00:49:42.927	Alérgenos
d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	Álamo del este	SIMPLE	ML	Alérgeno: Álamo del este	25.00	50	2025-06-25 23:29:59.478	2025-07-01 00:49:42.931	Alérgenos
20561748-55d1-4e78-a928-4cceacec4746	Ambrosía	SIMPLE	ML	Alérgeno: Ambrosía	25.00	50	2025-06-25 23:29:59.479	2025-07-01 00:49:42.933	Alérgenos
a6dc9555-b0b8-4da1-a50a-6f8b784e724b	Gardasil	SIMPLE	PIECE	Vacuna pediátrica	1200.00	15	2025-06-25 23:29:59.463	2025-07-01 00:49:42.948	Vacunas Pediátricas
2cf05df2-50c7-491d-bcd7-48a0e4040ecb	Gardasil 9	SIMPLE	PIECE	Vacuna pediátrica	1500.00	15	2025-06-25 23:29:59.463	2025-07-01 00:49:42.949	Vacunas Pediátricas
1872cc93-d239-4cc2-b6f8-1cb053d1ddf9	Hepatitis A y B	SIMPLE	PIECE	Vacuna pediátrica	600.00	15	2025-06-25 23:29:59.464	2025-07-01 00:49:42.95	Vacunas Pediátricas
d12322ed-fa13-4038-8d0a-c7670dc9642a	Fiebre Amarilla	SIMPLE	PIECE	Vacuna pediátrica	400.00	15	2025-06-25 23:29:59.465	2025-07-01 00:49:42.951	Vacunas Pediátricas
03f12a43-dabe-41d9-86f0-04b2230f65bd	Herpes Zóster	SIMPLE	PIECE	Vacuna pediátrica	2000.00	15	2025-06-25 23:29:59.465	2025-07-01 00:49:42.952	Vacunas Pediátricas
91dc17bc-6459-46ca-86f8-621d3e3b425f	Influenza	SIMPLE	PIECE	Vacuna pediátrica	300.00	15	2025-06-25 23:29:59.466	2025-07-01 00:49:42.955	Vacunas Pediátricas
727f19d9-75aa-4bf8-bcb8-41ef9c33930c	Menactra	SIMPLE	PIECE	Vacuna pediátrica	1200.00	15	2025-06-25 23:29:59.467	2025-07-01 00:49:42.955	Vacunas Pediátricas
51e7b8a0-9e54-4c4b-8dee-8ba6da75a5ef	MMR	SIMPLE	PIECE	Vacuna pediátrica	500.00	15	2025-06-25 23:29:59.468	2025-07-01 00:49:42.956	Vacunas Pediátricas
0e66888b-9544-45de-9d5c-4daaa0aa94bd	Prevenar 13 V	SIMPLE	PIECE	Vacuna pediátrica	1800.00	15	2025-06-25 23:29:59.468	2025-07-01 00:49:42.957	Vacunas Pediátricas
a465643c-b3bf-40b3-a3ff-cb3751af6dfe	Pulmovax	SIMPLE	PIECE	Vacuna pediátrica	700.00	15	2025-06-25 23:29:59.469	2025-07-01 00:49:42.959	Vacunas Pediátricas
bdb8a1df-e65d-41a8-966c-204a32a02009	Rota Teq	SIMPLE	PIECE	Vacuna pediátrica	900.00	15	2025-06-25 23:29:59.47	2025-07-01 00:49:42.959	Vacunas Pediátricas
ebbc0e6a-e2ec-4bbc-b7ce-9bfa5b91de7d	Vaqta	SIMPLE	PIECE	Vacuna pediátrica	400.00	15	2025-06-25 23:29:59.47	2025-07-01 00:49:42.96	Vacunas Pediátricas
5953f8d7-6451-4901-941b-95d3477adf8d	Varivax	SIMPLE	PIECE	Vacuna pediátrica	600.00	15	2025-06-25 23:29:59.471	2025-07-01 00:49:42.961	Vacunas Pediátricas
4afbe49f-8899-435f-9ba8-2355d1dc45ea	Bacmune	SIMPLE	PIECE	Medicamento extra	150.00	25	2025-06-25 23:29:59.472	2025-07-01 00:49:42.962	Medicamentos
dc26539a-2b36-408b-bfe8-5cade57c3750	Transferón	SIMPLE	PIECE	Medicamento extra	200.00	25	2025-06-25 23:29:59.472	2025-07-01 00:49:42.963	Medicamentos
169e9c59-4521-48fc-aae9-9f3a9a00ba13	Nebulización	SIMPLE	PIECE	Medicamento extra	80.00	25	2025-06-25 23:29:59.473	2025-07-01 00:49:42.965	Medicamentos
8a624d62-3be3-4dd5-9f32-dc15481d9c23	Hizentra 4GR	SIMPLE	PIECE	Gammaglobulina	8000.00	5	2025-06-25 23:29:59.459	2025-07-01 00:49:42.965	Gammaglobulina
e0b36cea-fd47-42be-8dd7-163fffdb10c8	Hizentra 2GR	SIMPLE	PIECE	Gammaglobulina	4000.00	5	2025-06-25 23:29:59.459	2025-07-01 00:49:42.966	Gammaglobulina
7b4a8197-bd0f-4be1-ae43-19208c6848f8	TENGELINE 10% 5G/50ML	SIMPLE	PIECE	Gammaglobulina	6000.00	5	2025-06-25 23:29:59.46	2025-07-01 00:49:42.966	Gammaglobulina
6c5a5312-a2ad-46ec-a1b0-96c899f48b16	TENGELINE 10G/100ML	SIMPLE	PIECE	Gammaglobulina	12000.00	5	2025-06-25 23:29:59.461	2025-07-01 00:49:42.967	Gammaglobulina
916822f7-dd60-4a21-aa0a-f6552a4bfe31	HIGLOBIN 10GR	SIMPLE	PIECE	Gammaglobulina	10000.00	5	2025-06-25 23:29:59.461	2025-07-01 00:49:42.967	Gammaglobulina
fa818135-51c0-4680-97cb-557ea5308a26	Pruebas con Alimentos	SIMPLE	PIECE	Prueba de diagnóstico	450.00	20	2025-06-25 23:29:59.455	2025-07-01 00:49:42.969	Pruebas
f711c032-4afd-4486-97dc-56361adcd336	Evans	SIMPLE	ML	Diluyente para inmunoterapia	30.00	100	2025-06-25 23:29:59.475	2025-07-01 00:49:42.97	Pruebas
4a42fa1e-a6e7-49c1-874a-01b4612873b1	Phadiatop	SIMPLE	PIECE	Prueba de diagnóstico	400.00	20	2025-06-25 23:29:59.454	2025-07-01 00:49:42.971	Pruebas
4998cdde-f9bd-4f35-a0fc-ed93d752317d	Influenza A y B / Sincitial / Adenovirus	SIMPLE	PIECE	Prueba de diagnóstico	500.00	20	2025-06-25 23:29:59.458	2025-07-01 00:49:42.971	Pruebas
9c86d8ec-3564-450a-9d29-cef1ac5de2a4	VITS	SIMPLE	ML	Diluyente para inmunoterapia	40.00	100	2025-06-25 23:29:59.475	2025-07-01 00:49:42.972	Pruebas
f09bdd01-a9eb-4e15-9717-fa18d30293c3	Prick to Prick	SIMPLE	PIECE	Prueba de diagnóstico	350.00	20	2025-06-25 23:29:59.455	2025-07-01 00:49:42.972	Pruebas
bc6a60cb-59bf-4809-9d9f-d733afd2869d	Cucaracha	SIMPLE	ML	Alérgeno: Cucaracha	25.00	50	2025-06-25 23:29:59.484	2025-06-25 23:29:59.484	\N
6b11bcd8-37bf-4c0a-b097-0bf511c4b788	Producto de Prueba	SIMPLE	PIECE	Producto de prueba para verificar funcionalidad	100.00	10	2025-06-28 01:19:53.523	2025-06-28 01:19:53.523	\N
d8234d52-572f-4e7a-95b2-0e14e7d55c0d	COVID	SIMPLE	PIECE	\N	800.00	10	2025-06-28 01:24:22.94	2025-06-28 01:24:22.94	\N
d46eb8d9-6b42-478a-bd70-9411209ea633	Covid-19	SIMPLE	PIECE	\N	800.00	10	2025-06-28 01:24:53.729	2025-06-28 01:24:53.729	\N
6a762bfe-9350-4efd-afea-7d3821d39cdd	Fiebre Roja	SIMPLE	PIECE	\N	700.00	10	2025-06-28 01:25:52.242	2025-06-28 01:25:52.242	\N
1d0b348f-ee58-44f0-8318-8a4b8715e847	Polio	SIMPLE	PIECE	\N	600.00	10	2025-06-28 01:42:24.265	2025-06-28 01:42:24.265	\N
6136fe52-4f31-4346-8d29-d737dcdd9b61	Tetanos	SIMPLE	PIECE	\N	10.00	10	2025-06-28 01:46:34.973	2025-06-28 01:46:34.973	\N
bf4256ee-2174-45cb-b91f-52d8ee6687ff	Facundo	SIMPLE	PIECE	\N	60.00	10	2025-06-28 01:49:24.228	2025-06-28 01:49:24.228	\N
3d801e89-876b-4261-a69d-d3414d366120	Sarampión	SIMPLE	PIECE	\N	7000.00	10	2025-06-28 02:00:54.004	2025-06-28 02:00:54.004	\N
f67d1474-1189-45f6-8e73-1e99e727117b	Tos ferina	SIMPLE	PIECE	\N	6000.00	10	2025-06-28 02:03:59.921	2025-06-28 02:03:59.921	\N
9ad09fa7-3de3-4bed-9a54-f9e391e26035	Varicela	SIMPLE	PIECE	\N	900.00	10	2025-06-28 02:21:15.42	2025-06-28 02:21:15.42	Vacunas Pediátricas
4acf0843-ba8d-4c7c-84ce-616f387115e5	Cupressus Arizónica	SIMPLE	ML	Alérgeno: Cupressus Arizónica	25.00	50	2025-06-25 23:29:59.493	2025-07-01 00:29:32.885	Alérgenos Alxoid
51bfbc07-105c-44fd-9512-1b07c663266f	Fresno	SIMPLE	ML	Alérgeno: Fresno	25.00	50	2025-06-25 23:29:59.494	2025-07-01 00:29:32.919	Alérgenos Alxoid
f76238a9-2735-46f4-8e7b-5268f585742e	Gramínea con sinodon	SIMPLE	ML	Alérgeno: Gramínea con sinodon	25.00	50	2025-06-25 23:29:59.495	2025-07-01 00:29:32.92	Alérgenos Alxoid
4c732e19-ff02-43d8-b990-07b0c929738d	Sinodon	SIMPLE	ML	Alérgeno: Sinodon	25.00	50	2025-06-25 23:29:59.495	2025-07-01 00:29:32.921	Alérgenos Alxoid
faf767b4-e52e-4092-85cf-2bf5318f3687	6 Gramíneas	SIMPLE	ML	Alérgeno: 6 Gramíneas	25.00	50	2025-06-25 23:29:59.496	2025-07-01 00:29:32.923	Alérgenos Alxoid
65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	Ambrosía A	SIMPLE	ML	Alérgeno: Ambrosía A	25.00	50	2025-06-25 23:29:59.497	2025-07-01 00:29:32.924	Alérgenos Alxoid
9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	Ácaros A	SIMPLE	ML	Alérgeno: Ácaros A	25.00	50	2025-06-25 23:29:59.499	2025-07-01 00:29:32.925	Alérgenos Alxoid
6f24161c-07ca-4385-9ed7-86b16d4f66e7	Encino A	SIMPLE	ML	Alérgeno: Encino A	25.00	50	2025-06-25 23:29:59.499	2025-07-01 00:29:32.925	Alérgenos Alxoid
5db42a64-dbc4-4193-aa9b-bbe4353ff5ac	Gato A	SIMPLE	ML	Alérgeno: Gato A	25.00	50	2025-06-25 23:29:59.5	2025-07-01 00:29:32.927	Alérgenos Alxoid
2e6f2d2f-f6e5-44bd-8c34-89d20411b9ec	Perro A	SIMPLE	ML	Alérgeno: Perro A	25.00	50	2025-06-25 23:29:59.501	2025-07-01 00:29:32.928	Alérgenos Alxoid
5a62cd5f-4232-49ac-87bd-d16fcdff71ac	Cupressus Arizónica B	SIMPLE	ML	Alérgeno: Cupressus Arizónica B	25.00	50	2025-06-25 23:29:59.501	2025-07-01 00:29:32.929	Alérgenos Alxoid
9596f4fa-427a-4054-bb14-8f85393b268e	Fresno B	SIMPLE	ML	Alérgeno: Fresno B	25.00	50	2025-06-25 23:29:59.502	2025-07-01 00:29:32.929	Alérgenos Alxoid
5bbc0b82-1083-424d-90eb-2b16db2cb1c8	Gramínea con sinodon B	SIMPLE	ML	Alérgeno: Gramínea con sinodon B	25.00	50	2025-06-25 23:29:59.502	2025-07-01 00:29:32.93	Alérgenos Alxoid
90432799-ba35-4ad0-af0f-d7a23ca05141	Sinodon B	SIMPLE	ML	Alérgeno: Sinodon B	25.00	50	2025-06-25 23:29:59.503	2025-07-01 00:29:32.931	Alérgenos Alxoid
00665ad8-bb36-4dfc-a4ca-3acfd28c8f4a	6 Gramíneas B	SIMPLE	ML	Alérgeno: 6 Gramíneas B	25.00	50	2025-06-25 23:29:59.504	2025-07-01 00:29:32.932	Alérgenos Alxoid
3c861ca7-9cde-4edb-a68e-7799ed079a10	Ambrosía B	SIMPLE	ML	Alérgeno: Ambrosía B	25.00	50	2025-06-25 23:29:59.505	2025-07-01 00:29:32.933	Alérgenos Alxoid
7991e86a-63e0-4408-9ff8-f61fd43bc6ff	Ácaros B	SIMPLE	ML	Alérgeno: Ácaros B	25.00	50	2025-06-25 23:29:59.505	2025-07-01 00:29:32.934	Alérgenos Alxoid
8d82d5f2-7fc2-4b04-bff1-b08dd27b26e2	Encino B	SIMPLE	ML	Alérgeno: Encino B	25.00	50	2025-06-25 23:29:59.506	2025-07-01 00:29:32.935	Alérgenos Alxoid
2d015143-d610-45ad-b011-d108e638d268	Gato B	SIMPLE	ML	Alérgeno: Gato B	25.00	50	2025-06-25 23:29:59.507	2025-07-01 00:29:32.936	Alérgenos Alxoid
462dc5aa-7313-4683-84e2-095a4b501d86	Perro B	SIMPLE	ML	Alérgeno: Perro B	25.00	50	2025-06-25 23:29:59.507	2025-07-01 00:29:32.936	Alérgenos Alxoid
5b50199d-8229-48e9-aebd-671b62743e3a	Abedul	SIMPLE	ML	Alérgeno: Abedul	25.00	50	2025-06-25 23:29:59.477	2025-07-01 00:29:32.937	Alérgenos
bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	Trueno	SIMPLE	ML	Alérgeno: Trueno	25.00	50	2025-06-25 23:29:59.488	2025-07-01 00:29:32.946	Alérgenos
f8958811-1ba7-4091-95dd-04adce74999b	Manzana	SIMPLE	ML	Alérgeno: Manzana	25.00	50	2025-06-25 23:29:59.484	2025-07-01 00:29:32.947	Alérgenos
73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	Mezcla pastos	SIMPLE	ML	Alérgeno: Mezcla pastos	25.00	50	2025-06-25 23:29:59.485	2025-07-01 00:29:32.947	Alérgenos
33ba649a-c16a-4034-8572-a4cbebfb1466	Alheña	SIMPLE	ML	Alérgeno: Alheña	25.00	50	2025-06-25 23:29:59.489	2025-07-01 00:49:42.932	Alérgenos
c1415bee-5de0-4ad5-b8b6-98f90b26716d	Camarón	SIMPLE	ML	Alérgeno: Camarón	25.00	50	2025-06-25 23:29:59.48	2025-07-01 00:49:42.935	Alérgenos
43d1bea0-3582-43b4-b696-fba5f0975716	Ciprés de Arizona	SIMPLE	ML	Alérgeno: Ciprés de Arizona	25.00	50	2025-06-25 23:29:59.482	2025-07-01 00:49:42.936	Alérgenos
107a5174-f104-481c-8f0c-423516121816	Encino	SIMPLE	ML	Alérgeno: Encino	25.00	50	2025-06-25 23:29:59.482	2025-07-01 00:49:42.937	Alérgenos
c6e72fab-7bd0-49f3-920e-67ebe5b68968	Fresno blanco	SIMPLE	ML	Alérgeno: Fresno blanco	25.00	50	2025-06-25 23:29:59.483	2025-07-01 00:49:42.937	Alérgenos
2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	Gato	SIMPLE	ML	Alérgeno: Gato	25.00	50	2025-06-25 23:29:59.483	2025-07-01 00:49:42.939	Alérgenos
237f1416-27c1-4a32-888e-08845f2d1ba0	Mezcla cucarachas	SIMPLE	ML	Alérgeno: Mezcla cucarachas	25.00	50	2025-06-25 23:29:59.489	2025-07-01 00:49:42.94	Alérgenos
12d456d0-76ed-45e1-9eb3-fb24243776a1	Mezquite	SIMPLE	ML	Alérgeno: Mezquite	25.00	50	2025-06-25 23:29:59.49	2025-07-01 00:49:42.941	Alérgenos
069c3139-7f2d-4be0-8faf-17338e136d5d	Perro	SIMPLE	ML	Alérgeno: Perro	25.00	50	2025-06-25 23:29:59.486	2025-07-01 00:49:42.942	Alérgenos
64578478-9177-4064-9292-deb9bd0ca78d	Pescado varios	SIMPLE	ML	Alérgeno: Pescado varios	25.00	50	2025-06-25 23:29:59.486	2025-07-01 00:49:42.943	Alérgenos
25ea1918-1cbc-4f2d-b80a-5534b4f060b2	Pino blanco	SIMPLE	ML	Alérgeno: Pino blanco	25.00	50	2025-06-25 23:29:59.487	2025-07-01 00:49:42.943	Alérgenos
542e1128-5daa-49a8-bdab-7219e8b5a9fc	Pistache	SIMPLE	ML	Alérgeno: Pistache	25.00	50	2025-06-25 23:29:59.488	2025-07-01 00:49:42.944	Alérgenos
390fbc3f-6e5b-4942-be4e-ed50499f8da7	Sweet gum	SIMPLE	ML	Alérgeno: Sweet gum	25.00	50	2025-06-25 23:29:59.491	2025-07-01 00:49:42.944	Alérgenos
b2549870-d709-44b4-8f94-e14ceb8b7286	Adacel Boost	SIMPLE	PIECE	Vacuna pediátrica	800.00	15	2025-06-25 23:29:59.462	2025-07-01 00:49:42.946	Vacunas Pediátricas
6369a243-b80b-4736-9970-5b1f809b75ed	Hexacima	SIMPLE	PIECE	Vacuna pediátrica	1000.00	15	2025-06-25 23:29:59.466	2025-07-01 00:49:42.954	Vacunas Pediátricas
a4be1035-d7f6-480e-a1ef-7ffb1cdda671	Proquad	SIMPLE	PIECE	Vacuna pediátrica	1600.00	15	2025-06-25 23:29:59.469	2025-07-01 00:49:42.957	Vacunas Pediátricas
69e9b832-d342-474d-a507-133f2d5c1553	Diprospán	SIMPLE	PIECE	Medicamento extra	100.00	25	2025-06-25 23:29:59.473	2025-07-01 00:49:42.964	Medicamentos
e8eb7443-7e41-4f70-a382-a49cbf61fe50	ALEX Molecular	SIMPLE	PIECE	Prueba de diagnóstico	500.00	20	2025-06-25 23:29:59.453	2025-07-01 00:49:42.968	Pruebas
9996676c-7438-472c-9e9e-d84df1d12b25	Consulta	SIMPLE	PIECE	Consulta médica	500.00	30	2025-06-26 01:46:13.849	2025-07-01 00:49:42.97	Servicios
\.


--
-- Data for Name: ProductAllergen; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."ProductAllergen" (id, "productId", "allergenId", "mlPerDose", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductExpiration; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."ProductExpiration" (id, "productId", "sedeId", "batchNumber", "expiryDate", quantity, "createdAt", "updatedAt") FROM stdin;
365ff6a8-5894-4347-ae56-42849db66e43	249e50ad-95aa-4479-a343-aff4c08d7b90	sede-tecamachalco	BATCH-249e50ad	2026-06-25 23:29:59.519	50	2025-06-25 23:29:59.522	2025-06-25 23:29:59.522
29aa6ced-9504-48f1-b5f9-b5d359c1a5cf	249e50ad-95aa-4479-a343-aff4c08d7b90	sede-angeles	BATCH-249e50ad	2026-06-25 23:29:59.519	50	2025-06-25 23:29:59.524	2025-06-25 23:29:59.524
5bc528ce-e8a4-4ab1-9ddc-b6835bb16c6d	7e7c2791-ace4-4595-a311-0dcd3ef808c0	sede-tecamachalco	BATCH-7e7c2791	2026-06-25 23:29:59.526	50	2025-06-25 23:29:59.527	2025-06-25 23:29:59.527
401ffb1a-d15f-4904-b809-5e145b5e071a	7e7c2791-ace4-4595-a311-0dcd3ef808c0	sede-angeles	BATCH-7e7c2791	2026-06-25 23:29:59.526	50	2025-06-25 23:29:59.528	2025-06-25 23:29:59.528
02a9e6c3-956e-4629-a864-aa54ef7ab435	c42bd3ae-d693-4e17-9051-ba867aadeb0a	sede-tecamachalco	BATCH-c42bd3ae	2026-06-25 23:29:59.53	50	2025-06-25 23:29:59.531	2025-06-25 23:29:59.531
3a8237ba-5c4d-4f9d-b079-8706f81b0f3f	c42bd3ae-d693-4e17-9051-ba867aadeb0a	sede-angeles	BATCH-c42bd3ae	2026-06-25 23:29:59.53	50	2025-06-25 23:29:59.532	2025-06-25 23:29:59.532
d4d1413f-ce45-47ba-89b7-1493e412c635	99123789-b161-4b25-bb40-d35f2fc33658	sede-tecamachalco	BATCH-99123789	2026-06-25 23:29:59.534	50	2025-06-25 23:29:59.535	2025-06-25 23:29:59.535
1005a012-5bd1-4cba-93a4-793b7e655de7	99123789-b161-4b25-bb40-d35f2fc33658	sede-angeles	BATCH-99123789	2026-06-25 23:29:59.534	50	2025-06-25 23:29:59.536	2025-06-25 23:29:59.536
b6c03918-e746-4b6a-af91-73fc9b23fff4	574d9e50-49e1-47cc-affd-9a67512c60cf	sede-tecamachalco	BATCH-574d9e50	2026-06-25 23:29:59.537	50	2025-06-25 23:29:59.538	2025-06-25 23:29:59.538
a3cc091d-bb21-4b56-9061-c7b78c3bf04e	574d9e50-49e1-47cc-affd-9a67512c60cf	sede-angeles	BATCH-574d9e50	2026-06-25 23:29:59.537	50	2025-06-25 23:29:59.539	2025-06-25 23:29:59.539
aaaa7fc3-0510-4dc7-b9bb-88330e1f9503	9a3e07fc-f69a-46c5-a4c4-188779f38a8d	sede-tecamachalco	BATCH-9a3e07fc	2026-06-25 23:29:59.541	50	2025-06-25 23:29:59.542	2025-06-25 23:29:59.542
0406e392-c5cf-4b77-8a92-a7b13f143cc3	9a3e07fc-f69a-46c5-a4c4-188779f38a8d	sede-angeles	BATCH-9a3e07fc	2026-06-25 23:29:59.541	50	2025-06-25 23:29:59.542	2025-06-25 23:29:59.542
51adb997-08ee-4142-a65c-ad4d341939c8	da4226b2-86f1-4509-840a-b93dc8d55cbd	sede-tecamachalco	BATCH-da4226b2	2026-06-25 23:29:59.544	50	2025-06-25 23:29:59.545	2025-06-25 23:29:59.545
1dfe2401-a27f-4b1a-873b-4cdd962967f6	da4226b2-86f1-4509-840a-b93dc8d55cbd	sede-angeles	BATCH-da4226b2	2026-06-25 23:29:59.544	50	2025-06-25 23:29:59.546	2025-06-25 23:29:59.546
a6ee4009-4992-438c-b317-bd7039edec19	6b77c255-c412-4fd7-95dd-dcdf1516a6e3	sede-tecamachalco	BATCH-6b77c255	2026-06-25 23:29:59.547	50	2025-06-25 23:29:59.548	2025-06-25 23:29:59.548
f04170a9-1aea-4d55-80c8-18d00fabd380	6b77c255-c412-4fd7-95dd-dcdf1516a6e3	sede-angeles	BATCH-6b77c255	2026-06-25 23:29:59.547	50	2025-06-25 23:29:59.549	2025-06-25 23:29:59.549
bd52e875-5915-4b22-a7a2-8d4523fad032	5113a8cd-ee6b-4b68-987a-c3a5787d84de	sede-tecamachalco	BATCH-5113a8cd	2026-06-25 23:29:59.55	50	2025-06-25 23:29:59.551	2025-06-25 23:29:59.551
65265e10-f1e3-42b2-9915-a63ef22f6518	5113a8cd-ee6b-4b68-987a-c3a5787d84de	sede-angeles	BATCH-5113a8cd	2026-06-25 23:29:59.55	50	2025-06-25 23:29:59.552	2025-06-25 23:29:59.552
9c151ab5-f9ea-4f61-8797-289d38395e32	43c78bf4-2668-4355-85cc-33e914299d9f	sede-tecamachalco	BATCH-43c78bf4	2026-06-25 23:29:59.554	50	2025-06-25 23:29:59.554	2025-06-25 23:29:59.554
a898e674-eb70-487a-94c3-daa4c9700b0c	43c78bf4-2668-4355-85cc-33e914299d9f	sede-angeles	BATCH-43c78bf4	2026-06-25 23:29:59.554	50	2025-06-25 23:29:59.555	2025-06-25 23:29:59.555
6ecfa047-8978-4e62-8749-48dd8d891492	af1aaeaa-a196-4c41-95ab-31fed7d4ab37	sede-tecamachalco	BATCH-af1aaeaa	2026-06-25 23:29:59.557	50	2025-06-25 23:29:59.558	2025-06-25 23:29:59.558
d85f7522-467a-466b-ae0c-d5d159d11825	af1aaeaa-a196-4c41-95ab-31fed7d4ab37	sede-angeles	BATCH-af1aaeaa	2026-06-25 23:29:59.557	50	2025-06-25 23:29:59.559	2025-06-25 23:29:59.559
226a4735-25dd-4fc9-89d0-2535c56f36a4	c53b40ac-9137-4479-8a4a-e81afde0d559	sede-tecamachalco	BATCH-c53b40ac	2026-06-25 23:29:59.56	50	2025-06-25 23:29:59.561	2025-06-25 23:29:59.561
49db1ded-80d3-4139-a3be-7f4a765f4e52	c53b40ac-9137-4479-8a4a-e81afde0d559	sede-angeles	BATCH-c53b40ac	2026-06-25 23:29:59.56	50	2025-06-25 23:29:59.562	2025-06-25 23:29:59.562
600c183c-6d2e-4f62-bd5b-e25dcecc702b	2694e937-ba38-404d-b57f-e746d2dcb37f	sede-tecamachalco	BATCH-2694e937	2026-06-25 23:29:59.563	50	2025-06-25 23:29:59.564	2025-06-25 23:29:59.564
15ba245d-fd2a-48f8-92af-33226f3ee013	2694e937-ba38-404d-b57f-e746d2dcb37f	sede-angeles	BATCH-2694e937	2026-06-25 23:29:59.563	50	2025-06-25 23:29:59.565	2025-06-25 23:29:59.565
7845e4f5-f6c5-4a59-825a-f284e505a4b2	0bc09c44-68e0-4c81-8ae9-f4bf19ffd40c	sede-tecamachalco	BATCH-0bc09c44	2026-06-25 23:29:59.567	50	2025-06-25 23:29:59.568	2025-06-25 23:29:59.568
781b9d09-c79e-47ee-9eff-3d8a6d16f77d	0bc09c44-68e0-4c81-8ae9-f4bf19ffd40c	sede-angeles	BATCH-0bc09c44	2026-06-25 23:29:59.567	50	2025-06-25 23:29:59.568	2025-06-25 23:29:59.568
733fda59-e4a6-428a-b63a-5ad78a0d9a6b	e8eb7443-7e41-4f70-a382-a49cbf61fe50	sede-angeles	BATCH-e8eb7443	2026-06-25 23:29:59.57	50	2025-06-25 23:29:59.572	2025-06-25 23:29:59.572
a6a1faab-4523-44ba-a02d-9f1b7e449da2	4a42fa1e-a6e7-49c1-874a-01b4612873b1	sede-angeles	BATCH-4a42fa1e	2026-06-25 23:29:59.573	50	2025-06-25 23:29:59.575	2025-06-25 23:29:59.575
f50d628c-0162-41d8-a836-663effb8817a	1cf46547-64ac-43c4-b728-261e6602ec50	sede-angeles	BATCH-1cf46547	2026-06-25 23:29:59.577	50	2025-06-25 23:29:59.579	2025-06-25 23:29:59.579
ba01f7c7-224f-4f55-9159-57a531089a71	f09bdd01-a9eb-4e15-9717-fa18d30293c3	sede-angeles	BATCH-f09bdd01	2026-06-25 23:29:59.582	50	2025-06-25 23:29:59.583	2025-06-25 23:29:59.583
1f5e9f3b-6982-48c3-88a7-7c3a9bc22c52	fa818135-51c0-4680-97cb-557ea5308a26	sede-angeles	BATCH-fa818135	2026-06-25 23:29:59.585	50	2025-06-25 23:29:59.587	2025-06-25 23:29:59.587
51648992-da27-4f74-8aab-8b8a85fcaa04	d5783698-a8c6-479b-b945-55c057cb3a78	sede-tecamachalco	BATCH-d5783698	2026-06-25 23:29:59.588	50	2025-06-25 23:29:59.589	2025-06-25 23:29:59.589
756810a7-2cf5-4cad-93cd-b98c85a1fbcf	d5783698-a8c6-479b-b945-55c057cb3a78	sede-angeles	BATCH-d5783698	2026-06-25 23:29:59.588	50	2025-06-25 23:29:59.59	2025-06-25 23:29:59.59
d516cd06-7044-43b5-ac04-f4cbc00a750b	d787c319-95cf-4f35-a876-cc06d6b1b420	sede-tecamachalco	BATCH-d787c319	2026-06-25 23:29:59.592	50	2025-06-25 23:29:59.593	2025-06-25 23:29:59.593
a4165f81-40cc-4bd3-9c28-f11b0fe0fb4a	d787c319-95cf-4f35-a876-cc06d6b1b420	sede-angeles	BATCH-d787c319	2026-06-25 23:29:59.592	50	2025-06-25 23:29:59.594	2025-06-25 23:29:59.594
d6fe2edf-928d-47d9-bbc6-3eccdd856780	dc97705a-d682-4d8b-9e8c-0c94f17169e8	sede-tecamachalco	BATCH-dc97705a	2026-06-25 23:29:59.595	50	2025-06-25 23:29:59.596	2025-06-25 23:29:59.596
50678a6a-4d41-4aad-9e86-d97ad454189b	dc97705a-d682-4d8b-9e8c-0c94f17169e8	sede-angeles	BATCH-dc97705a	2026-06-25 23:29:59.595	50	2025-06-25 23:29:59.597	2025-06-25 23:29:59.597
c97b95b9-54b6-4638-a60b-f5f04d306f57	d4a4dca9-ba0a-45d0-a0e4-c0ed76d7a84e	sede-tecamachalco	BATCH-d4a4dca9	2026-06-25 23:29:59.598	50	2025-06-25 23:29:59.599	2025-06-25 23:29:59.599
208501aa-6d5a-4e84-9930-ef5c658819d1	d4a4dca9-ba0a-45d0-a0e4-c0ed76d7a84e	sede-angeles	BATCH-d4a4dca9	2026-06-25 23:29:59.598	50	2025-06-25 23:29:59.6	2025-06-25 23:29:59.6
e1ac9264-5c8a-4807-a26e-d082745c48ee	4998cdde-f9bd-4f35-a0fc-ed93d752317d	sede-angeles	BATCH-4998cdde	2026-06-25 23:29:59.602	50	2025-06-25 23:29:59.603	2025-06-25 23:29:59.603
542d4257-1db6-4b55-a327-f9a19872ad54	1cf46547-64ac-43c4-b728-261e6602ec50	sede-tecamachalco	BATCH-1cf46547	2026-06-25 23:29:59.577	49	2025-06-25 23:29:59.578	2025-06-26 00:12:58.152
801b5929-71d5-4129-a263-d72c6f7340bd	4998cdde-f9bd-4f35-a0fc-ed93d752317d	sede-tecamachalco	BATCH-4998cdde	2026-06-25 23:29:59.602	45	2025-06-25 23:29:59.603	2025-06-26 01:05:04.65
76a4199a-df77-45ee-a494-c74ab70ad405	4a42fa1e-a6e7-49c1-874a-01b4612873b1	sede-tecamachalco	BATCH-4a42fa1e	2026-06-25 23:29:59.573	35	2025-06-25 23:29:59.574	2025-06-26 01:40:09.973
cfebc4e6-b704-49b5-91e0-3dff685b67c8	f09bdd01-a9eb-4e15-9717-fa18d30293c3	sede-tecamachalco	BATCH-f09bdd01	2026-06-25 23:29:59.582	46	2025-06-25 23:29:59.583	2025-06-26 01:29:41.382
5f038514-a669-4736-af2a-6c00cce27e8d	8a624d62-3be3-4dd5-9f32-dc15481d9c23	sede-angeles	BATCH-8a624d62	2026-06-25 23:29:59.606	50	2025-06-25 23:29:59.608	2025-06-25 23:29:59.608
0c945af9-7ee2-4dac-bf39-7931afa7a6fe	e0b36cea-fd47-42be-8dd7-163fffdb10c8	sede-tecamachalco	BATCH-e0b36cea	2026-06-25 23:29:59.61	50	2025-06-25 23:29:59.611	2025-06-25 23:29:59.611
b263c9a8-08a5-4ae6-bcde-72d26f298e3b	e0b36cea-fd47-42be-8dd7-163fffdb10c8	sede-angeles	BATCH-e0b36cea	2026-06-25 23:29:59.61	50	2025-06-25 23:29:59.612	2025-06-25 23:29:59.612
0b78f659-4cbc-4f41-bcce-9704c64034e1	7b4a8197-bd0f-4be1-ae43-19208c6848f8	sede-tecamachalco	BATCH-7b4a8197	2026-06-25 23:29:59.613	50	2025-06-25 23:29:59.614	2025-06-25 23:29:59.614
b5b81485-dee0-4343-91b4-c51cada60846	7b4a8197-bd0f-4be1-ae43-19208c6848f8	sede-angeles	BATCH-7b4a8197	2026-06-25 23:29:59.613	50	2025-06-25 23:29:59.615	2025-06-25 23:29:59.615
33617377-b387-4abf-aab6-440f4c92be4f	6c5a5312-a2ad-46ec-a1b0-96c899f48b16	sede-tecamachalco	BATCH-6c5a5312	2026-06-25 23:29:59.616	50	2025-06-25 23:29:59.617	2025-06-25 23:29:59.617
62186e57-81b2-4eb1-9266-6b53f14f0602	6c5a5312-a2ad-46ec-a1b0-96c899f48b16	sede-angeles	BATCH-6c5a5312	2026-06-25 23:29:59.616	50	2025-06-25 23:29:59.618	2025-06-25 23:29:59.618
ac18e351-2706-402c-bcb4-3ccbd09a838a	916822f7-dd60-4a21-aa0a-f6552a4bfe31	sede-angeles	BATCH-916822f7	2026-06-25 23:29:59.62	50	2025-06-25 23:29:59.622	2025-06-25 23:29:59.622
40bc75e3-928a-4e92-b48d-3bb167141cf3	b2549870-d709-44b4-8f94-e14ceb8b7286	sede-angeles	BATCH-b2549870	2026-06-25 23:29:59.623	50	2025-06-25 23:29:59.625	2025-06-25 23:29:59.625
69375d1c-63f5-4f93-be95-bbf1edec09a4	a6dc9555-b0b8-4da1-a50a-6f8b784e724b	sede-tecamachalco	BATCH-a6dc9555	2026-06-25 23:29:59.627	50	2025-06-25 23:29:59.628	2025-06-25 23:29:59.628
e3cc1be2-28a2-435a-9d92-35011d1ef1f4	a6dc9555-b0b8-4da1-a50a-6f8b784e724b	sede-angeles	BATCH-a6dc9555	2026-06-25 23:29:59.627	50	2025-06-25 23:29:59.629	2025-06-25 23:29:59.629
1acaf495-4029-4738-b33d-4c1b0bf26bdc	2cf05df2-50c7-491d-bcd7-48a0e4040ecb	sede-tecamachalco	BATCH-2cf05df2	2026-06-25 23:29:59.63	50	2025-06-25 23:29:59.631	2025-06-25 23:29:59.631
a654e4ef-85f8-4d5c-ad28-9c64cb2161d2	2cf05df2-50c7-491d-bcd7-48a0e4040ecb	sede-angeles	BATCH-2cf05df2	2026-06-25 23:29:59.63	50	2025-06-25 23:29:59.632	2025-06-25 23:29:59.632
15ee37d0-254e-42f7-a04c-84e1d0d6ac82	1872cc93-d239-4cc2-b6f8-1cb053d1ddf9	sede-tecamachalco	BATCH-1872cc93	2026-06-25 23:29:59.633	50	2025-06-25 23:29:59.634	2025-06-25 23:29:59.634
67b5ca47-1397-4e26-8a84-dcb6c9966132	1872cc93-d239-4cc2-b6f8-1cb053d1ddf9	sede-angeles	BATCH-1872cc93	2026-06-25 23:29:59.633	50	2025-06-25 23:29:59.635	2025-06-25 23:29:59.635
b552669f-fcd4-48dd-ba1d-1d07bd17a4d0	d12322ed-fa13-4038-8d0a-c7670dc9642a	sede-tecamachalco	BATCH-d12322ed	2026-06-25 23:29:59.636	50	2025-06-25 23:29:59.637	2025-06-25 23:29:59.637
b7625e72-099c-4060-bd23-0a6666362668	d12322ed-fa13-4038-8d0a-c7670dc9642a	sede-angeles	BATCH-d12322ed	2026-06-25 23:29:59.636	50	2025-06-25 23:29:59.638	2025-06-25 23:29:59.638
01eb2bb0-d63d-4a32-b4ec-102e7687d408	03f12a43-dabe-41d9-86f0-04b2230f65bd	sede-tecamachalco	BATCH-03f12a43	2026-06-25 23:29:59.639	50	2025-06-25 23:29:59.64	2025-06-25 23:29:59.64
12c8bf24-d075-47e9-8f91-52d6d1338a0a	03f12a43-dabe-41d9-86f0-04b2230f65bd	sede-angeles	BATCH-03f12a43	2026-06-25 23:29:59.639	50	2025-06-25 23:29:59.641	2025-06-25 23:29:59.641
6993d380-24ac-49a2-b8a2-81017676f85d	6369a243-b80b-4736-9970-5b1f809b75ed	sede-tecamachalco	BATCH-6369a243	2026-06-25 23:29:59.643	50	2025-06-25 23:29:59.644	2025-06-25 23:29:59.644
b72d736a-1925-41b8-a819-a1773d4f2254	6369a243-b80b-4736-9970-5b1f809b75ed	sede-angeles	BATCH-6369a243	2026-06-25 23:29:59.643	50	2025-06-25 23:29:59.645	2025-06-25 23:29:59.645
413d7fc1-15f9-41a2-a613-2ac8298ef78b	91dc17bc-6459-46ca-86f8-621d3e3b425f	sede-tecamachalco	BATCH-91dc17bc	2026-06-25 23:29:59.646	50	2025-06-25 23:29:59.647	2025-06-25 23:29:59.647
6dd65f59-a294-4d51-969d-6ebdce055c02	91dc17bc-6459-46ca-86f8-621d3e3b425f	sede-angeles	BATCH-91dc17bc	2026-06-25 23:29:59.646	50	2025-06-25 23:29:59.648	2025-06-25 23:29:59.648
86d57cd6-a9dd-4b3d-94e3-5eb438939d7b	727f19d9-75aa-4bf8-bcb8-41ef9c33930c	sede-angeles	BATCH-727f19d9	2026-06-25 23:29:59.649	50	2025-06-25 23:29:59.651	2025-06-25 23:29:59.651
7526f3f5-3c19-49c1-b40c-271e395831b5	51e7b8a0-9e54-4c4b-8dee-8ba6da75a5ef	sede-tecamachalco	BATCH-51e7b8a0	2026-06-25 23:29:59.653	50	2025-06-25 23:29:59.653	2025-06-25 23:29:59.653
fdbd84fb-fe22-4c63-8823-02e1817fcd4d	51e7b8a0-9e54-4c4b-8dee-8ba6da75a5ef	sede-angeles	BATCH-51e7b8a0	2026-06-25 23:29:59.653	50	2025-06-25 23:29:59.654	2025-06-25 23:29:59.654
5b3961e5-6ee5-4a81-8121-803a43767ac8	0e66888b-9544-45de-9d5c-4daaa0aa94bd	sede-tecamachalco	BATCH-0e66888b	2026-06-25 23:29:59.656	50	2025-06-25 23:29:59.657	2025-06-25 23:29:59.657
f2d0489d-98cc-46eb-9b6a-c6dcdd429b14	0e66888b-9544-45de-9d5c-4daaa0aa94bd	sede-angeles	BATCH-0e66888b	2026-06-25 23:29:59.656	50	2025-06-25 23:29:59.658	2025-06-25 23:29:59.658
a9905ef8-535d-4e6c-8a12-231901742811	a4be1035-d7f6-480e-a1ef-7ffb1cdda671	sede-tecamachalco	BATCH-a4be1035	2026-06-25 23:29:59.659	50	2025-06-25 23:29:59.66	2025-06-25 23:29:59.66
5fb858fa-79a4-47df-b620-827b59e5b110	a4be1035-d7f6-480e-a1ef-7ffb1cdda671	sede-angeles	BATCH-a4be1035	2026-06-25 23:29:59.659	50	2025-06-25 23:29:59.661	2025-06-25 23:29:59.661
a558840c-9750-4cf8-b0d1-1fa94d6c5211	a465643c-b3bf-40b3-a3ff-cb3751af6dfe	sede-tecamachalco	BATCH-a465643c	2026-06-25 23:29:59.663	50	2025-06-25 23:29:59.664	2025-06-25 23:29:59.664
122ccf2b-d185-4a3f-a579-39646acc5213	a465643c-b3bf-40b3-a3ff-cb3751af6dfe	sede-angeles	BATCH-a465643c	2026-06-25 23:29:59.663	50	2025-06-25 23:29:59.664	2025-06-25 23:29:59.664
cf63bcfc-cd9d-4a1c-a775-df872e98d2bf	bdb8a1df-e65d-41a8-966c-204a32a02009	sede-tecamachalco	BATCH-bdb8a1df	2026-06-25 23:29:59.666	50	2025-06-25 23:29:59.667	2025-06-25 23:29:59.667
e5f49864-520a-48ce-9a31-5ef68bbeae74	bdb8a1df-e65d-41a8-966c-204a32a02009	sede-angeles	BATCH-bdb8a1df	2026-06-25 23:29:59.666	50	2025-06-25 23:29:59.667	2025-06-25 23:29:59.667
a6efda7c-de2f-4c8a-966b-316202aa6ef6	ebbc0e6a-e2ec-4bbc-b7ce-9bfa5b91de7d	sede-tecamachalco	BATCH-ebbc0e6a	2026-06-25 23:29:59.669	50	2025-06-25 23:29:59.67	2025-06-25 23:29:59.67
bbf283b8-02e5-40bd-846b-89a1f3c3f575	ebbc0e6a-e2ec-4bbc-b7ce-9bfa5b91de7d	sede-angeles	BATCH-ebbc0e6a	2026-06-25 23:29:59.669	50	2025-06-25 23:29:59.671	2025-06-25 23:29:59.671
6bbc91e7-0a76-40e9-9899-6bfd859d8cd3	5953f8d7-6451-4901-941b-95d3477adf8d	sede-tecamachalco	BATCH-5953f8d7	2026-06-25 23:29:59.672	50	2025-06-25 23:29:59.673	2025-06-25 23:29:59.673
98ae3a1d-0a32-4c11-94fc-809966ddf446	5953f8d7-6451-4901-941b-95d3477adf8d	sede-angeles	BATCH-5953f8d7	2026-06-25 23:29:59.672	50	2025-06-25 23:29:59.674	2025-06-25 23:29:59.674
e1cac399-115d-490a-aa5f-0d288eb78594	4afbe49f-8899-435f-9ba8-2355d1dc45ea	sede-angeles	BATCH-4afbe49f	2026-06-25 23:29:59.676	50	2025-06-25 23:29:59.677	2025-06-25 23:29:59.677
b2d0db87-1793-48f6-b19c-4a45f1d06002	dc26539a-2b36-408b-bfe8-5cade57c3750	sede-tecamachalco	BATCH-dc26539a	2026-06-25 23:29:59.679	50	2025-06-25 23:29:59.68	2025-06-25 23:29:59.68
e1e85a86-df89-4842-a7cf-a6ce8b1d6341	dc26539a-2b36-408b-bfe8-5cade57c3750	sede-angeles	BATCH-dc26539a	2026-06-25 23:29:59.679	50	2025-06-25 23:29:59.681	2025-06-25 23:29:59.681
2013f633-bc3d-440f-9744-cbb6962532a6	69e9b832-d342-474d-a507-133f2d5c1553	sede-angeles	BATCH-69e9b832	2026-06-25 23:29:59.682	50	2025-06-25 23:29:59.684	2025-06-25 23:29:59.684
7d3ca355-cce3-4f4f-ab77-100635ee7855	727f19d9-75aa-4bf8-bcb8-41ef9c33930c	sede-tecamachalco	BATCH-727f19d9	2026-06-25 23:29:59.649	49	2025-06-25 23:29:59.65	2025-06-26 01:42:19.249
1d32fd97-2108-4c18-9f6b-96a6e3fbaec6	4afbe49f-8899-435f-9ba8-2355d1dc45ea	sede-tecamachalco	BATCH-4afbe49f	2026-06-25 23:29:59.676	48	2025-06-25 23:29:59.677	2025-06-26 01:42:52.674
49b54c9d-dba7-4850-b544-c0405a714ee4	69e9b832-d342-474d-a507-133f2d5c1553	sede-tecamachalco	BATCH-69e9b832	2026-06-25 23:29:59.682	49	2025-06-25 23:29:59.683	2025-06-26 01:43:15.436
e93be612-566e-4b14-a37d-1b979f870dd8	b2549870-d709-44b4-8f94-e14ceb8b7286	sede-tecamachalco	BATCH-b2549870	2026-06-25 23:29:59.623	47	2025-06-25 23:29:59.624	2025-06-26 01:43:37.842
c352d42d-d447-46c7-a47b-e1434017ff26	169e9c59-4521-48fc-aae9-9f3a9a00ba13	sede-angeles	BATCH-169e9c59	2026-06-25 23:29:59.686	50	2025-06-25 23:29:59.687	2025-06-25 23:29:59.687
b40790e6-71b1-44c9-b6e6-2d9271207025	f3edc4b3-ac9c-4279-8f12-46fbbd475337	sede-angeles	BATCH-f3edc4b3	2026-06-25 23:29:59.689	50	2025-06-25 23:29:59.69	2025-06-25 23:29:59.69
267766e3-79fd-4656-9e8a-3539a072e574	f711c032-4afd-4486-97dc-56361adcd336	sede-angeles	BATCH-f711c032	2026-06-25 23:29:59.691	50	2025-06-25 23:29:59.693	2025-06-25 23:29:59.693
c2fcd8f8-cadb-436f-8ac2-053823ddf197	9c86d8ec-3564-450a-9d29-cef1ac5de2a4	sede-angeles	BATCH-9c86d8ec	2026-06-25 23:29:59.694	50	2025-06-25 23:29:59.695	2025-06-25 23:29:59.695
dc33eca9-8e15-435d-9604-07cc4806bf6c	5b50199d-8229-48e9-aebd-671b62743e3a	sede-angeles	BATCH-5b50199d	2026-06-25 23:29:59.696	50	2025-06-25 23:29:59.698	2025-06-25 23:29:59.698
6635cef3-b012-41a0-b6b6-85a634992c55	f283463f-2bab-4f0e-8ed5-fefda64e18e9	sede-tecamachalco	BATCH-f283463f	2026-06-25 23:29:59.699	50	2025-06-25 23:29:59.699	2025-06-25 23:29:59.699
43dc2521-bb80-4b53-829e-887b86ef4270	f283463f-2bab-4f0e-8ed5-fefda64e18e9	sede-angeles	BATCH-f283463f	2026-06-25 23:29:59.699	50	2025-06-25 23:29:59.7	2025-06-25 23:29:59.7
71b3c719-89be-460b-a018-c76a7c2b8819	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	sede-angeles	BATCH-d3db7e15	2026-06-25 23:29:59.701	50	2025-06-25 23:29:59.702	2025-06-25 23:29:59.702
b793d360-a669-42ca-97f0-a5fddbd8b99c	20561748-55d1-4e78-a928-4cceacec4746	sede-tecamachalco	BATCH-20561748	2026-06-25 23:29:59.704	50	2025-06-25 23:29:59.705	2025-06-25 23:29:59.705
73a68559-58cf-4f2f-8972-bb9a02f30372	20561748-55d1-4e78-a928-4cceacec4746	sede-angeles	BATCH-20561748	2026-06-25 23:29:59.704	50	2025-06-25 23:29:59.706	2025-06-25 23:29:59.706
720356f1-2494-418b-82c9-27cf04300c23	c771ed38-178d-4838-a8c4-162e08db40b9	sede-angeles	BATCH-c771ed38	2026-06-25 23:29:59.708	50	2025-06-25 23:29:59.709	2025-06-25 23:29:59.709
3b7304c3-1500-4512-9f3c-0eefb55ef2f8	c1415bee-5de0-4ad5-b8b6-98f90b26716d	sede-angeles	BATCH-c1415bee	2026-06-25 23:29:59.711	50	2025-06-25 23:29:59.713	2025-06-25 23:29:59.713
2c307e99-8617-4825-919d-d298e0a62f35	43d1bea0-3582-43b4-b696-fba5f0975716	sede-tecamachalco	BATCH-43d1bea0	2026-06-25 23:29:59.714	50	2025-06-25 23:29:59.715	2025-06-25 23:29:59.715
96d27773-fd8b-4ac9-a68b-84723b265bdf	43d1bea0-3582-43b4-b696-fba5f0975716	sede-angeles	BATCH-43d1bea0	2026-06-25 23:29:59.714	50	2025-06-25 23:29:59.716	2025-06-25 23:29:59.716
133e7d67-1958-4978-b4c6-6dff020b775e	107a5174-f104-481c-8f0c-423516121816	sede-tecamachalco	BATCH-107a5174	2026-06-25 23:29:59.718	50	2025-06-25 23:29:59.719	2025-06-25 23:29:59.719
eb2c46cf-e2aa-41ec-be9d-cdd5250d66f1	107a5174-f104-481c-8f0c-423516121816	sede-angeles	BATCH-107a5174	2026-06-25 23:29:59.718	50	2025-06-25 23:29:59.719	2025-06-25 23:29:59.719
7413c0c8-5e8a-4968-9699-8cf74507d5fc	c6e72fab-7bd0-49f3-920e-67ebe5b68968	sede-angeles	BATCH-c6e72fab	2026-06-25 23:29:59.721	50	2025-06-25 23:29:59.723	2025-06-25 23:29:59.723
97430993-9498-4c5b-95a7-62422b526796	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	sede-angeles	BATCH-2d4ba1d6	2026-06-25 23:29:59.724	50	2025-06-25 23:29:59.726	2025-06-25 23:29:59.726
c4952d73-d04e-4ae0-b4b9-86c0dc624efe	f8958811-1ba7-4091-95dd-04adce74999b	sede-angeles	BATCH-f8958811	2026-06-25 23:29:59.728	50	2025-06-25 23:29:59.729	2025-06-25 23:29:59.729
19ea42eb-2fc4-4690-8d59-04220c47fc94	bc6a60cb-59bf-4809-9d9f-d733afd2869d	sede-tecamachalco	BATCH-bc6a60cb	2026-06-25 23:29:59.731	50	2025-06-25 23:29:59.731	2025-06-25 23:29:59.731
8eba9f83-9850-476e-9442-4a38a0e249b5	bc6a60cb-59bf-4809-9d9f-d733afd2869d	sede-angeles	BATCH-bc6a60cb	2026-06-25 23:29:59.731	50	2025-06-25 23:29:59.732	2025-06-25 23:29:59.732
4857ccd0-f666-4f73-b4f3-7cbd4dd341f2	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	sede-angeles	BATCH-73f1f3d6	2026-06-25 23:29:59.734	50	2025-06-25 23:29:59.736	2025-06-25 23:29:59.736
ec7dbb46-a33d-42aa-956c-50d04403083e	069c3139-7f2d-4be0-8faf-17338e136d5d	sede-tecamachalco	BATCH-069c3139	2026-06-25 23:29:59.737	50	2025-06-25 23:29:59.738	2025-06-25 23:29:59.738
e72f5ae7-69d1-4e0f-bc65-1869d123fea8	069c3139-7f2d-4be0-8faf-17338e136d5d	sede-angeles	BATCH-069c3139	2026-06-25 23:29:59.737	50	2025-06-25 23:29:59.739	2025-06-25 23:29:59.739
a9d5d5fa-dea2-4ffe-97b1-c0cc99efad91	64578478-9177-4064-9292-deb9bd0ca78d	sede-tecamachalco	BATCH-64578478	2026-06-25 23:29:59.741	50	2025-06-25 23:29:59.741	2025-06-25 23:29:59.741
95e0d029-9a57-451f-988d-02463afe4e7a	64578478-9177-4064-9292-deb9bd0ca78d	sede-angeles	BATCH-64578478	2026-06-25 23:29:59.741	50	2025-06-25 23:29:59.742	2025-06-25 23:29:59.742
ff9b5339-1fcf-4c0d-b792-78ebd5498d9b	25ea1918-1cbc-4f2d-b80a-5534b4f060b2	sede-tecamachalco	BATCH-25ea1918	2026-06-25 23:29:59.744	50	2025-06-25 23:29:59.745	2025-06-25 23:29:59.745
8da4d581-deab-4027-a315-2e5d48a4e8e8	25ea1918-1cbc-4f2d-b80a-5534b4f060b2	sede-angeles	BATCH-25ea1918	2026-06-25 23:29:59.744	50	2025-06-25 23:29:59.746	2025-06-25 23:29:59.746
7025edb2-aaa1-4262-bb47-bb145057a8c7	542e1128-5daa-49a8-bdab-7219e8b5a9fc	sede-tecamachalco	BATCH-542e1128	2026-06-25 23:29:59.747	50	2025-06-25 23:29:59.748	2025-06-25 23:29:59.748
d194f0a1-e905-4621-a0d2-59364d8746ea	542e1128-5daa-49a8-bdab-7219e8b5a9fc	sede-angeles	BATCH-542e1128	2026-06-25 23:29:59.747	50	2025-06-25 23:29:59.749	2025-06-25 23:29:59.749
2c74878b-4667-41f8-9d0d-4a59961a2528	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	sede-angeles	BATCH-bc509bc0	2026-06-25 23:29:59.75	50	2025-06-25 23:29:59.752	2025-06-25 23:29:59.752
2e0de787-3877-40d4-8d57-b8d8420b6885	33ba649a-c16a-4034-8572-a4cbebfb1466	sede-tecamachalco	BATCH-33ba649a	2026-06-25 23:29:59.754	50	2025-06-25 23:29:59.755	2025-06-25 23:29:59.755
04c12952-51eb-4948-b232-b013f3613062	33ba649a-c16a-4034-8572-a4cbebfb1466	sede-angeles	BATCH-33ba649a	2026-06-25 23:29:59.754	50	2025-06-25 23:29:59.756	2025-06-25 23:29:59.756
59075d8a-e245-4dc2-a6f0-fc4a445806f9	237f1416-27c1-4a32-888e-08845f2d1ba0	sede-tecamachalco	BATCH-237f1416	2026-06-25 23:29:59.757	50	2025-06-25 23:29:59.758	2025-06-25 23:29:59.758
a99752e0-ae6f-4a46-8d1d-68a11642209e	237f1416-27c1-4a32-888e-08845f2d1ba0	sede-angeles	BATCH-237f1416	2026-06-25 23:29:59.757	50	2025-06-25 23:29:59.759	2025-06-25 23:29:59.759
097c7b01-24c6-4706-a4e2-db879bc8213c	c6e72fab-7bd0-49f3-920e-67ebe5b68968	sede-tecamachalco	BATCH-c6e72fab	2026-06-25 23:29:59.721	50	2025-06-25 23:29:59.722	2025-06-25 23:46:28.607
ed9ab9d2-d8bf-4306-b05a-18bbc5d4b8ed	c1415bee-5de0-4ad5-b8b6-98f90b26716d	sede-tecamachalco	BATCH-c1415bee	2026-06-25 23:29:59.711	50	2025-06-25 23:29:59.712	2025-06-26 00:08:48.223
d5d97a7b-6a3a-462d-bd9d-560e16750cde	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	sede-tecamachalco	BATCH-d3db7e15	2026-06-25 23:29:59.701	50	2025-06-25 23:29:59.702	2025-06-25 23:51:22.614
53d6eeb6-bf3e-4319-9073-da1777ae8bec	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	sede-tecamachalco	BATCH-2d4ba1d6	2026-06-25 23:29:59.724	50	2025-06-25 23:29:59.725	2025-06-26 00:08:48.23
bb306f3b-b9ee-49b8-8958-4d4ea3131731	f8958811-1ba7-4091-95dd-04adce74999b	sede-tecamachalco	BATCH-f8958811	2026-06-25 23:29:59.728	50	2025-06-25 23:29:59.729	2025-06-25 23:56:44.346
dc940278-4d2f-433a-b014-9438a8d1f160	9c86d8ec-3564-450a-9d29-cef1ac5de2a4	sede-tecamachalco	BATCH-9c86d8ec	2026-06-25 23:29:59.694	46	2025-06-25 23:29:59.695	2025-06-26 00:08:48.234
d2ae0962-89e7-4d3d-97bf-ca342ce12dd8	169e9c59-4521-48fc-aae9-9f3a9a00ba13	sede-tecamachalco	BATCH-169e9c59	2026-06-25 23:29:59.686	46	2025-06-25 23:29:59.687	2025-06-26 01:42:52.681
8062340a-b0d5-4c25-93e3-fc4cc24c892a	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	sede-tecamachalco	BATCH-bc509bc0	2026-06-25 23:29:59.75	50	2025-06-25 23:29:59.751	2025-06-28 20:51:04.25
981eff67-400d-458f-bd48-f6973d9c07e4	12d456d0-76ed-45e1-9eb3-fb24243776a1	sede-tecamachalco	BATCH-12d456d0	2026-06-25 23:29:59.76	50	2025-06-25 23:29:59.761	2025-06-25 23:29:59.761
392cb1cc-df14-4b32-84e1-80e78e4638c0	12d456d0-76ed-45e1-9eb3-fb24243776a1	sede-angeles	BATCH-12d456d0	2026-06-25 23:29:59.76	50	2025-06-25 23:29:59.762	2025-06-25 23:29:59.762
1883f0f8-9c7b-4b00-b2f5-0538d6a6fe88	390fbc3f-6e5b-4942-be4e-ed50499f8da7	sede-tecamachalco	BATCH-390fbc3f	2026-06-25 23:29:59.764	50	2025-06-25 23:29:59.764	2025-06-25 23:29:59.764
e9fa4cd4-edfd-4362-81b5-cba9cd1452ce	390fbc3f-6e5b-4942-be4e-ed50499f8da7	sede-angeles	BATCH-390fbc3f	2026-06-25 23:29:59.764	50	2025-06-25 23:29:59.765	2025-06-25 23:29:59.765
fe23599c-ff54-4859-aef8-709076dda27e	4acf0843-ba8d-4c7c-84ce-616f387115e5	sede-angeles	BATCH-4acf0843	2026-06-25 23:29:59.767	50	2025-06-25 23:29:59.768	2025-06-25 23:29:59.768
05f9f720-66d7-4d98-9394-05b7fc880309	51bfbc07-105c-44fd-9512-1b07c663266f	sede-tecamachalco	BATCH-51bfbc07	2026-06-25 23:29:59.77	50	2025-06-25 23:29:59.771	2025-06-25 23:29:59.771
2cf47a60-7f70-4111-bbe6-de15a7e279e1	51bfbc07-105c-44fd-9512-1b07c663266f	sede-angeles	BATCH-51bfbc07	2026-06-25 23:29:59.77	50	2025-06-25 23:29:59.772	2025-06-25 23:29:59.772
94b1f22a-28ad-46eb-b2ee-fd486e439154	f76238a9-2735-46f4-8e7b-5268f585742e	sede-angeles	BATCH-f76238a9	2026-06-25 23:29:59.774	50	2025-06-25 23:29:59.777	2025-06-25 23:29:59.777
195432e1-c4a1-4408-8a6a-6cb0ea0b7924	4c732e19-ff02-43d8-b990-07b0c929738d	sede-tecamachalco	BATCH-4c732e19	2026-06-25 23:29:59.779	50	2025-06-25 23:29:59.78	2025-06-25 23:29:59.78
c55060bb-9aca-48a2-8425-2cea72eed3e5	4c732e19-ff02-43d8-b990-07b0c929738d	sede-angeles	BATCH-4c732e19	2026-06-25 23:29:59.779	50	2025-06-25 23:29:59.781	2025-06-25 23:29:59.781
d7cb28f3-bd02-4e87-845d-8dd5c328ffb1	faf767b4-e52e-4092-85cf-2bf5318f3687	sede-angeles	BATCH-faf767b4	2026-06-25 23:29:59.783	50	2025-06-25 23:29:59.784	2025-06-25 23:29:59.784
46b80e09-cf6d-401d-a01a-6e7a05d1629e	65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	sede-tecamachalco	BATCH-65b19e20	2026-06-25 23:29:59.785	50	2025-06-25 23:29:59.786	2025-06-25 23:29:59.786
c711131e-2874-4cb1-9654-7aabba84a994	65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	sede-angeles	BATCH-65b19e20	2026-06-25 23:29:59.785	50	2025-06-25 23:29:59.787	2025-06-25 23:29:59.787
603ba68f-ceb5-4ef1-963d-cb99adc8f18b	9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	sede-angeles	BATCH-9410881d	2026-06-25 23:29:59.788	50	2025-06-25 23:29:59.789	2025-06-25 23:29:59.789
7d23022f-27be-457c-a332-a4e8b53e5351	6f24161c-07ca-4385-9ed7-86b16d4f66e7	sede-tecamachalco	BATCH-6f24161c	2026-06-25 23:29:59.79	50	2025-06-25 23:29:59.791	2025-06-25 23:29:59.791
f0399ef8-bee6-4c4d-be90-fb601cc6e559	6f24161c-07ca-4385-9ed7-86b16d4f66e7	sede-angeles	BATCH-6f24161c	2026-06-25 23:29:59.79	50	2025-06-25 23:29:59.792	2025-06-25 23:29:59.792
e39065e1-1904-404b-8224-a0968037d36c	5db42a64-dbc4-4193-aa9b-bbe4353ff5ac	sede-tecamachalco	BATCH-5db42a64	2026-06-25 23:29:59.793	50	2025-06-25 23:29:59.793	2025-06-25 23:29:59.793
b643d188-b07c-46da-8086-07a485453a5e	5db42a64-dbc4-4193-aa9b-bbe4353ff5ac	sede-angeles	BATCH-5db42a64	2026-06-25 23:29:59.793	50	2025-06-25 23:29:59.794	2025-06-25 23:29:59.794
85ee04d9-f6e6-4b04-9a5b-5aed14e61f0c	2e6f2d2f-f6e5-44bd-8c34-89d20411b9ec	sede-tecamachalco	BATCH-2e6f2d2f	2026-06-25 23:29:59.795	50	2025-06-25 23:29:59.796	2025-06-25 23:29:59.796
841438a9-e9a2-4835-be67-eecd257bcdbb	2e6f2d2f-f6e5-44bd-8c34-89d20411b9ec	sede-angeles	BATCH-2e6f2d2f	2026-06-25 23:29:59.795	50	2025-06-25 23:29:59.796	2025-06-25 23:29:59.796
fca26420-2a40-457b-84c1-8482ec4e415c	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	sede-angeles	BATCH-5a62cd5f	2026-06-25 23:29:59.798	50	2025-06-25 23:29:59.799	2025-06-25 23:29:59.799
f8299c16-74be-4feb-b4ac-6f3d4d630baf	9596f4fa-427a-4054-bb14-8f85393b268e	sede-tecamachalco	BATCH-9596f4fa	2026-06-25 23:29:59.801	50	2025-06-25 23:29:59.802	2025-06-25 23:29:59.802
54db282a-9bd3-4b03-8593-3b2e5ae36f8e	9596f4fa-427a-4054-bb14-8f85393b268e	sede-angeles	BATCH-9596f4fa	2026-06-25 23:29:59.801	50	2025-06-25 23:29:59.803	2025-06-25 23:29:59.803
5b6710e7-afa9-4be1-b0ce-3dfd700abba8	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	sede-angeles	BATCH-5bbc0b82	2026-06-25 23:29:59.804	50	2025-06-25 23:29:59.805	2025-06-25 23:29:59.805
2ca43a69-602c-4d73-b2eb-89bae334db59	90432799-ba35-4ad0-af0f-d7a23ca05141	sede-tecamachalco	BATCH-90432799	2026-06-25 23:29:59.807	50	2025-06-25 23:29:59.808	2025-06-25 23:29:59.808
0f59d1ac-9266-426a-9130-d431de3582c8	90432799-ba35-4ad0-af0f-d7a23ca05141	sede-angeles	BATCH-90432799	2026-06-25 23:29:59.807	50	2025-06-25 23:29:59.808	2025-06-25 23:29:59.808
fd509361-4b96-421b-bed4-4e585c458a68	00665ad8-bb36-4dfc-a4ca-3acfd28c8f4a	sede-tecamachalco	BATCH-00665ad8	2026-06-25 23:29:59.809	50	2025-06-25 23:29:59.81	2025-06-25 23:29:59.81
5934d3da-6b4c-4f8c-b161-2f183003880f	00665ad8-bb36-4dfc-a4ca-3acfd28c8f4a	sede-angeles	BATCH-00665ad8	2026-06-25 23:29:59.809	50	2025-06-25 23:29:59.811	2025-06-25 23:29:59.811
ecb6247e-459c-4c36-af7e-ad341c402478	3c861ca7-9cde-4edb-a68e-7799ed079a10	sede-tecamachalco	BATCH-3c861ca7	2026-06-25 23:29:59.811	50	2025-06-25 23:29:59.812	2025-06-25 23:29:59.812
44362904-b8bd-4cef-989d-9e62888688a1	3c861ca7-9cde-4edb-a68e-7799ed079a10	sede-angeles	BATCH-3c861ca7	2026-06-25 23:29:59.811	50	2025-06-25 23:29:59.813	2025-06-25 23:29:59.813
18280886-c40f-47c4-808f-c985fda9c920	7991e86a-63e0-4408-9ff8-f61fd43bc6ff	sede-tecamachalco	BATCH-7991e86a	2026-06-25 23:29:59.814	50	2025-06-25 23:29:59.815	2025-06-25 23:29:59.815
824c05e9-8856-4706-8581-216f3c682b65	7991e86a-63e0-4408-9ff8-f61fd43bc6ff	sede-angeles	BATCH-7991e86a	2026-06-25 23:29:59.814	50	2025-06-25 23:29:59.815	2025-06-25 23:29:59.815
d2e26948-59d4-4823-bf8a-50044084cca5	8d82d5f2-7fc2-4b04-bff1-b08dd27b26e2	sede-tecamachalco	BATCH-8d82d5f2	2026-06-25 23:29:59.816	50	2025-06-25 23:29:59.817	2025-06-25 23:29:59.817
8e1756a8-f76b-463c-8d85-d4a4e730836a	8d82d5f2-7fc2-4b04-bff1-b08dd27b26e2	sede-angeles	BATCH-8d82d5f2	2026-06-25 23:29:59.816	50	2025-06-25 23:29:59.818	2025-06-25 23:29:59.818
ba8d0b38-e77f-4bfd-b86f-90f44e469c57	2d015143-d610-45ad-b011-d108e638d268	sede-tecamachalco	BATCH-2d015143	2026-06-25 23:29:59.819	50	2025-06-25 23:29:59.82	2025-06-25 23:29:59.82
b2ced3fa-9d70-48e7-8f95-4adac02f31cb	2d015143-d610-45ad-b011-d108e638d268	sede-angeles	BATCH-2d015143	2026-06-25 23:29:59.819	50	2025-06-25 23:29:59.821	2025-06-25 23:29:59.821
ecae8ce2-ab94-4da4-9fa6-28dadcfe777a	462dc5aa-7313-4683-84e2-095a4b501d86	sede-tecamachalco	BATCH-462dc5aa	2026-06-25 23:29:59.823	50	2025-06-25 23:29:59.824	2025-06-25 23:29:59.824
f7bbf2c2-0661-4470-bfdb-9c4bc1864f20	462dc5aa-7313-4683-84e2-095a4b501d86	sede-angeles	BATCH-462dc5aa	2026-06-25 23:29:59.823	50	2025-06-25 23:29:59.824	2025-06-25 23:29:59.824
715a161a-7965-4d5a-9237-04f9a18a628d	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	sede-tecamachalco	BATCH-5a62cd5f	2026-06-25 23:29:59.798	50	2025-06-25 23:29:59.799	2025-06-26 00:00:16.756
e883d582-e0bc-4206-843e-d32e04bdddf2	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	sede-tecamachalco	BATCH-5bbc0b82	2026-06-25 23:29:59.804	50	2025-06-25 23:29:59.805	2025-06-26 00:00:16.762
d63720d1-b1a6-4637-894e-ae01bd013203	4acf0843-ba8d-4c7c-84ce-616f387115e5	sede-tecamachalco	BATCH-4acf0843	2026-06-25 23:29:59.767	50	2025-06-25 23:29:59.768	2025-06-26 00:01:27.673
7dc253f4-4012-4f56-aa13-de9512e7a43e	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	sede-tecamachalco	BATCH-73f1f3d6	2026-06-25 23:29:59.734	50	2025-06-25 23:29:59.735	2025-06-25 23:56:44.352
edfd6f96-dfb8-46ef-82dd-8976bacca782	f76238a9-2735-46f4-8e7b-5268f585742e	sede-tecamachalco	BATCH-f76238a9	2026-06-25 23:29:59.774	50	2025-06-25 23:29:59.775	2025-06-26 00:01:27.677
3004fca7-9597-414e-8c6c-1fedeec33cf2	5b50199d-8229-48e9-aebd-671b62743e3a	sede-tecamachalco	BATCH-5b50199d	2026-06-25 23:29:59.696	50	2025-06-25 23:29:59.697	2025-06-25 23:51:22.609
5508ab37-122a-4789-848c-57202b44b4db	faf767b4-e52e-4092-85cf-2bf5318f3687	sede-tecamachalco	BATCH-faf767b4	2026-06-25 23:29:59.783	49	2025-06-25 23:29:59.783	2025-06-26 00:02:59.164
4621f08d-2f0e-44c4-b431-d0e2594a7fd2	9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	sede-tecamachalco	BATCH-9410881d	2026-06-25 23:29:59.788	49	2025-06-25 23:29:59.789	2025-06-26 00:02:59.171
76db7a64-740d-4b55-a696-9fea1e2f2db8	f711c032-4afd-4486-97dc-56361adcd336	sede-tecamachalco	BATCH-f711c032	2026-06-25 23:29:59.691	13	2025-06-25 23:29:59.692	2025-06-25 23:56:44.355
059f3a38-0995-4d27-8936-7a50d4a24a69	fa818135-51c0-4680-97cb-557ea5308a26	sede-tecamachalco	BATCH-fa818135	2026-06-25 23:29:59.585	48	2025-06-25 23:29:59.586	2025-06-26 01:05:04.659
3944bba4-4d4f-438e-b604-c393ba6492eb	e8eb7443-7e41-4f70-a382-a49cbf61fe50	sede-tecamachalco	BATCH-e8eb7443	2026-06-25 23:29:59.57	40	2025-06-25 23:29:59.571	2025-06-26 01:40:09.959
3f39f71b-5a04-4fdd-bee3-507fdec081dc	8a624d62-3be3-4dd5-9f32-dc15481d9c23	sede-tecamachalco	BATCH-8a624d62	2026-06-25 23:29:59.606	48	2025-06-25 23:29:59.607	2025-06-26 01:41:51.252
f9185878-2743-4d16-9f7d-b2b8d2e6d1b7	916822f7-dd60-4a21-aa0a-f6552a4bfe31	sede-tecamachalco	BATCH-916822f7	2026-06-25 23:29:59.62	48	2025-06-25 23:29:59.621	2025-06-26 01:41:51.258
19d2d811-ca16-4279-bd0b-229e3404b0ae	9996676c-7438-472c-9e9e-d84df1d12b25	sede-angeles	BATCH-9996676c	2026-06-26 01:46:14.282	50	2025-06-26 01:46:14.285	2025-06-26 01:46:14.285
8927d3e2-69c2-4e48-ad9e-e016fe90bb27	9996676c-7438-472c-9e9e-d84df1d12b25	sede-tecamachalco	BATCH-9996676c	2026-06-26 01:46:14.282	49	2025-06-26 01:46:14.283	2025-06-26 01:47:17.594
4682b35b-dbe7-45a0-b6e9-9a6fb11319a7	c771ed38-178d-4838-a8c4-162e08db40b9	sede-tecamachalco	BATCH-c771ed38	2026-06-25 23:29:59.708	50	2025-06-25 23:29:59.709	2025-06-28 20:51:04.243
bfaa5d94-81d1-46ac-b7cf-02092d078378	f3edc4b3-ac9c-4279-8f12-46fbbd475337	sede-tecamachalco	BATCH-f3edc4b3	2026-06-25 23:29:59.689	26	2025-06-25 23:29:59.69	2025-06-28 20:51:04.255
\.


--
-- Data for Name: Sede; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."Sede" (id, name, address, "createdAt", "updatedAt") FROM stdin;
sede-tecamachalco	Clínica Tecamachalco	Av. Tecamachalco 123, Ciudad de México	2025-06-25 23:29:59.384	2025-06-25 23:29:59.384
sede-angeles	Hospital Ángeles Lomas	Av. Lomas 456, Ciudad de México	2025-06-25 23:29:59.391	2025-06-25 23:29:59.391
\.


--
-- Data for Name: StockBySede; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."StockBySede" (id, "productId", "sedeId", quantity, "createdAt", "updatedAt") FROM stdin;
1d948e42-37f4-4858-a58a-c2d3b75e12c3	249e50ad-95aa-4479-a343-aff4c08d7b90	sede-tecamachalco	50.00	2025-06-25 23:29:59.515	2025-06-25 23:29:59.515
e6a36524-03e3-4686-b819-039998b4d8a0	249e50ad-95aa-4479-a343-aff4c08d7b90	sede-angeles	50.00	2025-06-25 23:29:59.518	2025-06-25 23:29:59.518
c2b7f4e0-0285-4fa2-9f59-d1398fc66f61	7e7c2791-ace4-4595-a311-0dcd3ef808c0	sede-tecamachalco	50.00	2025-06-25 23:29:59.524	2025-06-25 23:29:59.524
6f35c2b7-e383-4908-bf47-798c6053886d	7e7c2791-ace4-4595-a311-0dcd3ef808c0	sede-angeles	50.00	2025-06-25 23:29:59.526	2025-06-25 23:29:59.526
f992160e-4f4d-47a1-a240-41955ab05139	c42bd3ae-d693-4e17-9051-ba867aadeb0a	sede-tecamachalco	50.00	2025-06-25 23:29:59.529	2025-06-25 23:29:59.529
ff6dc2cc-3bcb-4c65-9011-2417474616a7	c42bd3ae-d693-4e17-9051-ba867aadeb0a	sede-angeles	50.00	2025-06-25 23:29:59.53	2025-06-25 23:29:59.53
86d01e21-ed1d-4e37-a2a7-a3eff4c82fe7	99123789-b161-4b25-bb40-d35f2fc33658	sede-tecamachalco	50.00	2025-06-25 23:29:59.533	2025-06-25 23:29:59.533
8dc8c4aa-9e25-44a7-b185-e03dad215297	99123789-b161-4b25-bb40-d35f2fc33658	sede-angeles	50.00	2025-06-25 23:29:59.534	2025-06-25 23:29:59.534
e5a32112-a99b-45a3-8af5-b27e1be8ae64	574d9e50-49e1-47cc-affd-9a67512c60cf	sede-tecamachalco	50.00	2025-06-25 23:29:59.536	2025-06-25 23:29:59.536
3b43e577-fe2a-40e3-9081-ea747617e566	574d9e50-49e1-47cc-affd-9a67512c60cf	sede-angeles	50.00	2025-06-25 23:29:59.537	2025-06-25 23:29:59.537
d7994d36-38d6-44f0-8f75-8866322e3955	9a3e07fc-f69a-46c5-a4c4-188779f38a8d	sede-tecamachalco	50.00	2025-06-25 23:29:59.539	2025-06-25 23:29:59.539
a8c3bc2d-1e85-45bd-aa6f-a0966958364a	9a3e07fc-f69a-46c5-a4c4-188779f38a8d	sede-angeles	50.00	2025-06-25 23:29:59.54	2025-06-25 23:29:59.54
50cd13a5-d762-4c25-8496-96a7302ecdad	da4226b2-86f1-4509-840a-b93dc8d55cbd	sede-tecamachalco	50.00	2025-06-25 23:29:59.543	2025-06-25 23:29:59.543
ef075da9-50d7-4be8-a02a-33b63c473836	da4226b2-86f1-4509-840a-b93dc8d55cbd	sede-angeles	50.00	2025-06-25 23:29:59.544	2025-06-25 23:29:59.544
fda77219-0b70-40f2-8bb9-c7a6283b2a77	6b77c255-c412-4fd7-95dd-dcdf1516a6e3	sede-tecamachalco	50.00	2025-06-25 23:29:59.546	2025-06-25 23:29:59.546
61ff0a62-4438-4534-9e7d-16cab4e6d772	6b77c255-c412-4fd7-95dd-dcdf1516a6e3	sede-angeles	50.00	2025-06-25 23:29:59.547	2025-06-25 23:29:59.547
b2b41e99-25c5-4ede-9787-991418f55ae1	5113a8cd-ee6b-4b68-987a-c3a5787d84de	sede-tecamachalco	50.00	2025-06-25 23:29:59.549	2025-06-25 23:29:59.549
2762c025-10c0-44ed-b6c7-4d48f42c7563	5113a8cd-ee6b-4b68-987a-c3a5787d84de	sede-angeles	50.00	2025-06-25 23:29:59.55	2025-06-25 23:29:59.55
c243c2eb-39ef-4c0c-a9fa-5c0921446bc5	43c78bf4-2668-4355-85cc-33e914299d9f	sede-tecamachalco	50.00	2025-06-25 23:29:59.552	2025-06-25 23:29:59.552
0b8d8303-619e-4f8f-8afe-578eb71e8ce4	43c78bf4-2668-4355-85cc-33e914299d9f	sede-angeles	50.00	2025-06-25 23:29:59.553	2025-06-25 23:29:59.553
744c5a1b-f6c3-4bcc-b3d1-a3325f9b5fa8	af1aaeaa-a196-4c41-95ab-31fed7d4ab37	sede-tecamachalco	50.00	2025-06-25 23:29:59.556	2025-06-25 23:29:59.556
98fab99e-a48b-44a7-b034-0518b076ffdb	af1aaeaa-a196-4c41-95ab-31fed7d4ab37	sede-angeles	50.00	2025-06-25 23:29:59.557	2025-06-25 23:29:59.557
89580f7c-aa78-46ec-9620-bed404bb730e	c53b40ac-9137-4479-8a4a-e81afde0d559	sede-tecamachalco	50.00	2025-06-25 23:29:59.559	2025-06-25 23:29:59.559
cc485f6d-4774-4935-908e-7c1c98a75ec5	c53b40ac-9137-4479-8a4a-e81afde0d559	sede-angeles	50.00	2025-06-25 23:29:59.56	2025-06-25 23:29:59.56
f4e879df-245d-45a4-8838-3b12c8e3c01c	2694e937-ba38-404d-b57f-e746d2dcb37f	sede-tecamachalco	50.00	2025-06-25 23:29:59.562	2025-06-25 23:29:59.562
567fe49c-0265-4ae6-a7d5-7350c0b103f7	2694e937-ba38-404d-b57f-e746d2dcb37f	sede-angeles	50.00	2025-06-25 23:29:59.563	2025-06-25 23:29:59.563
bf8b7b92-c8ff-497e-b700-7510838493ba	0bc09c44-68e0-4c81-8ae9-f4bf19ffd40c	sede-tecamachalco	50.00	2025-06-25 23:29:59.565	2025-06-25 23:29:59.565
2a851c2d-aa41-418e-baa3-a092af35e434	0bc09c44-68e0-4c81-8ae9-f4bf19ffd40c	sede-angeles	50.00	2025-06-25 23:29:59.566	2025-06-25 23:29:59.566
3f960fa0-5af9-421e-9f81-2248db7d2ca6	e8eb7443-7e41-4f70-a382-a49cbf61fe50	sede-angeles	50.00	2025-06-25 23:29:59.57	2025-06-25 23:29:59.57
5112979c-3bc7-4551-a0a5-2f05185b7c70	4a42fa1e-a6e7-49c1-874a-01b4612873b1	sede-angeles	50.00	2025-06-25 23:29:59.573	2025-06-25 23:29:59.573
c2f2036e-53e6-4109-a4ca-c655e4cfc8e0	1cf46547-64ac-43c4-b728-261e6602ec50	sede-angeles	50.00	2025-06-25 23:29:59.577	2025-06-25 23:29:59.577
0efe3cc0-641e-4207-bc5c-08960d334495	f09bdd01-a9eb-4e15-9717-fa18d30293c3	sede-angeles	50.00	2025-06-25 23:29:59.581	2025-06-25 23:29:59.581
2c7d1744-b292-4a45-b2df-29d6d78437cc	fa818135-51c0-4680-97cb-557ea5308a26	sede-angeles	50.00	2025-06-25 23:29:59.585	2025-06-25 23:29:59.585
8773bc06-1126-4988-b7cc-96c83b9fb0e2	d5783698-a8c6-479b-b945-55c057cb3a78	sede-tecamachalco	50.00	2025-06-25 23:29:59.587	2025-06-25 23:29:59.587
7b858b04-fe42-4fc0-b6f5-aa3dd5bd05c5	d5783698-a8c6-479b-b945-55c057cb3a78	sede-angeles	50.00	2025-06-25 23:29:59.588	2025-06-25 23:29:59.588
b7593fe6-d9b5-4ab0-8022-80216c6d21ae	d787c319-95cf-4f35-a876-cc06d6b1b420	sede-tecamachalco	50.00	2025-06-25 23:29:59.591	2025-06-25 23:29:59.591
d4ed3b51-70b6-44e7-960f-88bc66722556	d787c319-95cf-4f35-a876-cc06d6b1b420	sede-angeles	50.00	2025-06-25 23:29:59.591	2025-06-25 23:29:59.591
0bb32ff7-a9ea-4931-a181-b979a9840939	dc97705a-d682-4d8b-9e8c-0c94f17169e8	sede-tecamachalco	50.00	2025-06-25 23:29:59.594	2025-06-25 23:29:59.594
fb219188-fb38-4744-88e1-04754f7bd6c7	dc97705a-d682-4d8b-9e8c-0c94f17169e8	sede-angeles	50.00	2025-06-25 23:29:59.595	2025-06-25 23:29:59.595
aff9aa18-34bf-4c85-9ede-5425d0959b7a	d4a4dca9-ba0a-45d0-a0e4-c0ed76d7a84e	sede-tecamachalco	50.00	2025-06-25 23:29:59.597	2025-06-25 23:29:59.597
5bec9e9c-be9c-4fbc-8245-55850ea24147	d4a4dca9-ba0a-45d0-a0e4-c0ed76d7a84e	sede-angeles	50.00	2025-06-25 23:29:59.598	2025-06-25 23:29:59.598
cdd0f7e0-4747-4508-b014-3a79d4dc716a	4998cdde-f9bd-4f35-a0fc-ed93d752317d	sede-angeles	50.00	2025-06-25 23:29:59.601	2025-06-25 23:29:59.601
94da9fc2-c010-4df5-95f3-f45d3c8be0e2	8a624d62-3be3-4dd5-9f32-dc15481d9c23	sede-angeles	50.00	2025-06-25 23:29:59.605	2025-06-25 23:29:59.605
4bac43d9-09e0-419a-97f4-4cd098a67442	e0b36cea-fd47-42be-8dd7-163fffdb10c8	sede-tecamachalco	50.00	2025-06-25 23:29:59.609	2025-06-25 23:29:59.609
ae5c388d-a5c1-422c-bc0a-820f9b9058af	e0b36cea-fd47-42be-8dd7-163fffdb10c8	sede-angeles	50.00	2025-06-25 23:29:59.61	2025-06-25 23:29:59.61
c42ca395-f09b-49a6-9091-fca5fec54abc	7b4a8197-bd0f-4be1-ae43-19208c6848f8	sede-tecamachalco	50.00	2025-06-25 23:29:59.612	2025-06-25 23:29:59.612
1670846a-133b-4dde-adbd-c2d167486599	7b4a8197-bd0f-4be1-ae43-19208c6848f8	sede-angeles	50.00	2025-06-25 23:29:59.613	2025-06-25 23:29:59.613
5b9e65a8-66db-458e-a384-25c76537b056	6c5a5312-a2ad-46ec-a1b0-96c899f48b16	sede-tecamachalco	50.00	2025-06-25 23:29:59.615	2025-06-25 23:29:59.615
ee2fa806-162d-42ef-a8b9-a320d28cc1e8	6c5a5312-a2ad-46ec-a1b0-96c899f48b16	sede-angeles	50.00	2025-06-25 23:29:59.616	2025-06-25 23:29:59.616
4828175b-05ae-4296-aef9-bca419f28e85	1cf46547-64ac-43c4-b728-261e6602ec50	sede-tecamachalco	49.00	2025-06-25 23:29:59.576	2025-06-26 00:12:58.151
93a55c71-edbb-4e56-92fa-83539d1000c4	4998cdde-f9bd-4f35-a0fc-ed93d752317d	sede-tecamachalco	45.00	2025-06-25 23:29:59.601	2025-06-26 01:05:04.649
a0fa8bc2-1da1-4b00-b5b1-8865e2adbfc6	8a624d62-3be3-4dd5-9f32-dc15481d9c23	sede-tecamachalco	48.00	2025-06-25 23:29:59.604	2025-06-26 01:41:51.25
27a64829-53e1-470f-a183-cc9182adb49d	4a42fa1e-a6e7-49c1-874a-01b4612873b1	sede-tecamachalco	35.00	2025-06-25 23:29:59.572	2025-06-26 01:40:09.973
742526b1-811a-4d62-9632-baa1ac31cb0d	f09bdd01-a9eb-4e15-9717-fa18d30293c3	sede-tecamachalco	46.00	2025-06-25 23:29:59.579	2025-06-26 01:29:41.382
c2ea5bc0-6de1-48bc-9f1d-41a95479040d	916822f7-dd60-4a21-aa0a-f6552a4bfe31	sede-angeles	50.00	2025-06-25 23:29:59.62	2025-06-25 23:29:59.62
dcb24e70-4cc5-4e5e-8b78-07af53903557	b2549870-d709-44b4-8f94-e14ceb8b7286	sede-angeles	50.00	2025-06-25 23:29:59.623	2025-06-25 23:29:59.623
f73f6108-a1f5-45b7-aafd-71b965e0322b	a6dc9555-b0b8-4da1-a50a-6f8b784e724b	sede-tecamachalco	50.00	2025-06-25 23:29:59.626	2025-06-25 23:29:59.626
7655656d-9df8-48bc-b6f2-936985c77a28	a6dc9555-b0b8-4da1-a50a-6f8b784e724b	sede-angeles	50.00	2025-06-25 23:29:59.626	2025-06-25 23:29:59.626
7b584ff8-6c59-400e-bc11-e9390a3c4274	2cf05df2-50c7-491d-bcd7-48a0e4040ecb	sede-tecamachalco	50.00	2025-06-25 23:29:59.629	2025-06-25 23:29:59.629
4b4f36b8-fd12-4ec7-85fa-902e7e7702da	2cf05df2-50c7-491d-bcd7-48a0e4040ecb	sede-angeles	50.00	2025-06-25 23:29:59.63	2025-06-25 23:29:59.63
51fc3b99-a87f-4d3f-8cc0-6ed2d0aa9764	1872cc93-d239-4cc2-b6f8-1cb053d1ddf9	sede-tecamachalco	50.00	2025-06-25 23:29:59.632	2025-06-25 23:29:59.632
e953fc22-80a4-4839-a9af-37153815ccc6	1872cc93-d239-4cc2-b6f8-1cb053d1ddf9	sede-angeles	50.00	2025-06-25 23:29:59.633	2025-06-25 23:29:59.633
7aea7ca3-811d-4745-9b74-ac2759c91571	d12322ed-fa13-4038-8d0a-c7670dc9642a	sede-tecamachalco	50.00	2025-06-25 23:29:59.635	2025-06-25 23:29:59.635
5a23ed60-f364-429c-97af-ec8114c83a66	d12322ed-fa13-4038-8d0a-c7670dc9642a	sede-angeles	50.00	2025-06-25 23:29:59.636	2025-06-25 23:29:59.636
cdc18a79-733d-439d-8e03-890ccae30836	03f12a43-dabe-41d9-86f0-04b2230f65bd	sede-tecamachalco	50.00	2025-06-25 23:29:59.638	2025-06-25 23:29:59.638
7ee6fcd5-993c-45b9-b2af-c745d0798a82	03f12a43-dabe-41d9-86f0-04b2230f65bd	sede-angeles	50.00	2025-06-25 23:29:59.639	2025-06-25 23:29:59.639
4758573d-6fce-4e96-9619-44f4cff01f03	6369a243-b80b-4736-9970-5b1f809b75ed	sede-tecamachalco	50.00	2025-06-25 23:29:59.642	2025-06-25 23:29:59.642
4d0e475d-dcbf-443f-b206-74bf3a962914	6369a243-b80b-4736-9970-5b1f809b75ed	sede-angeles	50.00	2025-06-25 23:29:59.643	2025-06-25 23:29:59.643
d47920e0-d211-4949-9b04-8fd8f53da4d2	91dc17bc-6459-46ca-86f8-621d3e3b425f	sede-tecamachalco	50.00	2025-06-25 23:29:59.645	2025-06-25 23:29:59.645
ade4be51-5806-4afd-ac12-7c6b27e4a3ca	91dc17bc-6459-46ca-86f8-621d3e3b425f	sede-angeles	50.00	2025-06-25 23:29:59.646	2025-06-25 23:29:59.646
34a1038e-5fe6-4c4a-a014-ac1cf5b702cc	727f19d9-75aa-4bf8-bcb8-41ef9c33930c	sede-angeles	50.00	2025-06-25 23:29:59.649	2025-06-25 23:29:59.649
2f86e63b-0f2a-4a33-9296-db87e91ba075	51e7b8a0-9e54-4c4b-8dee-8ba6da75a5ef	sede-tecamachalco	50.00	2025-06-25 23:29:59.651	2025-06-25 23:29:59.651
2f6e6cd3-c1fe-4fcd-ac61-25db2f82d3d2	51e7b8a0-9e54-4c4b-8dee-8ba6da75a5ef	sede-angeles	50.00	2025-06-25 23:29:59.652	2025-06-25 23:29:59.652
644e1912-7ed9-4c5c-9681-2226c4f714e5	0e66888b-9544-45de-9d5c-4daaa0aa94bd	sede-tecamachalco	50.00	2025-06-25 23:29:59.655	2025-06-25 23:29:59.655
749a0518-17b1-4edc-b3e5-7a9c132d6745	0e66888b-9544-45de-9d5c-4daaa0aa94bd	sede-angeles	50.00	2025-06-25 23:29:59.656	2025-06-25 23:29:59.656
4d8952c4-e59e-478e-abfe-29f274bb4905	a4be1035-d7f6-480e-a1ef-7ffb1cdda671	sede-angeles	50.00	2025-06-25 23:29:59.659	2025-06-25 23:29:59.659
20a783b6-3acf-4049-ab69-cf067e0cfc75	a465643c-b3bf-40b3-a3ff-cb3751af6dfe	sede-tecamachalco	50.00	2025-06-25 23:29:59.661	2025-06-25 23:29:59.661
eae44802-d093-4df9-a462-c020cb727ded	a465643c-b3bf-40b3-a3ff-cb3751af6dfe	sede-angeles	50.00	2025-06-25 23:29:59.662	2025-06-25 23:29:59.662
db3a4bd7-5041-4394-aecf-c2e8490eb0fa	bdb8a1df-e65d-41a8-966c-204a32a02009	sede-tecamachalco	50.00	2025-06-25 23:29:59.664	2025-06-25 23:29:59.664
3bc6d199-840e-40bc-bbcb-a6784291c09e	bdb8a1df-e65d-41a8-966c-204a32a02009	sede-angeles	50.00	2025-06-25 23:29:59.665	2025-06-25 23:29:59.665
d6cd507a-d81c-45c4-8e3a-7bf7bc18d6ee	ebbc0e6a-e2ec-4bbc-b7ce-9bfa5b91de7d	sede-tecamachalco	50.00	2025-06-25 23:29:59.668	2025-06-25 23:29:59.668
6e79358e-453b-499d-a60b-be00c36392e8	ebbc0e6a-e2ec-4bbc-b7ce-9bfa5b91de7d	sede-angeles	50.00	2025-06-25 23:29:59.669	2025-06-25 23:29:59.669
021d1915-61e8-4e7d-acb5-fb0fbbf45075	5953f8d7-6451-4901-941b-95d3477adf8d	sede-tecamachalco	50.00	2025-06-25 23:29:59.671	2025-06-25 23:29:59.671
264e1411-845b-48e7-9a27-1cb275c66f98	5953f8d7-6451-4901-941b-95d3477adf8d	sede-angeles	50.00	2025-06-25 23:29:59.672	2025-06-25 23:29:59.672
ea274900-cb00-4793-a206-f7acf0abd49c	4afbe49f-8899-435f-9ba8-2355d1dc45ea	sede-angeles	50.00	2025-06-25 23:29:59.675	2025-06-25 23:29:59.675
0d82e037-08f0-42a2-a6a0-8845ed34be5f	dc26539a-2b36-408b-bfe8-5cade57c3750	sede-tecamachalco	50.00	2025-06-25 23:29:59.678	2025-06-25 23:29:59.678
0fcf0fcd-1f61-4c36-9bfb-3ac8d826dfa8	dc26539a-2b36-408b-bfe8-5cade57c3750	sede-angeles	50.00	2025-06-25 23:29:59.679	2025-06-25 23:29:59.679
d5a1a1e4-51c0-48e9-8e60-6337770474ba	69e9b832-d342-474d-a507-133f2d5c1553	sede-angeles	50.00	2025-06-25 23:29:59.682	2025-06-25 23:29:59.682
2a8cb184-931d-4676-a66b-c307c6bb5080	169e9c59-4521-48fc-aae9-9f3a9a00ba13	sede-angeles	50.00	2025-06-25 23:29:59.686	2025-06-25 23:29:59.686
a64b9e9f-af00-41aa-ba58-9d971d126c45	f3edc4b3-ac9c-4279-8f12-46fbbd475337	sede-angeles	50.00	2025-06-25 23:29:59.689	2025-06-25 23:29:59.689
b5bfafb2-f952-4d2e-b982-fd4cb360842f	f711c032-4afd-4486-97dc-56361adcd336	sede-angeles	50.00	2025-06-25 23:29:59.691	2025-06-25 23:29:59.691
d7bead27-6c05-4c79-8dc0-15efe7e51b98	9c86d8ec-3564-450a-9d29-cef1ac5de2a4	sede-angeles	50.00	2025-06-25 23:29:59.694	2025-06-25 23:29:59.694
5bfc4bc6-9bc0-4087-84a1-6225fce5137f	5b50199d-8229-48e9-aebd-671b62743e3a	sede-angeles	50.00	2025-06-25 23:29:59.696	2025-06-25 23:29:59.696
79b0bcb3-9ae6-40e4-80c3-daf84049172e	f283463f-2bab-4f0e-8ed5-fefda64e18e9	sede-tecamachalco	50.00	2025-06-25 23:29:59.698	2025-06-25 23:29:59.698
0f53861e-ca43-46da-b6e5-d56074185857	f283463f-2bab-4f0e-8ed5-fefda64e18e9	sede-angeles	50.00	2025-06-25 23:29:59.699	2025-06-25 23:29:59.699
d4372408-68ac-4f40-a7ed-be949bfdc9a5	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	sede-angeles	50.00	2025-06-25 23:29:59.701	2025-06-25 23:29:59.701
0e16e0d6-3843-484e-9e54-b89074343cff	20561748-55d1-4e78-a928-4cceacec4746	sede-tecamachalco	50.00	2025-06-25 23:29:59.703	2025-06-25 23:29:59.703
d21c4b91-2f4f-4c43-bd53-9c1c80742eda	20561748-55d1-4e78-a928-4cceacec4746	sede-angeles	50.00	2025-06-25 23:29:59.704	2025-06-25 23:29:59.704
9d3cbb19-716b-4f46-8149-cf273e0e54e8	9c86d8ec-3564-450a-9d29-cef1ac5de2a4	sede-tecamachalco	45.20	2025-06-25 23:29:59.693	2025-06-26 00:08:48.234
9c3478e0-74f6-466a-af75-31007b22aa69	d3db7e15-d83a-4dfb-91ca-b8a0bd6bb1b0	sede-tecamachalco	49.45	2025-06-25 23:29:59.7	2025-06-25 23:51:22.614
ae45b91d-f3a6-428c-aa6b-fedc3b2c82cd	916822f7-dd60-4a21-aa0a-f6552a4bfe31	sede-tecamachalco	48.00	2025-06-25 23:29:59.618	2025-06-26 01:41:51.257
95449669-3570-49cf-92c5-8392ef4f476c	a4be1035-d7f6-480e-a1ef-7ffb1cdda671	sede-tecamachalco	60.00	2025-06-25 23:29:59.658	2025-06-28 02:21:53.537
65c6ebea-e118-4d01-9a49-ccc817d1a548	727f19d9-75aa-4bf8-bcb8-41ef9c33930c	sede-tecamachalco	49.00	2025-06-25 23:29:59.648	2025-06-26 01:42:19.248
d83ce82e-92c7-49b7-80dc-745bb94727f3	169e9c59-4521-48fc-aae9-9f3a9a00ba13	sede-tecamachalco	46.00	2025-06-25 23:29:59.685	2025-06-26 01:42:52.68
a31e0721-8957-4f0b-9a92-91f1a163972d	69e9b832-d342-474d-a507-133f2d5c1553	sede-tecamachalco	49.00	2025-06-25 23:29:59.681	2025-06-26 01:43:15.435
ed9d7380-6c68-42a1-a221-92678fe85c16	4afbe49f-8899-435f-9ba8-2355d1dc45ea	sede-tecamachalco	58.00	2025-06-25 23:29:59.674	2025-07-01 00:24:23.684
6c4752bf-1f80-4e5d-adc9-403f9a9c7cca	b2549870-d709-44b4-8f94-e14ceb8b7286	sede-tecamachalco	61.00	2025-06-25 23:29:59.622	2025-07-01 00:18:48.493
84aad32d-44fb-4aff-905e-e279b418eb33	c771ed38-178d-4838-a8c4-162e08db40b9	sede-angeles	50.00	2025-06-25 23:29:59.707	2025-06-25 23:29:59.707
6714edac-b327-4202-8d96-634df1fd33c6	c1415bee-5de0-4ad5-b8b6-98f90b26716d	sede-angeles	50.00	2025-06-25 23:29:59.711	2025-06-25 23:29:59.711
e2744380-9f61-4ebd-b539-72239ae55c3b	43d1bea0-3582-43b4-b696-fba5f0975716	sede-tecamachalco	50.00	2025-06-25 23:29:59.713	2025-06-25 23:29:59.713
02ad769d-d366-4e80-9090-35e17f7058a2	43d1bea0-3582-43b4-b696-fba5f0975716	sede-angeles	50.00	2025-06-25 23:29:59.714	2025-06-25 23:29:59.714
3c2a9828-9b59-48af-81ad-cbda4c876098	107a5174-f104-481c-8f0c-423516121816	sede-tecamachalco	50.00	2025-06-25 23:29:59.716	2025-06-25 23:29:59.716
0377b122-52ed-4cab-ab13-8135ca19cf39	107a5174-f104-481c-8f0c-423516121816	sede-angeles	50.00	2025-06-25 23:29:59.717	2025-06-25 23:29:59.717
53bd25ad-bbcc-46fa-a621-2e11a0a2f902	c6e72fab-7bd0-49f3-920e-67ebe5b68968	sede-angeles	50.00	2025-06-25 23:29:59.721	2025-06-25 23:29:59.721
f21cf4c6-74a6-4e92-ae4b-219eb1dd5ab3	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	sede-angeles	50.00	2025-06-25 23:29:59.724	2025-06-25 23:29:59.724
7955abec-ceca-4ae1-9729-91e2070d8092	f8958811-1ba7-4091-95dd-04adce74999b	sede-angeles	50.00	2025-06-25 23:29:59.727	2025-06-25 23:29:59.727
b9cb0be4-d81e-4146-be9c-5349ddaece0b	bc6a60cb-59bf-4809-9d9f-d733afd2869d	sede-tecamachalco	50.00	2025-06-25 23:29:59.73	2025-06-25 23:29:59.73
c3a6e340-23d9-4eb5-95a8-c71608844722	bc6a60cb-59bf-4809-9d9f-d733afd2869d	sede-angeles	50.00	2025-06-25 23:29:59.731	2025-06-25 23:29:59.731
6df9af76-1ad4-4fcd-89c0-530303294174	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	sede-angeles	50.00	2025-06-25 23:29:59.734	2025-06-25 23:29:59.734
d0ea9057-0ec5-4b01-a09e-6bbbdb0b5927	069c3139-7f2d-4be0-8faf-17338e136d5d	sede-tecamachalco	50.00	2025-06-25 23:29:59.736	2025-06-25 23:29:59.736
3fb18673-6e9e-431a-95ff-a22a3222cee2	069c3139-7f2d-4be0-8faf-17338e136d5d	sede-angeles	50.00	2025-06-25 23:29:59.737	2025-06-25 23:29:59.737
79152eea-96e1-45ce-bd7d-fa5f9c5f1a42	64578478-9177-4064-9292-deb9bd0ca78d	sede-tecamachalco	50.00	2025-06-25 23:29:59.739	2025-06-25 23:29:59.739
dbbdfb80-b0f2-4dc3-8ff3-26c2dd92212a	64578478-9177-4064-9292-deb9bd0ca78d	sede-angeles	50.00	2025-06-25 23:29:59.74	2025-06-25 23:29:59.74
2cc97818-27fb-425a-8232-035cc8fd8794	25ea1918-1cbc-4f2d-b80a-5534b4f060b2	sede-tecamachalco	50.00	2025-06-25 23:29:59.743	2025-06-25 23:29:59.743
16c22f4b-40de-4107-8bc1-c6086e3e78a3	25ea1918-1cbc-4f2d-b80a-5534b4f060b2	sede-angeles	50.00	2025-06-25 23:29:59.744	2025-06-25 23:29:59.744
22b5b943-61f0-419c-ae49-523401f5d829	542e1128-5daa-49a8-bdab-7219e8b5a9fc	sede-tecamachalco	50.00	2025-06-25 23:29:59.746	2025-06-25 23:29:59.746
9e2cb7bf-49db-4915-97d7-2aeab3609485	542e1128-5daa-49a8-bdab-7219e8b5a9fc	sede-angeles	50.00	2025-06-25 23:29:59.747	2025-06-25 23:29:59.747
3894824d-5264-4ae9-8d53-b83625a5118b	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	sede-angeles	50.00	2025-06-25 23:29:59.75	2025-06-25 23:29:59.75
329a87f8-cf98-4c54-ac70-1e9f8af19231	33ba649a-c16a-4034-8572-a4cbebfb1466	sede-angeles	50.00	2025-06-25 23:29:59.753	2025-06-25 23:29:59.753
e8948649-6b25-4054-a951-eb026dbb7f45	237f1416-27c1-4a32-888e-08845f2d1ba0	sede-tecamachalco	50.00	2025-06-25 23:29:59.756	2025-06-25 23:29:59.756
ef053d6d-558c-41d2-b522-16278bd4d380	237f1416-27c1-4a32-888e-08845f2d1ba0	sede-angeles	50.00	2025-06-25 23:29:59.757	2025-06-25 23:29:59.757
4f8a357e-308d-4b6d-abe7-ceede277aa35	12d456d0-76ed-45e1-9eb3-fb24243776a1	sede-tecamachalco	50.00	2025-06-25 23:29:59.759	2025-06-25 23:29:59.759
0177c67f-b309-41fe-b80a-6d48973d54f2	12d456d0-76ed-45e1-9eb3-fb24243776a1	sede-angeles	50.00	2025-06-25 23:29:59.76	2025-06-25 23:29:59.76
ab1488f3-02be-406f-bf2a-9bcf8a7ad250	390fbc3f-6e5b-4942-be4e-ed50499f8da7	sede-tecamachalco	50.00	2025-06-25 23:29:59.763	2025-06-25 23:29:59.763
8181f4eb-1362-45b6-a233-7f5f9081ffe2	390fbc3f-6e5b-4942-be4e-ed50499f8da7	sede-angeles	50.00	2025-06-25 23:29:59.763	2025-06-25 23:29:59.763
7f2a478e-55e4-4e24-94b9-05ea50060b06	4acf0843-ba8d-4c7c-84ce-616f387115e5	sede-angeles	50.00	2025-06-25 23:29:59.766	2025-06-25 23:29:59.766
896bf179-5fcb-4700-8fd3-3c112b982464	51bfbc07-105c-44fd-9512-1b07c663266f	sede-angeles	50.00	2025-06-25 23:29:59.77	2025-06-25 23:29:59.77
44b460cc-33a8-48a7-9e75-0a5062c32483	f76238a9-2735-46f4-8e7b-5268f585742e	sede-angeles	50.00	2025-06-25 23:29:59.774	2025-06-25 23:29:59.774
b39464cd-9de5-4edd-a148-1b494392c3ca	4c732e19-ff02-43d8-b990-07b0c929738d	sede-tecamachalco	50.00	2025-06-25 23:29:59.778	2025-06-25 23:29:59.778
c1dd3cd7-5b24-41a7-a505-c2f06be71203	4c732e19-ff02-43d8-b990-07b0c929738d	sede-angeles	50.00	2025-06-25 23:29:59.779	2025-06-25 23:29:59.779
76f73153-3389-4173-9ce8-fbaef64e4957	faf767b4-e52e-4092-85cf-2bf5318f3687	sede-angeles	50.00	2025-06-25 23:29:59.782	2025-06-25 23:29:59.782
ba00c767-aefa-4eae-958f-7992d303ebd4	65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	sede-angeles	50.00	2025-06-25 23:29:59.785	2025-06-25 23:29:59.785
d3382ae0-b28c-4c7b-bade-dc791b5f9746	9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	sede-angeles	50.00	2025-06-25 23:29:59.788	2025-06-25 23:29:59.788
57e34552-4735-47a5-a7e8-c73092f880dc	6f24161c-07ca-4385-9ed7-86b16d4f66e7	sede-tecamachalco	50.00	2025-06-25 23:29:59.79	2025-06-25 23:29:59.79
b8a414f5-e085-4a0f-8310-a3ab5285c160	6f24161c-07ca-4385-9ed7-86b16d4f66e7	sede-angeles	50.00	2025-06-25 23:29:59.79	2025-06-25 23:29:59.79
4edfd473-4c35-4198-ae9c-c466277377c3	5db42a64-dbc4-4193-aa9b-bbe4353ff5ac	sede-tecamachalco	50.00	2025-06-25 23:29:59.792	2025-06-25 23:29:59.792
c0cffd0d-926a-45dd-b2dc-851c3c5a462e	5db42a64-dbc4-4193-aa9b-bbe4353ff5ac	sede-angeles	50.00	2025-06-25 23:29:59.793	2025-06-25 23:29:59.793
3b067aba-75cc-43d3-98a8-a3db737c9a28	2e6f2d2f-f6e5-44bd-8c34-89d20411b9ec	sede-tecamachalco	50.00	2025-06-25 23:29:59.794	2025-06-25 23:29:59.794
d24e170c-e5f1-4169-bd83-64d8b54e8729	2e6f2d2f-f6e5-44bd-8c34-89d20411b9ec	sede-angeles	50.00	2025-06-25 23:29:59.795	2025-06-25 23:29:59.795
b871d11c-93a8-4d2c-9423-48ce7a85cf2b	c6e72fab-7bd0-49f3-920e-67ebe5b68968	sede-tecamachalco	49.10	2025-06-25 23:29:59.72	2025-06-25 23:46:28.606
8d674b96-5d9d-4705-af38-5dce2498ccba	51bfbc07-105c-44fd-9512-1b07c663266f	sede-tecamachalco	150.00	2025-06-25 23:29:59.769	2025-06-28 00:37:14.538
401dab29-148b-425e-a6bc-c739ce0c2c5a	f76238a9-2735-46f4-8e7b-5268f585742e	sede-tecamachalco	48.50	2025-06-25 23:29:59.772	2025-06-26 00:01:27.677
fd9c0c19-5c58-4f89-a2c1-abe0eb75b78d	33ba649a-c16a-4034-8572-a4cbebfb1466	sede-tecamachalco	55.00	2025-06-25 23:29:59.753	2025-06-28 20:51:30.294
10f030e3-d1c2-4c55-85fc-59975c83adfd	faf767b4-e52e-4092-85cf-2bf5318f3687	sede-tecamachalco	48.50	2025-06-25 23:29:59.781	2025-06-26 00:02:59.16
3b404daf-7729-4de1-9e80-2b841dccd34f	9410881d-d0f5-4b9d-a2a5-d2fc770dbafb	sede-tecamachalco	48.50	2025-06-25 23:29:59.787	2025-06-26 00:02:59.171
3c721016-cff8-4498-a509-a7a16e72618d	c1415bee-5de0-4ad5-b8b6-98f90b26716d	sede-tecamachalco	49.96	2025-06-25 23:29:59.71	2025-06-26 00:08:48.219
af7288df-c4a9-4f36-9a1d-e2737ddeaf56	65b19e20-a1ba-48c5-b0b5-ebd8c5b71db8	sede-tecamachalco	74.00	2025-06-25 23:29:59.785	2025-06-28 00:37:59.109
d8ba4092-d4aa-4ac3-9f86-1d7c02440dfb	4acf0843-ba8d-4c7c-84ce-616f387115e5	sede-tecamachalco	88.50	2025-06-25 23:29:59.766	2025-06-28 00:37:14.545
84ab9b18-8ed0-4aae-8fc1-c1168802ec14	c771ed38-178d-4838-a8c4-162e08db40b9	sede-tecamachalco	49.50	2025-06-25 23:29:59.706	2025-06-28 20:51:04.238
bd6cbbfc-d8ad-472d-a181-0574ebe0eec1	bc509bc0-a1f0-4e62-8221-af6f0c5c3d33	sede-tecamachalco	49.62	2025-06-25 23:29:59.749	2025-06-28 20:51:04.25
fa3b7f46-56f1-43e5-ad0f-d691fb3206c3	2d4ba1d6-c65e-4eee-8682-42a42dc8f0c4	sede-tecamachalco	69.96	2025-06-25 23:29:59.723	2025-07-01 00:18:00.572
40cb6832-cae3-42be-a560-d787a5746b8d	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	sede-angeles	50.00	2025-06-25 23:29:59.797	2025-06-25 23:29:59.797
16eabdc4-1290-4b8b-8f94-c3597b2dc752	9596f4fa-427a-4054-bb14-8f85393b268e	sede-tecamachalco	50.00	2025-06-25 23:29:59.8	2025-06-25 23:29:59.8
b3acc0fe-5839-4be6-a73f-d91d7b907be3	9596f4fa-427a-4054-bb14-8f85393b268e	sede-angeles	50.00	2025-06-25 23:29:59.801	2025-06-25 23:29:59.801
76e78bf8-529f-4ba7-8568-d3db35b97eb3	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	sede-angeles	50.00	2025-06-25 23:29:59.804	2025-06-25 23:29:59.804
a7f9db8a-e26f-4856-9acd-28e518f1cec2	90432799-ba35-4ad0-af0f-d7a23ca05141	sede-tecamachalco	50.00	2025-06-25 23:29:59.806	2025-06-25 23:29:59.806
f06a5994-b53c-42f7-8762-98ec6c879cbe	90432799-ba35-4ad0-af0f-d7a23ca05141	sede-angeles	50.00	2025-06-25 23:29:59.806	2025-06-25 23:29:59.806
51aca4d4-ae25-4502-a122-589b1e41dae3	00665ad8-bb36-4dfc-a4ca-3acfd28c8f4a	sede-tecamachalco	50.00	2025-06-25 23:29:59.808	2025-06-25 23:29:59.808
b6b1903b-c908-4dbe-9d58-688772b483c6	00665ad8-bb36-4dfc-a4ca-3acfd28c8f4a	sede-angeles	50.00	2025-06-25 23:29:59.809	2025-06-25 23:29:59.809
7a112a3e-00a6-4cb2-aac8-9d0a7ebcd206	3c861ca7-9cde-4edb-a68e-7799ed079a10	sede-tecamachalco	50.00	2025-06-25 23:29:59.811	2025-06-25 23:29:59.811
0112f011-db26-4868-875d-47958f67d186	3c861ca7-9cde-4edb-a68e-7799ed079a10	sede-angeles	50.00	2025-06-25 23:29:59.811	2025-06-25 23:29:59.811
e6d3cb08-b55b-4bdb-a90c-c6d5221edd90	7991e86a-63e0-4408-9ff8-f61fd43bc6ff	sede-tecamachalco	50.00	2025-06-25 23:29:59.813	2025-06-25 23:29:59.813
59fe5c71-cee9-4ab1-beb4-962c5c7f2315	7991e86a-63e0-4408-9ff8-f61fd43bc6ff	sede-angeles	50.00	2025-06-25 23:29:59.814	2025-06-25 23:29:59.814
fc701c44-83fa-449d-ba6a-2e323bacae84	8d82d5f2-7fc2-4b04-bff1-b08dd27b26e2	sede-tecamachalco	50.00	2025-06-25 23:29:59.816	2025-06-25 23:29:59.816
2b978337-e4cc-4bf9-b039-20bbdb7def7b	8d82d5f2-7fc2-4b04-bff1-b08dd27b26e2	sede-angeles	50.00	2025-06-25 23:29:59.816	2025-06-25 23:29:59.816
1897eea3-1a02-44c8-89c9-aca7c06dc11c	2d015143-d610-45ad-b011-d108e638d268	sede-tecamachalco	50.00	2025-06-25 23:29:59.818	2025-06-25 23:29:59.818
3111a14b-981c-4d59-8d87-f6777bcc1ab1	2d015143-d610-45ad-b011-d108e638d268	sede-angeles	50.00	2025-06-25 23:29:59.819	2025-06-25 23:29:59.819
809dd0ca-755b-4d7a-8c67-24f5ed2f0cdc	462dc5aa-7313-4683-84e2-095a4b501d86	sede-tecamachalco	50.00	2025-06-25 23:29:59.821	2025-06-25 23:29:59.821
c596888d-b878-402c-8c00-06fe7fc012ce	462dc5aa-7313-4683-84e2-095a4b501d86	sede-angeles	50.00	2025-06-25 23:29:59.822	2025-06-25 23:29:59.822
7d2f0470-66a7-4ed3-880c-45dc4c1b8974	5a62cd5f-4232-49ac-87bd-d16fcdff71ac	sede-tecamachalco	48.80	2025-06-25 23:29:59.797	2025-06-26 00:00:16.755
8502dd7a-cab3-421d-b335-28188cf98fae	5bbc0b82-1083-424d-90eb-2b16db2cb1c8	sede-tecamachalco	48.80	2025-06-25 23:29:59.803	2025-06-26 00:00:16.762
22d80e61-599a-4524-b2a3-552238f5af8f	fa818135-51c0-4680-97cb-557ea5308a26	sede-tecamachalco	48.00	2025-06-25 23:29:59.584	2025-06-26 01:05:04.656
05af6418-7522-47cc-8df9-371c53d11a8e	e8eb7443-7e41-4f70-a382-a49cbf61fe50	sede-tecamachalco	40.00	2025-06-25 23:29:59.569	2025-06-26 01:40:09.953
8aaf17b8-a922-4640-b620-817e05864733	9996676c-7438-472c-9e9e-d84df1d12b25	sede-angeles	50.00	2025-06-26 01:46:14.281	2025-06-26 01:46:14.281
4d9082c9-56bb-45eb-a972-c2c7cb2a9259	9996676c-7438-472c-9e9e-d84df1d12b25	sede-tecamachalco	49.00	2025-06-26 01:46:14.279	2025-06-26 01:47:17.589
d90f8efd-0ab4-49fd-9d0a-ebebff60d43f	5b50199d-8229-48e9-aebd-671b62743e3a	sede-tecamachalco	99.26	2025-06-25 23:29:59.696	2025-06-28 00:35:11.494
a8640afb-b3c8-4da5-8039-d769a44123a3	6a762bfe-9350-4efd-afea-7d3821d39cdd	sede-tecamachalco	1.00	2025-06-28 01:26:15.611	2025-06-28 01:26:15.611
d3828100-2373-44fd-b2d1-29d7041d5f31	1d0b348f-ee58-44f0-8318-8a4b8715e847	sede-tecamachalco	10.00	2025-06-28 01:42:34.637	2025-06-28 01:42:34.637
66fe8035-090e-405d-b1c8-98525307f74b	f8958811-1ba7-4091-95dd-04adce74999b	sede-tecamachalco	48.89	2025-06-25 23:29:59.726	2025-06-25 23:56:44.345
8c7f8db4-26de-43c2-96e2-2f527965c45a	73f1f3d6-a341-4c7b-b952-f4573fcdf7f6	sede-tecamachalco	49.58	2025-06-25 23:29:59.733	2025-06-25 23:56:44.351
dd44bf8f-1851-4a5e-aae6-addb8025bb06	f711c032-4afd-4486-97dc-56361adcd336	sede-tecamachalco	9.34	2025-06-25 23:29:59.691	2025-06-25 23:56:44.355
e71a0337-712f-41e0-be1f-c3710fad1bbd	3d801e89-876b-4261-a69d-d3414d366120	sede-tecamachalco	10.00	2025-06-28 02:01:01.916	2025-06-28 02:01:01.916
5020e7d0-d672-4eb2-9eda-86ab6201a5c7	f67d1474-1189-45f6-8e73-1e99e727117b	sede-tecamachalco	10.00	2025-06-28 02:04:10.429	2025-06-28 02:04:10.429
d229fe6d-f11a-4ed7-a8ec-ffc5a70df358	9ad09fa7-3de3-4bed-9a54-f9e391e26035	sede-tecamachalco	10.00	2025-06-28 02:21:22.114	2025-06-28 02:21:22.114
48b931b6-3ccf-4400-83e2-8889ae05a73a	f3edc4b3-ac9c-4279-8f12-46fbbd475337	sede-tecamachalco	24.90	2025-06-25 23:29:59.688	2025-06-28 20:51:04.255
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."Supplier" (id, name, "invoiceNumber", "amountSupplied", "createdAt", "updatedAt") FROM stdin;
7d7b9ae1-809c-471c-94da-f15bc7430f4a	DIEMSA	INV-DIEMSA-001	10000.00	2025-06-25 23:29:59.509	2025-06-25 23:29:59.509
b8692e6c-598f-4360-aacc-18f642ae8b94	Farmacias Especializadas	INV-FARMACIASESPECIALIZADAS-001	10000.00	2025-06-25 23:29:59.511	2025-06-25 23:29:59.511
3741e299-64d8-451c-bf1e-e5bb435f7d3b	Solutesa	INV-SOLUTESA-001	10000.00	2025-06-25 23:29:59.512	2025-06-25 23:29:59.512
a79c01dc-f08e-4ac9-ad3e-336c38eb739d	Inmunotek	INV-INMUNOTEK-001	10000.00	2025-06-25 23:29:59.512	2025-06-25 23:29:59.512
04902823-2ef4-489e-a04b-eb67bbecd7f9	ABBOTT	INV-ABBOTT-001	10000.00	2025-06-25 23:29:59.513	2025-06-25 23:29:59.513
7db28e9e-dce1-4983-91fa-c10c9def1622	Bio Tec Vacunas	INV-BIOTECVACUNAS-001	10000.00	2025-06-25 23:29:59.514	2025-06-25 23:29:59.514
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public."User" (id, email, name, role, "sedeId", "createdAt", "updatedAt") FROM stdin;
590c7231-dabf-4224-abb4-25576c349cb8	dr.garcia@clinica.com	Dr. Carlos García	DOCTOR	sede-tecamachalco	2025-06-25 23:29:59.392	2025-06-25 23:29:59.392
c483e5e9-9d33-44cb-987b-5660b61e4851	enfermera.tecamachalco@clinica.com	Enfermera Ana López	NURSE	sede-tecamachalco	2025-06-25 23:29:59.395	2025-06-25 23:29:59.395
d1eb87ac-891a-4c1f-b51a-0d873f515c94	enfermera1.angeles@clinica.com	Enfermera María Rodríguez	NURSE	sede-angeles	2025-06-25 23:29:59.395	2025-06-25 23:29:59.395
ab5c49aa-0bb9-4595-a337-a485f8bcb6fe	enfermera2.angeles@clinica.com	Enfermera Carmen Martínez	NURSE	sede-angeles	2025-06-25 23:29:59.397	2025-06-25 23:29:59.397
98fc8c6f-afa4-42b3-8315-ea0bfe59c8e3	secretaria.tecamachalco@clinica.com	Secretaria Laura Sánchez	SECRETARY	sede-tecamachalco	2025-06-25 23:29:59.4	2025-06-25 23:29:59.4
a6545b28-62dc-4a66-b7cd-e5965aee7d9f	secretaria.angeles@clinica.com	Secretaria Patricia Torres	SECRETARY	sede-angeles	2025-06-25 23:29:59.402	2025-06-25 23:29:59.402
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: paul
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e7251c34-9d33-4f1e-b535-c407b2b5682d	7b9042eb34d3d17923cbadec8528592c91067604e0e501dca7afb72c14ce9d9b	2025-06-25 17:29:57.701338-06	20250617010956_init	\N	\N	2025-06-25 17:29:57.662079-06	1
ab4b43cb-72d3-432b-ab79-c3f29bb9b2f5	afb73e4167df2ad1c68617702096315b3842259ec7e2d0877cff6530d56112e5	2025-06-25 17:29:57.705325-06	20250619232206_add_inventory_usage	\N	\N	2025-06-25 17:29:57.701665-06	1
e6ffdd67-60a9-4c7d-b896-8a14d51bb187	2808634ae3884c39702edf457bfc2b1bbda56688eb76a0aba1010c87f406067d	2025-06-25 17:29:57.737473-06	20250624233318_restore_inventory_usage_structure	\N	\N	2025-06-25 17:29:57.705683-06	1
e925b78c-919c-4fc2-aa0f-2ab366c7bf34	4c18b466075557fabdc1473eba4e637805ec8eb3c89c9f8ef9c8c83cfafa2b93	2025-06-25 17:29:57.827752-06	20250625015217_movement_quantity_decimal	\N	\N	2025-06-25 17:29:57.760957-06	1
7bb0b869-7597-4d73-a201-9b790f5f506f	d88402058c3a53f3736c0c024fef63d4dff30a80b19605bf4c4380b7511ca687	2025-06-25 17:29:57.830288-06	20250625231120_add_alxoid_allergen_differentiation	\N	\N	2025-06-25 17:29:57.82812-06	1
8f6e401b-d13b-4635-853f-2afe88acd466	b558131aeaa1614c99c7685044e2dbd0cf064f251cb301da5edef3aca6e8cfa4	2025-06-27 20:11:04.074736-06	20250628021104_add_product_category_optional	\N	\N	2025-06-27 20:11:04.072473-06	1
\.


--
-- Name: Allergen Allergen_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Allergen"
    ADD CONSTRAINT "Allergen_pkey" PRIMARY KEY (id);


--
-- Name: InventoryUsageDetail InventoryUsageDetail_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsageDetail"
    ADD CONSTRAINT "InventoryUsageDetail_pkey" PRIMARY KEY (id);


--
-- Name: InventoryUsage InventoryUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsage"
    ADD CONSTRAINT "InventoryUsage_pkey" PRIMARY KEY (id);


--
-- Name: Movement Movement_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Movement"
    ADD CONSTRAINT "Movement_pkey" PRIMARY KEY (id);


--
-- Name: ProductAllergen ProductAllergen_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductAllergen"
    ADD CONSTRAINT "ProductAllergen_pkey" PRIMARY KEY (id);


--
-- Name: ProductExpiration ProductExpiration_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductExpiration"
    ADD CONSTRAINT "ProductExpiration_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Sede Sede_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Sede"
    ADD CONSTRAINT "Sede_pkey" PRIMARY KEY (id);


--
-- Name: StockBySede StockBySede_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."StockBySede"
    ADD CONSTRAINT "StockBySede_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Allergen_alxoidType_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Allergen_alxoidType_idx" ON public."Allergen" USING btree ("alxoidType");


--
-- Name: Allergen_isAlxoidExclusive_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Allergen_isAlxoidExclusive_idx" ON public."Allergen" USING btree ("isAlxoidExclusive");


--
-- Name: Allergen_name_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Allergen_name_idx" ON public."Allergen" USING btree (name);


--
-- Name: InventoryUsageDetail_inventoryUsageId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "InventoryUsageDetail_inventoryUsageId_idx" ON public."InventoryUsageDetail" USING btree ("inventoryUsageId");


--
-- Name: InventoryUsageDetail_movementId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "InventoryUsageDetail_movementId_idx" ON public."InventoryUsageDetail" USING btree ("movementId");


--
-- Name: InventoryUsageDetail_productId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "InventoryUsageDetail_productId_idx" ON public."InventoryUsageDetail" USING btree ("productId");


--
-- Name: InventoryUsage_sedeId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "InventoryUsage_sedeId_idx" ON public."InventoryUsage" USING btree ("sedeId");


--
-- Name: InventoryUsage_userId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "InventoryUsage_userId_idx" ON public."InventoryUsage" USING btree ("userId");


--
-- Name: Movement_batchNumber_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_batchNumber_idx" ON public."Movement" USING btree ("batchNumber");


--
-- Name: Movement_createdAt_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_createdAt_idx" ON public."Movement" USING btree ("createdAt");


--
-- Name: Movement_expiryDate_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_expiryDate_idx" ON public."Movement" USING btree ("expiryDate");


--
-- Name: Movement_productId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_productId_idx" ON public."Movement" USING btree ("productId");


--
-- Name: Movement_sedeId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_sedeId_idx" ON public."Movement" USING btree ("sedeId");


--
-- Name: Movement_userId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Movement_userId_idx" ON public."Movement" USING btree ("userId");


--
-- Name: ProductAllergen_allergenId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductAllergen_allergenId_idx" ON public."ProductAllergen" USING btree ("allergenId");


--
-- Name: ProductAllergen_productId_allergenId_key; Type: INDEX; Schema: public; Owner: paul
--

CREATE UNIQUE INDEX "ProductAllergen_productId_allergenId_key" ON public."ProductAllergen" USING btree ("productId", "allergenId");


--
-- Name: ProductAllergen_productId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductAllergen_productId_idx" ON public."ProductAllergen" USING btree ("productId");


--
-- Name: ProductExpiration_batchNumber_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductExpiration_batchNumber_idx" ON public."ProductExpiration" USING btree ("batchNumber");


--
-- Name: ProductExpiration_expiryDate_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductExpiration_expiryDate_idx" ON public."ProductExpiration" USING btree ("expiryDate");


--
-- Name: ProductExpiration_productId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductExpiration_productId_idx" ON public."ProductExpiration" USING btree ("productId");


--
-- Name: ProductExpiration_sedeId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "ProductExpiration_sedeId_idx" ON public."ProductExpiration" USING btree ("sedeId");


--
-- Name: Product_name_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Product_name_idx" ON public."Product" USING btree (name);


--
-- Name: StockBySede_productId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "StockBySede_productId_idx" ON public."StockBySede" USING btree ("productId");


--
-- Name: StockBySede_productId_sedeId_key; Type: INDEX; Schema: public; Owner: paul
--

CREATE UNIQUE INDEX "StockBySede_productId_sedeId_key" ON public."StockBySede" USING btree ("productId", "sedeId");


--
-- Name: StockBySede_sedeId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "StockBySede_sedeId_idx" ON public."StockBySede" USING btree ("sedeId");


--
-- Name: Supplier_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Supplier_invoiceNumber_idx" ON public."Supplier" USING btree ("invoiceNumber");


--
-- Name: Supplier_name_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "Supplier_name_idx" ON public."Supplier" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: paul
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_sedeId_idx; Type: INDEX; Schema: public; Owner: paul
--

CREATE INDEX "User_sedeId_idx" ON public."User" USING btree ("sedeId");


--
-- Name: InventoryUsageDetail InventoryUsageDetail_inventoryUsageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsageDetail"
    ADD CONSTRAINT "InventoryUsageDetail_inventoryUsageId_fkey" FOREIGN KEY ("inventoryUsageId") REFERENCES public."InventoryUsage"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryUsageDetail InventoryUsageDetail_movementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsageDetail"
    ADD CONSTRAINT "InventoryUsageDetail_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES public."Movement"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryUsageDetail InventoryUsageDetail_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsageDetail"
    ADD CONSTRAINT "InventoryUsageDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryUsage InventoryUsage_sedeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsage"
    ADD CONSTRAINT "InventoryUsage_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES public."Sede"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryUsage InventoryUsage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."InventoryUsage"
    ADD CONSTRAINT "InventoryUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Movement Movement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Movement"
    ADD CONSTRAINT "Movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Movement Movement_sedeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Movement"
    ADD CONSTRAINT "Movement_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES public."Sede"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Movement Movement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."Movement"
    ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductAllergen ProductAllergen_allergenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductAllergen"
    ADD CONSTRAINT "ProductAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES public."Allergen"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductAllergen ProductAllergen_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductAllergen"
    ADD CONSTRAINT "ProductAllergen_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductExpiration ProductExpiration_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductExpiration"
    ADD CONSTRAINT "ProductExpiration_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductExpiration ProductExpiration_sedeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."ProductExpiration"
    ADD CONSTRAINT "ProductExpiration_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES public."Sede"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockBySede StockBySede_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."StockBySede"
    ADD CONSTRAINT "StockBySede_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockBySede StockBySede_sedeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."StockBySede"
    ADD CONSTRAINT "StockBySede_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES public."Sede"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_sedeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paul
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES public."Sede"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

