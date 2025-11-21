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

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Application successfully shutdown');
  process.exit(0);
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve front-end for all non-API routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- API Routes ---

// Categories
app.get('/api/categories', async (_req, res) => {
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
app.get('/api/items', async (_req, res) => {
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

// Items by category
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

// Ingredients (new route for Misc)
app.get('/api/ingredients', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ingredient_id,
        ingredient_name,
        ingredient_count,
        expiration_date,
        per_unit_cost,
        vendor_name,
        ingredient_category_id
      FROM Ingredient
      ORDER BY ingredient_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Employees
app.get('/api/employees', async (_req, res) => {
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

// Create orders
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

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
