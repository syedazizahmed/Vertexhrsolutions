import { useEffect, useRef } from 'react';
import { GOOGLE_ADS_CLIENT } from '@/config/site';

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  style?: React.CSSProperties;
}

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export default function GoogleAd({ slot, format = 'auto', style }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!GOOGLE_ADS_CLIENT || !slot || pushed.current) return;
    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  if (!GOOGLE_ADS_CLIENT || !slot) {
    return (
      <div className="ad-slot" style={{ height: 90, ...style }}>
        Advertisement
      </div>
    );
  }

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={GOOGLE_ADS_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
