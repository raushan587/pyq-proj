const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

  if (!token) {
    console.log(" [verifyToken] No token provided.");
    return res.status(403).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" [verifyToken] Token verified. User:", decoded);
    req.user = decoded;
    res.locals.user = decoded; //  Makes user info available in EJS
    next();
  } catch (err) {
    console.log(" [verifyToken] Invalid or expired token:", err.message);
    return res.status(401).redirect('/login');
  }
};
