--
-- PostgreSQL database dump
--

\restrict rY0NsihYaQUZB8TJ0hUGmegKPiU0Q2qVu5hQwihK1WJu83LbftkALwAu1IdPT9z

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BillingCycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingCycle" AS ENUM (
    'MONTHLY',
    'YEARLY',
    'LIFETIME'
);


ALTER TYPE public."BillingCycle" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIALING',
    'ACTIVE',
    'EXPIRED',
    'CANCELED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: comment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.comment_status AS ENUM (
    'PENDING',
    'APPROVED',
    'SPAM',
    'TRASH'
);


ALTER TYPE public.comment_status OWNER TO postgres;

--
-- Name: rolepermission_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rolepermission_role AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'EDITOR',
    'AUTHOR',
    'VIEWER',
    'SUBSCRIBER'
);


ALTER TYPE public.rolepermission_role OWNER TO postgres;

--
-- Name: sitemapChangeFrequency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."sitemapChangeFrequency" AS ENUM (
    'ALWAYS',
    'HOURLY',
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY',
    'NEVER'
);


ALTER TYPE public."sitemapChangeFrequency" OWNER TO postgres;

--
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public.status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'EDITOR',
    'AUTHOR',
    'VIEWER',
    'SUBSCRIBER'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BreadcrumbSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BreadcrumbSettings" (
    id text NOT NULL,
    "tenantId" integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "homeLabel" text DEFAULT 'Home'::text NOT NULL,
    "homeUrl" text,
    separator text DEFAULT '/'::text NOT NULL,
    "showHome" boolean DEFAULT true NOT NULL,
    "showCurrent" boolean DEFAULT true NOT NULL,
    "showParent" boolean DEFAULT true NOT NULL,
    "pagesEnabled" boolean DEFAULT true NOT NULL,
    "postsEnabled" boolean DEFAULT true NOT NULL,
    "categoriesEnabled" boolean DEFAULT true NOT NULL,
    "tagsEnabled" boolean DEFAULT true NOT NULL,
    "coursesEnabled" boolean DEFAULT true NOT NULL,
    "hideOnHome" boolean DEFAULT true NOT NULL,
    "hideOn404" boolean DEFAULT true NOT NULL,
    "hideOnSearch" boolean DEFAULT false NOT NULL,
    "schemaEnabled" boolean DEFAULT true NOT NULL,
    "cssClass" text,
    "customCss" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BreadcrumbSettings" OWNER TO postgres;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Course" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    instructor text,
    thumbnail text,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    "billingCycle" public."BillingCycle" DEFAULT 'LIFETIME'::public."BillingCycle" NOT NULL,
    "billingPeriodDays" integer,
    "durationHours" integer,
    level text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "tenantId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sitemapEnabled" boolean DEFAULT true NOT NULL,
    "sitemapPriority" numeric(2,1) DEFAULT 0.8 NOT NULL,
    "sitemapChangeFreq" public."sitemapChangeFrequency" DEFAULT 'WEEKLY'::public."sitemapChangeFrequency" NOT NULL,
    "courseContentId" integer
);


ALTER TABLE public."Course" OWNER TO postgres;

--
-- Name: CourseContent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseContent" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    "longDescription" text,
    thumbnail text,
    instructor text,
    level text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "tenantId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseContent" OWNER TO postgres;

--
-- Name: CourseContent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseContent_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseContent_id_seq" OWNER TO postgres;

--
-- Name: CourseContent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseContent_id_seq" OWNED BY public."CourseContent".id;


--
-- Name: CourseEnrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseEnrollment" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "billingCycle" text DEFAULT 'LIFETIME'::text NOT NULL
);


ALTER TABLE public."CourseEnrollment" OWNER TO postgres;

--
-- Name: CourseEnrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseEnrollment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseEnrollment_id_seq" OWNER TO postgres;

--
-- Name: CourseEnrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseEnrollment_id_seq" OWNED BY public."CourseEnrollment".id;


--
-- Name: CourseMaterial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseMaterial" (
    id integer NOT NULL,
    title text NOT NULL,
    type text DEFAULT 'PDF'::text NOT NULL,
    url text NOT NULL,
    size integer,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "courseModuleId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseMaterial" OWNER TO postgres;

--
-- Name: CourseMaterial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseMaterial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseMaterial_id_seq" OWNER TO postgres;

--
-- Name: CourseMaterial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseMaterial_id_seq" OWNED BY public."CourseMaterial".id;


--
-- Name: CourseModule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseModule" (
    id integer NOT NULL,
    title text NOT NULL,
    "videoType" text DEFAULT 'URL'::text NOT NULL,
    "videoUrl" text DEFAULT ''::text NOT NULL,
    "durationMinutes" integer DEFAULT 0 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "courseContentId" integer NOT NULL
);


ALTER TABLE public."CourseModule" OWNER TO postgres;

--
-- Name: CourseModule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseModule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseModule_id_seq" OWNER TO postgres;

--
-- Name: CourseModule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseModule_id_seq" OWNED BY public."CourseModule".id;


--
-- Name: Course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Course_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Course_id_seq" OWNER TO postgres;

--
-- Name: Course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Course_id_seq" OWNED BY public."Course".id;


--
-- Name: FooterConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FooterConfig" (
    id text NOT NULL,
    "tenantId" integer NOT NULL,
    "bgColor" text DEFAULT '#0B0F1A'::text NOT NULL,
    "borderColor" text DEFAULT '#ffffff'::text NOT NULL,
    "borderOpacity" integer DEFAULT 8 NOT NULL,
    "headingColor" text DEFAULT '#ffffff'::text NOT NULL,
    "textColor" text DEFAULT '#cbd5e1'::text NOT NULL,
    "mutedTextColor" text DEFAULT '#94a3b8'::text NOT NULL,
    "bottomTextColor" text DEFAULT '#64748b'::text NOT NULL,
    "accentColor" text DEFAULT '#22d3ee'::text NOT NULL,
    "accentHoverColor" text DEFAULT '#67e8f9'::text NOT NULL,
    "ctaTextColor" text DEFAULT '#0f172a'::text NOT NULL,
    "eyebrowText" text DEFAULT 'Let''s Start a Conversation'::text NOT NULL,
    headline text DEFAULT 'Ready to grow your business?'::text NOT NULL,
    "showCta" boolean DEFAULT true NOT NULL,
    "customCss" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FooterConfig" OWNER TO postgres;

--
-- Name: NavbarConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NavbarConfig" (
    id text NOT NULL,
    "tenantId" integer NOT NULL,
    "bgColor" text DEFAULT '#0B0F1A'::text NOT NULL,
    "bgOpacity" integer DEFAULT 90 NOT NULL,
    "linkColor" text DEFAULT '#cbd5e1'::text NOT NULL,
    "linkHoverColor" text DEFAULT '#ffffff'::text NOT NULL,
    "accentColor" text DEFAULT '#22d3ee'::text NOT NULL,
    "dropdownBg" text DEFAULT '#111827'::text NOT NULL,
    sticky boolean DEFAULT true NOT NULL,
    blur boolean DEFAULT true NOT NULL,
    "showLogin" boolean DEFAULT true NOT NULL,
    "showSignup" boolean DEFAULT true NOT NULL,
    "showPricing" boolean DEFAULT true NOT NULL,
    "loginLabel" text DEFAULT 'Log In'::text NOT NULL,
    "signupLabel" text DEFAULT 'Sign Up'::text NOT NULL,
    "pricingLabel" text DEFAULT 'Pricing'::text NOT NULL,
    "customCss" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NavbarConfig" OWNER TO postgres;

--
-- Name: NotFoundLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotFoundLog" (
    id text NOT NULL,
    path text NOT NULL,
    referrer text,
    "userAgent" text,
    "ipAddress" text,
    "suggestedUrl" text,
    "redirectId" text,
    "isResolved" boolean DEFAULT false NOT NULL,
    "occurredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public."NotFoundLog" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer,
    "planId" integer,
    "billingCycle" public."BillingCycle" DEFAULT 'LIFETIME'::public."BillingCycle" NOT NULL,
    "stripePaymentIntentId" text,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: PricingFeature; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PricingFeature" (
    id integer NOT NULL,
    title text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."PricingFeature" OWNER TO postgres;

--
-- Name: PricingFeature_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PricingFeature_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PricingFeature_id_seq" OWNER TO postgres;

--
-- Name: PricingFeature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PricingFeature_id_seq" OWNED BY public."PricingFeature".id;


--
-- Name: Redirect; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Redirect" (
    id text NOT NULL,
    "sourceUrl" text NOT NULL,
    "destinationUrl" text NOT NULL,
    "statusCode" integer DEFAULT 301 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "isAutoDetected" boolean DEFAULT false NOT NULL,
    "hitCount" integer DEFAULT 0 NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "tenantId" integer NOT NULL
);


ALTER TABLE public."Redirect" OWNER TO postgres;

--
-- Name: RedirectImport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RedirectImport" (
    id text NOT NULL,
    filename text NOT NULL,
    "totalCount" integer NOT NULL,
    "successCount" integer NOT NULL,
    "failureCount" integer NOT NULL,
    errors text,
    "importedBy" text NOT NULL,
    "importedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public."RedirectImport" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "billingCycle" public."BillingCycle" DEFAULT 'MONTHLY'::public."BillingCycle" NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'TRIALING'::public."SubscriptionStatus" NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "canceledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: Subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Subscription_id_seq" OWNER TO postgres;

--
-- Name: Subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Subscription_id_seq" OWNED BY public."Subscription".id;


--
-- Name: TrackingSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TrackingSettings" (
    id integer NOT NULL,
    "tenantId" integer NOT NULL,
    "gtmId" text,
    "gaMeasurementId" text,
    "facebookPixelId" text,
    "googleAdsId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrackingSettings" OWNER TO postgres;

--
-- Name: TrackingSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TrackingSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TrackingSettings_id_seq" OWNER TO postgres;

--
-- Name: TrackingSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TrackingSettings_id_seq" OWNED BY public."TrackingSettings".id;


