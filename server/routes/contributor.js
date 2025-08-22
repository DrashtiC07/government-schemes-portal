// server/routes/contributor.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Scheme = mongoose.model("Scheme");
const Contact = mongoose.model("Contact");
const requireSignin = require("../middleware/requireSignin");

// PUBLIC: list approved schemes (supports query filters)
router.get("/get-schemes", async (req, res) => {
  try {
    const q = { status: "approved" };
    const filters = [
      "state",
      "city",
      "gender",
      "caste",
      "age",
      "schemeMinistry",
    ];
    filters.forEach((f) => {
      if (req.query[f]) q[f] = req.query[f];
    });
    const schemes = await Scheme.find(q).sort({ createdAt: -1 });
    res.json(schemes);
  } catch {
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

// PUBLIC: get a single approved scheme
router.get("/scheme/:id", async (req, res) => {
  try {
    const s = await Scheme.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Scheme not found" });
    if (s.status !== "approved")
      return res.status(403).json({ error: "Scheme not approved" });
    res.json(s);
  } catch {
    res.status(500).json({ error: "Failed to fetch scheme" });
  }
});

// USER: submit new scheme -> pending
router.post("/new-scheme", requireSignin, async (req, res) => {
  try {
    const s = new Scheme({
      ...req.body,
      status: "pending",
      createdBy: req.user._id,
    });
    await s.save();
    res.json({
      message: "Scheme submitted. Awaiting admin approval.",
      scheme: s,
    });
  } catch {
    res.status(422).json({ error: "Failed to submit scheme" });
  }
});

// CONTACT (public)
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message)
      return res
        .status(422)
        .json({ error: "name, email, message are required" });
    const c = new Contact({ name, email, message });
    await c.save();
    res.json({ message: "Your message has been submitted" });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
