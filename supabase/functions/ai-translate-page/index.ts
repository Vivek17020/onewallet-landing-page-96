import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranslateRequest {
  content: string
  targetLanguage: string
}

const languageNames: Record<string, string> = {
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'mr': 'Marathi',
  'bn': 'Bengali',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'ur': 'Urdu',
}

async function translateWithAI(content: string, targetLanguage: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

  const languageName = languageNames[targetLanguage] || targetLanguage
  
  const prompt = `Translate the following text from English to ${languageName}. 

CRITICAL RULES:
1. Preserve the exact structure - translate each text segment separated by "---TEXT_SEPARATOR---" 
2. Keep the separators "---TEXT_SEPARATOR---" exactly as they are
3. Maintain the same number of segments
4. Only translate the text content, do not add explanations
5. Keep HTML entities and special characters as they are
6. Preserve line breaks within each segment
7. Return ONLY the translated text with separators

Text to translate:
${content}`

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional translator. Translate content accurately while preserving structure and formatting.' 
        },
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (response.status === 402) {
      throw new Error('Translation quota exceeded. Please add credits to continue.')
    }
    const errorText = await response.text()
    console.error('AI gateway error:', response.status, errorText)
    throw new Error('AI translation service error')
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content, targetLanguage }: TranslateRequest = await req.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!targetLanguage || !languageNames[targetLanguage]) {
      return new Response(
        JSON.stringify({ error: 'Invalid target language' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Translating content to ${targetLanguage}, length: ${content.length}`)

    const translation = await translateWithAI(content, targetLanguage)

    console.log(`Translation completed, result length: ${translation.length}`)

    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in ai-translate-page function:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
