-- Add is_public column to categories table
-- When false, the category is only visible to admins (hidden from public view)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;
