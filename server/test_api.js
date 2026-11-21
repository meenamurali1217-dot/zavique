const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('       ERLUX AUTOMATED INTEGRATION TEST SUITE       ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name} ->`, e.message);
      failed++;
    }
  }

  // 1. Categories
  await test('GET /api/categories returns 9 collections', async () => {
    const res = await get('/api/categories');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.data.length !== 9) throw new Error(`Expected 9 categories, got ${res.data.data.length}`);
  });

  // 2. Products List
  await test('GET /api/products returns catalog and price bounds', async () => {
    const res = await get('/api/products');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.data.products || res.data.data.products.length === 0) throw new Error('No products returned');
    if (!res.data.data.priceBounds || res.data.data.priceBounds.max <= 0) throw new Error('Invalid price bounds');
  });

  // 3. Products Filter by Category
  await test('GET /api/products?category=fragrance filters perfumes', async () => {
    const res = await get('/api/products?category=fragrance');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const prods = res.data.data.products;
    if (prods.length === 0) throw new Error('No fragrance products found');
    if (!prods.every(p => p.category_slug === 'fragrance')) throw new Error('Found non-fragrance product');
  });

  // 4. Product Details
  await test('GET /api/products/chairman-special-extrait-de-parfum returns flagship details', async () => {
    const res = await get('/api/products/chairman-special-extrait-de-parfum');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const p = res.data.data;
    if (p.sku !== 'ERL-FRAG-001') throw new Error(`Expected ERL-FRAG-001, got ${p.sku}`);
    if (!p.variants || p.variants.length === 0) throw new Error('Variants missing');
    if (!p.specifications) throw new Error('Specifications missing');
  });

  // 5. Customer Authentication
  let customerToken = null;
  await test('POST /api/auth/login logs in demo customer', async () => {
    const res = await post('/api/auth/login', { email: 'customer@erlux.com', password: 'Customer@2026' });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.data?.message}`);
    if (!res.data.token) throw new Error('Token missing');
    customerToken = res.data.token;
  });

  // 6. Customer Profile
  await test('GET /api/auth/me returns authenticated customer profile', async () => {
    const res = await get('/api/auth/me', { 'Authorization': `Bearer ${customerToken}` });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.user.email !== 'customer@erlux.com') throw new Error('Wrong user returned');
  });

  // 7. Cart Add & Get
  await test('POST /api/cart/add and GET /api/cart works with session', async () => {
    const testSession = 'test_sess_' + Date.now();
    const addRes = await post('/api/cart/add', { productId: 1, quantity: 2, sessionId: testSession }, { 'x-session-id': testSession });
    if (addRes.status !== 200) throw new Error(`Add failed: ${addRes.data?.message}`);

    const cartRes = await get('/api/cart', { 'x-session-id': testSession });
    if (cartRes.status !== 200) throw new Error(`Get cart failed`);
    if (cartRes.data.data.itemCount < 2) throw new Error(`Expected >=2 items, got ${cartRes.data.data.itemCount}`);
  });

  // 8. Coupon Validation
  await test('POST /api/checkout/validate-coupon validates ERLUX10', async () => {
    const res = await post('/api/checkout/validate-coupon', { code: 'ERLUX10', subtotal: 18500 });
    if (res.status !== 200) throw new Error(`Coupon validation failed: ${res.data?.message}`);
    if (res.data.discountAmount <= 0) throw new Error('Discount amount should be > 0');
  });

  // 9. Admin Authentication
  let adminToken = null;
  await test('POST /api/admin/login authenticates super admin', async () => {
    const res = await post('/api/admin/login', { email: 'admin@erlux.com', password: 'ErLux@2026!Admin' });
    if (res.status !== 200) throw new Error(`Admin login failed: ${res.data?.message}`);
    if (!res.data.token) throw new Error('Admin token missing');
    adminToken = res.data.token;
  });

  // 10. Admin Metrics
  await test('GET /api/admin/metrics returns real-time enterprise metrics', async () => {
    const res = await get('/api/admin/metrics', { 'Authorization': `Bearer ${adminToken}` });
    if (res.status !== 200) throw new Error(`Metrics failed: ${res.status}`);
    if (res.data.data.grossRevenue <= 0) throw new Error('Gross revenue should be > 0');
    if (res.data.data.totalOrders <= 0) throw new Error('Total orders should be > 0');
  });

  // 11. Static Pages
  await test('GET / and /admin serve valid HTML documents', async () => {
    const homeRes = await get('/');
    if (homeRes.status !== 200) throw new Error(`Home status ${homeRes.status}`);
    if (!homeRes.raw.includes('ERLUX')) throw new Error('Home page missing ERLUX brand');

    const adminRes = await get('/admin');
    if (adminRes.status !== 200) throw new Error(`Admin status ${adminRes.status}`);
    if (!adminRes.raw.includes('Executive Atelier Portal')) throw new Error('Admin page missing title');
  });

  console.log('====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner fatal:', err);
  process.exit(1);
});
