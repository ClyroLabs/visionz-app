DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','moderator','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Biometrics: server-only (service role). No client policies.
CREATE TABLE public.parent_biometrics (
  user_id uuid PRIMARY KEY,
  descriptor float8[] NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.parent_biometrics TO service_role;
ALTER TABLE public.parent_biometrics ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  max_rating text NOT NULL DEFAULT 'L' CHECK (max_rating IN ('L','10','12','14','16','18')),
  daily_minutes int NOT NULL DEFAULT 60 CHECK (daily_minutes BETWEEN 0 AND 600),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.child_profiles TO authenticated;
GRANT ALL ON public.child_profiles TO service_role;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own children read" ON public.child_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own children create safe" ON public.child_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND max_rating IN ('L','10') AND daily_minutes <= 120);
CREATE POLICY "own children delete" ON public.child_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.parental_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  result text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parental_events TO authenticated;
GRANT ALL ON public.parental_events TO service_role;
ALTER TABLE public.parental_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events read" ON public.parental_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  child_profile_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  title_id text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.purchase_requests TO authenticated;
GRANT ALL ON public.purchase_requests TO service_role;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchase read" ON public.purchase_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own purchase create pending" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid(),
  title_ref text NOT NULL,
  title text NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter reads own" ON public.content_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "reporter creates open" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id AND status = 'open');

CREATE TABLE public.moderation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('creation','report')),
  target_id uuid NOT NULL,
  target_title text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approve','block','rating','dismiss')),
  rating text,
  note text,
  moderator_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.moderation_decisions TO authenticated;
GRANT ALL ON public.moderation_decisions TO service_role;
ALTER TABLE public.moderation_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moderators read decisions" ON public.moderation_decisions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'moderator'));

ALTER TABLE public.creations DROP CONSTRAINT IF EXISTS creations_status_check;
ALTER TABLE public.creations ADD CONSTRAINT creations_status_check CHECK (status IN ('draft','review','published','blocked'));
ALTER TABLE public.creations ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
CREATE POLICY "Moderators read all creations" ON public.creations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'moderator'));