CREATE TABLE public.creations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  tool text NOT NULL CHECK (tool IN ('synth','jukebox')),
  title text NOT NULL DEFAULT 'Sem título',
  description text,
  age_rating text NOT NULL DEFAULT 'L' CHECK (age_rating IN ('L','10','12','14','16','18')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','blocked')),
  moderation_note text,
  cover_path text,
  audio_path text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creations TO authenticated;
GRANT ALL ON public.creations TO service_role;
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published creations are public" ON public.creations FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Owners read own creations" ON public.creations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners insert drafts" ON public.creations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'draft');
CREATE POLICY "Owners update own creations" ON public.creations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete own creations" ON public.creations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX creations_user_idx ON public.creations(user_id, created_at DESC);
CREATE INDEX creations_published_idx ON public.creations(tool, created_at DESC) WHERE status = 'published';

-- Only the server (after AI safety check) may set status to published/blocked
CREATE OR REPLACE FUNCTION public.creations_guard_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'draft'
     AND coalesce(current_setting('request.jwt.claim.role', true), auth.role()) <> 'service_role' THEN
    RAISE EXCEPTION 'Publishing requires the safety check';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER creations_guard BEFORE UPDATE ON public.creations FOR EACH ROW EXECUTE FUNCTION public.creations_guard_status();

CREATE POLICY "Creators upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'creations' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Creators read own files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'creations' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Creators delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'creations' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone reads published files" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'creations' AND EXISTS (
    SELECT 1 FROM public.creations c WHERE c.status = 'published'
      AND (c.cover_path = storage.objects.name OR c.audio_path = storage.objects.name
           OR c.data -> 'scene_paths' ? storage.objects.name)));