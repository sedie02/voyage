# 🚀 Vercel Deployment Guide

## Stap 1: Maak je eigen GitHub repo

1. Ga naar [GitHub](https://github.com/new)
2. Maak een nieuwe repository aan (bijv. `voyage-app`)
3. **DON'T** initialize met README, .gitignore, of license
4. Kopieer de repository URL (bijv. `https://github.com/jouw-username/voyage-app.git`)

## Stap 2: Push code naar je eigen repo

**Op je Mac, in de voyage directory:**

```bash
cd /Users/safouane/Documents/code/voyage

# Check huidige remote
git remote -v

# Voeg je eigen repo toe als nieuwe remote
git remote add myrepo https://github.com/jouw-username/voyage-app.git

# Push naar je eigen repo
git push myrepo main
```

**Of als je de oude remote wilt vervangen:**

```bash
# Verwijder oude remote
git remote remove origin

# Voeg je eigen repo toe
git remote add origin https://github.com/jouw-username/voyage-app.git

# Push
git push -u origin main
```

## Stap 3: Deploy op Vercel

1. Ga naar [Vercel](https://vercel.com)
2. Log in met GitHub
3. Klik **"Add New Project"**
4. Selecteer je `voyage-app` repository
5. Vercel detecteert automatisch Next.js
6. **Voeg Environment Variables toe:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
7. Klik **"Deploy"**

## Stap 4: Check deployment

Vercel geeft je een URL zoals `voyage-app.vercel.app`. De app zou nu live moeten zijn!

## Troubleshooting

### Build fails?

- Check of alle environment variables zijn toegevoegd
- Check Vercel build logs voor errors

### Database errors?

- Zorg dat Supabase RLS policies correct zijn
- Check of environment variables correct zijn

### Google Maps werkt niet?

- Check of `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is toegevoegd
- Check of API key correct is
