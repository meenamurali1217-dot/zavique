const db = require('./db');

const tables = db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log('Created tables count:', tables.length);
console.log('Tables:', tables.map(t => t.name).join(', '));
