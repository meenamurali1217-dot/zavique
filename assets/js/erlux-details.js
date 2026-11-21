/**
 * ERLUX Product Details Controller (shop-details.html)
 * Powers dynamic product loading, gallery switcher, variant selection, stock updates, reviews, and related items
 */

(function () {
  'use strict';

  let currentProduct = null;
  let selectedVariant = null;
  let currentQuantity = 1;

  // Extract slug or id from URL
  function getProductParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || params.get('id') || 'chairman-special-extrait-de-parfum';
  }

  // Load Product Data
  async function loadProductDetails() {
    const param = getProductParam();
    try {
      const res = await fetch(`/api/products/${param}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        console.warn('Product not found, using default view');
        return;
      }

      currentProduct = json.data;
      selectedVariant = currentProduct.variants && currentProduct.variants.length > 0 ? currentProduct.variants[0] : null;

      renderBreadcrumbs();
      renderGallery();
      renderProductInfo();
      renderVariants();
      renderDeliveryEstimate();
      renderTabs();
      renderReviews();
      renderRelated();
      bindActionButtons();

    } catch (err) {
      console.error('Error loading product details:', err);
    }
  }

  // Delivery Estimate Widget linked with Live Location
  function renderDeliveryEstimate() {
    const infoContainer = document.querySelector('.shop-product-single-info');
    if (!infoContainer) return;

    let deliveryBox = document.getElementById('erluxProductDeliveryBox');
    if (!deliveryBox) {
      deliveryBox = document.createElement('div');
      deliveryBox.id = 'erluxProductDeliveryBox';
      deliveryBox.className = 'erlux-delivery-box mt-3 mb-3';

      const qtyContainer = infoContainer.querySelector('.shop-product-single-quantity');
      if (qtyContainer) {
        infoContainer.insertBefore(deliveryBox, qtyContainer);
      } else {
        infoContainer.appendChild(deliveryBox);
      }
    }

    const loc = window.erluxLocation ? window.erluxLocation.get() : null;
    const destName = loc && (loc.locality || loc.city || loc.display)
      ? (loc.display || [loc.locality, loc.city].filter(Boolean).join(', ') + (loc.postal_code ? ` (${loc.postal_code})` : ''))
      : 'Select Location';

    const now = new Date();
    const daysToAdd = loc ? 2 : 3;
    const estDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const dateFormatted = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    deliveryBox.innerHTML = `
      <div style="background: rgba(13, 19, 31, 0.85); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 14px 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-truck-fast" style="color: #d4af37; font-size: 15px;"></i>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 600;">Delivery To:</span>
            <span style="font-size: 13px; font-weight: 700; color: #ffffff;" id="erluxProductDestText">${destName}</span>
          </div>
          <button type="button" class="erlux-btn-change-loc" onclick="if(window.erluxLocation) window.erluxLocation.openModal()" style="background: none; border: 1px solid rgba(212,175,55,0.4); color: #d4af37; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ${loc ? 'Change' : 'Check PIN'}
          </button>
        </div>
        <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
          <div style="color: #10b981; font-weight: 600;">
            <i class="fa-solid fa-circle-check" style="margin-right: 5px;"></i> Available for Immediate White-Glove Dispatch
          </div>
          <div>
            <i class="fa-regular fa-calendar-check" style="color: #d4af37; margin-right: 5px;"></i> Estimated Delivery: <strong style="color: #ffffff;">${dateFormatted}</strong>
          </div>
          <div style="color: #94a3b8; font-size: 11px;">
            <i class="fa-solid fa-shield-halved" style="color: #d4af37; margin-right: 5px;"></i> Complimentary White-Glove Courier Delivery on orders above ₹5,000
          </div>
        </div>
      </div>
    `;
  }

  window.addEventListener('erlux:locationChanged', () => {
    renderDeliveryEstimate();
  });

  // Breadcrumbs
  function renderBreadcrumbs() {
    const bcContainer = document.querySelector('.breadcrumb-list ol, .breadcrumb');
    if (!bcContainer || !currentProduct) return;

    bcContainer.innerHTML = `
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item"><a href="shop.html">Collections</a></li>
      <li class="breadcrumb-item"><a href="shop.html?category=${currentProduct.category_slug}">${currentProduct.category_name}</a></li>
      <li class="breadcrumb-item active" aria-current="page">${currentProduct.name}</li>
    `;
  }

  // Gallery & Thumbnails
  function renderGallery() {
    const sliderContainer = document.querySelector('.shop-product-single-slider');
    if (!sliderContainer || !currentProduct) return;

    const images = currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : [{ id: 0, image_url: currentProduct.main_image, alt_text: currentProduct.name }];

    sliderContainer.innerHTML = `
      <div class="large-images" style="border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; overflow: hidden; background: #0d131f;">
        <figure style="margin:0; position:relative;">
          <img id="erluxMainImage" src="${images[0].image_url}" alt="${currentProduct.name}" style="width: 100%; height: 520px; object-fit: cover; transition: opacity 0.3s ease;">
          ${currentProduct.compare_price ? `<span class="discount" style="position:absolute; top:16px; left:16px; background:#d4af37; color:#0b1320; font-weight:700; padding:4px 12px; border-radius:2px; font-size:12px;">-${Math.round(((currentProduct.compare_price - currentProduct.price)/currentProduct.compare_price)*100)}%</span>` : ''}
        </figure>
      </div>
      <div class="thumbs-images mt-3" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:6px;">
        ${images.map((img, idx) => `
          <button type="button" class="erlux-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window.erluxSwitchImage('${img.image_url}', this)" style="border: 2px solid ${idx === 0 ? '#d4af37' : 'rgba(255,255,255,0.15)'}; border-radius: 6px; padding: 2px; width: 85px; height: 85px; background: #0d131f; cursor: pointer; flex-shrink: 0; transition: border-color 0.2s;">
            <img src="${img.image_url}" alt="thumb" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
          </button>
        `).join('')}
      </div>
    `;
  }

  window.erluxSwitchImage = function (url, btn) {
    const mainImg = document.getElementById('erluxMainImage');
    if (mainImg) {
      mainImg.style.opacity = '0.4';
      setTimeout(() => {
        mainImg.src = url;
        mainImg.style.opacity = '1';
      }, 150);
    }
    document.querySelectorAll('.erlux-thumb-btn').forEach(b => {
      b.style.borderColor = 'rgba(255,255,255,0.15)';
      b.classList.remove('active');
    });
    btn.style.borderColor = '#d4af37';
    btn.classList.add('active');
  };

  // Product Main Information
  function renderProductInfo() {
    const infoContainer = document.querySelector('.shop-product-single-info');
    if (!infoContainer || !currentProduct) return;

    // Badge
    const badge = infoContainer.querySelector('.badge');
    if (badge) badge.textContent = currentProduct.collection_range || currentProduct.category_name;

    // Title
    const title = infoContainer.querySelector('h2');
    if (title) title.textContent = currentProduct.name;

    // Rating
    const reviewsEl = infoContainer.querySelector('.shop-product-single-reveiw');
    if (reviewsEl) {
      reviewsEl.innerHTML = `
        <i class="fa-solid fa-star active" style="color:#d4af37;"></i>
        <i class="fa-solid fa-star active" style="color:#d4af37;"></i>
        <i class="fa-solid fa-star active" style="color:#d4af37;"></i>
        <i class="fa-solid fa-star active" style="color:#d4af37;"></i>
        <i class="fa-solid fa-star active me-3" style="color:#d4af37;"></i>
        <span style="color:#cbd5e1;">${currentProduct.rating.toFixed(1)} (${currentProduct.reviews_count} Verified Patron Reviews)</span>
      `;
    }

    // Price
    updatePriceDisplay();

    // Short Description & Attributes
    const shortDesc = infoContainer.querySelector('.shop-product-single-content-text1');
    if (shortDesc) shortDesc.textContent = currentProduct.short_description;

    const attrList = infoContainer.querySelector('.shop-product-single-content-text2');
    if (attrList) {
      attrList.innerHTML = `
        <li><p><strong>SKU:</strong> <span id="erluxActiveSku">${selectedVariant ? selectedVariant.sku : currentProduct.sku}</span></p></li>
        <li><p><strong>Collection:</strong> ${currentProduct.collection_range || currentProduct.category_name}</p></li>
        <li><p><strong>Brand:</strong> ERLUX</p></li>
        <li><p><strong>Availability:</strong> <span id="erluxStockStatus" style="color:#10b981; font-weight:700;"><i class="fa-solid fa-circle-check"></i> In Stock (${currentProduct.stock_quantity} available)</span></p></li>
      `;
    }
  }

  // Update Price Display
  function updatePriceDisplay() {
    const mainPriceEl = document.querySelector('.shop-product-single-price .main-price');
    const cutPriceEl = document.querySelector('.shop-product-single-price .cut-price');

    const activePrice = selectedVariant ? selectedVariant.price : currentProduct.price;
    const activeCompare = selectedVariant ? (selectedVariant.compare_price || currentProduct.compare_price) : currentProduct.compare_price;

    if (mainPriceEl) mainPriceEl.textContent = `₹${activePrice.toLocaleString('en-IN')}`;
    if (cutPriceEl) {
      if (activeCompare && activeCompare > activePrice) {
        cutPriceEl.textContent = `₹${activeCompare.toLocaleString('en-IN')}`;
        cutPriceEl.style.display = 'inline';
      } else {
        cutPriceEl.style.display = 'none';
      }
    }
  }

  // Variants Selector
  function renderVariants() {
    const sizeContainer = document.querySelector('.shop-product-single-size');
    if (!sizeContainer || !currentProduct) return;

    if (!currentProduct.variants || currentProduct.variants.length === 0) {
      sizeContainer.style.display = 'none';
      return;
    }

    sizeContainer.style.display = 'block';
    const variantType = currentProduct.variants[0].variant_type || 'Edition / Volume';

    sizeContainer.innerHTML = `
      <div class="shop-product-size-title" style="font-size:13px; font-weight:700; color:#d4af37; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">
        Select ${variantType}:
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${currentProduct.variants.map((v, idx) => `
          <button type="button" class="erlux-variant-chip ${idx === 0 ? 'active' : ''}" onclick="window.erluxSelectVariant(${v.id}, this)" style="background:${idx === 0 ? '#d4af37' : '#172236'}; color:${idx === 0 ? '#0b1320' : '#ffffff'}; border:1px solid ${idx === 0 ? '#d4af37' : 'rgba(255,255,255,0.2)'}; padding:8px 16px; border-radius:3px; font-size:12.5px; font-weight:700; cursor:pointer; transition:all 0.2s;">
            ${v.variant_value || v.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  window.erluxSelectVariant = function (variantId, btn) {
    if (!currentProduct || !currentProduct.variants) return;
    const variant = currentProduct.variants.find(v => v.id === variantId);
    if (!variant) return;

    selectedVariant = variant;
    updatePriceDisplay();

    const skuEl = document.getElementById('erluxActiveSku');
    if (skuEl) skuEl.textContent = variant.sku;

    const stockEl = document.getElementById('erluxStockStatus');
    if (stockEl) {
      stockEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> In Stock (${variant.stock_quantity} available)`;
    }

    document.querySelectorAll('.erlux-variant-chip').forEach(b => {
      b.style.background = '#172236';
      b.style.color = '#ffffff';
      b.style.borderColor = 'rgba(255,255,255,0.2)';
    });
    btn.style.background = '#d4af37';
    btn.style.color = '#0b1320';
    btn.style.borderColor = '#d4af37';
  };

  // Tabs: Description, Specifications, Reviews
  function renderTabs() {
    if (!currentProduct) return;

    // Tab 1: Description & Fragrance Notes
    const descTab = document.getElementById('tab-description');
    if (descTab) {
      let notesHtml = '';
      if (currentProduct.fragrance_notes_top || currentProduct.fragrance_notes_middle || currentProduct.fragrance_notes_base) {
        notesHtml = `
          <h4 class="mt-4 mb-3" style="color:#d4af37; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-size:14px;">The Olfactory Pyramid</h4>
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div style="background:#111827; border:1px solid rgba(212,175,55,0.25); border-radius:4px; padding:18px;">
                <h5 style="color:#ffffff; font-size:14px; font-weight:700; margin-bottom:6px;"><i class="fa-solid fa-wind" style="color:#d4af37; margin-right:8px;"></i>Top Notes</h5>
                <p style="color:#94a3b8; font-size:13px; margin:0;">${currentProduct.fragrance_notes_top || 'Citrus Essences & Rare Spices'}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div style="background:#111827; border:1px solid rgba(212,175,55,0.25); border-radius:4px; padding:18px;">
                <h5 style="color:#ffffff; font-size:14px; font-weight:700; margin-bottom:6px;"><i class="fa-solid fa-heart" style="color:#d4af37; margin-right:8px;"></i>Heart Notes</h5>
                <p style="color:#94a3b8; font-size:13px; margin:0;">${currentProduct.fragrance_notes_middle || 'French Florals & Golden Amber'}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div style="background:#111827; border:1px solid rgba(212,175,55,0.25); border-radius:4px; padding:18px;">
                <h5 style="color:#ffffff; font-size:14px; font-weight:700; margin-bottom:6px;"><i class="fa-solid fa-tree" style="color:#d4af37; margin-right:8px;"></i>Base Notes</h5>
                <p style="color:#94a3b8; font-size:13px; margin:0;">${currentProduct.fragrance_notes_base || 'Precious Oud & Mysore Sandalwood'}</p>
              </div>
            </div>
          </div>
        `;
      }

      descTab.innerHTML = `
        <h3 class="mb-10" style="color:#ffffff;">${currentProduct.name}</h3>
        <p class="desc" style="color:#cbd5e1; font-size:15px; line-height:1.7;">
          ${currentProduct.full_description || currentProduct.short_description}
        </p>
        ${notesHtml}
      `;
    }

    // Tab 2: Additional Specifications
    const infoTab = document.getElementById('tab-information');
    if (infoTab && currentProduct.specifications) {
      const specs = currentProduct.specifications;
      infoTab.innerHTML = `
        <h3 class="mb-10" style="color:#ffffff;">Product Specifications</h3>
        <table class="table" style="color:#cbd5e1; border-color:rgba(255,255,255,0.1); margin-top:16px;">
          <tbody>
            <tr><th style="width:240px; color:#d4af37;">Brand</th><td>ERLUX Luxury Lifestyle</td></tr>
            <tr><th style="color:#d4af37;">Collection</th><td>${currentProduct.collection_range || currentProduct.category_name}</td></tr>
            <tr><th style="color:#d4af37;">Gender Target</th><td>${currentProduct.gender}</td></tr>
            ${Object.entries(specs).map(([k, v]) => `
              <tr><th style="color:#d4af37;">${k}</th><td>${v}</td></tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // Reviews Tab
  function renderReviews() {
    const reviewsTab = document.getElementById('tab-reviews');
    const reviewsTabBtn = document.getElementById('reviews-tab');
    if (!reviewsTab || !currentProduct) return;

    const count = currentProduct.reviews ? currentProduct.reviews.length : 0;
    if (reviewsTabBtn) reviewsTabBtn.textContent = `Patron Reviews (${count})`;

    const reviewItems = currentProduct.reviews && currentProduct.reviews.length > 0
      ? currentProduct.reviews.map(r => `
          <div style="background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:18px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong style="color:#ffffff; font-size:14px;">${r.reviewer_name}</strong>
                <span style="font-size:11px; color:#10b981; margin-left:8px;"><i class="fa-solid fa-shield-check"></i> Verified Patron</span>
              </div>
              <div style="color:#d4af37; font-size:12px;">
                ${Array(r.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
              </div>
            </div>
            ${r.title ? `<h5 style="color:#e2e8f0; font-size:13.5px; margin-bottom:6px;">${r.title}</h5>` : ''}
            <p style="color:#94a3b8; font-size:13px; margin:0; line-height:1.5;">${r.comment}</p>
          </div>
        `).join('')
      : '<p style="color:#94a3b8;">Be the first patron to bestow a review upon this creation.</p>';

    reviewsTab.innerHTML = `
      <div class="row">
        <div class="col-lg-7">
          <h3 class="mb-3" style="color:#ffffff;">Patron Testimonials</h3>
          ${reviewItems}
        </div>
        <div class="col-lg-5">
          <div style="background:#111827; border:1px solid rgba(212,175,55,0.3); border-radius:6px; padding:24px;">
            <h4 style="color:#d4af37; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px;">Write a Review</h4>
            <form id="erluxReviewForm">
              <div class="mb-3">
                <label style="color:#cbd5e1; font-size:12px; font-weight:600;">Rating</label>
                <select id="reviewRating" class="form-select" style="background:#0d131f; color:#fff; border-color:rgba(255,255,255,0.2);">
                  <option value="5">★★★★★ (5/5) Exceptional</option>
                  <option value="4">★★★★☆ (4/5) Very Good</option>
                  <option value="3">★★★☆☆ (3/5) Average</option>
                  <option value="2">★★☆☆☆ (2/5) Below Expectations</option>
                  <option value="1">★☆☆☆☆ (1/5) Poor</option>
                </select>
              </div>
              <div class="mb-3">
                <label style="color:#cbd5e1; font-size:12px; font-weight:600;">Review Headline</label>
                <input type="text" id="reviewTitle" class="form-control" placeholder="e.g. Incomparable distinction" style="background:#0d131f; color:#fff; border-color:rgba(255,255,255,0.2);">
              </div>
              <div class="mb-3">
                <label style="color:#cbd5e1; font-size:12px; font-weight:600;">Your Experience</label>
                <textarea id="reviewComment" class="form-control" rows="3" placeholder="Share your experience..." required style="background:#0d131f; color:#fff; border-color:rgba(255,255,255,0.2);"></textarea>
              </div>
              <div class="mb-3">
                <label style="color:#cbd5e1; font-size:12px; font-weight:600;">Your Name</label>
                <input type="text" id="reviewName" class="form-control" placeholder="Full Name" required style="background:#0d131f; color:#fff; border-color:rgba(255,255,255,0.2);">
              </div>
              <div class="mb-3">
                <label style="color:#cbd5e1; font-size:12px; font-weight:600;">Your Email</label>
                <input type="email" id="reviewEmail" class="form-control" placeholder="email@domain.com" required style="background:#0d131f; color:#fff; border-color:rgba(255,255,255,0.2);">
              </div>
              <button type="submit" class="theme-button style-1 w-100" style="padding:10px;">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Bind Review Submit
    document.getElementById('erluxReviewForm')?.addEventListener('submit', async function (e) {
      e.preventDefault();
      const rating = document.getElementById('reviewRating').value;
      const title = document.getElementById('reviewTitle').value;
      const comment = document.getElementById('reviewComment').value;
      const name = document.getElementById('reviewName').value;
      const email = document.getElementById('reviewEmail').value;

      try {
        const res = await fetch(`/api/products/${currentProduct.id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, title, comment, name, email })
        });
        const data = await res.json();
        if (data.success) {
          window.erluxToast(data.message);
          this.reset();
          loadProductDetails();
        } else {
          window.erluxToast(data.message, 'fa-triangle-exclamation');
        }
      } catch (err) {
        window.erluxToast('Failed to submit review', 'fa-triangle-exclamation');
      }
    });
  }

  // Related Creations Grid
  function renderRelated() {
    const relatedSection = document.querySelector('.related-product-section, .shop-product-related');
    if (!relatedSection || !currentProduct || !currentProduct.related) return;

    const itemsContainer = relatedSection.querySelector('.row, .related-slider');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = currentProduct.related.map(r => `
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="shop-grid-item" style="border:1px solid rgba(255,255,255,0.08); background:#111827;">
          <div class="shop-grid-image">
            <a href="shop-details.html?slug=${r.slug}">
              <figure style="margin:0;">
                <img src="${r.main_image}" alt="${r.name}" style="width:100%; height:260px; object-fit:cover;">
              </figure>
            </a>
            <div class="shop-grid-action">
              <div class="hero-button-wapper">
                <button type="button" class="theme-button style-1 w-100" onclick="window.addToCart(${r.id})">
                  <span data-text="Add To Bag">Add To Bag</span>
                </button>
              </div>
            </div>
          </div>
          <div class="shop-grid-content" style="padding:14px;">
            <h2 style="font-size:14px; font-weight:600; margin:0 0 6px 0;">
              <a href="shop-details.html?slug=${r.slug}" style="color:#ffffff; text-decoration:none;">${r.name}</a>
            </h2>
            <div style="font-size:14px; font-weight:700; color:#d4af37;">₹${r.price.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Action Buttons (Add to Cart, Buy Now, Quantity, Wishlist)
  function bindActionButtons() {
    const qtyInput = document.querySelector('.input-qty');
    const plusBtn = document.querySelector('.qty-btn-plus');
    const minusBtn = document.querySelector('.qty-btn-minus');

    if (plusBtn && qtyInput) {
      plusBtn.onclick = () => {
        currentQuantity++;
        qtyInput.value = currentQuantity;
      };
    }

    if (minusBtn && qtyInput) {
      minusBtn.onclick = () => {
        if (currentQuantity > 1) {
          currentQuantity--;
          qtyInput.value = currentQuantity;
        }
      };
    }

    // Add to Cart
    const addBtn = document.querySelector('.shop-product-single-buttons a[aria-label="Add to Cart"]');
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        const variantId = selectedVariant ? selectedVariant.id : null;
        window.addToCart(currentProduct.id, variantId, currentQuantity);
      };
    }

    // Wishlist
    const wishBtn = document.querySelector('.shop-product-single-buttons .heart-button');
    if (wishBtn) {
      wishBtn.onclick = (e) => {
        e.preventDefault();
        window.toggleWishlist(currentProduct.id);
      };
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
  });

})();
