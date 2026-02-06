import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parseUserAgent(ua: string) {
  let browser = 'Unknown', browserVersion = '', os = 'Unknown', osVersion = '', deviceType = 'desktop';

  // Browser detection
  if (/CriOS\/(\d+[\.\d]*)/.test(ua)) { browser = 'Chrome'; browserVersion = RegExp.$1; }
  else if (/Edg\/(\d+[\.\d]*)/.test(ua)) { browser = 'Edge'; browserVersion = RegExp.$1; }
  else if (/OPR\/(\d+[\.\d]*)/.test(ua)) { browser = 'Opera'; browserVersion = RegExp.$1; }
  else if (/Chrome\/(\d+[\.\d]*)/.test(ua) && !/Edg/.test(ua)) { browser = 'Chrome'; browserVersion = RegExp.$1; }
  else if (/Version\/(\d+[\.\d]*).*Safari/.test(ua)) { browser = 'Safari'; browserVersion = RegExp.$1; }
  else if (/Firefox\/(\d+[\.\d]*)/.test(ua)) { browser = 'Firefox'; browserVersion = RegExp.$1; }

  // OS detection
  if (/Windows NT (\d+[\.\d]*)/.test(ua)) { os = 'Windows'; osVersion = RegExp.$1; }
  else if (/Mac OS X (\d+[_\.\d]*)/.test(ua)) { os = 'macOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/iPhone OS (\d+[_\.\d]*)/.test(ua)) { os = 'iOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/iPad.*OS (\d+[_\.\d]*)/.test(ua)) { os = 'iPadOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/Android (\d+[\.\d]*)/.test(ua)) { os = 'Android'; osVersion = RegExp.$1; }
  else if (/CrOS/.test(ua)) { os = 'ChromeOS'; }
  else if (/Linux/.test(ua)) { os = 'Linux'; }

  // Device type
  if (/Mobile|iPhone|Android.*Mobile/.test(ua)) deviceType = 'mobile';
  else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) deviceType = 'tablet';

  return { browser, browserVersion, os, osVersion, deviceType };
}

function resolveEventId(path: string): string | null {
  // Match /events/<uuid>/... or /events/<slug>/...
  const match = path.match(/\/events\/([^/]+)/);
  if (!match) return null;
  const segment = match[1];
  // Check if it's a UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return segment;
  }
  // For slugs, we'll resolve later via query — return null and let the client pass event_id
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If this is a beacon engagement update (has page_view_id + duration_seconds), handle as PATCH
    if (body.page_view_id && body.duration_seconds !== undefined) {
      const { error } = await supabase
        .from('page_views')
        .update({
          duration_seconds: body.duration_seconds || null,
          scroll_depth_pct: body.scroll_depth_pct || null,
          max_scroll_y: body.max_scroll_y || null,
        })
        .eq('id', body.page_view_id);

      if (error) {
        console.error('page_views beacon update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    const headers = request.headers;

    const ua = body.user_agent || headers.get('user-agent') || '';
    const parsed = parseUserAgent(ua);

    // Resolve event_id: prefer client-supplied, fallback to path parsing
    let eventId = body.event_id || resolveEventId(body.page_path || '') || null;

    // Geo from Vercel headers
    const city = headers.get('x-vercel-ip-city') || null;
    const region = headers.get('x-vercel-ip-country-region') || null;
    const country = headers.get('x-vercel-ip-country') || null;
    const lat = headers.get('x-vercel-ip-latitude');
    const lon = headers.get('x-vercel-ip-longitude');
    const tz = headers.get('x-vercel-ip-timezone') || null;
    const forwarded = headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : null;

    // If tracking_id present, update tracking_links
    if (body.tracking_id) {
      await supabase
        .from('tracking_links')
        .update({
          clicked_at: new Date().toISOString(),
          click_count: undefined, // handled below
        })
        .eq('token', body.tracking_id)
        .is('clicked_at', null);

      // Increment click count
      await supabase.rpc('increment_click_count', { tid: body.tracking_id }).catch(() => {
        // Fallback: just do a raw increment via direct update
        // This may not work without an RPC, so we'll just set it
      });

      // Simple approach: fetch current and increment
      const { data: tl } = await supabase
        .from('tracking_links')
        .select('click_count')
        .eq('token', body.tracking_id)
        .single();
      if (tl) {
        await supabase
          .from('tracking_links')
          .update({ click_count: (tl.click_count || 0) + 1 })
          .eq('token', body.tracking_id);
      }
    }

    const row = {
      event_id: eventId,
      page_path: body.page_path || '/',
      page_title: body.page_title || null,
      referrer: body.referrer || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_term: body.utm_term || null,
      utm_content: body.utm_content || null,
      tracking_id: body.tracking_id || null,
      visitor_id: body.visitor_id || null,
      session_id: body.session_id || null,
      user_agent: ua,
      browser: parsed.browser,
      browser_version: parsed.browserVersion,
      os: parsed.os,
      os_version: parsed.osVersion,
      device_type: parsed.deviceType,
      screen_width: body.screen_width || null,
      screen_height: body.screen_height || null,
      viewport_width: body.viewport_width || null,
      viewport_height: body.viewport_height || null,
      color_depth: body.color_depth || null,
      pixel_ratio: body.pixel_ratio || null,
      device_memory: body.device_memory || null,
      hardware_concurrency: body.hardware_concurrency || null,
      touch_support: body.touch_support ?? null,
      max_touch_points: body.max_touch_points ?? null,
      ip_address: ip,
      city: city ? decodeURIComponent(city) : null,
      region: region,
      country: country,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lon ? parseFloat(lon) : null,
      timezone: tz,
      language: body.language || null,
      languages: body.languages || null,
      cookie_enabled: body.cookie_enabled ?? null,
      do_not_track: body.do_not_track ?? null,
      platform: body.platform || null,
      connection_type: body.connection_type || null,
      connection_downlink: body.connection_downlink ?? null,
      webgl_renderer: body.webgl_renderer || null,
      pdf_viewer_enabled: body.pdf_viewer_enabled ?? null,
    };

    const { data, error } = await supabase
      .from('page_views')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('page_views insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    console.error('Track POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_view_id, duration_seconds, scroll_depth_pct, max_scroll_y } = body;

    if (!page_view_id) {
      return NextResponse.json({ error: 'Missing page_view_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('page_views')
      .update({
        duration_seconds: duration_seconds || null,
        scroll_depth_pct: scroll_depth_pct || null,
        max_scroll_y: max_scroll_y || null,
      })
      .eq('id', page_view_id);

    if (error) {
      console.error('page_views update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Track PATCH error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
