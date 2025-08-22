// server/routes/admin_pdf.js
const express = require("express");
const router = express.Router();
const PDF = require("../models/pdf");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");  // ✅ add this

// Upload a new PDF (Admin only)
router.post("/admin/pdf", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const { title, url } = req.body; // url could be a file link
    const newPdf = new PDF({ title, url });
    await newPdf.save();

    res.json({ msg: "PDF uploaded successfully", pdf: newPdf });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get all PDFs (for users/admins to view)
router.get("/pdfs", async (req, res) => {
  try {
    const pdfs = await PDF.find();
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete a PDF (Admin only)
router.delete("/admin/pdf/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    await PDF.findByIdAndDelete(req.params.id);
    res.json({ msg: "PDF deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
router.post("/admin/new-scheme", auth, adminOnly, async (req, res) => {
  try {
    const { title, description, eligibility, documents } = req.body;

    const newScheme = new Scheme({
      title,
      description,
      eligibility,
      documents,
    });

    await newScheme.save();
    res.json({ success: true, scheme: newScheme });
  } catch (error) {
    console.error("Error creating scheme:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
