const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. Read env variables from .env.local manually
const envPath = path.join(__dirname, "../../.env.local");
let mongodbUri = "mongodb://localhost:27017/clubcms";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
  if (match && match[1]) {
    mongodbUri = match[1].trim();
  }
}

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

  // 4. Clear existing users if any to avoid duplication error (or just check existence)
  await User.deleteMany({ email: { $in: ["admin@clubcms.com", "user@clubcms.com"] } });
  console.log("Cleared old seeder accounts.");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  // 5. Seed Admin
  const adminUser = new User({
    name: "Admin Moderator",
    email: "admin@clubcms.com",
    password: hashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: null
  });
  await adminUser.save();
  console.log("Created Admin account: admin@clubcms.com / password123");

  // 6. Seed Standard User
  const standardUser = new User({
    name: "Regular Member",
    email: "user@clubcms.com",
    password: hashedPassword,
    role: "USER",
    status: "ACTIVE",
    lastLogin: null
  });
  await standardUser.save();
  console.log("Created User account: user@clubcms.com / password123");

  console.log("Database seeding completed successfully!");
  process.exit(0);
})
.catch((err) => {
  console.error("Failed to connect or seed database:", err);
  process.exit(1);
});
