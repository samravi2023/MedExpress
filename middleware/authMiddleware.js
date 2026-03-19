const jwt = require('jsonwebtoken');
const { getRequiredEnv } = require('../utils/env');

const getJwtSecret = () => getRequiredEnv('JWT_SECRET');

exports.protect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "User role not authorized" });
    }
    next();
  };
};

exports.getJwtSecret = getJwtSecret;