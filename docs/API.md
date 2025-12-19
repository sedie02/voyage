# 🔌 Voyage API Documentatie

Dit document beschrijft alle API endpoints en Server Actions die beschikbaar zijn in Voyage.

## Overzicht

Voyage gebruikt twee soorten "API's":

1. **Next.js Server Actions** - Voor data mutations (create, update, delete)
2. **REST API Routes** - Voor simpele endpoints (zoals health checks)

De meeste functionaliteit gebruikt Server Actions omdat die beter integreren met Next.js en type-safe zijn.

## REST API Routes

### Health Check

**GET** `/api/health`

Check of de applicatie draait.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-14T10:30:00.000Z"
}
```

**Gebruik:**

- Monitoring
- Load balancer health checks
- Deployment verificatie

## Server Actions

Server Actions zijn async functies die je direct vanuit Client Components kunt aanroepen. Ze draaien op de server en hebben toegang tot de database.

### Trips

#### createTrip

**Locatie:** `src/app/trips/actions.ts`

**Functie:**

```typescript
export async function createTrip(formData: FormData): Promise<{ success: boolean; error?: string }>;
```

**Beschrijving:**
Maakt een nieuwe trip aan. Werkt voor zowel ingelogde gebruikers als guest sessions.

**Parameters:**

- `formData` - FormData object met:
  - `title` (string, required)
  - `destination` (string, required)
  - `startDate` (string, ISO date)
  - `endDate` (string, ISO date)
  - `description` (string, optional)
  - `tripType` (string, optional)

**Returns:**

```typescript
{ success: true } | { success: false, error: string }
```

**Voorbeeld:**

```typescript
const result = await createTrip(formData);
if (result.success) {
  router.push(`/trips/${tripId}`);
} else {
  console.error(result.error);
}
```

#### updateTrip

**Locatie:** `src/app/trips/actions.ts`

**Functie:**

```typescript
export async function updateTrip(tripId: string, formData: FormData): Promise<void>;
```

**Beschrijving:**
Update een bestaande trip. Alleen owner of editor kan dit doen.

**Parameters:**

- `tripId` - UUID van de trip
- `formData` - Zelfde structuur als createTrip

**Throws:**

- Error als gebruiker geen rechten heeft
- Error als trip niet bestaat

#### deleteTrip

**Locatie:** `src/app/trips/actions.ts`

**Functie:**

```typescript
export async function deleteTrip(tripId: string): Promise<void>;
```

**Beschrijving:**
Verwijdert een trip. Alleen owner kan dit doen. Verwijdert ook alle gerelateerde data (participants, days, activities, etc.) via CASCADE.

#### archiveTrip

**Locatie:** `src/app/trips/actions.ts`

**Functie:**

```typescript
export async function archiveTrip(tripId: string): Promise<void>;
```

**Beschrijving:**
Archiveert een trip (soft delete). Trip blijft in database maar wordt niet meer getoond in overzicht.

### Trip Participants

#### addParticipant

**Locatie:** `src/app/trips/[id]/participants/actions.ts`

**Functie:**

```typescript
export async function addParticipant(
  tripId: string,
  userId: string,
  role: 'editor' | 'viewer'
): Promise<void>;
```

**Beschrijving:**
Voegt een gebruiker toe aan een trip als participant.

**Parameters:**

- `tripId` - UUID van de trip
- `userId` - UUID van de gebruiker (of null voor guest)
- `role` - 'editor' of 'viewer'

#### removeParticipant

**Locatie:** `src/app/trips/[id]/participants/actions.ts`

**Functie:**

```typescript
export async function removeParticipant(tripId: string, participantId: string): Promise<void>;
```

**Beschrijving:**
Verwijdert een participant uit een trip. Alleen owner kan dit doen.

### Invites

#### createInviteLink

**Locatie:** `src/app/trips/[id]/invite/actions.ts`

**Functie:**

```typescript
export async function createInviteLink(
  tripId: string,
  expiresInDays?: number
): Promise<{ token: string; url: string }>;
```

**Beschrijving:**
Maakt een invite link aan voor een trip. Link kan gedeeld worden met anderen.

**Parameters:**

- `tripId` - UUID van de trip
- `expiresInDays` - Optioneel, standaard 30 dagen

**Returns:**

```typescript
{
  token: string,  // Het invite token
  url: string     // Volledige URL om te delen
}
```

#### acceptInvite

**Locatie:** `src/app/trips/[id]/invite/actions.ts`

**Functie:**

```typescript
export async function acceptInvite(
  token: string
): Promise<{ success: boolean; tripId?: string; error?: string }>;
```

**Beschrijving:**
Accepteert een invite link. Gebruiker wordt toegevoegd als participant aan de trip.

**Parameters:**

- `token` - Het invite token uit de URL

**Returns:**

```typescript
{ success: true, tripId: string } | { success: false, error: string }
```

### Itinerary

#### generateItinerary

**Locatie:** `src/app/trips/[id]/itinerary/actions.ts`

**Functie:**

```typescript
export async function generateItinerary(tripId: string, options?: ItineraryOptions): Promise<void>;
```

**Beschrijving:**
Genereert automatisch een itinerary voor een trip op basis van bestemming en reisstijl. Gebruikt GetYourGuide scraping (experimenteel).

**Parameters:**

- `tripId` - UUID van de trip
- `options` - Optionele configuratie:
  - `travelStyle` - 'avontuur', 'relaxed', 'cultureel', etc.
  - `maxActivitiesPerDay` - Standaard 3

#### addActivitiesToExistingDays

**Locatie:** `src/app/trips/[id]/itinerary/actions.ts`

**Functie:**

```typescript
export async function addActivitiesToExistingDays(
  tripId: string,
  activities: ActivityInput[]
): Promise<void>;
```

**Beschrijving:**
Voegt activiteiten toe aan bestaande dagen in een trip.

**Parameters:**

- `tripId` - UUID van de trip
- `activities` - Array van activiteit objecten:
  ```typescript
  {
    dayId: string,
    title: string,
    description?: string,
    dayPart: 'morning' | 'afternoon' | 'evening',
    startTime?: string,
    locationName?: string
  }[]
  ```

#### deleteItinerary

**Locatie:** `src/app/trips/[id]/itinerary/actions.ts`

**Functie:**

```typescript
export async function deleteItinerary(tripId: string): Promise<void>;
```

**Beschrijving:**
Verwijdert alle dagen en activiteiten van een trip. Alleen owner of editor kan dit doen.

### Packing Lists

#### addPackingItem

**Locatie:** `src/app/packing/actions.ts`

**Functie:**

```typescript
export async function addPackingItem(
  tripId: string,
  itemName: string,
  category?: string
): Promise<void>;
```

**Beschrijving:**
Voegt een item toe aan de packing list van een trip.

#### updatePackingItem

**Locatie:** `src/app/packing/actions.ts`

**Functie:**

```typescript
export async function updatePackingItem(
  itemId: string,
  updates: { isPacked?: boolean; quantity?: number }
): Promise<void>;
```

**Beschrijving:**
Update een packing item (bijv. markeren als ingepakt).

#### deletePackingItem

**Locatie:** `src/app/packing/actions.ts`

**Functie:**

```typescript
export async function deletePackingItem(itemId: string): Promise<void>;
```

**Beschrijving:**
Verwijdert een item uit de packing list.

#### initPackingCategories

**Locatie:** `src/app/packing/init-categories-action.ts`

**Functie:**

```typescript
export async function initPackingCategories(tripId: string): Promise<void>;
```

**Beschrijving:**
Initialiseert standaard packing categorieën voor een trip (bijv. "Kleding", "Electronica", "Toiletspullen").

## Error Handling

Alle Server Actions kunnen errors gooien. Best practice is om ze te wrappen in try-catch:

```typescript
try {
  await createTrip(formData);
  router.push('/trips');
} catch (error) {
  console.error('Failed to create trip:', error);
  // Show error to user
}
```

## Authentication & Authorization

**Row Level Security (RLS):**

- Database queries worden automatisch gefilterd op basis van gebruiker
- Guest sessions hebben beperkte rechten
- Alleen owner kan trip verwijderen
- Editor kan trip bewerken
- Viewer kan alleen lezen

**Guest Sessions:**

- Guest sessions worden opgeslagen in cookies
- UUID wordt gegenereerd met `uuid` package
- Guest kan trips aanmaken en bewerken (met beperkingen)

## Rate Limiting

Momenteel geen rate limiting geïmplementeerd. Voor productie zou dit toegevoegd moeten worden, vooral voor:

- Trip creation
- Invite link generation
- Itinerary generation (gebruikt externe API's)

## External APIs

Voyage gebruikt externe APIs voor bepaalde features:

**Google Places API:**

- Autocomplete voor bestemmingen
- Geocoding voor coördinaten
- Gebruikt in: `src/lib/external/places.ts`

**GetYourGuide (experimenteel):**

- Web scraping voor activiteiten
- Gebruikt in: `src/lib/external/getyourguide.ts`
- **Note:** Dit is experimenteel en kan breaking changes hebben

## Type Safety

Alle Server Actions zijn type-safe dankzij TypeScript. Types worden gegenereerd van Supabase schema met:

```bash
npm run db:generate
```

Dit genereert `src/types/database.types.ts` met alle database types.

---

**Laatste update:** December 2025
**Auteurs:** Yassine & Sedäle
