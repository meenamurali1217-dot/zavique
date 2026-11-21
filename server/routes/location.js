const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireUser, optionalUser } = require('../middleware/auth');

// Popular Indian luxury hubs & fallback PIN directory for instant/offline response
const PINCODE_FALLBACKS = {
  '500034': { locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', postal_code: '500034', country: 'India' },
  '500033': { locality: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', postal_code: '500033', country: 'India' },
  '500081': { locality: 'HITEC City, Madhapur', city: 'Hyderabad', state: 'Telangana', postal_code: '500081', country: 'India' },
  '500001': { locality: 'Abids, GPO', city: 'Hyderabad', state: 'Telangana', postal_code: '500001', country: 'India' },
  '500082': { locality: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', postal_code: '500082', country: 'India' },
  '110001': { locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', postal_code: '110001', country: 'India' },
  '110021': { locality: 'Chanakyapuri', city: 'New Delhi', state: 'Delhi', postal_code: '110021', country: 'India' },
  '110048': { locality: 'Greater Kailash', city: 'New Delhi', state: 'Delhi', postal_code: '110048', country: 'India' },
  '110070': { locality: 'Vasant Kunj', city: 'New Delhi', state: 'Delhi', postal_code: '110070', country: 'India' },
  '400001': { locality: 'Fort / Colaba', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', country: 'India' },
  '400034': { locality: 'Tardeo / The Imperial', city: 'Mumbai', state: 'Maharashtra', postal_code: '400034', country: 'India' },
  '400050': { locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', postal_code: '400050', country: 'India' },
  '400049': { locality: 'Juhu', city: 'Mumbai', state: 'Maharashtra', postal_code: '400049', country: 'India' },
  '560001': { locality: 'MG Road / Ashok Nagar', city: 'Bengaluru', state: 'Karnataka', postal_code: '560001', country: 'India' },
  '560038': { locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', postal_code: '560038', country: 'India' },
  '560095': { locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', postal_code: '560095', country: 'India' },
  '600001': { locality: 'George Town', city: 'Chennai', state: 'Tamil Nadu', postal_code: '600001', country: 'India' },
  '600028': { locality: 'R.A. Puram', city: 'Chennai', state: 'Tamil Nadu', postal_code: '600028', country: 'India' },
  '700001': { locality: 'BBD Bagh', city: 'Kolkata', state: 'West Bengal', postal_code: '700001', country: 'India' },
  '700019': { locality: 'Ballygunge', city: 'Kolkata', state: 'West Bengal', postal_code: '700019', country: 'India' },
  '411001': { locality: 'Pune Camp', city: 'Pune', state: 'Maharashtra', postal_code: '411001', country: 'India' },
  '411006': { locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', postal_code: '411006', country: 'India' },
  '380001': { locality: 'Lal Darwaja', city: 'Ahmedabad', state: 'Gujarat', postal_code: '380001', country: 'India' }
};

// Helper: Format location display string
function formatDisplayString(locality, city, state) {
  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    return `${locality}, ${city}`;
  }
  if (city && state) {
    return `${city}, ${state}`;
  }
  return locality || city || state || 'Selected Location';
}

/**
 * 1. GET /api/location/reverse-geocode
 * Query params: lat, lng
 */
router.get('/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid latitude or longitude coordinates provided.'
    });
  }

  try {
    // Configurable geocoding provider
    const customApiKey = process.env.GEOCODING_API_KEY;
    const provider = process.env.GEOCODING_PROVIDER || 'nominatim';

    let address = null;
    let formatted = '';

    if (customApiKey && provider === 'google') {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${customApiKey}`;
      const gRes = await fetch(googleUrl, { signal: AbortSignal.timeout(6000) });
      const gJson = await gRes.json();
      if (gJson.status === 'OK' && gJson.results?.length > 0) {
        const topResult = gJson.results[0];
        formatted = topResult.formatted_address;
        const comps = topResult.address_components || [];
        const findComp = (type) => comps.find(c => c.types.includes(type))?.long_name || '';

        address = {
          locality: findComp('sublocality') || findComp('neighborhood') || findComp('route'),
          city: findComp('locality') || findComp('administrative_area_level_2'),
          state: findComp('administrative_area_level_1'),
          postcode: findComp('postal_code'),
          country: findComp('country')
        };
      }
    }

    // Default: OpenStreetMap Nominatim reverse geocode
    if (!address) {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const nRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'ERLUX-Luxury-Lifestyle/1.0 (concierge@erluxlifestyle.com)',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (nRes.ok) {
        const nJson = await nRes.json();
        const addr = nJson.address || {};
        formatted = nJson.display_name || '';
        address = {
          locality: addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || '',
          city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
          state: addr.state || '',
          postcode: addr.postcode || '',
          country: addr.country || 'India'
        };
      }
    }

    if (!address || (!address.city && !address.state && !address.locality)) {
      throw new Error('Reverse geocoding provider returned incomplete address data.');
    }

    const locality = address.locality || '';
    const city = address.city || '';
    const state = address.state || '';
    const postal_code = address.postcode || '';
    const country = address.country || 'India';
    const display = formatDisplayString(locality, city, state);

    return res.json({
      success: true,
      data: {
        locality,
        city,
        state,
        postal_code,
        country,
        display,
        formatted,
        lat: latitude,
        lng: longitude
      }
    });

  } catch (err) {
    console.warn('Reverse geocoding warning:', err.message);

    // Bounding-box heuristic fallback for India major metros if external network times out
    let fallback = null;
    if (latitude >= 17.25 && latitude <= 17.60 && longitude >= 78.25 && longitude <= 78.65) {
      fallback = { locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', postal_code: '500034', country: 'India' };
    } else if (latitude >= 18.85 && latitude <= 19.30 && longitude >= 72.75 && longitude <= 73.05) {
      fallback = { locality: 'Colaba / South Mumbai', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', country: 'India' };
    } else if (latitude >= 28.40 && latitude <= 28.90 && longitude >= 76.85 && longitude <= 77.40) {
      fallback = { locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', postal_code: '110001', country: 'India' };
    } else if (latitude >= 12.80 && latitude <= 13.15 && longitude >= 77.45 && longitude <= 77.75) {
      fallback = { locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', postal_code: '560038', country: 'India' };
    }

    if (fallback) {
      fallback.display = formatDisplayString(fallback.locality, fallback.city, fallback.state);
      fallback.lat = latitude;
      fallback.lng = longitude;
      fallback.formatted = `${fallback.locality}, ${fallback.city}, ${fallback.state} ${fallback.postal_code}, ${fallback.country}`;
      return res.json({ success: true, data: fallback, note: 'Network fallback applied' });
    }

    return res.status(502).json({
      success: false,
      message: 'Reverse geocoding service currently unavailable. Please enter your PIN code manually.'
    });
  }
});

/**
 * 2. GET /api/location/pincode/:pincode
 * Validates and looks up address details by 6-digit PIN code
 */
router.get('/pincode/:pincode', async (req, res) => {
  const pin = (req.params.pincode || '').trim();

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 6-digit Indian postal PIN code.'
    });
  }

  // Check offline dictionary first for ultra-fast response
  if (PINCODE_FALLBACKS[pin]) {
    const cached = PINCODE_FALLBACKS[pin];
    return res.json({
      success: true,
      data: {
        ...cached,
        display: formatDisplayString(cached.locality, cached.city, cached.state),
        formatted: `${cached.locality}, ${cached.city}, ${cached.state} - ${pin}, ${cached.country}`
      }
    });
  }

  // Lookup via India Post Public API
  try {
    const postUrl = `https://api.postalpincode.in/pincode/${pin}`;
    const pRes = await fetch(postUrl, { signal: AbortSignal.timeout(5000) });
    const pJson = await pRes.json();

    if (Array.isArray(pJson) && pJson[0]?.Status === 'Success' && pJson[0]?.PostOffice?.length > 0) {
      const po = pJson[0].PostOffice[0];
      const locality = po.Name || '';
      const city = po.District || po.Division || '';
      const state = po.State || '';
      const country = po.Country || 'India';
      const display = formatDisplayString(locality, city, state);

      return res.json({
        success: true,
        data: {
          locality,
          city,
          state,
          postal_code: pin,
          country,
          display,
          formatted: `${locality}, ${city}, ${state} - ${pin}, ${country}`
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: `No postal records found for PIN code ${pin}. Please verify your PIN code.`
    });

  } catch (err) {
    console.warn('Pincode API error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Postal verification service is temporarily unreachable. Please try again or search by city.'
    });
  }
});

/**
 * 3. GET /api/location/search?q=...
 * Autocomplete / search localities or cities
 */
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters.'
    });
  }

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`;
    const sRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'ERLUX-Luxury-Lifestyle/1.0 (concierge@erluxlifestyle.com)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (sRes.ok) {
      const list = await sRes.json();
      const results = list.map(item => {
        const a = item.address || {};
        const locality = a.suburb || a.neighbourhood || a.residential || a.road || '';
        const city = a.city || a.town || a.county || a.state_district || '';
        const state = a.state || '';
        const postal_code = a.postcode || '';
        const country = a.country || 'India';
        const display = formatDisplayString(locality, city, state);
        return {
          display,
          locality,
          city,
          state,
          postal_code,
          country,
          formatted: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });

      return res.json({ success: true, data: results });
    }
  } catch (e) {
    console.warn('Location search error:', e.message);
  }

  // Fallback search from local dictionary
  const qLower = query.toLowerCase();
  const matched = Object.values(PINCODE_FALLBACKS)
    .filter(item => item.locality.toLowerCase().includes(qLower) || item.city.toLowerCase().includes(qLower) || item.postal_code.includes(qLower))
    .map(item => ({
      ...item,
      display: formatDisplayString(item.locality, item.city, item.state),
      formatted: `${item.locality}, ${item.city}, ${item.state} ${item.postal_code}, ${item.country}`
    }));

  return res.json({ success: true, data: matched });
});

/**
 * 4. GET /api/location/user
 * Get saved preferred location for logged in customer
 */
router.get('/user', optionalUser, (req, res) => {
  if (!req.user) {
    return res.json({ success: true, location: null, guest: true });
  }

  try {
    const row = db.get('SELECT preferred_location FROM users WHERE id = ?', [req.user.id]);
    let location = null;
    if (row && row.preferred_location) {
      try {
        location = JSON.parse(row.preferred_location);
      } catch (e) {
        location = null;
      }
    }
    return res.json({ success: true, location, guest: false });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 5. POST /api/location/user
 * Update saved preferred location for logged in customer
 */
router.post('/user', requireUser, (req, res) => {
  const { locality, city, state, postal_code, country, display, formatted } = req.body;

  if (!city && !locality) {
    return res.status(400).json({
      success: false,
      message: 'City or locality is required to save delivery location.'
    });
  }

  const locationData = {
    locality: locality || '',
    city: city || '',
    state: state || '',
    postal_code: postal_code || '',
    country: country || 'India',
    display: display || formatDisplayString(locality, city, state),
    formatted: formatted || '',
    updated_at: new Date().toISOString()
  };

  try {
    db.run(
      'UPDATE users SET preferred_location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(locationData), req.user.id]
    );

    return res.json({
      success: true,
      message: 'Delivery location synchronized with your patron account.',
      location: locationData
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
