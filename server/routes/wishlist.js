const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireUser } = require('../middleware/auth');

// GET /api/wishlist - Get current user wishlist
router.get('/', requireUser, (req, res) => {
  try {
    const items = db.all(
      `SELECT
        w.id as wishlist_id, w.created_at as added_at,
        p.id as product_id, p.name, p.slug, p.sku, p.price, p.compare_price,
        p.main_image, p.stock_quantity, p.rating, p.reviews_count,
        c.name as category_name
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wishlist/toggle - Add/Remove product from wishlist
router.post('/toggle', requireUser, (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const existing = db.get('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    let inWishlist = false;
    if (existing) {
      db.run('DELETE FROM wishlists WHERE id = ?', [existing.id]);
      inWishlist = false;
    } else {
      db.run('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
      inWishlist = true;
    }

    const countRow = db.get('SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      inWishlist,
      message: inWishlist ? 'Saved to your Wishlist' : 'Removed from your Wishlist',
      count: countRow ? countRow.count : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
