-- Update the check constraint to allow 14 teams
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_num_teams_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_num_teams_check CHECK (num_teams IN (8, 9, 12, 14, 16, 20, 24));