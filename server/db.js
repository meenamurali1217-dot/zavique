const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'erlux.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys for high performance and integrity
try {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {
  console.warn('PRAGMA setup note:', e.message);
}

// Initialize tables from schema.sql if needed
function initSchema() {
  const schemaPath = path.join(DB_DIR, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
}

initSchema();

/**
 * Execute query and return array of objects
 */
function all(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (err) {
    console.error('DB all error:', err.message, 'SQL:', sql, 'params:', params);
    throw err;
  }
}

/**
 * Execute query and return single object or undefined
 */
function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (err) {
    console.error('DB get error:', err.message, 'SQL:', sql, 'params:', params);
    throw err;
  }
}

/**
 * Execute insert/update/delete statement and return { changes, lastInsertRowid }
 */
function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (err) {
    console.error('DB run error:', err.message, 'SQL:', sql, 'params:', params);
    throw err;
  }
}

/**
 * Execute multiple raw statements
 */
function exec(sql) {
  try {
    return db.exec(sql);
  } catch (err) {
    console.error('DB exec error:', err.message);
    throw err;
  }
}

/**
 * Run function inside transaction
 */
function transaction(fn) {
  try {
    db.exec('BEGIN TRANSACTION;');
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

module.exports = {
  db,
  all,
  get,
  run,
  exec,
  transaction,
  initSchema
};
