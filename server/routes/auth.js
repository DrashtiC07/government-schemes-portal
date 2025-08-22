// server/routes/auth.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    return res.status(422).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // Create new user
      const newUser = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpiry,
        isVerified: false,
      });
      await newUser.save();
    }

    console.log(`OTP for ${normalizedEmail}: ${otp}`);
    res.json({
      success: true,
      message: "OTP sent. Please verify your email.",
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ error: "No OTP found. Please sign up again" });
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ error: "OTP expired. Please request a new one" });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token for automatic login after verification
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const { _id, name, email: userEmail, isVerified, role, isAdmin } = user;

    res.json({
      token,
      user: { _id, name, email: userEmail, isVerified, role, isAdmin },
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res
      .status(500)
      .json({ error: "Verification failed", details: err.message });
  }
});

// RESEND OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`New OTP for ${normalizedEmail}: ${otp}`);
    res.json({
      success: true,
      message: "New OTP sent. Please verify your email.",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res
      .status(500)
      .json({ error: "Failed to resend OTP", details: err.message });
  }
});

// SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(422).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: "Please verify your email first",
        requiresVerification: true,
        email: normalizedEmail,
      });
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res.status(422).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const { _id, name, email: userEmail, isVerified, role, isAdmin } = user;

    res.json({
      token,
      user: { _id, name, email: userEmail, isVerified, role, isAdmin },
      message: "Signin successful!",
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Signin failed", details: err.message });
  }
});

module.exports = router;
