-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System/functions can insert notifications (via security definer)
-- We'll use a security definer function to insert notifications

-- Create function to create rank overtake notifications
CREATE OR REPLACE FUNCTION public.check_rank_overtakes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overtaken_user RECORD;
  current_user_profile RECORD;
  game_name TEXT;
BEGIN
  -- Only run if ELO increased
  IF NEW.elo_rating <= OLD.elo_rating THEN
    RETURN NEW;
  END IF;

  -- Get game name
  SELECT name INTO game_name FROM public.games WHERE id = NEW.game_id;

  -- Get current user's profile
  SELECT username INTO current_user_profile FROM public.profiles WHERE id = NEW.user_id;

  -- Find users who were just overtaken (their ELO is now between old and new ELO)
  FOR overtaken_user IN
    SELECT pr.user_id, p.username
    FROM public.player_rankings pr
    JOIN public.profiles p ON p.id = pr.user_id
    WHERE pr.game_id = NEW.game_id
      AND pr.user_id != NEW.user_id
      AND pr.elo_rating >= OLD.elo_rating
      AND pr.elo_rating < NEW.elo_rating
  LOOP
    -- Create notification for overtaken user
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      overtaken_user.user_id,
      'rank_overtake',
      'Foste ultrapassado!',
      current_user_profile.username || ' passou-te no ranking de ' || COALESCE(game_name, 'Unknown'),
      jsonb_build_object(
        'overtaker_id', NEW.user_id,
        'overtaker_name', current_user_profile.username,
        'game_id', NEW.game_id,
        'game_name', game_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for rank overtakes
CREATE TRIGGER on_rank_update_check_overtakes
  AFTER UPDATE OF elo_rating ON public.player_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_rank_overtakes();

-- Create index for faster notification queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;