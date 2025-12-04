// index.js
// hello :D
import express from 'express';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PostgreSQL setup ---
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Application successfully shutdown');
  process.exit(0);
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// -------------------- API Routes --------------------

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT category_id, name FROM Item_Category ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Items
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.item_id,
        i.item_name,
        i.item_cost,
        i.in_stock,
        i.size_options,
        i.photo,
        i.seasonal_item,
        ic.name as category_name,
        ic.category_id
      FROM Item i
      LEFT JOIN Item_Category ic ON i.category_id = ic.category_id
      WHERE i.in_stock = true
      ORDER BY ic.name, i.item_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(`
      SELECT 
        i.item_id,
        i.item_name,
        i.item_cost,
        i.in_stock,
        i.size_options,
        i.photo,
        i.seasonal_item
      FROM Item i
      WHERE i.category_id = $1 AND i.in_stock = true
      ORDER BY i.item_name
    `, [categoryId]);
  res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items by category:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { customerId, employeeId, items, totalCost, tax, tip } = req.body;
    
    // Insert order
    const orderResult = await client.query(`
      INSERT INTO Customer_Order (time_ordered, total_cost, tax, tip, customer_id, employee_id)
      VALUES (NOW(), $1, $2, $3, $4, $5)
      RETURNING order_id
    `, [totalCost, tax, tip, customerId || null, employeeId || null]);
    
    const orderId = orderResult.rows[0].order_id;
    
    // Insert order items
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, item_id, quantity, subtotal)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.item_id, item.quantity, item.subtotal]);
    }
    
    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Employees
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT employee_id, first_name, last_name, ismanager FROM Employee ORDER BY first_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Update menu routes
app.get('/api/updatemenu/viewitemdata/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await pool.query(`SELECT * FROM Item WHERE item_ID = $1;`, [itemId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching item data:', err);
    res.status(500).json({ error: 'Failed to get item data' });
  }
});

app.get('/api/updatemenu/updateitemprice/:itemId/:itemPrice', async (req, res) => {
  try {
    const { itemId, itemPrice } = req.params;
    const result = await pool.query(
      `UPDATE Item SET item_cost = $1 WHERE item_ID = $2;`,
      [itemPrice, itemId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching item data:', err);
    res.status(500).json({ error: 'Failed to get item data' });
  }
});

app.get('/api/updatemenu/createnewitem/:newItemName/:newItemId/:newItemPrice/:newItemIsAvailable/:newItemSizes/:newItemPhotoPath/:newItemIsSeasonal/:newItemSeasonalTimeBegin/:newItemSeasonalTimeEnd', async (req, res) => {
  try {
    const {
      newItemName,
      newItemId,
      newItemPrice,
      newItemIsAvailable,
      newItemSizes,
      newItemPhotoPath,
      newItemIsSeasonal,
      newItemSeasonalTimeBegin,
      newItemSeasonalTimeEnd
    } = req.params;

    const result = await pool.query(
      `INSERT INTO Item (
        item_ID,
        item_name,
        item_cost,
        in_stock,
        size_options,
        photo,
        seasonal_item,
        seasonal_item_beginning_time,
        seasonal_item_ending_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`,
      [
        newItemId,
        newItemName,
        newItemPrice,
        newItemIsAvailable,
        newItemSizes,
        newItemPhotoPath,
        newItemIsSeasonal,
        newItemSeasonalTimeBegin,
        newItemSeasonalTimeEnd
      ]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching item data:', err);
    res.status(500).json({ error: 'Failed to get item data' });
  }
});

// ---------- NEW: X/Z Report Analytics ----------
app.get('/api/analytics/xz-report', async (req, res) => {
  const { date, mode = 'z', hour } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing 'date' query param (yyyy-MM-dd)" });
  }

  try {
    // Parse yyyy-MM-dd into JS Date at UTC midnight
    const [year, month, day] = String(date).split('-').map(Number);
    if (!year || !month || !day) {
      return res.status(400).json({ error: 'Invalid date format. Use yyyy-MM-dd.' });
    }

    const startTime = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    let endTime;
    if (mode === 'x' && hour !== undefined) {
      // X-report: from midnight up to selected hour+1 (like original Java)
      const h = Number(hour);
      if (Number.isNaN(h) || h < 0 || h > 23) {
        return res.status(400).json({ error: 'Invalid hour. Must be between 0–23.' });
      }
      endTime = new Date(Date.UTC(year, month - 1, day, h + 1, 0, 0));
    } else {
      // Z-report: full day [00:00, next day 00:00)
      endTime = new Date(startTime);
      endTime.setUTCDate(endTime.getUTCDate() + 1);
    }

    const client = await pool.connect();

    try {
      // Totals: sales, orders, tips
      const salesResult = await client.query(
        `
          SELECT SUM(total_cost) AS total_cost
          FROM Customer_Order
          WHERE time_ordered >= $1 AND time_ordered < $2
        `,
        [startTime, endTime]
      );

      const ordersResult = await client.query(
        `
          SELECT COUNT(order_id) AS total_orders
          FROM Customer_Order
          WHERE time_ordered >= $1 AND time_ordered < $2
        `,
        [startTime, endTime]
      );

      const tipsResult = await client.query(
        `
          SELECT SUM(tip) AS total_tips
          FROM Customer_Order
          WHERE time_ordered >= $1 AND time_ordered < $2
        `,
        [startTime, endTime]
      );

      // Hourly sales
      const hourlyResult = await client.query(
        `
          SELECT EXTRACT(HOUR FROM time_ordered) AS hour, SUM(total_cost) AS total_sales
          FROM Customer_Order
          WHERE time_ordered >= $1 AND time_ordered < $2
          GROUP BY hour
          ORDER BY hour
        `,
        [startTime, endTime]
      );

      const totalSales = Number(salesResult.rows[0]?.total_cost ?? 0);
      const totalOrders = Number(ordersResult.rows[0]?.total_orders ?? 0);
      const totalTips = Number(tipsResult.rows[0]?.total_tips ?? 0);

      const hourlySales = hourlyResult.rows.map((row) => ({
        hour: Number(row.hour),
        totalSales: Number(row.total_sales),
      }));

      res.json({
        totals: {
          totalSales,
          totalOrders,
          totalTips,
        },
        hourlySales,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error generating X/Z report:', err);
    res.status(500).json({ error: 'Server error generating X/Z report' });
  }
});

// 404 handler for unknown /api routes, otherwise serve SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
