-- Add guest_session_id column to trips table for guest mode support
-- This allows guests to see only their own trips without authentication

ALTER TABLE trips
ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_guest_session_id ON trips(guest_session_id);

-- Comment
COMMENT ON COLUMN trips.guest_session_id IS 'Session ID for guest users to track their trips without authentication';
