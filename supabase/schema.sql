-- ================================================
-- VOYAGE DATABASE SCHEMA
-- ================================================
-- Supabase Postgres Database Schema voor Voyage PWA
-- Auteurs: Yassine Messaoudi & Sedäle Hoogvliets
-- Versie: 1.0
-- Datum: 30 September 2025
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS voor location data (optioneel, voor toekomst)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ================================================
-- ENUMS
-- ================================================

-- Travel style types
CREATE TYPE travel_style AS ENUM (
  'adventure',
  'beach',
  'culture',
  'nature',
  'mixed'
);

-- Day parts voor heuristische planning
CREATE TYPE day_part AS ENUM (
  'morning',
  'afternoon',
  'evening',
  'full_day'
);

-- Poll status
CREATE TYPE poll_status AS ENUM (
  'active',
  'closed',
  'archived'
);

-- Trip participant roles
CREATE TYPE participant_role AS ENUM (
  'owner',
  'editor',
  'viewer',
  'guest'
);

-- ================================================
-- TABLES
-- ================================================

-- -----------------------
-- TRIPS
-- -----------------------
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  destination VARCHAR(255) NOT NULL,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Travel preferences
  travel_style travel_style DEFAULT 'mixed',

  -- Location data
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  destination_country VARCHAR(100),
  destination_city VARCHAR(100),

  -- Owner (creator van de trip)
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index voor snellere queries
CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trips_archived ON trips(is_archived);

-- -----------------------
-- TRIP PARTICIPANTS
-- -----------------------
CREATE TABLE trip_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Voor guest mode (zonder account)
  guest_name VARCHAR(100),
  guest_email VARCHAR(255),

  -- Role en permissions
  role participant_role NOT NULL DEFAULT 'viewer',

  -- Invite info
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: of user_id of guest info moet aanwezig zijn
  CONSTRAINT participant_identity CHECK (
    user_id IS NOT NULL OR (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_participants_user ON trip_participants(user_id);

-- -----------------------
-- INVITE LINKS
-- -----------------------
CREATE TABLE invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

  -- Unguessable token (min 32 chars)
  token VARCHAR(64) UNIQUE NOT NULL,

  -- Permissions voor wie via deze link joined
  default_role participant_role DEFAULT 'viewer',

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER, -- NULL = unlimited
  use_count INTEGER DEFAULT 0,

  -- Creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invite_links_trip ON invite_links(trip_id);
CREATE INDEX idx_invite_links_token ON invite_links(token);
CREATE INDEX idx_invite_links_active ON invite_links(is_active);

-- -----------------------
-- DAYS (Dagplanning)
-- -----------------------
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

  -- Dag nummer binnen de trip (1-based)
  day_number INTEGER NOT NULL,

  -- Datum
  date DATE NOT NULL,

  -- Optionele beschrijving
  title VARCHAR(255),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: elke dag uniek binnen een trip
  UNIQUE(trip_id, day_number)
);

-- Indexes
CREATE INDEX idx_days_trip ON days(trip_id);
CREATE INDEX idx_days_date ON days(date);

-- -----------------------
-- ACTIVITIES (POI/Activiteiten)
-- -----------------------
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

  -- Activity info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Tijdslot
  day_part day_part NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,

  -- Location info (POI)
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),

  -- External data
  google_place_id VARCHAR(255),
  poi_category VARCHAR(100), -- bijv. 'museum', 'restaurant', 'park'

  -- Order binnen de dag
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_day ON activities(day_id);
CREATE INDEX idx_activities_trip ON activities(trip_id);
CREATE INDEX idx_activities_order ON activities(day_id, order_index);

-- -----------------------
-- POLLS (Groepsbeslissingen)
-- -----------------------
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id) ON DELETE SET NULL, -- Optioneel gekoppeld aan dag

  -- Poll info
  question VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status
  status poll_status DEFAULT 'active',

  -- Settings
  allow_multiple_votes BOOLEAN DEFAULT FALSE,
  closes_at TIMESTAMPTZ,

  -- Creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_polls_trip ON polls(trip_id);
CREATE INDEX idx_polls_status ON polls(status);

-- -----------------------
-- POLL OPTIONS
-- -----------------------
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

  -- Option content
  option_text VARCHAR(500) NOT NULL,

  -- Optional: koppeling aan activity/POI
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,

  -- Order
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

-- -----------------------
-- POLL VOTES
-- -----------------------
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,

  -- Voter (kan user of participant zijn)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES trip_participants(id) ON DELETE CASCADE,

  -- Metadata
  voted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: één stem per poll per participant (tenzij allow_multiple_votes)
  UNIQUE(poll_id, participant_id)
);

