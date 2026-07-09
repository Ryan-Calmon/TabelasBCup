ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS display_order INTEGER;

WITH ordered_categories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY tournament_id
      ORDER BY created_at, id
    ) - 1 AS new_display_order
  FROM public.categories
)
UPDATE public.categories AS categories
SET display_order = ordered_categories.new_display_order
FROM ordered_categories
WHERE categories.id = ordered_categories.id
  AND categories.display_order IS NULL;

UPDATE public.categories
SET display_order = 0
WHERE display_order IS NULL;

ALTER TABLE public.categories
ALTER COLUMN display_order SET DEFAULT 0;

ALTER TABLE public.categories
ALTER COLUMN display_order SET NOT NULL;

ALTER TABLE public.categories
ADD CONSTRAINT categories_display_order_check CHECK (display_order >= 0);

CREATE INDEX IF NOT EXISTS categories_tournament_display_order_idx
ON public.categories (tournament_id, display_order, created_at);