const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./analytics.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_name TEXT NOT NULL,
            render_time_ms INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS button_clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            button_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;