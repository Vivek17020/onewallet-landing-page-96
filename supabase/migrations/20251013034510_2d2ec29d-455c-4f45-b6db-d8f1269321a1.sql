-- Add missing columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}';

-- Add missing columns to profiles table for author information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_image_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create a view for public profiles (alias for backward compatibility)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  email,
  display_name,
  username,
  full_name,
  avatar_url,
  author_image_url,
  job_title,
  author_bio,
  bio,
  role,
  twitter_url,
  linkedin_url,
  website_url,
  created_at,
  updated_at
FROM public.profiles;

-- Create function to get safe author profile
CREATE OR REPLACE FUNCTION public.get_safe_author_profile(author_uuid UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  job_title TEXT,
  author_bio TEXT,
  author_image_url TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.job_title,
    p.author_bio,
    p.author_image_url,
    p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = author_uuid;
END;
$$;

-- Create function to get public comments
CREATE OR REPLACE FUNCTION public.get_public_comments(article_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  author_name TEXT,
  author_email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  article_id UUID,
  user_id UUID,
  is_approved BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.author_name,
    c.author_email,
    c.created_at,
    c.updated_at,
    c.article_id,
    c.user_id,
    c.is_approved
  FROM public.comments c
  WHERE c.article_id = article_uuid 
    AND c.is_approved = true
  ORDER BY c.created_at DESC;
END;
$$;

-- Update existing articles to have default values for new columns
UPDATE public.articles 
SET author = COALESCE(author, 'TheBulletinBriefs Team')
WHERE author IS NULL;

UPDATE public.articles 
SET reading_time = COALESCE(reading_time, 5)
WHERE reading_time IS NULL;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_safe_author_profile(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_comments(UUID) TO anon, authenticated;