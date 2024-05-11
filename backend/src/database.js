const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../base3.db');

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(30) NOT NULL,
    senha VARCHAR(24) NOT NULL,
    id_lumx VARCHAR(40) NOT NULL,
    wallet_address VARCHAR(40) NOT NULL
  );
`);

module.exports = db;