--
-- Name: _categorytopost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._categorytopost (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public._categorytopost OWNER TO postgres;

--
-- Name: _posttotag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._posttotag (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public._posttotag OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: analyticsSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."analyticsSettings" (
    id integer NOT NULL,
    "tenantId" integer NOT NULL,
    "gtmId" text,
    "gtmHeadScript" text,
    "gtmBodyScript" text,
    "gaMeasurementId" text,
    "gaHeadScript" text,
    "facebookPixelId" text,
    "facebookHeadScript" text,
    "googleAdsId" text,
    "googleAdsHeadScript" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoGenerateScripts" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."analyticsSettings" OWNER TO postgres;

--
-- Name: analyticsSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."analyticsSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."analyticsSettings_id_seq" OWNER TO postgres;

--
-- Name: analyticsSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."analyticsSettings_id_seq" OWNED BY public."analyticsSettings".id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "parentId" text,
    "tenantId" integer NOT NULL,
    "sitemapEnabled" boolean DEFAULT true NOT NULL,
    "sitemapPriority" numeric(2,1) DEFAULT 0.5 NOT NULL,
    "sitemapChangeFreq" public."sitemapChangeFrequency" DEFAULT 'WEEKLY'::public."sitemapChangeFrequency" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "userId" integer NOT NULL,
    "tenantId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.collection OWNER TO postgres;

--
-- Name: collection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collection_id_seq OWNER TO postgres;

--
-- Name: collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.collection_id_seq OWNED BY public.collection.id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id text NOT NULL,
    content text NOT NULL,
    "authorName" text NOT NULL,
    "authorEmail" text NOT NULL,
    "authorUrl" text,
    "ipAddress" text,
    "userAgent" text,
    status public.comment_status DEFAULT 'PENDING'::public.comment_status NOT NULL,
    "postId" text NOT NULL,
    "userId" integer,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- Name: footersettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footersettings (
    id integer NOT NULL,
    key text NOT NULL,
    "tenantId" integer NOT NULL,
    value jsonb NOT NULL
);


ALTER TABLE public.footersettings OWNER TO postgres;

--
-- Name: footersettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footersettings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.footersettings_id_seq OWNER TO postgres;

--
-- Name: footersettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footersettings_id_seq OWNED BY public.footersettings.id;


--
-- Name: form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    fields jsonb NOT NULL,
    "submitButtonLabel" text DEFAULT 'Submit'::text,
    "confirmationType" text DEFAULT 'message'::text NOT NULL,
    "confirmationMessage" text,
    "redirectUrl" text,
    emails jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public.form OWNER TO postgres;

--
-- Name: form_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_id_seq OWNER TO postgres;

--
-- Name: form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_id_seq OWNED BY public.form.id;


--
-- Name: formsubmission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formsubmission (
    id integer NOT NULL,
    "formId" integer NOT NULL,
    data jsonb NOT NULL,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public.formsubmission OWNER TO postgres;

--
-- Name: formsubmission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formsubmission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formsubmission_id_seq OWNER TO postgres;

--
-- Name: formsubmission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formsubmission_id_seq OWNED BY public.formsubmission.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    url text NOT NULL,
    "publicId" character varying(255),
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    width integer,
    height integer,
    "altText" text,
    title text,
    caption text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" integer NOT NULL,
    "collectionId" integer
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu (
    id integer NOT NULL,
    name text NOT NULL,
    location text DEFAULT 'none'::text NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public.menu OWNER TO postgres;

--
-- Name: menu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_id_seq OWNER TO postgres;

--
-- Name: menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_id_seq OWNED BY public.menu.id;


--
-- Name: menuitem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menuitem (
    id integer NOT NULL,
    label text NOT NULL,
    type text NOT NULL,
    slug text,
    url text,
    "order" integer NOT NULL,
    "menuId" integer NOT NULL,
    "parentId" integer
);


ALTER TABLE public.menuitem OWNER TO postgres;

--
-- Name: menuitem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menuitem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menuitem_id_seq OWNER TO postgres;

--
-- Name: menuitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menuitem_id_seq OWNED BY public.menuitem.id;


--
-- Name: page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    html text NOT NULL,
    css text,
    js text,
    "jsxCode" text,
    "pageType" text DEFAULT 'html'::text NOT NULL,
    status public.status DEFAULT 'PUBLISHED'::public.status NOT NULL,
    "seoData" jsonb,
    "sitemapEnabled" boolean DEFAULT true NOT NULL,
    "sitemapPriority" numeric(2,1) DEFAULT 0.8 NOT NULL,
    "sitemapChangeFreq" public."sitemapChangeFrequency" DEFAULT 'WEEKLY'::public."sitemapChangeFrequency" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public.page OWNER TO postgres;

--
-- Name: page_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_id_seq OWNER TO postgres;

--
-- Name: page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_id_seq OWNED BY public.page.id;


--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isVisible" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permission_id_seq OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    "featuredImage" text,
    status public.status DEFAULT 'PUBLISHED'::public.status NOT NULL,
    "authorId" integer,
    "seoData" jsonb,
    "publishedAt" timestamp(3) without time zone,
    "sitemapEnabled" boolean DEFAULT true NOT NULL,
    "sitemapPriority" numeric(2,1) DEFAULT 0.8 NOT NULL,
    "sitemapChangeFreq" public."sitemapChangeFrequency" DEFAULT 'WEEKLY'::public."sitemapChangeFrequency" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    format text DEFAULT 'standard'::text NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public.post OWNER TO postgres;

--
-- Name: rolepermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rolepermission (
    id integer NOT NULL,
    role public.rolepermission_role NOT NULL,
    "permissionId" integer NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.rolepermission OWNER TO postgres;

--
-- Name: rolepermission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rolepermission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rolepermission_id_seq OWNER TO postgres;

--
-- Name: rolepermission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rolepermission_id_seq OWNED BY public.rolepermission.id;


--
-- Name: sitesettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sitesettings (
    id integer DEFAULT 1 NOT NULL,
    "siteName" text,
    "siteTagline" text,
    logo text,
    favicon text,
    "defaultMetaTitle" text,
    "defaultMetaDescription" text,
    "postsPerPage" integer DEFAULT 10 NOT NULL,
    "homepageType" text DEFAULT 'posts'::text NOT NULL,
    "homepagePageId" integer,
    "postsPageId" integer,
    "coursesPageId" integer,
    "globalCss" text,
    "globalJs" text,
    "showAdminToolbar" boolean DEFAULT true NOT NULL,
    "tenantId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sitemapEnabled" boolean DEFAULT true NOT NULL,
    "sitemapCacheMinutes" integer DEFAULT 10 NOT NULL,
    "sitemapLastGeneratedAt" timestamp(3) without time zone,
    "sitemapCustomUrl" text,
    "includePages" boolean DEFAULT true NOT NULL,
    "includePosts" boolean DEFAULT true NOT NULL,
    "includeCategories" boolean DEFAULT true NOT NULL,
    "includeTags" boolean DEFAULT false NOT NULL,
    "includeCourses" boolean DEFAULT true NOT NULL,
    "pingSearchEngines" boolean DEFAULT false NOT NULL,
    "cachedSitemapXml" text,
    "cachedSitemapExpiresAt" timestamp(3) without time zone,
    "robotsEnabled" boolean DEFAULT false NOT NULL,
    "robotsContent" text
);


ALTER TABLE public.sitesettings OWNER TO postgres;

--
-- Name: tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "tenantId" integer NOT NULL,
    "sitemapEnabled" boolean DEFAULT false NOT NULL,
    "sitemapPriority" numeric(2,1) DEFAULT 0.8 NOT NULL,
    "sitemapChangeFreq" public."sitemapChangeFrequency" DEFAULT 'WEEKLY'::public."sitemapChangeFrequency" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- Name: tenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenant OWNER TO postgres;

--
-- Name: tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tenant_id_seq OWNER TO postgres;

--
-- Name: tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tenant_id_seq OWNED BY public.tenant.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role public.user_role DEFAULT 'SUBSCRIBER'::public.user_role NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" integer NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: userpermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userpermission (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "permissionId" integer NOT NULL,
    allowed boolean DEFAULT true NOT NULL
);


ALTER TABLE public.userpermission OWNER TO postgres;

--
-- Name: userpermission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userpermission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userpermission_id_seq OWNER TO postgres;

--
-- Name: userpermission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userpermission_id_seq OWNED BY public.userpermission.id;


--
-- Name: Course id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course" ALTER COLUMN id SET DEFAULT nextval('public."Course_id_seq"'::regclass);


--
-- Name: CourseContent id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseContent" ALTER COLUMN id SET DEFAULT nextval('public."CourseContent_id_seq"'::regclass);


--
-- Name: CourseEnrollment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseEnrollment" ALTER COLUMN id SET DEFAULT nextval('public."CourseEnrollment_id_seq"'::regclass);


--
-- Name: CourseMaterial id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseMaterial" ALTER COLUMN id SET DEFAULT nextval('public."CourseMaterial_id_seq"'::regclass);


--
-- Name: CourseModule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseModule" ALTER COLUMN id SET DEFAULT nextval('public."CourseModule_id_seq"'::regclass);


--
-- Name: PricingFeature id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PricingFeature" ALTER COLUMN id SET DEFAULT nextval('public."PricingFeature_id_seq"'::regclass);


--
-- Name: Subscription id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription" ALTER COLUMN id SET DEFAULT nextval('public."Subscription_id_seq"'::regclass);


--
-- Name: TrackingSettings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TrackingSettings" ALTER COLUMN id SET DEFAULT nextval('public."TrackingSettings_id_seq"'::regclass);


--
-- Name: analyticsSettings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."analyticsSettings" ALTER COLUMN id SET DEFAULT nextval('public."analyticsSettings_id_seq"'::regclass);


--
-- Name: collection id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection ALTER COLUMN id SET DEFAULT nextval('public.collection_id_seq'::regclass);


--
-- Name: footersettings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footersettings ALTER COLUMN id SET DEFAULT nextval('public.footersettings_id_seq'::regclass);


--
-- Name: form id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form ALTER COLUMN id SET DEFAULT nextval('public.form_id_seq'::regclass);


--
-- Name: formsubmission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formsubmission ALTER COLUMN id SET DEFAULT nextval('public.formsubmission_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu ALTER COLUMN id SET DEFAULT nextval('public.menu_id_seq'::regclass);


--
-- Name: menuitem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menuitem ALTER COLUMN id SET DEFAULT nextval('public.menuitem_id_seq'::regclass);


--
-- Name: page id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page ALTER COLUMN id SET DEFAULT nextval('public.page_id_seq'::regclass);


--
-- Name: permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);


--
-- Name: rolepermission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermission ALTER COLUMN id SET DEFAULT nextval('public.rolepermission_id_seq'::regclass);


--
-- Name: tenant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant ALTER COLUMN id SET DEFAULT nextval('public.tenant_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: userpermission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userpermission ALTER COLUMN id SET DEFAULT nextval('public.userpermission_id_seq'::regclass);


--
-- Data for Name: BreadcrumbSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BreadcrumbSettings" (id, "tenantId", enabled, "homeLabel", "homeUrl", separator, "showHome", "showCurrent", "showParent", "pagesEnabled", "postsEnabled", "categoriesEnabled", "tagsEnabled", "coursesEnabled", "hideOnHome", "hideOn404", "hideOnSearch", "schemaEnabled", "cssClass", "customCss", "createdAt", "updatedAt") FROM stdin;
cmra7d65s0001ux7o10xqqphw	1	t	Home	\N	/	t	t	t	t	t	t	t	t	t	t	f	t	\N	\N	2026-07-07 05:22:46.768	2026-07-07 05:22:46.768
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Course" (id, title, slug, "shortDescription", instructor, thumbnail, price, "billingCycle", "billingPeriodDays", "durationHours", level, "isFeatured", "isPublished", "sortOrder", "tenantId", "createdAt", "updatedAt", "sitemapEnabled", "sitemapPriority", "sitemapChangeFreq", "courseContentId") FROM stdin;
1	React Mastery	react-mastery	test	John Doe		5000.00	LIFETIME	\N	1	Beginner	f	t	0	1	2026-07-07 07:19:52.001	2026-07-07 07:19:52.001	t	0.8	WEEKLY	1
\.


--
-- Data for Name: CourseContent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseContent" (id, title, slug, "shortDescription", "longDescription", thumbnail, instructor, level, "isPublished", "tenantId", "createdAt", "updatedAt") FROM stdin;
1	React Mastery	react-mastery	test	test		John Doe	Beginner	t	1	2026-07-07 07:06:48.148	2026-07-07 07:14:20.457
\.


--
-- Data for Name: CourseEnrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseEnrollment" (id, "userId", "courseId", "purchasedAt", "billingCycle") FROM stdin;
1	1	1	2026-07-07 07:35:35.161	LIFETIME
\.


--
-- Data for Name: CourseMaterial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseMaterial" (id, title, type, url, size, "sortOrder", "courseModuleId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CourseModule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseModule" (id, title, "videoType", "videoUrl", "durationMinutes", "sortOrder", "courseContentId") FROM stdin;
1	Test Video	FILE	https://res.cloudinary.com/dlxxrwv8a/video/upload/v1783408077/cms-media/tenant-1/27104709-1779-4b6b-4b04-f50c54e3b5d8_twah87.mp4	1	0	1
\.


--
-- Data for Name: FooterConfig; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FooterConfig" (id, "tenantId", "bgColor", "borderColor", "borderOpacity", "headingColor", "textColor", "mutedTextColor", "bottomTextColor", "accentColor", "accentHoverColor", "ctaTextColor", "eyebrowText", headline, "showCta", "customCss", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: NavbarConfig; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NavbarConfig" (id, "tenantId", "bgColor", "bgOpacity", "linkColor", "linkHoverColor", "accentColor", "dropdownBg", sticky, blur, "showLogin", "showSignup", "showPricing", "loginLabel", "signupLabel", "pricingLabel", "customCss", "updatedAt", "createdAt") FROM stdin;
cmrd1pxzo0005uxmo6bzjbx3m	1	#0B0F1A	90	#ebedf0	#cc2424	#22d3ee	#111827	t	t	t	t	f	Log In	Sign Up	Pricing		2026-07-09 05:35:06.205	2026-07-09 05:08:03.54
\.


--
-- Data for Name: NotFoundLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotFoundLog" (id, path, referrer, "userAgent", "ipAddress", "suggestedUrl", "redirectId", "isResolved", "occurredAt", "tenantId") FROM stdin;
cmra8jfyl0001ux00fvksg1dn	/posts	http://localhost:3000/posts/post-page	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-07 05:55:39.02	1
cmrajgmxo0001uxfw78na0nzs	/admin	http://localhost:3000/admin	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-07 11:01:23.864	1
cmrajgtts0003uxfwsxu9p7z3	/admin	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-07 11:01:32.8	1
cmrbxoqc70003uxlomn9xcn17	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:27:22.327	1
cmrbxrnlx0005uxlo3ocmovfa	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:29:38.757	1
cmrbxu2980007uxlo18b9uolg	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:31:31.053	1
cmrbxwkyz0009uxloj78abfnv	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:33:28.62	1
cmrbxxazq000buxloceq6cvkp	/abc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:34:02.342	1
cmrby25250001uxj4g5thlwq7	/abc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:37:47.933	1
cmrby3py50001uxnsw1ola9pt	/abc	http://localhost:3000/abc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:39:01.661	1
cmrbyod280001uxhcvjlvf7m1	/test-page	http://localhost:3000/abc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:55:04.734	1
cmrbys8y30003uxhc7sah48zt	/test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:58:06.028	1
cmrbysc0v0005uxhc0ri6thuy	/test-page	http://localhost:3000/admin	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 10:58:10.016	1
cmrbyv5wp0001uxfgwck3nbrg	/test-page	http://localhost:3000/test-page	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 11:00:22.057	1
cmrbyxeku0003uxfgmr0e7x14	/test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-08 11:02:06.606	1
cmrbyy1vj0005uxfgeeadqtq0	/test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-08 11:02:36.8	1
cmrbyz7xl0007uxfgtejvetl8	/test-page	http://localhost:3000/test-page	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	::ffff:127.0.0.1	\N	\N	f	2026-07-08 11:03:31.305	1
cmrbzbbow0001ux44kxiw5wzl	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 11:12:56.047	1
cmrbzsyyi0001uxowgq8x6ye1	/old-test-page	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 11:26:39.354	1
cmrbzug6k0003uxowq8cphaa7	/old-test-page	http://localhost:3000/old-test-page	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-08 11:27:48.332	1
cmrd18u9j0001uxmoc2hqw88v	/home	http://localhost:3000/admin	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	::1	\N	\N	f	2026-07-09 04:54:45.559	1
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "userId", "courseId", "planId", "billingCycle", "stripePaymentIntentId", amount, currency, status, "createdAt", "updatedAt") FROM stdin;
cmrabxp330001uxg4kcb18qau	1	1	\N	LIFETIME	pi_3TqTSo3oau4sjUZh1u02jmUs	500000	INR	PENDING	2026-07-07 07:30:42.877	2026-07-07 07:30:42.877
cmrac2fwu0003uxg4ijnaap4k	1	1	\N	LIFETIME	pi_3TqTWN3oau4sjUZh1akw9U27	500000	INR	PENDING	2026-07-07 07:34:24.271	2026-07-07 07:34:24.271
cmrac2tns0005uxg4f4qyu8yf	1	1	\N	LIFETIME	pi_3TqTWf3oau4sjUZh0TU5FrZl	500000	INR	SUCCESS	2026-07-07 07:34:42.088	2026-07-07 07:35:35.154
\.


--
-- Data for Name: PricingFeature; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PricingFeature" (id, title, "sortOrder", "courseId") FROM stdin;
1	Test Video	0	1
\.


--
-- Data for Name: Redirect; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Redirect" (id, "sourceUrl", "destinationUrl", "statusCode", "isActive", description, "createdAt", "updatedAt", "createdBy", "isAutoDetected", "hitCount", "lastUsedAt", "tenantId") FROM stdin;
cmrbxo1p50001uxloo57zian1	/old-test-page	/test-page	301	t		2026-07-08 10:26:50.39	2026-07-08 11:30:24.719	\N	f	2	2026-07-08 11:30:24.716	1
\.


--
-- Data for Name: RedirectImport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RedirectImport" (id, filename, "totalCount", "successCount", "failureCount", errors, "importedBy", "importedAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "userId", "courseId", "billingCycle", status, "startsAt", "currentPeriodEnd", "canceledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrackingSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TrackingSettings" (id, "tenantId", "gtmId", "gaMeasurementId", "facebookPixelId", "googleAdsId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _categorytopost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._categorytopost ("A", "B") FROM stdin;
\.


--
-- Data for Name: _posttotag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._posttotag ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
95ad702f-6f47-43b3-a5a5-db35bf72978e	636c553b039ed5839ae7c12d9863de2395ebfbf511cc74a788d8aaf1a23cb3ca	2026-07-07 10:42:38.606165+05:30	20260704054046_init	\N	\N	2026-07-07 10:42:38.216217+05:30	1
00b92542-7bbe-4fb2-8c8d-7dac6289d45e	7cde53ddecc194f2adbbccb66533e53593a8ccbb94f4190145ef86bff18eea76	2026-07-07 10:42:38.643631+05:30	20260706060636_add_breadcrumb_settings	\N	\N	2026-07-07 10:42:38.607371+05:30	1
9eadfc81-fe5c-4238-a38b-256698de5d45	0b13134458dad0b361c8193141391826886dc1401b10eecc0e0cc22b20e8b39d	2026-07-07 10:43:40.368924+05:30	20260707051340_init	\N	\N	2026-07-07 10:43:40.33355+05:30	1
\.


--
-- Data for Name: analyticsSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."analyticsSettings" (id, "tenantId", "gtmId", "gtmHeadScript", "gtmBodyScript", "gaMeasurementId", "gaHeadScript", "facebookPixelId", "facebookHeadScript", "googleAdsId", "googleAdsHeadScript", "createdAt", "updatedAt", "autoGenerateScripts") FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, name, slug, description, "parentId", "tenantId", "sitemapEnabled", "sitemapPriority", "sitemapChangeFreq", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection (id, name, description, "userId", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment (id, content, "authorName", "authorEmail", "authorUrl", "ipAddress", "userAgent", status, "postId", "userId", "parentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: footersettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footersettings (id, key, "tenantId", value) FROM stdin;
\.


--
-- Data for Name: form; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form (id, title, slug, fields, "submitButtonLabel", "confirmationType", "confirmationMessage", "redirectUrl", emails, status, "createdAt", "updatedAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: formsubmission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formsubmission (id, "formId", data, "ipAddress", "createdAt", read, "readAt") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, "fileName", "originalName", url, "publicId", "mimeType", size, width, height, "altText", title, caption, description, "createdAt", "tenantId", "collectionId") FROM stdin;
1	cms-media/tenant-1/27104709-1779-4b6b-4b04-f50c54e3b5d8_twah87	27104709-1779-4b6b-4b04-f50c54e3b5d8.mp4	https://res.cloudinary.com/dlxxrwv8a/video/upload/v1783408077/cms-media/tenant-1/27104709-1779-4b6b-4b04-f50c54e3b5d8_twah87.mp4	cms-media/tenant-1/27104709-1779-4b6b-4b04-f50c54e3b5d8_twah87	video/mp4	7799142	\N	\N	\N	27104709 1779 4b6b 4b04 F50c54e3b5d8	\N	\N	2026-07-07 07:07:58.869	1	\N
\.


--
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu (id, name, location, "tenantId") FROM stdin;
1	Header	header	1
\.


--
-- Data for Name: menuitem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menuitem (id, label, type, slug, url, "order", "menuId", "parentId") FROM stdin;
1	Home	page	home	\N	0	1	\N
2	Services	page	services	\N	1	1	\N
4	Portfolio	page	portfolio	\N	2	1	\N
3	About	page	about	\N	3	1	\N
5	Contact	page	contact	\N	4	1	\N
\.


--
-- Data for Name: page; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page (id, title, slug, html, css, js, "jsxCode", "pageType", status, "seoData", "sitemapEnabled", "sitemapPriority", "sitemapChangeFreq", "createdAt", "updatedAt", "tenantId") FROM stdin;
5	Home	home	<!-- Main Content --><main class="min-h-screen"><!-- Hero Section -->\n<section id="home" class="bg-gradient-to-b from-slate-50 to-white py-20 px-4">\n<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\n<div>\n<h1 class="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">Build Your Digital Dreams</h1>\n<p class="text-xl text-slate-600 mb-8 leading-relaxed">Expert Full Stack Developer specializing in modern web &amp; mobile applications. From concept to deployment, I deliver scalable, high-performance solutions.</p>\n<div class="flex gap-4"><button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"> Get Started </button> <button class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition"> Learn More </button></div>\n</div>\n<div class="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center text-white text-3xl font-bold">[Your Project Showcase]</div>\n</div>\n<!-- Stats Section -->\n<div class="max-w-7xl mx-auto grid grid-cols-3 gap-8 mt-20">\n<div class="text-center">\n<h3 class="text-4xl font-bold text-blue-600">50+</h3>\n<p class="text-slate-600 mt-2">Projects Completed</p>\n</div>\n<div class="text-center">\n<h3 class="text-4xl font-bold text-blue-600">100%</h3>\n<p class="text-slate-600 mt-2">Client Satisfaction</p>\n</div>\n<div class="text-center">\n<h3 class="text-4xl font-bold text-blue-600">5+</h3>\n<p class="text-slate-600 mt-2">Years Experience</p>\n</div>\n</div>\n</section>\n<!-- Tech Stack Preview -->\n<section class="bg-white py-16 px-4">\n<div class="max-w-7xl mx-auto">\n<h2 class="text-3xl font-bold text-slate-900 mb-12 text-center">Tech Stack</h2>\n<div class="grid grid-cols-2 md:grid-cols-4 gap-8">\n<div class="bg-slate-100 rounded-lg p-6 text-center">\n<p class="font-bold text-slate-900">Frontend</p>\n<p class="text-slate-600 text-sm mt-2">React, Next.js, TypeScript</p>\n</div>\n<div class="bg-slate-100 rounded-lg p-6 text-center">\n<p class="font-bold text-slate-900">Backend</p>\n<p class="text-slate-600 text-sm mt-2">Node.js, Express, NestJS</p>\n</div>\n<div class="bg-slate-100 rounded-lg p-6 text-center">\n<p class="font-bold text-slate-900">Database</p>\n<p class="text-slate-600 text-sm mt-2">PostgreSQL, MySQL, MongoDB</p>\n</div>\n<div class="bg-slate-100 rounded-lg p-6 text-center">\n<p class="font-bold text-slate-900">Tools</p>\n<p class="text-slate-600 text-sm mt-2">Docker, Git, AWS, Vercel</p>\n</div>\n</div>\n</div>\n</section>\n<!-- CTA Section -->\n<section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\n<div class="max-w-4xl mx-auto text-center">\n<h2 class="text-4xl font-bold text-white mb-6">Ready to Start Your Project?</h2>\n<p class="text-blue-100 text-lg mb-8">Let's discuss your requirements and build something amazing together.</p>\n<button class="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition"> Book a Consultation </button></div>\n</section>\n</main>			"use client";\n\nexport default function HomePage() {\n\n\n\n  return (\n    <>\n      <main className="min-h-screen">\n        <section id="home" className="bg-gradient-to-b from-slate-50 to-white py-20 px-4">\n          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\n            <div>\n              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">Build Your Digital Dreams</h1>\n              <p className="text-xl text-slate-600 mb-8 leading-relaxed">Expert Full Stack Developer specializing in modern web &amp; mobile applications. From concept to deployment, I deliver scalable, high-performance solutions.</p>\n              <div className="flex gap-4"><button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"> Get Started </button> <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition"> Learn More </button></div>\n            </div>\n            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center text-white text-3xl font-bold">[Your Project Showcase]</div>\n          </div>\n          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 mt-20">\n            <div className="text-center">\n              <h3 className="text-4xl font-bold text-blue-600">50+</h3>\n              <p className="text-slate-600 mt-2">Projects Completed</p>\n            </div>\n            <div className="text-center">\n              <h3 className="text-4xl font-bold text-blue-600">100%</h3>\n              <p className="text-slate-600 mt-2">Client Satisfaction</p>\n            </div>\n            <div className="text-center">\n              <h3 className="text-4xl font-bold text-blue-600">5+</h3>\n              <p className="text-slate-600 mt-2">Years Experience</p>\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Tech Stack</h2>\n            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">\n              <div className="bg-slate-100 rounded-lg p-6 text-center">\n                <p className="font-bold text-slate-900">Frontend</p>\n                <p className="text-slate-600 text-sm mt-2">React, Next.js, TypeScript</p>\n              </div>\n              <div className="bg-slate-100 rounded-lg p-6 text-center">\n                <p className="font-bold text-slate-900">Backend</p>\n                <p className="text-slate-600 text-sm mt-2">Node.js, Express, NestJS</p>\n              </div>\n              <div className="bg-slate-100 rounded-lg p-6 text-center">\n                <p className="font-bold text-slate-900">Database</p>\n                <p className="text-slate-600 text-sm mt-2">PostgreSQL, MySQL, MongoDB</p>\n              </div>\n              <div className="bg-slate-100 rounded-lg p-6 text-center">\n                <p className="font-bold text-slate-900">Tools</p>\n                <p className="text-slate-600 text-sm mt-2">Docker, Git, AWS, Vercel</p>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\n          <div className="max-w-4xl mx-auto text-center">\n            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Project?</h2>\n            <p className="text-blue-100 text-lg mb-8">Let's discuss your requirements and build something amazing together.</p>\n            <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition"> Book a Consultation </button></div>\n        </section>\n      </main>\n    </>\n  );\n}\n	jsx	PUBLISHED	null	t	0.8	WEEKLY	2026-07-09 04:54:30.1	2026-07-09 04:55:01.513	1
6	Services	services	</div>\r\n\r\n<!-- Main Content -->\r\n<main class="min-h-screen">\r\n  <!-- Hero Section -->\r\n  <section class="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h1 class="text-5xl font-bold text-slate-900 mb-4 text-center">Our Services</h1>\r\n      <p class="text-xl text-slate-600 text-center max-w-3xl mx-auto">\r\n        Comprehensive full stack development services tailored to transform your ideas into robust, scalable solutions\r\n      </p>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Web Application Development -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12">Web Application Development</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">\r\n          <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            01\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Custom Web Apps</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Build modern, responsive web applications using React, Next.js, and TypeScript. Optimized for performance\r\n            and user experience.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Single Page Applications (SPA)</li>\r\n            <li>✓ Server-Side Rendering (SSR)</li>\r\n            <li>✓ Progressive Web Apps (PWA)</li>\r\n            <li>✓ Real-time Applications</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">\r\n          <div class="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            02\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">E-Commerce Solutions</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Complete e-commerce platforms with payment integration, inventory management, and customer dashboards.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Product Management System</li>\r\n            <li>✓ Shopping Cart & Checkout</li>\r\n            <li>✓ Payment Gateway Integration</li>\r\n            <li>✓ Order Management</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">\r\n          <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            03\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">CMS & Content Platforms</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            WordPress-like CMS systems with headless architecture, built-in SEO, and multi-tenant support.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Content Management</li>\r\n            <li>✓ SEO Optimization Tools</li>\r\n            <li>✓ Multi-user Support</li>\r\n            <li>✓ Analytics Dashboard</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border border-orange-200">\r\n          <div class="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            04\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Dashboard & Analytics</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Interactive data visualization dashboards with real-time updates, charting libraries, and advanced\r\n            filtering.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Real-time Data Display</li>\r\n            <li>✓ Custom Charts & Graphs</li>\r\n            <li>✓ Export Capabilities</li>\r\n            <li>✓ User Permissions</li>\r\n          </ul>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Backend & API Services -->\r\n  <section class="bg-slate-50 py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12">Backend & API Development</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n        <div class="bg-white rounded-xl p-8 border border-slate-200">\r\n          <div class="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            05\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">REST API Development</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Scalable, secure REST APIs built with Node.js/Express with proper authentication, validation, and\r\n            documentation.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ JWT Authentication</li>\r\n            <li>✓ Request Validation</li>\r\n            <li>✓ Rate Limiting</li>\r\n            <li>✓ API Documentation</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-white rounded-xl p-8 border border-slate-200">\r\n          <div class="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            06\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">GraphQL APIs</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Modern GraphQL APIs with flexible querying, subscriptions, and optimized data fetching for complex\r\n            applications.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Schema Design</li>\r\n            <li>✓ Real-time Subscriptions</li>\r\n            <li>✓ Performance Optimization</li>\r\n            <li>✓ Error Handling</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-white rounded-xl p-8 border border-slate-200">\r\n          <div class="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            07\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Database Design & Optimization</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Expert database architecture with PostgreSQL, MySQL, MongoDB. Includes optimization, migration, and backup\r\n            strategies.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Schema Design</li>\r\n            <li>✓ Query Optimization</li>\r\n            <li>✓ Data Migration</li>\r\n            <li>✓ Backup & Recovery</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-white rounded-xl p-8 border border-slate-200">\r\n          <div class="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            08\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Microservices Architecture</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Build scalable microservices with Docker, Kubernetes, message queues, and proper service communication\r\n            patterns.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Service Design</li>\r\n            <li>✓ Docker & Containers</li>\r\n            <li>✓ Message Queues</li>\r\n            <li>✓ Service Mesh</li>\r\n          </ul>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Mobile & Advanced Services -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12">Mobile & Advanced Services</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n        <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 border border-teal-200">\r\n          <div class="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            09\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Mobile App Development</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Cross-platform mobile apps using React Native and Flutter, deployable on iOS and Android.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ iOS & Android Apps</li>\r\n            <li>✓ Push Notifications</li>\r\n            <li>✓ Offline Sync</li>\r\n            <li>✓ App Store Deployment</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-8 border border-amber-200">\r\n          <div class="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            10\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">DevOps & Deployment</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            CI/CD pipelines, containerization, cloud deployment on AWS, Vercel, Railway, and cPanel servers.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Docker & Docker Compose</li>\r\n            <li>✓ CI/CD Pipelines</li>\r\n            <li>✓ Cloud Deployment</li>\r\n            <li>✓ Server Management</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-lime-50 to-lime-100 rounded-xl p-8 border border-lime-200">\r\n          <div class="bg-lime-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            11\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Performance & Security</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Code optimization, security audits, SSL certificates, data encryption, and compliance implementation.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Performance Tuning</li>\r\n            <li>✓ Security Audits</li>\r\n            <li>✓ SSL & Encryption</li>\r\n            <li>✓ GDPR Compliance</li>\r\n          </ul>\r\n        </div>\r\n\r\n        <div class="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-8 border border-rose-200">\r\n          <div class="bg-rose-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\r\n            12\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Maintenance & Support</h3>\r\n          <p class="text-slate-600 mb-4">\r\n            Ongoing support, bug fixes, feature updates, monitoring, and 24/7 technical assistance.\r\n          </p>\r\n          <ul class="text-slate-600 text-sm space-y-2">\r\n            <li>✓ Bug Fixes</li>\r\n            <li>✓ Feature Updates</li>\r\n            <li>✓ 24/7 Monitoring</li>\r\n            <li>✓ Performance Reports</li>\r\n          </ul>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Process Section -->\r\n  <section class="bg-slate-900 text-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold mb-12 text-center">Our Development Process</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">\r\n        <div class="text-center">\r\n          <div\r\n            class="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\r\n            1</div>\r\n          <h3 class="font-bold mb-2">Discovery</h3>\r\n          <p class="text-slate-300 text-sm">Understand your vision and requirements</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <div\r\n            class="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\r\n            2</div>\r\n          <h3 class="font-bold mb-2">Design</h3>\r\n          <p class="text-slate-300 text-sm">Create mockups and architecture plans</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <div\r\n            class="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\r\n            3</div>\r\n          <h3 class="font-bold mb-2">Development</h3>\r\n          <p class="text-slate-300 text-sm">Build with agile methodology</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <div\r\n            class="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\r\n            4</div>\r\n          <h3 class="font-bold mb-2">Deploy</h3>\r\n          <p class="text-slate-300 text-sm">Launch and monitor performance</p>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n</main>			"use client";\n\nexport default function ServicesPage() {\n\n\n\n  return (\n    <>\n      <main className="min-h-screen">\n        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h1 className="text-5xl font-bold text-slate-900 mb-4 text-center">Our Services</h1>\n            <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto">\n              Comprehensive full stack development services tailored to transform your ideas into robust, scalable solutions\n            </p>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12">Web Application Development</h2>\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">\n                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  01\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Custom Web Apps</h3>\n                <p className="text-slate-600 mb-4">\n                  Build modern, responsive web applications using React, Next.js, and TypeScript. Optimized for performance\n                  and user experience.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Single Page Applications (SPA)</li>\n                  <li>✓ Server-Side Rendering (SSR)</li>\n                  <li>✓ Progressive Web Apps (PWA)</li>\n                  <li>✓ Real-time Applications</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">\n                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  02\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">E-Commerce Solutions</h3>\n                <p className="text-slate-600 mb-4">\n                  Complete e-commerce platforms with payment integration, inventory management, and customer dashboards.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Product Management System</li>\n                  <li>✓ Shopping Cart &amp; Checkout</li>\n                  <li>✓ Payment Gateway Integration</li>\n                  <li>✓ Order Management</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">\n                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  03\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">CMS &amp; Content Platforms</h3>\n                <p className="text-slate-600 mb-4">\n                  WordPress-like CMS systems with headless architecture, built-in SEO, and multi-tenant support.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Content Management</li>\n                  <li>✓ SEO Optimization Tools</li>\n                  <li>✓ Multi-user Support</li>\n                  <li>✓ Analytics Dashboard</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border border-orange-200">\n                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  04\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Dashboard &amp; Analytics</h3>\n                <p className="text-slate-600 mb-4">\n                  Interactive data visualization dashboards with real-time updates, charting libraries, and advanced\n                  filtering.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Real-time Data Display</li>\n                  <li>✓ Custom Charts &amp; Graphs</li>\n                  <li>✓ Export Capabilities</li>\n                  <li>✓ User Permissions</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-slate-50 py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12">Backend &amp; API Development</h2>\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n              <div className="bg-white rounded-xl p-8 border border-slate-200">\n                <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  05\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">REST API Development</h3>\n                <p className="text-slate-600 mb-4">\n                  Scalable, secure REST APIs built with Node.js/Express with proper authentication, validation, and\n                  documentation.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ JWT Authentication</li>\n                  <li>✓ Request Validation</li>\n                  <li>✓ Rate Limiting</li>\n                  <li>✓ API Documentation</li>\n                </ul>\n              </div>\n              <div className="bg-white rounded-xl p-8 border border-slate-200">\n                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  06\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">GraphQL APIs</h3>\n                <p className="text-slate-600 mb-4">\n                  Modern GraphQL APIs with flexible querying, subscriptions, and optimized data fetching for complex\n                  applications.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Schema Design</li>\n                  <li>✓ Real-time Subscriptions</li>\n                  <li>✓ Performance Optimization</li>\n                  <li>✓ Error Handling</li>\n                </ul>\n              </div>\n              <div className="bg-white rounded-xl p-8 border border-slate-200">\n                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  07\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Database Design &amp; Optimization</h3>\n                <p className="text-slate-600 mb-4">\n                  Expert database architecture with PostgreSQL, MySQL, MongoDB. Includes optimization, migration, and backup\n                  strategies.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Schema Design</li>\n                  <li>✓ Query Optimization</li>\n                  <li>✓ Data Migration</li>\n                  <li>✓ Backup &amp; Recovery</li>\n                </ul>\n              </div>\n              <div className="bg-white rounded-xl p-8 border border-slate-200">\n                <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  08\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Microservices Architecture</h3>\n                <p className="text-slate-600 mb-4">\n                  Build scalable microservices with Docker, Kubernetes, message queues, and proper service communication\n                  patterns.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Service Design</li>\n                  <li>✓ Docker &amp; Containers</li>\n                  <li>✓ Message Queues</li>\n                  <li>✓ Service Mesh</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12">Mobile &amp; Advanced Services</h2>\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 border border-teal-200">\n                <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  09\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Mobile App Development</h3>\n                <p className="text-slate-600 mb-4">\n                  Cross-platform mobile apps using React Native and Flutter, deployable on iOS and Android.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ iOS &amp; Android Apps</li>\n                  <li>✓ Push Notifications</li>\n                  <li>✓ Offline Sync</li>\n                  <li>✓ App Store Deployment</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-8 border border-amber-200">\n                <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  10\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">DevOps &amp; Deployment</h3>\n                <p className="text-slate-600 mb-4">\n                  CI/CD pipelines, containerization, cloud deployment on AWS, Vercel, Railway, and cPanel servers.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Docker &amp; Docker Compose</li>\n                  <li>✓ CI/CD Pipelines</li>\n                  <li>✓ Cloud Deployment</li>\n                  <li>✓ Server Management</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-xl p-8 border border-lime-200">\n                <div className="bg-lime-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  11\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Performance &amp; Security</h3>\n                <p className="text-slate-600 mb-4">\n                  Code optimization, security audits, SSL certificates, data encryption, and compliance implementation.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Performance Tuning</li>\n                  <li>✓ Security Audits</li>\n                  <li>✓ SSL &amp; Encryption</li>\n                  <li>✓ GDPR Compliance</li>\n                </ul>\n              </div>\n              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-8 border border-rose-200">\n                <div className="bg-rose-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold">\n                  12\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Maintenance &amp; Support</h3>\n                <p className="text-slate-600 mb-4">\n                  Ongoing support, bug fixes, feature updates, monitoring, and 24/7 technical assistance.\n                </p>\n                <ul className="text-slate-600 text-sm space-y-2">\n                  <li>✓ Bug Fixes</li>\n                  <li>✓ Feature Updates</li>\n                  <li>✓ 24/7 Monitoring</li>\n                  <li>✓ Performance Reports</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-slate-900 text-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold mb-12 text-center">Our Development Process</h2>\n            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">\n              <div className="text-center">\n                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\n                  1</div>\n                <h3 className="font-bold mb-2">Discovery</h3>\n                <p className="text-slate-300 text-sm">Understand your vision and requirements</p>\n              </div>\n              <div className="text-center">\n                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\n                  2</div>\n                <h3 className="font-bold mb-2">Design</h3>\n                <p className="text-slate-300 text-sm">Create mockups and architecture plans</p>\n              </div>\n              <div className="text-center">\n                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\n                  3</div>\n                <h3 className="font-bold mb-2">Development</h3>\n                <p className="text-slate-300 text-sm">Build with agile methodology</p>\n              </div>\n              <div className="text-center">\n                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">\n                  4</div>\n                <h3 className="font-bold mb-2">Deploy</h3>\n                <p className="text-slate-300 text-sm">Launch and monitor performance</p>\n              </div>\n            </div>\n          </div>\n        </section>\n      </main>\n    </>\n  );\n}\n	jsx	PUBLISHED	null	t	0.8	WEEKLY	2026-07-09 04:57:05.001	2026-07-09 04:57:05.452	1
7	Portfolio	portfolio	<!-- Main Content -->\r\n<main class="min-h-screen">\r\n  <!-- Hero Section -->\r\n  <section class="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h1 class="text-5xl font-bold text-slate-900 mb-4 text-center">Featured Projects</h1>\r\n      <p class="text-xl text-slate-600 text-center max-w-3xl mx-auto">\r\n        Explore our portfolio of successful projects built for startups, agencies, and enterprises\r\n      </p>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Filter Section -->\r\n  <section class="bg-white py-8 px-4">\r\n    <div class="max-w-7xl mx-auto flex justify-center gap-4 flex-wrap">\r\n      <button class="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">All</button>\r\n      <button class="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">Web Apps</button>\r\n      <button class="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">E-Commerce</button>\r\n      <button class="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">SaaS</button>\r\n      <button class="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">CMS</button>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Projects Grid -->\r\n  <section class="bg-slate-50 py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n        <!-- Project 1 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            E-Commerce Platform\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Fashion Marketplace</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              A complete e-commerce platform with 500+ products, real-time inventory, and integrated Razorpay/Stripe\r\n              payments.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">PostgreSQL</span>\r\n              <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">Stripe</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 50K+ monthly users</p>\r\n              <p>✓ 99.9% uptime</p>\r\n              <p>✓ Mobile responsive</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Project 2 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            SaaS Platform\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Project Management SaaS</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              Multi-tenant project management tool with real-time collaboration, file sharing, and advanced analytics.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React</span>\r\n              <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Node.js</span>\r\n              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">WebSocket</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 1000+ active teams</p>\r\n              <p>✓ Real-time updates</p>\r\n              <p>✓ Advanced RBAC</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Project 3 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            CMS Platform\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Next-Gen CMS System</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              WordPress alternative with headless architecture, built-in SEO tools, and intuitive content management.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Prisma</span>\r\n              <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">TailwindCSS</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 100+ websites</p>\r\n              <p>✓ SEO optimized</p>\r\n              <p>✓ Content versioning</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Project 4 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            Analytics Dashboard\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Business Intelligence Dashboard</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              Real-time analytics dashboard processing 10M+ data points with interactive visualizations and exports.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React</span>\r\n              <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">D3.js</span>\r\n              <span class="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">GraphQL</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 10M+ data points</p>\r\n              <p>✓ Real-time refresh</p>\r\n              <p>✓ Custom reports</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Project 5 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            Mobile App\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Fitness Tracking App</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              Cross-platform mobile app with workout tracking, nutrition plans, and social features.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React Native</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Firebase</span>\r\n              <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">Stripe</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 100K+ downloads</p>\r\n              <p>✓ iOS & Android</p>\r\n              <p>✓ Push notifications</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Project 6 -->\r\n        <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\r\n          <div\r\n            class="h-64 bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">\r\n            Enterprise System\r\n          </div>\r\n          <div class="p-6">\r\n            <h3 class="text-2xl font-bold text-slate-900 mb-2">Enterprise Resource Planning</h3>\r\n            <p class="text-slate-600 mb-4">\r\n              Comprehensive ERP system with inventory, accounting, HR, and supply chain management modules.\r\n            </p>\r\n            <div class="flex flex-wrap gap-2 mb-4">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">PostgreSQL</span>\r\n              <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Docker</span>\r\n            </div>\r\n            <div class="space-y-2 text-sm text-slate-600 mb-4">\r\n              <p>✓ 10+ companies</p>\r\n              <p>✓ Advanced permissions</p>\r\n              <p>✓ Data security</p>\r\n            </div>\r\n            <button class="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\r\n                            View Case Study →\r\n                        </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Stats Section -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12 text-center">Project Impact</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">\r\n        <div class="text-center">\r\n          <h3 class="text-5xl font-bold text-blue-600 mb-2">50+</h3>\r\n          <p class="text-slate-600 text-lg">Projects Delivered</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <h3 class="text-5xl font-bold text-blue-600 mb-2">2M+</h3>\r\n          <p class="text-slate-600 text-lg">Users Impacted</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <h3 class="text-5xl font-bold text-blue-600 mb-2">$10M+</h3>\r\n          <p class="text-slate-600 text-lg">Client Revenue Generated</p>\r\n        </div>\r\n        <div class="text-center">\r\n          <h3 class="text-5xl font-bold text-blue-600 mb-2">99.9%</h3>\r\n          <p class="text-slate-600 text-lg">Average Uptime</p>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- CTA Section -->\r\n  <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\r\n    <div class="max-w-4xl mx-auto text-center">\r\n      <h2 class="text-4xl font-bold text-white mb-6">Want to See Your Project Here?</h2>\r\n      <p class="text-blue-100 text-lg mb-8">Let's collaborate and build something amazing together.</p>\r\n      <button class="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\r\n                Start Your Project\r\n            </button>\r\n    </div>\r\n  </section>\r\n</main>			"use client";\n\nexport default function PortfolioPage() {\n\n\n\n  return (\n    <>\n      <main className="min-h-screen">\n        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h1 className="text-5xl font-bold text-slate-900 mb-4 text-center">Featured Projects</h1>\n            <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto">\n              Explore our portfolio of successful projects built for startups, agencies, and enterprises\n            </p>\n          </div>\n        </section>\n        <section className="bg-white py-8 px-4">\n          <div className="max-w-7xl mx-auto flex justify-center gap-4 flex-wrap">\n            <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">All</button>\n            <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">Web Apps</button>\n            <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">E-Commerce</button>\n            <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">SaaS</button>\n            <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-full font-semibold hover:bg-slate-300 transition">CMS</button>\n          </div>\n        </section>\n        <section className="bg-slate-50 py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">\n                  E-Commerce Platform\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Fashion Marketplace</h3>\n                  <p className="text-slate-600 mb-4">\n                    A complete e-commerce platform with 500+ products, real-time inventory, and integrated Razorpay/Stripe\n                    payments.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">PostgreSQL</span>\n                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">Stripe</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 50K+ monthly users</p>\n                    <p>✓ 99.9% uptime</p>\n                    <p>✓ Mobile responsive</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">\n                  SaaS Platform\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Project Management SaaS</h3>\n                  <p className="text-slate-600 mb-4">\n                    Multi-tenant project management tool with real-time collaboration, file sharing, and advanced analytics.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React</span>\n                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Node.js</span>\n                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">WebSocket</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 1000+ active teams</p>\n                    <p>✓ Real-time updates</p>\n                    <p>✓ Advanced RBAC</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">\n                  CMS Platform\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Next-Gen CMS System</h3>\n                  <p className="text-slate-600 mb-4">\n                    WordPress alternative with headless architecture, built-in SEO tools, and intuitive content management.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Prisma</span>\n                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">TailwindCSS</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 100+ websites</p>\n                    <p>✓ SEO optimized</p>\n                    <p>✓ Content versioning</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">\n                  Analytics Dashboard\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Business Intelligence Dashboard</h3>\n                  <p className="text-slate-600 mb-4">\n                    Real-time analytics dashboard processing 10M+ data points with interactive visualizations and exports.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React</span>\n                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">D3.js</span>\n                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">GraphQL</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 10M+ data points</p>\n                    <p>✓ Real-time refresh</p>\n                    <p>✓ Custom reports</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">\n                  Mobile App\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Fitness Tracking App</h3>\n                  <p className="text-slate-600 mb-4">\n                    Cross-platform mobile app with workout tracking, nutrition plans, and social features.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">React Native</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Firebase</span>\n                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">Stripe</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 100K+ downloads</p>\n                    <p>✓ iOS &amp; Android</p>\n                    <p>✓ Push notifications</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer">\n                <div className="h-64 bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">\n                  Enterprise System\n                </div>\n                <div className="p-6">\n                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise Resource Planning</h3>\n                  <p className="text-slate-600 mb-4">\n                    Comprehensive ERP system with inventory, accounting, HR, and supply chain management modules.\n                  </p>\n                  <div className="flex flex-wrap gap-2 mb-4">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Next.js</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">PostgreSQL</span>\n                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Docker</span>\n                  </div>\n                  <div className="space-y-2 text-sm text-slate-600 mb-4">\n                    <p>✓ 10+ companies</p>\n                    <p>✓ Advanced permissions</p>\n                    <p>✓ Data security</p>\n                  </div>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition">\n                    View Case Study →\n                  </button>\n                </div>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Project Impact</h2>\n            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">\n              <div className="text-center">\n                <h3 className="text-5xl font-bold text-blue-600 mb-2">50+</h3>\n                <p className="text-slate-600 text-lg">Projects Delivered</p>\n              </div>\n              <div className="text-center">\n                <h3 className="text-5xl font-bold text-blue-600 mb-2">2M+</h3>\n                <p className="text-slate-600 text-lg">Users Impacted</p>\n              </div>\n              <div className="text-center">\n                <h3 className="text-5xl font-bold text-blue-600 mb-2">$10M+</h3>\n                <p className="text-slate-600 text-lg">Client Revenue Generated</p>\n              </div>\n              <div className="text-center">\n                <h3 className="text-5xl font-bold text-blue-600 mb-2">99.9%</h3>\n                <p className="text-slate-600 text-lg">Average Uptime</p>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\n          <div className="max-w-4xl mx-auto text-center">\n            <h2 className="text-4xl font-bold text-white mb-6">Want to See Your Project Here?</h2>\n            <p className="text-blue-100 text-lg mb-8">Let's collaborate and build something amazing together.</p>\n            <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\n              Start Your Project\n            </button>\n          </div>\n        </section>\n      </main>\n    </>\n  );\n}\n	jsx	PUBLISHED	null	t	0.8	WEEKLY	2026-07-09 04:58:18.506	2026-07-09 04:58:18.883	1
8	About	about	<!-- Main Content -->\r\n<main class="min-h-screen">\r\n  <!-- Hero Section -->\r\n  <section class="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\r\n      <div>\r\n        <h1 class="text-5xl font-bold text-slate-900 mb-6">Full Stack Developer</h1>\r\n        <p class="text-xl text-slate-600 mb-6 leading-relaxed">\r\n          Passionate developer with 5+ years of experience building scalable web applications, mobile apps, and\r\n          enterprise solutions. Specialized in modern tech stack with a focus on user experience and code quality.\r\n        </p>\r\n        <div class="flex gap-4">\r\n          <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">\r\n                        Download Resume\r\n                    </button>\r\n          <button class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition">\r\n                        LinkedIn Profile\r\n                    </button>\r\n        </div>\r\n      </div>\r\n      <div\r\n        class="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center text-white text-3xl font-bold">\r\n        [Your Profile Photo]\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- About Content -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-8">About Me</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">\r\n        <div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Professional Background</h3>\r\n          <p class="text-slate-600 mb-4 leading-relaxed">\r\n            I'm a passionate full-stack developer who transforms ideas into powerful digital solutions. With expertise\r\n            in both frontend and backend technologies, I've successfully delivered 50+ projects for startups, agencies,\r\n            and enterprises across various industries.\r\n          </p>\r\n          <p class="text-slate-600 mb-4 leading-relaxed">\r\n            My journey in web development started with a curiosity about how things work on the internet. Over the\r\n            years, I've evolved from a frontend enthusiast to a complete full-stack engineer, mastering the entire\r\n            development lifecycle from architecture design to production deployment.\r\n          </p>\r\n          <p class="text-slate-600 leading-relaxed">\r\n            What drives me is the ability to create meaningful applications that solve real-world problems and provide\r\n            exceptional user experiences. I'm constantly learning and adapting to new technologies to stay at the\r\n            forefront of the industry.\r\n          </p>\r\n        </div>\r\n        <div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-4">Why Choose Me?</h3>\r\n          <div class="space-y-4">\r\n            <div class="flex gap-4">\r\n              <div class="text-blue-600 text-2xl">✓</div>\r\n              <div>\r\n                <h4 class="font-bold text-slate-900">Expert Problem Solver</h4>\r\n                <p class="text-slate-600 text-sm">I approach every challenge methodically and deliver optimized\r\n                  solutions</p>\r\n              </div>\r\n            </div>\r\n            <div class="flex gap-4">\r\n              <div class="text-blue-600 text-2xl">✓</div>\r\n              <div>\r\n                <h4 class="font-bold text-slate-900">Complete Tech Stack</h4>\r\n                <p class="text-slate-600 text-sm">Frontend to backend to DevOps - I handle the entire development cycle\r\n                </p>\r\n              </div>\r\n            </div>\r\n            <div class="flex gap-4">\r\n              <div class="text-blue-600 text-2xl">✓</div>\r\n              <div>\r\n                <h4 class="font-bold text-slate-900">Quality-Focused</h4>\r\n                <p class="text-slate-600 text-sm">Clean code, proper testing, and documentation are non-negotiable</p>\r\n              </div>\r\n            </div>\r\n            <div class="flex gap-4">\r\n              <div class="text-blue-600 text-2xl">✓</div>\r\n              <div>\r\n                <h4 class="font-bold text-slate-900">Reliable Partner</h4>\r\n                <p class="text-slate-600 text-sm">100% client satisfaction with consistent delivery and support</p>\r\n              </div>\r\n            </div>\r\n            <div class="flex gap-4">\r\n              <div class="text-blue-600 text-2xl">✓</div>\r\n              <div>\r\n                <h4 class="font-bold text-slate-900">Scalable Solutions</h4>\r\n                <p class="text-slate-600 text-sm">Built for growth - architecture that scales with your business</p>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Skills & Expertise -->\r\n  <section class="bg-slate-50 py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12">Technical Skills & Expertise</h2>\r\n\r\n      <!-- Frontend Skills -->\r\n      <div class="mb-12">\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\r\n          <span class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Frontend</span>\r\n        </h3>\r\n        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Frameworks & Libraries</h4>\r\n            <div class="space-y-3">\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">React & Next.js</span>\r\n                  <span class="text-slate-600">95%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-blue-600 h-2 rounded-full" style="width: 95%"></div>\r\n                </div>\r\n              </div>\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">TypeScript</span>\r\n                  <span class="text-slate-600">90%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-blue-600 h-2 rounded-full" style="width: 90%"></div>\r\n                </div>\r\n              </div>\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">Tailwind CSS</span>\r\n                  <span class="text-slate-600">95%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-blue-600 h-2 rounded-full" style="width: 95%"></div>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">UI Libraries & Tools</h4>\r\n            <div class="grid grid-cols-2 gap-3">\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">shadcn/ui</span>\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Framer Motion</span>\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">React Query</span>\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Zustand</span>\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Redux</span>\r\n              <span class="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Storybook</span>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- Backend Skills -->\r\n      <div class="mb-12">\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\r\n          <span class="bg-green-600 text-white px-3 py-1 rounded text-sm">Backend</span>\r\n        </h3>\r\n        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Runtime & Frameworks</h4>\r\n            <div class="space-y-3">\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">Node.js & Express</span>\r\n                  <span class="text-slate-600">95%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-green-600 h-2 rounded-full" style="width: 95%"></div>\r\n                </div>\r\n              </div>\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">Prisma ORM</span>\r\n                  <span class="text-slate-600">92%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>\r\n                </div>\r\n              </div>\r\n              <div>\r\n                <div class="flex justify-between mb-1">\r\n                  <span class="text-slate-600 font-semibold">GraphQL</span>\r\n                  <span class="text-slate-600">85%</span>\r\n                </div>\r\n                <div class="w-full bg-slate-200 rounded-full h-2">\r\n                  <div class="bg-green-600 h-2 rounded-full" style="width: 85%"></div>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Databases & Services</h4>\r\n            <div class="grid grid-cols-2 gap-3">\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">PostgreSQL</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">MySQL</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">MongoDB</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Redis</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Firebase</span>\r\n              <span class="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Stripe API</span>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- DevOps & Deployment -->\r\n      <div class="mb-12">\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\r\n          <span class="bg-purple-600 text-white px-3 py-1 rounded text-sm">DevOps & Tools</span>\r\n        </h3>\r\n        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Deployment</h4>\r\n            <div class="space-y-2">\r\n              <p class="text-slate-600">✓ Vercel</p>\r\n              <p class="text-slate-600">✓ AWS (EC2, S3, CloudFront)</p>\r\n              <p class="text-slate-600">✓ Railway</p>\r\n              <p class="text-slate-600">✓ DigitalOcean</p>\r\n              <p class="text-slate-600">✓ cPanel/Shared Hosting</p>\r\n            </div>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Containerization</h4>\r\n            <div class="space-y-2">\r\n              <p class="text-slate-600">✓ Docker</p>\r\n              <p class="text-slate-600">✓ Docker Compose</p>\r\n              <p class="text-slate-600">✓ Kubernetes</p>\r\n              <p class="text-slate-600">✓ CI/CD Pipelines</p>\r\n              <p class="text-slate-600">✓ GitHub Actions</p>\r\n            </div>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-6 border border-slate-200">\r\n            <h4 class="font-bold text-slate-900 mb-4">Version Control & More</h4>\r\n            <div class="space-y-2">\r\n              <p class="text-slate-600">✓ Git & GitHub</p>\r\n              <p class="text-slate-600">✓ GitLab</p>\r\n              <p class="text-slate-600">✓ JIRA</p>\r\n              <p class="text-slate-600">✓ Figma</p>\r\n              <p class="text-slate-600">✓ Postman</p>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- Specialized Skills -->\r\n      <div>\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\r\n          <span class="bg-orange-600 text-white px-3 py-1 rounded text-sm">Specialized Areas</span>\r\n        </h3>\r\n        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ SEO Optimization</p>\r\n            <p class="text-slate-600 text-sm mt-1">Structured data, meta tags, sitemap generation</p>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ Performance Tuning</p>\r\n            <p class="text-slate-600 text-sm mt-1">Page speed, code splitting, caching strategies</p>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ Security Expertise</p>\r\n            <p class="text-slate-600 text-sm mt-1">JWT auth, SSL/TLS, OWASP compliance</p>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ Database Design</p>\r\n            <p class="text-slate-600 text-sm mt-1">Normalization, indexing, query optimization</p>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ API Architecture</p>\r\n            <p class="text-slate-600 text-sm mt-1">REST, GraphQL, real-time WebSockets</p>\r\n          </div>\r\n          <div class="bg-white rounded-lg p-4 border border-slate-200">\r\n            <p class="font-semibold text-slate-900">✓ System Design</p>\r\n            <p class="text-slate-600 text-sm mt-1">Microservices, scalability, architecture patterns</p>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Experience Timeline -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12">Experience & Milestones</h2>\r\n      <div class="space-y-8">\r\n        <div class="flex gap-6">\r\n          <div class="flex flex-col items-center">\r\n            <div class="w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>\r\n            <div class="w-1 h-24 bg-blue-600 mt-2"></div>\r\n          </div>\r\n          <div>\r\n            <h3 class="text-xl font-bold text-slate-900">Senior Full Stack Developer</h3>\r\n            <p class="text-slate-600">2022 - Present</p>\r\n            <p class="text-slate-600 mt-2">Leading development projects, architecting scalable solutions, mentoring\r\n              junior developers</p>\r\n          </div>\r\n        </div>\r\n\r\n        <div class="flex gap-6">\r\n          <div class="flex flex-col items-center">\r\n            <div class="w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>\r\n            <div class="w-1 h-24 bg-blue-600 mt-2"></div>\r\n          </div>\r\n          <div>\r\n            <h3 class="text-xl font-bold text-slate-900">Full Stack Developer</h3>\r\n            <p class="text-slate-600">2019 - 2022</p>\r\n            <p class="text-slate-600 mt-2">Built multiple production applications, improved system performance,\r\n              implemented DevOps practices</p>\r\n          </div>\r\n        </div>\r\n\r\n        <div class="flex gap-6">\r\n          <div class="flex flex-col items-center">\r\n            <div class="w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>\r\n          </div>\r\n          <div>\r\n            <h3 class="text-xl font-bold text-slate-900">Junior Developer</h3>\r\n            <p class="text-slate-600">2019 - 2020</p>\r\n            <p class="text-slate-600 mt-2">Started freelance journey, built first commercial projects, learned modern\r\n              web technologies</p>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- CTA Section -->\r\n  <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\r\n    <div class="max-w-4xl mx-auto text-center">\r\n      <h2 class="text-4xl font-bold text-white mb-6">Let's Work Together</h2>\r\n      <p class="text-blue-100 text-lg mb-8">Ready to bring your vision to life? Let's create something remarkable.</p>\r\n      <button class="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\r\n                Schedule a Consultation\r\n            </button>\r\n    </div>\r\n  </section>\r\n</main>			"use client";\n\nexport default function AboutPage() {\n\n\n\n  return (\n    <>\n      <main className="min-h-screen">\n        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\n          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\n            <div>\n              <h1 className="text-5xl font-bold text-slate-900 mb-6">Full Stack Developer</h1>\n              <p className="text-xl text-slate-600 mb-6 leading-relaxed">\n                Passionate developer with 5+ years of experience building scalable web applications, mobile apps, and\n                enterprise solutions. Specialized in modern tech stack with a focus on user experience and code quality.\n              </p>\n              <div className="flex gap-4">\n                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">\n                  Download Resume\n                </button>\n                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition">\n                  LinkedIn Profile\n                </button>\n              </div>\n            </div>\n            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center text-white text-3xl font-bold">\n              [Your Profile Photo]\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-8">About Me</h2>\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">\n              <div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Professional Background</h3>\n                <p className="text-slate-600 mb-4 leading-relaxed">\n                  I'm a passionate full-stack developer who transforms ideas into powerful digital solutions. With expertise\n                  in both frontend and backend technologies, I've successfully delivered 50+ projects for startups, agencies,\n                  and enterprises across various industries.\n                </p>\n                <p className="text-slate-600 mb-4 leading-relaxed">\n                  My journey in web development started with a curiosity about how things work on the internet. Over the\n                  years, I've evolved from a frontend enthusiast to a complete full-stack engineer, mastering the entire\n                  development lifecycle from architecture design to production deployment.\n                </p>\n                <p className="text-slate-600 leading-relaxed">\n                  What drives me is the ability to create meaningful applications that solve real-world problems and provide\n                  exceptional user experiences. I'm constantly learning and adapting to new technologies to stay at the\n                  forefront of the industry.\n                </p>\n              </div>\n              <div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Choose Me?</h3>\n                <div className="space-y-4">\n                  <div className="flex gap-4">\n                    <div className="text-blue-600 text-2xl">✓</div>\n                    <div>\n                      <h4 className="font-bold text-slate-900">Expert Problem Solver</h4>\n                      <p className="text-slate-600 text-sm">I approach every challenge methodically and deliver optimized\n                        solutions</p>\n                    </div>\n                  </div>\n                  <div className="flex gap-4">\n                    <div className="text-blue-600 text-2xl">✓</div>\n                    <div>\n                      <h4 className="font-bold text-slate-900">Complete Tech Stack</h4>\n                      <p className="text-slate-600 text-sm">Frontend to backend to DevOps - I handle the entire development cycle\n                      </p>\n                    </div>\n                  </div>\n                  <div className="flex gap-4">\n                    <div className="text-blue-600 text-2xl">✓</div>\n                    <div>\n                      <h4 className="font-bold text-slate-900">Quality-Focused</h4>\n                      <p className="text-slate-600 text-sm">Clean code, proper testing, and documentation are non-negotiable</p>\n                    </div>\n                  </div>\n                  <div className="flex gap-4">\n                    <div className="text-blue-600 text-2xl">✓</div>\n                    <div>\n                      <h4 className="font-bold text-slate-900">Reliable Partner</h4>\n                      <p className="text-slate-600 text-sm">100% client satisfaction with consistent delivery and support</p>\n                    </div>\n                  </div>\n                  <div className="flex gap-4">\n                    <div className="text-blue-600 text-2xl">✓</div>\n                    <div>\n                      <h4 className="font-bold text-slate-900">Scalable Solutions</h4>\n                      <p className="text-slate-600 text-sm">Built for growth - architecture that scales with your business</p>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-slate-50 py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12">Technical Skills &amp; Expertise</h2>\n            <div className="mb-12">\n              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\n                <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Frontend</span>\n              </h3>\n              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Frameworks &amp; Libraries</h4>\n                  <div className="space-y-3">\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">React &amp; Next.js</span>\n                        <span className="text-slate-600">95%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}} />\n                      </div>\n                    </div>\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">TypeScript</span>\n                        <span className="text-slate-600">90%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}} />\n                      </div>\n                    </div>\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">Tailwind CSS</span>\n                        <span className="text-slate-600">95%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}} />\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">UI Libraries &amp; Tools</h4>\n                  <div className="grid grid-cols-2 gap-3">\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">shadcn/ui</span>\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Framer Motion</span>\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">React Query</span>\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Zustand</span>\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Redux</span>\n                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-semibold text-sm">Storybook</span>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div className="mb-12">\n              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\n                <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">Backend</span>\n              </h3>\n              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Runtime &amp; Frameworks</h4>\n                  <div className="space-y-3">\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">Node.js &amp; Express</span>\n                        <span className="text-slate-600">95%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-green-600 h-2 rounded-full" style={{width: '95%'}} />\n                      </div>\n                    </div>\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">Prisma ORM</span>\n                        <span className="text-slate-600">92%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}} />\n                      </div>\n                    </div>\n                    <div>\n                      <div className="flex justify-between mb-1">\n                        <span className="text-slate-600 font-semibold">GraphQL</span>\n                        <span className="text-slate-600">85%</span>\n                      </div>\n                      <div className="w-full bg-slate-200 rounded-full h-2">\n                        <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}} />\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Databases &amp; Services</h4>\n                  <div className="grid grid-cols-2 gap-3">\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">PostgreSQL</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">MySQL</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">MongoDB</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Redis</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Firebase</span>\n                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded font-semibold text-sm">Stripe API</span>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div className="mb-12">\n              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\n                <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm">DevOps &amp; Tools</span>\n              </h3>\n              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Deployment</h4>\n                  <div className="space-y-2">\n                    <p className="text-slate-600">✓ Vercel</p>\n                    <p className="text-slate-600">✓ AWS (EC2, S3, CloudFront)</p>\n                    <p className="text-slate-600">✓ Railway</p>\n                    <p className="text-slate-600">✓ DigitalOcean</p>\n                    <p className="text-slate-600">✓ cPanel/Shared Hosting</p>\n                  </div>\n                </div>\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Containerization</h4>\n                  <div className="space-y-2">\n                    <p className="text-slate-600">✓ Docker</p>\n                    <p className="text-slate-600">✓ Docker Compose</p>\n                    <p className="text-slate-600">✓ Kubernetes</p>\n                    <p className="text-slate-600">✓ CI/CD Pipelines</p>\n                    <p className="text-slate-600">✓ GitHub Actions</p>\n                  </div>\n                </div>\n                <div className="bg-white rounded-lg p-6 border border-slate-200">\n                  <h4 className="font-bold text-slate-900 mb-4">Version Control &amp; More</h4>\n                  <div className="space-y-2">\n                    <p className="text-slate-600">✓ Git &amp; GitHub</p>\n                    <p className="text-slate-600">✓ GitLab</p>\n                    <p className="text-slate-600">✓ JIRA</p>\n                    <p className="text-slate-600">✓ Figma</p>\n                    <p className="text-slate-600">✓ Postman</p>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div>\n              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">\n                <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm">Specialized Areas</span>\n              </h3>\n              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ SEO Optimization</p>\n                  <p className="text-slate-600 text-sm mt-1">Structured data, meta tags, sitemap generation</p>\n                </div>\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ Performance Tuning</p>\n                  <p className="text-slate-600 text-sm mt-1">Page speed, code splitting, caching strategies</p>\n                </div>\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ Security Expertise</p>\n                  <p className="text-slate-600 text-sm mt-1">JWT auth, SSL/TLS, OWASP compliance</p>\n                </div>\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ Database Design</p>\n                  <p className="text-slate-600 text-sm mt-1">Normalization, indexing, query optimization</p>\n                </div>\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ API Architecture</p>\n                  <p className="text-slate-600 text-sm mt-1">REST, GraphQL, real-time WebSockets</p>\n                </div>\n                <div className="bg-white rounded-lg p-4 border border-slate-200">\n                  <p className="font-semibold text-slate-900">✓ System Design</p>\n                  <p className="text-slate-600 text-sm mt-1">Microservices, scalability, architecture patterns</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12">Experience &amp; Milestones</h2>\n            <div className="space-y-8">\n              <div className="flex gap-6">\n                <div className="flex flex-col items-center">\n                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white" />\n                  <div className="w-1 h-24 bg-blue-600 mt-2" />\n                </div>\n                <div>\n                  <h3 className="text-xl font-bold text-slate-900">Senior Full Stack Developer</h3>\n                  <p className="text-slate-600">2022 - Present</p>\n                  <p className="text-slate-600 mt-2">Leading development projects, architecting scalable solutions, mentoring\n                    junior developers</p>\n                </div>\n              </div>\n              <div className="flex gap-6">\n                <div className="flex flex-col items-center">\n                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white" />\n                  <div className="w-1 h-24 bg-blue-600 mt-2" />\n                </div>\n                <div>\n                  <h3 className="text-xl font-bold text-slate-900">Full Stack Developer</h3>\n                  <p className="text-slate-600">2019 - 2022</p>\n                  <p className="text-slate-600 mt-2">Built multiple production applications, improved system performance,\n                    implemented DevOps practices</p>\n                </div>\n              </div>\n              <div className="flex gap-6">\n                <div className="flex flex-col items-center">\n                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white" />\n                </div>\n                <div>\n                  <h3 className="text-xl font-bold text-slate-900">Junior Developer</h3>\n                  <p className="text-slate-600">2019 - 2020</p>\n                  <p className="text-slate-600 mt-2">Started freelance journey, built first commercial projects, learned modern\n                    web technologies</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\n          <div className="max-w-4xl mx-auto text-center">\n            <h2 className="text-4xl font-bold text-white mb-6">Let's Work Together</h2>\n            <p className="text-blue-100 text-lg mb-8">Ready to bring your vision to life? Let's create something remarkable.</p>\n            <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\n              Schedule a Consultation\n            </button>\n          </div>\n        </section>\n      </main>\n    </>\n  );\n}\n	jsx	PUBLISHED	null	t	0.8	WEEKLY	2026-07-09 04:59:00.876	2026-07-09 04:59:01.255	1
9	Contact	contact	<!-- Main Content -->\r\n<main class="min-h-screen">\r\n  <!-- Hero Section -->\r\n  <section class="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h1 class="text-5xl font-bold text-slate-900 mb-4 text-center">Get In Touch</h1>\r\n      <p class="text-xl text-slate-600 text-center max-w-3xl mx-auto">\r\n        Have a project in mind? Let's discuss your requirements and create something amazing together\r\n      </p>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Contact Section -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">\r\n      <!-- Email -->\r\n      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 text-center">\r\n        <div\r\n          class="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\r\n          ✉\r\n        </div>\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-2">Email</h3>\r\n        <p class="text-slate-600 mb-4">Send us an email anytime</p>\r\n        <a href="mailto:hello@devstudio.com" class="text-blue-600 font-semibold hover:text-blue-700">\r\n          hello@devstudio.com\r\n        </a>\r\n      </div>\r\n\r\n      <!-- Phone -->\r\n      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200 text-center">\r\n        <div\r\n          class="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\r\n          ☎\r\n        </div>\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-2">Phone</h3>\r\n        <p class="text-slate-600 mb-4">Call us for urgent matters</p>\r\n        <a href="tel:+919876543210" class="text-purple-600 font-semibold hover:text-purple-700">\r\n          +91 98765 43210\r\n        </a>\r\n      </div>\r\n\r\n      <!-- Location -->\r\n      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200 text-center">\r\n        <div\r\n          class="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\r\n          📍\r\n        </div>\r\n        <h3 class="text-2xl font-bold text-slate-900 mb-2">Location</h3>\r\n        <p class="text-slate-600 mb-4">Based in Mumbai, available worldwide</p>\r\n        <p class="text-green-600 font-semibold">\r\n          Mumbai, India\r\n        </p>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Contact Form & Info -->\r\n    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">\r\n      <!-- Form -->\r\n      <div>\r\n        <h2 class="text-3xl font-bold text-slate-900 mb-8">Send us a Message</h2>\r\n        <form class="space-y-6">\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Your Name</label>\r\n            <input type="text" placeholder="John Doe" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\r\n          </div>\r\n\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Email Address</label>\r\n            <input type="email" placeholder="john@example.com" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\r\n          </div>\r\n\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Phone Number</label>\r\n            <input type="tel" placeholder="+91 XXXXX XXXXX" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\r\n          </div>\r\n\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Project Type</label>\r\n            <select class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">\r\n                            <option>Select a service</option>\r\n                            <option>Web Application</option>\r\n                            <option>E-Commerce</option>\r\n                            <option>Mobile App</option>\r\n                            <option>CMS/Blog Platform</option>\r\n                            <option>API Development</option>\r\n                            <option>Other</option>\r\n                        </select>\r\n          </div>\r\n\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Project Budget</label>\r\n            <select class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">\r\n                            <option>Select budget range</option>\r\n                            <option>$500 - $2,000</option>\r\n                            <option>$2,000 - $5,000</option>\r\n                            <option>$5,000 - $10,000</option>\r\n                            <option>$10,000+</option>\r\n                        </select>\r\n          </div>\r\n\r\n          <div>\r\n            <label class="block text-slate-900 font-semibold mb-2">Tell us about your project</label>\r\n            <textarea placeholder="Describe your project requirements, goals, and timeline..." rows="6" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"></textarea>\r\n          </div>\r\n\r\n          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">\r\n                        Send Message\r\n                    </button>\r\n        </form>\r\n      </div>\r\n\r\n      <!-- Info & FAQ -->\r\n      <div>\r\n        <h2 class="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>\r\n        <div class="space-y-6">\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">How do I start a project?</h3>\r\n            <p class="text-slate-600">\r\n              Simply fill out the form or reach out directly. We'll schedule a consultation to understand your needs and\r\n              provide a detailed proposal.\r\n            </p>\r\n          </div>\r\n\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">What's your typical project timeline?</h3>\r\n            <p class="text-slate-600">\r\n              Timeline varies based on complexity. A simple website might take 2-4 weeks, while a full-featured app\r\n              could take 2-3 months or more.\r\n            </p>\r\n          </div>\r\n\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">Do you offer ongoing support?</h3>\r\n            <p class="text-slate-600">\r\n              Yes! We offer maintenance packages, support plans, and feature updates. We can discuss post-launch support\r\n              during the initial consultation.\r\n            </p>\r\n          </div>\r\n\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">What's your payment structure?</h3>\r\n            <p class="text-slate-600">\r\n              We typically work with 50% upfront and 50% on delivery. For larger projects, we can arrange\r\n              milestone-based payments.\r\n            </p>\r\n          </div>\r\n\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">Will I own the code and domain?</h3>\r\n            <p class="text-slate-600">\r\n              Absolutely! You'll have full ownership of the code, domain, and all deliverables. We'll provide complete\r\n              documentation.\r\n            </p>\r\n          </div>\r\n\r\n          <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">\r\n            <h3 class="text-lg font-bold text-slate-900 mb-2">Do you sign NDAs?</h3>\r\n            <p class="text-slate-600">\r\n              Yes, we're happy to sign NDAs to protect your business confidentiality and intellectual property.\r\n            </p>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Pricing Section -->\r\n  <section class="bg-slate-50 py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-4 text-center">Pricing Plans</h2>\r\n      <p class="text-xl text-slate-600 text-center max-w-3xl mx-auto mb-12">\r\n        Choose a plan that fits your project needs, or contact us for custom enterprise solutions\r\n      </p>\r\n\r\n      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">\r\n        <!-- Starter Plan -->\r\n        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-slate-200 hover:border-blue-600 transition">\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-2">Starter</h3>\r\n          <p class="text-slate-600 mb-6">Perfect for small projects</p>\r\n          <div class="mb-6">\r\n            <span class="text-5xl font-bold text-slate-900">$1,500</span>\r\n            <span class="text-slate-600 ml-2">- $3,000</span>\r\n          </div>\r\n          <ul class="space-y-4 mb-8">\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Static website or simple web app</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Up to 5 pages</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Mobile responsive design</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Basic SEO optimization</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">30 days free support</span>\r\n            </li>\r\n          </ul>\r\n          <button class="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition">\r\n                        Get Started\r\n                    </button>\r\n        </div>\r\n\r\n        <!-- Professional Plan -->\r\n        <div\r\n          class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-2xl p-8 border-2 border-blue-600 relative">\r\n          <div\r\n            class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">\r\n            MOST POPULAR\r\n          </div>\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-2">Professional</h3>\r\n          <p class="text-slate-600 mb-6">Best for growing businesses</p>\r\n          <div class="mb-6">\r\n            <span class="text-5xl font-bold text-slate-900">$5,000</span>\r\n            <span class="text-slate-600 ml-2">- $15,000</span>\r\n          </div>\r\n          <ul class="space-y-4 mb-8">\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Full-featured web application</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Custom backend & database</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">User authentication & dashboard</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Payment integration</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">3 months free support</span>\r\n            </li>\r\n          </ul>\r\n          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">\r\n                        Get Started\r\n                    </button>\r\n        </div>\r\n\r\n        <!-- Enterprise Plan -->\r\n        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-slate-200 hover:border-blue-600 transition">\r\n          <h3 class="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>\r\n          <p class="text-slate-600 mb-6">For large-scale projects</p>\r\n          <div class="mb-6">\r\n            <span class="text-5xl font-bold text-slate-900">$15,000</span>\r\n            <span class="text-slate-600 ml-2">+</span>\r\n          </div>\r\n          <ul class="space-y-4 mb-8">\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Complex multi-module systems</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Microservices architecture</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Advanced analytics & reporting</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">24/7 dedicated support</span>\r\n            </li>\r\n            <li class="flex items-start gap-3">\r\n              <span class="text-blue-600 font-bold">✓</span>\r\n              <span class="text-slate-600">Custom maintenance plan</span>\r\n            </li>\r\n          </ul>\r\n          <button class="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition">\r\n                        Contact Sales\r\n                    </button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Testimonials Section -->\r\n  <section class="bg-white py-16 px-4">\r\n    <div class="max-w-7xl mx-auto">\r\n      <h2 class="text-3xl font-bold text-slate-900 mb-12 text-center">What Clients Say</h2>\r\n      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">\r\n        <div class="bg-slate-50 rounded-lg p-8 border border-slate-200">\r\n          <div class="flex gap-1 mb-4">\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n          </div>\r\n          <p class="text-slate-600 mb-4 italic">\r\n            "Outstanding work! The developer understood our requirements perfectly and delivered a high-quality product\r\n            on time. Highly recommended!"\r\n          </p>\r\n          <p class="font-bold text-slate-900">Sarah Johnson</p>\r\n          <p class="text-slate-600 text-sm">CEO, TechStartup Inc.</p>\r\n        </div>\r\n\r\n        <div class="bg-slate-50 rounded-lg p-8 border border-slate-200">\r\n          <div class="flex gap-1 mb-4">\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n          </div>\r\n          <p class="text-slate-600 mb-4 italic">\r\n            "Professional, responsive, and incredibly skilled. Transformed our legacy system into a modern web app.\r\n            Great to work with!"\r\n          </p>\r\n          <p class="font-bold text-slate-900">Michael Chen</p>\r\n          <p class="text-slate-600 text-sm">Founder, Digital Agency</p>\r\n        </div>\r\n\r\n        <div class="bg-slate-50 rounded-lg p-8 border border-slate-200">\r\n          <div class="flex gap-1 mb-4">\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n            <span class="text-yellow-400">★</span>\r\n          </div>\r\n          <p class="text-slate-600 mb-4 italic">\r\n            "One of the best developers we've worked with. Code quality is excellent, communication is clear, and\r\n            they're always willing to go extra mile."\r\n          </p>\r\n          <p class="font-bold text-slate-900">Emma Williams</p>\r\n          <p class="text-slate-600 text-sm">Product Manager, E-Commerce Co.</p>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </section>\r\n\r\n  <!-- Final CTA -->\r\n  <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\r\n    <div class="max-w-4xl mx-auto text-center">\r\n      <h2 class="text-4xl font-bold text-white mb-6">Ready to Start Your Project?</h2>\r\n      <p class="text-blue-100 text-lg mb-8">Don't wait, let's discuss your ideas today and turn them into reality</p>\r\n      <div class="flex gap-4 justify-center flex-wrap">\r\n        <button class="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\r\n                    Get Free Consultation\r\n                </button>\r\n        <button class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition">\r\n                    View My Portfolio\r\n                </button>\r\n      </div>\r\n    </div>\r\n  </section>\r\n</main>			"use client";\n\nexport default function ContactPage() {\n\n\n\n  return (\n    <>\n      <main className="min-h-screen">\n        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h1 className="text-5xl font-bold text-slate-900 mb-4 text-center">Get In Touch</h1>\n            <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto">\n              Have a project in mind? Let's discuss your requirements and create something amazing together\n            </p>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">\n            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 text-center">\n              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\n                ✉\n              </div>\n              <h3 className="text-2xl font-bold text-slate-900 mb-2">Email</h3>\n              <p className="text-slate-600 mb-4">Send us an email anytime</p>\n              <a href="mailto:hello@devstudio.com" className="text-blue-600 font-semibold hover:text-blue-700">\n                hello@devstudio.com\n              </a>\n            </div>\n            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200 text-center">\n              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\n                ☎\n              </div>\n              <h3 className="text-2xl font-bold text-slate-900 mb-2">Phone</h3>\n              <p className="text-slate-600 mb-4">Call us for urgent matters</p>\n              <a href="tel:+919876543210" className="text-purple-600 font-semibold hover:text-purple-700">\n                +91 98765 43210\n              </a>\n            </div>\n            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200 text-center">\n              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">\n                📍\n              </div>\n              <h3 className="text-2xl font-bold text-slate-900 mb-2">Location</h3>\n              <p className="text-slate-600 mb-4">Based in Mumbai, available worldwide</p>\n              <p className="text-green-600 font-semibold">\n                Mumbai, India\n              </p>\n            </div>\n          </div>\n          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">\n            <div>\n              <h2 className="text-3xl font-bold text-slate-900 mb-8">Send us a Message</h2>\n              <form className="space-y-6">\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Your Name</label>\n                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\n                </div>\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Email Address</label>\n                  <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\n                </div>\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Phone Number</label>\n                  <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />\n                </div>\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Project Type</label>\n                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">\n                    <option>Select a service</option>\n                    <option>Web Application</option>\n                    <option>E-Commerce</option>\n                    <option>Mobile App</option>\n                    <option>CMS/Blog Platform</option>\n                    <option>API Development</option>\n                    <option>Other</option>\n                  </select>\n                </div>\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Project Budget</label>\n                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">\n                    <option>Select budget range</option>\n                    <option>$500 - $2,000</option>\n                    <option>$2,000 - $5,000</option>\n                    <option>$5,000 - $10,000</option>\n                    <option>$10,000+</option>\n                  </select>\n                </div>\n                <div>\n                  <label className="block text-slate-900 font-semibold mb-2">Tell us about your project</label>\n                  <textarea placeholder="Describe your project requirements, goals, and timeline..." rows={6} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" defaultValue={""} />\n                </div>\n                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">\n                  Send Message\n                </button>\n              </form>\n            </div>\n            <div>\n              <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>\n              <div className="space-y-6">\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">How do I start a project?</h3>\n                  <p className="text-slate-600">\n                    Simply fill out the form or reach out directly. We'll schedule a consultation to understand your needs and\n                    provide a detailed proposal.\n                  </p>\n                </div>\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">What's your typical project timeline?</h3>\n                  <p className="text-slate-600">\n                    Timeline varies based on complexity. A simple website might take 2-4 weeks, while a full-featured app\n                    could take 2-3 months or more.\n                  </p>\n                </div>\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">Do you offer ongoing support?</h3>\n                  <p className="text-slate-600">\n                    Yes! We offer maintenance packages, support plans, and feature updates. We can discuss post-launch support\n                    during the initial consultation.\n                  </p>\n                </div>\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">What's your payment structure?</h3>\n                  <p className="text-slate-600">\n                    We typically work with 50% upfront and 50% on delivery. For larger projects, we can arrange\n                    milestone-based payments.\n                  </p>\n                </div>\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">Will I own the code and domain?</h3>\n                  <p className="text-slate-600">\n                    Absolutely! You'll have full ownership of the code, domain, and all deliverables. We'll provide complete\n                    documentation.\n                  </p>\n                </div>\n                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">\n                  <h3 className="text-lg font-bold text-slate-900 mb-2">Do you sign NDAs?</h3>\n                  <p className="text-slate-600">\n                    Yes, we're happy to sign NDAs to protect your business confidentiality and intellectual property.\n                  </p>\n                </div>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-slate-50 py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Pricing Plans</h2>\n            <p className="text-xl text-slate-600 text-center max-w-3xl mx-auto mb-12">\n              Choose a plan that fits your project needs, or contact us for custom enterprise solutions\n            </p>\n            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">\n              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-slate-200 hover:border-blue-600 transition">\n                <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>\n                <p className="text-slate-600 mb-6">Perfect for small projects</p>\n                <div className="mb-6">\n                  <span className="text-5xl font-bold text-slate-900">$1,500</span>\n                  <span className="text-slate-600 ml-2">- $3,000</span>\n                </div>\n                <ul className="space-y-4 mb-8">\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Static website or simple web app</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Up to 5 pages</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Mobile responsive design</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Basic SEO optimization</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">30 days free support</span>\n                  </li>\n                </ul>\n                <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition">\n                  Get Started\n                </button>\n              </div>\n              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-2xl p-8 border-2 border-blue-600 relative">\n                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">\n                  MOST POPULAR\n                </div>\n                <h3 className="text-2xl font-bold text-slate-900 mb-2">Professional</h3>\n                <p className="text-slate-600 mb-6">Best for growing businesses</p>\n                <div className="mb-6">\n                  <span className="text-5xl font-bold text-slate-900">$5,000</span>\n                  <span className="text-slate-600 ml-2">- $15,000</span>\n                </div>\n                <ul className="space-y-4 mb-8">\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Full-featured web application</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Custom backend &amp; database</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">User authentication &amp; dashboard</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Payment integration</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">3 months free support</span>\n                  </li>\n                </ul>\n                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">\n                  Get Started\n                </button>\n              </div>\n              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-slate-200 hover:border-blue-600 transition">\n                <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>\n                <p className="text-slate-600 mb-6">For large-scale projects</p>\n                <div className="mb-6">\n                  <span className="text-5xl font-bold text-slate-900">$15,000</span>\n                  <span className="text-slate-600 ml-2">+</span>\n                </div>\n                <ul className="space-y-4 mb-8">\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Complex multi-module systems</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Microservices architecture</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Advanced analytics &amp; reporting</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">24/7 dedicated support</span>\n                  </li>\n                  <li className="flex items-start gap-3">\n                    <span className="text-blue-600 font-bold">✓</span>\n                    <span className="text-slate-600">Custom maintenance plan</span>\n                  </li>\n                </ul>\n                <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition">\n                  Contact Sales\n                </button>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-white py-16 px-4">\n          <div className="max-w-7xl mx-auto">\n            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What Clients Say</h2>\n            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">\n              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">\n                <div className="flex gap-1 mb-4">\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                </div>\n                <p className="text-slate-600 mb-4 italic">\n                  "Outstanding work! The developer understood our requirements perfectly and delivered a high-quality product\n                  on time. Highly recommended!"\n                </p>\n                <p className="font-bold text-slate-900">Sarah Johnson</p>\n                <p className="text-slate-600 text-sm">CEO, TechStartup Inc.</p>\n              </div>\n              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">\n                <div className="flex gap-1 mb-4">\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                </div>\n                <p className="text-slate-600 mb-4 italic">\n                  "Professional, responsive, and incredibly skilled. Transformed our legacy system into a modern web app.\n                  Great to work with!"\n                </p>\n                <p className="font-bold text-slate-900">Michael Chen</p>\n                <p className="text-slate-600 text-sm">Founder, Digital Agency</p>\n              </div>\n              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">\n                <div className="flex gap-1 mb-4">\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                  <span className="text-yellow-400">★</span>\n                </div>\n                <p className="text-slate-600 mb-4 italic">\n                  "One of the best developers we've worked with. Code quality is excellent, communication is clear, and\n                  they're always willing to go extra mile."\n                </p>\n                <p className="font-bold text-slate-900">Emma Williams</p>\n                <p className="text-slate-600 text-sm">Product Manager, E-Commerce Co.</p>\n              </div>\n            </div>\n          </div>\n        </section>\n        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">\n          <div className="max-w-4xl mx-auto text-center">\n            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Project?</h2>\n            <p className="text-blue-100 text-lg mb-8">Don't wait, let's discuss your ideas today and turn them into reality</p>\n            <div className="flex gap-4 justify-center flex-wrap">\n              <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition">\n                Get Free Consultation\n              </button>\n              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition">\n                View My Portfolio\n              </button>\n            </div>\n          </div>\n        </section>\n      </main>\n    </>\n  );\n}\n	jsx	PUBLISHED	null	t	0.8	WEEKLY	2026-07-09 04:59:49.524	2026-07-09 04:59:49.854	1
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (id, name, description, "isVisible") FROM stdin;
1	pages_view	Pages View	t
2	pages_create	Pages Create	t
3	pages_edit_any	Pages Edit Any	t
4	pages_delete	Pages Delete	t
5	posts_view	Posts View	t
6	posts_create	Posts Create	t
7	posts_edit_any	Posts Edit Any	t
8	posts_edit_own	Posts Edit Own	t
9	posts_delete_any	Posts Delete Any	t
10	posts_delete_own	Posts Delete Own	t
11	posts_publish	Posts Publish	t
12	comments_moderate	Comments Moderate	t
13	comments_delete	Comments Delete	t
14	media_upload	Media Upload	t
15	media_delete	Media Delete	t
16	taxonomy_manage	Taxonomy Manage	t
17	menus_manage	Menus Manage	t
18	users_view	Users View	t
19	users_create	Users Create	t
20	users_edit	Users Edit	t
21	users_delete	Users Delete	t
22	users_change_role	Users Change Role	t
23	settings_manage	Settings Manage	t
24	global_css_manage	Global Css Manage	t
25	subscription_manage	Subscription Manage	t
26	courses_view	Courses View	t
27	courses_create	Courses Create	t
28	courses_update	Courses Update	t
29	courses_delete	Courses Delete	t
30	courses_edit	Courses Edit	t
31	course_content_manage	Course Content Manage	t
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post (id, title, slug, excerpt, content, "featuredImage", status, "authorId", "seoData", "publishedAt", "sitemapEnabled", "sitemapPriority", "sitemapChangeFreq", "createdAt", "updatedAt", format, "tenantId") FROM stdin;
fd1eafb2-336d-4a22-a82b-70e03e03ef47	POst Page	post-page		<p>Post Page</p>	\N	PUBLISHED	1	{"autoAlt": true, "ogImage": "", "ogTitle": "", "schemas": [], "autoTitle": true, "metaTitle": "", "separator": "|", "maxSnippet": -1, "schemaType": "WebPage", "altTemplate": "%title%", "redirectUrl": "", "robotsIndex": true, "canonicalUrl": "", "overwriteAlt": false, "robotsFollow": true, "twitterImage": "", "twitterTitle": "", "focusKeywords": [], "ogDescription": "", "titleTemplate": "%title% %sep% %sitename%", "overwriteTitle": false, "breadcrumbTitle": "", "isPillarContent": false, "maxImagePreview": "large", "maxVideoPreview": -1, "metaDescription": "", "redirectEnabled": false, "robotsNoArchive": false, "robotsNoSnippet": false, "useFilenameForAlt": true, "robotsNoImageIndex": false, "twitterDescription": "", "usePageTitleForAlt": true}	2026-07-07 05:53:18.223	t	0.8	WEEKLY	2026-07-07 05:53:18.236	2026-07-07 05:53:18.236	standard	1
\.


