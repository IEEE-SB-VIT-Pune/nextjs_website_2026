import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

let oAuth2Client: any = null;
let calendar: any = null;
let sheets: any = null;

try {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:5050"
    );

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    sheets = google.sheets({ version: "v4", auth: oAuth2Client });

    console.log("✅ Google API clients initialized successfully.");
  } else {
    console.warn("⚠️ Google credentials missing. Running sheets/calendar in MOCK MODE.");
  }
} catch (error: any) {
  console.error("❌ Error setting up Google API clients:", error.message);
  console.warn("Google integrations falling back to MOCK MODE.");
}

// Initialize sheet headers
export async function initializeGoogleSheetHeaders() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:A1"
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        "Timestamp", "Name", "Email", "Phone", "Branch", "Domains", "Interview Date", "Interview Time", "Panel", "Calendar Event ID", "Status"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:K1",
        valueInputOption: "RAW",
        requestBody: { values: [headers] }
      });
      console.log("📊 [Google Sheets] Headers initialized in Sheet1 successfully.");
    }
  } catch (error: any) {
    console.warn("⚠️ [Google Sheets] Failed to initialize headers:", error.message);
  }
}

// Google Calendar event creation
export async function createGoogleCalendarEvent(eventDetails: {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: { email: string }[];
}) {
  if (calendar) {
    try {
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: { dateTime: eventDetails.startTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: eventDetails.endTime, timeZone: "Asia/Kolkata" },
        attendees: eventDetails.attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      console.log(`[Google Calendar] Successfully created event. ID: ${response.data.id}`);
      return response.data;
    } catch (err: any) {
      console.error("[Google Calendar] Failed to create event, falling back to mock:", err.message);
    }
  }

  // Mock
  const mockId = `mock_event_${uuidv4().substring(0, 8)}`;
  console.log(`[MOCK Google Calendar] Created event. ID: ${mockId} for:`, eventDetails.attendees);
  return { id: mockId };
}

// Update Calendar event
export async function updateGoogleCalendarEvent(eventId: string, eventDetails: {
  attendees: { email: string }[];
}) {
  if (calendar && eventId && !eventId.startsWith("mock_")) {
    try {
      const currentEvent = await calendar.events.get({
        calendarId: "primary",
        eventId: eventId
      });

      const updatedResource = {
        ...currentEvent.data,
        attendees: eventDetails.attendees
      };

      const response = await calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        requestBody: updatedResource,
      });

      console.log(`[Google Calendar] Successfully updated event: ${eventId}`);
      return response.data;
    } catch (err: any) {
      console.error(`[Google Calendar] Failed to update event ${eventId}:`, err.message);
    }
  }

  console.log(`[MOCK Google Calendar] Updated event: ${eventId} with:`, eventDetails.attendees);
  return { id: eventId };
}

// Delete Calendar event
export async function deleteGoogleCalendarEvent(eventId: string) {
  if (calendar && eventId && !eventId.startsWith("mock_")) {
    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
      console.log(`[Google Calendar] Successfully deleted event: ${eventId}`);
      return true;
    } catch (err: any) {
      console.error(`[Google Calendar] Failed to delete event ${eventId}:`, err.message);
    }
  }

  console.log(`[MOCK Google Calendar] Deleted event: ${eventId}`);
  return true;
}

