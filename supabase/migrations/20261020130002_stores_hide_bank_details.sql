-- Bank details were readable by every signed-in user through the
-- "Active stores are viewable" policy. Column grants keep them out of the API.
REVOKE SELECT ON public.stores FROM anon, authenticated;
GRANT SELECT (
  id, user_id, store_name, store_type, address, city, state, zip_code, country,
  latitude, longitude, opening_time, closing_time, ad_categories, is_active,
  tv_device_id, created_at, updated_at
) ON public.stores TO authenticated;
