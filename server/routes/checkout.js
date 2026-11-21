const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalUser } = require('../middleware/auth');

// POST /api/checkout/validate-coupon
router.post('/validate-coupon', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.get('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [cleanCode]);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promotional code' });
    }

    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum luxury order of ₹${coupon.min_order_amount.toLocaleString('en-IN')}`
      });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'This privilege code has reached its maximum redemption limit' });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      success: true,
      code: coupon.code,
      description: coupon.description,
      discountAmount,
      message: `Coupon '${coupon.code}' applied: ₹${discountAmount.toLocaleString('en-IN')} off`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/checkout/create-order
router.post('/create-order', optionalUser, (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      payment_method = 'COD',
      coupon_code,
      items = [],
      cartId,
      notes
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return res.status(400).json({ success: false, message: 'Customer contact and shipping details are required' });
    }

    let orderItems = [];

    // If items passed directly or need to fetch from cart
    if (items && items.length > 0) {
      orderItems = items;
    } else if (cartId) {
      const dbCartItems = db.all(
        `SELECT ci.quantity, ci.unit_price, ci.variant_id, p.id as product_id, p.name, p.sku, p.main_image, pv.name as variant_name
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         LEFT JOIN product_variants pv ON ci.variant_id = pv.id
         WHERE ci.cart_id = ?`,
        [cartId]
      );
      orderItems = dbCartItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.name,
        sku: item.sku,
        variant_name: item.variant_name || null,
        price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
        image_url: item.main_image
      }));
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const it of orderItems) {
      subtotal += (it.price * it.quantity);
    }

    // Apply coupon if valid
    let discountAmount = 0;
    let appliedCoupon = null;
    if (coupon_code) {
      const coupon = db.get('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [coupon_code.trim().toUpperCase()]);
      if (coupon && subtotal >= coupon.min_order_amount) {
        appliedCoupon = coupon.code;
        if (coupon.discount_type === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount;
          }
        } else {
          discountAmount = coupon.discount_value;
        }
        // Increment coupon usage
        db.run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [coupon.id]);
      }
    }

    const freeShippingThreshold = 5000;
    const shippingFee = (subtotal - discountAmount) >= freeShippingThreshold ? 0 : 250;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.18);
    const totalAmount = taxableAmount + shippingFee + taxAmount;

    // Generate Unique Order Number: ERL-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ERL-${new Date().getFullYear()}-${randomSuffix}`;

    // Execute order creation inside transaction
    const orderResult = db.transaction(() => {
      const orderInsert = db.run(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_address, billing_address, subtotal, discount_amount, coupon_code,
          shipping_fee, tax_amount, total_amount, payment_method, payment_status,
          order_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
        [
          orderNumber,
          req.user ? req.user.id : null,
          customer_name.trim(),
          customer_email.trim().toLowerCase(),
          customer_phone.trim(),
          typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
          typeof billing_address === 'string' ? billing_address : JSON.stringify(billing_address || shipping_address),
          subtotal,
          discountAmount,
          appliedCoupon,
          shippingFee,
          taxAmount,
          totalAmount,
          payment_method,
          payment_method === 'RAZORPAY' ? 'PAID' : 'PENDING',
          notes || ''
        ]
      );

      const orderId = orderInsert.lastInsertRowid;

      // Insert Order Items and Update Inventory
      for (const item of orderItems) {
        db.run(
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, variant_name, price, quantity, total_price, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.variant_id || null,
            item.product_name,
            item.sku || 'SKU',
            item.variant_name || null,
            item.price,
            item.quantity,
            item.price * item.quantity,
            item.image_url || ''
          ]
        );

        // Deduct inventory from product
        const curProd = db.get('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
        if (curProd) {
          const newStock = Math.max(0, curProd.stock_quantity - item.quantity);
          db.run('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);

          // Log inventory
          db.run(
            `INSERT INTO inventory_logs (product_id, variant_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
             VALUES (?, ?, 'SALE', ?, ?, ?, ?, 'Customer Order Checkout')`,
            [item.product_id, item.variant_id || null, -item.quantity, curProd.stock_quantity, newStock, `Order ${orderNumber}`]
          );
        }
      }

      // Initial Order Status History
      db.run(
        `INSERT INTO order_status_history (order_id, status, notes, changed_by)
         VALUES (?, 'CONFIRMED', 'Order received and confirmed by client', 'System Checkout')`,
        [orderId]
      );

      // Clear cart items if cartId provided
      if (cartId) {
        db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
      }

      return { orderId, orderNumber };
    });

    res.status(201).json({
      success: true,
      message: 'Luxury Order placed successfully',
      data: {
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        totalAmount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        paymentMethod: payment_method,
        customerName: customer_name,
        customerEmail: customer_email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/checkout/order/:orderNumber - Order received details
router.get('/order/:orderNumber', (req, res) => {
  try {
    const order = db.get('SELECT * FROM orders WHERE order_number = ?', [req.params.orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

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

module.exports = router;
