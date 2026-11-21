const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireUser } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = db.run(
      `INSERT INTO users (full_name, email, phone, password_hash, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [full_name.trim(), cleanEmail, phone ? phone.trim() : null, password_hash]
    );

    const userId = result.lastInsertRowid;
    const token = signToken({ userId });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact concierge.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password' });
    }

    // Update last login
    db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);

    const token = signToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Welcome back to ERLUX',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - Authenticated user details
router.get('/me', requireUser, (req, res) => {
  try {
    const addresses = db.all(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    const ordersCount = db.get(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total_spent
       FROM orders WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      user: req.user,
      addresses,
      stats: {
        ordersCount: ordersCount ? ordersCount.count : 0,
        totalSpent: ordersCount ? ordersCount.total_spent : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', requireUser, (req, res) => {
  try {
    const { full_name, phone, current_password, new_password } = req.body;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const user = db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      if (!bcrypt.compareSync(current_password, user.password_hash)) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(new_password, salt);
      db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    }

    db.run(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name ? full_name.trim() : null, phone ? phone.trim() : null, req.user.id]
    );

    const updatedUser = db.get('SELECT id, full_name, email, phone FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/addresses
router.get('/addresses', requireUser, (req, res) => {
  try {
    const addresses = db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]);
    res.json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/addresses - Add or update address
router.post('/addresses', requireUser, (req, res) => {
  try {
    const { id, type = 'shipping', name, phone, address_line1, address_line2, city, state, postal_code, country = 'India', is_default = 0 } = req.body;

    if (!name || !phone || !address_line1 || !city || !state || !postal_code) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    if (is_default) {
      db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    if (id) {
      db.run(
        `UPDATE addresses SET
          type = ?, name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
          city = ?, state = ?, postal_code = ?, country = ?, is_default = ?
         WHERE id = ? AND user_id = ?`,
        [type, name, phone, address_line1, address_line2 || '', city, state, postal_code, country, is_default ? 1 : 0, id, req.user.id]
      );
    } else {
      db.run(
        `INSERT INTO addresses (user_id, type, name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, type, name, phone, address_line1, address_line2 || '', city, state, postal_code, country, is_default ? 1 : 0]
      );
    }

    const addresses = db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]);
    res.json({ success: true, message: 'Address saved successfully', data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/orders - Customer order history
router.get('/orders', requireUser, (req, res) => {
  try {
    const orders = db.all(
      `SELECT
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items,
        (SELECT image_url FROM order_items WHERE order_id = o.id LIMIT 1) as preview_image
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/orders/:orderNumber - Customer specific order details
router.get('/orders/:orderNumber', requireUser, (req, res) => {
  try {
    const order = db.get(
      'SELECT * FROM orders WHERE order_number = ? AND user_id = ?',
      [req.params.orderNumber, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = db.all(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    const history = db.all(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [order.id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        shipping_address: JSON.parse(order.shipping_address || '{}'),
        billing_address: JSON.parse(order.billing_address || '{}'),
        items,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
