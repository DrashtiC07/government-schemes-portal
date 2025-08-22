// server/routes/contact.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Contact = mongoose.model("Contact");

// POST /contact - Handle contact form submissions
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      message,
      subject,
      timestamp: new Date(),
    });

    // Save to database
    await newContact.save();

    res
      .status(200)
      .json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res
      .status(500)
      .json({ error: "Failed to send message. Please try again." });
  }
});

// GET /contact - Get all contact messages (optional, for admin)
router.get("/contact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ timestamp: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
});

module.exports = router;
