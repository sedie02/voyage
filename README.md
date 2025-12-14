# 🌍 Voyage - Collaboratieve Reisplanner

Een web applicatie voor het plannen van groepsreizen. Je kan er trips aanmaken, activiteiten plannen, inpaklijsten maken en je reisgenoten uitnodigen.

## 📋 Project Info

- **Gemaakt door**: Yassine Messaoudi & Sedäle Hoogvliets
- **Opleiding**: HBO-ICT, Hogeschool Windesheim
- **Versie**: 0.1.0

## 🎯 Wat doet deze app?

We hebben een reisplanner gemaakt waar groepen samen hun reis kunnen organiseren. Je kan trips aanmaken, andere mensen uitnodigen, een dagplanning maken en een inpaklijst bijhouden. Het idee is dat alles op één plek staat in plaats van verspreid over WhatsApp, Excel sheets en losse notities.

## ✨ Features die werken

- Trip aanmaken, bewerken en verwijderen
- Dagplanning met activiteiten
- Inpaklijst met verschillende categorieën
- Mensen uitnodigen via share links
- Guest mode (je hoeft geen account te hebben om mee te doen)
- Werkt op mobiel en desktop
- Bottom navigatie op mobiel

## Database

We gebruiken Supabase (PostgreSQL) met deze tabellen:

- Trips met deelnemers en hun rollen
- Itinerary items voor dagplanning
- Packing lists
- Invite links die je kan delen
- Poll systeem (voor groepsbeslissingen)
- Budget/expenses
- Row Level Security voor wie wat mag zien

## 🛠️ Technologieën

**Frontend**

- Next.js 14 (React met App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod voor formulieren

**Backend**

- Supabase (database + auth)
- Next.js Server Actions
- Row Level Security in de database

**External APIs**

- Google Maps/Places API (voor locaties)
- Google Geocoding (voor coördinaten)

**Testing**

- Jest (unit tests)
- React Testing Library
- Playwright (end-to-end tests)
- ESLint + Prettier

**Hosting**

- Skylabs VM
- PM2 (voor process management)
- Nginx (reverse proxy)

## 📁 Folder structuur

```
voyage/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Homepage
│   │   ├── login/
│   │   ├── register/
│   │   ├── trips/              # Trip paginas
│   │   ├── packing/            # Inpaklijst
│   │   └── invite/             # Invite links accepteren
│   │
│   ├── components/             # React components
│   │   ├── ui/
│   │   ├── AppHeader.tsx
│   │   ├── BottomNav.tsx
│   │   └── ...
│   │
│   ├── lib/                    # Helper functies
│   │   ├── supabase/           # Database setup
│   │   ├── external/           # API calls
│   │   ├── session.ts          # Guest sessions
│   │   └── utils/
│   │
│   ├── types/
│   ├── contexts/
│   ├── config/
│   └── styles/
│
├── supabase/                   # Database files
│   ├── schema.sql
│   ├── init.sql
│   └── *.sql
│
├── tests/
│   └── trips/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── docs/                       # Documentatie
│   ├── ADR/
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── public/
    └── manifest.json
```

## 🚀 Installatie

**Je hebt nodig:**

- Node.js 18 of hoger
- npm 9 of hoger

**Setup:**

1. Clone het project

   ```bash
   git clone <repository-url>
   cd voyage
   ```

2. Installeer packages

   ```bash
   npm install
   ```

3. Environment variables

   Kopieer `env.local.example` naar `.env.local` en vul je eigen keys in.

4. Database

   Upload `supabase/schema.sql` in je Supabase project (via de SQL editor).

5. Start de dev server

   ```bash
   npm run dev
   ```

   Gaat naar: http://localhost:3000

## 📝 Commands

```bash
# Development
npm run dev              # Dev server starten
npm run build            # Build voor productie
npm start                # Productie server starten

# Code quality
npm run lint             # ESLint checken
npm run lint:fix         # ESLint errors fixen
npm run format           # Code formatten
npm run type-check       # TypeScript checken

# Testing
npm test                 # Unit tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage rapport
npm run test:e2e         # E2E tests met Playwright

# Database
npm run db:generate      # TypeScript types genereren van Supabase
```

## 🧪 Testing

We hebben verschillende soorten tests:

- **Unit tests**: Voor losse components en functies (Jest)
- **Integration tests**: Voor features met server actions
- **E2E tests**: Voor complete user flows (Playwright)

## 🏗️ Hoe het werkt

**Design patterns:**

- Server Components van Next.js
- Server Actions voor data updates
- Context API voor global state (bijvoorbeeld toast messages)
- Herbruikbare UI components

**Database security:**

- Row Level Security (RLS) in Postgres
- Verschillende rollen: owner, editor, viewer, guest
- Guest sessions via cookies
- Invite links met expiratie datum

**APIs:**

- Google Places voor locatie autocomplete
- Google Geocoding voor coordinaten van bestemmingen

## 📚 Documentatie

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Uitgebreide uitleg van de folders
- [docs/API.md](docs/API.md) - API endpoints
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Hoe je het host
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow
- [docs/ADR/001-tech-stack-keuze.md](docs/ADR/001-tech-stack-keuze.md) - Waarom deze tech stack

## 🔐 Security

- Environment variables voor gevoelige data
- Row Level Security in database
- HTTPS cookies voor sessies
- Input validatie met Zod
- TypeScript strict mode

## 📦 Deployment

Het project draait op een Skylabs VM met PM2 en Nginx. Zie [DEPLOYMENT.md](docs/DEPLOYMENT.md) voor de stappen.

## 🤝 Development

**Git branches:**

- `main` - Productie code
- `develop` - Development branch
- `feature/naam` - Feature branches

**Code quality:**

- ESLint en Prettier draaien voor consistente code
- TypeScript strict mode aan
- Tests schrijven voor nieuwe features

**Pull requests:**

- Duidelijke beschrijving
- Tests moeten slagen
- Code review

## 📄 Licentie

Dit is een schoolproject voor HBO-ICT aan Hogeschool Windesheim.

## 👥 Contact

- Yassine Messaoudi - yassine.messaoudi@windesheim.nl
- Sedäle Hoogvliets - sedale.hoogvliets@windesheim.nl

---

**Status**: In development
**Update**: December 2025
