const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  console.log('--- Starting ERLUX Database Seeding ---');

  // 1. Seed Super Admin
  const existingAdmin = db.get('SELECT id FROM admins WHERE email = ?', ['admin@erlux.com']);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('ErLux@2026!Admin', salt);
    db.run(
      `INSERT INTO admins (username, email, password_hash, role, full_name, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      ['erlux_admin', 'admin@erlux.com', hash, 'superadmin', 'ERLUX Executive Director']
    );
    console.log('✓ Super Admin created: admin@erlux.com (Password: ErLux@2026!Admin)');
  } else {
    console.log('• Super Admin already exists.');
  }

  // Also seed a demo customer user
  const existingUser = db.get('SELECT id FROM users WHERE email = ?', ['customer@erlux.com']);
  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Customer@2026', salt);
    const userRes = db.run(
      `INSERT INTO users (full_name, email, phone, password_hash, status)
       VALUES (?, ?, ?, ?, 'active')`,
      ['Lady Victoria Sterling', 'customer@erlux.com', '+91 98765 43210', hash]
    );
    // Add default shipping address for demo user
    db.run(
      `INSERT INTO addresses (user_id, type, name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES (?, 'shipping', 'Lady Victoria Sterling', '+91 98765 43210', 'Penthouse 42, The Imperial Towers', 'Tardeo', 'Mumbai', 'Maharashtra', '400034', 'India', 1)`,
      [userRes.lastInsertRowid]
    );
    console.log('✓ Demo Customer created: customer@erlux.com (Password: Customer@2026)');
  }

  // 2. Seed Website Settings
  const defaultSettings = [
    { key: 'site_name', value: 'ERLUX Luxury Lifestyle', group: 'general' },
    { key: 'tagline', value: 'The Ultimate Luxury Lifestyle Destination', group: 'general' },
    { key: 'brand_statement', value: 'Beauty • Style • Passion • Lifestyle', group: 'general' },
    { key: 'contact_email', value: 'concierge@erluxlifestyle.com', group: 'contact' },
    { key: 'contact_phone', value: '+971 4 399 2200', group: 'contact' },
    { key: 'showroom_dubai', value: 'ERLUX Flagship Galleria, Downtown Dubai, UAE', group: 'locations' },
    { key: 'showroom_paris', value: '18 Place Vendôme, 75001 Paris, France', group: 'locations' },
    { key: 'showroom_london', value: '45 New Bond Street, Mayfair, London W1S 2SF, UK', group: 'locations' },
    { key: 'showroom_geneva', value: 'Rue du Rhône 42, 1204 Geneva, Switzerland', group: 'locations' },
    { key: 'currency_symbol', value: '₹', group: 'ecommerce' },
    { key: 'currency_code', value: 'INR', group: 'ecommerce' },
    { key: 'free_shipping_threshold', value: '5000', group: 'ecommerce' },
    { key: 'standard_shipping_fee', value: '250', group: 'ecommerce' },
    { key: 'tax_rate_percent', value: '18', group: 'ecommerce' },
    { key: 'razorpay_key_id', value: 'rzp_test_luxury_erlux', group: 'payment' }
  ];

  for (const s of defaultSettings) {
    db.run(
      `INSERT OR IGNORE INTO website_settings (setting_key, setting_value, setting_group)
       VALUES (?, ?, ?)`,
      [s.key, s.value, s.group]
    );
  }
  console.log('✓ Website settings configured.');

  // 3. Seed Promotional Coupons
  const coupons = [
    { code: 'ERLUX10', desc: '10% Privilege Discount on luxury orders above ₹2,000', type: 'PERCENTAGE', val: 10, min: 2000, max: 2000 },
    { code: 'ROYAL20', desc: '20% Royal VIP Concession on orders above ₹10,000', type: 'PERCENTAGE', val: 20, min: 10000, max: 5000 },
    { code: 'WELCOME500', desc: 'Flat ₹500 Welcome Courtesy on your first order above ₹3,000', type: 'FIXED', val: 500, min: 3000, max: 500 }
  ];

  for (const c of coupons) {
    db.run(
      `INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [c.code, c.desc, c.type, c.val, c.min, c.max]
    );
  }
  console.log('✓ Exclusive Privilege Coupons seeded.');

  // 4. Seed The 9 Core Categories and their Subcategories
  const categoryData = [
    {
      name: 'FRAGRANCE',
      slug: 'fragrance',
      tagline: 'A scent for every expression.',
      description: 'Handcrafted haute parfumerie made in Grasse and Geneva. Defining signatures of depth, distinction and lasting character.',
      image_url: 'assets/images/erlux/images_pages_menu_perfumes-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg',
      order: 1,
      subcategories: [
        { name: 'Eau de Parfum', slug: 'eau-de-parfum', desc: 'Concentrated 25% oil formulations for long-lasting sillage' },
        { name: 'Eau de Toilette', slug: 'eau-de-toilette', desc: 'Fresh, airy and vibrant daytime compositions' },
        { name: 'Perfume Oils', slug: 'perfume-oils', desc: 'Pure alcohol-free concentrated perfume extracts' },
        { name: 'Attars', slug: 'attars', desc: 'Traditional artisanal pure botanical distillations' },
        { name: 'Body Mists', slug: 'body-mists', desc: 'Lightweight refreshing aromatic mists' },
        { name: 'Pocket Perfumes', slug: 'pocket-perfumes', desc: 'Luxury travel flacons for presence on the go' },
        { name: 'Fragrance Gift Sets', slug: 'fragrance-gift-sets', desc: 'Curated fragrance ensembles presented in velvet jewel cases' }
      ]
    },
    {
      name: 'COSMETICS',
      slug: 'cosmetics',
      tagline: 'Where Beauty Becomes Iconic.',
      description: 'Luminous complexion, opulent velvet pigments, and high-performance artistry formulas.',
      image_url: 'assets/images/erlux/images_pages_menu_cosmetics-editorial.png',
      banner_url: 'assets/images/erlux/images_pages_cosmetics_main-menu-poster.jpg',
      order: 2,
      subcategories: [
        { name: 'Face & Complexion', slug: 'face-complexion', desc: 'Silken primers, luminous foundations and micro-milled powders' },
        { name: 'Lip Colour & Velvet', slug: 'lip-colour-velvet', desc: 'Matte velvet lipsticks, satin balms and high-shine lacquers' },
        { name: 'Eye Artistry', slug: 'eye-artistry', desc: 'Precious metal palettes, waterproof liquid liners and definition mascaras' },
        { name: 'Nails & Enamels', slug: 'nails-enamels', desc: 'Gel-finish luxury nail lacquers in signature couture hues' },
        { name: 'Makeup Brushes & Tools', slug: 'makeup-brushes-tools', desc: 'Handcrafted vegan bristle brushes with champagne gold ferrules' }
      ]
    },
    {
      name: 'PERSONAL CARE',
      slug: 'personal-care',
      tagline: 'Exceptional Care. Extraordinary You.',
      description: 'Sensory bath rituals, botanical body hydration and restorative grooming regimens.',
      image_url: 'assets/images/erlux/images_pages_personal-care_premium-care-banner.png',
      banner_url: 'assets/images/erlux/images_pages_personal-care_product-poster.jpg',
      order: 3,
      subcategories: [
        { name: 'Bath & Shower Rituals', slug: 'bath-shower-rituals', desc: 'Cleansing body washes and aromatic bath oils' },
        { name: 'Body Care & Lotions', slug: 'body-care-lotions', desc: 'Nourishing body creams infused with signature ERLUX notes' },
        { name: 'Hair Care & Styling', slug: 'hair-care-styling', desc: 'Revitalizing shampoos, botanical masks and golden hair elixirs' },
        { name: 'Hand & Foot Care', slug: 'hand-foot-care', desc: 'Intensive restorative balms and cuticle treatments' },
        { name: "Men's Grooming", slug: 'mens-grooming', desc: 'Precision shaving creams, soothing post-shave balms and beard oils' }
      ]
    },
    {
      name: 'WATCHES',
      slug: 'watches',
      tagline: 'Precision. Prestige. Perfection.',
      description: 'Swiss-movement horology and immaculate chronographs crafted for eternal moments.',
      image_url: 'assets/images/erlux/images_pages_menu_watches-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_watches_watch-collection-banner.jpg',
      order: 4,
      subcategories: [
        { name: "Men's Luxury Watches", slug: 'mens-luxury-watches', desc: 'Bold Swiss-calibre timepieces with sapphire crystal' },
        { name: "Women's Elegance Watches", slug: 'womens-elegance-watches', desc: 'Diamond-accented dials and mother-of-pearl bezels' },
        { name: 'Chronographs', slug: 'chronographs', desc: 'Triple-subdial complications for dynamic timing and prestige' },
        { name: 'Automatic Mechanical', slug: 'automatic-mechanical', desc: 'Self-winding exhibition casebacks with 48-hour power reserve' },
        { name: 'Classic Leather & Steel', slug: 'classic-leather-steel', desc: 'Italian full-grain calfskin straps with 316L stainless steel' }
      ]
    },
    {
      name: 'EYEWEAR',
      slug: 'eyewear',
      tagline: 'Designed to Define Your Style.',
      description: 'Architectural silhouettes, polarized UV400 lenses and handcrafted Italian acetate.',
      image_url: 'assets/images/erlux/images_pages_menu_sunglasses-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_sunglasses_hero-banner.png',
      order: 5,
      subcategories: [
        { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', desc: 'Iconic teardrop frames in 18k gold and gunmetal finish' },
        { name: 'Polarized Luxury', slug: 'polarized-luxury', desc: 'High-definition contrast lenses with anti-reflective coating' },
        { name: 'Oversized Statement', slug: 'oversized-statement', desc: 'Bold couture silhouettes for confident daytime allure' },
        { name: 'Cat Eye & Geometric', slug: 'cat-eye-geometric', desc: 'Feminine sculpted bevels and sharp modern angles' },
        { name: 'Blue Light Optical', slug: 'blue-light-optical', desc: 'Protective optical glass in ultra-lightweight titanium frames' }
      ]
    },
    {
      name: 'BELTS & ACCESSORIES',
      slug: 'belts-accessories',
      tagline: 'The detail that defines the look.',
      description: 'Artisanal Italian leather belts, reversible buckles and fine metal lifestyle accents.',
      image_url: 'assets/images/erlux/images_pages_menu_belts-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_belts_hero-banner.jpg',
      order: 6,
      subcategories: [
        { name: 'Reversible Leather Belts', slug: 'reversible-leather-belts', desc: 'Dual-tone black and cognac top-grain leather straps' },
        { name: 'Formal Dress Belts', slug: 'formal-dress-belts', desc: 'Sleek 30mm dress belts with polished palladium buckle' },
        { name: 'Luxury Buckles', slug: 'luxury-buckles', desc: 'Interchangeable brushed gold and matte ruthenium buckles' },
        { name: 'Keyrings & Charms', slug: 'keyrings-charms', desc: 'Heavy palladium key loops with leather embossing' },
        { name: 'Cufflinks & Pocket Squares', slug: 'cufflinks-pocket-squares', desc: 'Onyx-inlaid cufflinks and hand-rolled mulberry silk squares' }
      ]
    },
    {
      name: 'BAGS & WALLETS',
      slug: 'bags-wallets',
      tagline: 'Carry the Extraordinary.',
      description: 'Masterfully structured leather totes, executive briefcases and streamlined cardholders.',
      image_url: 'assets/images/erlux/images_pages_menu_bags-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_bags_hero-banner.png',
      order: 7,
      subcategories: [
        { name: 'Executive Briefcases & Totes', slug: 'briefcases-totes', desc: 'Structured calfskin work companions with laptop compartments' },
        { name: 'Luxury Handbags', slug: 'luxury-handbags', desc: 'Iconic structured top-handle silhouettes with signature lock' },
        { name: 'Crossbody & Clutches', slug: 'crossbody-clutches', desc: 'Sleek evening clutches with removable gold chain strap' },
        { name: 'Travel Holdalls & Duffles', slug: 'travel-holdalls-duffles', desc: 'Spacious weekenders in water-resistant textured leather' },
        { name: 'Leather Wallets & Cardholders', slug: 'wallets-cardholders', desc: 'Slim RFID-blocking bifold wallets and 6-slot card sleeves' }
      ]
    },
    {
      name: 'GIFT SETS',
      slug: 'gift-sets',
      tagline: 'Objects of Affection and Distinction.',
      description: 'Exquisitely presented gift coffrets and bespoke collector editions for unforgettable moments.',
      image_url: 'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
      banner_url: 'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png',
      order: 8,
      subcategories: [
        { name: 'Chairman Special Flagship Set', slug: 'chairman-special-set', desc: 'The definitive executive collection in gold-lacquered display box' },
        { name: 'Royal Couple His & Hers Set', slug: 'royal-couple-set', desc: 'Complementary perfume pairings for king and queen' },
        { name: "Women's Luxury Collection Box", slug: 'womens-luxury-box', desc: '9-flacon Discovery Coffret featuring our rarest perfumes' },
        { name: 'Discovery Miniature Set', slug: 'discovery-miniature-set', desc: 'Complete 10ml travel collection of ERLUX fragrance signatures' },
        { name: 'Corporate VIP Gift Trays', slug: 'corporate-vip-trays', desc: 'Curated corporate selections with custom embossed leather case' }
      ]
    },
    {
      name: 'FASHION WEAR',
      slug: 'fashion-wear',
      tagline: 'The Royal Standard of Style.',
      description: 'Couture evening wear, immaculate bespoke tailoring and luxurious silk knitwear.',
      image_url: 'assets/images/erlux/images_pages_menu_fashion-wear-editorial.jpg',
      banner_url: 'assets/images/erlux/images_pages_fashion-wear_hero-banner-below.png',
      order: 9,
      subcategories: [
        { name: 'Haute Evening Wear', slug: 'haute-evening-wear', desc: 'Floor-length silk gowns and structured cocktail dresses' },
        { name: 'Executive Formal Suits', slug: 'executive-formal-suits', desc: 'Super 150s wool suits crafted for definitive authority' },
        { name: 'Resort & Linen Leisure', slug: 'resort-linen-leisure', desc: 'Pure breathable Italian linen shirts and relaxed trousers' },
        { name: 'Silk Scarves & Stoles', slug: 'silk-scarves-stoles', desc: 'Double-sided twill silk squares with mythological botanical prints' },
        { name: 'Cashmere & Knitwear', slug: 'cashmere-knitwear', desc: 'Mongolian grade-A pure cashmere sweaters and cardigans' }
      ]
    }
  ];

  for (const cat of categoryData) {
    let catRecord = db.get('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    let categoryId;
    if (!catRecord) {
      const res = db.run(
        `INSERT INTO categories (name, slug, description, tagline, image_url, banner_url, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [cat.name, cat.slug, cat.description, cat.tagline, cat.image_url, cat.banner_url, cat.order]
      );
      categoryId = res.lastInsertRowid;
    } else {
      categoryId = catRecord.id;
      db.run(
        `UPDATE categories SET name = ?, description = ?, tagline = ?, image_url = ?, banner_url = ?, display_order = ?
         WHERE id = ?`,
        [cat.name, cat.description, cat.tagline, cat.image_url, cat.banner_url, cat.order, categoryId]
      );
    }

    let subOrder = 1;
    for (const sub of cat.subcategories) {
      const existingSub = db.get(
        'SELECT id FROM subcategories WHERE category_id = ? AND slug = ?',
        [categoryId, sub.slug]
      );
      if (!existingSub) {
        db.run(
          `INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [categoryId, sub.name, sub.slug, sub.desc, subOrder++]
        );
      }
    }
  }
  console.log('✓ All 9 Categories and 46 Subcategories synchronized.');

  console.log('--- Database Seeding (Core) Complete ---');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
