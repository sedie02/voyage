# 📁 Voyage - Project Structuur

Complete overzicht van de project structuur en organisatie.

## 🗂️ Root Directory

```
voyage/
├── docs/                     # 📚 Project documentatie
│   ├── ADR/                 # Architecture Decision Records
│   │   └── 001-tech-stack-keuze.md
│   ├── API.md               # API documentatie
│   ├── DEPLOYMENT.md        # Deployment handleiding
│   ├── PROJECT_DEFINITION.pdf
│   └── ONTWERPDOCUMENT.pdf
│
├── public/                   # 🌐 Static assets (direct accessible)
│   ├── icons/               # PWA icons (72x72 tot 512x512)
│   ├── screenshots/         # App screenshots voor PWA
│   ├── manifest.json        # PWA manifest
│   ├── favicon.ico
│   └── robots.txt
│
├── src/                      # 💻 Source code
│   ├── app/                 # 📱 Next.js App Router
│   │   ├── (auth)/          # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (dashboard)/     # Protected routes group
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx           # /trips - Overview
│   │   │   │   ├── new/page.tsx       # /trips/new - Create
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # /trips/[id] - Detail
│   │   │   │       ├── edit/page.tsx  # Edit
│   │   │   │       ├── itinerary/     # Dagplanning
│   │   │   │       ├── polls/         # Polls
│   │   │   │       ├── packing/       # Packing list
│   │   │   │       └── budget/        # Budget
│   │   │   │
│   │   │   └── layout.tsx   # Dashboard layout
│   │   │
│   │   ├── api/             # 🔌 API Routes
│   │   │   ├── trips/
│   │   │   │   ├── route.ts           # GET /api/trips, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts       # GET/PATCH/DELETE
│   │   │   │       ├── activities/route.ts
│   │   │   │       ├── polls/route.ts
│   │   │   │       ├── packing/route.ts
│   │   │   │       └── expenses/route.ts
│   │   │   │
│   │   │   ├── external/
│   │   │   │   ├── weather/route.ts   # Weather API proxy
│   │   │   │   └── places/route.ts    # Google Places proxy
│   │   │   │
│   │   │   └── invite/
│   │   │       └── [token]/route.ts
│   │   │
│   │   ├── invite/          # Invite accept page
│   │   │   └── [token]/page.tsx
│   │   │
│   │   ├── layout.tsx       # Root layout (PWA config)
│   │   ├── page.tsx         # Home page
│   │   ├── loading.tsx      # Global loading
│   │   └── error.tsx        # Global error
│   │
│   ├── components/          # 🧩 React Components
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ...
│   │   │
│   │   ├── features/       # Feature-specific components
│   │   │   ├── trips/
│   │   │   │   ├── TripCard.tsx
│   │   │   │   ├── TripWizard.tsx
│   │   │   │   └── TripList.tsx
│   │   │   │
│   │   │   ├── itinerary/
│   │   │   │   ├── DayPlanner.tsx
│   │   │   │   ├── ActivityCard.tsx
│   │   │   │   └── WeatherBadge.tsx
│   │   │   │
│   │   │   ├── polls/
│   │   │   │   ├── PollCard.tsx
│   │   │   │   ├── CreatePoll.tsx
│   │   │   │   └── VoteButton.tsx
│   │   │   │
│   │   │   ├── packing/
│   │   │   │   ├── PackingList.tsx
│   │   │   │   └── PackingItem.tsx
│   │   │   │
│   │   │   └── budget/
│   │   │       ├── ExpenseList.tsx
│   │   │       └── BudgetSummary.tsx
│   │   │
│   │   └── layouts/        # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                # 📚 Utilities & Helpers
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Auth middleware
│   │   │
│   │   ├── api/
│   │   │   ├── trips.ts         # Trip API calls
│   │   │   ├── activities.ts
│   │   │   ├── polls.ts
│   │   │   ├── weather.ts       # External: Weather
│   │   │   └── places.ts        # External: Google Places
│   │   │
│   │   └── utils/
│   │       ├── cn.ts            # Classname merger
│   │       ├── date.ts          # Date utilities
│   │       ├── validation.ts    # Zod schemas
│   │       ├── formatting.ts    # String formatting
│   │       └── errors.ts        # Error handling
│   │
│   ├── hooks/              # 🎣 Custom React Hooks
│   │   ├── useTrip.ts
│   │   ├── useActivities.ts
│   │   ├── usePolls.ts
│   │   ├── useAuth.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/              # 📝 TypeScript Types
│   │   ├── database.types.ts    # Supabase generated
│   │   ├── api.types.ts
│   │   ├── trip.types.ts
│   │   └── index.ts
│   │
│   ├── styles/             # 🎨 Global Styles
│   │   └── globals.css
│   │
│   └── config/             # ⚙️ Configuration
│       ├── constants.ts         # App constants
│       └── env.ts              # Environment validation
│
├── supabase/               # 🗄️ Database
│   ├── migrations/         # SQL migrations
│   ├── schema.sql          # Complete schema
│   └── seed.sql            # Seed data
│
├── tests/                  # 🧪 Tests
│   ├── unit/
│   │   ├── lib/
│   │   └── components/
│   │
│   └── e2e/
│       ├── trips.spec.ts
│       ├── polls.spec.ts
│       └── packing.spec.ts
│
├── .github/                # 🔧 GitHub Workflows (optioneel)
│   └── workflows/
│       └── ci.yml
│
├── .vscode/                # VS Code settings
│   ├── settings.json
│   └── extensions.json
│
├── .env.example            # Environment template
├── .env.local              # Local env (git ignored!)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .prettierignore
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── jest.config.js
├── jest.setup.js
├── playwright.config.ts
├── package.json
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── PROJECT_STRUCTURE.md    # Dit bestand
```

