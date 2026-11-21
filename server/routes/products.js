const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/products - Advanced catalog query with multi-filtering, sorting, and pagination
router.get('/', (req, res) => {
  try {
    const {
      category,
      subcategory,
      gender,
      minPrice,
      maxPrice,
      search,
      featured,
      bestseller,
      newArrival,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = ['p.is_active = 1'];
    let params = [];

    // Filter by category (slug or id)
    if (category) {
      if (isNaN(category)) {
        whereClauses.push('c.slug = ?');
        params.push(category);
      } else {
        whereClauses.push('p.category_id = ?');
        params.push(parseInt(category, 10));
      }
    }

    // Filter by subcategory (slug or id)
    if (subcategory) {
      if (isNaN(subcategory)) {
        whereClauses.push('s.slug = ?');
        params.push(subcategory);
      } else {
        whereClauses.push('p.subcategory_id = ?');
        params.push(parseInt(subcategory, 10));
      }
    }

    // Filter by gender
    if (gender) {
      const genders = Array.isArray(gender) ? gender : [gender];
      const placeholders = genders.map(() => '?').join(',');
      whereClauses.push(`p.gender IN (${placeholders})`);
      params.push(...genders);
    }

    // Filter by price range
    if (minPrice && !isNaN(minPrice)) {
      whereClauses.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      whereClauses.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // Filter by flags
    if (featured === '1' || featured === 'true') {
      whereClauses.push('p.is_featured = 1');
    }
    if (bestseller === '1' || bestseller === 'true') {
      whereClauses.push('p.is_bestseller = 1');
    }
    if (newArrival === '1' || newArrival === 'true') {
      whereClauses.push('p.is_new_arrival = 1');
    }

    // Search keyword
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.collection_range LIKE ? OR p.fragrance_notes_top LIKE ? OR c.name LIKE ?)');
      params.push(term, term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting
    let orderBySql = 'ORDER BY p.is_featured DESC, p.created_at DESC';
    if (sort === 'price-low') {
      orderBySql = 'ORDER BY p.price ASC';
    } else if (sort === 'price-high') {
      orderBySql = 'ORDER BY p.price DESC';
    } else if (sort === 'newest') {
      orderBySql = 'ORDER BY p.created_at DESC';
    } else if (sort === 'rating') {
      orderBySql = 'ORDER BY p.rating DESC, p.reviews_count DESC';
    } else if (sort === 'bestseller') {
      orderBySql = 'ORDER BY p.is_bestseller DESC, p.rating DESC';
    }

    // Count total matching
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      ${whereSql}
    `;
    const countRow = db.get(countSql, params);
    const total = countRow ? countRow.total : 0;
    const totalPages = Math.ceil(total / limitNum);

    // Fetch products
    const querySql = `
      SELECT
        p.id, p.sku, p.name, p.slug, p.category_id, p.subcategory_id,
        p.brand, p.collection_range, p.gender, p.price, p.compare_price,
        p.short_description, p.main_image, p.is_featured, p.is_bestseller,
        p.is_new_arrival, p.stock_quantity, p.rating, p.reviews_count,
        c.name as category_name, c.slug as category_slug,
        s.name as subcategory_name, s.slug as subcategory_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      ${whereSql}
      ${orderBySql}
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limitNum, offset];
    const products = db.all(querySql, queryParams);

    // Compute min and max price across catalog for slider bounds
    const priceStats = db.get('SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products WHERE is_active = 1');

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        },
        priceBounds: {
          min: priceStats?.minPrice || 0,
          max: priceStats?.maxPrice || 100000
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:slugOrId - Detailed single product view
router.get('/:slugOrId', (req, res) => {
  try {
    const param = req.params.slugOrId;
    let product;

    if (!isNaN(param)) {
      product = db.get(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, s.name as subcategory_name, s.slug as subcategory_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN subcategories s ON p.subcategory_id = s.id
         WHERE p.id = ? AND p.is_active = 1`,
        [parseInt(param, 10)]
      );
    } else {
      product = db.get(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, s.name as subcategory_name, s.slug as subcategory_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN subcategories s ON p.subcategory_id = s.id
         WHERE p.slug = ? AND p.is_active = 1`,
        [param]
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Parse specifications JSON
    let specifications = {};
    try {
      if (product.specifications) {
        specifications = JSON.parse(product.specifications);
      }
    } catch (e) {
      specifications = {};
    }

    // Gallery images
    const images = db.all(
      `SELECT id, image_url, alt_text, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY display_order ASC`,
      [product.id]
    );

    // Variants
    const variants = db.all(
      `SELECT id, sku, name, variant_type, variant_value, price, compare_price, stock_quantity
       FROM product_variants
       WHERE product_id = ? AND is_active = 1
       ORDER BY price ASC`,
      [product.id]
    );

    // Approved reviews
    const reviews = db.all(
      `SELECT id, reviewer_name, rating, title, comment, created_at
       FROM reviews
       WHERE product_id = ? AND status = 'APPROVED'
       ORDER BY created_at DESC`,
      [product.id]
    );

    // Related products in same category
    const related = db.all(
      `SELECT id, sku, name, slug, price, compare_price, main_image, rating, reviews_count
       FROM products
       WHERE category_id = ? AND id != ? AND is_active = 1
       ORDER BY is_featured DESC, rating DESC
       LIMIT 4`,
      [product.category_id, product.id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        specifications,
        images: images.length > 0 ? images : [{ id: 0, image_url: product.main_image, is_primary: 1 }],
        variants,
        reviews,
        related
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
