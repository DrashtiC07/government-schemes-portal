const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }, // could be Google Drive/Cloudinary link
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PDF", pdfSchema);
