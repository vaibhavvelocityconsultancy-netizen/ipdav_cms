# NextCRM Momentum — Project Onboarding

## Quick Summary

- **What:** NextCRM Momentum is a combined CMS + LMS (courses/subscriptions) platform built with Next.js (App Router), Prisma, and PostgreSQL. It supports multi-tenant sites, CMS content (pages, posts, media), course content, payments via Razorpay, subscriptions, and role-based permissions for admin users.
- **Why:** To provide a unified admin-first platform where organizations can manage site content and sell online courses/subscriptions with integrated billing and user management.
- **Where to start:** Read this document, then open [ONBOARDING.md](ONBOARDING.md) (this file) and the key files referenced below.

---

## High-level Architecture

- Frontend: Next.js App Router in `src/app` using React server and client components.
- Backend: Next.js API routes under `src/app/api` serve endpoints for auth, payments, courses, posts, etc.
- Database: PostgreSQL managed by Prisma with models in `prisma/schema.prisma`.
- Auth: JWT tokens created by `src/app/lib/jwt.ts`, stored as an HttpOnly cookie (`auth-token`). Middleware at `middleware.ts` protects `/admin/*` routes.
- Payments: Razorpay integration is used for one-time payments and order creation; the checkout flow is implemented in `src/app/checkout` and server endpoints under `src/app/api/payment`.

---

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React + TypeScript
- Prisma ORM (PostgreSQL)
- PostgreSQL (cloud or local)
- Razorpay (payments)
- Jose (`SignJWT`, `jwtVerify`) for JWT handling
- Tailwind CSS + shadcn/ui styling system
- Cloudinary for media (observed usage in `src/lib/cloudinary.ts`)

---

## Folder Structure (important paths)

- `src/app` — App Router pages and UI routes (server & client components)
  - `src/app/login/page.tsx` — client `LoginPage` component used by app login
  - `src/app/register/page.tsx` — register flow
  - `src/app/checkout/page.tsx` — checkout / Razorpay integration
  - `src/app/api` — API routes (auth, payment, courses, posts, etc.)
- `src/components` — shared UI components and small feature-level components
- `src/lib` — utilities and helpers (e.g., `jwt.ts`, `axios.ts`, `razorpay.ts`, `utils.ts`)
- `src/services` — thin service wrappers that call backend APIs (e.g., `PostServices.ts`)
- `src/provider` — global providers (e.g., `QueryProvider.tsx`)
- `src/hooks` — custom React hooks used across the app
- `src/ui` — primitive UI components (button, card, alert, etc.)
- `prisma` — Prisma schema and seeds (`schema.prisma`, `seed.js`, migrations)
- `public` — static assets and uploads
- `server.js` / `next.config.mjs` / `middleware.ts` — server-level configuration and middleware

Note: The repository also contains documentation and quick references such as `JWT_AUTH_COMPLETE.md`.

---

## Database Design (Prisma models — summary)

All Prisma models are in `prisma/schema.prisma`. Key models and relationships:

- `tenant` — multi-tenancy root; links to `user`, `pages`, `posts`, `courses`, `media`, settings, etc.

- `user` — platform user with fields: `id`, `email`, `password`, `name`, `role` (enum `user_role`). Relations: payments, subscriptions, enrollments, posts, comments, permissions.

- Course & LMS models:
  - `Course` — pricing card with `price`, `billingCycle`, `tenantId`, and links to `CourseContent` via `courseContentId`.
  - `CourseContent` — actual course content (modules, videos) with `modules: CourseModule[]`.
  - `CourseModule` — video/module record with `videoUrl`, `durationMinutes`.
  - `Payment` — payment records referencing `user` and `course`; fields include `razorpayOrderId`, `razorpayPaymentId`, `amount`, `status` (enum `PaymentStatus`).
  - `Subscription` — active/recurring subscription records for monthly/yearly billing with `status` (enum `SubscriptionStatus`).
  - `CourseEnrollment` — enrollment grant after payment.

- CMS models:
  - `post`, `category`, `tag`, `comment` — blog/CMS features with relations between posts/categories/tags and comments.
  - `page` — CMS static pages that can store HTML/CSS/JS.
  - `media` & `collection` — media storage metadata and grouping; integrates with Cloudinary.
  - `menu` / `menuitem` — site navigation management.
  - `form` / `formsubmission` — generic form builder + submissions.

