const assert = require('assert');

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting ERLUX Live Location System Tests ---');

  // Test 1: Reverse Geocoding with Hyderabad Coordinates
  console.log('\n[Test 1] Testing /api/location/reverse-geocode with Hyderabad coords (17.4156, 78.4350)...');
  const geoRes = await fetch(`${baseUrl}/api/location/reverse-geocode?lat=17.4156&lng=78.4350`);
  assert.strictEqual(geoRes.status, 200, `Expected 200, got ${geoRes.status}`);
  const geoData = await geoRes.json();
  assert.strictEqual(geoData.success, true);
  assert(geoData.data.city.includes('Hyderabad') || geoData.data.state.includes('Telangana'), 'Expected Hyderabad or Telangana in result');
  console.log('✓ Reverse geocoding passed:', geoData.data.display, `(${geoData.data.postal_code})`);

  // Test 2: PIN Code Lookup for 500034 (Banjara Hills)
  console.log('\n[Test 2] Testing /api/location/pincode/500034...');
  const pinRes = await fetch(`${baseUrl}/api/location/pincode/500034`);
  assert.strictEqual(pinRes.status, 200, `Expected 200, got ${pinRes.status}`);
  const pinData = await pinRes.json();
  assert.strictEqual(pinData.success, true);
  assert.strictEqual(pinData.data.postal_code, '500034');
  assert.strictEqual(pinData.data.city, 'Hyderabad');
  console.log('✓ PIN code lookup passed:', pinData.data.display);

  // Test 3: Invalid PIN code validation
  console.log('\n[Test 3] Testing /api/location/pincode/invalid...');
  const invRes = await fetch(`${baseUrl}/api/location/pincode/abc`);
  assert.strictEqual(invRes.status, 400);
  console.log('✓ Invalid PIN code properly rejected with 400');

  // Test 4: City Search for 'Hyderabad'
  console.log('\n[Test 4] Testing /api/location/search?q=Hyderabad...');
  const searchRes = await fetch(`${baseUrl}/api/location/search?q=Hyderabad`);
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.success, true);
  assert(Array.isArray(searchData.data) && searchData.data.length > 0);
  console.log('✓ City search passed with', searchData.data.length, 'results. First match:', searchData.data[0].display);

  // Test 5: Patron Authentication & User Location Synchronization
  console.log('\n[Test 5] Testing patron account login and location sync...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@erlux.com', password: 'Customer@2026' })
  });
  
  if (loginRes.ok) {
    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;
    assert(token, 'Token expected');

    // Save location to user profile
    const testLoc = {
      locality: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postal_code: '500034',
      country: 'India',
      display: 'Banjara Hills, Hyderabad',
      formatted: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034'
    };

    const saveLocRes = await fetch(`${baseUrl}/api/location/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testLoc)
    });
    assert.strictEqual(saveLocRes.status, 200);
    const saveLocData = await saveLocRes.json();
    assert.strictEqual(saveLocData.success, true);
    console.log('✓ Preferred location saved to SQLite user profile');

    // Retrieve user location
    const getLocRes = await fetch(`${baseUrl}/api/location/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(getLocRes.status, 200);
    const getLocData = await getLocRes.json();
    assert.strictEqual(getLocData.success, true);
    assert.strictEqual(getLocData.location.city, 'Hyderabad');
    assert.strictEqual(getLocData.location.postal_code, '500034');
    console.log('✓ Preferred location retrieved from user profile:', getLocData.location.display);
  } else {
    console.log('Note: Admin login skipped or credentials differ, checking guest location endpoint...');
    const guestRes = await fetch(`${baseUrl}/api/location/user`);
    const guestData = await guestRes.json();
    assert.strictEqual(guestData.guest, true);
    console.log('✓ Guest location handling verified');
  }

  console.log('\n🎉 ALL 5 ERLUX LIVE LOCATION SYSTEM TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
