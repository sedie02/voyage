# 📁 Voyage - Project Structuur

Complete overzicht van de project structuur en organisatie.

## 🗂️ Root Directory

```
voyage/
├── .github/                  # 🔗 GitHub configuration
│   ├── workflows/
│   │   └── qualityChecks.yml # CI/CD pipeline (linting, tests)
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .vscode/                  # 🎯 VS Code settings
│   ├── settings.json         # Workspace settings
│   └── extensions.json       # Recommended extensions
│
├── docs/                     # 📚 Project documentation
│   ├── ADR/                  # Architecture Decision Records
│   │   └── 001-tech-stack-keuze.md
│   ├── API.md                # API documentation
│   └── DEPLOYMENT.md         # Deployment handleiding
│
├── public/                   # 🌐 Static assets (publicly accessible)
│   └── manifest.json         # PWA manifest
│
├── src/                      # 💻 Source code
│   ├── app/                  # 📱 Next.js App Router (Server Components)
│   │   ├── layout.tsx        # Root layout (PWA, global providers)
│   │   ├── page.tsx          # Home page (/)
│   │   │
│   │   ├── register/         # Authentication
│   │   │   └── page.tsx      # Registration form
│   │   │
│   │   ├── login/            # Authentication
│   │   │   └── page.tsx      # Login form
│   │   │
│   │   ├── trips/            # Trip management (core feature)
│   │   │   ├── page.tsx      # /trips - Trip list/overview
│   │   │   ├── actions.ts    # Server actions: createTrip, updateTrip, deleteTrip, archiveTrip, duplicateTrip
│   │   │   │
│   │   │   ├── new/
│   │   │   │   └── page.tsx  # /trips/new - Create new trip form
│   │   │   │
│   │   │   └── [id]/         # Dynamic trip routes
│   │   │       ├── page.tsx  # /trips/[id] - Trip detail view
│   │   │       ├── TripDetailClient.tsx # Client component for trip detail
│   │   │       │
│   │   │       ├── edit/
│   │   │       │   ├── page.tsx         # /trips/[id]/edit - Edit trip form
│   │   │       │   └── EditTripClient.tsx # Client component for edit form
│   │   │       │
│   │   │       ├── invite/
│   │   │       │   └── actions.ts      # Server actions: createInvite, acceptInvite
│   │   │       │
│   │   │       ├── itinerary/
│   │   │       │   └── actions.ts      # Server actions for itinerary management
│   │   │       │
│   │   │       └── participants/
│   │   │           └── actions.ts      # Server actions for participant management
│   │   │
│   │   └── invite/           # Public invite acceptance (unauthenticated)
│   │       └── [token]/
│   │           ├── page.tsx           # /invite/[token] - Accept invite page
│   │           └── InviteAcceptClient.tsx # Client component for invite acceptance
│   │
│   ├── components/           # 🧩 React Components
│   │   ├── ui/               # Reusable UI components (Tailwind-styled, headless)
│   │   │   └── Toast.tsx     # Toast notification component
│   │   │
│   │   ├── AppHeader.tsx     # Top navigation header
│   │   ├── BottomNav.tsx     # Bottom navigation (mobile)
│   │   ├── ItineraryTab.tsx  # Tab component for itinerary planning
│   │   ├── ParticipantList.tsx # Display trip participants
│   │   └── ShareTripModal.tsx # Modal for creating/managing invite links
│   │
│   ├── contexts/             # 🔗 React Context
│   │   └── ToastContext.tsx  # Toast notification context & provider
│   │
│   ├── lib/                  # 📚 Utilities & Helpers
│   │   ├── supabase/
│   │   │   ├── client.ts     # Browser Supabase client (createBrowserClient, SSR-compatible)
│   │   │   └── server.ts     # Server Supabase client (createServerClient or service role)
│   │   │
│   │   ├── external/
│   │   │   ├── places.ts     # Google Places API integration
│   │   │   └── getyourguide.ts # GetYourGuide API integration
│   │   │
│   │   ├── session.ts        # Guest session management (UUID in cookie, 30-day expiry)
│   │   │
│   │   └── utils/
│   │       ├── cn.ts         # Classname merger (tailwind-merge)
│   │       ├── date.ts       # Date utilities (formatting, parsing)
│   │       └── validation.ts # Form validation schemas (Zod)
│   │
│   ├── types/                # 📝 TypeScript Types
│   │   └── database.types.ts # Supabase auto-generated types (from schema)
│   │
│   ├── styles/               # 🎨 Global Styles
│   │   └── globals.css       # Tailwind directives + global CSS
│   │
│   └── config/               # ⚙️ Configuration
│       └── constants.ts      # App constants (trip types, validation rules, etc.)
│
├── supabase/                 # 🗄️ Database & RLS Policies
│   ├── schema.sql            # Complete database schema with RLS policies
│   ├── init.sql              # Full initialization script
│   ├── init-simple.sql       # Simplified init (guests only)
│   ├── seed.sql              # Seed data (optional test data)
│   ├── add-guest-session.sql # Migration: guest_session_id column
│   ├── disable-rls.sql       # Utility: disable RLS for development
│   └── (other migrations)    # Additional migration files
│
├── tests/                    # 🧪 Test Suites
│   └── trips/
│       ├── unit/             # Unit tests (individual components/functions)
│       │   ├── NewTripPage.test.tsx
│       │   ├── NewTripFormValidation.spec.tsx
│       │   ├── TripsPage.test.tsx
│       │   ├── EditTripClient.test.tsx
│       │   ├── EditTripClient.update.test.tsx
│       │   ├── Toast.spec.tsx
│       │   └── api/
│       │       └── tripCreation.spec.ts
│       │
│       ├── integration/      # Integration tests (components + server actions)
│       │   ├── NewTripPage.spec.tsx
│       │   ├── NewTripFormFlow.spec.tsx
│       │   ├── EditTripPage.test.tsx
│       │   ├── updateTripAction.test.ts
│       │   └── api/
│       │       └── tripEndpoint.spec.ts
│       │
│       ├── e2e/              # End-to-end tests (Playwright)
│       │   ├── newTripToast.e2e.ts
│       │   ├── newTripValidation.e2e.ts
│       │   ├── trip-update-flow.e2e.ts
│       │   ├── tripApi.e2e.ts
│       │   └── trips-edit.e2e.ts
│       │
│       └── testcases.md      # Test case documentation
│
├── test-results/             # 📊 Test run artifacts
│   └── .last-run.json
│
├── playwright-report/        # 📈 Playwright test reports (generated)
│   └── index.html
│
├── .env.local.example        # Environment template
├── .eslintrc.json            # ESLint configuration
├── .gitignore
├── .prettierignore
├── .prettierrc                # Prettier configuration
│
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
│
├── jest.config.js            # Jest (unit test) configuration
├── jest.setup.js             # Jest setup & global test utilities
├── playwright.config.ts      # Playwright (e2e test) configuration
│
├── package.json              # Dependencies & scripts
├── package-lock.json         # Locked dependency versions
│
├── next-env.d.ts             # Auto-generated Next.js types
│
├── README.md                 # Project overview & getting started
├── QUICK_START.md            # Quick setup guide
├── SETUP_COMPLETE.md         # Setup checklist
├── TEST_STATUS.md            # Test coverage status
├── DATABASE_MIGRATION.md     # Database migration guide
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
├── GOOGLE_MAPS_SETUP.md      # Google Maps API configuration
├── ADD_GUEST_SESSION_COLUMN.sql # SQL migration utility
├── PROJECT_STRUCTURE.md      # This file
└── (other docs)              # Additional documentation
```

