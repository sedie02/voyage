# 🌍 Voyage - Slimme Collaboratieve Reisplanner

**Voyage** is een Progressive Web App (PWA) die groepsreizigers helpt om stressvrij en overzichtelijk hun reis te plannen. Eén centrale plek voor dagplanning, polls, inpaklijsten en budget.

## 📋 Project Overzicht

- **Studenten**: Yassine Messaoudi & Sedäle Hoogvliets
- **Opleiding**: HBO-ICT, Hogeschool Windesheim
- **Module**: PSEMO (Praktijkgerichte Software Engineering met Onderwijs)
- **Coach**: Rob Kaesehagen
- **Periode**: September 2025 - December 2025

## 🎯 Doel

Ontwikkel een gebruiksvriendelijke PWA-MVP die groepsreisplanning centraliseert en aantoonbaar stress en coördinatielast verlaagt.

## ✨ Kernfunctionaliteiten (MVP)

- ✅ **Trip Management** - Reizen aanmaken, bewerken en beheren
- 📅 **Itinerary Generator** - Heuristische dagplanning met ochtend/middag/avond indeling
- 🗳️ **Polls** - Groepsbeslissingen via stemmen
- 🎒 **Packing List** - Gedeelde inpaklijst per trip
- 💰 **Budget** - Simpel kostenbeheer met equal split
- 🔗 **Share Links** - Gastmodus zonder verplicht account
- 🌤️ **Weather Badge** - Weersinformatie per dag
- 📍 **POI Integration** - Points of Interest via Maps API

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework met App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animaties en transitions
- **PWA** - Installable, offline-capable web app

### Backend & Database

- **Supabase** - Postgres database, Auth, Storage
- **Next.js API Routes** - Serverless functions

### External APIs

- **Google Maps/Places** - Locaties en POI's
- **OpenWeatherMap** - Weersinformatie

### DevOps & Hosting

- **Skylabs VM** - Virtual Machine hosting
- **GitHub** - Version control & CI/CD
- **GitHub Projects** - Backlog management

### Testing & Quality

- **Jest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structuur

```
voyage/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── ...
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth route group
│   │   ├── (dashboard)/   # Protected routes
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   └── layouts/      # Layout components
│   ├── lib/              # Utility functions
│   │   ├── supabase/     # Supabase client & helpers
│   │   ├── api/          # API client functions
│   │   └── utils/        # General utilities
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   │   ├── database.types.ts  # Supabase generated types
│   │   └── ...
│   ├── styles/           # Global styles
│   └── config/           # App configuration
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   ├── seed.sql          # Seed data
│   └── schema.sql        # Database schema
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── e2e/             # E2E tests
├── docs/                 # Project documentation
│   ├── ADR/             # Architecture Decision Records
│   ├── API.md           # API documentation
│   └── DEPLOYMENT.md    # Deployment guide
├── .env.example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest configuration
├── playwright.config.ts  # Playwright configuration
└── package.json          # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Google Maps API key
- OpenWeatherMap API key

### Installation

1. **Clone de repository**

   ```bash
   git clone <repository-url>
   cd voyage
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Vul de volgende variabelen in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `OPENWEATHER_API_KEY`

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📝 Development Workflow

### Git Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/<issue-nummer-beschrijving>` - Feature branches

### Scrum Rituelen

- **Daily Stand-up**: 10:00-10:15 (di/wo/do)
- **Sprint Planning**: Elke 2 weken, dinsdag 10:30-11:30
- **Sprint Review**: Laatste donderdag van sprint, 15:30-16:00
- **Retrospective**: Na review, 30 min

### Definition of Ready (DoR)

- User story heeft titel, beschrijving, acceptatiecriteria
- Afhankelijkheden zijn bekend
- Story points zijn geschat

### Definition of Done (DoD)

- Code werkt en is getest
- Code review is uitgevoerd
- Documentatie is bijgewerkt
- Acceptatiecriteria zijn behaald

## 🧪 Testing

```bash
# Run unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npx playwright test
```

## 🏗️ Building & Deployment

### Build voor productie

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Deployment naar Skylabs VM

Zie [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) voor gedetailleerde instructies.

## 📊 Kwaliteitscriteria

- **Performance**: Time to Interactive < 3s
- **Accessibility**: WCAG 2.1 AA compliance
- **PWA Score**: Lighthouse PWA score >= 90
- **Test Coverage**: >= 70%
- **Browser Support**: Chrome, Firefox, Safari, Edge (laatste 2 versies)

## 📚 Documentatie

- [Project Definitie](docs/PROJECT_DEFINITION.pdf)
- [Ontwerpdocument](docs/ONTWERPDOCUMENT.pdf)
- [Adviesdocument](docs/ADVIESDOCUMENT.pdf)
- [API Documentatie](docs/API.md)
- [Database Schema](supabase/schema.sql)

## 🤝 Werkafspraken

- **Werkdagen**: di/wo/do op locatie (09:00-16:00)
- **Communicatie**: Microsoft Teams & WhatsApp
- **Tools**: GitHub Projects (Kanban), Figma (Design)
- **Code Quality**: ESLint + Prettier enforced

## 📄 Licentie

Dit project is ontwikkeld als onderdeel van het HBO-ICT curriculum van Hogeschool Windesheim.

## 👥 Contact

- **Yassine Messaoudi** - yassine.messaoudi@windesheim.nl
- **Sedäle Hoogvliets** - sedale.hoogvliets@windesheim.nl
- **Coach**: Rob Kaesehagen - r.kaesehagen@windesheim.nl

---

**Versie**: 0.1.0 - MVP Development
**Laatst bijgewerkt**: 30 September 2025
