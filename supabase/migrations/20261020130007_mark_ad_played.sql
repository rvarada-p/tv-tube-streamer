-- The TV records plays through this function: it may set played_at on its own
-- store's rows and nothing else (a plain UPDATE policy would allow more).
CREATE OR REPLACE FUNCTION public.mark_ad_played(_schedule_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.ad_schedule
  SET played_at = now()
  WHERE id = _schedule_id
    AND played_at IS NULL
    AND store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.mark_ad_played(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_ad_played(UUID) TO authenticated;
