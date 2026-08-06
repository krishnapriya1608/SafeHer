const cron = require("node-cron");
const CheckIn = require("../Model/CheckIn");
const User = require("../Model/userModel");
const TrustedContact = require("../Model/TrustedContact");
const sendMail = require("./sendMail");

function todayDateStr(now) {
  return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function currentHHMM(now) {
  return now.toTimeString().slice(0, 5); // "HH:mm", server local time
}

async function triggerDueCheckIns(io, now) {
  const hhmm = currentHHMM(now);
  const dow = now.getDay();
  const today = todayDateStr(now);

  const due = await CheckIn.find({
    active: true,
    time: hhmm,
    daysOfWeek: dow,
    lastTriggeredDate: { $ne: today },
  });

  for (const checkIn of due) {
    checkIn.lastTriggeredDate = today;
    checkIn.lastStatus = "pending";
    checkIn.triggeredAt = now;
    checkIn.confirmedAt = null;
    await checkIn.save();

    io.to(`user-${checkIn.userId}`).emit("checkin-triggered", {
      checkInId: checkIn._id,
      label: checkIn.label,
      gracePeriodMinutes: checkIn.gracePeriodMinutes,
    });
  }
}

async function escalateMissedCheckIns(now) {
  // "pending" check-ins whose grace period has elapsed without confirmation.
  const pending = await CheckIn.find({ lastStatus: "pending", triggeredAt: { $ne: null } });

  for (const checkIn of pending) {
    const deadline = new Date(
      checkIn.triggeredAt.getTime() + checkIn.gracePeriodMinutes * 60 * 1000
    );
    if (now < deadline) continue;

    checkIn.lastStatus = "missed";
    await checkIn.save();

    try {
      const user = await User.findById(checkIn.userId).select("username email");
      const contacts = await TrustedContact.find({ user: checkIn.userId });

      if (user && contacts.length > 0) {
        const subject = `SafeSphere: ${user.username} missed a safety check-in`;
        const html = `
          <p>Hi,</p>
          <p><strong>${user.username}</strong> did not confirm a scheduled safety check-in
          ("${checkIn.label}") within ${checkIn.gracePeriodMinutes} minutes.</p>
          <p>You're receiving this because you're listed as one of their trusted contacts on SafeSphere.
          Consider reaching out to check on them.</p>
        `;
        await Promise.all(
          contacts
            .filter((c) => c.email)
            .map((c) => sendMail({ to: c.email, subject, html }).catch(() => null))
        );
      }
    } catch (err) {
      console.error("Missed check-in escalation failed:", err.message);
    }
  }
}

function startCheckInScheduler(io) {
  // Runs every minute — check-in "time" fields only have minute precision,
  // so this cadence is sufficient without hammering the DB.
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    try {
      await triggerDueCheckIns(io, now);
      await escalateMissedCheckIns(now);
    } catch (err) {
      console.error("Check-in scheduler tick failed:", err.message);
    }
  });

  console.log("Check-in scheduler started (runs every minute).");
}

module.exports = { startCheckInScheduler };
