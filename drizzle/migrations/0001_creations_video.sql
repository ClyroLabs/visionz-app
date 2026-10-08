ALTER TABLE public.creations DROP CONSTRAINT IF EXISTS creations_tool_check;
ALTER TABLE public.creations ADD CONSTRAINT creations_tool_check CHECK (tool IN ('synth','jukebox','video'));
CREATE POLICY "Anyone reads published videos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'creations' AND EXISTS (
    SELECT 1 FROM public.creations c WHERE c.status = 'published' AND c.data ->> 'video_path' = storage.objects.name));