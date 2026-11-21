const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAdmin } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required' });
    }

    const admin = db.get('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid executive credentials or inactive account' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid executive credentials' });
    }

    db.run('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    const token = signToken({ adminId: admin.id, role: admin.role });

    res.json({
      success: true,
      message: 'Executive authentication granted',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/me
router.get('/me', requireAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// GET /api/admin/metrics - Comprehensive KPI and chart data
router.get('/metrics', requireAdmin, (req, res) => {
  try {
    const revenueRow = db.get("SELECT COALESCE(SUM(total_amount), 0) as gross_revenue FROM orders WHERE order_status != 'CANCELLED'");
    const ordersCountRow = db.get("SELECT COUNT(*) as total_orders FROM orders");
    const customersCountRow = db.get("SELECT COUNT(*) as total_customers FROM users WHERE status = 'active'");
    const lowStockRow = db.get("SELECT COUNT(*) as low_stock_count FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = 1");

    // Monthly revenue breakdown (last 6 months)
    const monthlyRevenue = db.all(`
      SELECT strftime('%Y-%m', created_at) as month,
             COALESCE(SUM(total_amount), 0) as revenue,
             COUNT(*) as order_count
      FROM orders
      WHERE order_status != 'CANCELLED'
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `);

    // Orders by category
    const categoryStats = db.all(`
      SELECT c.name as category_name, COUNT(oi.id) as items_sold, COALESCE(SUM(oi.total_price), 0) as category_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY category_revenue DESC
    `);

    // Recent 6 orders
    const recentOrders = db.all(`
      SELECT id, order_number, customer_name, customer_email, total_amount, payment_method, payment_status, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        grossRevenue: revenueRow?.gross_revenue || 0,
        totalOrders: ordersCountRow?.total_orders || 0,
        totalCustomers: customersCountRow?.total_customers || 0,
        lowStockCount: lowStockRow?.low_stock_count || 0,
        monthlyRevenue: monthlyRevenue.reverse(),
        categoryStats,
        recentOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/products - Product catalog for management
router.get('/products', requireAdmin, (req, res) => {
  try {
    const products = db.all(`
      SELECT
        p.*,
        c.name as category_name,
        s.name as subcategory_name,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/products - Create product
router.post('/products', requireAdmin, (req, res) => {
  try {
    const {
      sku, name, category_id, subcategory_id, collection_range, gender = 'Unisex',
      price, compare_price, cost_price, stock_quantity = 50, low_stock_threshold = 5,
      short_description, full_description, fragrance_notes_top, fragrance_notes_middle,
      fragrance_notes_base, specifications, main_image, is_featured = 0,
      is_bestseller = 0, is_new_arrival = 1
    } = req.body;

    if (!sku || !name || !category_id || !price || !main_image) {
      return res.status(400).json({ success: false, message: 'SKU, Name, Category, Price, and Main Image are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const result = db.run(`
      INSERT INTO products (
        sku, name, slug, category_id, subcategory_id, collection_range, gender,
        price, compare_price, cost_price, stock_quantity, low_stock_threshold,
        short_description, full_description, fragrance_notes_top, fragrance_notes_middle,
        fragrance_notes_base, specifications, main_image, is_featured, is_bestseller,
        is_new_arrival, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      sku.trim(), name.trim(), slug, category_id, subcategory_id || null, collection_range || null, gender,
      parseFloat(price), compare_price ? parseFloat(compare_price) : null, cost_price ? parseFloat(cost_price) : null,
      parseInt(stock_quantity, 10), parseInt(low_stock_threshold, 10),
      short_description || '', full_description || '', fragrance_notes_top || '', fragrance_notes_middle || '',
      fragrance_notes_base || '', specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null,
      main_image, is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0
    ]);

    const newId = result.lastInsertRowid;

    // Log initial inventory
    db.run(
      `INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
       VALUES (?, 'INITIAL', ?, 0, ?, 'Product Created via Admin', ?)`,
      [newId, stock_quantity, stock_quantity, req.admin.full_name]
    );

    res.status(201).json({ success: true, message: 'Product created successfully', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name, category_id, subcategory_id, collection_range, gender,
      price, compare_price, stock_quantity, low_stock_threshold,
      short_description, full_description, main_image, is_featured,
      is_bestseller, is_new_arrival, is_active
    } = req.body;

    const cur = db.get('SELECT stock_quantity FROM products WHERE id = ?', [id]);
    if (!cur) return res.status(404).json({ success: false, message: 'Product not found' });

    db.run(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        subcategory_id = ?,
        collection_range = ?,
        gender = COALESCE(?, gender),
        price = COALESCE(?, price),
        compare_price = ?,
        stock_quantity = COALESCE(?, stock_quantity),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        short_description = COALESCE(?, short_description),
        full_description = COALESCE(?, full_description),
        main_image = COALESCE(?, main_image),
        is_featured = COALESCE(?, is_featured),
        is_bestseller = COALESCE(?, is_bestseller),
        is_new_arrival = COALESCE(?, is_new_arrival),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, category_id, subcategory_id || null, collection_range || null, gender,
      price, compare_price, stock_quantity, low_stock_threshold,
      short_description, full_description, main_image, is_featured,
      is_bestseller, is_new_arrival, is_active, id
    ]);

    // If stock changed, log it
    if (stock_quantity !== undefined && stock_quantity !== cur.stock_quantity) {
      const diff = stock_quantity - cur.stock_quantity;
      db.run(
        `INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
         VALUES (?, 'ADJUSTMENT', ?, ?, ?, 'Stock updated via product edit', ?)`,
        [id, diff, cur.stock_quantity, stock_quantity, req.admin.full_name]
      );
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/orders - Order management list
router.get('/orders', requireAdmin, (req, res) => {
  try {
    const { status, search } = req.query;
    let whereClauses = [];
    let params = [];

    if (status && status !== 'ALL') {
      whereClauses.push('o.order_status = ?');
      params.push(status);
    }
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
      params.push(s, s, s);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const orders = db.all(`
      SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      ${whereSql}
      ORDER BY o.created_at DESC
    `, params);

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/orders/:id - Detailed order view
router.get('/orders/:id', requireAdmin, (req, res) => {
  try {
    const order = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const items = db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = db.all('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

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

// PUT /api/admin/orders/:id/status - Update order status with audit log
router.put('/orders/:id/status', requireAdmin, (req, res) => {
  try {
    const { status, notes, tracking_number, courier_name } = req.body;
    const orderId = req.params.id;

    const order = db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    db.run(`
      UPDATE orders SET
        order_status = ?,
        tracking_number = COALESCE(?, tracking_number),
        courier_name = COALESCE(?, courier_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, tracking_number, courier_name, orderId]);

    // Log history
    db.run(`
      INSERT INTO order_status_history (order_id, status, notes, changed_by)
       VALUES (?, ?, ?, ?)
    `, [orderId, status, notes || `Status updated to ${status}`, req.admin.full_name]);

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/inventory - Inventory overview & alerts
router.get('/inventory', requireAdmin, (req, res) => {
  try {
    const items = db.all(`
      SELECT
        p.id, p.sku, p.name, p.main_image, p.price, p.stock_quantity, p.low_stock_threshold,
        c.name as category_name,
        CASE
          WHEN p.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock_quantity ASC
    `);

    const logs = db.all(`
      SELECT l.*, p.name as product_name, p.sku
      FROM inventory_logs l
      JOIN products p ON l.product_id = p.id
      ORDER BY l.created_at DESC
      LIMIT 20
    `);

    res.json({ success: true, data: { items, logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/inventory/adjust - Restock or adjust inventory
router.post('/inventory/adjust', requireAdmin, (req, res) => {
  try {
    const { productId, changeType = 'RESTOCK', quantityChange, notes } = req.body;
    if (!productId || !quantityChange) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity change are required' });
    }

    const product = db.get('SELECT stock_quantity FROM products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const change = parseInt(quantityChange, 10);
    const newStock = Math.max(0, product.stock_quantity + change);

    db.run('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, productId]);

    db.run(`
      INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [productId, changeType, change, product.stock_quantity, newStock, notes || 'Manual adjustment', req.admin.full_name]);

    res.json({ success: true, message: 'Stock adjusted successfully', newStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/customers
router.get('/customers', requireAdmin, (req, res) => {
  try {
    const customers = db.all(`
      SELECT
        u.id, u.full_name, u.email, u.phone, u.status, u.created_at, u.last_login,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders_count,
        COALESCE((SELECT SUM(total_amount) FROM orders WHERE user_id = u.id AND order_status != 'CANCELLED'), 0) as total_spend
      FROM users u
      ORDER BY total_spend DESC, u.created_at DESC
    `);
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/coupons
router.get('/coupons', requireAdmin, (req, res) => {
  try {
    const coupons = db.all('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/coupons
router.post('/coupons', requireAdmin, (req, res) => {
  try {
    const { code, description, discount_type = 'PERCENTAGE', discount_value, min_order_amount = 0, max_discount_amount, usage_limit } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }

    db.run(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [code.trim().toUpperCase(), description || '', discount_type, parseFloat(discount_value), parseFloat(min_order_amount), max_discount_amount ? parseFloat(max_discount_amount) : null, usage_limit ? parseInt(usage_limit, 10) : null]);

    res.status(201).json({ success: true, message: 'Privilege Coupon created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/reviews
router.get('/reviews', requireAdmin, (req, res) => {
  try {
    const reviews = db.all(`
      SELECT r.*, p.name as product_name, p.main_image
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/reviews/:id/status
router.put('/reviews/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    db.run('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/reports/sales-csv
router.get('/reports/sales-csv', requireAdmin, (req, res) => {
  try {
    const orders = db.all(`
      SELECT order_number, customer_name, customer_email, payment_method, payment_status, order_status, total_amount, created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    let csv = 'Order Number,Customer Name,Customer Email,Payment Method,Payment Status,Order Status,Total Amount (INR),Date\n';
    for (const o of orders) {
      csv += `"${o.order_number}","${o.customer_name}","${o.customer_email}","${o.payment_method}","${o.payment_status}","${o.order_status}",${o.total_amount},"${o.created_at}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="erlux_sales_report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
