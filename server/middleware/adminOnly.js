// middleware/adminOnly.js
module.exports = function adminOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.error("❌ Error in adminOnly middleware:", err);
    res.status(500).json({ error: "Server error in admin middleware." });
  }
};
