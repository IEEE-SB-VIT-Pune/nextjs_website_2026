import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Verification & Recruitment flow fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtp: {
      type: String,
      default: null,
    },
    emailVerificationOtpExpires: {
      type: Date,
      default: null,
    },
    hasSubmittedInterview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Helper method to compare passwords
UserSchema.methods.comparePassword = async function (passwordToCheck: string): Promise<boolean> {
  return await bcrypt.compare(passwordToCheck, this.password);
};

// Configure JSON transformer to never return passwords or OTP details in API responses
UserSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    delete ret.password;
    delete ret.emailVerificationOtp;
    delete ret.emailVerificationOtpExpires;
    return ret;
  },
});

UserSchema.set("toObject", {
  transform: (doc, ret: any) => {
    delete ret.password;
    delete ret.emailVerificationOtp;
    delete ret.emailVerificationOtpExpires;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
