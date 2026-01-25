-- Create team member history table to track joins and leaves
CREATE TABLE public.team_member_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('joined', 'left', 'removed', 'promoted', 'demoted')),
  role TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_member_history ENABLE ROW LEVEL SECURITY;

-- Anyone can view team history
CREATE POLICY "Anyone can view team history"
ON public.team_member_history
FOR SELECT
USING (true);

-- System can insert history (via triggers/functions)
CREATE POLICY "Captains can insert history"
ON public.team_member_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_member_history.team_id
    AND teams.captain_id = auth.uid()
  )
  OR auth.uid() = user_id
);

-- Create index for faster lookups
CREATE INDEX idx_team_member_history_team_id ON public.team_member_history(team_id);
CREATE INDEX idx_team_member_history_user_id ON public.team_member_history(user_id);

-- Trigger to record when captain is added (on team creation)
CREATE OR REPLACE FUNCTION public.record_captain_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_member_history (team_id, user_id, action, role)
  VALUES (NEW.team_id, NEW.user_id, 'joined', NEW.role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_member_added
AFTER INSERT ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.record_captain_joined();

-- Trigger to record when member leaves/is removed
CREATE OR REPLACE FUNCTION public.record_member_left()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_member_history (team_id, user_id, action, role)
  VALUES (OLD.team_id, OLD.user_id, 
    CASE WHEN OLD.user_id = auth.uid() THEN 'left' ELSE 'removed' END,
    OLD.role);
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_team_member_removed
BEFORE DELETE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.record_member_left();