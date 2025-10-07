-- ================================================
-- VOYAGE DATABASE SETUP - SIMPLIFIED FOR EPIC 1
-- ================================================
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE travel_style AS ENUM (
  'adventure',
  'beach',
  'culture',
  'nature',
  'mixed'
);

CREATE TYPE day_part AS ENUM (
  'morning',
  'afternoon',
  'evening',
  'full_day'
);

CREATE TYPE participant_role AS ENUM (
  'owner',
  'editor',
  'viewer',
  'guest'
);

-- ================================================
-- TABLES
-- ================================================

-- TRIPS TABLE
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
  
  -- Location data (optional for now)
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  destination_country VARCHAR(100),
  destination_city VARCHAR(100),
  
  -- Owner
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIP PARTICIPANTS
CREATE TABLE trip_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role participant_role DEFAULT 'viewer',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(trip_id, user_id)
);

-- DAYS (for itinerary)
CREATE TABLE days (
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
CREATE TABLE activities (
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
CREATE TABLE packing_items (
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
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  category VARCHAR(100),
  
  paid_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- TRIPS POLICIES
-- Users can view trips they are participants of
CREATE POLICY "Users can view trips they participate in"
  ON trips FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trips.id
      AND trip_participants.user_id = auth.uid()
    )
  );

-- Users can create trips
CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update trips they own or are editors of
CREATE POLICY "Users can update trips they own or edit"
  ON trips FOR UPDATE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM trip_participants
      WHERE trip_participants.trip_id = trips.id
      AND trip_participants.user_id = auth.uid()
      AND trip_participants.role IN ('owner', 'editor')
    )
  );

-- Users can delete trips they own
CREATE POLICY "Users can delete trips they own"
  ON trips FOR DELETE
  USING (auth.uid() = owner_id);

-- TRIP PARTICIPANTS POLICIES
CREATE POLICY "Users can view participants of their trips"
  ON trip_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_participants.trip_id
      AND (
        trips.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_participants tp
          WHERE tp.trip_id = trips.id
          AND tp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Trip owners can manage participants"
  ON trip_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_participants.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

-- SIMPLE POLICIES FOR OTHER TABLES (can be refined later)
-- Users can view/modify data for trips they participate in

CREATE POLICY "Users can view days of their trips"
  ON days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = days.trip_id
      AND (
        trips.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage days of trips they edit"
  ON days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trips
      JOIN trip_participants ON trip_participants.trip_id = trips.id
      WHERE trips.id = days.trip_id
      AND trip_participants.user_id = auth.uid()
      AND trip_participants.role IN ('owner', 'editor')
    )
  );

-- Similar policies for activities, packing_items, and expenses
CREATE POLICY "Users can view activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM days
      JOIN trips ON trips.id = days.trip_id
      WHERE days.id = activities.day_id
      AND (
        trips.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage activities"
  ON activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM days
      JOIN trips ON trips.id = days.trip_id
      JOIN trip_participants ON trip_participants.trip_id = trips.id
      WHERE days.id = activities.day_id
      AND trip_participants.user_id = auth.uid()
      AND trip_participants.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can view packing items"
  ON packing_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_items.trip_id
      AND (
        trips.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage packing items"
  ON packing_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trips
      JOIN trip_participants ON trip_participants.trip_id = trips.id
      WHERE trips.id = packing_items.trip_id
      AND trip_participants.user_id = auth.uid()
      AND trip_participants.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can view expenses"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND (
        trips.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage expenses"
  ON expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trips
      JOIN trip_participants ON trip_participants.trip_id = trips.id
      WHERE trips.id = expenses.trip_id
      AND trip_participants.user_id = auth.uid()
      AND trip_participants.role IN ('owner', 'editor')
    )
  );

-- ================================================
-- SAMPLE DATA (for testing)
-- ================================================

-- Insert a sample trip (optional - remove if not needed)
-- Note: Replace 'your-user-id' with an actual user ID from auth.users
/*
INSERT INTO trips (title, destination, start_date, end_date, description, owner_id)
VALUES (
  'Bali Adventure',
  'Bali, Indonesia',
  '2025-06-15',
  '2025-06-30',
  'An amazing adventure exploring the beautiful island of Bali',
  'your-user-id'
);
*/