--
-- Data for Name: rolepermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rolepermission (id, role, "permissionId", "isVisible") FROM stdin;
1	SUPER_ADMIN	1	t
2	ADMIN	1	t
3	EDITOR	1	t
4	SUPER_ADMIN	2	t
5	ADMIN	2	t
6	EDITOR	2	t
7	SUPER_ADMIN	3	t
8	ADMIN	3	t
9	EDITOR	3	t
10	SUPER_ADMIN	4	t
11	ADMIN	4	t
12	EDITOR	4	t
13	SUPER_ADMIN	5	t
14	ADMIN	5	t
15	EDITOR	5	t
16	AUTHOR	5	t
17	VIEWER	5	t
18	SUPER_ADMIN	6	t
19	ADMIN	6	t
20	EDITOR	6	t
21	AUTHOR	6	t
22	SUPER_ADMIN	7	t
23	ADMIN	7	t
24	EDITOR	7	t
25	SUPER_ADMIN	8	t
26	ADMIN	8	t
27	EDITOR	8	t
28	AUTHOR	8	t
29	SUPER_ADMIN	9	t
30	ADMIN	9	t
31	EDITOR	9	t
32	SUPER_ADMIN	10	t
33	ADMIN	10	t
34	EDITOR	10	t
35	AUTHOR	10	t
36	SUPER_ADMIN	11	t
37	ADMIN	11	t
38	EDITOR	11	t
39	AUTHOR	11	t
40	SUPER_ADMIN	12	t
41	ADMIN	12	t
42	EDITOR	12	t
43	SUPER_ADMIN	13	t
44	ADMIN	13	t
45	EDITOR	13	t
46	SUPER_ADMIN	14	t
47	ADMIN	14	t
48	EDITOR	14	t
49	AUTHOR	14	t
50	SUPER_ADMIN	15	t
51	ADMIN	15	t
52	EDITOR	15	t
53	SUPER_ADMIN	16	t
54	ADMIN	16	t
55	EDITOR	16	t
56	SUPER_ADMIN	17	t
57	ADMIN	17	t
58	EDITOR	17	t
59	SUPER_ADMIN	18	t
60	ADMIN	18	t
61	SUPER_ADMIN	19	t
62	ADMIN	19	t
63	SUPER_ADMIN	20	t
64	ADMIN	20	t
65	SUPER_ADMIN	21	t
66	ADMIN	21	t
67	SUPER_ADMIN	22	t
68	SUPER_ADMIN	23	t
69	ADMIN	23	t
70	SUPER_ADMIN	24	t
71	ADMIN	24	t
72	SUPER_ADMIN	25	t
73	ADMIN	25	t
74	SUPER_ADMIN	26	t
75	ADMIN	26	t
76	SUPER_ADMIN	27	t
77	ADMIN	27	t
78	SUPER_ADMIN	28	t
79	ADMIN	28	t
80	SUPER_ADMIN	29	t
81	ADMIN	29	t
82	SUPER_ADMIN	30	t
83	ADMIN	30	t
84	SUPER_ADMIN	31	t
85	ADMIN	31	t
\.


