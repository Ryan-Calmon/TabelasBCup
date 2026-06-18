-- Remove a constraint antiga
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_num_teams_check;

-- Adiciona a nova constraint incluindo 24
ALTER TABLE categories ADD CONSTRAINT categories_num_teams_check 
CHECK (num_teams IN (8, 12, 16, 20, 24));