// Sheets Booking Log
export async function logBookingToGoogleSheet(candidate: {
  fullname: string;
  email: string;
  phone_number: string;
  branch: string;
  domain: string[];
}, slot: {
  dateTime: Date | string;
  endDateTime: Date | string;
  googleEventId?: string | null;
}, panel: number) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) {
    console.warn("📊 [Google Sheets Sync] Skipped: Client not initialized or GOOGLE_SHEET_ID missing.");
    return;
  }

  try {
    const range = "Sheet1!A:K";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const dateStr = new Date(slot.dateTime).toLocaleDateString("en-IN");
    const timeStr = `${new Date(slot.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(slot.endDateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const values = [[
      timestamp,
      candidate.fullname,
      candidate.email,
      candidate.phone_number,
      candidate.branch,
      candidate.domain.join(", "),
      dateStr,
      timeStr,
      `Panel ${panel}`,
      slot.googleEventId || "N/A",
      "BOOKED"
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values }
    });

    console.log(`📊 [Google Sheets Sync] Successfully logged booking for ${candidate.email}`);
  } catch (error: any) {
    console.error("❌ [Google Sheets Sync] Failed to append booking details:", error.message);
  }
}

// Sheets Cancellation Log
export async function logCancellationToGoogleSheet(studentEmail: string, googleEventId?: string | null) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) {
    console.warn("📊 [Google Sheets Sync] Cancellation sync skipped.");
    return;
  }

  try {
    const range = "Sheet1!A:K";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = response.data.values;
    if (rows && rows.length > 0) {
      let rowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        const rowEmail = rows[i][2];
        const rowEventId = rows[i][9];
        const rowStatus = rows[i][10];

        const emailMatches = rowEmail && rowEmail.toLowerCase() === studentEmail.toLowerCase();
        
        let isMatch = false;
        if (googleEventId && googleEventId !== "N/A" && googleEventId !== "null") {
          // Match both email and the exact Calendar Event ID
          isMatch = !!(emailMatches && rowEventId === googleEventId);
        } else {
          // Fall back to matching email and active status if no event ID is provided
          isMatch = !!(emailMatches && rowStatus === "BOOKED");
        }

        if (isMatch) {
          rowIndex = i + 1; // 1-indexed range
          break;
        }
      }

      if (rowIndex !== -1) {
        const updateRange = `Sheet1!K${rowIndex}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: "RAW",
          requestBody: { values: [["CANCELLED"]] }
        });
        console.log(`📊 [Google Sheets Sync] Updated row ${rowIndex} to CANCELLED for ${studentEmail}`);
      } else {
        const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: "RAW",
          requestBody: {
            values: [[
              timestamp,
              "N/A",
              studentEmail,
              "N/A",
              "N/A",
              "N/A",
              "N/A",
              "N/A",
              "N/A",
              "N/A",
              "CANCELLED"
            ]]
          }
        });
        console.log(`📊 [Google Sheets Sync] Email row not found. Appended CANCELLED row for ${studentEmail}`);
      }
    }
  } catch (error: any) {
    console.error("❌ [Google Sheets Sync] Failed to update cancellation details:", error.message);
  }
}

// Initialize response sheet headers
export async function initializeResponseSheetHeaders() {
  const spreadsheetId = process.env.GOOGLE_RESPONSE_SHEET_ID || "1Ja3HgEPv-IPvbPuUoZjlW9OwviskPXmvxC6VnGObQkk";
  if (!sheets || !spreadsheetId) return;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:A1"
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        "Timestamp", "Name", "Email", "Phone", "Branch", "Domain preferences", "Why join IEEE", "Why work in domains", "Skills", "Projects", "Expectations", "Extra Details"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:L1",
        valueInputOption: "RAW",
        requestBody: { values: [headers] }
      });
      console.log("📊 [Google Sheets] Headers initialized in Response Sheet successfully.");
    }
  } catch (error: any) {
    console.warn("⚠️ [Google Sheets] Failed to initialize response headers:", error.message);
  }
}

// Log application response to the response Google Sheet
export async function logResponseToGoogleSheet(application: {
  fullname: string;
  email: string;
  phone_number: string;
  branch: string;
  whyPart: string;
  domain: string[];
  whyWork: string;
  skills: string;
  projects?: string;
  expectations?: string;
  vagera?: string;
}) {
  const spreadsheetId = process.env.GOOGLE_RESPONSE_SHEET_ID || "1Ja3HgEPv-IPvbPuUoZjlW9OwviskPXmvxC6VnGObQkk";
  if (!sheets || !spreadsheetId) {
    console.warn("📊 [Google Sheets Sync] Response sync skipped: Client not initialized or GOOGLE_RESPONSE_SHEET_ID missing.");
    return;
  }

  try {
    // First, ensure headers are initialized
    await initializeResponseSheetHeaders();

    const range = "Sheet1!A:L";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const values = [[
      timestamp,
      application.fullname,
      application.email,
      application.phone_number,
      application.branch,
      application.domain.join(", "),
      application.whyPart,
      application.whyWork,
      application.skills,
      application.projects || "",
      application.expectations || "",
      application.vagera || ""
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values }
    });

    console.log(`📊 [Google Sheets Sync] Successfully logged application response for ${application.email}`);
  } catch (error: any) {
    console.error("❌ [Google Sheets Sync] Failed to append application response details:", error.message);
  }
}