- Permissions & roles:
  - `permission`, `rolepermission`, `userpermission` — support role-based access control; `user.role` and these tables define allowed actions.

- Settings:
  - `sitesettings` and `footersettings` — global site configuration per tenant.

- Enums: `BillingCycle`, `PaymentStatus`, `SubscriptionStatus`, `user_role`, `post_status`, `comment_status`, etc.

Refer to `prisma/schema.prisma` for full fields and indexes.

---

## Authentication Flow (how auth works)

- Client-side: `src/app/login/page.tsx` posts credentials to `POST /api/auth/login` with `credentials: 'include'`.
- Server-side: Login endpoint validates credentials (bcrypt or comparable) and issues a signed JWT using `src/app/lib/jwt.ts::createToken(payload, rememberMe)`.
- Cookie: The server sets an HttpOnly cookie named `auth-token` (used by client fetches via `credentials`) containing the JWT.
- Middleware: `middleware.ts` reads the `auth-token` cookie and calls `verifyToken()` (in `src/app/lib/jwt.ts`). If missing/invalid, it redirects to `/login`. The middleware matcher protects `/admin/:path*`.
- Token details: JWTs are signed with HMAC HS256 using `process.env.NEXTAUTH_SECRET` (fallback default in dev). Tokens have short expiry by default (`1d`) and can be extended to `30d` when `rememberMe` is true.
- Client protected routes: Admin/client pages use the cookie and middleware; client components that need to read claims can call a protected API to get the user profile or rely on server components when possible.

Security notes:

- `auth-token` should be HttpOnly + Secure (set on production) to prevent XSS access.
- CSRF: Endpoints using cookies should validate origin/referer or use same-site cookie policy. Review API endpoints for CSRF protections when accepting state-changing requests.

---

## Key Features (what to look for in the code)

- Multi-tenant CMS (tenants and site settings)
- Role-based admin panel with permission overrides
- LMS: Courses, course content, modules, enrollments, subscriptions
- Razorpay integration for payments and order verification
- Media management and Cloudinary integration
- Form builder and submissions
- Prisma migrations + seeds in `prisma/`

---

## Major Modules and Purpose

- `src/app` — App Router pages. Each subfolder is a route. Look here for UI flows: `login`, `register`, `checkout`, `admin`, `dashboard`, `courses`, `posts`, and more.
- `src/components` — Reusable UI pieces and grouped component features (e.g., admin-specific components).
- `src/ui` — Primitive UI components used by `src/components` (button, card, input)
- `src/lib` — Utility functions and integrations:
  - `jwt.ts` — token creation and verification
  - `axios.ts` & `apimutation.ts` — HTTP helpers
  - `razorpay.ts` — client payment helpers
  - `cloudinary.ts` — upload and media helpers
  - `utils.ts` — shared helpers
- `src/services` — Encapsulated API calls and higher-level logic for use in components/hooks.
- `src/hooks` — Reusable hooks: `use-current-user`, `use-toast`, `use-adminsave`, etc.
- `src/provider/QueryProvider.tsx` — React Query provider and global providers.
- `prisma` — DB models and seeds.
- `public/uploads` — uploaded file storage bucket (organized by year/month under `public/uploads/`).

---

## Pasting HTML in Admin Panel & Public Rendering

- Admin editors: The admin UI exposes a rich visual editor (TinyMCE) and a code editor (Monaco) in `src/components/admin/pages/PageEditorContent.tsx`. Both editors preserve element `class`, `id`, and inline `style` attributes so administrators can paste raw HTML (including Tailwind classes) or build pages in code mode.
- Storage: When saved, the editor writes the HTML into the `page.html` field in the `page` model (Prisma) and also supports storing optional `page.css` and `page.js` values. You can find the editor logic in `src/components/admin/pages/PageEditorContent.tsx` and the public rendering in `src/app/_home-client.tsx` and the `[slug]` page component.
- Rendering on public site: Public pages render the saved HTML using `dangerouslySetInnerHTML` inside a `<main data-page-content>` container. Global and per-page assets are injected at runtime:
  - `sitesettings.globalCss` (fetched via the public bootstrap API) is injected into the document head as a `<style id="global-cms-css">` tag.
  - `sitesettings.globalJs` is injected into the body as a `<script id="global-cms-js">` tag.
  - When a page has `page.css` or `page.js`, those are injected per-page as `<style id="page-css-<id>">` and `<script id="page-js-<id>">` respectively.
    This logic is implemented in `src/app/_home-client.tsx` (see the `useEffect` blocks that append/remove `<style>` and `<script>` nodes).
