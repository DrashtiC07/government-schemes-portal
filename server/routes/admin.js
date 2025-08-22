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
    const c = await Contact.findByIdAndUpdate(
      req.params.id,
      { replied: !!reply, reply: reply || "" },
      { new: true }
    );
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Reply saved", contact: c });
  } catch {
    res.status(422).json({ error: "Failed to reply" });
  }
});

module.exports = router;
