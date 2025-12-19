# 📁 Voyage Project Structuur

Dit document legt uit hoe de codebase is georganiseerd en waar je wat kunt vinden. Handig als je nieuw bent in het project of als je iets specifieks zoekt.

## Overzicht

Voyage is een Next.js 14 applicatie met de App Router. De structuur volgt grotendeels de Next.js conventies, maar we hebben ook wat eigen folders toegevoegd voor onze specifieke behoeften.

```
voyage/
├── src/                    # Alle source code
├── supabase/              # Database schema's en migrations
├── tests/                 # Test files
├── docs/                  # Documentatie
├── public/                # Static assets
└── scripts/              # Utility scripts
```

## src/ - De hoofdfolder

Dit is waar alle applicatie code staat.

### src/app/ - Next.js Pages

De `app/` folder volgt Next.js 13+ App Router structuur. Elke subfolder is een route in de applicatie.

```
src/app/
├── layout.tsx            # Root layout (wrapt alle pages)
├── page.tsx              # Homepage (/)
├── login/                # /login
│   └── page.tsx
├── register/             # /register
│   └── page.tsx
├── trips/                # /trips routes
│   ├── page.tsx          # /trips (overzicht)
│   ├── new/              # /trips/new
│   │   └── page.tsx
│   ├── [id]/             # /trips/:id (dynamic route)
│   │   ├── page.tsx      # Trip detail pagina
│   │   ├── TripDetailClient.tsx  # Client component voor trip detail
│   │   ├── edit/         # /trips/:id/edit
│   │   ├── invite/       # Invite functionaliteit
│   │   ├── itinerary/    # Itinerary actions
│   │   ├── participants/  # Participant management
│   │   └── actions.ts    # Server actions voor deze trip
│   └── actions.ts        # Server actions voor trips (create, delete, etc.)
├── packing/              # /packing (globale packing list)
│   ├── page.tsx
│   └── actions.ts
├── invite/               # /invite/:token (accept invite)
│   └── [token]/
└── api/                  # API routes (REST endpoints)
    └── health/
        └── route.ts      # GET /api/health
```

**Belangrijk:**

- `page.tsx` = de pagina component (Server Component standaard)
- `actions.ts` = Server Actions voor data mutations
- Client Components hebben vaak `Client.tsx` in de naam (zoals `TripDetailClient.tsx`)

### src/components/ - Herbruikbare Components

Dit zijn React components die op meerdere plekken gebruikt worden.

```
src/components/
├── ui/                   # Basis UI components
│   └── Toast.tsx         # Toast notification component
├── AppHeader.tsx         # Header met navigatie
├── BottomNav.tsx         # Mobiele bottom navigatie
├── ItineraryTab.tsx     # Itinerary weergave
├── ParticipantList.tsx   # Lijst van deelnemers
└── ShareTripModal.tsx   # Modal voor trip delen
```

**Design principe:**

- Components zijn herbruikbaar en onafhankelijk
- UI components in `ui/` zijn de meest basis components
- Feature-specifieke components staan direct in `components/`

### src/lib/ - Helper Functies en Utilities

Hier staan alle helper functies, API clients, en utility functies.

```
src/lib/
├── supabase/            # Supabase client setup
│   ├── client.ts        # Client-side Supabase client
│   └── server.ts        # Server-side Supabase client
├── external/            # External API integraties
│   ├── places.ts        # Google Places API wrapper
│   └── getyourguide.ts  # GetYourGuide scraper (experimenteel)
├── utils/               # Utility functies
│   ├── cn.ts            # className merge utility (Tailwind)
│   ├── date.ts          # Date formatting helpers
│   └── validation.ts    # Zod schemas voor validatie
└── session.ts           # Guest session management
```

**Waarom hier:**

- `lib/` is een Next.js conventie voor utility code
- `supabase/` heeft aparte clients voor client/server omdat ze anders werken
- `external/` bevat alle code die met externe APIs praat

### src/types/ - TypeScript Types

Type definities voor TypeScript.

```
src/types/
├── database.types.ts     # Auto-generated van Supabase
├── cheerio.d.ts         # Type definitions voor cheerio
└── uuid.d.ts            # Type definitions voor uuid
```

**Note:** `database.types.ts` wordt gegenereerd met `npm run db:generate`. Niet handmatig editen!

