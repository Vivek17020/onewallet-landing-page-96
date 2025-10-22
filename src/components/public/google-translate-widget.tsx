import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

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

export default function GoogleTranslateWidget() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    console.log('Initializing Google Translate widget...');

    const styleId = 'google-translate-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        #google_translate_element {
          display: none !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-balloon-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .skiptranslate {
          display: none !important;
        }
        iframe.skiptranslate {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    window.googleTranslateElementInit = () => {
      console.log('googleTranslateElementInit called');
      
      if (initializedRef.current) {
        console.log('Already initialized, skipping');
        return;
      }
      
      const container = document.getElementById('google_translate_element');
      if (!container) {
        console.error('Google Translate container not found');
        return;
      }
      
      try {
        console.log('Creating TranslateElement...');
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,te,ml,mr,bn,gu,pa,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
        initializedRef.current = true;
        setIsReady(true);
        console.log('Google Translate initialized successfully');
        
        // Wait for the select element to be ready
        setTimeout(() => {
          const select = document.querySelector('.goog-te-combo');
          if (select) {
            console.log('Google Translate select element found');
          } else {
            console.warn('Google Translate select element not found');
          }
        }, 1000);
      } catch (error) {
        console.error('Google Translate initialization error:', error);
        toast.error('Translation widget failed to load');
      }
    };

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      console.log('Loading Google Translate script...');
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => console.log('Google Translate script loaded');
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
        toast.error('Failed to load translation service');
      };
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      console.log('Google Translate already loaded, initializing...');
      window.googleTranslateElementInit();
    }

    return () => {
      initializedRef.current = false;
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    console.log('Attempting to change language to:', langCode);
    setCurrentLang(langCode);
    
    if (!isReady) {
      console.warn('Google Translate not ready yet');
      toast.error('Translation service is still loading, please wait...');
      return;
    }
    
    const waitForSelect = (attempts = 0) => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      
      if (select) {
        console.log('Found select element, changing language...');
        const oldValue = select.value;
        
        if (langCode === 'en') {
          select.value = '';
        } else {
          select.value = langCode;
        }
        
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log(`Language changed from ${oldValue} to ${select.value}`);
        
        const langName = languages.find(l => l.code === langCode)?.name || langCode;
        toast.success(`Translating to ${langName}...`);
        
        // Double-check the value was set
        setTimeout(() => {
          if (select.value !== langCode && langCode !== 'en') {
            console.log('Retrying language change...');
            select.value = langCode;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 100);
      } else if (attempts < 20) {
        console.log(`Select element not found, attempt ${attempts + 1}/20`);
        setTimeout(() => waitForSelect(attempts + 1), 300);
      } else {
        console.error('Google Translate select element not found after 20 attempts');
        toast.error('Translation failed. Please refresh the page.');
      }
    };
    
    waitForSelect();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />

      <div className="fixed bottom-6 right-6 z-[9999]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 animate-in fade-in zoom-in"
              title="Select Language / भाषा चुनें"
            >
              <Languages className="h-6 w-6" />
              <span className="sr-only">Select Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 max-h-96 overflow-y-auto bg-background border-border shadow-xl z-[10000]"
          >
            <div className="px-3 py-2 text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border">
              <Globe className="h-4 w-4" />
              Select Language / भाषा चुनें
            </div>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
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

        {currentLang !== 'en' && (
          <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in border-2 border-background">
            {currentLang.toUpperCase()}
          </div>
        )}
        
        {!isReady && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
            Loading...
          </div>
        )}
      </div>
    </>
  );
}
