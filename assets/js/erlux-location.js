/**
 * ERLUX Live Customer Location Detection Engine
 * Handles:
 * - Native Geolocation API (navigator.geolocation.getCurrentPosition)
 * - Server-side reverse geocoding & Indian PIN code lookup
 * - Luxury ERLUX Location Selection Modal
 * - Guest (localStorage) & Logged-In Patron (SQLite API) location sync
 * - Custom events for delivery estimate & checkout prefill integration
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'erlux_customer_location';

  // Global state
  let currentLocation = null;
  let isDetecting = false;

  // Retrieve current location from memory or storage
  function getStoredLocation() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved location:', e);
    }
    return null;
  }

  // Save location to localStorage and optionally to server
  async function persistLocation(locationData) {
    if (!locationData) return;
    currentLocation = locationData;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
    } catch (e) {
      console.warn('Could not save location locally:', e);
    }

    // Update header display immediately
    updateHeaderLocationDisplay(locationData);

    // Synchronize to patron account if logged in
    const token = localStorage.getItem('erlux_user_token');
    if (token) {
      try {
        await fetch('/api/location/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(locationData)
        });
      } catch (err) {
        console.warn('Patron location server sync notice:', err);
      }
    }

    // Emit event for product delivery widget & checkout address sync
    window.dispatchEvent(new CustomEvent('erlux:locationChanged', { detail: locationData }));
  }

  // Update header text in all header location elements
  function updateHeaderLocationDisplay(loc) {
    const textEls = document.querySelectorAll('#headerLocationText, .header-location-value');
    textEls.forEach(el => {
      if (loc && (loc.locality || loc.city || loc.display)) {
        const displayText = loc.display || [loc.locality, loc.city].filter(Boolean).join(', ');
        el.innerHTML = `${displayText} <i class="fa-solid fa-chevron-down"></i>`;
        el.setAttribute('title', loc.formatted || displayText);
      } else {
        el.innerHTML = `Select Location <i class="fa-solid fa-chevron-down"></i>`;
      }
    });
  }

  // Create & Inject ERLUX Location Selection Modal
  function injectLocationModal() {
    if (document.getElementById('erluxLocationModalWrapper')) return;

    const modalHtml = `
      <div class="erlux-loc-backdrop" id="erluxLocationBackdrop"></div>
      <div class="erlux-loc-modal" id="erluxLocationModalWrapper" role="dialog" aria-labelledby="erluxLocTitle" aria-modal="true">
        <div class="erlux-loc-card">
          <!-- Header -->
          <div class="erlux-loc-header">
            <div class="erlux-loc-header-left">
              <div class="erlux-loc-pin-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div>
                <h3 id="erluxLocTitle">Select Your Delivery Location</h3>
                <p>Enjoy white-glove concierge delivery tailored to your residence.</p>
              </div>
            </div>
            <button class="erlux-loc-close-btn" id="erluxLocCloseBtn" aria-label="Close location modal">&times;</button>
          </div>

          <!-- Body -->
          <div class="erlux-loc-body">
            <!-- 1. Primary Action: Browser Geolocation -->
            <div class="erlux-loc-action-box">
              <button type="button" class="erlux-btn-use-location" id="erluxBtnUseLocation">
                <i class="fa-solid fa-location-crosshairs"></i>
                <span>USE MY CURRENT LOCATION</span>
              </button>
              <div class="erlux-loc-detect-note">Detects your city &amp; locality using browser GPS</div>
            </div>

            <!-- Detecting Spinner & Status -->
            <div class="erlux-loc-status d-none" id="erluxLocStatus">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span id="erluxLocStatusText">Requesting location permission from browser...</span>
            </div>

            <!-- Error Notice Box -->
            <div class="erlux-loc-error d-none" id="erluxLocError">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div id="erluxLocErrorMsg">Location permission denied. Please enter your PIN code manually below.</div>
            </div>

            <!-- Detected Address Preview Card -->
            <div class="erlux-detected-card d-none" id="erluxDetectedCard">
              <div class="erlux-detected-badge"><i class="fa-solid fa-check"></i> Location Detected</div>
              <div class="erlux-detected-title" id="erluxDetectedTitle">Banjara Hills, Hyderabad</div>
              <div class="erlux-detected-address" id="erluxDetectedAddress">Road No. 12, Banjara Hills, Hyderabad, Telangana, 500034</div>
              <div class="erlux-detected-meta" id="erluxDetectedMeta">
                <span class="erlux-meta-pill" id="erluxMetaState">Telangana</span>
                <span class="erlux-meta-pill" id="erluxMetaPincode">PIN: 500034</span>
              </div>
              <div class="erlux-detected-actions">
                <button type="button" class="erlux-btn-confirm" id="erluxBtnConfirmLocation">
                  <i class="fa-solid fa-check"></i> CONFIRM LOCATION
                </button>
                <button type="button" class="erlux-btn-change" id="erluxBtnChangeLocation">
                  Change Location
                </button>
              </div>
            </div>

            <!-- Divider -->
            <div class="erlux-loc-divider">
              <span>OR ENTER LOCATION MANUALLY</span>
            </div>

            <!-- 2. Manual PIN Code Entry -->
            <div class="erlux-loc-manual-section">
              <label for="erluxPincodeInput" class="erlux-loc-label">Enter Postal PIN Code</label>
              <div class="erlux-loc-input-group">
                <input type="text" id="erluxPincodeInput" class="erlux-loc-input" placeholder="Enter 6-digit PIN code (e.g. 500034)" maxlength="6" pattern="[0-9]{6}">
                <button type="button" class="erlux-loc-btn-apply" id="erluxBtnCheckPincode">Verify</button>
              </div>
            </div>

            <!-- 3. City / Area Search -->
            <div class="erlux-loc-search-section">
              <label for="erluxSearchLocInput" class="erlux-loc-label">Search City or Locality</label>
              <div class="erlux-loc-search-group">
                <i class="fa-solid fa-magnifying-glass erlux-search-icon"></i>
                <input type="text" id="erluxSearchLocInput" class="erlux-loc-input pl-icon" placeholder="Search locality, city or area (e.g. Jubilee Hills, Hyderabad)">
              </div>
              <div class="erlux-loc-search-results d-none" id="erluxSearchResults"></div>
            </div>

            <!-- Quick Popular Cities -->
            <div class="erlux-quick-cities">
              <span class="erlux-quick-label">Popular Luxury Hubs:</span>
              <div class="erlux-quick-tags">
                <button type="button" class="erlux-city-tag" data-pin="500034">Hyderabad (Banjara Hills)</button>
                <button type="button" class="erlux-city-tag" data-pin="400034">Mumbai (Tardeo)</button>
                <button type="button" class="erlux-city-tag" data-pin="110001">New Delhi (CP)</button>
                <button type="button" class="erlux-city-tag" data-pin="560001">Bengaluru (MG Road)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    wireModalEvents();
  }

  // Open modal
  function openLocationModal() {
    injectLocationModal();
    const backdrop = document.getElementById('erluxLocationBackdrop');
    const modal = document.getElementById('erluxLocationModalWrapper');
    if (backdrop && modal) {
      backdrop.classList.add('show');
      modal.classList.add('show');
      document.body.classList.add('erlux-modal-open');

      // Clear any previous error states
      hideStatus();
      hideError();

      // If already has location, populate preview
      const saved = getStoredLocation();
      if (saved && saved.locality) {
        showDetectedCard(saved);
      }
    }
  }

  // Close modal
  function closeLocationModal() {
    const backdrop = document.getElementById('erluxLocationBackdrop');
    const modal = document.getElementById('erluxLocationModalWrapper');
    if (backdrop && modal) {
      backdrop.classList.remove('show');
      modal.classList.remove('show');
      document.body.classList.remove('erlux-modal-open');
    }
  }

  // UI state helpers
  function showStatus(text) {
    const statusBox = document.getElementById('erluxLocStatus');
    const statusText = document.getElementById('erluxLocStatusText');
    if (statusBox && statusText) {
      statusText.textContent = text;
      statusBox.classList.remove('d-none');
    }
    hideError();
  }

  function hideStatus() {
    const statusBox = document.getElementById('erluxLocStatus');
    if (statusBox) statusBox.classList.add('d-none');
  }

  function showError(msg) {
    const errorBox = document.getElementById('erluxLocError');
    const errorMsg = document.getElementById('erluxLocErrorMsg');
    if (errorBox && errorMsg) {
      errorMsg.textContent = msg;
      errorBox.classList.remove('d-none');
    }
    hideStatus();
  }

  function hideError() {
    const errorBox = document.getElementById('erluxLocError');
    if (errorBox) errorBox.classList.add('d-none');
  }

  // Show detected location card
  let pendingLocation = null;
  function showDetectedCard(data) {
    pendingLocation = data;
    const card = document.getElementById('erluxDetectedCard');
    const titleEl = document.getElementById('erluxDetectedTitle');
    const addrEl = document.getElementById('erluxDetectedAddress');
    const stateEl = document.getElementById('erluxMetaState');
    const pinEl = document.getElementById('erluxMetaPincode');

    if (!card) return;

    const display = data.display || [data.locality, data.city].filter(Boolean).join(', ');
    if (titleEl) titleEl.textContent = display;
    if (addrEl) addrEl.textContent = data.formatted || `${data.locality || ''}, ${data.city || ''}, ${data.state || ''} ${data.postal_code || ''}`;
    if (stateEl) stateEl.textContent = data.state || 'India';
    if (pinEl) pinEl.textContent = data.postal_code ? `PIN: ${data.postal_code}` : 'India';

    card.classList.remove('d-none');
    hideStatus();
    hideError();
  }

  // Trigger Browser Geolocation Detection
  function detectLiveLocation() {
    if (isDetecting) return;

    if (!('geolocation' in navigator)) {
      showError('Browser Geolocation is not supported by your current browser. Please enter your PIN code manually.');
      return;
    }

    isDetecting = true;
    showStatus('Requesting browser location permission...');

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        showStatus('Location acquired. Resolving address with luxury concierge...');

        try {
          const res = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          const json = await res.json();

          if (json.success && json.data) {
            showDetectedCard(json.data);
          } else {
            showError(json.message || 'Could not resolve physical address from coordinates. Please enter your PIN code.');
          }
        } catch (err) {
          showError('Network error while resolving address. Please enter your PIN code manually.');
        } finally {
          isDetecting = false;
        }
      },
      (error) => {
        isDetecting = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showError('Location access was denied. You can manually enter your PIN code or search your city below.');
            break;
          case error.POSITION_UNAVAILABLE:
            showError('GPS device signal is unavailable. Please verify location settings or enter your PIN code.');
            break;
          case error.TIMEOUT:
            showError('Location detection timed out. Please retry or enter your 6-digit PIN code.');
            break;
          default:
            showError(`Location error (${error.message || 'unknown'}). Please enter your PIN code manually.`);
            break;
        }
      },
      geoOptions
    );
  }

  // Lookup by PIN code
  async function checkPincode(pin) {
    if (!/^\d{6}$/.test(pin)) {
      showError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    showStatus(`Verifying PIN code ${pin}...`);
    try {
      const res = await fetch(`/api/location/pincode/${pin}`);
      const json = await res.json();
      if (json.success && json.data) {
        showDetectedCard(json.data);
      } else {
        showError(json.message || 'PIN code not found. Please double check the 6 digits.');
      }
    } catch (e) {
      showError('Could not verify PIN code. Please check your network connection.');
    }
  }

  // Search locations by string
  let searchTimer = null;
  async function searchLocation(query) {
    clearTimeout(searchTimer);
    if (!query || query.trim().length < 2) {
      const resultsEl = document.getElementById('erluxSearchResults');
      if (resultsEl) resultsEl.classList.add('d-none');
      return;
    }

    searchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        const resultsEl = document.getElementById('erluxSearchResults');
        if (!resultsEl) return;

        if (json.success && json.data && json.data.length > 0) {
          resultsEl.innerHTML = json.data.map(item => `
            <div class="erlux-search-result-item" data-json='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
              <i class="fa-solid fa-location-dot"></i>
              <div>
                <div class="erlux-res-title">${item.display}</div>
                <div class="erlux-res-sub">${item.formatted || `${item.state}, ${item.country}`}</div>
              </div>
            </div>
          `).join('');
          resultsEl.classList.remove('d-none');
        } else {
          resultsEl.innerHTML = `<div class="erlux-search-no-results">No matching areas found for "${query}"</div>`;
          resultsEl.classList.remove('d-none');
        }
      } catch (err) {
        console.warn('Search query error:', err);
      }
    }, 300);
  }

  // Wire Modal Event Listeners
  function wireModalEvents() {
    const backdrop = document.getElementById('erluxLocationBackdrop');
    const closeBtn = document.getElementById('erluxLocCloseBtn');
    const useBtn = document.getElementById('erluxBtnUseLocation');
    const confirmBtn = document.getElementById('erluxBtnConfirmLocation');
    const changeBtn = document.getElementById('erluxBtnChangeLocation');
    const pinBtn = document.getElementById('erluxBtnCheckPincode');
    const pinInput = document.getElementById('erluxPincodeInput');
    const searchInput = document.getElementById('erluxSearchLocInput');
    const resultsContainer = document.getElementById('erluxSearchResults');

    if (backdrop) backdrop.addEventListener('click', closeLocationModal);
    if (closeBtn) closeBtn.addEventListener('click', closeLocationModal);
    if (useBtn) useBtn.addEventListener('click', detectLiveLocation);

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (pendingLocation) {
          await persistLocation(pendingLocation);
          closeLocationModal();
          if (window.erluxToast) {
            window.erluxToast(`Delivery location set to ${pendingLocation.display}`, 'fa-location-dot');
          }
        }
      });
    }

    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        const card = document.getElementById('erluxDetectedCard');
        if (card) card.classList.add('d-none');
        pendingLocation = null;
        if (pinInput) pinInput.focus();
      });
    }

    if (pinBtn && pinInput) {
      pinBtn.addEventListener('click', () => {
        checkPincode(pinInput.value.trim());
      });
      pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkPincode(pinInput.value.trim());
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchLocation(e.target.value);
      });
    }

    if (resultsContainer) {
      resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.erlux-search-result-item');
        if (item) {
          try {
            const data = JSON.parse(item.getAttribute('data-json'));
            showDetectedCard(data);
            resultsContainer.classList.add('d-none');
            if (searchInput) searchInput.value = '';
          } catch (err) {
            console.warn(err);
          }
        }
      });
    }

    // Quick city tags
    const cityTags = document.querySelectorAll('.erlux-city-tag');
    cityTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const pin = tag.getAttribute('data-pin');
        if (pin) checkPincode(pin);
      });
    });
  }

  // Wire header trigger buttons
  function wireHeaderTriggers() {
    const triggers = document.querySelectorAll('#headerLocationTrigger, .header-location, [data-trigger="location-modal"]');
    triggers.forEach(trigger => {
      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLocationModal();
      });
      trigger.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLocationModal();
        }
      });
    });
  }

  // Load Initial Location on Page Ready
  async function initLocation() {
    // 1. Check local storage
    const saved = getStoredLocation();
    if (saved) {
      currentLocation = saved;
      updateHeaderLocationDisplay(saved);
    }

    // 2. If logged in, fetch synchronized user location from database
    const token = localStorage.getItem('erlux_user_token');
    if (token) {
      try {
        const res = await fetch('/api/location/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.location) {
          currentLocation = json.location;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.location));
          updateHeaderLocationDisplay(json.location);
          window.dispatchEvent(new CustomEvent('erlux:locationChanged', { detail: json.location }));
        }
      } catch (err) {
        console.warn('Location user load notice:', err);
      }
    }

    wireHeaderTriggers();
  }

  // Expose global location API
  window.erluxLocation = {
    get: () => currentLocation || getStoredLocation(),
    openModal: openLocationModal,
    closeModal: closeLocationModal,
    set: persistLocation,
    detect: detectLiveLocation
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocation);
  } else {
    initLocation();
  }

})();
