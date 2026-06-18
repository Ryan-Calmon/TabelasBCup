-- Add court_number to matches: which physical court a match is being played on.
-- Valid values: 1..4 (we have 4 courts). NULL means "not on any court".
-- A court can host at most ONE in_progress match across the entire tournament
-- (across categories), so we enforce uniqueness with a partial unique index
-- scoped to the tournament via the category relationship.

alter table public.matches
  add column if not exists court_number smallint;

alter table public.matches
  drop constraint if exists matches_court_number_check;

alter table public.matches
  add constraint matches_court_number_check
  check (court_number is null or court_number between 1 and 4);

-- A court is physical: at most one in_progress match per court globally.
drop index if exists public.matches_court_in_progress_unique;

create unique index matches_court_in_progress_unique
  on public.matches (court_number)
  where status = 'in_progress' and court_number is not null;
