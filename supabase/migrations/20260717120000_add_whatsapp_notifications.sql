-- Add phone column to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create notifications history table
CREATE TABLE IF NOT EXISTS match_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  time_estimate INTEGER,
  court_number SMALLINT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup by match (used by notification indicators)
CREATE INDEX IF NOT EXISTS idx_match_notifications_match_id ON match_notifications(match_id);

-- RLS: only admins can read/write notifications
ALTER TABLE match_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notifications" ON match_notifications;

CREATE POLICY "Admins can manage notifications"
  ON match_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