## 📋 File Naming Conventions

### React Components

- **PascalCase**: `TripCard.tsx`, `WeatherBadge.tsx`
- **Functional components**: Altijd function exports
- **Props interface**: `ComponentNameProps`

### Utilities & Helpers

- **camelCase**: `formatDate.ts`, `validateTrip.ts`
- **Named exports**: Voor herbruikbare functions

### API Routes

- **Lowercase**: `route.ts`, `middleware.ts`
- **Dynamic segments**: `[id]/route.ts`, `[token]/accept.ts`

### Tests

- **Same name + `.spec.ts` of `.test.ts`**:
  - `TripCard.spec.tsx`
  - `formatDate.test.ts`

## 🎯 Import Aliassen

Gebruik path aliassen voor cleaner imports:

```typescript
// ✅ Good
import { TripCard } from '@/components/features/trips/TripCard';
import { formatDate } from '@/lib/utils/date';
import { createClient } from '@/lib/supabase/client';

// ❌ Bad
import { TripCard } from '../../../components/features/trips/TripCard';
```

**Geconfigureerde aliassen:**

- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`
- `@/hooks/*` → `src/hooks/*`
- `@/types/*` → `src/types/*`
- `@/utils/*` → `src/lib/utils/*`

## 📦 Component Organisatie

### Feature-based Structure

Groepeer gerelateerde components per feature:

```
src/components/features/trips/
├── TripCard.tsx
├── TripWizard.tsx
├── TripList.tsx
├── TripFilters.tsx
└── __tests__/
    └── TripCard.spec.tsx
```

### Shared UI Components

Herbruikbare UI components in `src/components/ui/`:

```
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
└── Card.tsx
```

## 🗃️ Data Flow

```
User Interaction
    ↓
React Component
    ↓
Custom Hook (useTrip, usePolls, etc.)
    ↓
API Client (lib/api/*.ts)
    ↓
Next.js API Route (app/api/*/route.ts)
    ↓
Supabase Client
    ↓
Database
```

## 🔐 Environment Variables

**Development**: `.env.local`
**Production**: Skylabs VM environment variables

**Nooit committen**:

- `.env.local`
- `.env.production`
- Any file with real secrets

## 📝 Documentation Locaties

- **ADR's**: `docs/ADR/` - Architecture decisions
- **API Docs**: `docs/API.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Component docs**: JSDoc comments in code
- **README**: Root level - Getting started

## 🚀 Deployment Artifacts

**Build output**: `.next/` (gitignored)
**Static export**: `out/` (voor static hosting, optioneel)
**Standalone**: `.next/standalone/` (voor VM deployment)

---

**Laatst bijgewerkt**: 30 September 2025
**Maintainers**: Yassine Messaoudi, Sedäle Hoogvliets
