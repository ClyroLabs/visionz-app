CREATE TABLE public.wallet_links (user_id uuid PRIMARY KEY, address text NOT NULL UNIQUE, verified_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.wallet_links TO authenticated;
GRANT ALL ON public.wallet_links TO service_role;
ALTER TABLE public.wallet_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallet link read" ON public.wallet_links FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.watch_sessions (user_id uuid NOT NULL, title_ref text NOT NULL, day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date, seconds integer NOT NULL DEFAULT 0, last_report timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, title_ref, day));
GRANT SELECT ON public.watch_sessions TO authenticated;
GRANT ALL ON public.watch_sessions TO service_role;
ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watch read" ON public.watch_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.vzn_rewards (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, claim_key text NOT NULL UNIQUE, source text NOT NULL, label text NOT NULL, amount numeric NOT NULL, address text NOT NULL, status text NOT NULL DEFAULT 'pending', signature text, error text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.vzn_rewards TO authenticated;
GRANT ALL ON public.vzn_rewards TO service_role;
ALTER TABLE public.vzn_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rewards read" ON public.vzn_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX vzn_rewards_user_day ON public.vzn_rewards (user_id, created_at);