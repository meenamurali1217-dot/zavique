const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testUnsplash() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const newTabRes = await fetch('http://127.0.0.1:9225/json/new?https://unsplash.com/s/photos/luxury-gold-watch-white-background', { method: 'PUT' });
    const tab = await newTabRes.json();

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    await sleep(4000);

    const result = await new Promise((resolve) => {
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
              .map(img => img.src || (img.srcset ? img.srcset.split(' ')[0] : ''))
              .filter(src => src && src.includes('images.unsplash.com/photo-'))
          `
        }
      }));
    });

    console.log('Unsplash images found:', result.length);
    if (result.length > 0) {
      console.log('Sample:', result.slice(0, 5));
    }
    ws.close();
  } finally {
    chrome.kill();
  }
}

testUnsplash();
