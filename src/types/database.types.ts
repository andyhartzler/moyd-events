// Supabase Storage image object structure
export interface StorageImage {
  file_name: string;
  storage_url: string;
  uploaded_at: string;
  content_type: string;
  storage_path: string;
  storage_bucket: string;
}

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
  attendee_count: number | null;
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
  website_image: StorageImage | StorageImage[] | null;
  social_share_image: StorageImage | StorageImage[] | null;
  hide_address_before_rsvp: boolean | null;
  multiple_locations: boolean | null;
  location_one_name: string | null;
  location_one_address: string | null;
  location_two_name: string | null;
  location_two_address: string | null;
  location_three_name: string | null;
  location_three_address: string | null;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  member_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  rsvp_status: 'attending' | 'maybe' | 'not_attending';
  guest_count: number;
  notes: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  rsvp_at: string;
  created_at: string;
  updated_at: string;
}

// Legacy type alias for backward compatibility
export type EventRSVP = EventAttendee;

export interface Member {
  id: string;
  name: string;
  email: string;
  date_joined: string | null;
}

export interface EventWithAttendees extends Event {
  user_attendee?: EventAttendee;
}

// Legacy type alias for backward compatibility
export type EventWithRSVP = EventWithAttendees;
