// server/middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "dc50dc2eec8f14ad988ce605d0c932e2ec8b12e28760ffb85fd1a33efaaba06b"
    );
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;