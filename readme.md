# NextCRM Setup Guide

## Prerequisites

Before starting the development server, ensure you have:

- **Node.js** (v16 or higher)
- **MySQL** (running locally or remotely)
- **npm** or **pnpm** package manager

## Setup Steps

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create or update `.env` file in the root directory with:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## Default Credentials

- **Login Page**: `http://localhost:3000/login`
- **Admin Panel**: `http://localhost:3000/admin`
- **Default User**: Created during migration (check database)

---

## API Reference

Here are all API endpoints for both Pages and Menus:

for forms use these snippets :

<div data-form="test-1"></div>
[form slug="test-1"]
---

## Editors Used

The NextCRM project uses the following editors for content creation:

- **Monaco Editor** (`@monaco-editor/react`): Used for writing and editing HTML and CSS code in pages and posts. Integrated into the content editors for both pages and posts, where you can switch to a "code" tab to edit raw HTML/CSS directly.
- **TipTap** (`@tiptap/react`): Used for visual editing (WYSIWYG) in pages and posts. Provides a rich text editor interface for content creation.

---

### Pages

### Pages

| Method | Endpoint                                 | What it does               |
| ------ | ---------------------------------------- | -------------------------- |
| GET    | `/api/pages`                             | Get all pages              |
| POST   | `/api/pages`                             | Create new page            |
| GET    | `/api/pages/[id]`                        | Get single page by ID      |
| PUT    | `/api/pages/[id]`                        | Update page                |
| PUT    | `/api/pages/[id]` `{action:'publish'}`   | Publish page               |
| PUT    | `/api/pages/[id]` `{action:'unpublish'}` | Unpublish page             |
| DELETE | `/api/pages/[id]`                        | Delete page                |
| GET    | `/api/pages/slug/[slug]`                 | Get published page by slug |
| POST   | `/api/pages/slug/[slug]/check`           | Check slug availability    |

---

### Menus

| Method | Endpoint                         | What it does                    |
| ------ | -------------------------------- | ------------------------------- |
| GET    | `/api/menus`                     | Get all menus with items        |
| POST   | `/api/menus`                     | Create new menu                 |
| GET    | `/api/menus/[id]`                | Get single menu by ID           |
| PUT    | `/api/menus/[id]`                | Update menu name/location/items |
| DELETE | `/api/menus/[id]`                | Delete menu + its items         |
| GET    | `/api/menus/location/[location]` | Get menu by header or footer    |
| POST   | `/api/menus/[id]/items`          | Add item to menu                |
| PUT    | `/api/menus/[id]/items`          | Reorder all items               |
| PUT    | `/api/menus/[id]/items/[itemId]` | Update single item              |
| DELETE | `/api/menus/[id]/items/[itemId]` | Delete single item              |

---

### Folder Structure

```
app/api/
├── pages/
│   ├── route.js                        GET, POST
│   ├── [id]/
│   │   └── route.js                    GET, PUT, DELETE
│   └── slug/
│       └── [slug]/
│           ├── route.js                GET
│           └── check/
│               └── route.js            POST
└── menus/
    ├── route.js                        GET, POST
    ├── [id]/
    │   ├── route.js                    GET, PUT, DELETE
    │   └── items/
    │       ├── route.js                POST, PUT
    │       └── [itemId]/
    │           └── route.js            PUT, DELETE
    └── location/
        └── [location]/
            └── route.js               GET
```

Here's every API endpoint:

**Posts**

```
GET     /api/posts
POST    /api/posts
GET     /api/posts/[id]
PUT     /api/posts/[id]
DELETE  /api/posts/[id]
POST    /api/posts/[id]/publish
POST    /api/posts/[id]/unpublish
POST    /api/posts/slug/[slug]/check
```

**Categories**

```
GET     /api/categories
POST    /api/categories
GET     /api/categories/[id]
PUT     /api/categories/[id]
DELETE  /api/categories/[id]
```

**Tags**

```
GET     /api/tags
POST    /api/tags
GET     /api/tags/[id]
PUT     /api/tags/[id]
DELETE  /api/tags/[id]
```

app/api/
├── posts/
│ ├── route.js GET (all) POST (create)
│ ├── [id]/
│ │ ├── route.js GET PUT DELETE
│ │ ├── publish/route.js POST
│ │ └── unpublish/route.js POST
│ └── slug/[slug]/check/route.js POST (slug availability)
├── categories/
│ ├── route.js GET POST
│ └── [id]/route.js GET PUT DELETE
└── tags/
├── route.js GET POST
└── [id]/route.js GET PUT DELETE

rm -rf ~/https://next-crm-momemtums.vercel.app//standalone_extracted
mkdir ~/https://next-crm-momemtums.vercel.app//standalone_extracted
cd ~/https://next-crm-momemtums.vercel.app//standalone_extracted
unzip -o ~/https://next-crm-momemtums.vercel.app//standalone.zip
cp ~/https://next-crm-momemtums.vercel.app//.env .env
touch ~/https://next-crm-momemtums.vercel.app//tmp/restart.txt

grep "\[auth\]" ~/https://next-crm-momemtums.vercel.app//app.log | tail -50
