# Voyage - Architectuur, Runtime & Hosting Documentatie

Dit document beschrijft volledig hoe Voyage technisch in elkaar zit: van code structuur tot runtime execution, van deployment tot externe integraties. Essentieel voor developers die de applicatie moeten begrijpen, onderhouden of uitbreiden.

## Inhoudsopgave

1. [Applicatie Architectuur Overzicht](#applicatie-architectuur-overzicht)
2. [Code Structuur & Organisatie](#code-structuur--organisatie)
3. [Runtime Execution Model](#runtime-execution-model)
4. [Data Flow & State Management](#data-flow--state-management)
5. [Hosting & Deployment](#hosting--deployment)
6. [Externe Integraties](#externe-integraties)
7. [Security & Beveiliging](#security--beveiliging)
8. [Performance & Optimalisatie](#performance--optimalisatie)

---

## Applicatie Architectuur Overzicht

### High-Level Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                        Gebruiker                              │
│                   (Browser / Mobile)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│                  Port 80/443 → 3000                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP (localhost)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Next.js Application Server                     │
│              (PM2 Cluster Mode, Port 3000)                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js App Router                                  │  │
│  │  - Server Components (default)                        │  │
│  │  - Client Components ('use client')                  │  │
│  │  - Server Actions ('use server')                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────┬───────────────────────┬─────────────────────────────┘
        │                       │
        │                       │
┌───────▼────────┐    ┌─────────▼──────────┐
│   Supabase     │    │  Google Places    │
│   (Database +  │    │  API              │
│    Auth)       │    │                   │
└────────────────┘    └───────────────────┘
```

### Technologie Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Hook Form + Zod

**Backend:**
- Next.js Server Actions (geen aparte API server)
- Supabase (PostgreSQL database + Auth)
- Server Components voor data fetching

**Hosting:**
- Skylabs VM (Ubuntu)
- PM2 (process manager)
- Nginx (reverse proxy)
- Node.js 20

**Externe Services:**
- Supabase (cloud database)
- Google Places API
- GetYourGuide (web scraping)

---

## Code Structuur & Organisatie

### Folder Structuur

```
voyage/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (Server Component)
│   │   ├── page.tsx           # Homepage (/)
│   │   ├── trips/             # /trips routes
│   │   │   ├── page.tsx       # Trip overzicht (Server Component)
│   │   │   ├── new/           # /trips/new
│   │   │   │   └── page.tsx   # Trip creation (Client Component)
│   │   │   └── [id]/          # Dynamic route /trips/:id
│   │   │       ├── page.tsx   # Trip detail (Server Component)
│   │   │       ├── TripDetailClient.tsx  # Client interactie
│   │   │       └── actions.ts # Server Actions voor deze route
│   │   ├── api/               # REST API routes (optioneel)
│   │   │   └── health/
│   │   │       └── route.ts   # GET /api/health
│   │   └── ...
│   │
│   ├── components/            # Herbruikbare React components
│   │   ├── ui/               # Basis UI components
│   │   ├── AppHeader.tsx
│   │   └── ...
│   │
│   ├── lib/                  # Utility functies en helpers
│   │   ├── supabase/         # Database clients
│   │   │   ├── client.ts     # Client-side Supabase
│   │   │   └── server.ts     # Server-side Supabase
│   │   ├── external/         # Externe API integraties
│   │   │   ├── places.ts     # Google Places API
│   │   │   └── getyourguide.ts  # Web scraping
│   │   └── utils/            # Helper functies
│   │
│   ├── types/                # TypeScript type definities
│   ├── contexts/             # React Context providers
│   ├── config/              # Configuratie constanten
│   └── styles/              # Global CSS
│
├── supabase/                 # Database schema's
│   ├── schema.sql           # Volledige schema
│   └── *.sql                # Migrations
│
├── tests/                   # Test files
│   ├── iso25010/           # ISO 25010 kwaliteitstests
│   └── trips/              # Feature tests
│
├── public/                  # Static assets
│   └── manifest.json       # PWA manifest
│
├── .github/                 # GitHub workflows
│   └── workflows/
│       ├── qualityChecks.yml  # CI pipeline
│       └── release.yml       # Release workflow
│
└── docs/                    # Documentatie
```

### Next.js App Router Structuur

**Belangrijkste concepten:**

1. **Server Components (default):**
   - Draaien op server, geen JavaScript naar client
   - Kunnen direct database queries doen
   - Geen interactiviteit (geen onClick, useState, etc.)

2. **Client Components (`'use client'`):**
   - Draaien in browser, JavaScript naar client
   - Voor interactiviteit (forms, buttons, state)
   - Kunnen Server Actions aanroepen

3. **Server Actions (`'use server'`):**
   - Async functies die op server draaien
   - Aanroepbaar vanuit Client Components
   - Type-safe data mutations

**Voorbeeld flow:**

```typescript
// src/app/trips/page.tsx (Server Component)
export default async function TripsPage() {
  const supabase = await createClient(); // Server-side
  const { data: trips } = await supabase.from('trips').select('*');
  
  return <TripsList trips={trips} />; // Server Component
}

// src/app/trips/new/page.tsx (Client Component)
'use client';
export default function NewTripPage() {
  const [formData, setFormData] = useState({});
  
  async function handleSubmit() {
    await createTrip(formData); // Server Action
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// src/app/trips/actions.ts (Server Action)
'use server';
export async function createTrip(formData: FormData) {
  const supabase = await createClient(); // Server-side
  // ... database insert
}
```

---

## Runtime Execution Model

### Request Flow (voorbeeld: Trip aanmaken)

```
1. Gebruiker navigeert naar /trips/new
   ↓
2. Browser doet GET request naar server
   ↓
3. Next.js Server Component (page.tsx) rendert
   - Haalt data op (als nodig)
   - Genereert HTML
   ↓
4. HTML + JavaScript naar browser
   ↓
5. React hydrateert (Client Component wordt interactief)
   ↓
6. Gebruiker vult form in en klikt "Opslaan"
   ↓
7. Client Component roept Server Action aan
   - createTrip(formData)
   ↓
8. Server Action draait op server
   - Valideert data (Zod)
   - Roept Supabase aan (database insert)
   - Roept Google Places API aan (city photo)
   ↓
9. Server Action retourneert resultaat
   ↓
10. Client Component krijgt response
    - Toont success/error message
    - Navigeert naar nieuwe trip
```

### Server vs Client Execution

**Server Components:**
- **Waar draaien:** Node.js server (Skylabs VM)
- **Wanneer:** Bij elke page request
- **Toegang tot:** Database, file system, environment variables
- **Geen toegang tot:** Browser APIs (localStorage, window, etc.)
- **Output:** HTML string die naar browser wordt gestuurd

**Client Components:**
- **Waar draaien:** Browser (JavaScript engine)
- **Wanneer:** Na initial render, bij interactie
- **Toegang tot:** Browser APIs, DOM, localStorage
- **Geen toegang tot:** Database, file system, server env vars
- **Output:** DOM manipulatie, state updates

**Server Actions:**
- **Waar draaien:** Node.js server
- **Wanneer:** Bij aanroep vanuit Client Component
- **Toegang tot:** Alles wat Server Components kunnen
- **Output:** JSON response naar client

### Build Process

```
npm run build
  ↓
1. TypeScript compileert naar JavaScript
  ↓
2. Next.js bundelt code:
   - Server bundle (.next/server/)
   - Client bundle (.next/static/)
   - HTML templates
  ↓
3. Optimalisaties:
   - Code splitting
   - Tree shaking
   - Minification
   - Image optimization
  ↓
4. Output: .next/ folder (production build)
```

### Runtime Start

```
npm start (of PM2)
  ↓
1. Next.js start server op poort 3000
  ↓
2. Server Components worden "lazy loaded" bij eerste request
  ↓
3. Client Components worden geladen wanneer nodig
  ↓
4. Server Actions zijn beschikbaar via RPC (Remote Procedure Call)
```

---

## Data Flow & State Management

### Data Fetching Patterns

**Server Components (data fetching):**
```typescript
// src/app/trips/page.tsx
export default async function TripsPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });
  
  return <TripsList trips={trips} />;
}
```

**Client Components (interactie):**
```typescript
// src/app/trips/new/page.tsx
'use client';
export default function NewTripPage() {
  const [formData, setFormData] = useState({});
  const router = useRouter();
  
  async function handleSubmit() {
    const result = await createTrip(formData);
    if (result.success) {
      router.push(`/trips/${result.tripId}`);
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Server Actions (mutations):**
```typescript
// src/app/trips/actions.ts
'use server';
export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  
  // Validatie
  const validated = tripSchema.parse(formData);
  
  // Database insert
  const { data, error } = await supabase
    .from('trips')
    .insert(validated)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // Revalidate cache
  revalidatePath('/trips');
  
  return { success: true, tripId: data.id };
}
```

### State Management

**Lokaal State:**
- `useState` voor component state
- `useForm` (React Hook Form) voor form state

**Global State:**
- React Context API voor toast notifications
- Geen Redux/Zustand nodig (voor nu)

**Server State:**
- Next.js cache voor Server Components
- `revalidatePath()` om cache te invalidaten
- Supabase real-time subscriptions (optioneel, niet in MVP)

### Database Queries

**Server-side (Server Components & Actions):**
```typescript
const supabase = await createClient(); // Server client
const { data } = await supabase.from('trips').select('*');
```

**Client-side (Client Components):**
```typescript
const supabase = createClient(); // Client client
const { data } = await supabase.from('trips').select('*');
```

**Belangrijk verschil:**
- Server client: Heeft toegang tot cookies, kan RLS policies gebruiken
- Client client: Gebruikt anon key, RLS bepaalt toegang

---

## Hosting & Deployment

### Deployment Architectuur

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS (Port 443)
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Nginx (Reverse Proxy)                     │
│              Skylabs VM                                │
│  - SSL/TLS termination (Let's Encrypt)                │
│  - Static file serving                                  │
│  - Proxy pass naar Next.js (localhost:3000)            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP (localhost:3000)
                        │
┌───────────────────────▼─────────────────────────────────┐
│              PM2 Process Manager                        │
│              Skylabs VM                                │
│  - Cluster mode (2 instances)                         │
│  - Auto-restart bij crashes                            │
│  - Logging naar /var/log/voyage/                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Process spawn
                        │
┌───────────────────────▼─────────────────────────────────┐
│         Next.js Application (Port 3000)                │
│         Skylabs VM                                     │
│  - Node.js 20 runtime                                 │
│  - Next.js standalone build                           │
│  - Server Components + Server Actions                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS API calls
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Supabase (Cloud)                           │
│              - PostgreSQL database                      │
│              - Authentication                          │
│              - Row Level Security                       │
└─────────────────────────────────────────────────────────┘
```

### Deployment Flow

**CI/CD Pipeline (GitHub Actions):**

```
1. Developer pusht code naar GitHub
   ↓
2. GitHub Actions trigger
   ↓
3. CI Pipeline draait:
   - Checkout code
   - Install dependencies (npm ci)
   - Run linting (ESLint)
   - Run type checking (TypeScript)
   - Run tests (Jest + Playwright)
   - Build application (npm run build)
   ↓
4. Als alles passed → code staat in repo
   ↓
5. Manual deployment (of automatisch bij tag):
   - SSH naar Skylabs VM
   - git pull origin main
   - npm ci --production
   - npm run build
   - pm2 reload voyage
```

**Build Output:**

```
.next/
├── standalone/          # Standalone build (voor Skylabs)
│   ├── server.js       # Next.js server
│   ├── node_modules/   # Production dependencies
│   └── ...
├── static/             # Static assets
│   └── chunks/         # JavaScript bundles
└── server/             # Server-side code
    └── app/            # Compiled Server Components
```

**PM2 Configuratie:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'voyage',
    script: 'npm',
    args: 'start',
    instances: 2,        // Cluster mode
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**Nginx Configuratie:**

```nginx
server {
    listen 80;
    server_name jouw-domain.nl;
    
    # Redirect HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name jouw-domain.nl;
    
    ssl_certificate /etc/letsencrypt/live/jouw-domain.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jouw-domain.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Environment Variables

**Development (.env.local):**
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

**Production (Skylabs VM):**
- Zelfde variabelen, maar andere waardes
- Staan in `/var/www/voyage/.env.local`
- Nooit in git

**Next.js Environment Variable Handling:**
- `NEXT_PUBLIC_*` → Beschikbaar in browser (client-side)
- Andere vars → Alleen server-side
- Next.js injecteert deze tijdens build/runtime

---

## Externe Integraties

### Supabase Integratie

**Architectuur:**

```
Next.js Application
  ├── Server Components
  │     └── createClient() → Supabase Server Client
  │           └── Authenticated requests (cookies)
  │
  ├── Server Actions
  │     └── createClient() → Supabase Server Client
  │           └── Database mutations
  │
  └── Client Components
        └── createClient() → Supabase Client Client
              └── Anon key, RLS bepaalt toegang
```

**Connection Flow:**

```typescript
// Server-side (src/lib/supabase/server.ts)
export async function createClient() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  return supabase;
}

// Client-side (src/lib/supabase/client.ts)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Row Level Security (RLS):**

- Policies in Supabase database bepalen wie wat kan zien/bewerken
- Server client gebruikt user session (cookies)
- Client client gebruikt anon key, RLS filtert resultaten
- Guest sessions hebben beperkte rechten

### Google Places API Integratie

**Client-side Flow:**
```
Browser
  ↓
react-google-autocomplete component
  ↓
Google Places JavaScript API (direct)
  ↓
Suggesties terug naar component
  ↓
onPlaceSelected callback
  ↓
FormData update
```

**Server-side Flow:**
```
Server Action (createTrip)
  ↓
getCityPhotoUrl("Barcelona")
  ↓
fetch() naar Google Places API
  ↓
Photo reference terug
  ↓
Photo URL opgeslagen in database
```

**Zie:** `docs/EXTERNAL_APIS.md` voor volledige details

### GetYourGuide Scraping

**Flow:**
```
Server Action (generateItinerary)
  ↓
scrapeGetYourGuideActivities()
  ↓
fetch() naar GetYourGuide website
  ↓
HTML response
  ↓
cheerio.parse(html)
  ↓
Activiteiten geëxtraheerd
  ↓
Toegevoegd aan itinerary
```

---

## Security & Beveiliging

### Authentication & Authorization

**Supabase Auth:**
- Email/password authentication
- Session management via HTTP-only cookies
- JWT tokens (handled door Supabase)

**Guest Sessions:**
- UUID gegenereerd met `uuid` package
- Opgeslagen in cookies (niet HTTP-only voor nu)
- Beperkte rechten via RLS policies

**Row Level Security:**
- Database-level security
- Policies bepalen toegang per gebruiker/trip
- Geen security logic in applicatie code nodig

### API Security

**Google Places API:**
- API key restricted in Google Console
- HTTP referrer restrictions
- API restrictions (alleen Places API enabled)

**Server Actions:**
- Type-safe (TypeScript)
- Input validatie (Zod schemas)
- Server-side execution (geen client-side manipulatie)

### Data Protection

**Environment Variables:**
- Nooit in git (`.env.local` in `.gitignore`)
- Server-side keys niet naar client
- Client-side keys restricted via service providers

**HTTPS:**
- SSL/TLS via Let's Encrypt
- Alle verkeer encrypted
- Secure cookies

---

## Performance & Optimalisatie

### Next.js Optimalisaties

**Server Components:**
- Geen JavaScript naar client (kleinere bundles)
- Data fetching op server (sneller)
- Streaming SSR mogelijk

**Code Splitting:**
- Automatisch per route
- Client Components lazy loaded
- Tree shaking (ongebruikte code verwijderd)

**Image Optimization:**
- Next.js Image component
- Automatische format conversion (WebP, AVIF)
- Lazy loading
- Responsive images

**Caching:**
- Next.js cache voor Server Components
- `revalidate` voor time-based cache
- Database caching voor photo URLs

### Database Optimalisaties

**Supabase:**
- Connection pooling (automatisch)
- Indexes op veelgebruikte queries
- RLS policies zijn performant

**Queries:**
- Select alleen benodigde velden
- Gebruik indexes (foreign keys, dates)
- Paginatie voor grote datasets

### External API Optimalisaties

**Google Places:**
- Caching (1 uur revalidate)
- Database opslag van photo URLs
- Fallback naar Unsplash (geen blocking)

**GetYourGuide:**
- Caching (1 uur)
- Fallback naar handmatige activiteiten
- Geen blocking (app blijft functioneel)

---

## Monitoring & Logging

### Logging

**PM2 Logs:**
- `/var/log/voyage/out.log` - stdout
- `/var/log/voyage/error.log` - stderr
- Rotatie via PM2

**Application Logs:**
- Console.log in development
- Console.error voor errors
- Geen PII in logs

### Monitoring

**Health Check:**
- `/api/health` endpoint
- Returns: `{ status: 'ok', timestamp: '...' }`
- Gebruikt voor load balancer checks

**Error Tracking:**
- Geen externe service (voor nu)
- Errors in PM2 logs
- Console errors in browser (development)

---

## Scaling & Future Considerations

### Current Setup

- **Single VM:** Skylabs VM met PM2 cluster (2 instances)
- **Database:** Supabase cloud (schaalt automatisch)
- **No CDN:** Static files via Nginx
- **No Load Balancer:** Single server

### Scaling Options

**Horizontal Scaling:**
- Meerdere VMs achter load balancer
- Shared session storage (Redis)
- Database blijft Supabase (cloud)

**Vertical Scaling:**
- Meer PM2 instances op zelfde VM
- Meer RAM/CPU voor VM

**CDN:**
- Cloudflare voor static assets
- Edge caching voor snellere laadtijden

---

**Laatste update:** December 2025  
**Auteurs:** Yassine & Sedäle

