import React, { useId } from 'react';
import { useInView } from 'react-intersection-observer';
import { ADSENSE_CONFIG } from './ad-network-config';
import { AdSenseAdSlot } from './adsense-ad-slot';

interface AdSlotProps {
  id: string;
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'native';
  className?: string;
  lazy?: boolean;
  // Optional AdSense slot ID override
  adsenseSlot?: string;
}

const AD_DIMENSIONS = {
  rectangle: { width: 300, height: 250 },
  banner: { width: 468, height: 60 },
  leaderboard: { width: 728, height: 90 },
  skyscraper: { width: 160, height: 300 },
  native: { width: 300, height: 250 },
};

// Production domains where ads should display
const PRODUCTION_DOMAINS = ['www.thebulletinbriefs.in', 'thebulletinbriefs.in'];

const isProductionDomain = () => {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_DOMAINS.includes(window.location.hostname);
};

export const AdSlot = ({ id, format = 'rectangle', className, lazy = true, adsenseSlot }: AdSlotProps) => {
  const uniqueId = useId();
  
  const { ref: inViewRef } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const dimensions = AD_DIMENSIONS[format] || AD_DIMENSIONS.rectangle;
  const containerId = `ad-container-${id}-${uniqueId.replace(/:/g, '')}`;
  const isProd = isProductionDomain();

  // Use the provided slot or fall back to config slots
  const slotId = adsenseSlot || ADSENSE_CONFIG.slots.inArticle;

  // If we have a slot ID, use AdSense component
  if (slotId) {
    return (
      <AdSenseAdSlot
        adSlot={slotId}
        format={format === 'leaderboard' ? 'horizontal' : format === 'skyscraper' ? 'vertical' : 'auto'}
        className={className}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    );
  }

  // Placeholder when no ad slot is configured
  return (
    <div
      id={containerId}
      ref={inViewRef}
      className={`ad-slot ${className || ''}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minHeight: dimensions.height,
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
      }}
    >
      <div className="text-muted-foreground text-xs font-medium">
        AdSense Placeholder
      </div>
      <div className="text-muted-foreground text-[10px] opacity-70">
        {isProd ? 'Configure ad slot IDs in ad-network-config.ts' : `Ads display on: ${PRODUCTION_DOMAINS.join(', ')}`}
      </div>
    </div>
  );
};
