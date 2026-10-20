-- Profiles can be edited by their owner, but the account type only by an admin.
CREATE OR REPLACE FUNCTION public.prevent_user_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type IS DISTINCT FROM OLD.user_type
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'user_type can only be changed by an admin';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_user_type_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_type_change();
