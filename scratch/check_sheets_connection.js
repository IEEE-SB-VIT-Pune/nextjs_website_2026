const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load and parse .env.local manually to be completely independent
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("No .env.local found at " + envPath);
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
const refreshToken = env.GOOGLE_REFRESH_TOKEN;
const sheetId = env.GOOGLE_SHEET_ID;
const responseSheetId = env.GOOGLE_RESPONSE_SHEET_ID;

console.log("Checking Google Sheets Connection Status...");
console.log("Client ID:", clientId ? "FOUND" : "MISSING");
console.log("Client Secret:", clientSecret ? "FOUND" : "MISSING");
console.log("Refresh Token:", refreshToken ? "FOUND" : "MISSING");
console.log("Sheet ID:", sheetId);
console.log("Response Sheet ID:", responseSheetId);

if (!clientId || !clientSecret || !refreshToken) {
  console.error("Required credentials missing!");
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  "http://localhost:5050"
);

oAuth2Client.setCredentials({ refresh_token: refreshToken });

const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

async function checkSheet(name, id) {
  try {
    console.log(`\nVerifying access to ${name} (ID: ${id})...`);
    const res = await sheets.spreadsheets.get({
      spreadsheetId: id
    });
    console.log(`✅ Success! Title: "${res.data.properties.title}"`);
    
    // Try reading a range to verify read permissions
    const rangeRes = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "Sheet1!A1:B2"
    });
    console.log(`✅ Read check passed (Sheet1 values: ${JSON.stringify(rangeRes.data.values || [])})`);
  } catch (err) {
    console.error(`❌ Failed to connect to ${name}:`, err.message);
  }
}

async function run() {
  try {
    // Refresh token explicitly first to verify credentials
    console.log("\nRefreshing access token...");
    const tokenRes = await oAuth2Client.getAccessToken();
    console.log("✅ OAuth token refresh successful! Temporary access token obtained.");
  } catch (err) {
    console.error("❌ OAuth credentials check failed:", err.message);
    if (err.message && err.message.includes("invalid_grant")) {
      console.error("👉 Explanation: The refresh token has been expired, revoked, or is invalid.");
    }
    process.exit(1);
  }

  if (sheetId) {
    await checkSheet("Primary Recruitment Sheet", sheetId);
  } else {
    console.log("⚠️ GOOGLE_SHEET_ID is missing in .env.local");
  }

  if (responseSheetId) {
    await checkSheet("Response Sheet", responseSheetId);
  } else {
    console.log("⚠️ GOOGLE_RESPONSE_SHEET_ID is missing in .env.local");
  }
}

run();
