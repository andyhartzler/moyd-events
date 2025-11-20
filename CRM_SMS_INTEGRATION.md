# CRM SMS Integration for Event Check-In

## Overview

This document describes how to integrate the Missouri Young Democrats event check-in system with your Flutter-based CRM to send SMS messages to attendees who are not found in the database.

## How It Works

When an attendee enters their phone number at an event check-in kiosk and they are **not found** in either the `members` or `donors` tables, the system will:

1. Call the CRM API endpoint to send an SMS
2. Display a message telling the attendee to check their phone
3. Provide a fallback option for in-person registration

## API Endpoint Specification

### Endpoint
```
POST /api/crm/send-checkin-sms
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "phone": "5551234567",
  "eventId": "uuid-of-event",
  "checkinUrl": "https://moyd-events.com/events/uuid-of-event/checkin?phone=5551234567"
}
```

**Field Descriptions:**
- `phone` (string, required): 10-digit phone number without formatting (digits only)
- `eventId` (string, required): UUID of the event they're trying to check in to
- `checkinUrl` (string, required): Full URL for the attendee to complete check-in

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "messageId": "optional-sms-provider-message-id"
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## SMS Message Template

The SMS message sent to the attendee should follow this format:

```
Missouri Young Democrats Event Check-In

You're not in our system yet! Complete your check-in here: [URL]

This link is for event: [Event Name]

Questions? Reply HELP
```

### Recommended Message Structure:
```
Hi! Complete your event check-in for Missouri Young Democrats: https://moyd-events.com/events/uuid?phone=5551234567

Reply STOP to unsubscribe
```

**Message Requirements:**
- Must include the `checkinUrl` from the API request
- Should be under 160 characters for single SMS (or use MMS)
- Must include opt-out language (e.g., "Reply STOP to unsubscribe")
- Should be friendly and actionable

## Implementation Steps for Flutter CRM

### 1. Create API Route Handler

In your Flutter web app, create a new API route handler:

```dart
// lib/api/routes/send_checkin_sms.dart

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';
import 'dart:convert';

class SendCheckinSmsRoute {
  Router get router {
    final router = Router();

    router.post('/send-checkin-sms', _handleSendCheckinSms);

    return router;
  }

  Future<Response> _handleSendCheckinSms(Request request) async {
    try {
      // Parse request body
      final payload = jsonDecode(await request.readAsString());
      final phone = payload['phone'] as String;
      final eventId = payload['eventId'] as String;
      final checkinUrl = payload['checkinUrl'] as String;

      // Validate required fields
      if (phone.isEmpty || eventId.isEmpty || checkinUrl.isEmpty) {
        return Response(
          400,
          body: jsonEncode({'success': false, 'error': 'Missing required fields'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      // Fetch event details (optional - for personalized message)
      // final event = await getEventById(eventId);

      // Send SMS using your SMS provider
      final messageId = await _sendSms(phone, checkinUrl, eventId);

      return Response.ok(
        jsonEncode({'success': true, 'messageId': messageId}),
        headers: {'Content-Type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'success': false, 'error': e.toString()}),
        headers: {'Content-Type': 'application/json'},
      );
    }
  }

  Future<String> _sendSms(String phone, String url, String eventId) async {
    // TODO: Implement SMS sending using your provider
    // Examples: Twilio, AWS SNS, MessageBird, etc.

    // For Twilio:
    // return await TwilioService.sendSms(
    //   to: '+1$phone',
    //   message: 'Complete your check-in for Missouri Young Democrats: $url\n\nReply STOP to unsubscribe',
    // );

    throw UnimplementedError('SMS provider not configured');
  }
}
```

### 2. Register the Route

Add the route to your main API handler:

```dart
// lib/api/api_handler.dart

import 'package:shelf_router/shelf_router.dart';
import 'routes/send_checkin_sms.dart';

class ApiHandler {
  Router get router {
    final router = Router();

    // Mount the send-checkin-sms route
    router.mount('/crm/', SendCheckinSmsRoute().router);

    return router;
  }
}
```

### 3. Configure SMS Provider

Choose an SMS provider and add credentials to your environment:

**Recommended Providers:**
- **Twilio** (most popular, reliable)
- **AWS SNS** (if already using AWS)
- **MessageBird** (good international coverage)
- **Plivo** (cost-effective)

**Environment Variables:**
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15551234567
```

### 4. Implement SMS Service (Example: Twilio)

```dart
// lib/services/twilio_service.dart

import 'package:http/http.dart' as http;
import 'dart:convert';

class TwilioService {
  static final String accountSid = Platform.environment['TWILIO_ACCOUNT_SID']!;
  static final String authToken = Platform.environment['TWILIO_AUTH_TOKEN']!;
  static final String fromNumber = Platform.environment['TWILIO_FROM_NUMBER']!;

