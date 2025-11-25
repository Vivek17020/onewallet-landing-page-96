# Web Stories Full Automation Setup

## 🎯 Overview

Your web stories system is now configured for **full automation** - from content generation to publishing, without any manual intervention.

## 🔄 How It Works

### 1. **Auto-Generate Trending Stories** (Twice Daily)
- **Runs at**: 9:00 AM and 6:00 PM IST (every day)
- **Function**: `auto-generate-trending-webstories`
- **What it does**:
  - Searches the web for trending topics in India (news, web3, tech, government jobs)
  - Generates 3 high-quality web stories with AI-generated images
  - Adds them to the queue with `review_status: 'approved'`
  - Schedules publishing throughout the day (0, 4, 8 hours apart)
  - Auto-cleans stories older than 30 days

### 2. **Auto-Publish Stories** (Every 30 Minutes)
- **Runs at**: Every 30 minutes, 24/7
- **Function**: `auto-publish-web-story`
- **What it does**:
  - Finds approved stories scheduled for publishing
  - Updates their status to `published`
  - Triggers Google indexing
  - Removes them from the queue

## 📊 Content Quality Features

### AI-Powered Generation
- Uses **Lovable AI** (Google Gemini 2.5 Flash) for:
  - Trending topic discovery with web search
  - Comprehensive article writing (800-1000 words)
  - Visual story transformation (5-8 slides)
  - Professional image generation (9:16 vertical format)

### SEO Optimization
- Catchy titles (max 60 chars)
- SEO descriptions (max 150 chars)
- Relevant keywords and tags
- Proper categorization
- Automatic indexing on Google

## 🗓️ Publishing Schedule

**Daily Timeline**:
- **9:00 AM**: First generation run → 3 stories created
  - Story 1: Published immediately
  - Story 2: Scheduled for 1:00 PM
  - Story 3: Scheduled for 5:00 PM
  
- **6:00 PM**: Second generation run → 3 stories created
  - Story 4: Published immediately
  - Story 5: Scheduled for 10:00 PM
  - Story 6: Scheduled for 2:00 AM next day

**Result**: ~6 fresh trending web stories per day, evenly distributed

## 🛠️ Setup Instructions

### Step 1: Enable Cron Jobs ✅ (Already Done)
The `auto-publish-web-story` cron is already running.

### Step 2: Add Trending Stories Cron
Run the SQL in `supabase/functions/auto-generate-webstories-cron.sql`:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `auto-generate-webstories-cron.sql`
3. Click "Run"
4. Verify with: `SELECT * FROM cron.job WHERE jobname LIKE '%webstories%';`

You should see 3 cron jobs:
- `auto-generate-trending-webstories-morning` (3:30 UTC / 9:00 AM IST)
- `auto-generate-trending-webstories-evening` (12:30 UTC / 6:00 PM IST)
- `invoke-auto-publish-web-story` (every 30 minutes)

## 📈 Monitoring

### Check Generation Logs
```sql
-- View recent story generation activity
SELECT 
  created_at,
  title,
  category,
  auto_generated,
  generation_source,
  ai_confidence_score
FROM web_stories
WHERE auto_generated = true
ORDER BY created_at DESC
LIMIT 20;
```

### Check Queue Status
```sql
-- View pending publications
SELECT 
  ws.title,
  wq.scheduled_at,
  wq.priority,
  wq.review_status
FROM web_stories_queue wq
JOIN web_stories ws ON ws.id = wq.story_id
WHERE wq.review_status = 'approved'
ORDER BY wq.scheduled_at;
```

### Check Cron Job History
```sql
-- View cron job execution history
SELECT * FROM cron.job_run_details 
WHERE jobname LIKE '%webstories%'
ORDER BY start_time DESC
LIMIT 20;
```

## ⚙️ Configuration

### Adjust Generation Frequency
Edit the cron schedule in `auto-generate-webstories-cron.sql`:
- `'30 3 * * *'` = Daily at 3:30 AM UTC (9:00 AM IST)
- `'30 12 * * *'` = Daily at 12:30 PM UTC (6:00 PM IST)

Common cron patterns:
- Every 6 hours: `'0 */6 * * *'`
- Every 12 hours: `'0 */12 * * *'`
- Once daily at midnight: `'0 0 * * *'`

### Adjust Story Count
In `auto-generate-trending-webstories/index.ts`, line 112:
```typescript
.slice(0, 3) // Change to generate more/fewer stories per run
```

### Adjust Relevance Threshold
In `auto-generate-trending-webstories/index.ts`, line 110:
```typescript
.filter(topic => topic.relevanceScore >= 70) // Increase for higher quality
```

### Adjust Auto-Cleanup Period
In `auto-generate-trending-webstories/index.ts`, line 209:
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// Change 30 to desired number of days
```

## 🎨 Content Categories

Stories are automatically categorized as:
- **news**: Breaking news and current affairs
- **web3**: Blockchain, crypto, DeFi topics
- **technology**: Tech innovations and gadgets
- **government-jobs**: Job notifications and exams
- **education**: Educational news and updates

## 💰 Cost Estimation

### Lovable AI Usage (per day):
- **Trending topic discovery**: 2 requests × 2000 tokens = ~4K tokens
- **Article generation**: 6 stories × 3000 tokens = ~18K tokens
- **Story transformation**: 6 stories × 2000 tokens = ~12K tokens
- **Image generation**: 6 stories × 7 images × 1 image = ~42 images
- **Total**: ~34K tokens + 42 images per day

### Supabase Usage:
- **Edge function invocations**: ~100/day (cron + indexing)
- **Database operations**: Minimal (queries + inserts)
- **Storage**: ~50 MB/month for images

## 🔧 Troubleshooting

### No Stories Being Generated
1. Check Lovable AI credits: Settings → Workspace → Usage
2. Verify cron jobs are running: `SELECT * FROM cron.job_run_details`
3. Check function logs in Supabase Dashboard

### Stories Not Publishing
1. Verify `auto-publish-web-story` cron is active
2. Check queue status: `SELECT * FROM web_stories_queue`
3. Ensure stories have `review_status = 'approved'`

### Poor Story Quality
1. Increase relevance threshold (line 110 in trending function)
2. Adjust AI prompts for better content generation
3. Review and update trending topic search criteria

## 🚀 Advanced Features

### Manual Override
If you need to manually review stories before publishing:
1. Go to Admin → Web Stories → Queue Manager
2. Approve/reject individual stories
3. Publish immediately or keep schedule

### Custom Topic Injection
Modify the system prompt in `auto-generate-trending-webstories/index.ts` to focus on specific topics or add custom requirements.

### Multi-Language Support
Add translation step before publishing by integrating the `translate-content` function.

## ✅ Success Metrics

Track these KPIs to measure automation success:
- **Stories generated per day**: Target 6
- **Publishing consistency**: Stories published at scheduled times
- **Relevance score**: Average > 70
- **Indexing success**: >95% stories indexed within 24 hours
- **Storage efficiency**: Auto-cleanup maintaining <500 stories

---

**Status**: ✅ Fully Automated  
**Last Updated**: 2025-11-25  
**Next Review**: Check weekly for quality and adjust parameters
