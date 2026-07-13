import mongoose, { Schema } from "mongoose";

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Event",
    },
    dateText: {
      type: String,
      required: true,
    },
    timeText: {
      type: String,
      default: "",
    },
    prizePool: {
      type: String,
      default: "",
    },
    teamSize: {
      type: String,
      default: "",
    },
    entryFee: {
      type: String,
      default: "",
    },
    venue: {
      type: String,
      default: "VIT Pune",
    },
    prizeBreakdown: {
      type: Schema.Types.Mixed, // e.g. { winner: "₹7,000", runner1: "₹5,000", runner2: "₹3,000" }
      default: null,
    },
    type: {
      type: String,
      enum: ["UPCOMING", "PREVIOUS"],
      default: "PREVIOUS",
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;
