export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_end_date: string | null;
  location: string | null;
  location_address: string | null;
  event_type: string | null;
  rsvp_enabled: boolean;
  rsvp_deadline: string | null;
  max_attendees: number | null;
  checkin_enabled: boolean;
  checkin_start_time: string | null;
  checkin_end_time: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  checkin_notification_sent: boolean;
  checkin_notification_sent_at: string | null;
  status: 'draft' | 'published' | 'cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  member_id: string;
  rsvp_status: 'attending' | 'maybe' | 'not_attending';
  guest_count: number;
  notes: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  rsvp_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  date_joined: string | null;
}

export interface EventWithRSVP extends Event {
  user_rsvp?: EventRSVP;
  rsvp_count?: number;
}
