const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'erlux_luxury_secret_key_2026';

function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.user_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }

  const user = db.get('SELECT id, full_name, email, phone, status FROM users WHERE id = ?', [decoded.userId]);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ success: false, message: 'User account not found or inactive' });
  }

  req.user = user;
  next();
}

function optionalUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.user_token;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      const user = db.get('SELECT id, full_name, email, phone FROM users WHERE id = ?', [decoded.userId]);
      if (user) req.user = user;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Executive admin authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.adminId) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }

  const admin = db.get('SELECT id, username, email, role, full_name, is_active FROM admins WHERE id = ?', [decoded.adminId]);
  if (!admin || !admin.is_active) {
    return res.status(403).json({ success: false, message: 'Admin access denied or inactive' });
  }

  req.admin = admin;
  next();
}

module.exports = {
  signToken,
  verifyToken,
  requireUser,
  optionalUser,
  requireAdmin
};
