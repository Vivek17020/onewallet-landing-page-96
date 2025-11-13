import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  task: 'summary' | 'title' | 'keywords' | 'translation' | 'format-seo-content' | 'humanize-content' | 'seo-optimize' | 'bold-keywords' | 'extract-tags' | 'format-and-extract-all' | 'format-cricket' | 'format-as-news'
  content: string
  title?: string
  targetLanguage?: string
}

async function callLovableAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for content generation and SEO optimization.' },
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded, please try again later.')
    }
    if (response.status === 402) {
      throw new Error('Payment required, please add funds to your Lovable AI workspace.')
    }
    const errorText = await response.text()
    console.error('AI gateway error:', response.status, errorText)
    throw new Error('AI gateway error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { task, content, title, targetLanguage }: AIRequest = await req.json()

    if (!task) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: task' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let result

    console.log(`Processing AI task: ${task} for content length: ${content.length}`)

    switch (task) {
      case 'summary':
        try {
          const summaryPrompt = `Summarize the following content in 2-3 sentences (50-150 words). Be concise and capture the main points:\n\n${content.slice(0, 2000)}`
          const summary = await callLovableAI(summaryPrompt)
          result = { summary: summary.trim() }
        } catch (error) {
          console.error('Summary error:', error)
          throw new Error('Failed to generate summary')
        }
        break

      case 'title':
        try {
          const titlePrompt = `Generate 3 compelling news article titles for the following content. Each title should be 5-15 words, engaging, and newsworthy. Return ONLY the 3 titles, one per line, without numbering:\n\n${content.slice(0, 1000)}`
          const titlesText = await callLovableAI(titlePrompt)
          const titles = titlesText.split('\n').filter(t => t.trim()).slice(0, 3)
          result = { titles }
        } catch (error) {
          console.error('Title generation error:', error)
          throw new Error('Failed to generate titles')
        }
        break

      case 'keywords':
        try {
          const keywordPrompt = `Extract 5-10 important keywords or phrases from this content. Return ONLY the keywords, one per line:\n\n${content.slice(0, 1000)}`
          const keywordsText = await callLovableAI(keywordPrompt)
          const keywords = keywordsText.split('\n').filter(k => k.trim()).slice(0, 10)
          result = { keywords }
        } catch (error) {
          console.error('Keyword extraction error:', error)
          const simpleKeywords = content
            .toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 4)
            .slice(0, 10)
          result = { keywords: simpleKeywords }
        }
        break

      case 'translation':
        try {
          if (targetLanguage === 'hi') {
            const translationPrompt = `Translate the following text from English to Hindi. Maintain the meaning and tone:\n\n${content.slice(0, 2000)}`
            const translation = await callLovableAI(translationPrompt)
            result = { translation: translation.trim() }
          } else {
            throw new Error('Unsupported target language')
          }
        } catch (error) {
          console.error('Translation error:', error)
          throw new Error('Failed to translate content')
        }
        break

      case 'format-seo-content':
        try {
          const prompt = `You are an SEO content editor. Rewrite the following article to sound 100% human and natural.

REQUIREMENTS:
- Keep all original facts intact
- Format properly with HTML headings (<h2> and <h3>)
- Wrap main keywords and important phrases in <strong> tags
- Add internal link suggestions using this format: <a href="[internal-link-placeholder]">keyword</a>
- Add image placeholders as HTML comments: <!-- image: topic_keyword -->
- Use proper paragraph tags (<p>)
- Create bullet lists using <ul> and <li> tags where appropriate
- Make it engaging and easy to read
- Ensure proper structure with introduction, body, and conclusion sections

Return ONLY the formatted HTML content without any explanations.

ORIGINAL CONTENT:
${content}

FORMATTED SEO-OPTIMIZED CONTENT:`

          const formattedContent = await callLovableAI(prompt)
          
          let finalContent = formattedContent.trim()
          
          if (!finalContent.includes('<h2>') && !finalContent.includes('<h3>')) {
            finalContent = `<h2>Introduction</h2>\n\n${finalContent}`
          }
          
          result = { result: finalContent }
        } catch (error) {
          console.error('Content formatting error:', error)
          const basicFormatted = content
            .split('\n\n')
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => {
              if (para.length < 100 && !para.endsWith('.') && !para.endsWith('!') && !para.endsWith('?')) {
                return `<h2>${para}</h2>`
              }
              return `<p>${para}</p>`
            })
            .join('\n\n')
          
          result = { result: `<!-- image: article_hero -->\n\n${basicFormatted}\n\n<!-- image: article_conclusion -->` }
        }
        break

      case 'humanize-content':
        try {
          const humanizePrompt = `You are a professional human writer. Rewrite this article to be 99% human-written and pass Google's AI detection.

CRITICAL REQUIREMENTS:
1. Write like a real journalist - use personal observations, varied vocabulary, unexpected transitions
2. Mix short punchy sentences with longer flowing ones naturally
3. Add subtle imperfections: contractions, occasional informal phrasing, rhetorical questions
4. Use active voice predominantly, include occasional idioms or colloquialisms where appropriate
5. Show personality - add subtle opinions, human perspectives, real-world examples
6. Avoid AI patterns: no lists everywhere, no perfect symmetry, no repetitive structure
7. Keep all HTML tags (<h2>, <h3>, <p>, <strong>, <a>, etc.) exactly as they are
8. Preserve ALL factual information and data
9. Return ONLY the HTML content without markdown code fences or explanations

Write as if you're a real person sharing knowledge, not an AI generating content. Make it natural, engaging, and authentically human.

Content to humanize:
${content}

Humanized HTML (no code fences):`

          const humanized = await callLovableAI(humanizePrompt)
          
          // Strip any code fences that might be present
          let cleaned = humanized.trim()
          cleaned = cleaned.replace(/^```html\n?/i, '')
          cleaned = cleaned.replace(/^```\n?/i, '')
          cleaned = cleaned.replace(/\n?```$/i, '')
          
          result = { result: cleaned }
        } catch (error) {
          console.error('Humanize content error:', error)
          throw new Error('Failed to humanize content')
        }
        break

      case 'seo-optimize':
        try {
          const seoPrompt = `You are an expert SEO specialist optimizing content following Google Search Essentials and GeeksforGeeks standards. Analyze and enhance the following article for maximum search engine visibility and user engagement.

CRITICAL SEO OPTIMIZATION CHECKLIST:

1. **Meta Information**
   - Generate meta title (under 60 chars) with primary keyword naturally placed
   - Generate meta description (under 160 chars) with keyword + clear CTA
   - Add as HTML comments at the top: <!-- META_TITLE: ... --> and <!-- META_DESCRIPTION: ... -->

2. **Keyword Strategy**
   - Identify 3-5 primary and LSI/related keywords from content
   - Ensure main keyword appears in:
     * Title (H1) - naturally, not forced
     * First 100 words of content
     * 1-2 H2 headings
     * Meta description
   - Integrate synonyms and LSI terms naturally for semantic SEO
   - Target keyword density: 1.2-2% (natural, not stuffed)

3. **Content Optimization**
   - Fix passive voice if exceeds 20% - convert to active voice
   - Shorten paragraphs longer than 3 lines for better readability
   - Add internal linking opportunities with format: <a href="[internal-link-placeholder]">anchor text with keyword</a>
   - Include natural phrases like "Also read:", "Learn more about [keyword]", "Explore [related topic]"
   - Ensure content flows naturally - never sacrifice readability for SEO

4. **Heading Hierarchy**
   - Verify proper H1 → H2 → H3 sequence (never skip levels)
   - Ensure H1 contains primary keyword
   - Make H2s descriptive and keyword-rich where natural
   - Add missing H2s for major sections if needed
   - Every H2 should have id attribute for anchor linking

5. **Image Optimization**
   - For every <!-- image: ... --> placeholder, add descriptive alt text below it
   - Format: <!-- image: topic_keyword --> <!-- alt: "Descriptive keyword-rich alt text for accessibility and SEO" -->
   - Alt text should describe the image AND include relevant keywords naturally

6. **Readability Enhancements**
   - Use transition words and phrases
   - Break up long sentences (max 20-25 words per sentence)
   - Use bullet points (<ul>) and numbered lists (<ol>) for scannable content
   - Add <blockquote> for important tips or key takeaways

7. **Schema Markup Preparation**
   - If article has FAQ section, add JSON-LD schema as HTML comment at the end:
   <!-- FAQ_SCHEMA: {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]} -->

8. **Final Quality Check**
   - Keyword density: 1.2-2% for primary keyword
   - Passive voice: <20%
   - Average paragraph length: 2-3 lines
   - Internal linking: 3-5 contextual links
   - All headings properly structured
   - Image alt texts present for all images

TONE & APPROACH:
- Keep it educational, authoritative, and natural
- NEVER sacrifice readability for keyword placement
- Avoid obvious keyword stuffing or repetitive phrases
- Make content genuinely valuable and informative
- Optimize for humans first, search engines second

OUTPUT REQUIREMENTS:
- Return ONLY the optimized HTML content
- Include meta tags as HTML comments at the top
- Include FAQ schema as HTML comment at the bottom (if applicable)
- No code fences, no markdown, no explanations
- Keep all existing HTML structure intact

CONTENT TO OPTIMIZE:
${content}

OPTIMIZED HTML (with meta comments and schema):`

          const optimized = await callLovableAI(seoPrompt)
          
          // Clean any code fences
          let cleaned = optimized.trim()
          cleaned = cleaned.replace(/^```html\n?/i, '')
          cleaned = cleaned.replace(/^```\n?/i, '')
          cleaned = cleaned.replace(/\n?```$/i, '')
          
          result = { result: cleaned }
        } catch (error) {
          console.error('SEO optimize error:', error)
          throw new Error('Failed to optimize content for SEO')
        }
        break

      case 'format-as-news':
        try {
          const newsPrompt = `You are a senior news editor formatting content into a professional journalistic article following NDTV / Times of India / The Hitavada standards.

STRUCTURE REQUIREMENTS:

1. **Headline (H1)** — Short, impactful, under 60 characters
   - Use active voice, present tense where appropriate
   - Include key facts or numbers if impactful
   - Make it click-worthy but factual

2. **Subheadline (H2)** — Quick summary in one line
   - Expand on headline with key context
   - Who, what, when in concise form

3. **Intro Paragraph** — Lead paragraph answering 5 W's
   - Who, What, When, Where, Why
   - Most important information first (inverted pyramid)
   - 2-3 sentences maximum

4. **Body Paragraphs** — 2-4 short paragraphs
   - Each paragraph: 2-3 lines only
   - One idea per paragraph
   - Use active voice throughout
   - Include facts, data, context
   - Chronological or importance-based order

5. **Quote Section (if applicable)**
   - Add relevant quote from authority, official, or data source
   - Format: <blockquote>"Quote text here" - Source Name, Title</blockquote>

6. **Related Section**
   - Add "Also Read:" or "Related Stories:" heading
   - Suggest 2-3 related topics as placeholder links
   - Format: <strong>Also Read:</strong> <a href="[link-placeholder]">Related Story Title</a>

7. **Conclusion** — Wrap-up or next steps
   - 1-2 lines
   - Future implications or ongoing developments
   - Call to action or context for readers

META INFORMATION:
- Generate meta title (under 60 chars) - news headline optimized
- Generate meta description (under 160 chars) - factual summary
- Add as HTML comments: <!-- META_TITLE: ... --> and <!-- META_DESCRIPTION: ... -->

IMAGE OPTIMIZATION:
- For any image references, add: <!-- image: news_topic --> <!-- alt: "Descriptive news image alt text" -->

TONE & STYLE:
- Newsroom tone: neutral, objective, factual
- Active voice (avoid passive constructions)
- Short sentences (15-20 words average)
- No opinion or editorial bias
- Crisp, professional language
- Present tense for recent events, past tense for completed actions

OUTPUT FORMAT:
- Return ONLY the HTML article
- Include meta tags as HTML comments at top
- No code fences, no markdown, no explanations
- Proper HTML structure with semantic tags

CONTENT TO FORMAT:
${content}

FORMATTED NEWS ARTICLE:`

          const formatted = await callLovableAI(newsPrompt)
          
          // Clean any code fences
          let cleaned = formatted.trim()
          cleaned = cleaned.replace(/^```html\n?/i, '')
          cleaned = cleaned.replace(/^```\n?/i, '')
          cleaned = cleaned.replace(/\n?```$/i, '')
          
          result = { result: cleaned }
        } catch (error) {
          console.error('Format as news error:', error)
          throw new Error('Failed to format content as news')
        }
        break

      case 'bold-keywords':
        try {
          const boldPrompt = `Analyze the following HTML article and identify important keywords that should be bolded for emphasis and SEO.

RULES:
1. Bold 5-15 important keywords/phrases throughout using <strong> tags
2. Focus on: main topics, important concepts, technical terms, key benefits
3. Don't over-bold - keep it natural and readable
4. Avoid bolding entire sentences or common words
5. Keep all existing HTML structure intact
6. Don't bold words already inside <strong> or <b> tags
7. Return ONLY the HTML without code fences or explanations

Content:
${content}

HTML with keywords bolded:`

          const bolded = await callLovableAI(boldPrompt)
          result = { result: bolded.trim() }
        } catch (error) {
          console.error('Bold keywords error:', error)
          throw new Error('Failed to bold keywords')
        }
        break

      case 'extract-tags':
        try {
          const textToAnalyze = title ? `${title}\n\n${content}` : content
          const extractPrompt = `Extract 8-15 relevant SEO tags/keywords from the following article content. 

RULES:
1. Focus on main topics, entities, concepts, and themes
2. Use lowercase, single or multi-word phrases
3. Prioritize specific, searchable terms over generic words
4. Return ONLY the tags as a comma-separated list, nothing else
5. No numbering, no explanations, just: tag1, tag2, tag3

Content to analyze:
${textToAnalyze.slice(0, 3000)}

Tags (comma-separated):`

          const tagsText = await callLovableAI(extractPrompt)
          const tags = tagsText
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0 && t.length < 50)
            .slice(0, 15)
          
          result = { result: tags }
        } catch (error) {
          console.error('Extract tags error:', error)
          throw new Error('Failed to extract tags')
        }
        break

      case 'format-and-extract-all':
        try {
          const allInOnePrompt = `You are an expert SEO content editor and content cleaner following GeeksforGeeks editorial standards. Analyze and process the following article content to extract ALL the following information in a single response.

RETURN ONLY A VALID JSON OBJECT with these exact keys (no markdown, no code fences):

{
  "title": "Compelling 5-15 word article title (breaking-news style if it contains scores/events/updates)",
  "excerpt": "Engaging excerpt under 160 characters that captures the main points",
  "meta_title": "SEO-optimized title (max 60 characters, includes important keywords)",
  "meta_description": "SEO-optimized description (150-160 characters) with target keyword",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Sports|Technology|Politics|Jobs|Education|Entertainment|Business|Health|Science|Other",
  "formatted_content": "Full SEO-formatted HTML content with proper structure"
}

CRITICAL SPACING & CLEANING REQUIREMENTS:
1. ALWAYS maintain proper spaces between all words - NEVER merge words together (e.g., fix "Malayalamfilm" to "Malayalam film")
2. Remove ALL duplicate or repeated words, phrases, sentences, or paragraphs (e.g., fix "andand" to "and", remove duplicate sentences)
3. Fix all grammar, punctuation, and sentence structure errors
4. Maintain proper paragraph spacing - every paragraph must be in separate <p> tags with proper closing tags
5. Remove unwanted symbols, broken words, and unnecessary spaces or line breaks
6. Do NOT merge unrelated sentences into one paragraph
7. Each sentence should appear only ONCE - eliminate all redundant content
8. Ensure perfect readability and professional formatting

GEEKSFORGEEKS STRUCTURE TEMPLATE (MANDATORY):

Follow this structure strictly for the formatted_content field:

1. **Intro Paragraph** (2–3 lines)
   - Explain what the article covers and its relevance
   - Format as: <p>Intro text here...</p>

2. **Table of Contents** (auto-generated)
   - Create anchor links for all main <h2> headings
   - Format as:
     <h2>Table of Contents</h2>
     <ul>
       <li><a href="#section-slug">Section Name</a></li>
     </ul>

3. **Main Body**
   - Use <h2> for main topics with id attributes (e.g., <h2 id="section-slug">Section Name</h2>)
   - Use <h3> for subtopics
   - Keep paragraphs SHORT (2–3 lines max in <p> tags)
   - Use <ul> and <ol> for lists or steps
   - Add <blockquote> for notes/tips/important information
   - Bold important terms: <strong>keyword</strong> (10-15 total)
   - Maintain proper spacing between headings and paragraphs
   - Add image placeholders: <!-- image: topic_keyword -->

4. **FAQs Section** (3–5 questions)
   - Format as:
     <h2 id="faqs">Frequently Asked Questions</h2>
     <h3>Q1: Question here?</h3>
     <p>Answer here...</p>

5. **Conclusion** (3–4 lines)
   - Summarize key takeaways
   - Format as:
     <h2 id="conclusion">Conclusion</h2>
     <p>Summary text here...</p>

TONE & QUALITY REQUIREMENTS:
- Write in a reader-first, clear, and educational style (like GeeksforGeeks)
- No duplicate lines or repeated phrases
- Avoid long paragraphs or keyword stuffing
- Use SEO-friendly HTML formatting
- Preserve all original information but restructure for clarity and ranking potential
- Make it visually clean, structured, and ready for direct publishing

METADATA REQUIREMENTS:
- Title: Compelling, newsworthy, 5-15 words. If the article contains scores, results, or breaking updates, use a concise breaking-news style headline
- Excerpt: Under 160 characters, captures main points concisely
- Meta Title: Max 60 chars, includes main keyword
- Meta Description: 150-160 chars, includes keyword naturally
- Tags: 8-15 lowercase, specific, searchable terms (e.g., "india", "pakistan", "asia cup", "cricket", "virat kohli")
- Category: Select the single most relevant category from: Sports, Technology, Politics, Jobs, Education, Entertainment, Business, Health, Science, Other

CONTENT TO PROCESS:
${content.slice(0, 5000)}

JSON OUTPUT (no code fences):`

          const response = await callLovableAI(allInOnePrompt)
          
          // Clean any potential code fences
          let cleaned = response.trim()
          cleaned = cleaned.replace(/^```json\n?/i, '')
          cleaned = cleaned.replace(/^```\n?/i, '')
          cleaned = cleaned.replace(/\n?```$/i, '')
          
          const parsed = JSON.parse(cleaned)
          
          // Post-processing: Fix any remaining spacing issues in formatted_content
          if (parsed.formatted_content) {
            let fixedContent = parsed.formatted_content
            
            // Fix merged words by ensuring space after common HTML tags
            fixedContent = fixedContent.replace(/<\/(p|h[1-6]|li|strong|em|a)>(?=[A-Z])/g, '</$1> ')
            
            // Fix duplicate consecutive words
            fixedContent = fixedContent.replace(/\b(\w+)\s+\1\b/gi, '$1')
            
            // Ensure proper spacing after punctuation
            fixedContent = fixedContent.replace(/([.!?])(?=[A-Za-z])/g, '$1 ')
            
            // Remove multiple consecutive spaces
            fixedContent = fixedContent.replace(/\s{2,}/g, ' ')
            
            // Remove duplicate consecutive sentences (basic check)
            const sentences = fixedContent.split(/(?<=[.!?])\s+/)
            const uniqueSentences = [...new Set(sentences)]
            if (uniqueSentences.length < sentences.length) {
              fixedContent = uniqueSentences.join(' ')
            }
            
            parsed.formatted_content = fixedContent.trim()
          }
          
          result = {
            title: parsed.title || '',
            excerpt: parsed.excerpt || '',
            meta_title: parsed.meta_title || '',
            meta_description: parsed.meta_description || '',
            tags: parsed.tags || [],
            category: parsed.category || '',
            formatted_content: parsed.formatted_content || content
          }
        } catch (error) {
          console.error('Format and extract all error:', error)
          throw new Error('Failed to format and extract all fields')
        }
        break

      case 'format-cricket':
        try {
          const cricketPrompt = `You are a professional cricket journalist and formatting expert. Your goal is to convert raw or jumbled cricket match text into a clean, well-structured, and publication-ready report for a sports news website.

Follow these strict formatting and content guidelines:

1. **Clean Up**
   - Remove all duplicate phrases or repeated words.
   - Fix spacing between words and after punctuation.
   - Remove incomplete or broken sentences.
   - Maintain consistent capitalization for proper nouns (e.g., Australia, England, ICC, Ashleigh Gardner).

2. **Structure**
   Organize every article into the following clear sections, each separated by a blank line:

   **Title**
   - Use a strong, concise headline describing the key outcome.
   - Capitalize properly and avoid all caps.
   - Format as <h1>Title Here</h1>

   **Quick Summary**
   - 4–5 short bullet points summarizing match highlights (scores, performers, milestones).
   - Format as <h2>Quick Summary</h2> followed by <ul><li> items
   - Bold player names and stats: <strong>Player Name – Runs/Wickets (Balls)</strong>

   **Match Narrative**
   - 2–3 paragraphs describing key phases of the match (early collapse, partnerships, turning points).
   - Mention both batting and bowling efforts.
   - Format as <h2>Match Narrative</h2> followed by <p> paragraphs
   - Bold all player names, team names, and key stats

   **Top Performers**
   - Bullet list of top player stats in the format:
     <strong>Player Name – Runs/Wickets (Balls)</strong>
     Example: <strong>Ashleigh Gardner – 104* (73)</strong>, <strong>Annabel Sutherland – 98* (112)</strong>
   - Format as <h2>Top Performers</h2> followed by <ul><li> items

   **Post-Match Context**
   - 1–2 paragraphs explaining how the result affects the standings or tournament scenario.
   - Format as <h2>Post-Match Context</h2> followed by <p> paragraphs

   **Conclusion**
   - End with a strong paragraph summarizing the importance of the win and key takeaways.
   - Can be included in Post-Match Context or as a final paragraph

3. **Formatting Rules**
   - Add **one blank line** between all paragraphs in HTML (proper spacing between tags).
   - Bold player names, team names, and major stats using <strong> tags.
   - Use short, crisp sentences for readability.
   - Avoid extra symbols, brackets, or unnecessary line breaks.
   - Never merge all content into one block of text.
   - Maintain a professional, news-style tone.

4. **Content Accuracy**
   - Retain all factual details from the input (runs, overs, players, match outcomes).
   - Do not invent or modify statistics.

5. **Output**
   - Output clean HTML ready for CMS input.
   - Preserve all paragraph breaks exactly as specified.
   - Return ONLY the formatted HTML without code fences or markdown.

RAW MATCH NOTES:
${content}

FORMATTED CRICKET MATCH REPORT (clean HTML only, no code fences):`

          const formattedReport = await callLovableAI(cricketPrompt)
          
          // Clean any code fences
          let cleaned = formattedReport.trim()
          cleaned = cleaned.replace(/^```html\n?/i, '')
          cleaned = cleaned.replace(/^```\n?/i, '')
          cleaned = cleaned.replace(/\n?```$/i, '')
          
          result = { result: cleaned }
        } catch (error) {
          console.error('Cricket format error:', error)
          throw new Error('Failed to format cricket match report')
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid task type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    console.log(`AI task ${task} completed successfully`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in ai-proxy function:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})