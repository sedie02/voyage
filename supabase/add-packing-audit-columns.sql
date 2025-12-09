-- Migration: Add audit columns to packing_items table for tracking who checked items
-- This allows guests to check/uncheck items and tracks who performed the action

ALTER TABLE packing_items
ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by_guest VARCHAR(255),
ADD COLUMN IF NOT EXISTS taken_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS taken_at TIMESTAMPTZ;

-- Add index for efficient queries on checked items
CREATE INDEX IF NOT EXISTS idx_packing_checked ON packing_items(checked);
CREATE INDEX IF NOT EXISTS idx_packing_checked_by ON packing_items(checked_by);
