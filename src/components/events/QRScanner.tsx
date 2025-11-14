'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';

interface QRScannerProps {
  eventId: string;
}

interface ScanResult {
  success: boolean;
  memberName?: string;
  message: string;
}

export function EventQRScanner({ eventId }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const supabase = createClient();

  const handleScan = async (scannedData: string) => {
    if (!scannedData) return;

    setScanning(false);

    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(scannedData)) {
        throw new Error('Invalid QR code format');
      }

      const memberId = scannedData;

      // Get RSVP with member info
      const { data: rsvp, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          members!inner(
            id,
            name,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('member_id', memberId)
        .single();

      if (rsvpError || !rsvp) {
        throw new Error('Member has not RSVPd to this event');
      }

      if (rsvp.checked_in) {
        throw new Error(`${rsvp.members.name} already checked in`);
      }

      // Mark as checked in
      const { error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: 'qr_code',
        })
        .eq('id', rsvp.id);

      if (updateError) throw updateError;

      setResult({
        success: true,
        memberName: rsvp.members.name,
        message: 'Successfully checked in!',
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setScanning(true);
        setResult(null);
      }, 2000);

    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to check in',
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setScanning(true);
        setResult(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
        {scanning && !result ? (
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                handleScan(result[0].rawValue);
              }
            }}
            onError={(error) => console.error(error)}
          />
        ) : result ? (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${
            result.success ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {result.success ? (
              <CheckCircle className="w-16 h-16 mb-4" />
            ) : (
              <XCircle className="w-16 h-16 mb-4" />
            )}
            {result.memberName && (
              <div className="text-2xl font-bold mb-2">{result.memberName}</div>
            )}
            <div className="text-xl">{result.message}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
