// server/routes/admin.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Scheme = mongoose.model("Scheme");
const Contact = mongoose.model("Contact");
const requireAdmin = require("../middleware/adminlogin");

// List schemes by status
router.get("/admin/schemes", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query; // pending|approved|rejected (optional)
    const q = {};
    if (status) q.status = status;
    const schemes = await Scheme.find(q).sort({ createdAt: -1 });
    res.json(schemes);
  } catch {
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

// Create official (auto approved)
router.post("/admin/schemes", requireAdmin, async (req, res) => {
  try {
    const s = new Scheme({
      ...req.body,
      status: "approved",
      createdBy: req.user._id,
      moderatedBy: req.user._id,
      moderatedAt: new Date(),
    });
    await s.save();
    res.json({ message: "Scheme created", scheme: s });
  } catch {
    res.status(422).json({ error: "Failed to create" });
  }
});

// Approve
router.put("/admin/schemes/:id/approve", requireAdmin, async (req, res) => {
  try {
    const s = await Scheme.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
      },
      { new: true }
    );
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Approved", scheme: s });
  } catch {
    res.status(422).json({ error: "Failed to approve" });
  }
});

// Reject
router.put("/admin/schemes/:id/reject", requireAdmin, async (req, res) => {
  try {
    const s = await Scheme.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
      },
      { new: true }
    );
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Rejected", scheme: s });
  } catch {
    res.status(422).json({ error: "Failed to reject" });
  }
});

// Update
router.put("/admin/schemes/:id", requireAdmin, async (req, res) => {
  try {
    const s = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated", scheme: s });
  } catch {
    res.status(422).json({ error: "Failed to update" });
  }
});

// Delete
router.delete("/admin/schemes/:id", requireAdmin, async (req, res) => {
  try {
    const s = await Scheme.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch {
    res.status(422).json({ error: "Failed to delete" });
  }
});

// Contacts
router.get("/admin/contacts", requireAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.put("/admin/contacts/:id/reply", requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body || {};

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Update contact with reply
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        replied: true,
        reply: reply.trim(),
        repliedAt: new Date(),
      },
      { new: true }
    );

    // Send email notification to user
    try {
      const nodemailer = require("nodemailer");
      const { EMAIL, GPASS } = require("../config/keys");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL,
          pass: GPASS,
        },
      });

      const mailOptions = {
        from: EMAIL,
        to: contact.email,
        subject: `Re: ${contact.subject} - Government Schemes Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Government Schemes Portal - Admin Reply</h2>
            <p>Dear ${contact.name},</p>
            <p>Thank you for contacting us. We have reviewed your inquiry and here is our response:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">Your Original Message:</h4>
              <p style="color: #6b7280;">${contact.message}</p>
            </div>
            
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #16a34a; margin-top: 0;">Our Response:</h4>
              <p style="color: #374151;">${reply}</p>
            </div>
            
            <p>If you have any further questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Government Schemes Portal Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af;">
              This is an automated response from Government Schemes Portal. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${contact.email}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the entire request if email fails
    }

    res.json({
      message: "Reply sent successfully and email notification delivered",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Reply error:", error);
    res.status(422).json({ error: "Failed to send reply" });
  }
});

module.exports = router;