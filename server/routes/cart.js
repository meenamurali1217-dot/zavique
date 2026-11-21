const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalUser } = require('../middleware/auth');

// Helper to get or create cart
function getOrCreateCart(userId, sessionId) {
  let cart;
  if (userId) {
    cart = db.get('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      const res = db.run('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cart = db.get('SELECT * FROM carts WHERE id = ?', [res.lastInsertRowid]);
    }
  } else if (sessionId) {
    cart = db.get('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
    if (!cart) {
      const res = db.run('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
      cart = db.get('SELECT * FROM carts WHERE id = ?', [res.lastInsertRowid]);
    }
  }
  return cart;
}

// GET /api/cart - Get current cart contents
router.get('/', optionalUser, (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const userId = req.user ? req.user.id : null;

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: { items: [], itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }
      });
    }

    const cart = getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.json({
        success: true,
        data: { items: [], itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }
      });
    }

    const items = db.all(
      `SELECT
        ci.id as cart_item_id, ci.quantity, ci.unit_price,
        p.id as product_id, p.name, p.slug, p.sku, p.main_image, p.stock_quantity,
        pv.id as variant_id, pv.name as variant_name, pv.variant_value, pv.stock_quantity as variant_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    let itemCount = 0;
    let subtotal = 0;

    const formattedItems = items.map(item => {
      const lineTotal = item.unit_price * item.quantity;
      itemCount += item.quantity;
      subtotal += lineTotal;
      return {
        ...item,
        line_total: lineTotal
      };
    });

    const freeShippingThreshold = 5000;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 250;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shippingFee + tax;

    res.json({
      success: true,
      data: {
        cartId: cart.id,
        items: formattedItems,
        itemCount,
        subtotal,
        shippingFee,
        tax,
        total,
        freeShippingThreshold,
        freeShippingQualified: subtotal >= freeShippingThreshold
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', optionalUser, (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    const userId = req.user ? req.user.id : null;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    let unitPrice = product.price;
    if (variantId) {
      const variant = db.get('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [variantId, productId]);
      if (variant) unitPrice = variant.price;
    }

    const cart = getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Could not create or locate cart' });
    }

    // Check if item already in cart
    const existingItem = db.get(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [cart.id, productId, variantId || null, variantId || null]
    );

    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (existingItem) {
      const newQty = existingItem.quantity + addQty;
      db.run('UPDATE cart_items SET quantity = ?, unit_price = ? WHERE id = ?', [newQty, unitPrice, existingItem.id]);
    } else {
      db.run(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [cart.id, productId, variantId || null, addQty, unitPrice]
      );
    }

    // Get updated total count
    const countRow = db.get('SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE cart_id = ?', [cart.id]);

    res.json({
      success: true,
      message: `Added ${product.name} to cart`,
      itemCount: countRow ? countRow.total : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cart/update - Update quantity
router.put('/update', optionalUser, (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      db.run('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
    } else {
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [qty, cartItemId]);
    }

    res.json({ success: true, message: 'Cart updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart/item/:id - Remove item
router.delete('/item/:id', optionalUser, (req, res) => {
  try {
    db.run('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/sync - Sync localStorage cart items into authenticated user cart
router.post('/sync', optionalUser, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User must be authenticated to sync cart' });
    }

    const { items = [] } = req.body;
    const cart = getOrCreateCart(req.user.id, null);

    for (const item of items) {
      if (!item.productId) continue;
      const product = db.get('SELECT id, price FROM products WHERE id = ?', [item.productId]);
      if (!product) continue;

      const unitPrice = item.price || product.price;
      const variantId = item.variantId || null;
      const qty = item.quantity || 1;

      const existing = db.get(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
        [cart.id, product.id, variantId, variantId]
      );

      if (existing) {
        db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [qty, existing.id]);
      } else {
        db.run(
          'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
          [cart.id, product.id, variantId, qty, unitPrice]
        );
      }
    }

    const countRow = db.get('SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE cart_id = ?', [cart.id]);

    res.json({
      success: true,
      message: 'Cart synchronized successfully',
      itemCount: countRow ? countRow.total : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
