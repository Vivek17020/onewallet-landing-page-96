import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Auto-detect and switch language
    const autoSwitchLanguage = () => {
      const savedLang = localStorage.getItem('preferredLanguage');
      const userLang = navigator.language || (navigator as any).userLanguage;
      
      const targetLang = savedLang || (userLang.startsWith('hi') ? 'hi' : 'en');
      
      if (targetLang === 'hi') {
        setTimeout(() => {
          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (select && select.value !== 'hi') {
            select.value = 'hi';
            select.dispatchEvent(new Event('change'));
          }
        }, 1500);
      }
    };

    // Load script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = autoSwitchLanguage;
    } else {
      autoSwitchLanguage();
    }

    // Add styles to hide Google Translate branding and reduce layout shift
    const style = document.createElement('style');
    style.innerHTML = `
      #google_translate_element {
        display: none;
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
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return <div id="google_translate_element" className="hidden" />;
}

export function switchLanguage(lang: 'en' | 'hi') {
  localStorage.setItem('preferredLanguage', lang);
  
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  } else {
    // If translator not ready, reload with preference
    window.location.reload();
  }
}
