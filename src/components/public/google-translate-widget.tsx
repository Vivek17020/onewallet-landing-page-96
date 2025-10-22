import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';

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
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

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
      if (initializedRef.current) return;
      
      const container = document.getElementById('google_translate_element');
      if (!container) {
        console.error('Google Translate container not found');
        return;
      }
      
      try {
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
      } catch (error) {
        console.error('Google Translate initialization error:', error);
      }
    };

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => console.error('Failed to load Google Translate script');
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }

    return () => {
      initializedRef.current = false;
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    
    const waitForSelect = (attempts = 0) => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      
      if (select) {
        if (langCode === 'en') {
          select.value = '';
        } else {
          select.value = langCode;
        }
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
          if (select.value !== langCode && langCode !== 'en') {
            select.value = langCode;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 100);
      } else if (attempts < 10) {
        setTimeout(() => waitForSelect(attempts + 1), 500);
      } else {
        console.error('Google Translate select element not found after multiple attempts');
      }
    };
    
    waitForSelect();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />

      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
            >
              <Languages className="h-6 w-6" />
              <span className="sr-only">Select Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-sm border-border"
          >
            <div className="px-2 py-1.5 text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Select Language
            </div>
            <div className="border-t border-border my-1" />
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`cursor-pointer ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : ''
                }`}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {currentLang !== 'en' && (
          <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg animate-in fade-in zoom-in">
            {currentLang.toUpperCase()}
          </div>
        )}
      </div>
    </>
  );
}
