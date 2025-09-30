# ADR 001: Tech Stack Keuze

**Status**: Accepted
**Datum**: 30 September 2025
**Auteurs**: Yassine Messaoudi, Sedäle Hoogvliets

## Context

Voor Voyage moeten we een technologie stack kiezen die:

- Snel te ontwikkelen is (8 sprints)
- Schaalbaar en onderhoudb aar is
- Progressive Web App (PWA) functionaliteit ondersteunt
- Goede developer experience biedt
- Geschikt is voor hosting op Skylabs VM

## Besluit

We kiezen voor:

- **Frontend**: Next.js 14 (React) met TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (Postgres)
- **Hosting**: Skylabs Virtual Machine (in plaats van Vercel)
- **PWA**: next-pwa
- **Testing**: Jest + Playwright

## Rationale

### Next.js

- **Voor**:
  - Server-side rendering én client-side rendering
  - Ingebouwde API routes (geen losse backend nodig)
  - Optimale performance out-of-the-box
  - Excellent developer experience
  - Grote community en documentatie
- **Tegen**:
  - Leercurve voor team members die nieuw zijn met React

### Supabase

- **Voor**:
  - Postgres database met real-time capabilities
  - Ingebouwde auth (incl. gastmodus support)
  - Row Level Security (RLS) voor veiligheid
  - Gratis tier voldoende voor MVP
  - Type-safe database client
- **Tegen**:
  - Vendor lock-in risico (gemitigeerd door Postgres compatibiliteit)

### Skylabs VM i.p.v. Vercel

- **Voor**:
  - Volledige controle over deployment
  - Geschikt voor educatieve setting
  - Geen vendor-specifieke beperkingen
  - Mogelijkheid voor custom server configuraties
- **Tegen**:
  - Meer manual deployment work
  - Zelf verantwoordelijk voor uptime/monitoring

### TypeScript

- **Voor**:
  - Type safety voorkomt runtime errors
  - Betere IDE support
  - Self-documenting code
  - Makkelijkere refactoring
- **Tegen**:
  - Iets meer boilerplate

## Consequenties

### Positief

- Snelle development met moderne tooling
- Type-safe vanaf database tot UI
- PWA support out-of-the-box
- Schaalbaar voor toekomstige features

### Negatief

- Team moet Next.js/TypeScript leren
- Manual deployment naar VM vereist meer setup

### Neutraal

- Build time iets langer door TypeScript compilation

## Alternatieven Overwogen

1. **Create React App + Express**
   - Afgewezen: meer boilerplate, minder geoptimaliseerd

2. **Vue.js/Nuxt**
   - Afgewezen: team heeft meer React ervaring

3. **Vercel Hosting**
   - Afgewezen: Skylabs VM is vereiste van de organisatie

## Vervolgacties

- [x] Setup Next.js project met TypeScript
- [x] Configureer Supabase project
- [ ] Setup Skylabs VM deployment pipeline
- [ ] Team training in Next.js/TypeScript basics

## Referenties

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Adviesdocument Voyage](../ADVIESDOCUMENT.pdf)
