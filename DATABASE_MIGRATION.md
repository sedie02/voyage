# Database Migration - Guest Session Support

SQL script om guest session support toe te voegen aan de database.

## Uitvoeren

Kopieer en plak dit in de Supabase SQL Editor:

```sql
-- Add guest_session_id column to trips table for guest mode support
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_guest_session_id ON trips(guest_session_id);

COMMENT ON COLUMN trips.guest_session_id IS 'Session ID for guest users to track their trips without authentication';
```

## Of gebruik het bestand

Je kunt ook `supabase/add-guest-session.sql` direct in Supabase SQL Editor plakken en uitvoeren.

## Verificatie

Check of de kolom bestaat:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trips' AND column_name = 'guest_session_id';
```

## Hoe het werkt

**Voor Gasten (niet ingelogd):**

1. Bij eerste bezoek wordt een unieke `guest_session_id` aangemaakt
2. Opgeslagen in cookie (30 dagen geldig)
3. Alle trips die de gast aanmaakt krijgen deze `guest_session_id`
4. Gast ziet alleen trips met zijn eigen `guest_session_id`

**Voor Ingelogde Users:**

1. Trips worden gekoppeld aan hun `created_by` user ID
