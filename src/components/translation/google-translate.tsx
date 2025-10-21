import { useEffect } from 'react';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Set up initialization function before script loads
    window.googleTranslateElementInit = function() {
      const element = document.getElementById('google_translate_element');
      if (element && window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,te,ml,mr,bn,gu,pa,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // If script already loaded, reinitialize
      window.googleTranslateElementInit();
    }

    // Add styles for floating widget
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
      #google-translate-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        background: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;
      }
      #google-translate-widget:hover {
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
      }
      .dark #google-translate-widget {
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border));
      }
      #google_translate_element {
        display: inline-block;
      }
      #google_translate_element .skiptranslate {
        display: inline-block !important;
      }
      .goog-te-gadget {
        font-family: inherit !important;
        font-size: 14px !important;
        color: inherit !important;
        line-height: 1 !important;
      }
      .goog-te-gadget .goog-te-combo {
        margin: 0 !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        border: 1px solid hsl(var(--border)) !important;
        background: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        font-size: 14px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .goog-te-gadget .goog-te-combo:hover {
        border-color: hsl(var(--primary)) !important;
      }
      .goog-te-gadget .goog-te-combo:focus {
        outline: 2px solid hsl(var(--ring)) !important;
        outline-offset: 2px !important;
      }
      @media (max-width: 640px) {
        #google-translate-widget {
          bottom: 16px;
          right: 16px;
          padding: 12px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div id="google-translate-widget">
      <Languages className="h-5 w-5 text-primary" />
      <div id="google_translate_element" />
    </div>
  );
}
