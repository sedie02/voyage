-- Add guest_session_id to trip_participants so guest invitees can be linked to a session
ALTER TABLE IF EXISTS trip_participants
  ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_participants_guest_session ON trip_participants(guest_session_id);

COMMENT ON COLUMN trip_participants.guest_session_id IS 'Guest session id for guest invitees (matches cookie guest_session_id)';
