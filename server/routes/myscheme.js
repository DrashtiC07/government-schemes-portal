const express = require("express");
const router = express.Router();
const SchemeModel = require("../models/scheme");
const requireLogin = require("../middleware/requireSignin");
const requireAdmin = require("../middleware/requireAdmin");

// ✅ Approve scheme
router.patch(
  "/schemes/:id/approve",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const scheme = await SchemeModel.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      );
      if (!scheme) return res.status(404).json({ error: "Scheme not found" });
      res.json({ message: "Scheme approved", scheme });
    } catch (error) {
      console.error("Error approving scheme:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Reject scheme
router.patch(
  "/schemes/:id/reject",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const scheme = await SchemeModel.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );
      if (!scheme) return res.status(404).json({ error: "Scheme not found" });
      res.json({ message: "Scheme rejected", scheme });
    } catch (error) {
      console.error("Error rejecting scheme:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Delete scheme
router.delete("/schemes/:id", requireLogin, requireAdmin, async (req, res) => {
  try {
    const scheme = await SchemeModel.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ error: "Scheme not found" });
    res.json({ message: "Scheme deleted" });
  } catch (error) {
    console.error("Error deleting scheme:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update scheme
router.put("/schemes/:id", requireLogin, requireAdmin, async (req, res) => {
  try {
    const scheme = await SchemeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!scheme) return res.status(404).json({ error: "Scheme not found" });
    res.json({ message: "Scheme updated", scheme });
  } catch (error) {
    console.error("Error updating scheme:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/get-schemes", async (req, res) => {
  try {
    const schemes = await SchemeModel.find().sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
