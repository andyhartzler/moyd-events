'use client';

import { useRef, useCallback, useEffect } from 'react';

interface FormTracker {
  formView: () => void;
  formStart: () => void;
  fieldFocus: (fieldName: string) => void;
  fieldBlur: (fieldName: string, hasValue: boolean) => void;
  submitAttempt: (filledFields: Record<string, boolean>) => void;
  submitSuccess: () => void;
  submitError: (errorMessage: string) => void;
}

function getTrackerContext() {
  if (typeof window === 'undefined') return null;
  return window.__moyd_tracker || null;
}

function sendFormEvent(payload: Record<string, any>) {
  fetch('/api/track/form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function useFormTracking(eventId: string, trackingId?: string | null): FormTracker {
  const started = useRef(false);
  const viewed = useRef(false);

  const getBase = useCallback(() => {
    const ctx = getTrackerContext();
    return {
      event_id: eventId,
      page_view_id: ctx?.pageViewId || null,
      visitor_id: ctx?.visitorId || null,
      session_id: ctx?.sessionId || null,
      tracking_id: trackingId || ctx?.trackingId || null,
    };
  }, [eventId, trackingId]);

  const formView = useCallback(() => {
    if (viewed.current) return;
    viewed.current = true;
    sendFormEvent({ ...getBase(), event_type: 'form_view' });
  }, [getBase]);

  const formStart = useCallback(() => {
    if (started.current) return;
    started.current = true;
    sendFormEvent({ ...getBase(), event_type: 'form_start' });
  }, [getBase]);

  const fieldFocus = useCallback((fieldName: string) => {
    if (!started.current) {
      started.current = true;
      sendFormEvent({ ...getBase(), event_type: 'form_start' });
    }
    sendFormEvent({ ...getBase(), event_type: 'field_focus', field_name: fieldName });
  }, [getBase]);

  const fieldBlur = useCallback((fieldName: string, hasValue: boolean) => {
    sendFormEvent({ ...getBase(), event_type: 'field_blur', field_name: fieldName, field_has_value: hasValue });
  }, [getBase]);

  const submitAttempt = useCallback((filledFields: Record<string, boolean>) => {
    sendFormEvent({ ...getBase(), event_type: 'submit_attempt', form_data: filledFields });
  }, [getBase]);

  const submitSuccess = useCallback(() => {
    sendFormEvent({ ...getBase(), event_type: 'submit_success' });
  }, [getBase]);

  const submitError = useCallback((errorMessage: string) => {
    sendFormEvent({ ...getBase(), event_type: 'submit_error', error_message: errorMessage });
  }, [getBase]);

  // Fire form_view on mount
  useEffect(() => {
    // Small delay to let Tracker.tsx set up first
    const timer = setTimeout(() => formView(), 500);
    return () => clearTimeout(timer);
  }, [formView]);

  return { formView, formStart, fieldFocus, fieldBlur, submitAttempt, submitSuccess, submitError };
}
