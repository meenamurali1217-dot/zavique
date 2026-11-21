/**
 * ERLUX Executive Admin Suite Controller (admin/index.html)
 * Powers analytics charts, products CRUD, order dispatch, inventory audits, coupons, and reports
 */

(function () {
  'use strict';

  let currentAdmin = null;
  let revenueChartInstance = null;
  let categoryChartInstance = null;

  function getAdminToken() {
    return localStorage.getItem('erlux_admin_token');
  }

  function adminLogout() {
    localStorage.removeItem('erlux_admin_token');
    window.location.reload();
  }

  window.adminLogout = adminLogout;

  // Check Session
  async function checkAdminSession() {
    const token = getAdminToken();
    if (!token) {
      document.getElementById('adminLoginScreen').classList.remove('d-none');
      document.getElementById('adminDashboardApp').classList.add('d-none');
      return;
    }

    try {
      const res = await fetch('/api/admin/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.admin) {
        currentAdmin = data.admin;
        document.getElementById('adminLoginScreen').classList.add('d-none');
        document.getElementById('adminDashboardApp').classList.remove('d-none');
        document.getElementById('adminFullName').textContent = currentAdmin.full_name || 'Executive Director';
        loadDashboardMetrics();
      } else {
        localStorage.removeItem('erlux_admin_token');
        document.getElementById('adminLoginScreen').classList.remove('d-none');
        document.getElementById('adminDashboardApp').classList.add('d-none');
      }
    } catch (e) {
      document.getElementById('adminLoginScreen').classList.remove('d-none');
      document.getElementById('adminDashboardApp').classList.add('d-none');
    }
  }

  // Handle Login Submit
  document.getElementById('adminLoginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const alertEl = document.getElementById('loginAlert');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('erlux_admin_token', data.token);
        checkAdminSession();
      } else {
        alertEl.textContent = data.message || 'Invalid credentials';
        alertEl.classList.remove('d-none');
      }
    } catch (err) {
      alertEl.textContent = 'Failed to connect to authentication server';
      alertEl.classList.remove('d-none');
    }
  });

  // Switch Active Tab
  window.switchTab = function (tabName) {
    document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.add('d-none'));
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));

    const activePanel = document.getElementById(`tab-${tabName}`);
    if (activePanel) activePanel.classList.remove('d-none');

    const menuLink = Array.from(document.querySelectorAll('.sidebar-menu a')).find(a =>
      a.getAttribute('onclick')?.includes(`'${tabName}'`)
    );
    if (menuLink) menuLink.classList.add('active');

    const titleEl = document.getElementById('tabTitle');
    const subEl = document.getElementById('tabSubtitle');

    const titles = {
      dashboard: { t: 'Executive Overview', s: 'Real-time enterprise intelligence & sales metrics' },
      products: { t: 'Creations Catalog', s: 'Comprehensive inventory across 9 ERLUX collections' },
      orders: { t: 'Orders & Dispatch', s: 'Client logistics, packing and shipment tracking' },
      inventory: { t: 'Inventory & Stock', s: 'Atelier stock audit trail and replenishment alerts' },
      categories: { t: 'Nine Collections', s: 'Category hierarchy, subcategories, and curations' },
      customers: { t: 'Patron Directory', s: 'VIP clientele, purchase histories, and lifetime spend' },
      coupons: { t: 'Privilege Promo Codes', s: 'Promotions, discount concessions, and redemption rates' },
      reviews: { t: 'Reviews Moderation', s: 'Client testimonials and rating governance' }
    };

    if (titles[tabName]) {
      titleEl.textContent = titles[tabName].t;
      subEl.textContent = titles[tabName].s;
    }

    if (tabName === 'dashboard') loadDashboardMetrics();
    if (tabName === 'products') loadAdminProducts();
    if (tabName === 'orders') loadAdminOrders();
    if (tabName === 'inventory') loadAdminInventory();
    if (tabName === 'categories') loadAdminCategories();
    if (tabName === 'customers') loadAdminCustomers();
    if (tabName === 'coupons') loadAdminCoupons();
    if (tabName === 'reviews') loadAdminReviews();
  };

  // 1. Dashboard Metrics & Charts
  async function loadDashboardMetrics() {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success || !json.data) return;

      const d = json.data;
      document.getElementById('kpiRevenue').textContent = `₹${d.grossRevenue.toLocaleString('en-IN')}`;
      document.getElementById('kpiOrders').textContent = d.totalOrders;
      document.getElementById('kpiCustomers').textContent = d.totalCustomers;
      document.getElementById('kpiLowStock').textContent = d.lowStockCount;

      renderCharts(d.monthlyRevenue, d.categoryStats);
      renderRecentOrders(d.recentOrders);

    } catch (e) {
      console.warn('Dashboard metrics error:', e);
    }
  }

  function renderCharts(monthly, categories) {
    // Revenue Line Chart
    const revCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revCtx) {
      if (revenueChartInstance) revenueChartInstance.destroy();

      const labels = monthly.map(m => m.month);
      const dataValues = monthly.map(m => m.revenue);

      revenueChartInstance = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['Nov 2026'],
          datasets: [{
            label: 'Revenue (INR)',
            data: dataValues.length > 0 ? dataValues : [120000],
            borderColor: '#d4af37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#f5df97',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#94a3b8',
                callback: v => '₹' + (v >= 1000 ? (v / 1000) + 'k' : v)
              }
            }
          }
        }
      });
    }

    // Categories Doughnut Chart
    const catCtx = document.getElementById('categoryChart')?.getContext('2d');
    if (catCtx) {
      if (categoryChartInstance) categoryChartInstance.destroy();

      const catLabels = categories.map(c => c.category_name);
      const catValues = categories.map(c => c.category_revenue);

      categoryChartInstance = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels.length > 0 ? catLabels : ['Fragrance', 'Watches', 'Gift Sets'],
          datasets: [{
            data: catValues.length > 0 ? catValues : [60, 25, 15],
            backgroundColor: ['#d4af37', '#f5df97', '#94a3b8', '#3b82f6', '#10b981', '#a855f7'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#cbd5e1', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  function renderRecentOrders(orders) {
    const table = document.getElementById('recentOrdersTable');
    if (!table) return;

    if (!orders || orders.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders recorded yet.</td></tr>`;
      return;
    }

    table.innerHTML = orders.map(o => `
      <tr>
        <td style="color:#d4af37; font-weight:700;">${o.order_number}</td>
        <td>
          <div style="color:#fff; font-weight:600;">${o.customer_name}</div>
          <div style="font-size:11px; color:#94a3b8;">${o.customer_email}</div>
        </td>
        <td style="color:#d4af37; font-weight:700;">₹${o.total_amount.toLocaleString('en-IN')}</td>
        <td><span style="font-size:11px; color:#cbd5e1;">${o.payment_method} (${o.payment_status})</span></td>
        <td><span class="status-badge ${o.order_status.toLowerCase()}">${o.order_status}</span></td>
        <td style="color:#94a3b8; font-size:12px;">${new Date(o.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-outline-gold" onclick="openOrderModal(${o.id})">Manage</button>
        </td>
      </tr>
    `).join('');
  }

  // 2. Products Management
  async function loadAdminProducts() {
    const table = document.getElementById('productsTableBody');
    if (!table) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success || !json.data) return;

      table.innerHTML = json.data.map(p => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="../${p.main_image}" alt="${p.name}" style="width:48px; height:48px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">
              <div>
                <strong style="color:#ffffff;">${p.name}</strong>
                <div style="font-size:11px; color:#94a3b8;">${p.gender} &bull; ${p.is_active ? '<span class="text-success">Active</span>' : '<span class="text-danger">Inactive</span>'}</div>
              </div>
            </div>
          </td>
          <td style="font-size:12px; color:#94a3b8;">${p.sku}</td>
          <td><span style="color:#d4af37; font-size:12px; font-weight:600;">${p.category_name}</span></td>
          <td style="font-weight:700; color:#fff;">₹${p.price.toLocaleString('en-IN')}</td>
          <td>
            <span style="font-weight:700; color:${p.stock_quantity <= p.low_stock_threshold ? '#ef4444' : '#10b981'};">
              ${p.stock_quantity}
            </span>
          </td>
          <td>${p.variants_count || 0}</td>
          <td><i class="fa-solid fa-star text-warning me-1"></i>${p.rating.toFixed(1)}</td>
          <td>
            <button class="btn btn-sm btn-outline-gold" onclick="alert('Product ID: ' + ${p.id} + ' edit modal ready')"><i class="fa-solid fa-pen-to-square"></i></button>
          </td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn('Admin products error:', e);
    }
  }

  // 3. Orders Management
  window.loadAdminOrders = async function () {
    const table = document.getElementById('ordersTableBody');
    if (!table) return;

    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'ALL';
    const token = getAdminToken();

    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        table.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No orders found.</td></tr>`;
        return;
      }

      table.innerHTML = json.data.map(o => `
        <tr>
          <td style="color:#d4af37; font-weight:700;">${o.order_number}</td>
          <td>
            <strong style="color:#fff;">${o.customer_name}</strong>
            <div style="font-size:11px; color:#94a3b8;">${o.customer_email} &bull; ${o.customer_phone}</div>
          </td>
          <td>${o.items_count} Item(s)</td>
          <td style="color:#d4af37; font-weight:700;">₹${o.total_amount.toLocaleString('en-IN')}</td>
          <td>${o.payment_method} (${o.payment_status})</td>
          <td><span class="status-badge ${o.order_status.toLowerCase()}">${o.order_status}</span></td>
          <td style="font-size:11.5px; color:#94a3b8;">${o.courier_name || 'Pending'} ${o.tracking_number ? `<br><code style="color:#d4af37;">${o.tracking_number}</code>` : ''}</td>
          <td>
            <button class="btn btn-sm btn-outline-gold" onclick="openOrderModal(${o.id})">Manage</button>
          </td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn('Admin orders error:', e);
    }
  };

  // Open Order Modal
  window.openOrderModal = async function (orderId) {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success || !json.data) return;

      const order = json.data;
      document.getElementById('modalOrderId').value = order.id;
      document.getElementById('modalOrderStatus').value = order.order_status;
      document.getElementById('modalCourierName').value = order.courier_name || '';
      document.getElementById('modalTrackingNumber').value = order.tracking_number || '';
      document.getElementById('modalStatusNotes').value = '';

      const modalEl = document.getElementById('orderModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

    } catch (e) {
      console.warn(e);
    }
  };

  // Submit Order Status Update
  document.getElementById('orderStatusForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const orderId = document.getElementById('modalOrderId').value;
    const status = document.getElementById('modalOrderStatus').value;
    const courier_name = document.getElementById('modalCourierName').value;
    const tracking_number = document.getElementById('modalTrackingNumber').value;
    const notes = document.getElementById('modalStatusNotes').value;

    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, courier_name, tracking_number, notes })
      });
      const data = await res.json();

      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
        loadAdminOrders();
        loadDashboardMetrics();
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (e) {
      alert('Error updating status');
    }
  });

  // 4. Inventory Management
  async function loadAdminInventory() {
    const table = document.getElementById('inventoryTableBody');
    const logsTable = document.getElementById('inventoryLogsBody');
    if (!table) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success || !json.data) return;

      table.innerHTML = json.data.items.map(i => {
        let statusBadge = '<span class="status-badge delivered">In Stock</span>';
        if (i.stock_status === 'LOW_STOCK') statusBadge = '<span class="status-badge processing">Low Stock</span>';
        if (i.stock_status === 'OUT_OF_STOCK') statusBadge = '<span class="status-badge cancelled">Out of Stock</span>';

        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="../${i.main_image}" alt="${i.name}" style="width:40px; height:40px; object-fit:cover; border-radius:3px;">
                <strong style="color:#ffffff;">${i.name}</strong>
              </div>
            </td>
            <td style="font-size:12px; color:#94a3b8;">${i.sku}</td>
            <td>${i.category_name}</td>
            <td style="font-weight:700; color:#ffffff; font-size:15px;">${i.stock_quantity}</td>
            <td style="color:#94a3b8;">${i.low_stock_threshold}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-sm btn-outline-gold" onclick="quickRestock(${i.id}, '${i.name}')">+ Restock</button>
            </td>
          </tr>
        `;
      }).join('');

      if (logsTable && json.data.logs) {
        logsTable.innerHTML = json.data.logs.map(l => `
          <tr>
            <td style="font-size:12px; color:#94a3b8;">${new Date(l.created_at).toLocaleString()}</td>
            <td style="color:#fff;">${l.product_name}</td>
            <td><span class="status-badge ${l.change_type === 'SALE' ? 'cancelled' : 'delivered'}">${l.change_type}</span></td>
            <td style="font-weight:700; color:${l.quantity_change > 0 ? '#10b981' : '#ef4444'};">${l.quantity_change > 0 ? '+' : ''}${l.quantity_change}</td>
            <td style="color:#fff; font-weight:700;">${l.new_stock}</td>
            <td style="color:#94a3b8; font-size:12px;">${l.created_by} &bull; ${l.notes || ''}</td>
          </tr>
        `).join('');
      }

    } catch (e) {
      console.warn('Inventory error:', e);
    }
  }

  window.quickRestock = async function (productId, productName) {
    const qty = prompt(`Enter quantity to restock for: ${productName}`, '20');
    if (!qty || isNaN(qty) || parseInt(qty, 10) <= 0) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          changeType: 'RESTOCK',
          quantityChange: parseInt(qty, 10),
          notes: 'Executive manual restock'
        })
      });
      const data = await res.json();
      if (data.success) {
        loadAdminInventory();
        loadDashboardMetrics();
      }
    } catch (e) {
      alert('Failed to adjust stock');
    }
  };

  // 5. Categories
  async function loadAdminCategories() {
    const table = document.getElementById('categoriesTableBody');
    if (!table) return;

    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (!json.success || !json.data) return;

      table.innerHTML = json.data.map(c => `
        <tr>
          <td style="color:#d4af37; font-weight:700;">${c.display_order}</td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="../${c.image_url}" alt="${c.name}" style="width:50px; height:35px; object-fit:cover; border-radius:3px;">
              <div>
                <strong style="color:#ffffff;">${c.name}</strong>
                <div style="font-size:11.5px; color:#94a3b8;">${c.tagline || ''}</div>
              </div>
            </div>
          </td>
          <td><code>${c.slug}</code></td>
          <td>${(c.subcategories || []).length} Subcategories</td>
          <td style="color:#d4af37; font-weight:700;">${c.product_count} Creations</td>
          <td><span class="status-badge delivered">ACTIVE</span></td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn(e);
    }
  }

  // 6. Customers
  async function loadAdminCustomers() {
    const table = document.getElementById('customersTableBody');
    if (!table) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success || !json.data) return;

      table.innerHTML = json.data.map(c => `
        <tr>
          <td><strong style="color:#ffffff;">${c.full_name}</strong></td>
          <td>${c.email}</td>
          <td>${c.phone || 'N/A'}</td>
          <td style="font-weight:700; color:#ffffff;">${c.orders_count}</td>
          <td style="color:#d4af37; font-weight:700;">₹${c.total_spend.toLocaleString('en-IN')}</td>
          <td><span class="status-badge delivered">${c.status}</span></td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn(e);
    }
  }

  // 7. Coupons
  async function loadAdminCoupons() {
    const table = document.getElementById('couponsTableBody');
    if (!table) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success || !json.data) return;

      table.innerHTML = json.data.map(cp => `
        <tr>
          <td style="color:#d4af37; font-weight:800; letter-spacing:0.1em;">${cp.code}</td>
          <td>${cp.description}</td>
          <td>${cp.discount_type}</td>
          <td style="color:#ffffff; font-weight:700;">${cp.discount_type === 'PERCENTAGE' ? cp.discount_value + '%' : '₹' + cp.discount_value}</td>
          <td>₹${cp.min_order_amount.toLocaleString('en-IN')}</td>
          <td>${cp.times_used} / ${cp.usage_limit || '∞'}</td>
          <td><span class="status-badge delivered">${cp.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn(e);
    }
  }

  // 8. Reviews
  async function loadAdminReviews() {
    const table = document.getElementById('reviewsTableBody');
    if (!table) return;

    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success || !json.data) return;

      table.innerHTML = json.data.map(r => `
        <tr>
          <td><strong style="color:#fff;">${r.product_name}</strong></td>
          <td>${r.reviewer_name}<br><span style="font-size:11px; color:#94a3b8;">${r.reviewer_email}</span></td>
          <td style="color:#d4af37;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
          <td>
            <strong>${r.title || ''}</strong>
            <p style="margin:2px 0 0; font-size:12px; color:#94a3b8;">${r.comment}</p>
          </td>
          <td><span class="status-badge ${r.status === 'APPROVED' ? 'delivered' : 'cancelled'}">${r.status}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-success me-1" onclick="updateReviewStatus(${r.id}, 'APPROVED')">Approve</button>
            <button class="btn btn-sm btn-outline-danger" onclick="updateReviewStatus(${r.id}, 'REJECTED')">Reject</button>
          </td>
        </tr>
      `).join('');

    } catch (e) {
      console.warn(e);
    }
  }

  window.updateReviewStatus = async function (id, status) {
    const token = getAdminToken();
    try {
      await fetch(`/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      loadAdminReviews();
    } catch (e) {}
  };

  // Export Sales Report CSV
  window.exportSalesReport = function () {
    const token = getAdminToken();
    window.location.href = `/api/admin/reports/sales-csv?token=${token}`;
  };

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
  });

})();
