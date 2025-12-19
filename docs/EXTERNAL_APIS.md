# Externe API-koppelingen - Technische Documentatie

Dit document beschrijft in detail hoe Voyage externe API's aanroept en integreert. Dit is essentieel voor developers die de applicatie moeten begrijpen of onderhouden.

## Overzicht

Voyage gebruikt momenteel twee externe databronnen:

1. **Google Places API** - Voor locatie autocomplete en city photos
2. **GetYourGuide** - Web scraping voor activiteitensuggesties (experimenteel)

## 1. Google Places API

### Architectuur & Flow

Google Places API wordt op twee manieren gebruikt:

#### A. Client-side: Autocomplete voor destination input

**Waar:** Trip creation form (`src/app/trips/new/page.tsx`)

**Hoe het werkt:**

- Gebruikt `react-google-autocomplete` npm package
- Component rendert een input veld dat direct communiceert met Google Places JavaScript API
- API key wordt client-side meegegeven (maar restricted via Google Console op domain/IP)

**Code implementatie:**

```typescript
import Autocomplete from 'react-google-autocomplete';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

<Autocomplete
  apiKey={GOOGLE_MAPS_API_KEY}
  onPlaceSelected={(place) => {
    // place object bevat: formatted_address, geometry, etc.
    setFormData({ ...formData, destination: place.formatted_address });
  }}
  options={{
    types: ['(cities)'], // Alleen steden, geen specifieke adressen
    componentRestrictions: { country: 'nl' }, // Optioneel: alleen NL
  }}
/>
```

**Request flow:**

1. Gebruiker typt in input veld
2. `react-google-autocomplete` stuurt automatisch requests naar Google Places Autocomplete API
3. Google retourneert suggesties
4. Gebruiker selecteert suggestie
5. `onPlaceSelected` callback wordt getriggerd met place object
6. FormData wordt geüpdatet met `formatted_address`

**API endpoint (intern gebruikt door component):**

```
https://maps.googleapis.com/maps/api/place/autocomplete/json
```

**Parameters:**

- `input`: De tekst die gebruiker typt
- `key`: API key
- `types`: Filter op type locatie
- `components`: Land restricties

**Security:**

- API key is zichtbaar in browser (NEXT*PUBLIC* prefix)
- Maar restricted in Google Cloud Console:
  - HTTP referrer restrictions: `https://jouw-domain.nl/*`
  - API restrictions: Alleen Places API enabled
- Rate limiting: Google hanteert eigen limits ($200 free tier per maand)

#### B. Server-side: City photos ophalen

**Waar:** `src/lib/external/places.ts`

**Hoe het werkt:**

- Server-side functie die wordt aangeroepen tijdens trip creation
- Haalt representatieve foto op van de bestemming
- Gebruikt Google Places "Find Place from Text" + Photos API
- Resultaat wordt opgeslagen in database voor caching

**Code implementatie:**

```typescript
export async function getCityPhotoUrl(
  query: string,
  maxWidth: number = 1600
): Promise<string | null> {
  const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Stap 1: Find Place from Text
  const params = new URLSearchParams({
    input: query, // Bijv. "Barcelona"
    inputtype: 'textquery', // Zoek op tekst, niet coördinaten
    fields: 'photos,name,formatted_address', // Alleen nodig velden
    key: GOOGLE_MAPS_API_KEY,
  });

  const resp = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`,
    {
      next: { revalidate: 60 * 60 }, // Cache 1 uur (Next.js caching)
    }
  );

  if (resp.ok) {
    const data = await resp.json();
    const photoRef = data.candidates?.[0]?.photos?.[0]?.photo_reference;

    if (photoRef) {
      // Stap 2: Build photo URL
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
    }
  }

  // Fallback naar Unsplash als Google API faalt
  return unsplashFallback(query);
}
```

**Request flow:**

1. Trip wordt aangemaakt met destination (bijv. "Barcelona")
2. Server Action (`createTrip`) roept `getCityPhotoUrl("Barcelona")` aan
3. Functie doet GET request naar Google Places Find Place API
4. Google retourneert place details inclusief `photo_reference`
5. Functie bouwt photo URL met `photo_reference`
6. URL wordt opgeslagen in database (`trips.city_photo_url`)
7. Als API faalt → fallback naar Unsplash

**API endpoints gebruikt:**

1. `GET https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
   - Parameters: `input`, `inputtype`, `fields`, `key`
   - Response: `{ candidates: [{ photos: [{ photo_reference: "..." }] }] }`

2. `GET https://maps.googleapis.com/maps/api/place/photo`
   - Parameters: `maxwidth`, `photo_reference`, `key`
   - Response: Image binary (niet JSON)

**Caching strategie:**

- Next.js `revalidate: 60 * 60` = cache 1 uur
- Database: Photo URL wordt opgeslagen in `trips` tabel
- Voorkomt onnodige API calls voor zelfde bestemming

**Error handling:**

- Try-catch rondom fetch
- Als API faalt → fallback naar Unsplash Source
- Unsplash URL: `https://source.unsplash.com/featured/1600x900/?barcelona+skyline`

**Waar wordt het gebruikt:**

- `src/app/trips/actions.ts` - Tijdens trip creation
- `src/app/trips/page.tsx` - Trip overzicht (toont city photo)
- `src/app/trips/[id]/page.tsx` - Trip detail pagina

### Environment Variables

```env
# Client-side (voor autocomplete component)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Server-side (voor Places API calls)
GOOGLE_MAPS_API_KEY=your_key_here
# Of fallback naar NEXT_PUBLIC_ variant
```

**Best practice:** Gebruik aparte keys voor client/server, maar voor MVP is één key met restricties ook oké.

## 2. GetYourGuide Web Scraping

### Architectuur & Flow

**Waar:** `src/lib/external/getyourguide.ts`

**Hoe het werkt:**

- Web scraping (geen officiële API)
- Gebruikt `cheerio` voor HTML parsing
- Zoekt activiteiten op basis van bestemming en travel style
- Experimenteel: kan breaking changes hebben als GetYourGuide HTML wijzigt

**Code implementatie:**

```typescript
import { load } from 'cheerio';

export async function scrapeGetYourGuideActivities(
  destination: string,
  travelStyle: string = 'mixed',
  maxResults: number = 20
): Promise<GetYourGuideActivity[]> {
  // Stap 1: Map travel style naar search terms
  const searchTerms = getSearchTerms(travelStyle);
  // Bijv. "adventure" → ["adventure", "excursion", "sport"]

  // Stap 2: Build search URL
  const searchUrl = `${GETYOURGUIDE_BASE_URL}/s/?q=${encodeURIComponent(destination)}&searchId=${searchTerms.join(',')}`;

  // Stap 3: Fetch HTML
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0...', // Lijkt op echte browser
    },
  });

  const html = await response.text();
  const $ = load(html); // Cheerio parser

  // Stap 4: Parse HTML en extract activiteiten
  const activities: GetYourGuideActivity[] = [];
  $('.activity-card').each((i, elem) => {
    const title = $(elem).find('.title').text();
    const price = $(elem).find('.price').text();
    // ... meer parsing
    activities.push({ title, price, ... });
  });

  return activities.slice(0, maxResults);
}
```

**Request flow:**

1. Itinerary generation wordt getriggerd
2. `generateItinerary` Server Action roept `scrapeGetYourGuideActivities()` aan
3. Functie doet GET request naar GetYourGuide website (geen API)
4. HTML wordt geparsed met cheerio
5. Activiteiten worden geëxtraheerd uit HTML
6. Resultaten worden toegevoegd aan itinerary

**URL structuur:**

```
https://www.getyourguide.com/s/?q=Barcelona&searchId=adventure,excursion
```

**HTML parsing:**

- Zoekt naar `.activity-card` elementen
- Extraheert: title, description, price, rating, duration, URL
- Gebruikt cheerio selectors (jQuery-achtige syntax)

**Error handling:**

- Als scraping faalt → fallback naar handmatige activiteiten
- Logging voor debugging
- Geen harde crash, app blijft functioneel

