import mongoose, { Schema } from "mongoose";

const InterviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
    },
    whyPart: {
      type: String,
      required: [true, "Why Part is required"],
    },
    domain: {
      type: [String],
      required: [true, "At least one domain must be selected"],
    },
    whyWork: {
      type: String,
      required: [true, "Why Work is required"],
    },
    skills: {
      type: String,
      required: [true, "Skills list is required"],
    },
    projects: {
      type: String,
      default: "",
    },
    expectations: {
      type: String,
      default: "",
    },
    vagera: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);
export default Interview;
