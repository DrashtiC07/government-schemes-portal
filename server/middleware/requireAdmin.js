// server/middleware/requireAdmin.js
module.exports = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      return next(); // allow
    } else {
      return res.status(403).json({ error: "Admin access required" });
    }
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(500).json({ error: "Server error in admin check" });
  }
};