**Waar wordt het gebruikt:**

- `src/app/trips/[id]/itinerary/actions.ts` - `generateItinerary()` functie
- Alleen als experimentele feature
- Kan worden uitgeschakeld zonder app te breken

**Limitaties:**

- Geen officiële API → kan breaking changes hebben
- Rate limiting: Geen, maar respecteer GetYourGuide servers
- HTML structuur kan wijzigen → scraping kan breken
- Geen garantie op beschikbaarheid

## 3. Weather API (niet geïmplementeerd)

**Status:** Gepland maar niet geïmplementeerd in MVP

**Waarom in env.example:**

- Voorbereiding voor toekomstige implementatie
- Context coverage test mockt weather 500 errors
- Maar geen echte API calls in codebase

**Geplande implementatie (toekomst):**

- OpenWeatherMap API
- Endpoint: `https://api.openweathermap.org/data/2.5/weather`
- Parameters: `lat`, `lon`, `appid` (API key)
- Response: Weather data (temperature, conditions, etc.)

## Architectuur Overzicht

### Request Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ 1. Gebruiker typt "Barcelona"
       │
       ▼
┌─────────────────────────────────────┐
│ react-google-autocomplete component │
│ (Client-side JavaScript)            │
└──────┬──────────────────────────────┘
       │
       │ 2. Autocomplete request
       │
       ▼
┌─────────────────────────────────────┐
│   Google Places Autocomplete API    │
│   (Direct van browser)              │
└──────┬──────────────────────────────┘
       │
       │ 3. Suggesties terug
       │
       ▼
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ 4. Gebruiker selecteert + submit form
       │
       ▼
┌─────────────────────────────────────┐
│   Next.js Server Action             │
│   (createTrip)                      │
└──────┬──────────────────────────────┘
       │
       │ 5. getCityPhotoUrl("Barcelona")
       │
       ▼
┌─────────────────────────────────────┐
│   Google Places Find Place API      │
│   (Server-side fetch)               │
└──────┬──────────────────────────────┘
       │
       │ 6. Photo reference terug
       │
       ▼
┌─────────────────────────────────────┐
│   Supabase Database                 │
│   (Opslaan trip + photo URL)        │
└─────────────────────────────────────┘
```

### Security & Best Practices

**API Keys:**

- Client-side keys: `NEXT_PUBLIC_*` prefix (zichtbaar in browser)
- Server-side keys: Geen prefix (alleen server)
- Beide staan in `.env.local` (niet in git)
- Google Console restrictions:
  - HTTP referrer: Alleen jouw domain
  - API restrictions: Alleen benodigde APIs enabled

**Rate Limiting:**

- Google Places: $200 free tier per maand
- GetYourGuide: Geen officiële limits, maar respecteer servers
- Onze app: Geen rate limiting geïmplementeerd (voor productie nodig)

**Error Handling:**

- Alle API calls hebben try-catch
- Fallbacks voor kritieke features (Unsplash voor photos)
- Geen hard crashes, app blijft bruikbaar

**Caching:**

- Next.js `revalidate` voor Places API (1 uur)
- Database caching voor photo URLs
- Voorkomt onnodige API calls

## Testing

**Mocking in tests:**

- Jest tests mocken externe API calls
- Playwright tests kunnen echte API's gebruiken (met test keys)
- CI gebruikt test keys of mocks

**Test coverage:**

- `tests/iso25010/context.e2e.ts` - Test error handling (weather 500 mock)
- Unit tests mocken `getCityPhotoUrl` functie
- E2E tests gebruiken echte Google Places (met test key)

## Toekomstige Uitbreidingen

**Gepland:**

- Weather API integratie (OpenWeatherMap)
- Geocoding API voor coördinaten (als nodig)
- Rate limiting middleware
- Retry logic voor failed API calls
- Monitoring voor API usage

**Niet gepland:**

- Andere externe APIs zonder duidelijke use case
- Betaalde APIs zonder free tier

---

**Laatste update:** December 2025
**Auteurs:** Yassine & Sedäle
