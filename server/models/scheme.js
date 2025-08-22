// server/models/scheme.js
const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    schemeFullName: { type: String, required: true },
    schemeMinistry: String,
    schemeLink: String,
    image: String,
    schemeDetail: String,
    benefits: String,
    eligibility: String,

    // Filters (keep your existing fields)
    state: String,
    city: String,
    gender: String,
    caste: String,
    age: String,

    // Moderation & ownership
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedAt: Date,

    documentsRequired: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
