/**
 * ERLUX Checkout & Order Confirmation Controller
 * Handles checkout.html and order-received.html
 */

(function () {
  'use strict';

  let checkoutCart = null;

  // Initialize Checkout Page
  async function initCheckoutPage() {
    const isCheckout = window.location.pathname.includes('checkout');
    if (!isCheckout) return;

    // 1. Pre-fill customer info if logged in
    const token = localStorage.getItem('erlux_user_token');
    if (token) {
      try {
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          const user = userData.user;
          const defaultAddr = userData.addresses && userData.addresses.length > 0 ? userData.addresses[0] : null;

          const names = (user.full_name || '').split(' ');
          const fnInput = document.getElementById('firstname');
          const lnInput = document.getElementById('lastname');
          const emailInput = document.getElementById('email');
          const phoneInput = document.getElementById('phone');

          if (fnInput) fnInput.value = names[0] || '';
          if (lnInput) lnInput.value = names.slice(1).join(' ') || '';
          if (emailInput) emailInput.value = user.email || '';
          if (phoneInput) phoneInput.value = user.phone || '';

          if (defaultAddr) {
            const addr1 = document.getElementById('address');
            const addr2 = document.getElementById('address2');
            const city = document.getElementById('town');
            const state = document.getElementById('state');
            const post = document.getElementById('postcode');

            if (addr1) addr1.value = defaultAddr.address_line1 || '';
            if (addr2) addr2.value = defaultAddr.address_line2 || '';
            if (city) city.value = defaultAddr.city || '';
            if (state) state.value = defaultAddr.state || '';
            if (post) post.value = defaultAddr.postal_code || '';
          }
        }
      } catch (e) {
        console.warn('Checkout auth prefill note:', e);
      }
    }

    // Render detected location banner for user confirmation
    renderDetectedLocationPrompt();

    // 2. Load Cart for Order Summary
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let sessionId = localStorage.getItem('erlux_session_id');
      if (sessionId) headers['x-session-id'] = sessionId;

      const res = await fetch('/api/cart', { headers });
      const json = await res.json();

      if (!json.success || !json.data || !json.data.items || json.data.items.length === 0) {
        const formWrap = document.querySelector('.shop-checkout-section .container');
        if (formWrap) {
          formWrap.innerHTML = `
            <div style="text-align:center; padding: 70px 20px; background:#111827; border:1px solid rgba(212,175,55,0.25); border-radius:6px; max-width:600px; margin: 0 auto;">
              <i class="fa-solid fa-bag-shopping" style="font-size:48px; color:#d4af37; margin-bottom:16px;"></i>
              <h2 style="color:#ffffff; font-size:22px; margin-bottom:12px;">Your Shopping Bag is Empty</h2>
              <p style="color:#94a3b8; margin-bottom:24px;">Please select luxury items from our collections before checking out.</p>
              <a href="shop.html" class="theme-button style-1" style="font-size:12px; padding:10px 24px;">Return to Collections</a>
            </div>
          `;
        }
        return;
      }

      checkoutCart = json.data;
      renderCheckoutSummary(checkoutCart);

    } catch (err) {
      console.warn('Checkout cart load error:', err);
    }

    // 3. Configure Payment Options
    const paymentOptionsContainer = document.querySelector('.checkout-payment-option');
    if (paymentOptionsContainer) {
      paymentOptionsContainer.innerHTML = `
        <div class="custome-radio mb-2" style="background:#0d131f; padding:12px; border:1px solid rgba(255,255,255,0.1); border-radius:4px;">
          <input type="radio" name="paymentoption" id="payCOD" value="COD" checked>
          <label for="payCOD" style="color:#ffffff; font-weight:700; cursor:pointer; margin-left:6px;">
            <i class="fa-solid fa-handshake" style="color:#d4af37; margin-right:6px;"></i> White-Glove Concierge Delivery (COD)
          </label>
          <p style="color:#94a3b8; font-size:12px; margin:6px 0 0 24px;">Pay securely with cash or card upon delivery by our white-glove courier.</p>
        </div>
        <div class="custome-radio mb-2" style="background:#0d131f; padding:12px; border:1px solid rgba(212,175,55,0.3); border-radius:4px;">
          <input type="radio" name="paymentoption" id="payRazorpay" value="RAZORPAY">
          <label for="payRazorpay" style="color:#ffffff; font-weight:700; cursor:pointer; margin-left:6px;">
            <i class="fa-solid fa-credit-card" style="color:#d4af37; margin-right:6px;"></i> Razorpay Luxury Gateway (Cards, UPI, NetBanking)
          </label>
          <p style="color:#94a3b8; font-size:12px; margin:6px 0 0 24px;">Instant secure 256-bit encrypted checkout via Razorpay Luxury Suite.</p>
        </div>
      `;
    }

    // 4. Form Submit Listener
    const checkoutForm = document.querySelector('.shop-checkout-section form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleOrderSubmit);
    }
  }

  // Render Detected Location Confirmation Prompt Banner
  function renderDetectedLocationPrompt() {
    const heading = document.querySelector('.checkout-single .heading');
    if (!heading) return;

    let banner = document.getElementById('erluxCheckoutLocBanner');
    const loc = window.erluxLocation ? window.erluxLocation.get() : null;

    if (!loc || (!loc.city && !loc.locality)) {
      if (banner) banner.remove();
      return;
    }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'erluxCheckoutLocBanner';
      banner.className = 'erlux-checkout-loc-banner mb-4';
      heading.insertAdjacentElement('afterend', banner);
    }

    const displayAddr = loc.display || [loc.locality, loc.city].filter(Boolean).join(', ');
    const fullPin = loc.postal_code ? ` - ${loc.postal_code}` : '';

    banner.innerHTML = `
      <div style="background: #0d131f; border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 6px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #d4af37; color: #0b1320; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #d4af37; font-weight: 700;">Detected Delivery Residence</div>
            <div style="color: #ffffff; font-weight: 700; font-size: 14.5px;">${displayAddr}${fullPin}</div>
            <div style="color: #94a3b8; font-size: 12px;">${loc.state || 'India'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="erluxBtnApplyDetectedLoc" style="background: #d4af37; color: #0b1320; border: none; font-weight: 700; font-size: 12px; padding: 8px 18px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;">
            <i class="fa-solid fa-check"></i> Apply to Address
          </button>
          <button type="button" onclick="if(window.erluxLocation) window.erluxLocation.openModal()" style="background: transparent; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.25); font-weight: 600; font-size: 12px; padding: 8px 14px; border-radius: 4px; cursor: pointer;">
            Change
          </button>
        </div>
      </div>
    `;

    document.getElementById('erluxBtnApplyDetectedLoc')?.addEventListener('click', () => {
      applyLocationToAddress(loc);
    });
  }

  function applyLocationToAddress(loc) {
    if (!loc) return;
    const cityInput = document.getElementById('town');
    const stateInput = document.getElementById('state');
    const postInput = document.getElementById('postcode');
    const addr1Input = document.getElementById('address');

    if (cityInput && (loc.city || loc.locality)) cityInput.value = loc.city || loc.locality;
    if (stateInput && loc.state) stateInput.value = loc.state;
    if (postInput && loc.postal_code) postInput.value = loc.postal_code;
    if (addr1Input && !addr1Input.value.trim() && loc.locality) {
      addr1Input.value = loc.locality;
    }

    if (window.erluxToast) {
      window.erluxToast('Delivery location applied to shipping address', 'fa-location-dot');
    }
  }

  window.addEventListener('erlux:locationChanged', () => {
    renderDetectedLocationPrompt();
  });

  // Render Checkout Summary Table
  function renderCheckoutSummary(cart) {
    const tableBody = document.querySelector('.checkout-total-table tbody');
    if (!tableBody) return;

    const couponCode = sessionStorage.getItem('erlux_checkout_coupon') || '';
    const discount = parseFloat(sessionStorage.getItem('erlux_checkout_discount') || '0');
    const taxable = Math.max(0, cart.subtotal - discount);
    const shipping = taxable >= 5000 || taxable === 0 ? 0 : 250;
    const tax = Math.round(taxable * 0.18);
    const total = taxable + shipping + tax;

    let itemsHtml = cart.items.map(i => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
        <th style="color:#cbd5e1; font-weight:500; font-size:13px; padding:10px 0;">
          ${i.name} <span style="color:#d4af37; font-weight:700;">x ${i.quantity}</span>
          ${i.variant_value ? `<div style="font-size:11px; color:#94a3b8;">${i.variant_name || i.variant_value}</div>` : ''}
        </th>
        <td style="color:#ffffff; font-weight:700; text-align:right; font-size:13px; padding:10px 0;">
          ₹${i.line_total.toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    tableBody.innerHTML = `
      ${itemsHtml}
      <tr style="border-top:1px solid rgba(212,175,55,0.2);">
        <th style="padding:8px 0; color:#94a3b8;">Subtotal</th>
        <td style="padding:8px 0; text-align:right; color:#ffffff; font-weight:700;">₹${cart.subtotal.toLocaleString('en-IN')}</td>
      </tr>
      ${discount > 0 ? `
        <tr>
          <th style="padding:8px 0; color:#10b981;">Privilege Discount (${couponCode})</th>
          <td style="padding:8px 0; text-align:right; color:#10b981; font-weight:700;">-₹${discount.toLocaleString('en-IN')}</td>
        </tr>
      ` : ''}
      <tr>
        <th style="padding:8px 0; color:#94a3b8;">White-Glove Shipping</th>
        <td style="padding:8px 0; text-align:right; color:${shipping === 0 ? '#d4af37' : '#ffffff'}; font-weight:700;">
          ${shipping === 0 ? 'Complimentary' : '₹' + shipping}
        </td>
      </tr>
      <tr>
        <th style="padding:8px 0; color:#94a3b8;">GST (18%)</th>
        <td style="padding:8px 0; text-align:right; color:#ffffff; font-weight:700;">₹${tax.toLocaleString('en-IN')}</td>
      </tr>
      <tr style="border-top:2px solid #d4af37;">
        <th style="padding:14px 0; color:#ffffff; font-size:16px; font-weight:800;">Grand Total</th>
        <td style="padding:14px 0; text-align:right; color:#d4af37; font-size:18px; font-weight:800;">₹${total.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  // Handle Order Placement
  async function handleOrderSubmit(e) {
    e.preventDefault();

    const fn = document.getElementById('firstname')?.value.trim() || '';
    const ln = document.getElementById('lastname')?.value.trim() || '';
    const customer_name = `${fn} ${ln}`.trim();
    const customer_email = document.getElementById('email')?.value.trim() || '';
    const customer_phone = document.getElementById('phone')?.value.trim() || '';
    const address1 = document.getElementById('address')?.value.trim() || '';
    const address2 = document.getElementById('address2')?.value.trim() || '';
    const city = document.getElementById('town')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const postal_code = document.getElementById('postcode')?.value.trim() || '';
    const country = document.getElementById('country')?.value || 'India';
    const notes = document.getElementById('message')?.value.trim() || '';

    const selectedPayRadio = document.querySelector('input[name="paymentoption"]:checked');
    const payment_method = selectedPayRadio ? selectedPayRadio.value : 'COD';

    if (!customer_name || !customer_email || !customer_phone || !address1 || !city || !state || !postal_code) {
      alert('Please fill out all required contact and shipping residence fields.');
      return;
    }

    const shipping_address = {
      name: customer_name,
      phone: customer_phone,
      address_line1: address1,
      address_line2: address2,
      city,
      state,
      postal_code,
      country
    };

    const coupon_code = sessionStorage.getItem('erlux_checkout_coupon') || null;

    const submitBtn = document.querySelector('.payment-button-wapper button[type="submit"]');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Place Order';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing Luxury Order...';
    }

    try {
      const token = localStorage.getItem('erlux_user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let sessionId = localStorage.getItem('erlux_session_id');
      if (sessionId) headers['x-session-id'] = sessionId;

      const payload = {
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        billing_address: shipping_address,
        payment_method,
        coupon_code,
        cartId: checkoutCart ? checkoutCart.cartId : null,
        notes
      };

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.data) {
        // Clear cart local count and redirect
        sessionStorage.removeItem('erlux_checkout_coupon');
        sessionStorage.removeItem('erlux_checkout_discount');
        if (window.updateCartBadge) window.updateCartBadge(0);

        window.location.href = `order-received.html?order=${data.data.orderNumber}`;
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
        alert(data.message || 'Could not place order. Please check details.');
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
      alert('Error contacting order server');
    }
  }

  // Initialize Order Received Page
  async function initOrderReceivedPage() {
    const isOrderReceived = window.location.pathname.includes('order-received');
    if (!isOrderReceived) return;

    const orderNumber = new URLSearchParams(window.location.search).get('order');
    if (!orderNumber) {
      console.warn('No order number specified');
      return;
    }

    try {
      const res = await fetch(`/api/checkout/order/${orderNumber}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        document.querySelector('.order-received-wapper').innerHTML = `<p style="color:#ef4444; text-align:center;">Order ${orderNumber} not found.</p>`;
        return;
      }

      const order = json.data;
      renderOrderReceivedDetails(order);

    } catch (err) {
      console.warn('Order received error:', err);
    }
  }

  function renderOrderReceivedDetails(order) {
    const container = document.querySelector('.order-received-wapper, .order-details-wapper, .container');
    if (!container) return;

    const addr = order.shipping_address || {};

    container.innerHTML = `
      <div style="background:#111827; border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:40px; margin: 40px auto; max-width:900px; box-shadow:0 15px 40px rgba(0,0,0,0.5);">
        <div style="text-align:center; margin-bottom:32px;">
          <div style="width:70px; height:70px; background:rgba(212,175,55,0.15); border:2px solid #d4af37; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
            <i class="fa-solid fa-crown" style="font-size:32px; color:#d4af37;"></i>
          </div>
          <h2 style="color:#ffffff; font-size:26px; font-weight:700; margin-bottom:6px;">Your ERLUX Order is Confirmed</h2>
          <p style="color:#94a3b8; font-size:14px; max-width:550px; margin:0 auto;">
            Thank you, <strong style="color:#fff;">${order.customer_name}</strong>. Your luxury acquisition has been secured. Our white-glove atelier is now preparing your order with utmost discretion.
          </p>
        </div>

        <!-- Quick Summary Ribbon -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; background:#0d131f; padding:20px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); margin-bottom:32px;">
          <div>
            <div style="font-size:11px; color:#d4af37; text-transform:uppercase; font-weight:700; letter-spacing:0.1em;">Order Reference</div>
            <div style="color:#ffffff; font-weight:800; font-size:16px; margin-top:2px;">${order.order_number}</div>
          </div>
          <div>
            <div style="font-size:11px; color:#d4af37; text-transform:uppercase; font-weight:700; letter-spacing:0.1em;">Date Placed</div>
            <div style="color:#ffffff; font-weight:600; font-size:14px; margin-top:2px;">${new Date(order.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div style="font-size:11px; color:#d4af37; text-transform:uppercase; font-weight:700; letter-spacing:0.1em;">Total Amount</div>
            <div style="color:#d4af37; font-weight:800; font-size:16px; margin-top:2px;">₹${order.total_amount.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style="font-size:11px; color:#d4af37; text-transform:uppercase; font-weight:700; letter-spacing:0.1em;">Payment Method</div>
            <div style="color:#ffffff; font-weight:600; font-size:14px; margin-top:2px;">${order.payment_method} (${order.payment_status})</div>
          </div>
        </div>

        <!-- Order Items Table -->
        <h3 style="color:#ffffff; font-size:16px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px;">Acquired Creations</h3>
        <table class="table" style="color:#cbd5e1; border-color:rgba(255,255,255,0.08); margin-bottom:24px;">
          <thead>
            <tr style="border-bottom:1px solid rgba(212,175,55,0.3);">
              <th>Creation</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(it => `
              <tr>
                <td style="display:flex; align-items:center; gap:12px;">
                  <img src="${it.image_url}" alt="${it.product_name}" style="width:50px; height:50px; object-fit:cover; border-radius:3px; border:1px solid rgba(255,255,255,0.1);">
                  <div>
                    <strong style="color:#ffffff;">${it.product_name}</strong>
                    ${it.variant_name ? `<div style="font-size:11px; color:#d4af37;">${it.variant_name}</div>` : ''}
                  </div>
                </td>
                <td style="color:#94a3b8; font-size:12px;">${it.sku}</td>
                <td style="color:#ffffff; font-weight:700;">${it.quantity}</td>
                <td style="color:#d4af37; font-weight:700; text-align:right;">₹${it.total_price.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="3" style="text-align:right; color:#94a3b8; border:none; padding-top:16px;">Subtotal:</th>
              <td style="text-align:right; color:#fff; font-weight:700; border:none; padding-top:16px;">₹${order.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${order.discount_amount > 0 ? `
              <tr>
                <th colspan="3" style="text-align:right; color:#10b981; border:none;">Privilege Concession:</th>
                <td style="text-align:right; color:#10b981; font-weight:700; border:none;">-₹${order.discount_amount.toLocaleString('en-IN')}</td>
              </tr>
            ` : ''}
            <tr>
              <th colspan="3" style="text-align:right; color:#94a3b8; border:none;">White-Glove Shipping:</th>
              <td style="text-align:right; color:#d4af37; font-weight:700; border:none;">${order.shipping_fee === 0 ? 'Complimentary' : '₹' + order.shipping_fee}</td>
            </tr>
            <tr>
              <th colspan="3" style="text-align:right; color:#94a3b8; border:none;">GST (18%):</th>
              <td style="text-align:right; color:#fff; font-weight:700; border:none;">₹${order.tax_amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top:2px solid #d4af37;">
              <th colspan="3" style="text-align:right; color:#fff; font-size:16px; font-weight:800;">Total Paid:</th>
              <td style="text-align:right; color:#d4af37; font-size:18px; font-weight:800;">₹${order.total_amount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Shipping Residence Details -->
        <div style="background:#0d131f; padding:20px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); margin-bottom:32px;">
          <h4 style="color:#d4af37; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Shipping Residence</h4>
          <p style="color:#ffffff; margin:0 0 4px 0; font-weight:600;">${addr.name || order.customer_name}</p>
          <p style="color:#cbd5e1; font-size:13px; margin:0 0 4px 0;">${addr.address_line1 || ''}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</p>
          <p style="color:#cbd5e1; font-size:13px; margin:0 0 6px 0;">${addr.city || ''}, ${addr.state || ''} - ${addr.postal_code || ''}, ${addr.country || 'India'}</p>
          <p style="color:#94a3b8; font-size:12px; margin:0;"><i class="fa-solid fa-phone me-1"></i> ${addr.phone || order.customer_phone}</p>
        </div>

        <!-- Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <a href="shop.html" class="theme-button style-1" style="font-size:11px; padding:10px 22px;">Continue Shopping</a>
          <button type="button" onclick="window.print()" class="erlux-btn-viewcart" style="display:inline-block; width:auto; padding:10px 22px; font-size:11px; cursor:pointer;">
            <i class="fa-solid fa-print me-2"></i> Print Official Receipt
          </button>
        </div>
      </div>
    `;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
    initOrderReceivedPage();
  });

})();
