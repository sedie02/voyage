# 📡 Voyage API Documentation

Documentatie voor de Voyage Next.js API Routes.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

De meeste endpoints vereisen authenticatie via Supabase JWT tokens.

**Headers:**

```
Authorization: Bearer <supabase_jwt_token>
```

Voor gastmodus: sommige endpoints accepteren invite tokens.

---

## 🗺️ API Endpoints

### Trips

#### `GET /api/trips`

Haal alle trips op voor de ingelogde gebruiker.

**Response:**

```json
{
  "trips": [
    {
      "id": "uuid",
      "title": "Barcelona Citytrip",
      "destination": "Barcelona, Spain",
      "start_date": "2025-05-07",
      "end_date": "2025-05-14",
      "travel_style": "culture",
      "participant_count": 4,
      "created_at": "2025-09-30T10:00:00Z"
    }
  ]
}
```

#### `POST /api/trips`

Maak een nieuwe trip aan.

**Request Body:**

```json
{
  "title": "Barcelona Citytrip",
  "description": "Weekend met vrienden",
  "destination": "Barcelona, Spain",
  "start_date": "2025-05-07",
  "end_date": "2025-05-14",
  "travel_style": "culture"
}
```

**Response:**

```json
{
  "trip": {
    "id": "uuid",
    "title": "Barcelona Citytrip",
    ...
  }
}
```

#### `GET /api/trips/[id]`

Haal specifieke trip details op.

#### `PATCH /api/trips/[id]`

Update trip details.

#### `DELETE /api/trips/[id]`

Verwijder/archiveer trip.

---

### Itinerary

#### `POST /api/trips/[id]/itinerary/generate`

Genereer dagplanning op basis van heuristische regels.

**Request Body:**

```json
{
  "travel_style": "culture",
  "preferences": {
    "pace": "relaxed",
    "interests": ["museums", "food", "architecture"]
  }
}
```

**Response:**

```json
{
  "days": [
    {
      "day_number": 1,
      "date": "2025-05-07",
      "activities": [
        {
          "id": "uuid",
          "title": "Sagrada Familia",
          "day_part": "morning",
          "location_name": "Basílica de la Sagrada Família",
          "location_lat": 41.4036,
          "location_lng": 2.1744,
          "duration_minutes": 120
        }
      ]
    }
  ]
}
```

#### `GET /api/trips/[id]/activities`

Haal alle activiteiten van een trip op.

#### `POST /api/trips/[id]/activities`

Voeg handmatig een activiteit toe.

#### `PATCH /api/activities/[id]`

Update activiteit (tijd, locatie, volgorde).

#### `DELETE /api/activities/[id]`

Verwijder activiteit.

---

### Polls

#### `POST /api/trips/[id]/polls`

Maak een nieuwe poll.

**Request Body:**

```json
{
  "question": "Waar gaan we vanavond eten?",
  "options": [
    { "option_text": "Tapas Bar El Xampanyet" },
    { "option_text": "Restaurant Cervecería Catalana" },
    { "option_text": "Pizza bij Pizzeria Via Romana" }
  ],
  "allow_multiple_votes": false
}
```

#### `GET /api/polls/[id]`

Haal poll details en stemmen op.

**Response:**

```json
{
  "poll": {
    "id": "uuid",
    "question": "Waar gaan we vanavond eten?",
    "status": "active",
    "options": [
      {
        "id": "uuid",
        "option_text": "Tapas Bar El Xampanyet",
        "vote_count": 3
      }
    ],
    "total_votes": 7
  }
}
```

#### `POST /api/polls/[id]/vote`

Stem op een optie.

**Request Body:**

```json
{
  "option_id": "uuid"
}
```

---

### Packing List

#### `GET /api/trips/[id]/packing`

Haal packing list op.

#### `POST /api/trips/[id]/packing`

Voeg item toe aan packing list.

**Request Body:**

```json
{
  "item_name": "Zonnebrandcrème",
  "category": "toiletries",
  "quantity": 1,
  "assigned_to": "participant_uuid"
}
```

#### `PATCH /api/packing/[id]`

Update item (bijv. mark as packed).

**Request Body:**

```json
{
  "is_packed": true
}
```

#### `DELETE /api/packing/[id]`

Verwijder item.

---

### Budget

#### `GET /api/trips/[id]/expenses`

Haal alle uitgaven op.

**Response:**

```json
{
  "expenses": [...],
  "summary": {
    "total": 450.00,
    "currency": "EUR",
    "per_person": 112.50,
    "balances": [
      {
        "participant_id": "uuid",
        "name": "Yassine",
        "balance": -25.00
      }
    ]
  }
}
```

#### `POST /api/trips/[id]/expenses`

Voeg uitgave toe.

**Request Body:**

```json
{
  "title": "Dinner at restaurant",
  "amount": 85.5,
  "currency": "EUR",
  "category": "food",
  "paid_by": "participant_uuid",
  "expense_date": "2025-05-08",
  "split_equally": true
}
```

---

### Invite & Share

#### `POST /api/trips/[id]/invite`

Genereer invite link.

**Request Body:**

```json
{
  "default_role": "viewer",
  "expires_at": "2025-10-30T23:59:59Z",
  "max_uses": 10
}
```

**Response:**

```json
{
  "invite_link": {
    "id": "uuid",
    "token": "abc123...",
    "url": "https://voyage.com/invite/abc123...",
    "expires_at": "2025-10-30T23:59:59Z"
  }
}
```

#### `POST /api/invite/[token]/accept`

Accepteer invite en join trip (gastmodus of logged in).

**Request Body (guest):**

```json
{
  "guest_name": "Emma",
  "guest_email": "emma@example.com"
}
```

#### `DELETE /api/invite/[id]`

Intrekken van invite link.

---

### External Data

#### `GET /api/external/weather`

Haal weersinformatie op.

**Query Params:**

- `location`: "Barcelona,ES"
- `date`: "2025-05-07"

**Response:**

```json
{
  "date": "2025-05-07",
  "location": "Barcelona, ES",
  "weather": {
    "temp": 22,
    "condition": "sunny",
    "icon": "01d",
    "description": "Clear sky"
  }
}
```

#### `GET /api/external/places`

Zoek POI's via Google Places API.

**Query Params:**

- `query`: "museums in Barcelona"
- `location`: "41.3851,2.1734"

**Response:**

```json
{
  "places": [
    {
      "place_id": "ChIJ...",
      "name": "Museu Picasso",
      "address": "Carrer Montcada, 15-23",
      "lat": 41.3851,
      "lng": 2.1734,
      "rating": 4.6,
      "types": ["museum", "point_of_interest"]
    }
  ]
}
```

---

## Error Responses

Alle endpoints kunnen de volgende errors returnen:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "status": 401
  }
}
```

**Error Codes:**

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

- **Authenticated users**: 100 requests/minute
- **Guest users**: 30 requests/minute
- **External API calls**: Zie individual limits in .env

Headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696089600
```

---

## Webhooks (Toekomstig)

Voor realtime updates kan je Supabase Realtime gebruiken.

---

**Laatst bijgewerkt**: 30 September 2025
