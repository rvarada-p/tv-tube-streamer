-- Sign-up metadata comes from the browser: accept only the two self-serve types.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE
      WHEN NEW.raw_user_meta_data ->> 'user_type' IN ('store', 'ad_sponsor')
        THEN (NEW.raw_user_meta_data ->> 'user_type')::user_type
      ELSE 'store'
    END
  );
  RETURN NEW;
END;
$$;