## 📋 Key Files Overview

### Application Entry Points

- **`src/app/layout.tsx`** — Root layout with ToastProvider, PWA config, Supabase session setup
- **`src/app/page.tsx`** — Home page (/)
- **`src/app/trips/page.tsx`** — Main trip list view (/trips)
- **`src/app/trips/new/page.tsx`** — Create new trip form (/trips/new)
- **`src/app/trips/[id]/page.tsx`** — Trip detail view (/trips/[id])
- **`src/app/invite/[token]/page.tsx`** — Public invite acceptance (/invite/[token])

### Core Server Actions

**`src/app/trips/actions.ts`**

- `createTrip()` — Create new trip (requires auth or guest session)
- `updateTrip()` — Update trip details (owner/editor only)
- `deleteTrip()` — Delete trip (owner only)
- `archiveTrip()` — Archive trip (owner only)
- `duplicateTrip()` — Duplicate existing trip

**`src/app/trips/[id]/invite/actions.ts`**

- `createInvite()` — Generate invite link for trip
- `acceptInvite()` — Accept invite link & join trip

**`src/app/trips/[id]/participants/actions.ts`**

- Manage trip participants (add, remove, update roles)

**`src/app/trips/[id]/itinerary/actions.ts`**

- Manage itinerary items and daily plans