--
-- Data for Name: sitesettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sitesettings (id, "siteName", "siteTagline", logo, favicon, "defaultMetaTitle", "defaultMetaDescription", "postsPerPage", "homepageType", "homepagePageId", "postsPageId", "coursesPageId", "globalCss", "globalJs", "showAdminToolbar", "tenantId", "createdAt", "updatedAt", "sitemapEnabled", "sitemapCacheMinutes", "sitemapLastGeneratedAt", "sitemapCustomUrl", "includePages", "includePosts", "includeCategories", "includeTags", "includeCourses", "pingSearchEngines", "cachedSitemapXml", "cachedSitemapExpiresAt", "robotsEnabled", "robotsContent") FROM stdin;
1	DevStudio	Build Your Digital Dreams	\N	\N	\N	\N	10	page	5	0	\N	\N	\N	f	1	2026-07-07 05:28:03.01	2026-07-09 05:11:59.153	t	10	2026-07-08 11:15:44.257	\N	t	t	t	f	t	f	\N	\N	t	User-agent: *\nAllow: /\n\nSitemap: http://localhost:3000/sitemap.xml
\.


--
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tag (id, name, slug, "tenantId", "sitemapEnabled", "sitemapPriority", "sitemapChangeFreq", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tenant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant (id, name, slug, "createdAt", "updatedAt") FROM stdin;
1	Momentum	momentum	2026-07-07 05:12:39.79	2026-07-07 05:12:39.79
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, name, role, "createdAt", "updatedAt", "tenantId") FROM stdin;
1	admin@gmail.com	$2b$10$.A72vcVbVemyDf0fGMSVk.W6Sr.j2VGyS95eZw61fvfj6PAYHbX1S	Super Admin	SUPER_ADMIN	2026-07-07 05:12:39.955	2026-07-07 05:12:39.955	1
\.