- Tailwind & dynamic HTML: Tailwind CSS in this project is built from the codebase (`tailwind.config.ts` content paths). That means classes used only inside dynamic HTML stored in the DB may be removed by the optimizer unless you take one of these approaches:
  - Add styling to `sitesettings.globalCss` or `page.css` (these are injected at runtime and are safe for dynamic content).
  - Add frequently-used dynamic classes to a `safelist` in `tailwind.config.ts` so the build keeps those utilities.
  - Ensure the dynamic HTML uses a limited set of classes already present in the codebase, or include a CDN/compiled Tailwind bundle that contains the utilities you need (trade-offs: payload size vs reliability).

- Links & routing: Internal anchor links within pasted HTML are intercepted on the client (see `src/app/_home-client.tsx`) and routed with Next's router so the site behaves like an SPA for internal navigation.
- Scripts & security: `page.js` content is injected and executed, and `page.html` may contain inline scripts. Treat this as a sensitive capability:
  - Only allow trusted admin roles to paste/modify raw HTML/JS.
  - Prefer sanitizing user input when content could come from less-trusted editors.
  - Review `PageEditorContent.tsx` and server-side endpoints for any sanitization or escaping behavior if you want to harden the platform.

## API Endpoints (common)

- `POST /api/auth/login` — user login (sets `auth-token` cookie)
- `POST /api/auth/register` — create new user and optional subscription
- `POST /api/payment/create-order` — create Razorpay order (used by checkout)
- `POST /api/payment/verify` — verify payment webhook/response and mark Payment/Enrollment
- `GET /api/courses/:id` — fetch course details
- CMS endpoints under `api` for posts/pages/media/forms.

(Explore `src/app/api` to list exact route files.)

---

## Running the Project (developer quick start)

1. Copy environment variables from `.env.example` (if present) or create `.env` with at least:
   - `DATABASE_URL` — your PostgreSQL connection
   - `NEXTAUTH_SECRET` — JWT secret
   - Razorpay keys and Cloudinary keys used in the project
2. Install dependencies:

```bash
npm install
```

3. Run Prisma migrations and generate client (if needed):

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
# or
next dev
```

5. Open `http://localhost:3000` and use `/login` to authenticate. Admin routes are protected by `middleware.ts`.

---

## Contributing & Next Steps for New Developers

- Start with `src/app/login/page.tsx` and `src/app/register/page.tsx` for auth flows.
- Review `src/app/lib/jwt.ts` to understand token creation and `middleware.ts` for protected routes.
- For database changes, update `prisma/schema.prisma` and add a migration via `npx prisma migrate dev`.
- Use `prisma/seed.js` to populate test data if needed.
- Add unit tests for API routes and core services where possible.

---

## Troubleshooting / Common Issues

- Build errors related to client-only hooks (e.g., `useSearchParams`) during prerender: ensure such hooks are used only in client components and not executed during server render. See `src/app/login/page.tsx` for a corrected approach (client-side `window.location.search` parsing inside `useEffect`).
- Missing `auth-token` redirects: check `middleware.ts` and `src/app/lib/jwt.ts` for secret mismatch or expired tokens.
- Payment failures: check Razorpay order creation logs and `Payment` records for `razorpayOrderId` and verification steps.

---

## Where I looked / Useful files to review immediately

- `prisma/schema.prisma` — database models
- `middleware.ts` — admin route protection
- `src/app/lib/jwt.ts` — token creation & verification
- `src/app/login/page.tsx` and `src/app/register/page.tsx` — client auth pages
- `src/app/checkout/page.tsx` — Razorpay checkout flow

---

If you'd like, I can:

- Create a shorter developer quickstart README with copy-paste envs and commands.
- Generate an ER diagram from `prisma/schema.prisma`.
- Add API route listing and example requests to this doc.

---

Last updated: 2026-06-24