### Configuration Files

- **`next.config.js`** — Next.js build & runtime config
- **`tsconfig.json`** — TypeScript compiler options (path aliases like @/\*)
- **`tailwind.config.ts`** — Tailwind CSS config (colors, fonts, plugins)
- **`postcss.config.js`** — PostCSS processing (Tailwind, Autoprefixer)
- **`jest.config.js`** — Jest unit test config (testMatch, ignore e2e patterns)
- **`jest.setup.js`** — Jest global setup & mocks
- **`playwright.config.ts`** — Playwright e2e test config (testDir: './tests', testMatch: '\*_/_.e2e.ts')
- **`.eslintrc.json`** — ESLint linting rules
- **`.prettierrc`** — Prettier code formatting config

### Database

- **`supabase/schema.sql`** — Complete DB schema (tables: trips, trip_participants, invite_links, etc.)
  - **RLS Policies**: Secure row-level access control
  - **Tables**: users, profiles, trips, trip_participants, invite_links, itinerary_items, activities
- **`supabase/init.sql`** — Full DB initialization
- **`supabase/init-simple.sql`** — Simplified init for development/testing
- **`supabase/seed.sql`** — Test data seeding
- **`supabase/add-guest-session.sql`** — Migration to support guest_session_id
- **`supabase/disable-rls.sql`** — Utility to disable RLS (dev/debug only)

---

## 🎯 File Naming Conventions

### React Components

- **PascalCase**: `TripCard.tsx`, `ShareTripModal.tsx`, `AppHeader.tsx`
- **Functional components**: Always exported as default or named export
- **Props interface**: Optional but recommended (e.g., `interface TripCardProps { ... }`)

### Utilities & Helpers

- **camelCase**: `formatDate.ts`, `validateTrip.ts`, `session.ts`
- **Named exports**: For reusable functions and utilities

### Server Actions

- **camelCase with verb prefix**: `createTrip`, `updateInvite`, `acceptInvite`
- **File**: `actions.ts` in corresponding route folder
- **Usage**: Import via `'use server'` directive

### Tests

- **Suffix with `.spec.ts` or `.test.ts`**:
  - Unit: `components/TripCard.spec.tsx`
  - Integration: `integration/NewTripFlow.spec.tsx`
  - E2E: `e2e/trip-creation.e2e.ts`

---

## 🔗 Import Aliasses

Configured path aliases in `tsconfig.json` for cleaner imports:

```typescript
// ✅ Good (using aliases)
import { TripDetailClient } from '@/app/trips/[id]/TripDetailClient';
import { formatDate } from '@/lib/utils/date';
import { createClient } from '@/lib/supabase/client';
import { ToastContext } from '@/contexts/ToastContext';
import type { Database } from '@/types/database.types';

// ❌ Bad (relative paths)
import { TripDetailClient } from '../../../TripDetailClient';
import formatDate from '../../../lib/utils/date';
```

**Alias Mapping:**

| Alias            | Maps To            |
| ---------------- | ------------------ |
| `@/*`            | `src/*`            |
| `@/app/*`        | `src/app/*`        |
| `@/components/*` | `src/components/*` |
| `@/lib/*`        | `src/lib/*`        |
| `@/types/*`      | `src/types/*`      |
| `@/config/*`     | `src/config/*`     |
| `@/contexts/*`   | `src/contexts/*`   |
| `@/styles/*`     | `src/styles/*`     |

---

## 📦 Component Structure

### UI Components (`src/components/ui/`)

Reusable, headless UI components:

```
src/components/ui/
└── Toast.tsx          # Toast notification UI (uses ToastContext)
```

### Feature Components (`src/components/`)

Trip-related and navigation components:

```
src/components/
├── AppHeader.tsx      # Top navigation
├── BottomNav.tsx      # Bottom navigation (mobile)
├── ItineraryTab.tsx   # Itinerary tab switcher
├── ParticipantList.tsx # Display participants
└── ShareTripModal.tsx # Invite modal
```

---

## 🔐 Authentication & Session Management

### Guest Sessions

