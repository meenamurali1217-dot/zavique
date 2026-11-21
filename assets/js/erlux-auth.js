/**
 * ERLUX Customer Authentication & Account Management Controller
 * Handles login, register, profile, addresses, order history, and auth guards
 */

(function () {
  'use strict';

  // Check if logged in
  function getToken() {
    return localStorage.getItem('erlux_user_token');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('erlux_user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem('erlux_user_token');
    localStorage.removeItem('erlux_user');
    window.location.href = 'login.html';
  }

  window.erluxLogout = logout;

  // Handle Login Page
  function initLoginForm() {
    const form = document.querySelector('form.authentication-form, #loginForm');
    if (!form || !window.location.pathname.includes('login')) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"], input[name="email"]');
      const passInput = form.querySelector('input[type="password"], input[name="password"]');

      if (!emailInput || !passInput) return;

      const email = emailInput.value.trim();
      const password = passInput.value;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Sign In';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...';
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('erlux_user_token', data.token);
          localStorage.setItem('erlux_user', JSON.stringify(data.user));

          // Sync cart if session exists
          const sessionId = localStorage.getItem('erlux_session_id');
          if (sessionId) {
            try {
              await fetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`,
                  'x-session-id': sessionId
                },
                body: JSON.stringify({})
              });
            } catch (e) {}
          }

          if (window.erluxToast) window.erluxToast('Welcome back to ERLUX');
          setTimeout(() => {
            const redirect = new URLSearchParams(window.location.search).get('redirect') || 'account-dashboard.html';
            window.location.href = redirect;
          }, 800);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          if (window.erluxToast) {
            window.erluxToast(data.message || 'Invalid credentials', 'fa-triangle-exclamation');
          } else {
            alert(data.message || 'Invalid credentials');
          }
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        alert('Could not connect to authentication service');
      }
    });
  }

  // Handle Registration Page
  function initRegisterForm() {
    const form = document.querySelector('form.authentication-form, #registerForm');
    if (!form || !window.location.pathname.includes('sign-up')) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const nameInput = form.querySelector('input[name="fullname"], input[placeholder*="Name"], input[type="text"]');
      const emailInput = form.querySelector('input[type="email"], input[name="email"]');
      const passInput = form.querySelector('input[type="password"], input[name="password"]');
      const phoneInput = form.querySelector('input[type="tel"], input[name="phone"]');

      if (!nameInput || !emailInput || !passInput) return;

      const full_name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passInput.value;
      const phone = phoneInput ? phoneInput.value.trim() : '';

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Register';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name, email, password, phone })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('erlux_user_token', data.token);
          localStorage.setItem('erlux_user', JSON.stringify(data.user));

          if (window.erluxToast) window.erluxToast('Account created successfully');
          setTimeout(() => {
            window.location.href = 'account-dashboard.html';
          }, 800);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          if (window.erluxToast) {
            window.erluxToast(data.message || 'Registration failed', 'fa-triangle-exclamation');
          } else {
            alert(data.message || 'Registration failed');
          }
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        alert('Could not connect to registration service');
      }
    });
  }

  // Handle Account Dashboard & Profile
  async function initAccountDashboard() {
    const isAccountPage = window.location.pathname.includes('account');
    if (!isAccountPage) return;

    const token = getToken();
    if (!token) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.success) {
        logout();
        return;
      }

      const { user, addresses, stats } = data;

      // Update User Name and Info in sidebar
      const nameEls = document.querySelectorAll('.account-user-name, .dashboard-user-name, .user-name');
      nameEls.forEach(el => el.textContent = user.full_name);

      const emailEls = document.querySelectorAll('.account-user-email, .dashboard-user-email, .user-email');
      emailEls.forEach(el => el.textContent = user.email);

      // Dashboard stats
      const totalOrdersEl = document.getElementById('accountTotalOrders');
      if (totalOrdersEl) totalOrdersEl.textContent = stats.ordersCount || 0;

      const totalSpentEl = document.getElementById('accountTotalSpent');
      if (totalSpentEl) totalSpentEl.textContent = `₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`;

      // Order History Page
      if (window.location.pathname.includes('account-order')) {
        loadCustomerOrders(token);
      }

      // Address Book Page
      if (window.location.pathname.includes('account-address')) {
        loadCustomerAddresses(addresses);
      }

      // Profile Page
      if (window.location.pathname.includes('account-profile')) {
        initProfileForm(user, token);
      }

    } catch (e) {
      console.warn('Account load note:', e);
    }
  }

  // Load customer order list
  async function loadCustomerOrders(token) {
    const tableBody = document.querySelector('.account-orders-table tbody, .order-table tbody');
    if (!tableBody) return;

    try {
      const res = await fetch('/api/auth/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">No orders placed yet.</td></tr>`;
        return;
      }

      tableBody.innerHTML = json.data.map(o => {
        let badgeColor = '#3b82f6';
        if (o.order_status === 'DELIVERED') badgeColor = '#10b981';
        if (o.order_status === 'CANCELLED') badgeColor = '#ef4444';
        if (o.order_status === 'SHIPPED') badgeColor = '#d4af37';

        return `
          <tr>
            <td style="font-weight:700; color:#d4af37;">${o.order_number}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td><span style="background:${badgeColor}; color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:30px;">${o.order_status}</span></td>
            <td style="font-weight:700; color:#fff;">₹${o.total_amount.toLocaleString('en-IN')}</td>
            <td>${o.payment_method} (${o.payment_status})</td>
            <td><a href="order-received.html?order=${o.order_number}" class="theme-button style-1" style="padding:4px 12px; font-size:11px;">View Receipt</a></td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      console.warn('Order history error:', err);
    }
  }

  // Load customer addresses
  function loadCustomerAddresses(addresses) {
    const container = document.querySelector('.account-address-content, #addressContainer');
    if (!container) return;

    if (!addresses || addresses.length === 0) {
      container.innerHTML = `
        <div style="padding:30px; background:#111827; border:1px solid rgba(255,255,255,0.1); border-radius:4px; text-align:center;">
          <p style="color:#94a3b8; margin-bottom:16px;">You have no saved delivery residences.</p>
          <a href="account-add-address.html" class="theme-button style-1" style="font-size:11px; padding:8px 18px;">Add New Residence</a>
        </div>
      `;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div style="background:#111827; border:1px solid rgba(212,175,55,0.25); border-radius:4px; padding:20px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <h4 style="color:#ffffff; font-size:15px; margin:0;">${addr.name} ${addr.is_default ? '<span style="background:#d4af37; color:#0b1320; font-size:10px; font-weight:700; padding:2px 8px; border-radius:2px; margin-left:6px;">DEFAULT</span>' : ''}</h4>
          <span style="color:#94a3b8; font-size:12px; text-transform:uppercase;">${addr.type}</span>
        </div>
        <p style="color:#cbd5e1; font-size:13.5px; margin:0 0 4px 0;">${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</p>
        <p style="color:#cbd5e1; font-size:13.5px; margin:0 0 8px 0;">${addr.city}, ${addr.state} - ${addr.postal_code}, ${addr.country}</p>
        <p style="color:#94a3b8; font-size:12.5px; margin:0;"><i class="fa-solid fa-phone me-1"></i> ${addr.phone}</p>
      </div>
    `).join('');
  }

  // Profile form
  function initProfileForm(user, token) {
    const nameInput = document.querySelector('input[name="fullname"], #profileName');
    const phoneInput = document.querySelector('input[name="phone"], #profilePhone');
    const emailInput = document.querySelector('input[name="email"], #profileEmail');

    if (nameInput) nameInput.value = user.full_name || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (emailInput) {
      emailInput.value = user.email || '';
      emailInput.disabled = true;
    }

    const form = document.querySelector('form.account-profile-form, #profileForm');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const full_name = nameInput ? nameInput.value.trim() : null;
        const phone = phoneInput ? phoneInput.value.trim() : null;

        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ full_name, phone })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('erlux_user', JSON.stringify(data.user));
            if (window.erluxToast) window.erluxToast('Profile updated successfully');
          }
        } catch (err) {
          alert('Failed to update profile');
        }
      });
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initRegisterForm();
    initAccountDashboard();
  });

})();
