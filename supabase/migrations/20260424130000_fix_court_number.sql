-- Ensure court_number column exists on matches and the partial unique
-- constraint is in place. Idempotent so it is safe to re-run.

alter table public.matches
  add column if not exists court_number smallint;

alter table public.matches
  drop constraint if exists matches_court_number_check;

alter table public.matches
  add constraint matches_court_number_check
  check (court_number is null or court_number between 1 and 4);

-- Drop any leftover artifact from the previous attempt.
drop function if exists public.match_tournament_id(uuid);

drop index if exists public.matches_court_in_progress_unique;

create unique index matches_court_in_progress_unique
  on public.matches (court_number)
  where status = 'in_progress' and court_number is not null;