### src/contexts/ - React Contexts

Global state management met React Context.

```
src/contexts/
└── ToastContext.tsx     # Toast notification context
```

We gebruiken Context API voor simpele global state. Voor complexere state zouden we Redux of Zustand kunnen overwegen, maar voor nu is Context genoeg.

### src/config/ - Configuratie

App-wide configuratie constanten.

```
src/config/
└── constants.ts          # App constants (bijv. trip types, day parts)
```

### src/styles/ - Global Styles

```
src/styles/
└── globals.css          # Global CSS + Tailwind imports
```

## supabase/ - Database

Alle database gerelateerde files.

```
supabase/
├── schema.sql           # Volledige database schema (productie)
├── init.sql             # Initial setup script
├── seed.sql             # Test data (optioneel)
└── *.sql                # Migrations en patches
```

**Workflow:**

- `schema.sql` = de complete, up-to-date schema
- Nieuwe migrations komen in aparte `.sql` files
- Run migrations via Supabase SQL Editor

## tests/ - Test Files

Test organisatie volgt de source structuur.

```
tests/
├── iso25010/            # ISO 25010 kwaliteitstests
│   ├── functional.e2e.ts
│   ├── performance.e2e.ts
│   ├── compatibility.e2e.ts
│   └── ...
└── trips/               # Tests voor trip features
    ├── unit/            # Unit tests (Jest)
    ├── integration/     # Integration tests (Jest)
    └── e2e/             # E2E tests (Playwright)
```

**Test types:**

- **Unit**: Losse functies/components testen
- **Integration**: Features met server actions testen
- **E2E**: Complete user flows testen

## docs/ - Documentatie

```
docs/
├── API.md               # API endpoints documentatie
├── DEPLOYMENT.md        # Deployment instructies
└── ADR/                 # Architecture Decision Records
    └── 001-tech-stack-keuze.md
```

## public/ - Static Assets

Files die direct geserveerd worden.

```
public/
├── manifest.json        # PWA manifest
├── sw.js               # Service Worker (auto-generated)
└── workbox-*.js        # Service Worker dependencies
```

## Root Files

Belangrijke configuratie files in de root:

- `package.json` - Dependencies en scripts
- `tsconfig.json` - TypeScript configuratie
- `next.config.js` - Next.js configuratie
- `tailwind.config.ts` - Tailwind CSS configuratie
- `jest.config.js` - Jest test configuratie
- `playwright.config.ts` - Playwright configuratie
- `.eslintrc.json` - ESLint regels
- `.depcheckrc.json` - Depcheck configuratie

## Waar vind ik...?

**Een nieuwe feature toevoegen?**

- Pages: `src/app/[feature]/page.tsx`
- Components: `src/components/[FeatureName].tsx`
- Server Actions: `src/app/[feature]/actions.ts`
- Types: `src/types/` of inline in component

**Database queries?**

- Server Actions gebruiken Supabase client uit `src/lib/supabase/server.ts`
- Client-side queries gebruiken `src/lib/supabase/client.ts`

**Styling?**

- Tailwind utility classes in components
- Global styles in `src/styles/globals.css`
- Custom CSS alleen als Tailwind niet genoeg is

**Tests schrijven?**

- Unit tests: `tests/[feature]/unit/`
- Integration: `tests/[feature]/integration/`
- E2E: `tests/[feature]/e2e/` of `tests/iso25010/`

**Configuratie aanpassen?**

- Next.js: `next.config.js`
- TypeScript: `tsconfig.json`
- Tailwind: `tailwind.config.ts`
- ESLint: `.eslintrc.json`

## Conventies

**Naming:**

- Components: PascalCase (`TripCard.tsx`)
- Files: kebab-case voor pages, PascalCase voor components
- Functions: camelCase
- Types/Interfaces: PascalCase

**Imports:**

- Absolute imports met `@/` alias (configureerd in `tsconfig.json`)
- Bijvoorbeeld: `import { cn } from '@/lib/utils/cn'`

**File organisatie:**

- Eén component per file
- Related code bij elkaar (actions bij de page die ze gebruikt)
- Shared utilities in `lib/`

---

**Laatste update:** December 2025
**Auteurs:** Yassine & Sedäle

