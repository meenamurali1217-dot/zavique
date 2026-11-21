const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware for HTTP 206 video byte-range streaming
app.get('/assets/videos/:filename', (req, res, next) => {
  const filePath = path.join(BASE_DIR, 'assets', 'videos', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return next();
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Mount REST API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/categories', require('./server/routes/categories'));
app.use('/api/products', require('./server/routes/products'));
app.use('/api/cart', require('./server/routes/cart'));
app.use('/api/wishlist', require('./server/routes/wishlist'));
app.use('/api/checkout', require('./server/routes/checkout'));
app.use('/api', require('./server/routes/reviews'));
app.use('/api/admin', require('./server/routes/admin'));
app.use('/api/location', require('./server/routes/location'));

// Admin Dashboard Route (serve directly without 301 redirect)
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(BASE_DIR, 'admin', 'index.html'));
});
app.use('/admin', express.static(path.join(BASE_DIR, 'admin')));

// Static assets and files
app.use('/assets', express.static(path.join(BASE_DIR, 'assets')));
app.use('/data', express.static(path.join(BASE_DIR, 'data')));
app.use(express.static(BASE_DIR));

// Default Route
app.get('/', (req, res) => {
  res.sendFile(path.join(BASE_DIR, 'index.html'));
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ERLUX Luxury Lifestyle Application Server Live`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = PORT + 1;
    console.log(`Port ${PORT} in use, attempting port ${nextPort}...`);
    app.listen(nextPort);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;
