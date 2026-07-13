import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Event } from "@/models/Event";

const initialEvents = [
  {
    title: "CodeZest'26",
    description: "A high-octane competitive coding hackathon challenging logic and speed across multiple divisions, held offline at VIT Pune.",
    category: "Hackathon",
    dateText: "13th March",
    timeText: "Offline",
    venue: "VIT Pune",
    type: "PREVIOUS",
  },
  {
    title: "Gate Smashers — Varun Singla",
    description: "An interactive tech talk with Varun Singla, founder of Gate Smashers, covering core CS subjects, AI integration, and core career skills.",
    category: "Tech Talk",
    dateText: "13th March",
    timeText: "1 PM",
    venue: "VIT Pune",
    type: "PREVIOUS",
  },
  {
    title: "IEEE Execom Recruitment 2026-2027",
    description: "Join the Executive Committee (Execom) of the IEEE Student Branch VIT Pune! This is your opportunity to lead, manage, and contribute to one of the oldest and most prestigious technical student organizations on campus.",
    category: "Recruitment",
    dateText: "Active Now",
    timeText: "Form -> Interview",
    venue: "Online / Interview",
    type: "UPCOMING",
  }
];

export async function GET() {
  try {
    await connectDB();
    
    let dbEvents = await Event.find({}).sort({ createdAt: -1 });
    
    // Auto-seed if database contains zero events
    if (dbEvents.length === 0) {
      await Event.insertMany(initialEvents);
      dbEvents = await Event.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, events: dbEvents });
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
