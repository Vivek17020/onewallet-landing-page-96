import React, { useEffect, useId } from 'react';
import { useInView } from 'react-intersection-observer';

interface AdSenseAdSlotProps {
  adClient?: string;
  adSlot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

// Production domains where ads should display
const PRODUCTION_DOMAINS = ['www.thebulletinbriefs.in', 'thebulletinbriefs.in'];

const isProductionDomain = () => {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_DOMAINS.includes(window.location.hostname);
};

// Default AdSense publisher ID
const DEFAULT_AD_CLIENT = 'ca-pub-8705825692661561';

export const AdSenseAdSlot = ({
  adClient = DEFAULT_AD_CLIENT,
  adSlot,
  format = 'auto',
  className = '',
  style,
  responsive = true,
}: AdSenseAdSlotProps) => {
  const uniqueId = useId();
  const containerId = `adsense-${adSlot}-${uniqueId.replace(/:/g, '')}`;
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const isProd = isProductionDomain();

  useEffect(() => {
    if (!isProd || !inView) return;

    // Load AdSense script if not already loaded
    const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Push the ad
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.warn('AdSense push error:', e);
    }
  }, [isProd, inView, adClient]);

  // Non-production placeholder
  if (!isProd) {
    return (
      <div
        ref={ref}
        id={containerId}
        className={`adsense-slot ${className}`}
        style={{
          minHeight: 100,
          maxWidth: '100%',
          backgroundColor: 'hsl(var(--muted))',
          border: '1px dashed hsl(var(--border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          margin: '16px auto',
          flexDirection: 'column',
          gap: '4px',
          ...style,
        }}
      >
        <div className="text-muted-foreground text-xs font-medium">AdSense Placeholder</div>
        <div className="text-muted-foreground text-[10px] opacity-70">
          Slot: {adSlot}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`adsense-container ${className}`}>
      {inView && (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            textAlign: 'center',
            ...style,
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      )}
    </div>
  );
};
