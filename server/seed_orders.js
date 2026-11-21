const db = require('./db');

function seedOrders() {
  console.log('--- Seeding Demo Orders for Admin & Customer Tracking ---');

  const existingOrders = db.get('SELECT COUNT(*) as cnt FROM orders');
  if (existingOrders.cnt > 0) {
    console.log('• Orders already seeded.');
    return;
  }

  const user = db.get('SELECT * FROM users WHERE email = ?', ['customer@erlux.com']);
  const p1 = db.get('SELECT * FROM products WHERE sku = ?', ['ERL-FRAG-001']);
  const p2 = db.get('SELECT * FROM products WHERE sku = ?', ['ERL-WAT-001']);
  const p3 = db.get('SELECT * FROM products WHERE sku = ?', ['ERL-GIFT-001']);

  const shippingAddr = {
    name: 'Lady Victoria Sterling',
    phone: '+91 98765 43210',
    address_line1: 'Penthouse 42, The Imperial Towers',
    address_line2: 'Tardeo',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400034',
    country: 'India'
  };

  // Order 1: Delivered
  const o1 = db.run(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_address, billing_address, subtotal, discount_amount, coupon_code,
      shipping_fee, tax_amount, total_amount, payment_method, payment_status,
      payment_id, order_status, notes, tracking_number, courier_name, created_at
    ) VALUES (
      'ERL-2026-1001', ?, ?, ?, ?,
      ?, ?, 18500, 1850, 'ERLUX10',
      0, 2997, 19647, 'RAZORPAY', 'PAID',
      'pay_luxury_98234123', 'DELIVERED', 'Leave with concierge at reception', 'BLUEDART-88239120', 'BlueDart Express',
      datetime('now', '-5 days')
    )`,
    [user ? user.id : null, shippingAddr.name, 'customer@erlux.com', shippingAddr.phone, JSON.stringify(shippingAddr), JSON.stringify(shippingAddr)]
  );
  db.run(
    `INSERT INTO order_items (order_id, product_id, product_name, sku, variant_name, price, quantity, total_price, image_url)
     VALUES (?, ?, ?, ?, '100ml Flacon', 18500, 1, 18500, ?)`,
    [o1.lastInsertRowid, p1.id, p1.name, p1.sku, p1.main_image]
  );
  db.run(
    `INSERT INTO order_status_history (order_id, status, notes, changed_by, created_at)
     VALUES (?, 'DELIVERED', 'Delivered and signed by concierge', 'Courier Sync', datetime('now', '-2 days'))`,
    [o1.lastInsertRowid]
  );

  // Order 2: Shipped / In Transit
  const o2 = db.run(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_address, billing_address, subtotal, discount_amount, coupon_code,
      shipping_fee, tax_amount, total_amount, payment_method, payment_status,
      payment_id, order_status, notes, tracking_number, courier_name, created_at
    ) VALUES (
      'ERL-2026-1002', ?, ?, ?, ?,
      ?, ?, 48500, 0, NULL,
      0, 8730, 57230, 'CARD', 'PAID',
      'pay_luxury_98234991', 'SHIPPED', 'Insured White-Glove Courier Delivery', 'DHL-VIP-7729103', 'DHL Express Luxe',
      datetime('now', '-1 days')
    )`,
    [user ? user.id : null, shippingAddr.name, 'customer@erlux.com', shippingAddr.phone, JSON.stringify(shippingAddr), JSON.stringify(shippingAddr)]
  );
  db.run(
    `INSERT INTO order_items (order_id, product_id, product_name, sku, variant_name, price, quantity, total_price, image_url)
     VALUES (?, ?, ?, ?, 'Silver / Navy', 48500, 1, 48500, ?)`,
    [o2.lastInsertRowid, p2.id, p2.name, p2.sku, p2.main_image]
  );
  db.run(
    `INSERT INTO order_status_history (order_id, status, notes, changed_by, created_at)
     VALUES (?, 'SHIPPED', 'Dispatched via DHL Express Luxe Armored Transport', 'Admin Logistics', datetime('now', '-18 hours'))`,
    [o2.lastInsertRowid]
  );

  // Order 3: Processing (COD)
  const o3 = db.run(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_address, billing_address, subtotal, discount_amount, coupon_code,
      shipping_fee, tax_amount, total_amount, payment_method, payment_status,
      order_status, notes, created_at
    ) VALUES (
      'ERL-2026-1003', ?, ?, ?, ?,
      ?, ?, 34000, 0, NULL,
      0, 6120, 40120, 'COD', 'PENDING',
      'PROCESSING', 'Call before arrival', datetime('now', '-3 hours')
    )`,
    [user ? user.id : null, 'Lord Alistair Sterling', 'alistair@sterling-holdings.co.uk', '+91 99887 76655', JSON.stringify(shippingAddr), JSON.stringify(shippingAddr)]
  );
  db.run(
    `INSERT INTO order_items (order_id, product_id, product_name, sku, variant_name, price, quantity, total_price, image_url)
     VALUES (?, ?, ?, ?, 'Complete Set', 34000, 1, 34000, ?)`,
    [o3.lastInsertRowid, p3.id, p3.name, p3.sku, p3.main_image]
  );

  console.log('✓ Demo Orders seeded with items and status logs.');
}

if (require.main === module) {
  seedOrders();
}

module.exports = { seedOrders };
