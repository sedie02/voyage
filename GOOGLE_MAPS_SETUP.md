# Google Maps API Setup

Hoe je de Google Maps API key instelt voor Voyage.

## Stap 1: Google Cloud Project

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan (of gebruik bestaand project)

## Stap 2: Places API Activeren

1. Ga naar **APIs & Services** > **Library**
2. Zoek naar **Places API**
3. Klik op **Enable**

## Stap 3: API Key Aanmaken

1. Ga naar **APIs & Services** > **Credentials**
2. Klik op **Create Credentials** > **API Key**
3. Kopieer de API key

## Stap 4: API Key Toevoegen

1. Maak `.env.local` aan in de root van je project
2. Voeg toe:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=jouw_api_key_hier
```

## Stap 5: Server Herstarten

```bash
npm run dev
```

## Belangrijk

- API key **NOOIT** committen naar Git
- `.env.local` staat al in `.gitignore`
- Voor productie: gebruik API restrictions in Google Cloud Console

## Testen

Ga naar `/trips/new` en zoek een stad. Je zou autocomplete suggesties moeten zien.

