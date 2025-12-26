-- Fix the security definer view issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.public_images;

CREATE VIEW public.public_images 
WITH (security_invoker = on)
AS
SELECT 
  id,
  user_id,
  image_url,
  type,
  is_public,
  likes_count,
  created_at
FROM public.generated_images
WHERE is_public = true;