- Stored in `guest_session_id` cookie (HTTP-only, 30-day expiry)
- Generated via `src/lib/session.ts`:
  - `getOrCreateGuestSession()` — Get or create UUID
  - `getGuestSessionId()` — Read session ID
- Allows unauthenticated users to:
  - Create trips
  - Invite others via links
  - Accept invite links

### Authentication

- **Supabase Auth** (email/password)
- **Middleware**: Manages auth state between requests
- **Client**: `src/lib/supabase/client.ts` (browser-side Supabase)
- **Server**: `src/lib/supabase/server.ts` (server-side Supabase)

### RLS Policies

Database enforces access control via Postgres RLS:

- **trips**: SELECT/INSERT/UPDATE/DELETE policies based on user role (owner, editor, participant)
- **trip_participants**: Participants can view/manage members
- **invite_links**: Public SELECT by token, INSERT/UPDATE by owner
- **RLS Helper Functions**: SECURITY DEFINER functions prevent recursive policy evaluation

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

- **Path**: `tests/trips/unit/`
- **Naming**: `*.spec.tsx` or `*.test.tsx`
- **Scope**: Test individual components, functions, utilities
- **Run**: `npm run test`
- **Watch**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`

**Jest Config** (`jest.config.js`):

- Test environment: `jest-environment-jsdom`
- Setup file: `jest.setup.js`
- Test patterns: `**/__tests__/**/*.[jt]s?(x)` and `**/?(*.)+(spec|test).[jt]s?(x)`
- Ignore patterns: `.next/`, `node_modules/`, `tests/**/e2e/` (Playwright tests)

### Integration Tests (Jest)

- **Path**: `tests/trips/integration/`
- **Scope**: Test component interactions with server actions, API routes
- **Examples**: `NewTripFlow.spec.tsx`, `updateTripAction.test.ts`

### E2E Tests (Playwright)

- **Path**: `tests/trips/e2e/`
- **Naming**: `*.e2e.ts`
- **Scope**: User flows across full application (browser automation)
- **Run**: `npx playwright test`
- **Run UI**: `npx playwright test --ui`
- **Report**: `npx playwright show-report`

**Playwright Config** (`playwright.config.ts`):

- Test directory: `./tests` (discovers `tests/**/e2e/` files)
- Base URL: `http://localhost:3000`
- Browsers: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Screenshots/videos: On failure

### Example E2E Tests

- **`newTripToast.e2e.ts`** — User creates trip and sees success toast
- **`newTripValidation.e2e.ts`** — Form validation on trip creation
- **`trip-update-flow.e2e.ts`** — User edits trip details
- **`trips-edit.e2e.ts`** — Edit page functionality
- **`tripApi.e2e.ts`** — API interaction scenarios

---

## � Data Flow Architecture

```
┌─────────────────────────┐
│    User Action          │  (Click button, submit form)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   React Component       │  (Client or Server Component)
│   (e.g., TripCard)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Server Action         │  ("use server" action)
│   (e.g., createTrip)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Supabase Client       │  (Server or Browser)
│   (src/lib/supabase/)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Database (Postgres)   │  (RLS policies enforce auth)
│   (supabase/schema.sql) │
└─────────────────────────┘
```

### Request/Response Cycle

1. **Frontend**: User interacts with React component
2. **Server Action**: Component calls `'use server'` function (e.g., `createTrip()`)
3. **Auth Check**: Server verifies user session (via Supabase)
4. **Database**: Supabase client executes query with RLS policies
5. **Response**: Server returns data or error
6. **Revalidation**: Next.js revalidates affected pages/data
7. **UI Update**: React re-renders with new state

---

## 🚀 Build & Deployment

### Development

```bash
npm run dev          # Start dev server on :3000
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run Jest unit tests
npm run test:watch   # Jest in watch mode
npx playwright test  # Run Playwright e2E tests
```

### Production Build

```bash
npm run build        # Build Next.js app (.next/)
npm run start        # Start production server
npm run analyze      # Bundle size analysis
```

### Deployment Artifacts

- **`.next/`** — Compiled Next.js application (gitignored)
- **`.next/standalone/`** — Standalone build for VM deployment (uses only Node, no build dependencies)
- **`out/`** — Static export (optional, requires `output: 'export'` in next.config.js)

---

## 🌍 Environment Variables

**File**: `.env.local` (development) or VM environment (production)

