const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalUser } = require('../middleware/auth');

// POST /api/products/:id/reviews - Submit review
router.post('/products/:id/reviews', optionalUser, (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { rating, title, comment, name, email } = req.body;

    if (!rating || !comment || !name || !email) {
      return res.status(400).json({ success: false, message: 'Rating, comment, your name, and email are required' });
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

    db.run(
      `INSERT INTO reviews (product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
      [productId, req.user ? req.user.id : null, name.trim(), email.trim().toLowerCase(), numRating, title ? title.trim() : null, comment.trim()]
    );

    // Recalculate average rating & review count for product
    const stats = db.get(
      `SELECT COUNT(*) as count, AVG(rating) as avg_rating
       FROM reviews WHERE product_id = ? AND status = 'APPROVED'`,
      [productId]
    );

    if (stats) {
      const avg = Math.round((stats.avg_rating || 5) * 10) / 10;
      db.run('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', [avg, stats.count, productId]);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your distinguished review. It has been published.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
