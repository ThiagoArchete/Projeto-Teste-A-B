const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

app.post('/analytics/page', (req, res) => {
  const { page_name, render_time_ms } = req.body;

  if (!page_name || render_time_ms === undefined) {
    return res.status(400).json({
      error: 'page_name e render_time_ms são obrigatórios.',
    });
  }

  db.run(
    `INSERT INTO page_views (page_name, render_time_ms) VALUES (?, ?)`,
    [page_name, render_time_ms],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'Page view registrada!',
        id: this.lastID,
      });
    }
  );
});

app.post('/analytics/click', (req, res) => {
  const { button_name } = req.body;

  if (!button_name) {
    return res.status(400).json({
      error: 'button_name é obrigatório.',
    });
  }

  db.run(
    `INSERT INTO button_clicks (button_name) VALUES (?)`,
    [button_name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'Clique registrado!',
        id: this.lastID,
      });
    }
  );
});

app.post('/analytics/order', (req, res) => {
  const {
    product_name,
    category,
    size,
    quantity,
    delivery_type,
    unit_price,
    total,
  } = req.body;

  if (!product_name || !size || !quantity || !delivery_type || unit_price === undefined || total === undefined) {
    return res.status(400).json({
      error: 'Dados do pedido incompletos.',
    });
  }

  db.run(
    `
      INSERT INTO orders (
        product_name,
        category,
        size,
        quantity,
        delivery_type,
        unit_price,
        total
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      product_name,
      category || 'Sem categoria',
      size,
      quantity,
      delivery_type,
      unit_price,
      total,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'Pedido registrado!',
        id: this.lastID,
      });
    }
  );
});

app.get('/dashboard', async (req, res) => {
  try {
    const pages = await dbAll(`
      SELECT
        page_name,
        COUNT(*) as views,
        AVG(render_time_ms) as avg_render_time
      FROM page_views
      GROUP BY page_name
      ORDER BY views DESC
    `);

    const buttons = await dbAll(`
      SELECT
        button_name,
        COUNT(*) as clicks
      FROM button_clicks
      GROUP BY button_name
      ORDER BY clicks DESC
    `);

    const summary = await dbGet(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_ticket,
        COALESCE(AVG(quantity), 0) as avg_quantity
      FROM orders
    `);

    const bestProduct = await dbGet(`
      SELECT
        product_name,
        SUM(quantity) as total_quantity
      FROM orders
      GROUP BY product_name
      ORDER BY total_quantity DESC
      LIMIT 1
    `);

    const topSize = await dbGet(`
      SELECT
        size,
        COUNT(*) as total
      FROM orders
      GROUP BY size
      ORDER BY total DESC
      LIMIT 1
    `);

    const topDelivery = await dbGet(`
      SELECT
        delivery_type,
        COUNT(*) as total
      FROM orders
      GROUP BY delivery_type
      ORDER BY total DESC
      LIMIT 1
    `);

    const ordersByProduct = await dbAll(`
      SELECT
        product_name,
        category,
        COUNT(*) as orders,
        SUM(quantity) as quantity,
        SUM(total) as revenue
      FROM orders
      GROUP BY product_name, category
      ORDER BY quantity DESC
    `);

    const ordersBySize = await dbAll(`
      SELECT
        size,
        COUNT(*) as orders,
        SUM(quantity) as quantity,
        SUM(total) as revenue
      FROM orders
      GROUP BY size
      ORDER BY orders DESC
    `);

    const ordersByDeliveryType = await dbAll(`
      SELECT
        delivery_type,
        COUNT(*) as orders,
        SUM(quantity) as quantity,
        SUM(total) as revenue
      FROM orders
      GROUP BY delivery_type
      ORDER BY orders DESC
    `);

    const revenueByProduct = await dbAll(`
      SELECT
        product_name,
        SUM(total) as revenue
      FROM orders
      GROUP BY product_name
      ORDER BY revenue DESC
    `);

    const ordersByCategory = await dbAll(`
      SELECT
        category,
        COUNT(*) as orders,
        SUM(quantity) as quantity,
        SUM(total) as revenue
      FROM orders
      GROUP BY category
      ORDER BY orders DESC
    `);

    const recentOrders = await dbAll(`
      SELECT
        id,
        product_name,
        category,
        size,
        quantity,
        delivery_type,
        unit_price,
        total,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `);

    res.json({
      pages,
      buttons,
      summary: {
        total_orders: summary.total_orders || 0,
        total_revenue: summary.total_revenue || 0,
        avg_ticket: summary.avg_ticket || 0,
        avg_quantity: summary.avg_quantity || 0,
        best_product: bestProduct ? bestProduct.product_name : 'Nenhum',
        top_size: topSize ? topSize.size : 'Nenhum',
        top_delivery: topDelivery ? topDelivery.delivery_type : 'Nenhum',
      },
      ordersByProduct,
      ordersBySize,
      ordersByDeliveryType,
      revenueByProduct,
      ordersByCategory,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.delete('/analytics/clear', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM page_views');
    db.run('DELETE FROM button_clicks');
    db.run('DELETE FROM orders', function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: 'Dados limpos com sucesso!',
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta http://localhost:${PORT}`);
});