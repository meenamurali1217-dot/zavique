/**
 * ERLUX Luxury Lifestyle Unified Navigation & Client Experience Module
 * Brand: ERLUX | Beauty • Style • Passion • Lifestyle
 * Handles: 11-item single-line navbar, mega menus, mobile drawer, slide cart, badge counters, and live search
 */

(function () {
  'use strict';

  // 11 Core Navigation Structure
  const DEFAULT_NAV_ITEMS = [
    { name: 'HOME', url: 'index.html', slug: 'home' },
    {
      name: 'FRAGRANCE',
      url: 'shop.html?category=fragrance',
      slug: 'fragrance',
      image: 'assets/images/erlux/images_pages_menu_perfumes-editorial.jpg',
      tagline: 'A scent for every expression.',
      subcategories: [
        { name: 'Eau de Parfum', slug: 'eau-de-parfum' },
        { name: 'Eau de Toilette', slug: 'eau-de-toilette' },
        { name: 'Perfume Oils', slug: 'perfume-oils' },
        { name: 'Attars', slug: 'attars' },
        { name: 'Body Mists', slug: 'body-mists' },
        { name: 'Pocket Perfumes', slug: 'pocket-perfumes' },
        { name: 'Fragrance Gift Sets', slug: 'fragrance-gift-sets' }
      ]
    },
    {
      name: 'COSMETICS',
      url: 'shop.html?category=cosmetics',
      slug: 'cosmetics',
      image: 'assets/images/erlux/images_pages_menu_cosmetics-editorial.png',
      tagline: 'Where Beauty Becomes Iconic.',
      subcategories: [
        { name: 'Face & Complexion', slug: 'face-complexion' },
        { name: 'Lip Colour & Velvet', slug: 'lip-colour-velvet' },
        { name: 'Eye Artistry', slug: 'eye-artistry' },
        { name: 'Nails & Enamels', slug: 'nails-enamels' },
        { name: 'Makeup Brushes & Tools', slug: 'makeup-brushes-tools' }
      ]
    },
    {
      name: 'PERSONAL CARE',
      url: 'shop.html?category=personal-care',
      slug: 'personal-care',
      image: 'assets/images/erlux/images_pages_personal-care_premium-care-banner.png',
      tagline: 'Exceptional Care. Extraordinary You.',
      subcategories: [
        { name: 'Bath & Shower Rituals', slug: 'bath-shower-rituals' },
        { name: 'Body Care & Lotions', slug: 'body-care-lotions' },
        { name: 'Hair Care & Styling', slug: 'hair-care-styling' },
        { name: 'Hand & Foot Care', slug: 'hand-foot-care' },
        { name: "Men's Grooming", slug: 'mens-grooming' }
      ]
    },
    {
      name: 'WATCHES',
      url: 'shop.html?category=watches',
      slug: 'watches',
      image: 'assets/images/erlux/images_pages_menu_watches-editorial.jpg',
      tagline: 'Precision. Prestige. Perfection.',
      subcategories: [
        { name: "Men's Luxury Watches", slug: 'mens-luxury-watches' },
        { name: "Women's Elegance Watches", slug: 'womens-elegance-watches' },
        { name: 'Chronographs', slug: 'chronographs' },
        { name: 'Automatic Mechanical', slug: 'automatic-mechanical' },
        { name: 'Classic Leather & Steel', slug: 'classic-leather-steel' }
      ]
    },
    {
      name: 'EYEWEAR',
      url: 'shop.html?category=eyewear',
      slug: 'eyewear',
      image: 'assets/images/erlux/images_pages_menu_sunglasses-editorial.jpg',
      tagline: 'Designed to Define Your Style.',
      subcategories: [
        { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses' },
        { name: 'Polarized Luxury', slug: 'polarized-luxury' },
        { name: 'Oversized Statement', slug: 'oversized-statement' },
        { name: 'Cat Eye & Geometric', slug: 'cat-eye-geometric' },
        { name: 'Blue Light Optical', slug: 'blue-light-optical' }
      ]
    },
    {
      name: 'BELTS & ACCESSORIES',
      url: 'shop.html?category=belts-accessories',
      slug: 'belts-accessories',
      image: 'assets/images/erlux/images_pages_menu_belts-editorial.jpg',
      tagline: 'The detail that defines the look.',
      subcategories: [
        { name: 'Reversible Leather Belts', slug: 'reversible-leather-belts' },
        { name: 'Formal Dress Belts', slug: 'formal-dress-belts' },
        { name: 'Luxury Buckles', slug: 'luxury-buckles' },
        { name: 'Keyrings & Charms', slug: 'keyrings-charms' },
        { name: 'Cufflinks & Pocket Squares', slug: 'cufflinks-pocket-squares' }
      ]
    },
    {
      name: 'BAGS & WALLETS',
      url: 'shop.html?category=bags-wallets',
      slug: 'bags-wallets',
      image: 'assets/images/erlux/images_pages_menu_bags-editorial.jpg',
      tagline: 'Carry the Extraordinary.',
      subcategories: [
        { name: 'Executive Briefcases & Totes', slug: 'briefcases-totes' },
        { name: 'Luxury Handbags', slug: 'luxury-handbags' },
        { name: 'Crossbody & Clutches', slug: 'crossbody-clutches' },
        { name: 'Travel Holdalls & Duffles', slug: 'travel-holdalls-duffles' },
        { name: 'Leather Wallets & Cardholders', slug: 'wallets-cardholders' }
      ]
    },
    {
      name: 'GIFT SETS',
      url: 'shop.html?category=gift-sets',
      slug: 'gift-sets',
      image: 'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
      tagline: 'Objects of Affection and Distinction.',
      subcategories: [
        { name: 'Chairman Special Flagship Set', slug: 'chairman-special-set' },
        { name: 'Royal Couple His & Hers Set', slug: 'royal-couple-set' },
        { name: "Women's Luxury Collection Box", slug: 'womens-luxury-box' },
        { name: 'Discovery Miniature Set', slug: 'discovery-miniature-set' },
        { name: 'Corporate VIP Gift Trays', slug: 'corporate-vip-trays' }
      ]
    },
    {
      name: 'FASHION WEAR',
      url: 'shop.html?category=fashion-wear',
      slug: 'fashion-wear',
      image: 'assets/images/erlux/images_pages_menu_fashion-wear-editorial.jpg',
      tagline: 'The Royal Standard of Style.',
      subcategories: [
        { name: 'Haute Evening Wear', slug: 'haute-evening-wear' },
        { name: 'Executive Formal Suits', slug: 'executive-formal-suits' },
        { name: 'Resort & Linen Leisure', slug: 'resort-linen-leisure' },
        { name: 'Silk Scarves & Stoles', slug: 'silk-scarves-stoles' },
        { name: 'Cashmere & Knitwear', slug: 'cashmere-knitwear' }
      ]
    },
    { name: 'CONTACT', url: 'contact.html', slug: 'contact' }
  ];

  // Helper: Get active navigation item based on URL
  function getActiveSlug() {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (search.includes('category=fragrance') || search.includes('perfumes')) return 'fragrance';
    if (search.includes('category=cosmetics')) return 'cosmetics';
    if (search.includes('category=personal-care')) return 'personal-care';
    if (search.includes('category=watches')) return 'watches';
    if (search.includes('category=eyewear') || search.includes('sunglasses')) return 'eyewear';
    if (search.includes('category=belts-accessories') || search.includes('belts')) return 'belts-accessories';
    if (search.includes('category=bags-wallets') || search.includes('bags')) return 'bags-wallets';
    if (search.includes('category=gift-sets')) return 'gift-sets';
    if (search.includes('category=fashion-wear')) return 'fashion-wear';
    if (path.includes('contact')) return 'contact';
    if (path === '/' || path.includes('index')) return 'home';
    return '';
  }

  // Highlight Active Navigation Link based on current URL
  function highlightActiveNav() {
    const activeSlug = getActiveSlug();
    const navItems = document.querySelectorAll('.header-bottom .navbar-nav > .nav-item');
    navItems.forEach(item => {
      const link = item.querySelector(':scope > a');
      if (!link) return;
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (activeSlug === 'home' && (href === 'index.html' || href === './' || href === 'index.html#' || href === '/')) {
        item.classList.add('active');
      } else if (activeSlug && activeSlug !== 'home' && href.includes(activeSlug)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Create Slide-Out Cart Drawer Structure in DOM
  function injectCartDrawer() {
    if (document.getElementById('erluxCartDrawer')) return;

    const drawerHtml = `
      <div class="erlux-cart-backdrop" id="erluxCartBackdrop"></div>
      <div class="erlux-cart-drawer" id="erluxCartDrawer">
        <div class="erlux-drawer-header">
          <h3><i class="fa-solid fa-bag-shopping"></i> Shopping Sanctuary</h3>
          <button class="erlux-drawer-close" id="erluxDrawerClose" aria-label="Close cart">&times;</button>
        </div>
        <div class="erlux-drawer-shipping-bar" id="erluxShippingBar">
          <div id="erluxShippingText">Complimentary Luxury Shipping on orders above ₹5,000</div>
          <div class="erlux-progress-track">
            <div class="erlux-progress-fill" id="erluxShippingProgress"></div>
          </div>
        </div>
        <div class="erlux-drawer-items" id="erluxDrawerItems">
          <div style="text-align:center; padding: 40px 20px; color: #94a3b8;">
            <i class="fa-solid fa-bag-shopping" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
            <p>Your luxury collection is currently empty.</p>
            <a href="shop.html" class="theme-button style-1" style="display:inline-block; margin-top:10px; font-size:11px; padding:8px 18px;">Discover Collections</a>
          </div>
        </div>
        <div class="erlux-drawer-footer" id="erluxDrawerFooter">
          <div class="erlux-subtotal-row">
            <span>Subtotal</span>
            <span id="erluxDrawerSubtotal">₹0</span>
          </div>
          <div class="erlux-subtotal-row" style="font-size:12px; color:#94a3b8;">
            <span>Estimated Shipping & Taxes</span>
            <span id="erluxDrawerTaxes">Calculated at checkout</span>
          </div>
          <div class="erlux-total-row">
            <span>Estimated Total</span>
            <span id="erluxDrawerTotal">₹0</span>
          </div>
          <div class="erlux-drawer-buttons">
            <a href="checkout.html" class="erlux-btn-checkout">Proceed to Checkout &rarr;</a>
            <a href="cart.html" class="erlux-btn-viewcart">View Full Cart</a>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    // Event listeners
    document.getElementById('erluxDrawerClose').addEventListener('click', closeCartDrawer);
    document.getElementById('erluxCartBackdrop').addEventListener('click', closeCartDrawer);
  }

  // Open & Close Cart Drawer
  function openCartDrawer() {
    injectCartDrawer();
    document.getElementById('erluxCartBackdrop').classList.add('open');
    document.getElementById('erluxCartDrawer').classList.add('open');
    refreshCartDrawer();
  }

  function closeCartDrawer() {
    const backdrop = document.getElementById('erluxCartBackdrop');
    const drawer = document.getElementById('erluxCartDrawer');
    if (backdrop) backdrop.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
  }

  // Fetch and Refresh Cart Data
  async function refreshCartDrawer() {
    try {
      const token = localStorage.getItem('erlux_user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let sessionId = localStorage.getItem('erlux_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now();
        localStorage.setItem('erlux_session_id', sessionId);
      }
      headers['x-session-id'] = sessionId;

      const res = await fetch('/api/cart', { headers });
      const json = await res.json();

      if (json.success && json.data) {
        updateCartBadge(json.data.itemCount);
        renderDrawerItems(json.data);
      }
    } catch (err) {
      console.warn('Cart refresh note:', err);
    }
  }

  // Render items inside drawer
  function renderDrawerItems(cart) {
    const container = document.getElementById('erluxDrawerItems');
    const footer = document.getElementById('erluxDrawerFooter');
    const subtotalEl = document.getElementById('erluxDrawerSubtotal');
    const totalEl = document.getElementById('erluxDrawerTotal');
    const shippingText = document.getElementById('erluxShippingText');
    const shippingProgress = document.getElementById('erluxShippingProgress');

    if (!container) return;

    if (!cart.items || cart.items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: #94a3b8;">
          <i class="fa-solid fa-bag-shopping" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
          <p>Your shopping bag is currently empty.</p>
          <a href="shop.html" class="theme-button style-1" style="display:inline-block; margin-top:10px; font-size:11px; padding:8px 18px;">Discover Creations</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '₹0';
      if (totalEl) totalEl.textContent = '₹0';
      if (shippingProgress) shippingProgress.style.width = '0%';
      return;
    }

    // Shipping progress calculation
    const threshold = cart.freeShippingThreshold || 5000;
    const progress = Math.min(100, Math.round((cart.subtotal / threshold) * 100));
    if (shippingProgress) shippingProgress.style.width = `${progress}%`;

    if (shippingText) {
      if (cart.subtotal >= threshold) {
        shippingText.innerHTML = '<span style="color:#d4af37;"><i class="fa-solid fa-check"></i> You have unlocked Complimentary White-Glove Shipping</span>';
      } else {
        const remaining = threshold - cart.subtotal;
        shippingText.textContent = `Add ₹${remaining.toLocaleString('en-IN')} more for Complimentary White-Glove Shipping`;
      }
    }

    // Render line items
    container.innerHTML = cart.items.map(item => `
      <div class="erlux-drawer-item">
        <img src="${item.main_image}" alt="${item.name}">
        <div class="erlux-drawer-item-info">
          <div class="erlux-drawer-item-title">${item.name}</div>
          ${item.variant_value ? `<div class="erlux-drawer-item-variant">${item.variant_name || item.variant_value}</div>` : ''}
          <div class="erlux-drawer-item-bottom">
            <div class="erlux-qty-selector">
              <button class="erlux-qty-btn" onclick="window.changeCartQty(${item.cart_item_id}, ${item.quantity - 1})">-</button>
              <span class="erlux-qty-value">${item.quantity}</span>
              <button class="erlux-qty-btn" onclick="window.changeCartQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="erlux-item-price">₹${item.line_total.toLocaleString('en-IN')}</div>
            <button class="erlux-item-remove" onclick="window.removeCartItem(${item.cart_item_id})" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `₹${cart.subtotal.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${cart.total.toLocaleString('en-IN')}`;
  }

  // Update Badge Counters
  function updateCartBadge(count) {
    const badges = document.querySelectorAll('.cart-btn span, .erlux-cart-badge, .mobile-bottom-navigation-menu .erlux-cart-badge');
    badges.forEach(b => {
      b.textContent = count !== undefined && count !== null ? count : 0;
      if (!b.classList.contains('erlux-badge')) b.classList.add('erlux-badge');
    });
  }

  function updateWishlistBadge(count) {
    const badges = document.querySelectorAll('.heart-btn span, .erlux-wishlist-badge, .mobile-bottom-navigation-menu .erlux-wishlist-badge');
    badges.forEach(b => {
      b.textContent = count !== undefined && count !== null ? count : 0;
      if (!b.classList.contains('erlux-badge')) b.classList.add('erlux-badge');
    });
  }

  // Toast Notification
  function showToast(message, icon = 'fa-check') {
    let toast = document.getElementById('erluxGlobalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'erluxGlobalToast';
      toast.className = 'erlux-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Global Add to Cart
  async function addToCart(productId, variantId = null, quantity = 1) {
    try {
      const token = localStorage.getItem('erlux_user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let sessionId = localStorage.getItem('erlux_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now();
        localStorage.setItem('erlux_session_id', sessionId);
      }
      headers['x-session-id'] = sessionId;

      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId, variantId, quantity, sessionId })
      });

      const data = await res.json();
      if (data.success) {
        updateCartBadge(data.itemCount);
        showToast(data.message || 'Added to your luxury shopping bag');
        openCartDrawer();
      } else {
        showToast(data.message || 'Could not add to bag', 'fa-triangle-exclamation');
      }
    } catch (err) {
      showToast('Error communicating with server', 'fa-triangle-exclamation');
    }
  }

  // Global Change Quantity
  async function changeCartQty(cartItemId, newQty) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('erlux_user_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/cart/update', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ cartItemId, quantity: newQty })
      });
      refreshCartDrawer();
    } catch (e) {
      console.warn(e);
    }
  }

  // Global Remove Cart Item
  async function removeCartItem(cartItemId) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('erlux_user_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/cart/item/${cartItemId}`, {
        method: 'DELETE',
        headers
      });
      refreshCartDrawer();
      showToast('Item removed from your bag');
    } catch (e) {
      console.warn(e);
    }
  }

  // Global Toggle Wishlist
  async function toggleWishlist(productId) {
    const token = localStorage.getItem('erlux_user_token');
    if (!token) {
      showToast('Please sign in to access your personal wishlist', 'fa-user');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        updateWishlistBadge(data.count);
        showToast(data.message, data.inWishlist ? 'fa-heart' : 'fa-check');
      }
    } catch (err) {
      showToast('Could not update wishlist', 'fa-triangle-exclamation');
    }
  }

  // Wire search form
  function initSearchForm() {
    const forms = document.querySelectorAll('.header-search-form, #headerForm');
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[name="product"], input[type="text"]');
        if (input && input.value.trim()) {
          window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
        }
      });
    });
  }

  // Wire cart and wishlist icons
  function initHeaderButtons() {
    const cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openCartDrawer();
      });
    });

    const accountBtns = document.querySelectorAll('.account-btn');
    accountBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        const token = localStorage.getItem('erlux_user_token');
        if (token) {
          e.preventDefault();
          window.location.href = 'account-dashboard.html';
        }
      });
    });
  }

  // Initialize and Sync Mobile Bottom Navigation
  function initMobileBottomNav() {
    const mobileNav = document.getElementById('erluxMobileBottomNav') || document.querySelector('.mobile-bottom-navigation-menu');
    if (!mobileNav) return;

    // Smart Account routing based on auth state
    const accountLink = mobileNav.querySelector('#mobileNavAccountLink') || mobileNav.querySelector('[data-tab="account"]');
    if (accountLink) {
      const token = localStorage.getItem('erlux_user_token');
      accountLink.href = token ? 'account-dashboard.html' : 'login.html';
    }

    // Determine current page
    const path = window.location.pathname.toLowerCase();
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Remove any hardcoded active classes
    mobileNav.querySelectorAll('.mobile-bottom-navigation-item a').forEach(a => a.classList.remove('active'));

    let activeTab = 'home';
    if (filename.includes('wishlist')) {
      activeTab = 'wishlist';
    } else if (filename.includes('cart') || filename.includes('checkout')) {
      activeTab = 'cart';
    } else if (filename.includes('account') || filename.includes('login') || filename.includes('register')) {
      activeTab = 'account';
    } else if (filename.includes('shop') || filename.includes('category') || filename.includes('categories')) {
      activeTab = 'categories';
    } else if (filename === '' || filename === 'index.html' || filename.includes('home')) {
      activeTab = 'home';
    }

    const currentTabEl = mobileNav.querySelector(`[data-tab="${activeTab}"]`);
    if (currentTabEl) {
      currentTabEl.classList.add('active');
    }
  }

  // Highlight active navbar link on desktop and mobile
  function highlightActiveNav() {
    initMobileBottomNav();

    const path = window.location.pathname.toLowerCase();
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .header-navigation a');
    navLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href && (href === filename || (filename === 'index.html' && href.includes('index.html')))) {
        link.classList.add('active');
      }
    });
  }

  // Expose Global API
  window.erluxToast = showToast;
  window.openCartDrawer = openCartDrawer;
  window.closeCartDrawer = closeCartDrawer;
  window.refreshCartDrawer = refreshCartDrawer;
  window.addToCart = addToCart;
  window.changeCartQty = changeCartQty;
  window.removeCartItem = removeCartItem;
  window.toggleWishlist = toggleWishlist;
  window.updateCartBadge = updateCartBadge;
  window.updateWishlistBadge = updateWishlistBadge;
  window.initMobileBottomNav = initMobileBottomNav;

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', async () => {
    injectCartDrawer();
    initSearchForm();
    initHeaderButtons();

    // Highlight active navbar link and init mobile bottom nav
    highlightActiveNav();

    // Refresh cart badge and wishlist badge
    refreshCartDrawer();

    const token = localStorage.getItem('erlux_user_token');
    if (token) {
      fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => {
        if (d.success) updateWishlistBadge(d.count);
      })
      .catch(() => {});
    }
  });

})();
