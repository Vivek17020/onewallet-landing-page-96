import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

interface TranslationCache {
  [key: string]: {
    original: string;
    translated: string;
  };
}

export default function AITranslateWidget() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache] = useState<TranslationCache>({});

  const extractTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and empty text nodes
          if (
            node.parentElement?.tagName === 'SCRIPT' ||
            node.parentElement?.tagName === 'STYLE' ||
            !node.textContent?.trim()
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }
    return textNodes;
  };

  const translatePage = async (targetLang: string) => {
    if (targetLang === 'en') {
      // Restore original content
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    const langName = languages.find(l => l.code === targetLang)?.name || targetLang;
    toast.info(`AI is translating page to ${langName}...`);

    try {
      // Extract all text content from the page
      const textNodes = extractTextNodes(document.body);
      const textsToTranslate = textNodes.map(node => node.textContent || '');
      
      // Filter out empty texts and prepare content
      const contentToTranslate = textsToTranslate
        .filter(text => text.trim().length > 0)
        .join('\n---TEXT_SEPARATOR---\n');

      if (!contentToTranslate) {
        toast.error('No content to translate');
        setIsTranslating(false);
        return;
      }

      // Call edge function to translate
      const { data, error } = await supabase.functions.invoke('ai-translate-page', {
        body: { 
          content: contentToTranslate,
          targetLanguage: targetLang 
        }
      });

      if (error) throw error;

      if (!data?.translation) {
        throw new Error('No translation received');
      }

      // Split the translated content back
      const translatedTexts = data.translation.split('\n---TEXT_SEPARATOR---\n');

      // Replace text nodes with translations
      let translationIndex = 0;
      textNodes.forEach(node => {
        const originalText = node.textContent?.trim();
        if (originalText && translationIndex < translatedTexts.length) {
          const translatedText = translatedTexts[translationIndex].trim();
          if (translatedText) {
            // Store original in cache
            const nodeId = `${node.parentElement?.tagName}_${translationIndex}`;
            if (!translationCache[nodeId]) {
              translationCache[nodeId] = {
                original: originalText,
                translated: translatedText
              };
            }
            node.textContent = translatedText;
          }
          translationIndex++;
        }
      });

      toast.success(`Page translated to ${langName}!`);
      setCurrentLang(targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      toast.error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 animate-in fade-in zoom-in"
            title="AI Translate / एआई अनुवाद"
            disabled={isTranslating}
          >
            <Sparkles className="h-6 w-6" />
            <span className="sr-only">AI Translate</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 max-h-96 overflow-y-auto bg-background border-border shadow-xl z-[10000]"
        >
          <div className="px-3 py-2 text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border">
            <Globe className="h-4 w-4" />
            AI Translate / एआई अनुवाद
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => translatePage(lang.code)}
              disabled={isTranslating}
              className={`cursor-pointer px-3 py-2.5 ${
                currentLang === lang.code
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-accent'
              }`}
            >
              <span className="flex items-center gap-2">
                {currentLang === lang.code && (
                  <span className="text-primary">✓</span>
                )}
                {lang.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentLang !== 'en' && !isTranslating && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in border-2 border-background">
          {currentLang.toUpperCase()}
        </div>
      )}
      
      {isTranslating && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Translating...
        </div>
      )}
    </div>
  );
}
