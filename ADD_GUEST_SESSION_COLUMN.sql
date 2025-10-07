-- ================================================
-- ADD GUEST SESSION SUPPORT TO TRIPS TABLE
-- ================================================
-- Voer dit uit in Supabase SQL Editor

-- Add guest_session_id column to trips table
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

-- Add index for faster queries on guest_session_id
CREATE INDEX IF NOT EXISTS idx_trips_guest_session_id ON trips(guest_session_id);

-- Add comment
COMMENT ON COLUMN trips.guest_session_id IS 'Session ID for guest users to track their trips without authentication';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'trips'
AND column_name IN ('owner_id', 'guest_session_id')
ORDER BY column_name;
