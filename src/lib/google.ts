import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import { SystemConfig } from "@/models/SystemConfig";

let oAuth2Client: any = null;
let calendar: any = null;
let sheets: any = null;

async function updateEnvFile(key: string, value: string) {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return;
    let content = fs.readFileSync(envPath, "utf-8");
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    fs.writeFileSync(envPath, content, "utf-8");
    console.log(`📝 [Google Auth] Updated ${key} in .env.local silently.`);
  } catch (err: any) {
    console.error(`[Google Auth] Error updating env file for ${key}:`, err.message);
  }
}

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

    oAuth2Client.on("tokens", async (tokens: any) => {
      if (tokens.refresh_token) {
        console.log("🔄 [Google Auth] Received a new refresh token silently!");
        process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
        await updateEnvFile("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
      }
      if (tokens.access_token) {
        console.log("🔑 [Google Auth] Access token refreshed silently.");
      }
    });

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

function handleGoogleError(actionName: string, error: any) {
  if (error.message && error.message.includes("invalid_grant")) {
    console.warn(`⚠️ [Google Sheets Sync] ${actionName} skipped (invalid_grant). Your GOOGLE_REFRESH_TOKEN has expired or is invalid. Please run: node scratch/get_refresh_token.js to generate a new token.`);
  } else {
    console.error(`❌ [Google Sheets Sync] ${actionName} failed:`, error.message);
  }
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
    handleGoogleError("Initialize Main Sheet Headers", error);
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
      handleGoogleError("Create Calendar Event", err);
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
      handleGoogleError(`Update Calendar Event ${eventId}`, err);
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
      handleGoogleError(`Delete Calendar Event ${eventId}`, err);
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
    const dateStr = new Date(slot.dateTime).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const timeStr = `${new Date(slot.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} - ${new Date(slot.endDateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}`;

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
    handleGoogleError("Log Slot Booking", error);
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
    handleGoogleError("Log Slot Cancellation", error);
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
        "Timestamp", "Name", "Email", "Phone", "GitHub Profile", "LinkedIn Profile", "Branch", "Domain preferences", "Why join IEEE", "Why work in domains", "Skills", "Projects", "Expectations", "Extra Details"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:N1",
        valueInputOption: "RAW",
        requestBody: { values: [headers] }
      });
      console.log("📊 [Google Sheets] Headers initialized in Response Sheet successfully.");
    }
  } catch (error: any) {
    handleGoogleError("Initialize Response Sheet Headers", error);
  }
}

