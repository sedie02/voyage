# Google Maps API Setup

## Stap 1: Maak een Google Cloud Project aan

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan (of gebruik een bestaand project)

## Stap 2: Activeer de Places API

1. Ga naar **APIs & Services** > **Library**
2. Zoek naar **Places API**
3. Klik op **Enable**

## Stap 3: Maak een API Key aan

1. Ga naar **APIs & Services** > **Credentials**
2. Klik op **Create Credentials** > **API Key**
3. Kopieer de API key

## Stap 4: Voeg de API Key toe aan je project

1. Maak een `.env.local` file aan in de root van je project
2. Voeg de volgende regel toe:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=jouw_api_key_hier
```

## Stap 5: Restart je development server

```bash
npm run dev
```

## Belangrijk

- Zorg ervoor dat je de API key **NOOIT** commit naar Git
- De `.env.local` file staat al in `.gitignore`
- Voor productie, gebruik API restrictions in Google Cloud Console

## Test het

Ga naar `/trips/new` en probeer een stad te zoeken. Je zou autocomplete suggesties moeten zien van Google Places!
