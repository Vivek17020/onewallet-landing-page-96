-- Note: If you get extension errors, extensions might already be enabled
-- In that case, just run the cron.schedule commands below

-- Try to enable extensions (skip if already enabled)
do $$ 
begin
  create extension if not exists pg_cron with schema extensions;
  create extension if not exists pg_net with schema extensions;
exception when others then
  raise notice 'Extensions already enabled, continuing...';
end $$;

-- Create cron job to auto-generate trending web stories twice daily
-- Runs at 9:00 AM and 6:00 PM IST (3:30 AM and 12:30 PM UTC)
select cron.schedule(
  'auto-generate-trending-webstories-morning',
  '30 3 * * *', -- 9:00 AM IST
  $$
  select
    net.http_post(
      url:='https://tadcyglvsjycpgsjkywj.supabase.co/functions/v1/auto-generate-trending-webstories',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZGN5Z2x2c2p5Y3Bnc2preXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTMwODcsImV4cCI6MjA1MDE2OTA4N30.CmIu_UYHmslXlK_GYZgV4JzSQQmGgU4X0X67JlhVj6g"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '", "trigger": "cron-morning"}')::jsonb
    ) as request_id;
  $$
);

select cron.schedule(
  'auto-generate-trending-webstories-evening',
  '30 12 * * *', -- 6:00 PM IST
  $$
  select
    net.http_post(
      url:='https://tadcyglvsjycpgsjkywj.supabase.co/functions/v1/auto-generate-trending-webstories',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZGN5Z2x2c2p5Y3Bnc2preXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTMwODcsImV4cCI6MjA1MDE2OTA4N30.CmIu_UYHmslXlK_GYZgV4JzSQQmGgU4X0X67JlhVj6g"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '", "trigger": "cron-evening"}')::jsonb
    ) as request_id;
  $$
);

-- View scheduled cron jobs
select * from cron.job where jobname like '%webstories%';
