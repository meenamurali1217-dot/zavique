/**
 * ERLUX Cart & Wishlist Page Controller
 * Powers cart.html and wishlist.html with real-time updates and coupon validation
 */

(function () {
  'use strict';

  let appliedCoupon = null;

  // Render Full Cart Page
  async function loadCartPage() {
    const tableBody = document.querySelector('.cart-table tbody');
    if (!tableBody || !window.location.pathname.includes('cart')) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('erlux_user_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let sessionId = localStorage.getItem('erlux_session_id');
      if (sessionId) headers['x-session-id'] = sessionId;

      const res = await fetch('/api/cart', { headers });
      const json = await res.json();

      if (!json.success || !json.data || !json.data.items || json.data.items.length === 0) {
        document.querySelector('.cart-wapper').innerHTML = `
          <div style="text-align:center; padding: 80px 20px; background:#111827; border: 1px solid rgba(212,175,55,0.25); border-radius:6px;">
            <i class="fa-solid fa-bag-shopping" style="font-size: 54px; color:#d4af37; margin-bottom:16px; opacity:0.8;"></i>
            <h2 style="color:#ffffff; font-size:22px; margin-bottom:10px;">Your Shopping Bag is Empty</h2>
            <p style="color:#94a3b8; max-width:440px; margin:0 auto 24px;">Explore our 9 sovereign collections and curate your personal luxury collection.</p>
            <a href="shop.html" class="theme-button style-1" style="font-size:12px; padding:12px 28px;">Explore Collections</a>
          </div>
        `;
        return;
      }

      const cart = json.data;

      // Update count heading
      const countEl = document.querySelector('.heading span');
      if (countEl) countEl.textContent = `(${cart.itemCount} Items)`;

      // Render table rows
      tableBody.innerHTML = cart.items.map(item => `
        <tr class="cart-item" style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td data-title="Image" class="product-thumbnails">
            <a href="shop-details.html?slug=${item.slug}" class="product-img">
              <figure class="image-anime" style="margin:0;">
                <img src="${item.main_image}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:4px; border:1px solid rgba(212,175,55,0.2);">
              </figure>
            </a>
          </td>
          <td data-title="Name" class="product-info">
            <a href="shop-details.html?slug=${item.slug}" class="product-name" style="color:#ffffff; font-weight:600; font-size:15px; text-decoration:none;">${item.name}</a>
            <ul class="style-meta" style="list-style:none; padding:0; margin:4px 0 0; font-size:12px; color:#94a3b8;">
              <li>SKU: ${item.sku}</li>
              ${item.variant_value ? `<li style="color:#d4af37;">${item.variant_name || item.variant_value}</li>` : ''}
            </ul>
          </td>
          <td data-title="Price" class="price"><span style="color:#d4af37; font-weight:700;">₹${item.unit_price.toLocaleString('en-IN')}</span></td>
          <td data-title="Quantity" class="quantity">
            <div class="quantity-content" style="display:inline-flex; align-items:center; border:1px solid rgba(255,255,255,0.2); border-radius:3px; background:#0d131f;">
              <button class="qty-btn-minus" type="button" onclick="window.changeCartQty(${item.cart_item_id}, ${item.quantity - 1}).then(loadCartPage)" style="background:none; border:none; color:#cbd5e1; width:26px; height:26px; cursor:pointer;">-</button>
              <input type="text" value="${item.quantity}" readonly class="input-qty" style="width:34px; text-align:center; background:none; border:none; color:#fff; font-weight:700; font-size:12px;">
              <button class="qty-btn-plus" type="button" onclick="window.changeCartQty(${item.cart_item_id}, ${item.quantity + 1}).then(loadCartPage)" style="background:none; border:none; color:#cbd5e1; width:26px; height:26px; cursor:pointer;">+</button>
            </div>
          </td>
          <td data-title="Total" class="price total-price">
            <span style="color:#ffffff; font-weight:700;">₹${item.line_total.toLocaleString('en-IN')}</span>
          </td>
          <td data-title="Remove">
            <a href="#" class="remove-product" onclick="window.removeCartItem(${item.cart_item_id}).then(loadCartPage); return false;" style="color:#ef4444;"><i class="fa-solid fa-xmark"></i></a>
          </td>
        </tr>
      `).join('');

      renderCartSummary(cart);
      initCouponForm(cart);

    } catch (err) {
      console.warn('Cart page load note:', err);
    }
  }

  // Render Order Summary Card
  function renderCartSummary(cart) {
    let discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    let taxable = Math.max(0, cart.subtotal - discount);
    let shipping = taxable >= 5000 || taxable === 0 ? 0 : 250;
    let tax = Math.round(taxable * 0.18);
    let grandTotal = taxable + shipping + tax;

    const summaryContainers = document.querySelectorAll('.cart-collaterals, .cart-totals, .checkout-order-review');
    summaryContainers.forEach(container => {
      let subtotalEl = container.querySelector('.cart-subtotal-price, .cart-subtotal span:last-child');
      let shippingEl = container.querySelector('.shipping-price, .shipping-fee');
      let taxEl = container.querySelector('.tax-price');
      let totalEl = container.querySelector('.order-total-price, .order-total span:last-child');

      if (subtotalEl) subtotalEl.textContent = `₹${cart.subtotal.toLocaleString('en-IN')}`;
      if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Complimentary' : `₹${shipping}`;
      if (taxEl) taxEl.textContent = `₹${tax.toLocaleString('en-IN')}`;
      if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    });

    // Store checkout total snapshot
    sessionStorage.setItem('erlux_checkout_subtotal', cart.subtotal);
    sessionStorage.setItem('erlux_checkout_discount', discount);
    sessionStorage.setItem('erlux_checkout_coupon', appliedCoupon ? appliedCoupon.code : '');
    sessionStorage.setItem('erlux_checkout_shipping', shipping);
    sessionStorage.setItem('erlux_checkout_tax', tax);
    sessionStorage.setItem('erlux_checkout_total', grandTotal);
  }

  // Handle Coupon Application
  function initCouponForm(cart) {
    const couponForm = document.querySelector('.coupon-form, form.coupon-code');
    if (!couponForm) return;

    couponForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const input = couponForm.querySelector('input[type="text"]');
      if (!input || !input.value.trim()) return;

      const code = input.value.trim();
      try {
        const res = await fetch('/api/checkout/validate-coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal: cart.subtotal })
        });
        const data = await res.json();

        if (data.success) {
          appliedCoupon = data;
          if (window.erluxToast) window.erluxToast(data.message);
          renderCartSummary(cart);
        } else {
          if (window.erluxToast) window.erluxToast(data.message, 'fa-triangle-exclamation');
        }
      } catch (err) {
        if (window.erluxToast) window.erluxToast('Failed to validate coupon', 'fa-triangle-exclamation');
      }
    });
  }

  // Render Full Wishlist Page
  async function loadWishlistPage() {
    const tableBody = document.querySelector('.wishlist-table tbody');
    if (!tableBody || !window.location.pathname.includes('wishlist')) return;

    const token = localStorage.getItem('erlux_user_token');
    if (!token) {
      document.querySelector('.wishlist-wapper, .container').innerHTML = `
        <div style="text-align:center; padding: 80px 20px; background:#111827; border: 1px solid rgba(212,175,55,0.25); border-radius:6px; margin: 40px auto; max-width:600px;">
          <i class="fa-solid fa-heart" style="font-size: 48px; color:#d4af37; margin-bottom:16px;"></i>
          <h2 style="color:#ffffff; font-size:22px; margin-bottom:10px;">Your Private Wishlist Sanctuary</h2>
          <p style="color:#94a3b8; margin-bottom:24px;">Please authenticate to access your curated selection of desires.</p>
          <a href="login.html?redirect=wishlist.html" class="theme-button style-1" style="font-size:12px; padding:12px 28px;">Sign In to Your Account</a>
        </div>
      `;
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:50px; color:#94a3b8;">Your wishlist is currently devoid of selections.</td></tr>`;
        return;
      }

      tableBody.innerHTML = json.data.map(item => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td data-title="Image">
            <a href="shop-details.html?slug=${item.slug}">
              <img src="${item.main_image}" alt="${item.name}" style="width:75px; height:75px; object-fit:cover; border-radius:4px; border:1px solid rgba(212,175,55,0.2);">
            </a>
          </td>
          <td data-title="Name">
            <a href="shop-details.html?slug=${item.slug}" style="color:#ffffff; font-weight:600; text-decoration:none;">${item.name}</a>
            <div style="font-size:12px; color:#94a3b8;">${item.category_name}</div>
          </td>
          <td data-title="Price" style="color:#d4af37; font-weight:700;">₹${item.price.toLocaleString('en-IN')}</td>
          <td data-title="Status">
            <span style="color:#10b981; font-weight:700; font-size:12px;"><i class="fa-solid fa-circle-check"></i> In Stock</span>
          </td>
          <td data-title="Action">
            <button class="theme-button style-1" onclick="window.addToCart(${item.product_id})" style="padding:6px 16px; font-size:11px;">Add to Bag</button>
            <button onclick="window.toggleWishlist(${item.product_id}).then(loadWishlistPage)" style="background:none; border:none; color:#ef4444; margin-left:12px; cursor:pointer;" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `).join('');

    } catch (err) {
      console.warn('Wishlist page load note:', err);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    loadCartPage();
    loadWishlistPage();
  });

})();