--
-- Data for Name: userpermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userpermission (id, "userId", "permissionId", allowed) FROM stdin;
\.


--
-- Name: CourseContent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseContent_id_seq"', 1, true);


--
-- Name: CourseEnrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseEnrollment_id_seq"', 1, true);


--
-- Name: CourseMaterial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseMaterial_id_seq"', 1, false);


--
-- Name: CourseModule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseModule_id_seq"', 1, true);


--
-- Name: Course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Course_id_seq"', 1, true);


--
-- Name: PricingFeature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PricingFeature_id_seq"', 1, true);


--
-- Name: Subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Subscription_id_seq"', 1, false);


--
-- Name: TrackingSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TrackingSettings_id_seq"', 1, false);


--
-- Name: analyticsSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."analyticsSettings_id_seq"', 1, false);


--
-- Name: collection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.collection_id_seq', 1, false);


--
-- Name: footersettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footersettings_id_seq', 1, false);


--
-- Name: form_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_id_seq', 1, false);


--
-- Name: formsubmission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formsubmission_id_seq', 1, false);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 1, true);


--
-- Name: menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_id_seq', 1, true);


--
-- Name: menuitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menuitem_id_seq', 5, true);


--
-- Name: page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_id_seq', 9, true);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_id_seq', 31, true);