// Log application response to the response Google Sheet
export async function logResponseToGoogleSheet(application: {
  fullname: string;
  email: string;
  phone_number: string;
  github?: string;
  linkedin?: string;
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

    const range = "Sheet1!A:N";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const values = [[
      timestamp,
      application.fullname,
      application.email,
      application.phone_number,
      application.github || "",
      application.linkedin || "",
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
    handleGoogleError("Log Application Response", error);
  }
}

let lastTokenCheckTime = 0;
let cachedTokenStatus: { isExpired: boolean; message?: string } | null = null;
let lastEmailSentTime = 0;

const cleanEnvVar = (val: string | undefined) => {
  if (!val) return "";
  return val.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
};

async function sendTokenExpiredEmailAlert(errorMessage: string) {
  try {
    // Check if admin has stopped sending token expiration alert emails
    await connectDB();
    const alertConfig = await SystemConfig.findOne({ key: "tokenAlertEmail" });
    if (alertConfig && alertConfig.value === false) {
      console.log("ℹ️ [Alert Mail] Token expiration email alert sending is STOPPED (disabled in Admin Dashboard settings).");
      return;
    }

    const smtpHost = cleanEnvVar(process.env.SMTP_HOST);
    const smtpPort = Number(cleanEnvVar(process.env.SMTP_PORT));
    const smtpSecure = cleanEnvVar(process.env.SMTP_SECURE) === "true";
    const smtpUser = cleanEnvVar(process.env.SMTP_USER);
    const smtpPass = cleanEnvVar(process.env.SMTP_PASS);

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP credentials missing. Skipped sending token expiry alert email.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const recipients = [
      "tokeprathmesh54321@gmail.com",
      "prathmesh.toke24@vit.edu",
      "toke.prathmesh@gmail.com",
      "ieee.sb@vit.edu"
    ];

    await transporter.sendMail({
      from: `"IEEE VIT Pune System Alert" <${smtpUser}>`,
      to: recipients.join(", "),
      subject: "🚨 URGENT: IEEE VIT Pune Google Refresh Token Expired",
      text: `Alert: The Google Refresh Token used by the recruitment website has expired or is invalid. Please run 'node scratch/get_refresh_token.js' in the project directory, generate a new token, and update GOOGLE_REFRESH_TOKEN in your .env.local file. Error details: ${errorMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 2px solid #ef4444; border-radius: 8px;">
          <h2 style="color: #ef4444; margin-top: 0;">🚨 System Alert: Google Refresh Token Expired</h2>
          <p>Dear Administrator,</p>
          <p>This is an automated system alert indicating that the <strong>Google API refresh token</strong> utilized by the IEEE Student Branch VIT Pune Recruitment portal has expired or is invalid.</p>
          <p>Due to this issue, <strong>form submissions and slot bookings on the website have been temporarily disabled</strong> to avoid synchronisation failures and data loss.</p>
          
          <h3 style="color: #1e3a8a;">Resolution Steps:</h3>
          <ol>
            <li>Login to the server/project terminal.</li>
            <li>Run the generation command: <code>node scratch/get_refresh_token.js</code></li>
            <li>Follow the on-screen instructions to authenticate with Google.</li>
            <li>Copy the generated refresh token.</li>
            <li>Update your environment configuration file (<code>.env.local</code> or hosting platform variables):
              <pre style="background: #f4f4f5; padding: 10px; border-radius: 4px; border: 1px solid #e4e4e7;">GOOGLE_REFRESH_TOKEN="your_new_token"</pre>
            </li>
            <li>Restart the application server to apply changes.</li>
          </ol>

          <p><strong>Error Details:</strong> <code>${errorMessage}</code></p>
          
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p style="font-size: 11px; color: #71717a;">This is an automated alert generated by the IEEE VIT Pune portal backend.</p>
        </div>
      `
    });

    console.log("✉️ [Alert Mail] Successfully sent token expiration email alert to all administrators.");
  } catch (mailError: any) {
    console.error("❌ [Alert Mail Error] Failed to send token expiration email:", mailError.message);
  }
}

export async function checkGoogleTokenStatus(): Promise<{ isExpired: boolean; message?: string }> {
  const now = Date.now();
  if (cachedTokenStatus && (now - lastTokenCheckTime < 30000)) {
    return cachedTokenStatus;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId && !clientSecret && !refreshToken) {
    cachedTokenStatus = { isExpired: false };
    lastTokenCheckTime = now;
    return cachedTokenStatus;
  }

  if (!oAuth2Client) {
    cachedTokenStatus = {
      isExpired: true,
      message: "Google OAuth2 client is not initialized. Please check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are all provided."
    };
    lastTokenCheckTime = now;
    return cachedTokenStatus;
  }

  try {
    const tokenInfo = await oAuth2Client.getAccessToken();
    if (!tokenInfo || !tokenInfo.token) {
      cachedTokenStatus = { isExpired: true, message: "Token retrieval returned empty token." };
    } else {
      cachedTokenStatus = { isExpired: false };
    }
  } catch (error: any) {
    const errMsg = error.message || "";
    if (errMsg.includes("invalid_grant") || errMsg.includes("invalid_request") || errMsg.includes("expired")) {
      cachedTokenStatus = { isExpired: true, message: "invalid_grant" };
    } else {
      // Do not cache or block for transient network errors.
      return { isExpired: false };
    }
  }

  if (cachedTokenStatus.isExpired) {
    const nowMs = Date.now();
    if (nowMs - lastEmailSentTime > 3600000) { // 1 hour throttle
      lastEmailSentTime = nowMs;
      sendTokenExpiredEmailAlert(cachedTokenStatus.message || "invalid_grant").catch(err => {
        console.error("Failed to run sendTokenExpiredEmailAlert:", err);
      });
    }
  }

  lastTokenCheckTime = now;
  return cachedTokenStatus;
}


