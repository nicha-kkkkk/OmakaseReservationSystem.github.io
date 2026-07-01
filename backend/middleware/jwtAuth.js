// backend/middleware/jwtAuth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'kitsune_secret';

// Middleware to verify JWT token
function jwtAuth(req, res, next) {
  const authHeader = req.headers['authorization']; // e.g. "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const secretKey = process.env.JWT_SECRET || 'kitsune_secret';
    const decoded = jwt.verify(token, secretKey);

    // Attach user data to request object
    req.user = decoded;

    next(); // Continue to next middleware or route
  } catch (err) {
    return res.status(403).json({ status: 'fail', message: 'Invalid or expired token.' });
  }
}

export default jwtAuth;
