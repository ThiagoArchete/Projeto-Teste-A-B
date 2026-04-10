const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/analytics/page', (req, res) => {
    const { page_name, render_time_ms } = req.body;
    
    db.run(
        `INSERT INTO page_views (page_name, render_time_ms) VALUES (?, ?)`,
        [page_name, render_time_ms],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Page view registrada!', id: this.lastID });
        }
    );
});

app.post('/analytics/click', (req, res) => {
    const { button_name } = req.body;
    
    db.run(
        `INSERT INTO button_clicks (button_name) VALUES (?)`,
        [button_name],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Clique registrado!', id: this.lastID });
        }
    );
});


app.get('/dashboard', (req, res) => {
    const data = {};

    db.all(`
        SELECT 
            page_name, 
            COUNT(*) as views, 
            AVG(render_time_ms) as avg_render_time 
        FROM page_views 
        GROUP BY page_name
        ORDER BY views DESC
    `, [], (err, pages) => {
        if (err) return res.status(500).json({ error: err.message });
        data.pages = pages;

        db.all(`
            SELECT 
                button_name, 
                COUNT(*) as clicks 
            FROM button_clicks 
            GROUP BY button_name
            ORDER BY clicks DESC
        `, [], (err, buttons) => {
            if (err) return res.status(500).json({ error: err.message });
            data.buttons = buttons;
            
            res.json(data);
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API rodando na porta http://localhost:${PORT}`);
});