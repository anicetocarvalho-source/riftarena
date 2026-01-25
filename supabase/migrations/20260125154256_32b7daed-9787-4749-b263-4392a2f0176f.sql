-- Allow admins to view all user roles (not just their own)
-- The existing policy only lets users see their own roles

-- Add policy for admins to view all profiles (already exists but let's ensure it's comprehensive)
-- Profiles are already viewable by all authenticated users

-- We need a way for admins to query all users with their roles
-- Create a view for admin user management

CREATE OR REPLACE VIEW public.admin_user_view
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.country,
  p.city,
  p.bio,
  p.created_at,
  p.updated_at,
  COALESCE(
    (SELECT array_agg(ur.role) FROM public.user_roles ur WHERE ur.user_id = p.id),
    ARRAY[]::app_role[]
  ) as roles
FROM public.profiles p;

-- Create RLS policy on the view (views inherit from base table policies with security_invoker)
-- Since profiles SELECT is open to authenticated and user_roles has admin policy, this should work

-- Add an index on user_roles for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);