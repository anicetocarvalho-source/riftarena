
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger function to notify on team invite creation
CREATE OR REPLACE FUNCTION public.notify_team_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  team_name TEXT;
  team_tag TEXT;
BEGIN
  -- Get team info
  SELECT t.name, t.tag INTO team_name, team_tag
  FROM public.teams t
  WHERE t.id = NEW.team_id;

  -- Create notification for invited user
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.user_id,
    'team_invite',
    'Convite de equipa!',
    'Foste convidado para a equipa ' || COALESCE(team_name, 'Unknown') || ' [' || COALESCE(team_tag, '??') || ']',
    jsonb_build_object(
      'team_id', NEW.team_id,
      'team_name', team_name,
      'team_tag', team_tag,
      'invite_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger on team_invites
CREATE TRIGGER on_team_invite_created
AFTER INSERT ON public.team_invites
FOR EACH ROW
EXECUTE FUNCTION public.notify_team_invite();

-- Create trigger function to notify on match completion
CREATE OR REPLACE FUNCTION public.notify_match_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tournament_name TEXT;
  tournament_id_val UUID;
  winner_username TEXT;
  loser_id UUID;
BEGIN
  -- Only trigger when match status changes to 'completed'
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get tournament info
  SELECT t.name, t.id INTO tournament_name, tournament_id_val
  FROM public.tournaments t
  WHERE t.id = NEW.tournament_id;

  -- Get winner username
  SELECT p.username INTO winner_username
  FROM public.profiles p
  WHERE p.id = NEW.winner_id;

  -- Determine loser
  IF NEW.winner_id = NEW.participant1_id THEN
    loser_id := NEW.participant2_id;
  ELSE
    loser_id := NEW.participant1_id;
  END IF;

  -- Notify winner
  IF NEW.winner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.winner_id,
      'match_result',
      'Vitória na partida!',
      'Ganhaste a partida na ronda ' || NEW.round || ' do torneio ' || COALESCE(tournament_name, 'Unknown'),
      jsonb_build_object(
        'tournament_id', tournament_id_val,
        'tournament_name', tournament_name,
        'match_id', NEW.id,
        'result', 'win',
        'round', NEW.round,
        'score', NEW.participant1_score || '-' || NEW.participant2_score
      )
    );
  END IF;

  -- Notify loser
  IF loser_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      loser_id,
      'match_result',
      'Resultado da partida',
      'Perdeste a partida na ronda ' || NEW.round || ' do torneio ' || COALESCE(tournament_name, 'Unknown'),
      jsonb_build_object(
        'tournament_id', tournament_id_val,
        'tournament_name', tournament_name,
        'match_id', NEW.id,
        'result', 'loss',
        'round', NEW.round,
        'score', NEW.participant1_score || '-' || NEW.participant2_score
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on tournament_matches
CREATE TRIGGER on_match_completed
AFTER UPDATE ON public.tournament_matches
FOR EACH ROW
EXECUTE FUNCTION public.notify_match_result();

-- Create trigger function for tournament status changes
CREATE OR REPLACE FUNCTION public.notify_tournament_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reg RECORD;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  -- Only trigger on status changes
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Set notification text based on new status
  CASE NEW.status
    WHEN 'live' THEN
      notif_title := 'Torneio começou!';
      notif_message := 'O torneio ' || NEW.name || ' está agora LIVE!';
    WHEN 'completed' THEN
      notif_title := 'Torneio terminado';
      notif_message := 'O torneio ' || NEW.name || ' foi concluído.';
    WHEN 'cancelled' THEN
      notif_title := 'Torneio cancelado';
      notif_message := 'O torneio ' || NEW.name || ' foi cancelado.';
    ELSE
      RETURN NEW;
  END CASE;

  -- Notify all registered participants
  FOR reg IN
    SELECT DISTINCT user_id FROM public.tournament_registrations
    WHERE tournament_id = NEW.id AND user_id IS NOT NULL AND status = 'confirmed'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      reg.user_id,
      'tournament_update',
      notif_title,
      notif_message,
      jsonb_build_object(
        'tournament_id', NEW.id,
        'tournament_name', NEW.name,
        'new_status', NEW.status
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on tournaments
CREATE TRIGGER on_tournament_status_changed
AFTER UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.notify_tournament_update();