--
-- Name: rolepermission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rolepermission_id_seq', 85, true);


--
-- Name: tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenant_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 1, true);


--
-- Name: userpermission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userpermission_id_seq', 1, false);


--
-- Name: BreadcrumbSettings BreadcrumbSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BreadcrumbSettings"
    ADD CONSTRAINT "BreadcrumbSettings_pkey" PRIMARY KEY (id);


--
-- Name: CourseContent CourseContent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseContent"
    ADD CONSTRAINT "CourseContent_pkey" PRIMARY KEY (id);


--
-- Name: CourseEnrollment CourseEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseEnrollment"
    ADD CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: CourseMaterial CourseMaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseMaterial"
    ADD CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY (id);


--
-- Name: CourseModule CourseModule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseModule"
    ADD CONSTRAINT "CourseModule_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: FooterConfig FooterConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FooterConfig"
    ADD CONSTRAINT "FooterConfig_pkey" PRIMARY KEY (id);


--
-- Name: NavbarConfig NavbarConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NavbarConfig"
    ADD CONSTRAINT "NavbarConfig_pkey" PRIMARY KEY (id);


--
-- Name: NotFoundLog NotFoundLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotFoundLog"
    ADD CONSTRAINT "NotFoundLog_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PricingFeature PricingFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PricingFeature"
    ADD CONSTRAINT "PricingFeature_pkey" PRIMARY KEY (id);


