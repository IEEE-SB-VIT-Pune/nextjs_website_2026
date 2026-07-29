const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. Read env variables from .env.local manually
const envPath = path.join(__dirname, "../../.env.local");

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    content.split(/\r?\n/).forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;
      
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv(envPath);

const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/clubcms";
console.log("Connecting to MongoDB URI:", mongodbUri);

// 2. Connect to MongoDB
mongoose.connect(mongodbUri, {
  bufferCommands: false,
})
.then(async () => {
  console.log("Connected to MongoDB successfully!");
  
  // 3. Define schema inline to avoid ES module import problems in standard commonjs node script
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: String,
    status: String,
    lastLogin: Date,
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  // Load credentials from environment
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const userEmail = process.env.SEED_USER_EMAIL;
  const userPassword = process.env.SEED_USER_PASSWORD;

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    console.error("\x1b[31mError: Database seed credentials are not configured in your .env.local file!\x1b[0m");
    console.error("Please add the following variables to your .env.local file:\n");
    console.error("  SEED_ADMIN_EMAIL=admin@clubcms.com");
    console.error("  SEED_ADMIN_PASSWORD=your-secure-admin-password");
    console.error("  SEED_USER_EMAIL=user@clubcms.com");
    console.error("  SEED_USER_PASSWORD=your-secure-user-password\n");
    console.error("Seeding aborted to prevent security vulnerabilities from hardcoded credentials.");
    process.exit(1);
  }

  // 4. Clear existing users if any to avoid duplication error (or just check existence)
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  console.log("Cleared old seeder accounts.");

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);
  const hashedUserPassword = await bcrypt.hash(userPassword, salt);

  // 5. Seed Admin
  const adminUser = new User({
    name: "Admin Moderator",
    email: adminEmail,
    password: hashedAdminPassword,
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: null
  });
  await adminUser.save();
  console.log(`Created Admin account: ${adminEmail}`);

  // 6. Seed Standard User
  const standardUser = new User({
    name: "Regular Member",
    email: userEmail,
    password: hashedUserPassword,
    role: "USER",
    status: "ACTIVE",
    lastLogin: null
  });
  await standardUser.save();
  console.log(`Created User account: ${userEmail}`);

  console.log("Database seeding completed successfully!");
  process.exit(0);
})
.catch((err) => {
  console.error("Failed to connect or seed database:", err);
  process.exit(1);
});
