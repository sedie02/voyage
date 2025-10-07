-- ================================================
-- VOYAGE DATABASE SETUP - SIMPLIFIED (NO AUTH)
-- ================================================
-- Run this in Supabase SQL Editor to get started quickly

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS (with IF NOT EXISTS check)
-- ================================================

-- Drop existing types if you want to recreate them
-- Uncomment these lines if you need to reset:
-- DROP TYPE IF EXISTS travel_style CASCADE;
-- DROP TYPE IF EXISTS day_part CASCADE;
-- DROP TYPE IF EXISTS participant_role CASCADE;

DO $$ BEGIN
  CREATE TYPE travel_style AS ENUM (
    'adventure',
    'beach',
    'culture',
    'nature',
    'mixed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE day_part AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'full_day'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE participant_role AS ENUM (
    'owner',
    'editor',
    'viewer',
    'guest'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ================================================
-- TABLES
-- ================================================

-- TRIPS TABLE
CREATE TABLE IF NOT EXISTS trips (
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

  -- Location data (optional for now)
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  destination_country VARCHAR(100),
  destination_city VARCHAR(100),

  -- Owner (nullable for now - no auth)
  owner_id UUID,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIP PARTICIPANTS
CREATE TABLE IF NOT EXISTS trip_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  role participant_role DEFAULT 'viewer',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(trip_id, user_id)
);

-- DAYS (for itinerary)
CREATE TABLE IF NOT EXISTS days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,

  date DATE NOT NULL,
  day_number INT NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(trip_id, date)
);

-- ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Time
  day_part day_part NOT NULL,
  start_time TIME,
  end_time TIME,

  -- Location
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),

  -- Ordering
  order_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PACKING LIST ITEMS
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,

  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity INT DEFAULT 1,
  is_packed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET/EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,

  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  category VARCHAR(100),

  paid_by_user_id UUID,
  date DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trips_archived ON trips(is_archived);

CREATE INDEX idx_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_participants_user ON trip_participants(user_id);

CREATE INDEX idx_days_trip ON days(trip_id);
CREATE INDEX idx_activities_day ON activities(day_id);
CREATE INDEX idx_packing_trip ON packing_items(trip_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_days_updated_at BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_updated_at BEFORE UPDATE ON packing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- DISABLE RLS FOR TESTING (RE-ENABLE LATER!)
-- ================================================

ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE days DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- ================================================
-- SAMPLE DATA (for testing)
-- ================================================

INSERT INTO trips (title, destination, start_date, end_date, description)
VALUES
(
  'Bali Adventure',
  'Bali, Indonesia',
  '2025-06-15',
  '2025-06-30',
  'An amazing adventure exploring the beautiful island of Bali'
),
(
  'European Summer Tour',
  'Paris, France',
  '2025-08-01',
  '2025-08-21',
  'A grand tour through the cultural capitals of Europe'
);