**Key Variables**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: External APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
GETYOURGUIDE_API_KEY=your-getyourguide-key
```

**Note**: Never commit `.env.local`, `.env.production.local`, or files with real secrets.

---

## 📝 Code Style & Standards

### TypeScript

- **Strict mode**: `"strict": true` in `tsconfig.json`
- **Path aliases**: Use `@/` aliases for imports
- **Type safety**: Avoid `any`; use `unknown` or proper types

### React

- **Functional components**: Always use function declarations
- **Server vs Client**: Mark client components with `'use client'`; server functions with `'use server'`
- **Props typing**: Use `interface PropsName { ... }` for component props
- **Hooks**: Keep hooks at top level (no conditional hooks)

### Styling

- **Tailwind CSS**: Primary styling framework
- **Utility classes**: Prefer Tailwind utilities over custom CSS
- **tailwind-merge**: Use `cn()` utility to merge conflicting Tailwind classes
- **BEM or similar**: For complex custom CSS, use scoped CSS modules if needed

### Formatting

- **Prettier**: Automatic code formatting (runs via `npm run format`)
- **ESLint**: Catch errors and enforce rules
- **Imports**: Organize alphabetically; use aliases

---

## 🔍 Common Locations Reference

| What             | Where                                          |
| ---------------- | ---------------------------------------------- |
| New page route   | `src/app/[route]/page.tsx`                     |
| Server actions   | `src/app/[route]/actions.ts`                   |
| Client component | `src/components/ComponentName.tsx`             |
| UI component     | `src/components/ui/ComponentName.tsx`          |
| Utility function | `src/lib/utils/utilityName.ts`                 |
| Context provider | `src/contexts/ContextName.tsx`                 |
| Type definition  | `src/types/name.ts` or `database.types.ts`     |
| Unit test        | `tests/trips/unit/ComponentName.spec.tsx`      |
| Integration test | `tests/trips/integration/FeatureName.spec.tsx` |
| E2E test         | `tests/trips/e2e/user-flow.e2e.ts`             |
| DB schema        | `supabase/schema.sql`                          |
| DB migration     | `supabase/*.sql`                               |
| Configuration    | `src/config/constants.ts`                      |

---

## 🔗 Documentation Files

| File                    | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `README.md`             | Project overview, tech stack, getting started |
| `QUICK_START.md`        | Fast setup guide for new developers           |
| `SETUP_COMPLETE.md`     | Setup checklist & verification steps          |
| `DATABASE_MIGRATION.md` | Database migration procedures                 |
| `GOOGLE_MAPS_SETUP.md`  | Google Maps API configuration                 |
| `docs/API.md`           | API routes & endpoints documentation          |
| `docs/DEPLOYMENT.md`    | Deployment procedures & CI/CD                 |
| `docs/ADR/`             | Architecture Decision Records                 |
| `TEST_STATUS.md`        | Test coverage & test suite status             |
| `CONTRIBUTING.md`       | Contribution guidelines                       |
| `CHANGELOG.md`          | Version history & release notes               |

---

## 🎓 Getting Started (Quick Reference)

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.local.example` → `.env.local` and fill in Supabase credentials
3. **Run dev server**: `npm run dev` (opens http://localhost:3000)
4. **Run tests**: `npm run test` (unit), `npx playwright test` (e2e)
5. **Make changes**: Edit files in `src/` and save (hot reload)
6. **Build**: `npm run build` (production-ready build)

For detailed setup, see `QUICK_START.md` and `DATABASE_MIGRATION.md`.

---

**Laatst bijgewerkt**: 12 November 2025
**Maintainers**: Yassine Messaoudi, Sedäle Hoogvliets
**Repository**: https://github.com/sedie02/voyage (Branch: Trips)

---

## 🎓 Getting Started (Quick Reference)

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.local.example` → `.env.local` and fill in Supabase credentials
3. **Run dev server**: `npm run dev` (opens http://localhost:3000)
4. **Run tests**: `npm run test` (unit), `npx playwright test` (e2e)
5. **Make changes**: Edit files in `src/` and save (hot reload)
6. **Build**: `npm run build` (production-ready build)

For detailed setup, see `QUICK_START.md` and `DATABASE_MIGRATION.md`.

---

**Laatst bijgewerkt**: 12 November 2025
**Maintainers**: Yassine Messaoudi, Sedäle Hoogvliets
**Repository**: https://github.com/sedie02/voyage (Branch: Trips)
