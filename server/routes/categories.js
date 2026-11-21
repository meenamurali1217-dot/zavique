const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/categories - Get all active categories with their subcategories and counts
router.get('/', (req, res) => {
  try {
    const categories = db.all(
      `SELECT id, name, slug, description, tagline, image_url, banner_url, display_order
       FROM categories
       WHERE is_active = 1
       ORDER BY display_order ASC`
    );

    const subcategories = db.all(
      `SELECT id, category_id, name, slug, description, image_url, display_order
       FROM subcategories
       WHERE is_active = 1
       ORDER BY display_order ASC`
    );

    const counts = db.all(
      `SELECT category_id, COUNT(*) as product_count
       FROM products
       WHERE is_active = 1
       GROUP BY category_id`
    );
    const countMap = {};
    for (const c of counts) {
      countMap[c.category_id] = c.product_count;
    }

    const result = categories.map(cat => ({
      ...cat,
      product_count: countMap[cat.id] || 0,
      subcategories: subcategories.filter(sub => sub.category_id === cat.id)
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories/:slug - Single category with subcategories & featured products
router.get('/:slug', (req, res) => {
  try {
    const category = db.get(
      `SELECT id, name, slug, description, tagline, image_url, banner_url
       FROM categories
       WHERE slug = ? AND is_active = 1`,
      [req.params.slug]
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategories = db.all(
      `SELECT id, name, slug, description, image_url, display_order
       FROM subcategories
       WHERE category_id = ? AND is_active = 1
       ORDER BY display_order ASC`,
      [category.id]
    );

    const products = db.all(
      `SELECT id, sku, name, slug, brand, price, compare_price, main_image, is_bestseller, is_new_arrival, rating, reviews_count
       FROM products
       WHERE category_id = ? AND is_active = 1
       ORDER BY is_featured DESC, rating DESC
       LIMIT 8`,
      [category.id]
    );

    res.json({
      success: true,
      data: {
        ...category,
        subcategories,
        products
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
