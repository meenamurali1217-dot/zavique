const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function searchCategory(query) {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const encoded = encodeURIComponent(query);
    const newTabRes = await fetch(`http://127.0.0.1:9224/json/new?https://www.pexels.com/search/${encoded}/`, { method: 'PUT' });
    const tab = await newTabRes.json();

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    await sleep(4000);

    const result = await new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === 1) resolve(msg.result?.result?.value || []);
      };
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          returnByValue: true,
          expression: `
            Array.from(document.querySelectorAll('img'))
              .map(img => img.src)
              .filter(src => src && src.includes('images.pexels.com/photos/'))
          `
        }
      }));
    });

    ws.close();
    return result;
  } finally {
    chrome.kill();
  }
}

async function run() {
  const queries = [
    'luxury watch white background',
    'sunglasses white background',
    'leather belt wallet cream background',
    'luxury handbag blush pink background',
    'luxury gift box gold ribbon',
    'indian fashion model studio white background',
    'luxury shoes heels white background',
    'gold jewellery necklace white background'
  ];

  for (const q of queries) {
    console.log(`Searching for: ${q}...`);
    try {
      const urls = await searchCategory(q);
      console.log(`Found ${urls.length} images. Sample:`, urls[0]);
    } catch (e) {
      console.log('Error:', e.message);
    }
    await sleep(1000);
  }
}

run();
