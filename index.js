  // index.js
  import express from 'express';
  import path from 'path';
  import pg from 'pg';
  import dotenv from 'dotenv';
  import cors from 'cors';
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
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'dist'))); 

  // API Routes
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
      const result = await pool.query(`UPDATE Item SET item_cost = $1 WHERE item_ID = $2;`, [itemPrice, itemId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

  app.get('/api/updatemenu/createnewitem/:newItemName/:newItemId/:newItemPrice/:newItemIsAvailable/:newItemSizes/:newItemPhotoPath/:newItemIsSeasonal/:newItemSeasonalTimeBegin/:newItemSeasonalTimeEnd', async (req, res) => {
    try {
      const { newItemName, newItemId, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd,  } = req.params;
      const result = await pool.query(`INSERT INTO Item (item_ID, item_name, item_cost, in_stock, size_options, photo, seasonal_item, seasonal_item_beginning_time, seasonal_item_ending_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [newItemName, newItemId, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


  app.listen(port, () => {
    console.log(`pool connected to database: ${process.env.PSQL_DATABASE}`);
    console.log(`Server running on http://localhost:${port}`);
  });
