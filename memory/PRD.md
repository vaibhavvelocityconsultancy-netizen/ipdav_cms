# NextCRM-Momentum – PRD

## Current branch
`fix/env-variables`

---

## Recent change (2026-01) — E-commerce Phase 1 admin UI (complete)

### Sidebar
- New "E-commerce" nav group with **11 sub-items**: Dashboard, Products, Categories, Brands, Attributes, Orders, Customers, Discounts, Shipping, Taxes, Settings.
- Entire E-commerce section is **gated by `sitesettings.ecommerceEnabled`** via `useModuleFlags()` — hidden when the toggle is OFF (Settings → Modules).

### Shared helpers
- `src/lib/ecom/format.ts` — `formatMoney(amount, currency)` using `Intl.NumberFormat`, `formatDate`, `formatDateTime`. All UI reads currency from settings, no hardcoded ₹/$.
- `src/lib/ecom/useEcomSettings.ts` — SWR-cached `useEcomSettings()` hook.
- `src/lib/ecom/useModuleFlags.ts` — reads sitesettings module toggles.
- `src/components/admin/ecommerce/_shared/EcomListShell.tsx` — reusable list-page shell (header, search, filters slot, table, loading/empty/error/pagination). Used by every list page.
- `src/components/admin/ecommerce/_shared/EcomFormShell.tsx` — reusable form-page shell (back button, header, unsaved-changes badge, cancel/save, discard-confirmation dialog).
- `src/components/admin/ecommerce/_shared/useUnsavedGuard.ts` — snapshot-based dirty-detection hook + `beforeunload` browser guard.
- `src/components/admin/seo/SeoFieldsBlock.tsx` — reusable SEO card (already existed from previous change).

### Fetchers / mutations
- `src/lib/fetchers.ts` — added: `product`, `brands`, `brand`, `productCategories`, `productCategory`, `attributes`, `attribute`, `shippingZones`, `shippingZone`, `taxClasses`, `taxClass`, `coupons`, `coupon`, `orders`, `order`, `customers`, `customer`, `ecomSettings`, `ecomDashboard`.
- `src/lib/apimutation.ts` — added: create/update/delete for products, categories, brands, attributes, shipping zones, tax classes, coupons; updateOrder + addOrderNote; updateEcomSettings.

### Modules (frontend, 10 total)
Each list page: `EcomListShell` + module-specific table row renderer + delete-confirm.
Each form: `EcomFormShell` + module-specific card sections + `useUnsavedGuard` + validation + toast.

| # | Module | Route | Component |
|---|--------|-------|-----------|
| 1 | Dashboard | `/admin/ecommerce` | `EcommerceDashboardPage` — 4 stat cards (revenue this month, orders, pending, low stock), recent orders table, top 5 products |
| 2 | Products | `/admin/ecommerce/products/*` | `ProductsListPage` + `ProductForm` (from previous session) |
| 3 | Categories | `/admin/ecommerce/categories/*` | Nested tree list, form with parent select, image URL |
| 4 | Brands | `/admin/ecommerce/brands/*` | Simple list, form with logo URL |
| 5 | Attributes | `/admin/ecommerce/attributes/*` | List with value chips, form with **inline repeatable values** (add/remove/drag-reorder) |
| 6 | Orders | `/admin/ecommerce/orders/*` | List with status/payment/date-range filters, detail page with line items, addresses, status dropdowns, notes thread (customer-visible toggle), print button |
| 7 | Customers | `/admin/ecommerce/customers/*` | List with orders count + total spent, detail with 3 stat cards + orders table + saved addresses |
| 8 | Discounts | `/admin/ecommerce/discounts/*` | List with computed status badge (Active/Expired/Inactive/Scheduled), form with type toggle, uppercased code, date pickers, active switch |
| 9 | Shipping | `/admin/ecommerce/shipping/*` | Zone list, form with country chips + **inline repeatable rates** (Flat/Free) |
| 10 | Taxes | `/admin/ecommerce/taxes/*` | Class list, form with **inline repeatable rates** (country/state/rate/inclusive) |
| 11 | Settings | `/admin/ecommerce/settings` | Tabbed page: General (currency/units/store address), Checkout (guest checkout, terms, order prefix), Payments (COD + Razorpay with write-only secret) |

### Backend created (existing modules only)
Per user's direction: **frontend-only from Discounts onwards**. Backends built for:
- Categories, Brands, Attributes, Shipping, Taxes, Discounts/Coupons (services + routes)

Backend **NOT** created (frontend expects the API contract):
- Orders (GET list, GET one, PATCH, POST notes)
- Customers (GET list, GET one)
- Ecom Settings (GET, PATCH)
- Ecom Dashboard (GET stats)
- Products (from previous session)

### Expected API contract (referenced from `fetchers.ts`)
```
GET  /api/ecommerce/dashboard         → { revenueThisMonth, revenueDelta?, orderCount, orderCountDelta?, pendingOrders, lowStockCount, recentOrders[], topProducts[] }
GET  /api/ecommerce/orders            → { orders[], pagination }
GET  /api/ecommerce/orders/[id]       → { orderNumber, status, paymentStatus, items[], subtotal, shippingCost, taxAmount, discountAmount, total, currency, user, shippingAddress, billingAddress, paymentMethod, razorpayOrderId?, razorpayPaymentId?, notes[] }
PATCH /api/ecommerce/orders/[id]      → update status / paymentStatus
POST /api/ecommerce/orders/[id]/notes → { note, isCustomerVisible }
GET  /api/ecommerce/customers         → { customers[], pagination }
GET  /api/ecommerce/customers/[id]    → { name, email, orders[], addresses[], totalSpent }
GET  /api/ecommerce/settings          → { currency, weightUnit, dimensionUnit, storeAddress, guestCheckoutEnabled, termsRequired, orderNumberPrefix, codEnabled, razorpayEnabled, razorpayKeyId, razorpayKeySecret? }
PATCH /api/ecommerce/settings         → same fields
```

### Verification
- All new/edited files pass ESLint (0 issues).
- Not run E2E — this sandbox lacks Postgres + backend runtime for the frontend-only modules.

## Backlog
- Build backend services + route handlers for Orders, Customers, Ecom Settings, Ecom Dashboard.
- Bulk actions on Products list (checkbox column + bulk publish/archive/delete).
- Rich-text editor for product description (reuse PostEditor RTE).
- Media picker for product image gallery.
- Analytics chart on dashboard (daily revenue sparkline).
