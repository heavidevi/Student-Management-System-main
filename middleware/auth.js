const jwt = require("jsonwebtoken");

// Use environment variable for JWT secret
const SECRET_KEY = process.env.JWT_SECRET || "fallback_development_key_only";

// Middleware: verify JWT and attach user to request
function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

// Middleware: check for specific role
function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send("Access Denied");
    }
    next();
  };
}

// Generate JWT token with proper payload structure
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, SECRET_KEY, { 
    expiresIn: "24h",
    algorithm: 'HS256'
  });
}

// Utility function to verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

module.exports = {
  authenticate,
  authorizeRole,
  generateToken,
  verifyToken
};
