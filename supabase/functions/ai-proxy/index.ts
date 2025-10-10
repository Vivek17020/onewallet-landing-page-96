import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  task: 'summary' | 'title' | 'keywords' | 'translation' | 'format-seo-content' | 'humanize-content' | 'seo-optimize' | 'bold-keywords'
  content: string
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
    const { task, content, targetLanguage }: AIRequest = await req.json()

    if (!content || !task) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: task and content' }),
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
          const humanizePrompt = `Rewrite the following article content to make it sound more natural, human, and engaging while preserving all information.

RULES:
1. Make it conversational and engaging while maintaining professionalism
2. Vary sentence structure and length for natural flow
3. Remove robotic or AI-like phrasing
4. Add personality and human touch
5. Keep all HTML tags and structure intact
6. Preserve all factual information
7. Return ONLY the HTML without code fences or explanations

Content to humanize:
${content}

Humanized HTML:`

          const humanized = await callLovableAI(humanizePrompt)
          result = { result: humanized.trim() }
        } catch (error) {
          console.error('Humanize content error:', error)
          throw new Error('Failed to humanize content')
        }
        break

      case 'seo-optimize':
        try {
          const seoPrompt = `Analyze the following article and optimize it for SEO by replacing weak words/phrases with stronger, more searchable alternatives.

RULES:
1. Replace generic terms with specific, keyword-rich alternatives
2. Improve readability score by simplifying complex sentences
3. Add relevant LSI keywords naturally
4. Optimize heading hierarchy and keyword placement
5. Keep all HTML structure and tags intact
6. Maintain the original meaning and flow
7. Return ONLY the HTML without code fences or explanations

Content to optimize:
${content}

SEO-optimized HTML:`

          const optimized = await callLovableAI(seoPrompt)
          result = { result: optimized.trim() }
        } catch (error) {
          console.error('SEO optimize error:', error)
          throw new Error('Failed to optimize content for SEO')
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