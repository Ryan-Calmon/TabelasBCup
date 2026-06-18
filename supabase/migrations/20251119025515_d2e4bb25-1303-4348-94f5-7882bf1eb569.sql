-- Drop the existing check constraint
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_num_teams_check;

-- Add updated check constraint to allow 8, 12, 16, or 20 teams
ALTER TABLE public.categories ADD CONSTRAINT categories_num_teams_check 
  CHECK (num_teams IN (8, 12, 16, 20));