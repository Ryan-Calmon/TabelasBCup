-- Remove the old check constraint if it exists
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_status_check;

-- Add the correct check constraint to allow draft, active, and completed
ALTER TABLE public.categories 
ADD CONSTRAINT categories_status_check 
CHECK (status IN ('draft', 'active', 'completed'));