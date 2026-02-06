'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number, domain?: string) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}; SameSite=Lax`;
  if (domain) cookie += `; domain=${domain}`;
  document.cookie = cookie;
}

function getWebGLRenderer(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!ext) return null;
    return (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) || null;
  } catch {
    return null;
  }
}

// Expose tracking context globally for form tracker
declare global {
  interface Window {
    __moyd_tracker?: {
      pageViewId: string | null;
      visitorId: string;
      sessionId: string;
      trackingId: string | null;
    };
  }
}

export function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const pageViewId = useRef<string | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    // Reset for each page
    sentRef.current = false;
    startTime.current = Date.now();
    maxScroll.current = 0;
    pageViewId.current = null;

    // Visitor ID: cross-site cookie on .moyoungdemocrats.org
    let visitorId = getCookie('_moyd_vid');
    if (!visitorId) {
      visitorId = generateId();
      setCookie('_moyd_vid', visitorId, 730, '.moyoungdemocrats.org');
    }

    // Session ID: sessionStorage
    let sessionId = sessionStorage.getItem('_moyd_sid');
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem('_moyd_sid', sessionId);
    }

    // Tracking ID from URL
    const trackingId = searchParams.get('tid') || null;

    // Expose globally for form tracker
    window.__moyd_tracker = { pageViewId: null, visitorId, sessionId, trackingId };

    // Collect browser data
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    const data: Record<string, any> = {
      page_path: pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      visitor_id: visitorId,
      session_id: sessionId,
      tracking_id: trackingId,
      user_agent: navigator.userAgent,
      platform: nav.platform || null,
      language: navigator.language || null,
      languages: navigator.languages ? Array.from(navigator.languages) : null,
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      color_depth: screen.colorDepth,
      pixel_ratio: window.devicePixelRatio || null,
      device_memory: nav.deviceMemory || null,
      hardware_concurrency: nav.hardwareConcurrency || null,
      touch_support: nav.maxTouchPoints > 0,
      max_touch_points: nav.maxTouchPoints ?? null,
      cookie_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack === '1',
      connection_type: conn?.effectiveType || null,
      connection_downlink: conn?.downlink ?? null,
      webgl_renderer: getWebGLRenderer(),
      pdf_viewer_enabled: nav.pdfViewerEnabled ?? null,
    };

    // Extract UTM params
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    for (const key of utmKeys) {
      data[key] = searchParams.get(key) || null;
    }

    // Try to resolve event_id from path
    const eventMatch = pathname.match(/\/events\/([^/]+)/);
    if (eventMatch) {
      const segment = eventMatch[1];
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        data.event_id = segment;
      }
      // Slug-based event_id will be resolved server-side or not set
    }

    // Send page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.id) {
          pageViewId.current = result.id;
          if (window.__moyd_tracker) {
            window.__moyd_tracker.pageViewId = result.id;
          }
        }
      })
      .catch(() => {});

    // Track scroll depth
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > maxScroll.current) maxScroll.current = scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Send engagement data on page leave
    const sendEngagement = () => {
      if (!pageViewId.current || sentRef.current) return;
      sentRef.current = true;

      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      const scrollPct = docHeight > 0 ? Math.min(100, Math.round((maxScroll.current / docHeight) * 100)) : 100;

      const payload = JSON.stringify({
        page_view_id: pageViewId.current,
        duration_seconds: duration,
        scroll_depth_pct: scrollPct,
        max_scroll_y: maxScroll.current,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/track', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') sendEngagement();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', sendEngagement);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', sendEngagement);
      sendEngagement();
    };
  }, [pathname, searchParams]);

  return null;
}
