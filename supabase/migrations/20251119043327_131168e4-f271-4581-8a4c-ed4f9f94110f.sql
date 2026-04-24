-- Add two new columns to properly track winner/loser progression for each team
ALTER TABLE public.matches 
ADD COLUMN takes_winner_match1 boolean,
ADD COLUMN takes_winner_match2 boolean;

-- Remove the old ambiguous column
ALTER TABLE public.matches 
DROP COLUMN takes_winner_from;