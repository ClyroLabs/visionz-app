CREATE OR REPLACE FUNCTION public.reported_open_titles()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT DISTINCT title_ref FROM public.content_reports WHERE status = 'open' $$;
REVOKE ALL ON FUNCTION public.reported_open_titles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reported_open_titles() TO anon, authenticated, service_role;