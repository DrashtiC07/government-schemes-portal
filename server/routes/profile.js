// server/routes/profile.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const requireSignin = require("../middleware/requireSignin");

// Save
router.post("/me/saved-schemes/:id", requireSignin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedSchemes: req.params.id } },
      { new: true }
    ).populate("savedSchemes");
    res.json({ message: "Saved", savedSchemes: user.savedSchemes });
  } catch {
    res.status(422).json({ error: "Failed to save" });
  }
});

// Unsave
router.delete("/me/saved-schemes/:id", requireSignin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedSchemes: req.params.id } },
      { new: true }
    ).populate("savedSchemes");
    res.json({ message: "Removed", savedSchemes: user.savedSchemes });
  } catch {
    res.status(422).json({ error: "Failed to remove" });
  }
});

// List saved
router.get("/me/saved-schemes", requireSignin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedSchemes");
    res.json(user.savedSchemes || []);
  } catch {
    res.status(500).json({ error: "Failed to fetch saved" });
  }
});

module.exports = router;
