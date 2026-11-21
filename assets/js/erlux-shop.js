/**
 * ERLUX Dynamic Catalog Engine (shop.html)
 * Powers dynamic filtering, search, sorting, pagination, and real-time product rendering
 */

(function () {
  'use strict';

  let currentFilters = {
    category: '',
    subcategory: '',
    gender: '',
    minPrice: null,
    maxPrice: null,
    search: '',
    sort: 'newest',
    page: 1,
    limit: 12
  };

  // Parse Initial URL Query Params
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) currentFilters.category = params.get('category');
    if (params.get('subcategory')) currentFilters.subcategory = params.get('subcategory');
    if (params.get('gender')) currentFilters.gender = params.get('gender');
    if (params.get('minPrice')) currentFilters.minPrice = parseFloat(params.get('minPrice'));
    if (params.get('maxPrice')) currentFilters.maxPrice = parseFloat(params.get('maxPrice'));
    if (params.get('search')) currentFilters.search = params.get('search');
    if (params.get('sort')) currentFilters.sort = params.get('sort');
    if (params.get('page')) currentFilters.page = parseInt(params.get('page'), 10) || 1;
  }

  // Fetch and Render Sidebar Filters (Categories & Subcategories)
  async function loadSidebarFilters() {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (!json.success || !json.data) return;

      const sidebarContainer = document.querySelector('.widget-sidebar, .filters-sidebar');
      if (!sidebarContainer) return;

      // Replace or update categories widget
      let catWidget = document.getElementById('erluxSidebarCategories');
      if (!catWidget) {
        catWidget = document.createElement('div');
        catWidget.id = 'erluxSidebarCategories';
        catWidget.className = 'widget widget-checkboxs';
        sidebarContainer.prepend(catWidget);
      }

      catWidget.innerHTML = `
        <div class="widget-title line-anime"><div class="widget-title-text">Nine Collections</div></div>
        <div class="widget-content">
          <ul style="list-style:none; padding:0; margin:0;">
            <li style="margin-bottom:6px;">
              <div class="form-group mb-0">
                <div class="field-inner checkbox">
                  <label for="cat-all" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                    <input id="cat-all" class="form-check-input" type="radio" name="category_filter" value="" ${!currentFilters.category ? 'checked' : ''}>
                    <span>All Collections</span>
                  </label>
                </div>
              </div>
            </li>
            ${json.data.map(cat => `
              <li style="margin-bottom:6px;">
                <div class="form-group mb-0">
                  <div class="field-inner checkbox">
                    <label for="cat-${cat.slug}" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; width:100%;">
                      <span style="display:flex; align-items:center; gap:8px;">
                        <input id="cat-${cat.slug}" class="form-check-input" type="radio" name="category_filter" value="${cat.slug}" ${currentFilters.category === cat.slug ? 'checked' : ''}>
                        <span>${cat.name}</span>
                      </span>
                      <span style="font-size:11px; color:#94a3b8;">(${cat.product_count})</span>
                    </label>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      // Listen to category radio changes
      catWidget.querySelectorAll('input[name="category_filter"]').forEach(radio => {
        radio.addEventListener('change', function () {
          currentFilters.category = this.value;
          currentFilters.subcategory = '';
          currentFilters.page = 1;
          fetchAndRenderProducts();
        });
      });

      // Price Filter Widget
      let priceWidget = document.getElementById('erluxSidebarPrice');
      if (!priceWidget) {
        priceWidget = document.createElement('div');
        priceWidget.id = 'erluxSidebarPrice';
        priceWidget.className = 'widget widget-checkboxs';
        catWidget.insertAdjacentElement('afterend', priceWidget);
      }

      priceWidget.innerHTML = `
        <div class="widget-title line-anime"><div class="widget-title-text">Price Range</div></div>
        <div class="widget-content" style="padding-top:10px;">
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
            <input type="number" id="erluxMinPriceInput" class="form-control" placeholder="Min ₹" style="background:#0d131f; color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:12px; padding:6px;" value="${currentFilters.minPrice || ''}">
            <span style="color:#94a3b8;">-</span>
            <input type="number" id="erluxMaxPriceInput" class="form-control" placeholder="Max ₹" style="background:#0d131f; color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:12px; padding:6px;" value="${currentFilters.maxPrice || ''}">
          </div>
          <button id="erluxApplyPriceBtn" class="theme-button style-1" style="width:100%; padding:8px; font-size:11px; text-transform:uppercase;">Apply Filter</button>
        </div>
      `;

      document.getElementById('erluxApplyPriceBtn')?.addEventListener('click', () => {
        const minVal = document.getElementById('erluxMinPriceInput').value;
        const maxVal = document.getElementById('erluxMaxPriceInput').value;
        currentFilters.minPrice = minVal ? parseFloat(minVal) : null;
        currentFilters.maxPrice = maxVal ? parseFloat(maxVal) : null;
        currentFilters.page = 1;
        fetchAndRenderProducts();
      });

      // Clear all filters handler
      const clearBtn = document.querySelector('.filters-clear-all a');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.preventDefault();
          currentFilters = {
            category: '',
            subcategory: '',
            gender: '',
            minPrice: null,
            maxPrice: null,
            search: '',
            sort: 'newest',
            page: 1,
            limit: 12
          };
          const allRadio = document.getElementById('cat-all');
          if (allRadio) allRadio.checked = true;
          const minInput = document.getElementById('erluxMinPriceInput');
          if (minInput) minInput.value = '';
          const maxInput = document.getElementById('erluxMaxPriceInput');
          if (maxInput) maxInput.value = '';
          fetchAndRenderProducts();
        });
      }

    } catch (err) {
      console.warn('Sidebar load note:', err);
    }
  }

  // Fetch and Render Products Grid
  async function fetchAndRenderProducts() {
    const gridContainer = document.querySelector('.shop-wappers');
    const resultCountEl = document.querySelector('.filter-left p');

    if (!gridContainer) return;

    // Show luxury skeleton loader
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 60px 0;">
        <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem; color: #d4af37 !important;">
          <span class="visually-hidden">Loading ERLUX Creations...</span>
        </div>
        <p style="margin-top:16px; color:#d4af37; letter-spacing:0.1em; text-transform:uppercase; font-size:12px;">Curating Luxury Catalog...</p>
      </div>
    `;

    try {
      const q = new URLSearchParams();
      if (currentFilters.category) q.append('category', currentFilters.category);
      if (currentFilters.subcategory) q.append('subcategory', currentFilters.subcategory);
      if (currentFilters.gender) q.append('gender', currentFilters.gender);
      if (currentFilters.minPrice) q.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) q.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.search) q.append('search', currentFilters.search);
      if (currentFilters.sort) q.append('sort', currentFilters.sort);
      q.append('page', currentFilters.page);
      q.append('limit', currentFilters.limit);

      const res = await fetch(`/api/products?${q.toString()}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        gridContainer.innerHTML = `<p style="color:#ef4444;">Failed to load catalog.</p>`;
        return;
      }

      const { products, pagination } = json.data;

      // Update URL without full reload
      const newUrl = `${window.location.pathname}?${q.toString()}`;
      window.history.replaceState({}, '', newUrl);

      // Result count display
      if (resultCountEl) {
        const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.total, pagination.page * pagination.limit);
        resultCountEl.innerHTML = `Showing <span class="primary-color fw-bold" style="color:#d4af37;">${start}-${end}</span> of <span class="primary-color fw-bold" style="color:#d4af37;">${pagination.total}</span> luxury creations`;
      }

      if (products.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px; background:#101827; border: 1px solid rgba(212,175,55,0.2); border-radius:4px;">
            <i class="fa-solid fa-magnifying-glass" style="font-size:36px; color:#d4af37; margin-bottom:12px;"></i>
            <h3 style="color:#ffffff; font-size:18px;">No Creations Found</h3>
            <p style="color:#94a3b8; max-width:400px; margin:8px auto 20px;">We could not find any items matching your selected criteria. Try resetting the filters.</p>
            <button class="theme-button style-1" onclick="document.querySelector('.filters-clear-all a')?.click()">Reset Filters</button>
          </div>
        `;
        renderPagination(0, 1);
        return;
      }

      // Render Product Cards
      gridContainer.innerHTML = products.map(p => {
        let discountBadge = '';
        if (p.compare_price && p.compare_price > p.price) {
          const discountPct = Math.round(((p.compare_price - p.price) / p.compare_price) * 100);
          discountBadge = `<span class="discount" style="background:#d4af37; color:#0b1320; font-weight:700;">-${discountPct}%</span>`;
        } else if (p.is_new_arrival) {
          discountBadge = `<span class="discount" style="background:#172236; color:#d4af37; border:1px solid #d4af37;">NEW</span>`;
        }

        return `
          <div class="shop-grid-item" style="border:1px solid rgba(255,255,255,0.08); background:#111827; transition:transform 0.3s ease, border-color 0.3s ease;">
            <div class="shop-grid-image" style="position:relative; overflow:hidden;">
              <a href="shop-details.html?slug=${p.slug}">
                <figure style="margin:0;">
                  <img src="${p.main_image}" alt="${p.name}" style="width:100%; height:320px; object-fit:cover; transition:transform 0.5s ease;">
                </figure>
              </a>
              ${discountBadge}
              <button class="erlux-card-heart-btn" onclick="window.toggleWishlist(${p.id})" title="Add to Wishlist" style="position:absolute; top:12px; right:12px; background:rgba(10,15,25,0.6); border:1px solid rgba(255,255,255,0.2); color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;">
                <i class="fa-regular fa-heart"></i>
              </button>
              <div class="shop-grid-action">
                <div class="hero-button-wapper">
                  <button type="button" class="theme-button style-1 w-100" onclick="window.addToCart(${p.id})">
                    <span data-text="Add To Bag">Add To Bag</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="shop-grid-content" style="padding:16px;">
              <div style="font-size:11px; color:#d4af37; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">
                ${p.collection_range || p.category_name}
              </div>
              <h2 style="font-size:15px; font-weight:600; margin:0 0 8px 0; line-height:1.3;">
                <a href="shop-details.html?slug=${p.slug}" style="color:#ffffff; text-decoration:none;">${p.name}</a>
              </h2>
              <ul class="shop-price-list" style="display:flex; justify-content:space-between; align-items:center; list-style:none; padding:0; margin:0;">
                <li class="price" style="font-weight:700; font-size:15px; color:#d4af37;">
                  ₹${p.price.toLocaleString('en-IN')}
                  ${p.compare_price ? `<span style="text-decoration:line-through; font-size:12px; color:#64748b; margin-left:6px;">₹${p.compare_price.toLocaleString('en-IN')}</span>` : ''}
                </li>
                <li style="font-size:12px; color:#e2e8f0;">
                  <i class="fas fa-star" style="color:#d4af37;"></i> ${p.rating.toFixed(1)} (${p.reviews_count})
                </li>
              </ul>
            </div>
          </div>
        `;
      }).join('');

      renderPagination(pagination.totalPages, pagination.page);

    } catch (err) {
      console.error('Error fetching products:', err);
      gridContainer.innerHTML = `<p style="color:#ef4444;">Error connecting to ERLUX catalog service.</p>`;
    }
  }

  // Render Dynamic Pagination
  function renderPagination(totalPages, currentPage) {
    let paginationContainer = document.querySelector('.pagination-wapper, .shop-pagination');
    if (!paginationContainer) {
      const shopRow = document.querySelector('.shop-wappers')?.parentElement;
      if (shopRow) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-wapper pt-40';
        shopRow.appendChild(paginationContainer);
      } else {
        return;
      }
    }

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '<ul class="pagination justify-content-center" style="display:flex; gap:6px; list-style:none; padding:0;">';

    if (currentPage > 1) {
      html += `<li><a href="#" class="page-link" onclick="window.erluxChangePage(${currentPage - 1}); return false;" style="background:#172236; color:#fff; border:1px solid rgba(212,175,55,0.3); padding:8px 14px; border-radius:3px;">&laquo; Prev</a></li>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage;
      html += `
        <li>
          <a href="#" class="page-link ${active ? 'active' : ''}" onclick="window.erluxChangePage(${i}); return false;" style="background:${active ? '#d4af37' : '#172236'}; color:${active ? '#0b1320' : '#fff'}; font-weight:700; border:1px solid ${active ? '#d4af37' : 'rgba(212,175,55,0.3)'}; padding:8px 14px; border-radius:3px;">
            ${i}
          </a>
        </li>
      `;
    }

    if (currentPage < totalPages) {
      html += `<li><a href="#" class="page-link" onclick="window.erluxChangePage(${currentPage + 1}); return false;" style="background:#172236; color:#fff; border:1px solid rgba(212,175,55,0.3); padding:8px 14px; border-radius:3px;">Next &raquo;</a></li>`;
    }

    html += '</ul>';
    paginationContainer.innerHTML = html;
  }

  // Global Page Changer
  window.erluxChangePage = function (page) {
    currentFilters.page = page;
    fetchAndRenderProducts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Bind Sort Dropdown
  function initSortDropdown() {
    const sortSelect = document.getElementById('shortby');
    if (sortSelect) {
      // Re-populate options
      sortSelect.innerHTML = `
        <option value="newest" ${currentFilters.sort === 'newest' ? 'selected' : ''}>New Arrivals</option>
        <option value="bestseller" ${currentFilters.sort === 'bestseller' ? 'selected' : ''}>Best Sellers</option>
        <option value="rating" ${currentFilters.sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
        <option value="price-low" ${currentFilters.sort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
        <option value="price-high" ${currentFilters.sort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
      `;

      sortSelect.addEventListener('change', function () {
        currentFilters.sort = this.value;
        currentFilters.page = 1;
        fetchAndRenderProducts();
      });
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    parseUrlParams();
    loadSidebarFilters();
    initSortDropdown();
    fetchAndRenderProducts();
  });

})();
