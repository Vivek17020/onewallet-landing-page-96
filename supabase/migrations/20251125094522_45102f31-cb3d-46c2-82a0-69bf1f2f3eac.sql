-- Create web_stories table
CREATE TABLE IF NOT EXISTS public.web_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  featured_image TEXT,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  canonical_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  auto_generated BOOLEAN DEFAULT false,
  generation_source TEXT,
  ai_confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create web_stories_queue table for scheduling
CREATE TABLE IF NOT EXISTS public.web_stories_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.web_stories(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_publish BOOLEAN DEFAULT false,
  review_status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_web_stories_slug ON public.web_stories(slug);
CREATE INDEX IF NOT EXISTS idx_web_stories_status ON public.web_stories(status);
CREATE INDEX IF NOT EXISTS idx_web_stories_category ON public.web_stories(category);
CREATE INDEX IF NOT EXISTS idx_web_stories_created_at ON public.web_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_stories_published_at ON public.web_stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_stories_queue_scheduled ON public.web_stories_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_web_stories_queue_status ON public.web_stories_queue(review_status);

-- Enable Row Level Security
ALTER TABLE public.web_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_stories_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for web_stories (public read for published, admin write)
CREATE POLICY "Public can view published web stories" 
ON public.web_stories 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can create web stories" 
ON public.web_stories 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own web stories" 
ON public.web_stories 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own web stories" 
ON public.web_stories 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for web_stories_queue (admin only)
CREATE POLICY "Authenticated users can view queue" 
ON public.web_stories_queue 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage queue" 
ON public.web_stories_queue 
FOR ALL 
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_web_stories_updated_at
  BEFORE UPDATE ON public.web_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule auto-publish cron job (every 30 minutes)
SELECT cron.schedule(
  'invoke-auto-publish-web-story',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://lprwzdiczcoklwjjwhal.supabase.co/functions/v1/auto-publish-web-story',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwcnd6ZGljemNva2x3amp3aGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjI1NTIsImV4cCI6MjA3Mzg5ODU1Mn0.nqxQACFxOFrAMVjVJ1epwh4s9pSewr4yCIjc7DijBE8"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule auto-generate trending web stories (9:00 AM IST = 3:30 AM UTC)
SELECT cron.schedule(
  'auto-generate-trending-webstories-morning',
  '30 3 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://lprwzdiczcoklwjjwhal.supabase.co/functions/v1/auto-generate-trending-webstories',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwcnd6ZGljemNva2x3amp3aGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjI1NTIsImV4cCI6MjA3Mzg5ODU1Mn0.nqxQACFxOFrAMVjVJ1epwh4s9pSewr4yCIjc7DijBE8"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '", "trigger": "cron-morning"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule auto-generate trending web stories (6:00 PM IST = 12:30 PM UTC)
SELECT cron.schedule(
  'auto-generate-trending-webstories-evening',
  '30 12 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://lprwzdiczcoklwjjwhal.supabase.co/functions/v1/auto-generate-trending-webstories',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwcnd6ZGljemNva2x3amp3aGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjI1NTIsImV4cCI6MjA3Mzg5ODU1Mn0.nqxQACFxOFrAMVjVJ1epwh4s9pSewr4yCIjc7DijBE8"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '", "trigger": "cron-evening"}')::jsonb
    ) as request_id;
  $$
);