--
-- Name: RedirectImport RedirectImport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedirectImport"
    ADD CONSTRAINT "RedirectImport_pkey" PRIMARY KEY (id);


--
-- Name: Redirect Redirect_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Redirect"
    ADD CONSTRAINT "Redirect_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: TrackingSettings TrackingSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TrackingSettings"
    ADD CONSTRAINT "TrackingSettings_pkey" PRIMARY KEY (id);


--
-- Name: _categorytopost _categorytopost_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._categorytopost
    ADD CONSTRAINT "_categorytopost_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _posttotag _posttotag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posttotag
    ADD CONSTRAINT "_posttotag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: analyticsSettings analyticsSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."analyticsSettings"
    ADD CONSTRAINT "analyticsSettings_pkey" PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: footersettings footersettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footersettings
    ADD CONSTRAINT footersettings_pkey PRIMARY KEY (id);


--
-- Name: form form_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT form_pkey PRIMARY KEY (id);


--
-- Name: formsubmission formsubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formsubmission
    ADD CONSTRAINT formsubmission_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);


--
-- Name: menuitem menuitem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menuitem
    ADD CONSTRAINT menuitem_pkey PRIMARY KEY (id);


--
-- Name: page page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- Name: rolepermission rolepermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermission
    ADD CONSTRAINT rolepermission_pkey PRIMARY KEY (id);


