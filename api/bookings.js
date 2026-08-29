/**
 * POST /api/bookings — Reno Apartments Abuja booking-request endpoint.
 *
 * This is a Vercel Serverless Function (Node.js runtime). It deploys
 * automatically — any file under /api at the project root becomes a live
 * endpoint on Vercel, no build step, no framework, no npm install required
 * for this file (it only uses the native `fetch` available in Node 18+,
 * which is what Vercel's Node runtime provides).
 *
 * ── REQUIRED ENVIRONMENT VARIABLES ──────────────────────────────────────
 * Set these in Vercel → Project → Settings → Environment Variables:
 *
 *   RESEND_API_KEY           API key from https://resend.com (free tier
 *                             covers low volume — plenty for a booking form)
 *   BOOKING_FROM_EMAIL        The "from" address Resend sends as. Must be on
 *                             a domain verified with Resend (see README).
 *   BOOKING_RECIPIENT_EMAIL   Where booking requests are delivered —
 *                             e.g. renoapartmentsabuja@gmail.com
 *
 * Until all three are set, this endpoint intentionally returns
 * `{ success: false }` with a clear message. It never reports success
 * unless the notification email was actually accepted by the email
 * provider — that's the whole point of this fix.
 *
 * ── OPTIONAL: PERSISTENT STORAGE ────────────────────────────────────────
 *   KV_REST_API_URL, KV_REST_API_TOKEN — automatically present if you
 *   attach a Vercel KV database to this project (Vercel → Storage →
 *   Create Database → KV → Connect to Project). If present, every booking
 *   is also saved there (key: booking:<id>, plus an index list) so you have
 *   a persistent record beyond email. This is optional — email delivery is
 *   the primary, required path.
 */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[+()\-\s\d]{7,20}$/.test(phone);
}

function generateBookingId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK-${rand}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      res.status(400).json({ success: false, message: "Invalid request body." });
      return;
    }
  }
  body = body || {};

  const name = (body.name || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const checkin = (body.checkin || "").toString().trim();
  const checkout = (body.checkout || "").toString().trim();
  const guests = (body.guests || "").toString().trim();
  const apartment = (body.apartment || "").toString().trim();
  const notes = (body.notes || "").toString().trim();

  // ── Validation ──
  const errors = [];
  if (!name) errors.push("Full name is required.");
  if (!phone || !isValidPhone(phone)) errors.push("A valid phone number is required.");
  if (!email || !isValidEmail(email)) errors.push("A valid email address is required.");
  if (!checkin) errors.push("Check-in date is required.");
  if (!checkout) errors.push("Check-out date is required.");
  if (!guests || isNaN(Number(guests)) || Number(guests) < 1) errors.push("Number of guests is required.");
  if (!apartment) errors.push("Please select an apartment.");

  let inDate, outDate;
  if (checkin && checkout) {
    inDate = new Date(checkin + "T00:00:00");
    outDate = new Date(checkout + "T00:00:00");
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      errors.push("Check-in and check-out must be valid dates.");
    } else {
      if (outDate <= inDate) errors.push("Check-out date must be after check-in date.");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inDate < today) errors.push("Check-in date cannot be in the past.");
    }
  }

  if (errors.length) {
    res.status(400).json({ success: false, message: errors.join(" ") });
    return;
  }

  const bookingId = generateBookingId();
  const submittedAt = new Date().toISOString();
  const booking = { bookingId, name, phone, email, checkin, checkout, guests, apartment, notes, submittedAt, status: "New" };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const BOOKING_FROM_EMAIL = process.env.BOOKING_FROM_EMAIL;
  const BOOKING_RECIPIENT_EMAIL = process.env.BOOKING_RECIPIENT_EMAIL;

  // Never fake success — if the notification path isn't configured, say so plainly.
  if (!RESEND_API_KEY || !BOOKING_FROM_EMAIL || !BOOKING_RECIPIENT_EMAIL) {
    res.status(503).json({
      success: false,
      message: "The booking system isn't fully configured yet. Please contact us directly by phone or WhatsApp in the meantime.",
    });
    return;
  }

  const subject = `New Booking Request — ${apartment} — ${checkin}`;
  const htmlBody = `
    <h2 style="color:#a3402a;">ACTION REQUIRED — New Booking Request</h2>
    <p><strong>Booking ID:</strong> ${escapeHtml(bookingId)}</p>
    <table cellpadding="6" style="border-collapse:collapse;">
      <tr><td><strong>Guest name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Room / Apartment</strong></td><td>${escapeHtml(apartment)}</td></tr>
      <tr><td><strong>Check-in</strong></td><td>${escapeHtml(checkin)}</td></tr>
      <tr><td><strong>Check-out</strong></td><td>${escapeHtml(checkout)}</td></tr>
      <tr><td><strong>Guests</strong></td><td>${escapeHtml(guests)}</td></tr>
      <tr><td><strong>Special requests</strong></td><td>${escapeHtml(notes || "None")}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${escapeHtml(submittedAt)}</td></tr>
    </table>
  `;

  let emailSent = false;
  let emailError = null;
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: BOOKING_FROM_EMAIL,
        to: BOOKING_RECIPIENT_EMAIL,
        subject,
        html: htmlBody,
        reply_to: email,
      }),
    });
    if (resp.ok) {
      emailSent = true;
    } else {
      emailError = `Email provider error: ${resp.status} ${await resp.text()}`;
    }
  } catch (err) {
    emailError = `Email send failed: ${err.message}`;
  }

  // Best-effort persistent storage — never blocks or fakes the primary result.
  let stored = false;
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/set/booking:${bookingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      await fetch(`${KV_URL}/lpush/bookings:all/${encodeURIComponent(bookingId)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      stored = true;
    } catch (err) {
      // Storage is a bonus, not the source of truth — email delivery is.
    }
  }

  if (!emailSent) {
    console.error("Booking email failed:", emailError, booking);
    res.status(502).json({
      success: false,
      message: "We could not submit your booking request. Please try again or contact us directly by phone or WhatsApp.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    bookingId,
    message: "Booking request received successfully.",
    stored,
  });
};
