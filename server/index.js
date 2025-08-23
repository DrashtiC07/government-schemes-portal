const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path"); // Added path module for static file serving
const { MONGOURI, EMAIL, GPASS } = require("./config/keys");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5001; 

// Middleware
app.use(
  cors({
    origin: [ "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/static", express.static(path.join(__dirname, "../client/public")));
app.use(
  "/images",
  express.static(path.join(__dirname, "../client/public/images"))
);

// Database connection
mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB!");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Error connecting to MongoDB:", err);
  process.exit(1);
});

// Models
require("./models/user");
require("./models/pdf");
require("./models/contributor");
require("./models/doubts");
require("./models/contact");
require("./models/event_form");
require("./models/feedback");
require("./models/scheme");

// OTP helper functions
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/contributor"));
app.use("/api", require("./routes/admin"));
app.use("/api", require("./routes/admin_pdf"));
app.use("/api", require("./routes/profile"));
app.use("/api", require("./routes/myscheme"));
app.use("/api", require("./routes/contact")); 

// Home route
app.get("/", (req, res) => {
  res.json("🚀 Welcome to FindSchme API");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