--
-- Name: sitesettings sitesettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sitesettings
    ADD CONSTRAINT sitesettings_pkey PRIMARY KEY (id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: tenant tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant
    ADD CONSTRAINT tenant_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: userpermission userpermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userpermission
    ADD CONSTRAINT userpermission_pkey PRIMARY KEY (id);


--
-- Name: BreadcrumbSettings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BreadcrumbSettings_tenantId_key" ON public."BreadcrumbSettings" USING btree ("tenantId");


--
-- Name: CourseContent_slug_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CourseContent_slug_tenantId_key" ON public."CourseContent" USING btree (slug, "tenantId");


--
-- Name: CourseContent_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseContent_tenantId_idx" ON public."CourseContent" USING btree ("tenantId");


--
-- Name: CourseEnrollment_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseEnrollment_courseId_idx" ON public."CourseEnrollment" USING btree ("courseId");


--
-- Name: CourseEnrollment_purchasedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseEnrollment_purchasedAt_idx" ON public."CourseEnrollment" USING btree ("purchasedAt");


--
-- Name: CourseEnrollment_userId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON public."CourseEnrollment" USING btree ("userId", "courseId");


--
-- Name: CourseEnrollment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseEnrollment_userId_idx" ON public."CourseEnrollment" USING btree ("userId");


--
-- Name: CourseMaterial_courseModuleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseMaterial_courseModuleId_idx" ON public."CourseMaterial" USING btree ("courseModuleId");


--
-- Name: CourseModule_courseContentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CourseModule_courseContentId_idx" ON public."CourseModule" USING btree ("courseContentId");


--
-- Name: Course_billingCycle_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Course_billingCycle_idx" ON public."Course" USING btree ("billingCycle");


--
-- Name: Course_courseContentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Course_courseContentId_key" ON public."Course" USING btree ("courseContentId");


--
-- Name: Course_isPublished_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Course_isPublished_isFeatured_idx" ON public."Course" USING btree ("isPublished", "isFeatured");


--
-- Name: Course_slug_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Course_slug_tenantId_key" ON public."Course" USING btree (slug, "tenantId");


--
-- Name: Course_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Course_sortOrder_idx" ON public."Course" USING btree ("sortOrder");


--
-- Name: Course_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Course_tenantId_idx" ON public."Course" USING btree ("tenantId");


--
-- Name: FooterConfig_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FooterConfig_tenantId_key" ON public."FooterConfig" USING btree ("tenantId");


--
-- Name: NavbarConfig_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "NavbarConfig_tenantId_key" ON public."NavbarConfig" USING btree ("tenantId");


--
-- Name: NotFoundLog_isResolved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotFoundLog_isResolved_idx" ON public."NotFoundLog" USING btree ("isResolved");


--
-- Name: NotFoundLog_path_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotFoundLog_path_idx" ON public."NotFoundLog" USING btree (path);


--
-- Name: Payment_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_courseId_idx" ON public."Payment" USING btree ("courseId");


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: Payment_stripePaymentIntentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_stripePaymentIntentId_idx" ON public."Payment" USING btree ("stripePaymentIntentId");


--
-- Name: Payment_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON public."Payment" USING btree ("stripePaymentIntentId");


--
-- Name: Payment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_userId_idx" ON public."Payment" USING btree ("userId");


--
-- Name: PricingFeature_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PricingFeature_courseId_idx" ON public."PricingFeature" USING btree ("courseId");


--
-- Name: Redirect_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Redirect_isActive_idx" ON public."Redirect" USING btree ("isActive");


--
-- Name: Redirect_sourceUrl_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Redirect_sourceUrl_idx" ON public."Redirect" USING btree ("sourceUrl");


--
-- Name: Redirect_sourceUrl_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Redirect_sourceUrl_key" ON public."Redirect" USING btree ("sourceUrl");


--
-- Name: Subscription_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscription_courseId_idx" ON public."Subscription" USING btree ("courseId");


--
-- Name: Subscription_currentPeriodEnd_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscription_currentPeriodEnd_idx" ON public."Subscription" USING btree ("currentPeriodEnd");


--
-- Name: Subscription_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscription_status_idx" ON public."Subscription" USING btree (status);


--
-- Name: Subscription_userId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscription_userId_courseId_key" ON public."Subscription" USING btree ("userId", "courseId");


--
-- Name: Subscription_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscription_userId_idx" ON public."Subscription" USING btree ("userId");


--
-- Name: TrackingSettings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TrackingSettings_tenantId_key" ON public."TrackingSettings" USING btree ("tenantId");


--
-- Name: _categorytopost_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_categorytopost_B_index" ON public._categorytopost USING btree ("B");


--
-- Name: _posttotag_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_posttotag_B_index" ON public._posttotag USING btree ("B");


--
-- Name: analyticsSettings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "analyticsSettings_tenantId_key" ON public."analyticsSettings" USING btree ("tenantId");


--
-- Name: category_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "category_parentId_idx" ON public.category USING btree ("parentId");


--
-- Name: category_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "category_tenantId_idx" ON public.category USING btree ("tenantId");


--
-- Name: category_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "category_tenantId_slug_key" ON public.category USING btree ("tenantId", slug);


--
-- Name: collection_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "collection_userId_idx" ON public.collection USING btree ("userId");


--
-- Name: collection_userId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "collection_userId_name_key" ON public.collection USING btree ("userId", name);


--
-- Name: comment_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comment_parentId_idx" ON public.comment USING btree ("parentId");


--
-- Name: comment_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comment_postId_idx" ON public.comment USING btree ("postId");


--
-- Name: comment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comment_userId_idx" ON public.comment USING btree ("userId");


--
-- Name: footersettings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX footersettings_key_key ON public.footersettings USING btree (key);


--
-- Name: footersettings_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "footersettings_tenantId_idx" ON public.footersettings USING btree ("tenantId");


--
-- Name: form_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "form_tenantId_idx" ON public.form USING btree ("tenantId");


--
-- Name: form_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "form_tenantId_slug_key" ON public.form USING btree ("tenantId", slug);


--
-- Name: formsubmission_formId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "formsubmission_formId_idx" ON public.formsubmission USING btree ("formId");


--
-- Name: media_collectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "media_collectionId_idx" ON public.media USING btree ("collectionId");


--
-- Name: media_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "media_tenantId_idx" ON public.media USING btree ("tenantId");


--
-- Name: menuitem_menuId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "menuitem_menuId_idx" ON public.menuitem USING btree ("menuId");


--
-- Name: menuitem_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "menuitem_parentId_idx" ON public.menuitem USING btree ("parentId");


--
-- Name: page_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "page_tenantId_idx" ON public.page USING btree ("tenantId");


--
-- Name: page_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "page_tenantId_slug_key" ON public.page USING btree ("tenantId", slug);


--
-- Name: permission_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permission_name_idx ON public.permission USING btree (name);


--
-- Name: permission_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permission_name_key ON public.permission USING btree (name);


--
-- Name: post_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "post_authorId_idx" ON public.post USING btree ("authorId");


--
-- Name: post_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "post_tenantId_idx" ON public.post USING btree ("tenantId");


--
-- Name: post_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "post_tenantId_slug_key" ON public.post USING btree ("tenantId", slug);


--
-- Name: rolepermission_permissionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rolepermission_permissionId_idx" ON public.rolepermission USING btree ("permissionId");


--
-- Name: rolepermission_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rolepermission_role_idx ON public.rolepermission USING btree (role);


--
-- Name: rolepermission_role_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "rolepermission_role_permissionId_key" ON public.rolepermission USING btree (role, "permissionId");


--
-- Name: sitesettings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sitesettings_tenantId_key" ON public.sitesettings USING btree ("tenantId");


--
-- Name: tag_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tag_tenantId_idx" ON public.tag USING btree ("tenantId");


--
-- Name: tag_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tag_tenantId_slug_key" ON public.tag USING btree ("tenantId", slug);


--
-- Name: tenant_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenant_slug_key ON public.tenant USING btree (slug);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: userpermission_permissionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "userpermission_permissionId_idx" ON public.userpermission USING btree ("permissionId");


--
-- Name: userpermission_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "userpermission_userId_idx" ON public.userpermission USING btree ("userId");


--
-- Name: userpermission_userId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "userpermission_userId_permissionId_key" ON public.userpermission USING btree ("userId", "permissionId");


--
-- Name: BreadcrumbSettings BreadcrumbSettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BreadcrumbSettings"
    ADD CONSTRAINT "BreadcrumbSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseContent CourseContent_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseContent"
    ADD CONSTRAINT "CourseContent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseEnrollment CourseEnrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseEnrollment"
    ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseEnrollment CourseEnrollment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseEnrollment"
    ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseMaterial CourseMaterial_courseModuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseMaterial"
    ADD CONSTRAINT "CourseMaterial_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES public."CourseModule"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseModule CourseModule_courseContentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseModule"
    ADD CONSTRAINT "CourseModule_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES public."CourseContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_courseContentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES public."CourseContent"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Course Course_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FooterConfig FooterConfig_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FooterConfig"
    ADD CONSTRAINT "FooterConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NavbarConfig NavbarConfig_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NavbarConfig"
    ADD CONSTRAINT "NavbarConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotFoundLog NotFoundLog_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotFoundLog"
    ADD CONSTRAINT "NotFoundLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PricingFeature PricingFeature_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PricingFeature"
    ADD CONSTRAINT "PricingFeature_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RedirectImport RedirectImport_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedirectImport"
    ADD CONSTRAINT "RedirectImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Redirect Redirect_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Redirect"
    ADD CONSTRAINT "Redirect_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrackingSettings TrackingSettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TrackingSettings"
    ADD CONSTRAINT "TrackingSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _categorytopost _categorytopost_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._categorytopost
    ADD CONSTRAINT "_categorytopost_A_fkey" FOREIGN KEY ("A") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _categorytopost _categorytopost_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._categorytopost
    ADD CONSTRAINT "_categorytopost_B_fkey" FOREIGN KEY ("B") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _posttotag _posttotag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posttotag
    ADD CONSTRAINT "_posttotag_A_fkey" FOREIGN KEY ("A") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _posttotag _posttotag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._posttotag
    ADD CONSTRAINT "_posttotag_B_fkey" FOREIGN KEY ("B") REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: analyticsSettings analyticsSettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."analyticsSettings"
    ADD CONSTRAINT "analyticsSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: category category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: category category_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: collection collection_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT "collection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: collection collection_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT "collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.comment(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comment comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: footersettings footersettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footersettings
    ADD CONSTRAINT "footersettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: form form_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT "form_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: formsubmission formsubmission_formId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formsubmission
    ADD CONSTRAINT "formsubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES public.form(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media media_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "media_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public.collection(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: media media_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: menu menu_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT "menu_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: menuitem menuitem_menuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menuitem
    ADD CONSTRAINT "menuitem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES public.menu(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: menuitem menuitem_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menuitem
    ADD CONSTRAINT "menuitem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.menuitem(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: page page_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page
    ADD CONSTRAINT "page_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: post post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: post post_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rolepermission rolepermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermission
    ADD CONSTRAINT "rolepermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permission(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sitesettings sitesettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sitesettings
    ADD CONSTRAINT "sitesettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tag tag_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT "tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user user_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: userpermission userpermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userpermission
    ADD CONSTRAINT "userpermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permission(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: userpermission userpermission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userpermission
    ADD CONSTRAINT "userpermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict rY0NsihYaQUZB8TJ0hUGmegKPiU0Q2qVu5hQwihK1WJu83LbftkALwAu1IdPT9z

