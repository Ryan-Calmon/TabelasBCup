-- Add RLS policies to user_roles table to prevent privilege escalation

-- Only admins can assign roles to users
CREATE POLICY "Only admins can assign roles"
ON user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Prevent role modifications entirely
CREATE POLICY "Roles cannot be updated"
ON user_roles FOR UPDATE
TO authenticated
USING (false);

-- Only admins can revoke roles
CREATE POLICY "Only admins can revoke roles"
ON user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));