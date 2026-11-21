const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\meena\\.gemini\\antigravity\\brain\\ccbfa092-2486-44d0-9eed-45f81796c6ff';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Chrome with remote debugging...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Chrome Debugger attached:', versionData.Browser);

    const newTabRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
    const tabData = await newTabRes.json();
    const wsUrl = tabData.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise(res => ws.onopen = res);

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function setViewport(width, height, isMobile = false) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: isMobile
      });
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(artifactDir, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`✓ Saved screenshot: ${filename}`);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // 1. Desktop 1440x900 - Home Page with Modal Open
    console.log('\n[Flow 1] Loading index.html on Desktop 1440x900...');
    await setViewport(1440, 900);
    await send('Page.navigate', { url: 'http://localhost:3000/index.html' });
    await sleep(2500);
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.preloader').forEach(e => e.remove());
        window.erluxLocation.openModal();
      `
    });
    await sleep(800);
    await captureScreenshot('location_modal_desktop.png');

    // 2. Set Location to Hyderabad and verify header update
    console.log('\n[Flow 2] Setting location to Hyderabad (Banjara Hills)...');
    await send('Runtime.evaluate', {
      expression: `
        window.erluxLocation.set({
          locality: 'Banjara Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          postal_code: '500034',
          country: 'India',
          display: 'Banjara Hills, Hyderabad',
          formatted: 'Road No. 12, Banjara Hills, Hyderabad, Telangana, 500034'
        });
        window.erluxLocation.closeModal();
      `
    });
    await sleep(500);
    await captureScreenshot('location_header_hyderabad.png');

    // 3. Product Details - Delivery Estimate Box
    console.log('\n[Flow 3] Navigating to shop-details.html to verify delivery estimate...');
    await send('Page.navigate', { url: 'http://localhost:3000/shop-details.html?slug=chairman-special-extrait-de-parfum' });
    await sleep(2500);
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.preloader').forEach(e => e.remove());
        const box = document.getElementById('erluxProductDeliveryBox');
        if (box) box.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await sleep(600);
    await captureScreenshot('location_product_details.png');

    // 4. Cart Page - Delivery Destination in Cart
    console.log('\n[Flow 4] Adding item to cart and loading cart.html...');
    await send('Runtime.evaluate', {
      expression: 'window.addToCart(1, null, 1)'
    });
    await sleep(800);
    await send('Page.navigate', { url: 'http://localhost:3000/cart.html' });
    await sleep(2500);
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.preloader').forEach(e => e.remove());
        const total = document.querySelector('.cart-collaterals');
        if (total) total.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await sleep(600);
    await captureScreenshot('location_cart_delivery.png');

    // 5. Checkout Page - Prompt Banner & Apply
    console.log('\n[Flow 5] Loading checkout.html to verify prompt banner...');
    await send('Page.navigate', { url: 'http://localhost:3000/checkout.html' });
    await sleep(2500);
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.preloader').forEach(e => e.remove());
        const banner = document.getElementById('erluxCheckoutLocBanner');
        if (banner) banner.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await sleep(600);
    await captureScreenshot('location_checkout_prompt.png');

    console.log('Clicking "Apply to Address"...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById('erluxBtnApplyDetectedLoc');
        if (btn) btn.click();
        const cityInput = document.getElementById('town');
        if (cityInput) cityInput.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await sleep(600);
    await captureScreenshot('location_checkout_applied.png');

    // 6. Mobile 375x812 - Modal & Header
    console.log('\n[Flow 6] Testing mobile viewport 375x812...');
    await setViewport(375, 812, true);
    await send('Page.navigate', { url: 'http://localhost:3000/index.html' });
    await sleep(2500);
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.preloader').forEach(e => e.remove());
        window.erluxLocation.openModal();
      `
    });
    await sleep(800);
    await captureScreenshot('location_modal_mobile.png');

    ws.close();
    console.log('\nAll location workflow screenshots captured successfully!');
  } finally {
    chromeProc.kill();
  }
}

run().catch(err => {
  console.error('Capture flow error:', err);
  process.exit(1);
});