  static Future<String> sendSms({
    required String to,
    required String message,
  }) async {
    final url = 'https://api.twilio.com/2010-04-01/Accounts/$accountSid/Messages.json';

    final response = await http.post(
      Uri.parse(url),
      headers: {
        'Authorization': 'Basic ' + base64Encode(utf8.encode('$accountSid:$authToken')),
      },
      body: {
        'From': fromNumber,
        'To': to,
        'Body': message,
      },
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['sid'] as String;
    } else {
      throw Exception('Failed to send SMS: ${response.body}');
    }
  }
}
```

### 5. Add Error Handling and Logging

```dart
Future<String> _sendSms(String phone, String url, String eventId) async {
  try {
    // Format phone number for provider (add country code if needed)
    final formattedPhone = '+1$phone'; // Assumes US numbers

    // Construct message
    final message = 'Complete your check-in for Missouri Young Democrats: $url\n\nReply STOP to unsubscribe';

    // Log the attempt
    logger.info('Sending check-in SMS to $formattedPhone for event $eventId');

    // Send via provider
    final messageId = await TwilioService.sendSms(
      to: formattedPhone,
      message: message,
    );

    // Log success
    logger.info('SMS sent successfully: $messageId');

    // Optional: Store in database for tracking
    await _logSmsInDatabase(phone, eventId, messageId);

    return messageId;
  } catch (e) {
    logger.error('Failed to send SMS to $phone: $e');
    rethrow;
  }
}
```

## Testing

### 1. Test with Postman or curl

```bash
curl -X POST http://localhost:8080/api/crm/send-checkin-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5551234567",
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "checkinUrl": "https://moyd-events.com/events/123e4567-e89b-12d3-a456-426614174000/checkin?phone=5551234567"
  }'
```

### 2. Test End-to-End

1. Go to event check-in page
2. Enter a phone number that doesn't exist in database
3. Verify SMS is sent
4. Click link in SMS
5. Verify check-in form appears with phone pre-filled

### 3. Test Error Cases

- Invalid phone number
- Missing fields
- SMS provider timeout
- Rate limiting

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent SMS spam
   ```dart
   // Example: Max 3 SMS per phone number per hour
   if (await _exceedsRateLimit(phone)) {
     return Response.tooManyRequests(
       body: jsonEncode({'success': false, 'error': 'Too many requests'}),
     );
   }
   ```

2. **Phone Number Validation**: Validate phone numbers before sending
   ```dart
   if (!RegExp(r'^\d{10}$').hasMatch(phone)) {
     return Response.badRequest(
       body: jsonEncode({'success': false, 'error': 'Invalid phone number'}),
     );
   }
   ```

3. **Authentication** (Optional): Add API key authentication
   ```dart
   final apiKey = request.headers['x-api-key'];
   if (apiKey != Platform.environment['API_KEY']) {
     return Response.forbidden('Invalid API key');
   }
   ```

4. **CORS**: Ensure CORS is configured for your frontend domain
   ```dart
   final handler = Pipeline()
     .addMiddleware(cors())
     .addHandler(router);
   ```

## Monitoring and Analytics

Track the following metrics:

1. **SMS Sent Count**: How many SMS messages were sent
2. **Delivery Rate**: Percentage of successfully delivered messages
3. **Click-Through Rate**: How many recipients clicked the link
4. **Completion Rate**: How many completed check-in after clicking

### Example Logging

```dart
await database.insert('sms_logs', {
  'phone': phone,
  'event_id': eventId,
  'message_id': messageId,
  'sent_at': DateTime.now().toIso8601String(),
  'status': 'sent',
  'url_clicked': false,
  'checkin_completed': false,
});
```

## Troubleshooting

### SMS Not Received
- Check phone number format (must be valid US number)
- Verify SMS provider credentials
- Check SMS provider logs for errors
- Ensure recipient hasn't opted out

### API Errors
- Check request body format
- Verify all required fields are present
- Check CRM logs for exceptions
- Verify SMS provider API is up

### Link Not Working
- Ensure URL is properly formatted
- Check that event ID is valid
- Verify check-in page is accessible

## Cost Considerations

**SMS Pricing (Approximate):**
- Twilio: $0.0079 per SMS (US)
- AWS SNS: $0.00645 per SMS (US)
- MessageBird: $0.008 per SMS (US)

**Estimated Monthly Cost:**
- 100 check-ins/month: ~$0.80
- 500 check-ins/month: ~$4.00
- 1000 check-ins/month: ~$8.00

## Next Steps

1. ✅ Choose SMS provider
2. ✅ Set up provider account and get credentials
3. ✅ Implement API endpoint in CRM
4. ✅ Add SMS sending logic
5. ✅ Test with real phone numbers
6. ✅ Monitor delivery rates
7. ✅ Add analytics tracking

## Support

For questions or issues:
- Check CRM logs: `/var/log/crm/api.log`
- Check SMS provider dashboard for delivery status
- Review event check-in logs in Supabase

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
**Maintained By:** Missouri Young Democrats Tech Team
