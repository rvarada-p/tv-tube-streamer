-- Schedules were readable by every signed-in user. Keep them to the store
-- that shows the ad ("Stores can view their schedule") and the sponsor who owns it.
DROP POLICY IF EXISTS "Public read for active schedules" ON public.ad_schedule;

CREATE POLICY "Sponsors can view the schedule of their ads" ON public.ad_schedule
  FOR SELECT TO authenticated
  USING (ad_id IN (
    SELECT ads.id FROM public.ads
    JOIN public.ad_sponsors ON ad_sponsors.id = ads.sponsor_id
    WHERE ad_sponsors.user_id = auth.uid()
  ));
