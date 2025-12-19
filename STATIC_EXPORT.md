# 📦 Static Export voor Normale Hosting

Deze guide legt uit hoe je Voyage exporteert als statische HTML voor normale hosting (zoals shared hosting met `public_html`).

## ⚠️ Belangrijk: Beperkingen

**Voyage gebruikt Server Actions en Server Components**, die **NIET werken** in een statische export. Dit betekent:

- ❌ Geen database operaties (trips aanmaken, bewerken, etc.)
- ❌ Geen Server Actions (forms werken niet)
- ❌ Geen server-side data fetching
- ✅ Alleen frontend/UI werkt (read-only demo)

**Voor volledige functionaliteit heb je Node.js hosting nodig (zoals Skylabs, Vercel, etc.)**

## Static Export (Demo Versie)

### Stap 1: Build voor Static Export

```bash
npm run build:static
```

Dit maakt een `out/` folder met alle statische HTML/CSS/JS files.

### Stap 2: Upload naar Hosting

1. Upload de hele `out/` folder naar je `public_html` directory
2. Upload `.htaccess` naar `public_html/`
3. Zorg dat `.htaccess` dezelfde naam heeft (niet `.htaccess.txt`)

### Stap 3: Check

Open je website in de browser. De UI zou moeten werken, maar functionaliteit die Server Actions nodig heeft werkt niet.

## Alternatief: Client-Side Only Versie

Als je een werkende versie wilt zonder server, moet je:

1. Alle Server Components omzetten naar Client Components
2. Server Actions vervangen door directe Supabase client calls
3. Data fetching verplaatsen naar client-side

Dit is een grote refactor en wordt niet aanbevolen voor productie.

## Aanbevolen: Node.js Hosting

Voor volledige functionaliteit gebruik:

- Skylabs VM (zoals je nu doet)
- Vercel
- Railway
- Render
- DigitalOcean App Platform

---

**Note:** Static export is alleen geschikt voor demo/read-only versies.
