const db = require('./db');

const productsData = [
  // 1. FRAGRANCE
  {
    sku: 'ERL-FRAG-001',
    name: 'Chairman Special Extrait de Parfum',
    slug: 'chairman-special-extrait-de-parfum',
    category_slug: 'fragrance',
    subcategory_slug: 'eau-de-parfum',
    collection_range: 'Chairman Special',
    gender: 'Unisex',
    price: 18500,
    compare_price: 22000,
    cost_price: 8000,
    short_description: 'The definitive executive signature fragrance of ERLUX. An opulent blend of rare Taif rose, aged Cambodian oud, and golden amber.',
    full_description: 'Created as the defining signature of the ERLUX fragrance world, Chairman Special is an extraordinary Extrait de Parfum concentrated at 30% pure perfume oil. Crafted by Master Perfumers in Grasse and Geneva, it commands respect and leaves an indelible aura of sophistication and poise.',
    fragrance_notes_top: 'Sicilian Bergamot, Pink Peppercorn, Saffron Threads',
    fragrance_notes_middle: 'Taif Rose Absolute, Royal Ambergris, French Orris Butter',
    fragrance_notes_base: 'Aged Cambodian Oud, Mysore Sandalwood, Bourbon Vanilla Pod',
    specifications: JSON.stringify({ Volume: '100ml / 3.4 fl. oz.', Concentration: 'Extrait de Parfum (30%)', Origin: 'Grasse, France', Flacon: 'Heavy French Crystal with 24k Gold Accents' }),
    main_image: 'assets/images/erlux/images_pages_perfumes_chairman-special.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_perfumes_chairman-special.jpg',
      'assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg',
      'assets/images/erlux/images_pages_perfumes_all-in-one-poster.jpg'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 65,
    rating: 5.0,
    reviews_count: 42,
    variants: [
      { sku: 'ERL-FRAG-001-100', name: '100ml Flacon', type: 'Volume', value: '100ml', price: 18500, compare_price: 22000, stock: 45 },
      { sku: 'ERL-FRAG-001-50', name: '50ml Travel Flacon', type: 'Volume', value: '50ml', price: 11500, compare_price: 13500, stock: 20 }
    ]
  },
  {
    sku: 'ERL-FRAG-002',
    name: 'King & Queen Royal Eau de Parfum Duo',
    slug: 'king-and-queen-royal-edp-duo',
    category_slug: 'fragrance',
    subcategory_slug: 'eau-de-parfum',
    collection_range: 'King & Queen',
    gender: 'Unisex',
    price: 24900,
    compare_price: 29000,
    cost_price: 11000,
    short_description: 'An exalted pair of perfumes celebrating sovereign harmony, strength, and regal charisma.',
    full_description: 'The King & Queen Duo harmonizes masculine authority with feminine brilliance. Packaged together in a velvet-lined coffret, each 100ml flacon carries an interplay of smoky precious woods, dark florals, and crystalline musk.',
    fragrance_notes_top: 'Calabrian Bergamot, Cardamom, Black Fig',
    fragrance_notes_middle: 'Black Orchid, Jasmine Sambac, Cedarwood Atlas',
    fragrance_notes_base: 'Smoky Vetiver, Patchouli Coeur, White Amber',
    specifications: JSON.stringify({ Volume: '2 x 100ml (200ml total)', Concentration: 'Eau de Parfum (22%)', Origin: 'Geneva, Switzerland' }),
    main_image: 'assets/images/erlux/images_pages_perfumes_all-in-one-poster.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_perfumes_all-in-one-poster.jpg',
      'assets/images/erlux/images_collections_fragrance.jpg'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 40,
    rating: 4.9,
    reviews_count: 28,
    variants: [
      { sku: 'ERL-FRAG-002-DUO', name: 'Twin 100ml Coffret', type: 'Size', value: '2 x 100ml', price: 24900, compare_price: 29000, stock: 40 }
    ]
  },
  {
    sku: 'ERL-FRAG-003',
    name: 'CEO Executive Eau de Parfum',
    slug: 'ceo-executive-eau-de-parfum',
    category_slug: 'fragrance',
    subcategory_slug: 'eau-de-parfum',
    collection_range: 'CEO',
    gender: 'Men',
    price: 14500,
    compare_price: 17500,
    cost_price: 6500,
    short_description: 'Executive, professional and sophisticated fragrance designed for commanding boardrooms and evening galas.',
    full_description: 'Engineered for visionary leaders, CEO radiates unwavering poise. Crisp Italian citrus evolves into an aromatic herbal heart before resting upon a warm, structured leather and amber base.',
    fragrance_notes_top: 'Grapefruit, Bitter Orange, Coriander Leaf',
    fragrance_notes_middle: 'French Lavender, Clary Sage, Geranium Bourbon',
    fragrance_notes_base: 'Russian Leather, Oakmoss, Cashmere Wood',
    specifications: JSON.stringify({ Volume: '100ml / 3.4 fl. oz.', Concentration: 'Eau de Parfum (20%)', Origin: 'Paris, France' }),
    main_image: 'assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg',
    gallery_images: ['assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg'],
    is_featured: 0,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 50,
    rating: 4.8,
    reviews_count: 35,
    variants: [
      { sku: 'ERL-FRAG-003-100', name: '100ml Bottle', type: 'Volume', value: '100ml', price: 14500, compare_price: 17500, stock: 50 }
    ]
  },
  {
    sku: 'ERL-FRAG-004',
    name: 'Royal Scent Sovereign Amber Extrait',
    slug: 'royal-scent-sovereign-amber-extrait',
    category_slug: 'fragrance',
    subcategory_slug: 'perfume-oils',
    collection_range: 'Royal',
    gender: 'Unisex',
    price: 16900,
    compare_price: 19900,
    cost_price: 7500,
    short_description: 'Deep royal amber, balsamic frankincense and rich velvet tonka bean.',
    full_description: 'Inspired by the ancient trade routes of Arabia and the courts of Europe, Royal Scent Sovereign Amber is an intoxicating elixir of dark honey, Moroccan labdanum, and precious woods.',
    fragrance_notes_top: 'Golden Honey, Davana, Bitter Almond',
    fragrance_notes_middle: 'Labdanum Ciste, Somalian Frankincense, Clove Bud',
    fragrance_notes_base: 'Dark Amber, Venezuelan Tonka Bean, Benzoin Siam',
    specifications: JSON.stringify({ Volume: '100ml', Concentration: 'Extrait de Parfum (28%)', Origin: 'Dubai, UAE' }),
    main_image: 'assets/images/erlux/images_collections_fragrance.jpg',
    gallery_images: ['assets/images/erlux/images_collections_fragrance.jpg'],
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    stock: 35,
    rating: 4.9,
    reviews_count: 19,
    variants: [
      { sku: 'ERL-FRAG-004-100', name: '100ml Extrait', type: 'Volume', value: '100ml', price: 16900, compare_price: 19900, stock: 35 }
    ]
  },

  // 2. COSMETICS
  {
    sku: 'ERL-COSM-001',
    name: 'Luminous Velvet Perfection Foundation',
    slug: 'luminous-velvet-perfection-foundation',
    category_slug: 'cosmetics',
    subcategory_slug: 'face-complexion',
    collection_range: 'Complexion',
    gender: 'Women',
    price: 6499,
    compare_price: 7500,
    cost_price: 2800,
    short_description: 'Infused with micronized diamond powder and hyaluronic peptides for a breathable 24-hour radiant silk finish.',
    full_description: 'An extraordinary hybrid of skincare treatment and haute couture makeup. The Luminous Velvet Foundation delivers medium-to-full buildable coverage that blurs imperfections without masking natural skin vitality.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Finish: 'Soft Matte Radiance', Coverage: 'Buildable Medium to Full', SkinType: 'All Skin Types', SPF: 'SPF 25 PA+++' }),
    main_image: 'assets/images/erlux/images_pages_cosmetics_main-menu-poster.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_cosmetics_main-menu-poster.jpg',
      'assets/images/erlux/images_pages_menu_cosmetics-editorial.png'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 80,
    rating: 4.9,
    reviews_count: 51,
    variants: [
      { sku: 'ERL-COSM-001-01', name: 'Shade 01 - Alabaster Nude', type: 'Color', value: 'Alabaster Nude', price: 6499, compare_price: 7500, stock: 25 },
      { sku: 'ERL-COSM-001-02', name: 'Shade 02 - Golden Sand', type: 'Color', value: 'Golden Sand', price: 6499, compare_price: 7500, stock: 30 },
      { sku: 'ERL-COSM-001-03', name: 'Shade 03 - Warm Amber', type: 'Color', value: 'Warm Amber', price: 6499, compare_price: 7500, stock: 25 }
    ]
  },
  {
    sku: 'ERL-COSM-002',
    name: 'Royal Velvet Matte Haute Lipstick',
    slug: 'royal-velvet-matte-haute-lipstick',
    category_slug: 'cosmetics',
    subcategory_slug: 'lip-colour-velvet',
    collection_range: 'Velvet Ritual',
    gender: 'Women',
    price: 3899,
    compare_price: 4500,
    cost_price: 1500,
    short_description: 'Weightless high-pigment velvet formula encased in an engraved magnetic gold case.',
    full_description: 'Glide on pure luxury. Packed with moisturizing botanical oils, wild mango butter, and pure pigments, this lipstick delivers 12 hours of comfort with non-drying matte perfection.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Weight: '3.8g / 0.13 oz.', Finish: 'Powdery Velvet Matte', Casing: 'Magnetic Zamac Gold Alloy' }),
    main_image: 'assets/images/erlux/images_pages_menu_cosmetics-editorial.png',
    gallery_images: ['assets/images/erlux/images_pages_menu_cosmetics-editorial.png'],
    is_featured: 0,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 90,
    rating: 5.0,
    reviews_count: 38,
    variants: [
      { sku: 'ERL-COSM-002-RED', name: 'No. 07 Imperial Crimson', type: 'Color', value: 'Imperial Crimson', price: 3899, compare_price: 4500, stock: 30 },
      { sku: 'ERL-COSM-002-NUDE', name: 'No. 02 Vendôme Nude', type: 'Color', value: 'Vendôme Nude', price: 3899, compare_price: 4500, stock: 35 },
      { sku: 'ERL-COSM-002-BERRY', name: 'No. 12 Royal Blackberry', type: 'Color', value: 'Royal Blackberry', price: 3899, compare_price: 4500, stock: 25 }
    ]
  },
  {
    sku: 'ERL-COSM-003',
    name: 'Gilded Horizon 12-Pan Eyeshadow Palette',
    slug: 'gilded-horizon-12-pan-eyeshadow-palette',
    category_slug: 'cosmetics',
    subcategory_slug: 'eye-artistry',
    collection_range: 'Eye Artistry',
    gender: 'Women',
    price: 8200,
    compare_price: 9500,
    cost_price: 3500,
    short_description: '12 saturated shades ranging from molten foils to velvet mattes and duochrome shimmer.',
    full_description: 'An architectural eye palette inspired by sunset over the Mediterranean. Ultra-smooth buttery textures blend effortlessly without fallout.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Shades: '12 Multi-Finish Powders', Mirror: 'Full Size Beveled Glass Mirror' }),
    main_image: 'assets/images/erlux/images_pages_home_cosmetics-category.jpg',
    gallery_images: ['assets/images/erlux/images_pages_home_cosmetics-category.jpg'],
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    stock: 45,
    rating: 4.8,
    reviews_count: 22,
    variants: [
      { sku: 'ERL-COSM-003-STD', name: 'Standard Palette', type: 'Style', value: '12 Shades', price: 8200, compare_price: 9500, stock: 45 }
    ]
  },

  // 3. PERSONAL CARE
  {
    sku: 'ERL-CARE-001',
    name: 'Velvet Ritual Imperial Bath & Shower Elixir',
    slug: 'velvet-ritual-imperial-bath-shower-elixir',
    category_slug: 'personal-care',
    subcategory_slug: 'bath-shower-rituals',
    collection_range: 'Care',
    gender: 'Unisex',
    price: 4200,
    compare_price: 4900,
    cost_price: 1800,
    short_description: 'Silken oil-to-milk lather enriched with organic argan and damask rose extract.',
    full_description: 'Transform daily bathing into an aristocratic ritual. This sensory cleansing oil gently envelops the skin, releasing calming notes of cedarwood and amber while providing deep hydration.',
    fragrance_notes_top: 'Neroli, Sweet Orange',
    fragrance_notes_middle: 'Damask Rose, White Tea',
    fragrance_notes_base: 'Virginian Cedar, Soft Amber',
    specifications: JSON.stringify({ Volume: '300ml / 10.1 fl. oz.', Formula: 'Sulfate-Free, Paraben-Free, Vegan' }),
    main_image: 'assets/images/erlux/images_pages_personal-care_premium-care-banner.png',
    gallery_images: [
      'assets/images/erlux/images_pages_personal-care_premium-care-banner.png',
      'assets/images/erlux/images_pages_personal-care_product-poster.jpg'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 75,
    rating: 4.9,
    reviews_count: 31,
    variants: [
      { sku: 'ERL-CARE-001-300', name: '300ml Bottle', type: 'Volume', value: '300ml', price: 4200, compare_price: 4900, stock: 75 }
    ]
  },
  {
    sku: 'ERL-CARE-002',
    name: 'Restorative Golden Botanical Body Cream',
    slug: 'restorative-golden-botanical-body-cream',
    category_slug: 'personal-care',
    subcategory_slug: 'body-care-lotions',
    collection_range: 'Care',
    gender: 'Unisex',
    price: 5800,
    compare_price: 6800,
    cost_price: 2400,
    short_description: 'Rich whipped souffle infused with shea butter, jojoba oil and subtle golden luminescence.',
    full_description: 'Indulge in 48-hour continuous moisture. Melts instantly upon contact to leave skin soft, replenished, and perfumed with the delicate whisper of ERLUX blossom.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Volume: '250ml / 8.5 fl. oz.', Pot: 'Frosted Glass with Brushed Gold Lid' }),
    main_image: 'assets/images/erlux/images_pages_personal-care_product-poster.jpg',
    gallery_images: ['assets/images/erlux/images_pages_personal-care_product-poster.jpg'],
    is_featured: 0,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 60,
    rating: 4.8,
    reviews_count: 24,
    variants: [
      { sku: 'ERL-CARE-002-250', name: '250ml Jar', type: 'Volume', value: '250ml', price: 5800, compare_price: 6800, stock: 60 }
    ]
  },

  // 4. WATCHES
  {
    sku: 'ERL-WAT-001',
    name: 'Geneva Sovereign Automatic Chronograph 42mm',
    slug: 'geneva-sovereign-automatic-chronograph-42mm',
    category_slug: 'watches',
    subcategory_slug: 'chronographs',
    collection_range: 'Time',
    gender: 'Men',
    price: 48500,
    compare_price: 56000,
    cost_price: 24000,
    short_description: 'Swiss-calibre automatic movement, sapphire anti-reflective crystal, 316L stainless steel case.',
    full_description: 'A monument of horological mastery. The Geneva Sovereign features a high-beat automatic movement with 48-hour power reserve, three sunburst subdials, and exhibition sapphire caseback revealing circular Côtes de Genève finishing.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ CaseDiameter: '42mm', Thickness: '12.5mm', Movement: 'Swiss Automatic Chronograph', Glass: 'Double-Domed Sapphire Crystal', WaterResistance: '100m / 10 ATM', Strap: 'Solid Steel Bracelet with Butterfly Clasp' }),
    main_image: 'assets/images/erlux/images_pages_watches_watch-collection-banner.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_watches_watch-collection-banner.jpg',
      'assets/images/erlux/images_pages_watches_designed-for-your-expression-banner.jpg',
      'assets/images/erlux/images_collections_time.jpg'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 25,
    rating: 5.0,
    reviews_count: 17,
    variants: [
      { sku: 'ERL-WAT-001-SLV', name: 'Silver Steel & Navy Sunburst', type: 'Color', value: 'Silver / Navy', price: 48500, compare_price: 56000, stock: 15 },
      { sku: 'ERL-WAT-001-GLD', name: '18K Gold Plated & Charcoal Dial', type: 'Color', value: 'Gold / Charcoal', price: 52000, compare_price: 59000, stock: 10 }
    ]
  },
  {
    sku: 'ERL-WAT-002',
    name: 'Vendôme Diamond Bezel Elegance Watch 36mm',
    slug: 'vendome-diamond-bezel-elegance-watch-36mm',
    category_slug: 'watches',
    subcategory_slug: 'womens-elegance-watches',
    collection_range: 'Time',
    gender: 'Women',
    price: 42000,
    compare_price: 49000,
    cost_price: 20000,
    short_description: 'Natural mother-of-pearl dial with 48 brilliant-cut crystal accents and slim rose gold bracelet.',
    full_description: 'The epitome of Parisienne grace. The Vendôme reflects light with every gesture, featuring an iridescent mother-of-pearl dial, hand-applied gold indices, and a scratchproof sapphire crystal.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ CaseDiameter: '36mm', Thickness: '7.8mm', Movement: 'Swiss Quartz Movement', Dial: 'Natural Tahitian Mother-of-Pearl', Strap: 'Interchangeable Milanese Mesh & Satin Strap' }),
    main_image: 'assets/images/erlux/images_pages_watches_designed-for-your-expression-banner.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_watches_designed-for-your-expression-banner.jpg',
      'assets/images/erlux/images_pages_home_watches-category.jpg'
    ],
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    stock: 30,
    rating: 4.9,
    reviews_count: 14,
    variants: [
      { sku: 'ERL-WAT-002-ROSE', name: 'Rose Gold & White Pearl', type: 'Color', value: 'Rose Gold', price: 42000, compare_price: 49000, stock: 30 }
    ]
  },

  // 5. EYEWEAR
  {
    sku: 'ERL-EYE-001',
    name: 'Monaco 18K Gold Aviator Sunglasses',
    slug: 'monaco-18k-gold-aviator-sunglasses',
    category_slug: 'eyewear',
    subcategory_slug: 'aviator-sunglasses',
    collection_range: 'Eyewear',
    gender: 'Unisex',
    price: 19500,
    compare_price: 23000,
    cost_price: 8500,
    short_description: 'Japanese titanium frame with 18k gold plating and polarized mineral green lenses.',
    full_description: 'Engineered for exceptional clarity and effortless elegance under Mediterranean skies. Handcrafted with ultra-durable titanium and anti-reflective mineral glass lenses that eliminate glare.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Frame: 'Ultralight Japanese Titanium', Plating: '18K Yellow Gold IP', Lenses: 'Barberini Polarized Mineral Glass (Category 3)', UVProtection: '100% UVA / UVB / UVC' }),
    main_image: 'assets/images/erlux/images_pages_sunglasses_hero-banner.png',
    gallery_images: [
      'assets/images/erlux/images_pages_sunglasses_hero-banner.png',
      'assets/images/erlux/images_pages_sunglasses_hoarding-banner.png'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 45,
    rating: 4.9,
    reviews_count: 27,
    variants: [
      { sku: 'ERL-EYE-001-GLD', name: 'Gold Frame / G-15 Green Lens', type: 'Color', value: 'Gold / Green', price: 19500, compare_price: 23000, stock: 25 },
      { sku: 'ERL-EYE-001-SLV', name: 'Palladium Frame / Gradient Blue Lens', type: 'Color', value: 'Silver / Blue', price: 19500, compare_price: 23000, stock: 20 }
    ]
  },
  {
    sku: 'ERL-EYE-002',
    name: 'Milano Cat-Eye Acetate Sunglasses',
    slug: 'milano-cat-eye-acetate-sunglasses',
    category_slug: 'eyewear',
    subcategory_slug: 'cat-eye-geometric',
    collection_range: 'Eyewear',
    gender: 'Women',
    price: 18000,
    compare_price: 21000,
    cost_price: 7800,
    short_description: 'Hand-sculpted Italian Mazzucchelli acetate in dramatic tortoiseshell with gold temple inlays.',
    full_description: 'Command every room. Sculpted from premium bio-acetate, the Milano blends vintage Riviera glamour with razor-sharp modern precision.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Frame: 'Italian Mazzucchelli Acetate', Hinges: '5-Barrel Custom Gold Hinges', Lens: 'Gradient Warm Sepia (UV400)' }),
    main_image: 'assets/images/erlux/images_pages_sunglasses_poster-banner.png',
    gallery_images: ['assets/images/erlux/images_pages_sunglasses_poster-banner.png'],
    is_featured: 0,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 35,
    rating: 4.8,
    reviews_count: 19,
    variants: [
      { sku: 'ERL-EYE-002-TORT', name: 'Havana Tortoise', type: 'Color', value: 'Tortoiseshell', price: 18000, compare_price: 21000, stock: 20 },
      { sku: 'ERL-EYE-002-BLK', name: 'Piano Onyx Black', type: 'Color', value: 'Onyx Black', price: 18000, compare_price: 21000, stock: 15 }
    ]
  },

  // 6. BELTS & ACCESSORIES
  {
    sku: 'ERL-BELT-001',
    name: 'ERLUX Reversible Italian Leather Belt 35mm',
    slug: 'erlux-reversible-italian-leather-belt-35mm',
    category_slug: 'belts-accessories',
    subcategory_slug: 'reversible-leather-belts',
    collection_range: 'Style',
    gender: 'Men',
    price: 14500,
    compare_price: 17000,
    cost_price: 6000,
    short_description: 'Dual-sided top-grain calfskin with twist-lock brushed 24k gold buckle.',
    full_description: 'Two iconic styles in one masterwork. Rotate the signature emblem buckle to switch between classic midnight black and rich Tuscan cognac leather in seconds.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Width: '35mm', Leather: 'Full-Grain Tuscan Calfskin', Buckle: 'Solid Brass with 24K Brushed Gold Plating', Sizes: '32, 34, 36, 38, 40' }),
    main_image: 'assets/images/erlux/images_pages_belts_hero-banner.jpg',
    gallery_images: [
      'assets/images/erlux/images_pages_belts_hero-banner.jpg',
      'assets/images/erlux/images_pages_belts_collection-banner.jpg'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 50,
    rating: 4.9,
    reviews_count: 32,
    variants: [
      { sku: 'ERL-BELT-001-34', name: 'Size 34 (85cm)', type: 'Size', value: '34', price: 14500, compare_price: 17000, stock: 15 },
      { sku: 'ERL-BELT-001-36', name: 'Size 36 (90cm)', type: 'Size', value: '36', price: 14500, compare_price: 17000, stock: 20 },
      { sku: 'ERL-BELT-001-38', name: 'Size 38 (95cm)', type: 'Size', value: '38', price: 14500, compare_price: 17000, stock: 15 }
    ]
  },

  // 7. BAGS & WALLETS
  {
    sku: 'ERL-BAG-001',
    name: 'Mayfair Executive Briefcase in Saffiano Calfskin',
    slug: 'mayfair-executive-briefcase-in-saffiano-calfskin',
    category_slug: 'bags-wallets',
    subcategory_slug: 'briefcases-totes',
    collection_range: 'Bags',
    gender: 'Men',
    price: 38000,
    compare_price: 45000,
    cost_price: 18000,
    short_description: 'Architectural silhouette with padded 16-inch laptop pocket, key fob, and detachable shoulder strap.',
    full_description: 'Crafted from scratch-resistant Italian Saffiano calfskin. The Mayfair Briefcase combines understated luxury with uncompromising utility for global executives.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Dimensions: '40cm x 30cm x 9cm', Material: 'Italian Saffiano Calf Leather', Lining: 'Midnight Blue Microsuede', Hardware: 'Palladium Plated Brass' }),
    main_image: 'assets/images/erlux/images_pages_bags_hero-banner.png',
    gallery_images: [
      'assets/images/erlux/images_pages_bags_hero-banner.png',
      'assets/images/erlux/images_pages_bags_collection-banner.png'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 20,
    rating: 5.0,
    reviews_count: 15,
    variants: [
      { sku: 'ERL-BAG-001-BLK', name: 'Onyx Black Saffiano', type: 'Color', value: 'Black', price: 38000, compare_price: 45000, stock: 12 },
      { sku: 'ERL-BAG-001-NAV', name: 'Midnight Navy Saffiano', type: 'Color', value: 'Navy', price: 38000, compare_price: 45000, stock: 8 }
    ]
  },
  {
    sku: 'ERL-BAG-002',
    name: 'Vendôme Structured Top-Handle Bag',
    slug: 'vendome-structured-top-handle-bag',
    category_slug: 'bags-wallets',
    subcategory_slug: 'luxury-handbags',
    collection_range: 'Bags',
    gender: 'Women',
    price: 46000,
    compare_price: 54000,
    cost_price: 21000,
    short_description: 'Hand-stitched smooth box calfskin with iconic gold turn-lock closure.',
    full_description: 'A sovereign statement of femininity. Features structured trapezoidal architecture, interior zipped sanctuary, and four protective gold feet.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Dimensions: '28cm x 22cm x 11cm', Material: 'French Box Calf Leather', Hardware: '24K Polished Gold Alloy' }),
    main_image: 'assets/images/erlux/images_pages_bags_collection-banner.png',
    gallery_images: ['assets/images/erlux/images_pages_bags_collection-banner.png'],
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    stock: 18,
    rating: 4.9,
    reviews_count: 11,
    variants: [
      { sku: 'ERL-BAG-002-IVO', name: 'Chantilly Ivory', type: 'Color', value: 'Ivory', price: 46000, compare_price: 54000, stock: 10 },
      { sku: 'ERL-BAG-002-EMR', name: 'Emerald Forest', type: 'Color', value: 'Emerald', price: 46000, compare_price: 54000, stock: 8 }
    ]
  },

  // 8. GIFT SETS
  {
    sku: 'ERL-GIFT-001',
    name: 'Chairman Special Flagship Master Coffret',
    slug: 'chairman-special-flagship-master-coffret',
    category_slug: 'gift-sets',
    subcategory_slug: 'chairman-special-set',
    collection_range: 'Chairman Special',
    gender: 'Unisex',
    price: 34000,
    compare_price: 40000,
    cost_price: 15000,
    short_description: 'The crowning jewel of the ERLUX gift atelier. Features the full 100ml Extrait, 30ml travel atomizer, and solid brass funnel.',
    full_description: 'Housed in an individually numbered piano-lacquer box with velvet cushioning and 24k gold fittings. Created for VIP dignitaries, milestones, and discerning collectors who accept only the best.',
    fragrance_notes_top: 'Sicilian Bergamot, Pink Peppercorn, Saffron Threads',
    fragrance_notes_middle: 'Taif Rose Absolute, Royal Ambergris, French Orris Butter',
    fragrance_notes_base: 'Aged Cambodian Oud, Mysore Sandalwood, Bourbon Vanilla Pod',
    specifications: JSON.stringify({ Includes: '100ml Flacon + 30ml Travel Spray + Brass Funnel', Presentation: 'Hand-Lacquered Wooden Jewel Box with Velvet Lining' }),
    main_image: 'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
    gallery_images: [
      'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
      'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 0,
    stock: 30,
    rating: 5.0,
    reviews_count: 29,
    variants: [
      { sku: 'ERL-GIFT-001-COF', name: 'Collector Master Coffret', type: 'Set', value: 'Complete Set', price: 34000, compare_price: 40000, stock: 30 }
    ]
  },
  {
    sku: 'ERL-GIFT-002',
    name: 'ERLUX Six Variants Signature Discovery Set',
    slug: 'erlux-six-variants-signature-discovery-set',
    category_slug: 'gift-sets',
    subcategory_slug: 'discovery-miniature-set',
    collection_range: 'Gift Sets',
    gender: 'Unisex',
    price: 18500,
    compare_price: 22000,
    cost_price: 7500,
    short_description: 'Six 15ml luxury discovery flacons traversing the entire spectrum of ERLUX haute parfumerie.',
    full_description: 'Experience Chairman Special, King, Queen, CEO, Royal Amber, and Prince in a sublime discovery wardrobe designed for seamless travel and layering.',
    fragrance_notes_top: 'Assorted Botanical & Citrus Essences',
    fragrance_notes_middle: 'Florals, Spices & Resins',
    fragrance_notes_base: 'Oud, Amber, Sandalwood & Vanilla',
    specifications: JSON.stringify({ Contents: '6 x 15ml Miniature Atomizers (90ml Total)', Case: 'Debossed Saffiano Leather Travel Folio' }),
    main_image: 'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png',
    gallery_images: [
      'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png',
      'assets/images/erlux/images_pages_gift-sets_womens-nine-variants-banner.png'
    ],
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 50,
    rating: 4.9,
    reviews_count: 44,
    variants: [
      { sku: 'ERL-GIFT-002-SET', name: '6 x 15ml Wardrobe', type: 'Size', value: '6 x 15ml', price: 18500, compare_price: 22000, stock: 50 }
    ]
  },

  // 9. FASHION WEAR
  {
    sku: 'ERL-FASH-001',
    name: 'Royal Sovereign Double-Breasted Wool Tuxedo',
    slug: 'royal-sovereign-double-breasted-wool-tuxedo',
    category_slug: 'fashion-wear',
    subcategory_slug: 'executive-formal-suits',
    collection_range: 'Fashion Wear',
    gender: 'Men',
    price: 65000,
    compare_price: 78000,
    cost_price: 32000,
    short_description: 'Bespoke tailoring in Super 160s Vitale Barberis wool with silk grosgrain peak lapels.',
    full_description: 'An authoritative silhouette cut with precision in Biella, Italy. Features structured floating canvas chest piece, surgeon cuffs with working buttonholes, and hand-stitched pick detailing.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Fabric: 'Super 160s Italian Wool (260g/m)', Lapel: 'Silk Grosgrain Peak Lapel', Construction: 'Full Floating Canvas', Origin: 'Biella, Italy' }),
    main_image: 'assets/images/erlux/images_pages_fashion-wear_hero-banner-below.png',
    gallery_images: [
      'assets/images/erlux/images_pages_fashion-wear_hero-banner-below.png',
      'assets/images/erlux/images_pages_home_fashion-wear-category.png'
    ],
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    stock: 15,
    rating: 5.0,
    reviews_count: 9,
    variants: [
      { sku: 'ERL-FASH-001-38R', name: 'Size 38R', type: 'Size', value: '38R', price: 65000, compare_price: 78000, stock: 5 },
      { sku: 'ERL-FASH-001-40R', name: 'Size 40R', type: 'Size', value: '40R', price: 65000, compare_price: 78000, stock: 5 },
      { sku: 'ERL-FASH-001-42R', name: 'Size 42R', type: 'Size', value: '42R', price: 65000, compare_price: 78000, stock: 5 }
    ]
  },
  {
    sku: 'ERL-FASH-002',
    name: 'Pure Twill Mulberry Silk Stole 90x90cm',
    slug: 'pure-twill-mulberry-silk-stole-90x90cm',
    category_slug: 'fashion-wear',
    subcategory_slug: 'silk-scarves-stoles',
    collection_range: 'Fashion Wear',
    gender: 'Women',
    price: 16500,
    compare_price: 19500,
    cost_price: 6500,
    short_description: 'Hand-rolled edges with astronomical ERLUX celestial print in shimmering gold and navy.',
    full_description: 'Printed in Como, Italy on heavyweight 18mm silk twill. The ERLUX Celestial Stole can be worn as a neckerchief, belt accent, or hair ribbon.',
    fragrance_notes_top: null,
    fragrance_notes_middle: null,
    fragrance_notes_base: null,
    specifications: JSON.stringify({ Dimensions: '90cm x 90cm / 35in x 35in', Silk: '100% Mulberry Silk Twill (18 Momme)', Edges: 'Hand-Rolled and Hand-Sewn', Origin: 'Como, Italy' }),
    main_image: 'assets/images/erlux/images_pages_home_fashion-category.jpg',
    gallery_images: ['assets/images/erlux/images_pages_home_fashion-category.jpg'],
    is_featured: 0,
    is_bestseller: 1,
    is_new_arrival: 1,
    stock: 40,
    rating: 4.9,
    reviews_count: 21,
    variants: [
      { sku: 'ERL-FASH-002-NAV', name: 'Celestial Navy & Gold', type: 'Color', value: 'Navy / Gold', price: 16500, compare_price: 19500, stock: 25 },
      { sku: 'ERL-FASH-002-BUR', name: 'Burgundy & Platinum', type: 'Color', value: 'Burgundy / Platinum', price: 16500, compare_price: 19500, stock: 15 }
    ]
  }
];

function seedProducts() {
  console.log('--- Seeding Authentic ERLUX Products ---');

  for (const p of productsData) {
    const category = db.get('SELECT id FROM categories WHERE slug = ?', [p.category_slug]);
    if (!category) {
      console.warn(`Category ${p.category_slug} not found for product ${p.name}`);
      continue;
    }

    const subcategory = p.subcategory_slug
      ? db.get('SELECT id FROM subcategories WHERE category_id = ? AND slug = ?', [category.id, p.subcategory_slug])
      : null;

    let existingProduct = db.get('SELECT id FROM products WHERE sku = ?', [p.sku]);
    let productId;

    if (!existingProduct) {
      const res = db.run(
        `INSERT INTO products (
          sku, name, slug, category_id, subcategory_id, brand, collection_range, gender,
          price, compare_price, cost_price, short_description, full_description,
          fragrance_notes_top, fragrance_notes_middle, fragrance_notes_base,
          specifications, main_image, is_featured, is_bestseller, is_new_arrival, is_active,
          stock_quantity, rating, reviews_count
        ) VALUES (?, ?, ?, ?, ?, 'ERLUX', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [
          p.sku, p.name, p.slug, category.id, subcategory ? subcategory.id : null, p.collection_range, p.gender,
          p.price, p.compare_price, p.cost_price, p.short_description, p.full_description,
          p.fragrance_notes_top, p.fragrance_notes_middle, p.fragrance_notes_base,
          p.specifications, p.main_image, p.is_featured, p.is_bestseller, p.is_new_arrival,
          p.stock, p.rating, p.reviews_count
        ]
      );
      productId = res.lastInsertRowid;
      console.log(`+ Product created: [${p.sku}] ${p.name}`);

      // Record initial inventory log
      db.run(
        `INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
         VALUES (?, 'INITIAL', ?, 0, ?, 'Initial catalog stock import', 'System Seed')`,
        [productId, p.stock, p.stock]
      );
    } else {
      productId = existingProduct.id;
      db.run(
        `UPDATE products SET
          name = ?, category_id = ?, subcategory_id = ?, collection_range = ?, gender = ?,
          price = ?, compare_price = ?, short_description = ?, full_description = ?,
          fragrance_notes_top = ?, fragrance_notes_middle = ?, fragrance_notes_base = ?,
          specifications = ?, main_image = ?, is_featured = ?, is_bestseller = ?, is_new_arrival = ?,
          stock_quantity = ?, rating = ?, reviews_count = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          p.name, category.id, subcategory ? subcategory.id : null, p.collection_range, p.gender,
          p.price, p.compare_price, p.short_description, p.full_description,
          p.fragrance_notes_top, p.fragrance_notes_middle, p.fragrance_notes_base,
          p.specifications, p.main_image, p.is_featured, p.is_bestseller, p.is_new_arrival,
          p.stock, p.rating, p.reviews_count, productId
        ]
      );
    }

    // Insert Gallery Images
    if (p.gallery_images && p.gallery_images.length > 0) {
      db.run('DELETE FROM product_images WHERE product_id = ?', [productId]);
      let order = 0;
      for (const img of p.gallery_images) {
        db.run(
          `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, img, p.name, order, order === 0 ? 1 : 0]
        );
        order++;
      }
    }

    // Insert Variants
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        const existingVar = db.get('SELECT id FROM product_variants WHERE sku = ?', [v.sku]);
        if (!existingVar) {
          db.run(
            `INSERT INTO product_variants (product_id, sku, name, variant_type, variant_value, price, compare_price, stock_quantity, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [productId, v.sku, v.name, v.type, v.value, v.price, v.compare_price || null, v.stock]
          );
        }
      }
    }

    // Insert Sample Reviews for the product
    const existingReviews = db.get('SELECT COUNT(*) as cnt FROM reviews WHERE product_id = ?', [productId]);
    if (existingReviews.cnt === 0) {
      const demoReviews = [
        { name: 'Baroness Elena von H.', email: 'elena@v-haus.ch', rating: 5, title: 'Absolute Masterpiece of Scent and Presence', comment: 'Exquisite longevity, magnetic sillage, and undeniably luxurious presentation. ERLUX has crafted an immortal classic.' },
        { name: 'Marcus Sterling', email: 'm.sterling@mayfair.co.uk', rating: 5, title: 'Unmatched Sophistication', comment: 'Wore this to an evening gala in Mayfair. Received countless compliments throughout the night. Simply extraordinary.' }
      ];
      for (const r of demoReviews) {
        db.run(
          `INSERT INTO reviews (product_id, reviewer_name, reviewer_email, rating, title, comment, status)
           VALUES (?, ?, ?, ?, ?, ?, 'APPROVED')`,
          [productId, r.name, r.email, r.rating, r.title, r.comment]
        );
      }
    }
  }

  console.log('✓ Authentic ERLUX Products, Variants, Galleries and Reviews seeded successfully.');
}

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };
