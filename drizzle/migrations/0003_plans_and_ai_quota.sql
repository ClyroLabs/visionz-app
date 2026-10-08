CREATE TYPE public.plan_tier AS ENUM ('free','premium','family','creator_pro');
CREATE TABLE public.subscriptions (user_id uuid PRIMARY KEY, plan public.plan_tier NOT NULL DEFAULT 'free', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription read" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ai_usage (user_id uuid NOT NULL, feature text NOT NULL, period text NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY (user_id, feature, period));
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage read" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Atomic check-and-increment; callable only by the server (service role).
CREATE OR REPLACE FUNCTION public.consume_quota(_uid uuid, _feature text, _period text, _limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF _limit <= 0 THEN RAISE EXCEPTION 'plan_locked'; END IF;
  INSERT INTO public.ai_usage (user_id, feature, period, count) VALUES (_uid, _feature, _period, 1)
  ON CONFLICT (user_id, feature, period) DO UPDATE SET count = public.ai_usage.count + 1 WHERE public.ai_usage.count < _limit
  RETURNING count INTO n;
  IF n IS NULL THEN RAISE EXCEPTION 'quota_exceeded'; END IF;
  RETURN _limit - n;
END $$;
REVOKE ALL ON FUNCTION public.consume_quota(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_quota(uuid, text, text, integer) TO service_role;