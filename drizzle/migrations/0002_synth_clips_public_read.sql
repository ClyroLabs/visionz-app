DROP POLICY IF EXISTS "Anyone reads published files" ON storage.objects;
CREATE POLICY "Anyone reads published files" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'creations' AND EXISTS (
    SELECT 1 FROM public.creations c WHERE c.status = 'published'
      AND (c.cover_path = storage.objects.name OR c.audio_path = storage.objects.name
           OR c.data -> 'scene_paths' ? storage.objects.name
           OR c.data -> 'scene_clips' ? storage.objects.name
           OR c.data ->> 'video_path' = storage.objects.name)));