ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_num_teams_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_num_teams_check CHECK (num_teams IN (8, 9, 10, 12, 14, 15, 16, 17, 18, 20, 24, 25, 32));
