# ADR 001: Tech Stack Keuze

**Status:** Accepted
**Datum:** December 2024
**Auteurs:** Yassine Messaoudi & Sedäle Hoogvliets

## Context

Voor het Voyage project moesten we een tech stack kiezen. We wilden een moderne, type-safe stack die snel development mogelijk maakt en goed schaalbaar is. Ook belangrijk: we moesten het kunnen hosten zonder te veel vendor lock-in.

## Overwegingen

### Frontend Framework

**Opties:**

- React (met Vite)
- Next.js
- SvelteKit
- Vue.js

**Beslissing: Next.js 14**

**Redenen:**

1. **App Router** - Nieuwe routing systeem is veel beter dan Pages Router
2. **Server Components** - Minder JavaScript naar client, sneller
3. **Server Actions** - Type-safe data mutations zonder REST API boilerplate
4. **Full-stack** - Alles in één framework, minder context switching
5. **TypeScript support** - Uitstekend, out-of-the-box
6. **Ecosystem** - Grote community, veel packages
7. **Vercel hosting** - Makkelijk (maar niet verplicht, kan overal)

**Trade-offs:**

- Learning curve voor Server Components (nieuw concept)
- Meer "magic" dan plain React (maar dat maakt het ook makkelijker)

### Backend/Database

**Opties:**

- Supabase
- Firebase
- Prisma + PostgreSQL (zelf hosten)
- MongoDB Atlas

**Beslissing: Supabase**

**Redenen:**

1. **PostgreSQL** - Krachtige, relationele database (we kennen SQL)
2. **Row Level Security** - Security op database niveau, niet in applicatie code
3. **Auth ingebouwd** - Geen apart auth systeem nodig
4. **Real-time** - Optioneel voor later (live updates)
5. **TypeScript types** - Auto-genereren van database schema
6. **Gratis tier** - Goed genoeg voor development en kleine productie
7. **Geen vendor lock-in** - PostgreSQL is standaard, kan migreren

**Trade-offs:**

- Cloud dependency (maar kan PostgreSQL zelf hosten als backup)
- Minder features dan Firebase (maar we hebben die niet nodig)

### Styling

**Opties:**

- Tailwind CSS
- CSS Modules
- Styled Components
- Material UI / Chakra UI

**Beslissing: Tailwind CSS**

**Redenen:**

1. **Utility-first** - Snel ontwikkelen, geen CSS files nodig
2. **Consistent design** - Design system via config
3. **Small bundle** - Alleen gebruikte classes worden gebundeld
4. **Developer experience** - IntelliSense, snel typen
5. **Flexibiliteit** - Kan altijd custom CSS toevoegen waar nodig

**Trade-offs:**

- HTML kan "rommelig" worden met veel classes (maar dat valt mee met components)
- Learning curve (maar snel te leren)

### Form Handling

**Opties:**

- React Hook Form
- Formik
- Plain controlled inputs

**Beslissing: React Hook Form + Zod**

**Redenen:**

1. **Performance** - Minder re-renders dan controlled inputs
2. **Zod integratie** - Type-safe validatie, types worden gegenereerd
3. **Eenvoudig** - Minder boilerplate dan Formik
4. **Goede DX** - Fijne developer experience

### Testing

**Opties:**

- Jest + React Testing Library
- Vitest
- Cypress
- Playwright

**Beslissing: Jest + React Testing Library + Playwright**

**Redenen:**

1. **Jest** - Standaard voor React, goed geïntegreerd
2. **React Testing Library** - Test user behavior, niet implementatie
3. **Playwright** - Moderne E2E tool, beter dan Cypress (onze mening)
4. **TypeScript support** - Uitstekend in alle tools

**Trade-offs:**

- Jest kan traag zijn (maar voor onze use case prima)
- Playwright heeft learning curve (maar documentatie is goed)

### Hosting

**Opties:**

- Vercel (Next.js native)
- Railway
- Skylabs VM (onze school hosting)
- DigitalOcean

**Beslissing: Skylabs VM (voor nu)**

**Redenen:**

1. **Gratis** - Via school
2. **Controle** - Volledige controle over server
3. **Learning** - Leren hoe deployment echt werkt
4. **Geen vendor lock-in** - Kan altijd migreren

**Trade-offs:**

- Meer setup werk (maar leerzaam)
- Zelf onderhoud (maar dat willen we leren)
- Later kunnen we altijd naar Vercel als we willen

## Alternatieven die we overwogen

### SvelteKit

- Interessant, maar minder bekend bij ons
- Kleinere ecosystem
- **Beslissing:** Sticking met wat we kennen (React)

### Prisma + zelf PostgreSQL hosten

- Meer controle, maar ook meer werk
- Database backups zelf regelen
- **Beslissing:** Supabase is makkelijker en heeft backups

### Firebase

- Goede optie, maar minder flexibel dan PostgreSQL
- Vendor lock-in is sterker
- **Beslissing:** Supabase geeft meer flexibiliteit

## Gevolgen

### Positief

- Snelle development door Next.js Server Actions
- Type-safe end-to-end (TypeScript + Zod + Supabase types)
- Goede developer experience
- Moderne stack die we kunnen leren
- Geen vendor lock-in (kan migreren)

### Negatief

- Learning curve voor Server Components
- Next.js heeft veel "magic" (kan verwarrend zijn)
- Supabase is cloud dependency (maar acceptabel)
- Skylabs VM vereist meer setup dan Vercel

## Status

Deze stack is geaccepteerd en in gebruik sinds project start. We zijn tevreden met de keuzes, vooral:

- Next.js App Router werkt goed voor onze use case
- Supabase RLS maakt security veel makkelijker
- Tailwind CSS versnelt development aanzienlijk

## Toekomstige overwegingen

**Mogelijke wijzigingen:**

- **State Management:** Als app groeit, overweeg Zustand of Redux (nu Context API genoeg)
- **Caching:** Overweeg React Query als we meer client-side caching nodig hebben
- **Hosting:** Later mogelijk naar Vercel voor zero-config deployment
- **Database:** Als Supabase te duur wordt, kan PostgreSQL zelf hosten

**Wat we zouden anders doen:**

- Misschien eerder beginnen met E2E tests (nu wat laat)
- Database schema beter plannen vanaf begin (nu wat iteratief)

---

**Laatste update:** December 2025
**Review:** Gepland voor Q1 2026 (als project verder ontwikkeld wordt)
