# Database Migration - Guest Session Support

## Voer deze SQL uit in Supabase SQL Editor

Deze migration voegt guest session support toe, zodat gasten alleen hun eigen trips zien.

## SQL Script

Kopieer en plak dit in de Supabase SQL Editor:

```sql
-- Add guest_session_id column to trips table for guest mode support
-- This allows guests to see only their own trips without authentication

ALTER TABLE trips
ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_guest_session_id ON trips(guest_session_id);

-- Comment
COMMENT ON COLUMN trips.guest_session_id IS 'Session ID for guest users to track their trips without authentication';
```

## Of gebruik het bestand

Je kunt ook het bestand `supabase/add-guest-session.sql` direct in Supabase SQL Editor plakken en uitvoeren.

## Verificatie

Na het uitvoeren, check of de kolom bestaat:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trips' AND column_name = 'guest_session_id';
```

## Hoe het werkt

### Voor Gasten (niet ingelogd):
1. Bij eerste bezoek wordt een unieke `guest_session_id` aangemaakt
2. Deze wordt opgeslagen in een cookie (30 dagen geldig)
3. Alle trips die de gast aanmaakt krijgen deze `guest_session_id`
4. De gast ziet alleen trips met zijn eigen `guest_session_id`

### Voor Ingelogde Users:
1. Trips worden gekoppeld aan hun `created_by` user ID
2. `guest_session_id` blijft `NULL`
3. Gebruiker ziet alleen trips waar `created_by = user.id`

## Test het

1. Open de app in incognito mode
2. Maak een trip aan
3. Refresh de pagina - je trip blijft zichtbaar
4. Open een nieuwe incognito window - je ziet GEEN trips (andere sessie)
5. Login met een account - je ziet andere trips (gekoppeld aan account)
