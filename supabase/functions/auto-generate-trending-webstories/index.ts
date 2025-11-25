import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';

interface TrendingTopic {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  relevanceScore: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting trending topic discovery...');

    // Get trending topics using Lovable AI with search
    const trendingResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a trending topic analyst for a news platform focusing on:
- Indian news and current affairs
- Web3, blockchain, crypto
- Technology and innovation
- Government jobs and education
- Breaking news

Search for and identify 5 trending topics from the last 24 hours that would make excellent web stories.
Focus on topics that:
1. Are actively trending RIGHT NOW
2. Have visual story potential (images, graphics)
3. Are relevant to Indian audience
4. Can be explained in 5-8 slides

Return ONLY valid JSON in this exact format:
{
  "topics": [
    {
      "title": "Topic headline (max 60 chars)",
      "description": "Brief summary (max 150 chars)",
      "category": "news|web3|technology|government-jobs|education",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "relevanceScore": 85
    }
  ]
}`
          },
          {
            role: 'user',
            content: 'Search the web for trending topics in India right now and identify the top 5 that would make great web stories. Focus on breaking news, viral stories, and important developments.'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!trendingResponse.ok) {
      throw new Error(`AI trending search failed: ${trendingResponse.status}`);
    }

    const trendingData = await trendingResponse.json();
    const aiContent = trendingData.choices[0].message.content;
    
    let topics: TrendingTopic[];
    try {
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      const parsed = JSON.parse(jsonStr);
      topics = parsed.topics || [];
    } catch (e) {
      console.error('❌ Failed to parse trending topics:', aiContent);
      throw new Error('Failed to parse AI response');
    }

    console.log(`✅ Found ${topics.length} trending topics`);

    // Check existing stories to avoid duplicates
    const { data: existingStories } = await supabase
      .from('web_stories')
      .select('title, slug')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const existingTitles = new Set(existingStories?.map(s => s.title.toLowerCase()) || []);

    // Generate web stories for each trending topic
    const results = await Promise.all(
      topics
        .filter(topic => topic.relevanceScore >= 70) // Only high relevance
        .filter(topic => !existingTitles.has(topic.title.toLowerCase())) // Avoid duplicates
        .slice(0, 3) // Limit to top 3 per run
        .map(async (topic, index) => {
          try {
            console.log(`📝 Generating story for: ${topic.title}`);
            
            // Generate detailed content for the topic
            const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  {
                    role: 'user',
                    content: `Research and write a comprehensive article about: "${topic.title}"
                    
Topic: ${topic.description}
Category: ${topic.category}
Keywords: ${topic.keywords.join(', ')}

Write a detailed 800-1000 word article with:
- Clear introduction explaining the topic
- Key facts and developments
- Impact and significance
- Expert perspectives
- Future implications
- Conclusion

Make it informative, engaging, and suitable for a general Indian audience.`
                  }
                ],
                temperature: 0.7,
                max_tokens: 3000
              }),
            });

            if (!contentResponse.ok) {
              console.warn(`⚠️ Content generation failed for ${topic.title}`);
              return { success: false, topic: topic.title, error: 'Content generation failed' };
            }

            const contentData = await contentResponse.json();
            const articleContent = contentData.choices[0].message.content;

            // Generate web story from the content
            const { data: storyData, error: storyError } = await supabase.functions.invoke('generate-web-story', {
              body: {
                content: articleContent,
                title: topic.title,
                category: topic.category,
                autoPublish: false // We'll schedule it
              }
            });

            if (storyError) {
              console.error(`❌ Story generation failed for ${topic.title}:`, storyError);
              return { success: false, topic: topic.title, error: storyError.message };
            }

            // Schedule for publishing (stagger throughout the day)
            const hoursDelay = index * 4; // 0, 4, 8 hours apart
            const scheduledTime = new Date(Date.now() + hoursDelay * 60 * 60 * 1000);

            const { error: queueError } = await supabase
              .from('web_stories_queue')
              .insert({
                story_id: storyData.story.id,
                scheduled_at: scheduledTime.toISOString(),
                auto_publish: true,
                review_status: 'approved',
                priority: topic.relevanceScore,
                notes: `Auto-generated from trending topic: ${topic.title}`
              });

            if (queueError) {
              console.warn(`⚠️ Failed to schedule story ${topic.title}:`, queueError);
            }

            console.log(`✅ Created and scheduled story: ${topic.title} for ${scheduledTime.toISOString()}`);
            return { 
              success: true, 
              topic: topic.title, 
              storyId: storyData.story.id,
              scheduledFor: scheduledTime.toISOString()
            };

          } catch (error: any) {
            console.error(`❌ Error processing topic ${topic.title}:`, error);
            return { success: false, topic: topic.title, error: error.message };
          }
        })
    );

    // Clean up old web stories (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: oldStories } = await supabase
      .from('web_stories')
      .select('id, title')
      .eq('auto_generated', true)
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (oldStories && oldStories.length > 0) {
      console.log(`🗑️ Deleting ${oldStories.length} old auto-generated stories...`);
      
      const { error: deleteError } = await supabase
        .from('web_stories')
        .delete()
        .in('id', oldStories.map(s => s.id));

      if (deleteError) {
        console.warn('⚠️ Failed to delete old stories:', deleteError);
      } else {
        console.log(`✅ Deleted ${oldStories.length} old stories`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`✅ Automation complete: ${successCount} stories created, ${failedCount} failed, ${oldStories?.length || 0} old stories deleted`);

    return new Response(
      JSON.stringify({
        success: true,
        topicsFound: topics.length,
        storiesCreated: successCount,
        storiesFailed: failedCount,
        oldStoriesDeleted: oldStories?.length || 0,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in auto-generate-trending-webstories:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
