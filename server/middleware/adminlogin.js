// server/middleware/adminlogin.js
const requireSignin = require("./requireSignin");

const adminLogin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
};

module.exports = [requireSignin, adminLogin];