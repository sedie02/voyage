# ⚡ Voyage - Quick Start Guide

**5 minuten setup** voor development.

## 🚀 Snelstart

### 1. Clone & Install (2 min)

```bash
cd voyage
npm install
```

### 2. Environment Setup (2 min)

```bash
# Kopieer template
cp env.local.example .env.local
```

**Vul minimaal in voor lokale development:**

```env
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (later invullen als je project hebt)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Voor nu mock mode (zonder echte API's)
MOCK_EXTERNAL_APIS=true
```

### 3. Start Development (1 min)

```bash
npm run dev
```

✅ Open **http://localhost:3000** - je zou de Voyage landing page moeten zien!

---

## 🗄️ Supabase Setup (Later - Optioneel voor nu)

### Stap 1: Maak Supabase Project

1. Ga naar [supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Vul in:
   - **Name**: voyage-dev
   - **Database Password**: [genereer sterke password]
   - **Region**: West EU (Netherlands)

### Stap 2: Run Schema

1. Ga naar SQL Editor in Supabase dashboard
2. Klik "New Query"
3. Kopieer **volledige** inhoud van `supabase/schema.sql`
4. Klik "Run"
5. Verificatie: Check Tables tab - je moet zien:
   - trips
   - trip_participants
   - days
   - activities
   - polls
   - (etc.)

### Stap 3: Haal API Keys Op

1. Ga naar **Project Settings** → **API**
2. Kopieer:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Plak in `.env.local`

### Stap 4: Test Connectie

```typescript
// Test in browser console op localhost:3000
const { createClient } = require('@/lib/supabase/client');
const supabase = createClient();
const { data, error } = await supabase.from('trips').select('*');
console.log(data); // Should return empty array
```

---

## 🗺️ Google Maps API (Later - Voor POI features)

### Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak nieuw project: "Voyage"
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Maak credentials → API Key
5. Restrict key:
   - **Application restrictions**: HTTP referrers
   - **Add**: `http://localhost:3000/*`
6. Kopieer key → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`

**Free tier limits**:

- Places API: $200 free per maand
- Genoeg voor development!

---

## 🌤️ Weather API (Later - Voor weather badges)

### OpenWeatherMap Setup

1. Ga naar [openweathermap.org](https://openweathermap.org/api)
2. Sign up (gratis)
3. Ga naar API keys tab
4. Kopieer default key → `OPENWEATHER_API_KEY` in `.env.local`

**Free tier**: 1000 calls/dag - perfect voor development.

---

## ✅ Verificatie Checklist

Na setup, test deze commands:

```bash
# Should all succeed ✅

npm run dev          # Dev server start
npm run lint         # No errors
npm run type-check   # Types ok
npm test             # Tests pass (als je tests hebt)
```

---

## 🆘 Troubleshooting

### "Module not found" errors

```bash
# Clear cache en reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors over missing modules

```bash
# Regenerate types
npm run type-check
```

### Can't connect to Supabase

1. Check `.env.local` heeft correcte keys
2. Verificeer Supabase project is actief
3. Check schema is correct geladen

### API calls falen

Zet mock mode aan in `.env.local`:

```env
MOCK_EXTERNAL_APIS=true
```

---

## 📚 Waar nu heen?

### Development Flow

1. **Check backlog** in GitHub Projects
2. **Maak feature branch**: `git checkout -b feature/123-trip-wizard`
3. **Bouw feature** volgens acceptance criteria
4. **Test** (unit + e2e indien van toepassing)
5. **Maak PR** naar `develop`
6. **Code review** door teamlid
7. **Merge** en deploy

### Belangrijke Files om Te Lezen

- [`README.md`](README.md) - Complete project overview
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Waar alles staat
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Development workflow
- [`docs/API.md`](docs/API.md) - API endpoints

### Eerste Features om Te Bouwen (Sprint 4+)

1. **Trip CRUD**
   - Trip creation form
   - Trip list page
   - Trip detail page

2. **Itinerary Generator**
   - Heuristic algorithm
   - Day/activity components
   - Drag & drop reorder

3. **Polls**
   - Create poll form
   - Vote interface
   - Results display

---

## 💡 Pro Tips

### VS Code Setup

Installeer recommended extensions:

```bash
# Open VS Code
code .

# VS Code zal automatisch vragen of je recommended extensions wilt installeren
# Klik "Install All"
```

### Git Workflow

```bash
# Update vanaf develop
git checkout develop
git pull

# Nieuwe feature
git checkout -b feature/my-feature

# Commit met conventional commits
git commit -m "feat(trips): add trip creation wizard"
```

### Hot Reload Issues?

```bash
# Soms moet je server herstarten
# Ctrl+C in terminal, dan:
npm run dev
```

---

## 🎯 Volgende Stappen

1. **Setup compleet?** → Ga naar [Sprint Planning](CHANGELOG.md)
2. **Klaar voor eerste feature?** → Check GitHub Projects board
3. **Vragen?** → Stel in Teams #voyage of tag @yassine/@sedäle

---

**Happy Coding! 🚀**

---

_Voor gedetailleerde info, zie [README.md](README.md) en [SETUP_COMPLETE.md](SETUP_COMPLETE.md)_
