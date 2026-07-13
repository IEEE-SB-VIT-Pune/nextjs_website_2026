const { google } = require("googleapis");
const http = require("http");
const url = require("url");

// Load variables from .env.local if available
require("dotenv").config({ path: ".env.local" });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = "http://localhost:5050";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar"
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent"
});

console.log("=========================================================================");
console.log("🌐 Google Sheets / Calendar OAuth Refresh Token Generator");
console.log("=========================================================================");
console.log("1. Open the following URL in your browser to authorize access:");
console.log("\n" + authUrl + "\n");
console.log("2. After giving consent, you will be redirected to localhost.");
console.log("=========================================================================");

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = req.url || "";
    const parsedUrl = url.parse(reqUrl, true);
    const code = parsedUrl.query.code;
    
    if (code) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h1 style="color: #22c55e;">✓ Authorization Successful!</h1>
          <p>You can close this browser tab now. Check your terminal for the new refresh token.</p>
        </div>
      `);
      
      console.log("\n[OAuth] Authorization code received. Requesting refresh token...");
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log("\n========================= GOOGLE_REFRESH_TOKEN =========================");
      console.log(tokens.refresh_token);
      console.log("========================================================================");
      console.log("\nAction items:");
      console.log("1. Copy the token above.");
      console.log("2. Paste it in your .env.local as: GOOGLE_REFRESH_TOKEN=\"your_new_token\"");
      console.log("3. Restart your dev server.");
      console.log("========================================================================");
      
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>OAuth Server: Awaiting Google Redirect Callback...</h1>");
    }
  } catch (err) {
    console.error("❌ Error retrieving refresh token:", err.message);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end("<h1>Authentication Failed</h1>");
  }
});

server.listen(5050, () => {
  console.log("📡 Listening for redirection on http://localhost:5050...");
});