-- Indexes
CREATE INDEX idx_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_votes_option ON poll_votes(option_id);

-- -----------------------
-- PACKING LIST
-- -----------------------
CREATE TABLE packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

  -- Item info
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- bijv. 'clothing', 'toiletries', 'electronics'
  quantity INTEGER DEFAULT 1,

  -- Assignment
  assigned_to UUID REFERENCES trip_participants(id) ON DELETE SET NULL,

  -- Status
  is_packed BOOLEAN DEFAULT FALSE,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_packing_trip ON packing_items(trip_id);
CREATE INDEX idx_packing_assigned ON packing_items(assigned_to);
CREATE INDEX idx_packing_packed ON packing_items(is_packed);

-- -----------------------
-- BUDGET / EXPENSES
-- -----------------------
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,

  -- Expense info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Category
  category VARCHAR(100), -- bijv. 'transport', 'food', 'accommodation'

  -- Wie heeft betaald
  paid_by UUID NOT NULL REFERENCES trip_participants(id) ON DELETE CASCADE,

  -- Split methode (voor MVP: equal split)
  split_equally BOOLEAN DEFAULT TRUE,

  -- Date
  expense_date DATE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_payer ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- -----------------------
-- WEATHER CACHE (optioneel)
-- -----------------------
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Location
  location_key VARCHAR(255) NOT NULL, -- bijv. "Amsterdam,NL"
  date DATE NOT NULL,

  -- Weather data (JSON)
  weather_data JSONB NOT NULL,

  -- Cache metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  UNIQUE(location_key, date)
);

-- Index
CREATE INDEX idx_weather_cache_lookup ON weather_cache(location_key, date);
CREATE INDEX idx_weather_cache_expiry ON weather_cache(expires_at);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS op alle tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES
-- ================================================

-- -----------------------
-- TRIPS POLICIES
-- -----------------------

-- Iedereen kan trips zien waar ze participant van zijn
CREATE POLICY "Users can view trips they participate in"
ON trips FOR SELECT
USING (
  id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
  )
);

-- Alleen owner of editors kunnen trip updaten
CREATE POLICY "Owners and editors can update trips"
ON trips FOR UPDATE
USING (
  id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- Iedereen kan een trip aanmaken
CREATE POLICY "Anyone can create a trip"
ON trips FOR INSERT
WITH CHECK (true);

-- Alleen owner kan trip deleten
CREATE POLICY "Only owner can delete trip"
ON trips FOR DELETE
USING (owner_id = auth.uid());

-- -----------------------
-- PARTICIPANTS POLICIES
-- -----------------------

-- Participants kunnen zichzelf en anderen in hun trip zien
CREATE POLICY "View participants in own trips"
ON trip_participants FOR SELECT
USING (
  trip_id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
  )
);

-- Owner en editors kunnen participants toevoegen
CREATE POLICY "Owners and editors can add participants"
ON trip_participants FOR INSERT
WITH CHECK (
  trip_id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- -----------------------
-- ACTIVITIES POLICIES
-- -----------------------

-- Participants kunnen activities zien van hun trips
CREATE POLICY "View activities in own trips"
ON activities FOR SELECT
USING (
  trip_id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
  )
);

-- Editors kunnen activities toevoegen/wijzigen
CREATE POLICY "Editors can modify activities"
ON activities FOR ALL
USING (
  trip_id IN (
    SELECT trip_id FROM trip_participants
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- (Voeg vergelijkbare policies toe voor andere tables...)

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers voor alle tables met updated_at
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON trip_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_days_updated_at
  BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_updated_at
  BEFORE UPDATE ON packing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VIEWS (voor convenience)
-- ================================================

-- View: Trip overview met participant count
CREATE OR REPLACE VIEW trip_overview AS
SELECT
  t.*,
  COUNT(DISTINCT tp.id) as participant_count,
  COUNT(DISTINCT d.id) as day_count,
  COUNT(DISTINCT a.id) as activity_count
FROM trips t
LEFT JOIN trip_participants tp ON t.id = tp.trip_id
LEFT JOIN days d ON t.id = d.trip_id
LEFT JOIN activities a ON t.id = a.trip_id
GROUP BY t.id;

-- ================================================
-- SEED DATA (optioneel, voor development)
-- ================================================
-- Zie seed.sql

-- ================================================
-- EINDE SCHEMA
-- ================================================
