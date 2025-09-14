// src/controllers/verificationController.js
const Verification = require("../models/Verification");
const nodemailer = require("nodemailer");
const twilioLib = require("twilio");

const hasTwilio = !!(process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE);
const twilioClient = hasTwilio ? twilioLib(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;

const hasEmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const mailer = hasEmail ? nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
}) : null;

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isPhone(contact) {
  // very simple phone detection: contains mostly digits and length >= 6 (you can improve)
  return /^[+\d][\d\-\s()]{5,}$/.test(contact);
}

exports.sendOtp = async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ error: "contact is required" });

    const contactType = isPhone(contact) ? "phone" : "email";
    const otp = genOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save verification record
    await Verification.create({ contact, contactType, otp, expiresAt });

    if (contactType === "phone") {
      if (!twilioClient) return res.status(500).json({ error: "SMS service not configured on server" });
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE,
        to: contact,
        body: `Your INCOIS OTP is ${otp}. It expires in 5 minutes.`,
      });
    } else {
      if (!mailer) return res.status(500).json({ error: "Email service not configured on server" });
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: contact,
        subject: "INCOIS OTP Code",
        text: `Your INCOIS OTP is ${otp}. It expires in 5 minutes.`,
      });
    }

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) return res.status(400).json({ error: "contact and otp required" });

    // Find most recent non-expired record
    const record = await Verification.findOne({ contact, otp }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ error: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });

    record.verified = true;
    await record.save();

    return res.json({ message: "Verified" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};
