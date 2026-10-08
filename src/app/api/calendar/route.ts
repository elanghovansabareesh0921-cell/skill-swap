import { NextResponse } from 'next/server';

/**
 * Interface defining the expected request payload for scheduling a Google Calendar event.
 */
interface ScheduleEventRequest {
  summary: string;
  description: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  attendees: string[]; // List of email addresses
  timeZone: string;
  accessToken: string; // Valid Google OAuth 2.0 access token with calendar.events scope
}

/**
 * POST /api/calendar
 * 
 * Creates a Google Calendar event with an auto-generated Google Meet link.
 * 
 * Required OAuth Scope: https://www.googleapis.com/auth/calendar.events
 */
export async function POST(request: Request) {
  try {
    const body: ScheduleEventRequest = await request.json();

    const { summary, description, startTime, endTime, attendees, timeZone, accessToken } = body;

    // Validate required parameters
    if (!summary || !startTime || !endTime || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields (summary, startTime, endTime, accessToken)' },
        { status: 400 }
      );
    }

    // Google Calendar Events API URL
    // `conferenceDataVersion=1` is REQUIRED to auto-generate the Google Meet link.
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';

    // Format the payload according to Google Calendar API specs
    const payload = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone,
      },
      // Map simple email array into the Google attendees object structure
      attendees: attendees ? attendees.map(email => ({ email })) : [],
      
      // Requesting the creation of a Google Meet video conference
      conferenceData: {
        createRequest: {
          // A unique ID is required to ensure idempotency. 
          // Re-using the same ID for the same request prevents duplicate meetings.
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      // Optional: Add default reminders
      reminders: {
        useDefault: true
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle token expiration or insufficient scopes
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized: Access token is missing, invalid, or expired. Please refresh the token.' },
          { status: 401 }
        );
      }
      if (response.status === 403 || response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded or insufficient permissions (check scopes).', details: data },
          { status: response.status }
        );
      }
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Conflict: An event with this ID already exists or slot is deeply conflicted.', details: data },
          { status: 409 }
        );
      }
      
      throw new Error(data.error?.message || 'Failed to create event');
    }

    // Extract the Meet link safely. 
    // Usually located at `hangoutLink`, but can also be found in `conferenceData.entryPoints`.
    interface EntryPoint {
      entryPointType?: string;
      uri?: string;
    }
    const meetLink = data.hangoutLink || data.conferenceData?.entryPoints?.find((ep: EntryPoint) => ep.entryPointType === 'video')?.uri;

    // Return the clean JSON payload
    return NextResponse.json({
      eventId: data.id,
      htmlLink: data.htmlLink, // Link to view event in Google Calendar UI
      meetLink: meetLink || null, // The auto-generated Google Meet URL
      status: data.status, // e.g., 'confirmed'
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown calendar error';
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
