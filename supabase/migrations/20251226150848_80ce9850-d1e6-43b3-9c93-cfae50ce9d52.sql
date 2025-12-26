-- Create generated_images table
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  type TEXT NOT NULL DEFAULT 'generated' CHECK (type IN ('generated', 'filtered')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create image_likes table
CREATE TABLE public.image_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.generated_images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_images
CREATE POLICY "Public images are viewable by everyone"
ON public.generated_images FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own images"
ON public.generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
ON public.generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.generated_images FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for image_likes
CREATE POLICY "Users can view all likes"
ON public.image_likes FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own likes"
ON public.image_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.image_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-images', 'ai-images', true);

-- Storage policies
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ai-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ai-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_images;

-- Function to increment likes
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.generated_images
  SET likes_count = likes_count + 1
  WHERE id = NEW.image_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to decrement likes
CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.generated_images
  SET likes_count = likes_count - 1
  WHERE id = OLD.image_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for like counts
CREATE TRIGGER on_like_added
AFTER INSERT ON public.image_likes
FOR EACH ROW EXECUTE FUNCTION public.increment_likes_count();

CREATE TRIGGER on_like_removed
AFTER DELETE ON public.image_likes
FOR EACH ROW EXECUTE FUNCTION public.decrement_likes_count();