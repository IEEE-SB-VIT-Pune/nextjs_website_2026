import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Slot } from "@/models/Slot";
import { Interview } from "@/models/Interview";
import { verifyJWT } from "@/lib/jwt";
import { logBookingToGoogleSheet } from "@/lib/google";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  await connectDB();
  const user = await User.findById(payload.id);
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

// GET available active slots with remaining capacity
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectDB();
    const slots = await Slot.find({ isActive: true }).sort({ dateTime: 1 }).lean();

    const availableSlots = slots.map((s: any) => ({
      _id: s._id.toString(),
      dateTime: s.dateTime,
      endDateTime: s.endDateTime,
      maxStudents: s.maxStudents || 4,
      currentStudents: (s.students || []).length,
      availableSpots: (s.maxStudents || 4) - (s.students || []).length,
      isFull: (s.students || []).length >= (s.maxStudents || 4),
    }));

    return NextResponse.json({ success: true, slots: availableSlots });
  } catch (error: any) {
    console.error("GET /api/admin/allot-slot error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

function formatDateStr(dateObj: Date): string {
  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
}

// POST handle manual or auto slot allotment, revert allotments, or bulk mark
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    // 0.1. Revert Bookings Created After Cutoff Time (e.g. 1:00 PM today)
    if (body.revertByCutoffTime) {
      const activeSlots = await Slot.find({ isActive: true });
      
      // Cutoff date default: 1:00 PM today (11/08/2026) or user specified ISO string
      let cutoffDate: Date;
      if (body.cutoffTimeIso) {
        cutoffDate = new Date(body.cutoffTimeIso);
      } else {
        cutoffDate = new Date();
        cutoffDate.setHours(13, 0, 0, 0); // 1:00 PM today
      }

      let revertedCount = 0;
      for (const slot of activeSlots) {
        const originalLen = slot.students.length;
        slot.students = slot.students.filter((st: any) => {
          const bookedTime = st.bookedAt ? new Date(st.bookedAt) : new Date(0);
          return bookedTime < cutoffDate;
        });

        const removedCount = originalLen - slot.students.length;
        if (removedCount > 0) {
          revertedCount += removedCount;
          slot.markModified("students");
          await slot.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully reverted ${revertedCount} candidate booking(s) created after ${cutoffDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}! Candidates are now back in pending queue.`,
        revertedCount,
      });
    }

    // 0.2. Mark Bookings Created After Cutoff Time (e.g. 1:00 PM today) as Admin Allotted
    if (body.markAdminByCutoffTime) {
      const activeSlots = await Slot.find({ isActive: true });
      
      let cutoffDate: Date;
      if (body.cutoffTimeIso) {
        cutoffDate = new Date(body.cutoffTimeIso);
      } else {
        cutoffDate = new Date();
        cutoffDate.setHours(15, 0, 0, 0); // 1:00 PM today
      }

      let updatedCount = 0;
      for (const slot of activeSlots) {
        let modified = false;
        slot.students.forEach((st: any) => {
          const bookedTime = st.bookedAt ? new Date(st.bookedAt) : new Date(0);
          if (bookedTime >= cutoffDate) {
            st.isAdminAllotted = true;
            st.allottedBy = "ADMIN";
            modified = true;
            updatedCount++;
          }
        });

        if (modified) {
          slot.markModified("students");
          await slot.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully tagged ${updatedCount} candidate booking(s) created after ${cutoffDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} as Admin Allotted!`,
        updatedCount,
      });
    }

    // 0. Revert Admin Allotted Candidates Mode
    if (body.revertAdminAllotted) {
      const activeSlots = await Slot.find({ isActive: true });
      const targetDate = body.targetDate; // e.g. "11/8/2026" or "ALL"

      let revertedCount = 0;
      for (const slot of activeSlots) {
        if (targetDate && targetDate !== "ALL") {
          const slotDateStr = formatDateStr(new Date(slot.dateTime));
          if (slotDateStr !== targetDate) continue;
        }

        const originalLen = slot.students.length;
        slot.students = slot.students.filter(
          (st: any) => !(st.isAdminAllotted || st.allottedBy === "ADMIN")
        );

        const removedCount = originalLen - slot.students.length;
        if (removedCount > 0) {
          revertedCount += removedCount;
          slot.markModified("students");
          await slot.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully reverted ${revertedCount} admin-allotted booking(s)! Candidates are now back in pending queue.`,
        revertedCount,
      });
    }

    // 0.5. Mark All Booked Candidates as Admin Allotted Mode
    if (body.markAllAsAdmin) {
      const activeSlots = await Slot.find({ isActive: true });
      const targetDate = body.targetDate;

      let updatedCount = 0;
      for (const slot of activeSlots) {
        if (targetDate && targetDate !== "ALL") {
          const slotDateStr = formatDateStr(new Date(slot.dateTime));
          if (slotDateStr !== targetDate) continue;
        }

        let modified = false;
        slot.students.forEach((st: any) => {
          if (!st.isAdminAllotted || st.allottedBy !== "ADMIN") {
            st.isAdminAllotted = true;
            st.allottedBy = "ADMIN";
            modified = true;
            updatedCount++;
          }
        });

        if (modified) {
          slot.markModified("students");
          await slot.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully marked ${updatedCount} candidate booking(s) as Admin Allotted!`,
        updatedCount,
      });
    }

    // 1. Bulk Auto-Allotment Mode (with Date Filter & Past Date Exclusion)
    if (body.autoAllot) {
      const targetDate = body.targetDate; // e.g. "12/8/2026" or "FUTURE_ONLY" or "ALL"
      const excludePastDates = body.excludePastDates !== false; // default true

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Find all active slots with remaining spots sorted by date
      let activeSlots = await Slot.find({ isActive: true }).sort({ dateTime: 1 });

      // Filter slots based on date selection and past date exclusion
      activeSlots = activeSlots.filter((slot) => {
        const slotDate = new Date(slot.dateTime);
        if (excludePastDates && targetDate !== "ALL_INCLUDING_PAST" && slotDate < startOfToday) {
          return false;
        }
        if (targetDate && targetDate !== "ALL" && targetDate !== "FUTURE_ONLY" && targetDate !== "ALL_INCLUDING_PAST") {
          const slotDateStr = formatDateStr(slotDate);
          if (slotDateStr !== targetDate) return false;
        }
        return true;
      });

      // Get all booked emails across ALL active slots
      const allActiveSlots = await Slot.find({ isActive: true });
      const bookedEmails = new Set<string>();
      allActiveSlots.forEach((slot) => {
        (slot.students || []).forEach((st: any) => {
          if (st.studentEmail) bookedEmails.add(st.studentEmail.toLowerCase().trim());
        });
      });

      // Find all pending candidate applications (ONLY candidates who submitted the recruitment form)
      const allInterviews = await Interview.find({}).sort({ createdAt: 1 }).lean();

      const pendingCandidatesMap = new Map<string, { email: string; name: string; id: any }>();

      allInterviews.forEach((inv: any) => {
        const email = inv.email ? inv.email.toLowerCase().trim() : "";
        if (email && !bookedEmails.has(email) && !pendingCandidatesMap.has(email)) {
          pendingCandidatesMap.set(email, {
            email,
            name: inv.fullname || email.split("@")[0],
            id: inv.userId || inv._id,
          });
        }
      });

      const pendingCandidatesList = Array.from(pendingCandidatesMap.values());

      if (pendingCandidatesList.length === 0) {
        return NextResponse.json({
          success: true,
          message: "All candidates already have booked slots! No pending candidates found.",
          allottedCount: 0,
        });
      }

      if (activeSlots.length === 0) {
        return NextResponse.json({
          success: false,
          message: targetDate && targetDate !== "ALL"
            ? `No available active slots found on date ${targetDate}.`
            : "No available active future slots found to allot candidates.",
          allottedCount: 0,
        }, { status: 400 });
      }

      let allottedCount = 0;

      // Iterate through pending candidates and fill slots sequentially
      for (const candidateItem of pendingCandidatesList) {
        const email = candidateItem.email;

        // Find first slot with available spot
        const availableSlot = activeSlots.find(
          (s) => s.isActive && (s.students || []).length < (s.maxStudents || 4)
        );

        if (!availableSlot) {
          // No more available spots in selected target slots
          break;
        }

        const assignedPanel = (availableSlot.students.length % 4) + 1;
        availableSlot.students.push({
          studentId: candidateItem.id,
          studentName: candidateItem.name,
          studentEmail: email,
          panel: assignedPanel,
          bookedAt: new Date(),
          allottedBy: "ADMIN",
          isAdminAllotted: true,
        });

        allottedCount++;
        bookedEmails.add(email);
      }

      // Save all modified slot documents
      for (const slot of activeSlots) {
        if (slot.isModified("students")) {
          await slot.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully auto-allotted slots to ${allottedCount} pending candidate(s)!`,
        allottedCount,
      });
    }

    // 2. Manual Allotment Mode
    const { studentEmail, slotId } = body;

    if (!studentEmail || !slotId) {
      return NextResponse.json({
        success: false,
        message: "Student email and target slot ID are required for manual allotment.",
      }, { status: 400 });
    }

    const email = studentEmail.toLowerCase().trim();

    // Check if student already has a slot booked in active slots
    const existingBooking = await Slot.findOne({
      "students.studentEmail": email,
      isActive: true,
    });

    if (existingBooking) {
      return NextResponse.json({
        success: false,
        message: `Candidate (${email}) already has a booked slot. Please cancel their existing slot first if rescheduling.`,
      }, { status: 400 });
    }

    // Find candidate details
    const candidate = await Interview.findOne({ email });
    const userObj = await User.findOne({ email });

    const studentName = userObj?.name || candidate?.fullname || email.split("@")[0];
    const studentId = userObj?._id || candidate?.userId || candidate?._id;

    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: "Could not locate student user profile or application record.",
      }, { status: 404 });
    }

    // Fetch Target Slot
    const targetSlot = await Slot.findById(slotId);
    if (!targetSlot || !targetSlot.isActive) {
      return NextResponse.json({
        success: false,
        message: "Target slot is inactive or invalid.",
      }, { status: 404 });
    }

    if (targetSlot.students.length >= targetSlot.maxStudents) {
      return NextResponse.json({
        success: false,
        message: "Target slot is fully booked.",
      }, { status: 400 });
    }

    const assignedPanel = (targetSlot.students.length % 4) + 1;
    targetSlot.students.push({
      studentId: studentId,
      studentName: studentName,
      studentEmail: email,
      panel: assignedPanel,
      bookedAt: new Date(),
      allottedBy: "ADMIN",
      isAdminAllotted: true,
    });

    await targetSlot.save();

    // Optional Google Sync
    try {
      if (candidate) {
        await logBookingToGoogleSheet(
          {
            fullname: candidate.fullname,
            email: candidate.email,
            phone_number: candidate.phone_number,
            branch: candidate.branch,
            domain: candidate.domain,
          },
          targetSlot,
          assignedPanel
        );
      }
    } catch (syncErr: any) {
      console.warn("Non-fatal Google Sync notice during admin slot allotment:", syncErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully allotted slot to ${studentName} (${email})!`,
      data: {
        slotId: targetSlot._id.toString(),
        panel: assignedPanel,
        dateTime: targetSlot.dateTime,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/allot-slot error:", error);
    return NextResponse.json({
      success: false,
      message: "An internal server error occurred while allotting slot.",
    }, { status: 500 });
  }
}

// PATCH toggle or update candidate allotment source (ADMIN / STUDENT)
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { studentEmail, allottedBy } = body;

    if (!studentEmail) {
      return NextResponse.json({ success: false, message: "Student email is required" }, { status: 400 });
    }

    const email = studentEmail.toLowerCase().trim();
    const newAllottedBy = allottedBy === "ADMIN" ? "ADMIN" : "STUDENT";
    const isAdminAllotted = newAllottedBy === "ADMIN";

    // Find slot containing this student and update their allotment tag
    const targetSlot = await Slot.findOne({ "students.studentEmail": email, isActive: true });
    if (!targetSlot) {
      return NextResponse.json({ success: false, message: "No active slot booking found for candidate" }, { status: 404 });
    }

    let updated = false;
    targetSlot.students.forEach((st: any) => {
      if (st.studentEmail && st.studentEmail.toLowerCase().trim() === email) {
        st.allottedBy = newAllottedBy;
        st.isAdminAllotted = isAdminAllotted;
        updated = true;
      }
    });

    if (updated) {
      targetSlot.markModified("students");
      await targetSlot.save();
    }

    return NextResponse.json({
      success: true,
      message: `Updated allotment source for ${email} to ${newAllottedBy}!`,
      allottedBy: newAllottedBy,
      isAdminAllotted,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/allot-slot error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
