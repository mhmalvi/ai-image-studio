-- Fix security issue: Update image_likes RLS policy to restrict viewing
-- Users should only see their own likes OR likes on public images
DROP POLICY IF EXISTS "Users can view all likes" ON public.image_likes;

CREATE POLICY "Users can view likes appropriately"
ON public.image_likes
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM public.generated_images 
    WHERE generated_images.id = image_likes.image_id 
    AND generated_images.is_public = true
  ))
);

-- Create a view for public images that excludes sensitive data (prompt, style)
CREATE OR REPLACE VIEW public.public_images AS
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