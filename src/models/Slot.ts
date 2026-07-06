import mongoose, { Schema } from "mongoose";

const StudentBookingSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  panel: {
    type: Number,
    min: 1,
    max: 4,
    required: true,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const SlotSchema = new Schema(
  {
    dateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    students: [StudentBookingSchema],
    maxStudents: {
      type: Number,
      default: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleEventId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Slot = mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
export default Slot;
