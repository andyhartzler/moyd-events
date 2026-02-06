import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const row = {
      event_id: body.event_id || null,
      page_view_id: body.page_view_id || null,
      visitor_id: body.visitor_id || null,
      session_id: body.session_id || null,
      tracking_id: body.tracking_id || null,
      event_type: body.event_type,
      field_name: body.field_name || null,
      field_has_value: body.field_has_value ?? null,
      form_data: body.form_data || null,
      error_message: body.error_message || null,
    };

    if (!row.event_type) {
      return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });
    }

    const { error } = await supabase.from('form_events').insert(row);

    if (error) {
      console.error('form_events insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update tracking_links lifecycle timestamps
    if (body.tracking_id) {
      if (body.event_type === 'form_start') {
        await supabase
          .from('tracking_links')
          .update({ form_started_at: new Date().toISOString() })
          .eq('token', body.tracking_id)
          .is('form_started_at', null);
      }
      if (body.event_type === 'submit_success') {
        await supabase
          .from('tracking_links')
          .update({ form_completed_at: new Date().toISOString() })
          .eq('token', body.tracking_id)
          .is('form_completed_at', null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Track form POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
