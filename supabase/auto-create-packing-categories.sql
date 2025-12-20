-- ================================================
-- AUTO-CREATE PACKING CATEGORIES TRIGGER
-- ================================================
-- Deze trigger maakt automatisch standaard packing categorieën aan
-- wanneer een nieuwe trip wordt aangemaakt.
--
-- Gebruik: Plak dit script in de Supabase SQL Editor en run het.
-- ================================================

-- Zorg dat de packing_categories tabel bestaat
CREATE TABLE IF NOT EXISTS packing_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Zorg dat er geen dubbele categorieën zijn per trip
  UNIQUE(trip_id, name)
);

-- Index voor snellere queries
CREATE INDEX IF NOT EXISTS idx_packing_categories_trip ON packing_categories(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_categories_order ON packing_categories(trip_id, order_index);

-- Functie die automatisch categorieën aanmaakt
-- SECURITY DEFINER zorgt dat de functie met de rechten van de eigenaar draait (bypass RLS)
CREATE OR REPLACE FUNCTION auto_create_packing_categories()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Controleer of er al categorieën zijn voor deze trip (voorkom dubbele aanmaak)
  IF NOT EXISTS (
    SELECT 1 FROM packing_categories WHERE trip_id = NEW.id LIMIT 1
  ) THEN
    -- Maak standaard categorieën aan
    INSERT INTO packing_categories (trip_id, name, order_index)
    VALUES
      (NEW.id, 'Kleding', 0),
      (NEW.id, 'Toiletartikelen', 1),
      (NEW.id, 'Elektronica', 2),
      (NEW.id, 'Documenten', 3),
      (NEW.id, 'Medicijnen', 4),
      (NEW.id, 'Overig', 5)
    ON CONFLICT (trip_id, name) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Maak de trigger aan (na INSERT op trips tabel)
DROP TRIGGER IF EXISTS trigger_auto_create_packing_categories ON trips;
CREATE TRIGGER trigger_auto_create_packing_categories
  AFTER INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_packing_categories();

-- ================================================
-- TEST: Controleer of de trigger werkt
-- ================================================
-- Test de trigger door een test trip aan te maken (verwijder daarna):
-- 
-- INSERT INTO trips (title, destination, start_date, end_date)
-- VALUES ('Test Trip', 'Test', '2025-01-01', '2025-01-02')
-- RETURNING id;
--
-- Check of categorieën zijn aangemaakt:
-- SELECT * FROM packing_categories WHERE trip_id = '<trip-id-hier>';
--
-- Verwijder test trip:
-- DELETE FROM trips WHERE title = 'Test Trip';
-- ================================================

-- ================================================
-- BELANGRIJK: Zorg dat RLS niet blokkeert
-- ================================================
-- Als de trigger niet werkt, kan het zijn dat RLS (Row Level Security) het blokkeert.
-- Run dit commando om RLS uit te schakelen voor packing_categories:
ALTER TABLE packing_categories DISABLE ROW LEVEL SECURITY;

-- Of als je RLS wilt behouden, maak een policy die INSERT toestaat:
-- DROP POLICY IF EXISTS "Allow trigger insert" ON packing_categories;
-- CREATE POLICY "Allow trigger insert" ON packing_categories FOR INSERT WITH CHECK (true);
-- ================================================

-- ================================================
-- OPTIONEEL: Maak categorieën aan voor bestaande trips
-- ================================================
-- Run dit alleen als je ook categorieën wilt voor trips die al bestaan
--
-- INSERT INTO packing_categories (trip_id, name, order_index)
-- SELECT
--   t.id,
--   cat.name,
--   cat.order_index
-- FROM trips t
-- CROSS JOIN (VALUES
--   ('Kleding', 0),
--   ('Toiletartikelen', 1),
--   ('Elektronica', 2),
--   ('Documenten', 3),
--   ('Medicijnen', 4),
--   ('Overig', 5)
-- ) AS cat(name, order_index)
-- WHERE NOT EXISTS (
--   SELECT 1 FROM packing_categories pc WHERE pc.trip_id = t.id
-- )
-- ON CONFLICT (trip_id, name) DO NOTHING;
-- ================================================
