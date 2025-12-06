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

// // Ingredients
// app.get('/api/ingredients', async (_req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         ingredient_ID,
//         ingredient_name,
//         supply_level,
//         expiration_date,
//         ingredient_cost,
//         vendor,
//         category_id
//       FROM Ingredient
//       ORDER BY ingredient_name
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching ingredients:', err);
//     res.status(500).json({ error: 'Failed to fetch ingredients' });
//   }
// });


// Ingredients (with category name)
app.get('/api/ingredients', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.ingredient_ID,
        i.ingredient_name,
        i.supply_level,
        i.expiration_date,
        i.ingredient_cost,
        i.vendor,
        i.category_id,
        ic.name AS ingredient_category_name
      FROM Ingredient i
      LEFT JOIN Ingredient_Category ic ON i.category_id = ic.category_id
      ORDER BY ic.name, i.ingredient_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Ingredient Categories (optional)
app.get('/api/ingredient-categories', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT category_id AS ingredient_category_id, name AS ingredient_category_name
      FROM Ingredient_Category
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ingredient categories:', err);
    res.status(500).json({ error: 'Failed to fetch ingredient categories' });
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

  // Fetch employee data
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

  // Create employee
  app.post('/api/employees', async (req, res) => {
    try {
      const { employee_id, first_name, last_name, ismanager } = req.body;

      const result = await pool.query(
        `INSERT INTO Employee (employee_id, first_name, last_name, ismanager)
        VALUES ($1, $2, $3, $4)
        RETURNING employee_id, first_name, last_name, ismanager`,
        [employee_id, first_name, last_name, ismanager]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error creating employee:', err);
      res.status(500).json({ error: 'Failed to create employee' });
    }
  });

  // Delete employee
  app.delete('/api/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query(`DELETE FROM Employee WHERE employee_id = $1`, [id]);

      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting employee:', err);
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  });

  // Update employee
  app.patch('/api/employees/:id/manager', async (req, res) => {
    try {
      const { id } = req.params;
      const { ismanager } = req.body;

      const result = await pool.query(
        `UPDATE Employee
        SET ismanager = $1
        WHERE employee_id = $2
        RETURNING employee_id, first_name, last_name, ismanager`,
        [ismanager, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating manager status:', err);
      res.status(500).json({ error: 'Failed to update manager status' });
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

  app.get('/api/updatemenu/createnewitem/:newItemName/:newItemId/:newItemPrice/:newItemIsAvailable/:newItemSizes/:newItemPhotoPath/:newItemIsSeasonal/:newItemSeasonalTimeBegin/:newItemSeasonalTimeEnd/:newItemCategory', async (req, res) => {
    try {
      const { newItemName, newItemId, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd, newItemCategory} = req.params;
      const result = await pool.query(`INSERT INTO Item (item_ID, item_name, item_cost, in_stock, size_options, photo, seasonal_item, seasonal_item_beginning_time, seasonal_item_ending_time, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [newItemId, newItemName, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd, newItemCategory]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

  app.get('/api/updatemenu/updateitem/:newItemName/:newItemId/:newItemPrice/:newItemIsAvailable/:newItemSizes/:newItemPhotoPath/:newItemIsSeasonal/:newItemSeasonalTimeBegin/:newItemSeasonalTimeEnd', async (req, res) => {
    try {
      const { newItemName, newItemId, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd,  } = req.params;
      //const result = await pool.query(`UPDATE ingredient SET ingredient_name = $1, supply_level = $2, expiration_date = $3, ingredient_cost = $4, vendor = $5 WHERE ingredient_id = $6 RETURNING *;`,
      const result = await pool.query(`UPDATE item SET item_name = $1, item_cost = $2, in_stock = $3, size_options = $4, photo = $5, seasonal_item = $6, seasonal_item_beginning_time = $7, seasonal_item_ending_time = $8 WHERE item_id = $9 RETURNING *;`,
      [newItemName, newItemPrice, newItemIsAvailable, newItemSizes, newItemPhotoPath, newItemIsSeasonal, newItemSeasonalTimeBegin, newItemSeasonalTimeEnd, newItemId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

  app.get('/api/updatemenu/deleteitem/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      const result = await pool.query(`DELETE FROM item WHERE item_id = $1;`, [itemId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get ingedient data' });
    }
  });


  app.get('/api/inventorypage/viewingredientdata/:ingredientName', async (req, res) => {
    try {
      const { ingredientName } = req.params;
      const result = await pool.query(`SELECT * FROM ingredient WHERE ingredient_name = $1;`, [ingredientName]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching ingedient data:', err);
      res.status(500).json({ error: 'Failed to get ingedient data' });
    }
  });

  app.get('/api/inventorypage/createnewingredient/:newIngredientId/:newIngredientName/:newIngredientSupply/:newIngredientExpirationDate/:newIngredientCost/:newIngredientVendor', async (req, res) => {
    try {
      const { newIngredientId, newIngredientName, newIngredientSupply, newIngredientExpirationDate, newIngredientCost, newIngredientVendor } = req.params;
      const result = await pool.query(`INSERT INTO ingredient (ingredient_id, ingredient_name, supply_level, expiration_date, ingredient_cost, vendor) VALUES ($1, $2, $3, $4, $5, $6)`,
      [newIngredientId, newIngredientName, newIngredientSupply, newIngredientExpirationDate, newIngredientCost, newIngredientVendor]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

  app.get('/api/inventorypage/updateingredient/:newIngredientId/:newIngredientName/:newIngredientSupply/:newIngredientExpirationDate/:newIngredientCost/:newIngredientVendor', async (req, res) => {
    try {
      const { newIngredientId, newIngredientName, newIngredientSupply, newIngredientExpirationDate, newIngredientCost, newIngredientVendor } = req.params;
      const result = await pool.query(`UPDATE ingredient SET ingredient_name = $1, supply_level = $2, expiration_date = $3, ingredient_cost = $4, vendor = $5 WHERE ingredient_id = $6 RETURNING *;`,
      [newIngredientName, newIngredientSupply, newIngredientExpirationDate, newIngredientCost, newIngredientVendor, newIngredientId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching item data:', err);
      res.status(500).json({ error: 'Failed to get item data' });
    }
  });

  app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  });


  app.get('/api/inventorypage/deleteingredient/:ingredientId', async (req, res) => {
    try {
      const { ingredientId } = req.params;
      const result = await pool.query(`DELETE FROM ingredient WHERE ingredient_id = $1;`, [ingredientId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching ingedient data:', err);
      res.status(500).json({ error: 'Failed to get ingedient data' });
    }
  });

  app.get('/api/sales/by-date/:currentDate', async (req, res) => {
    try {
      const { currentDate } = req.params;

      const result = await pool.query(
        `
          SELECT COALESCE(SUM(total_cost), 0) AS total_cost
          FROM customer_order
          WHERE time_ordered::date = $1
        `,
        [currentDate]
      );

      res.json(result.rows);

    } catch (err) {
      console.error('Error fetching sales by date:', err);
      res.status(500).json({ error: 'Failed to fetch total sales SQL' });
    }
  });

  app.get('/api/totalOrders/by-date/:currentDate', async (req, res) => {
    try {
      const { currentDate } = req.params;
  
      const result = await pool.query(
        `
          SELECT COALESCE(COUNT(order_id), 0) AS total_orders
          FROM customer_order
          WHERE time_ordered::date = $1
        `,
        [currentDate]
      );
  
      res.json(result.rows);
  
    } catch (err) {
      console.error('Error fetching orders by date:', err);
      res.status(500).json({ error: 'Failed to fetch total orders SQL' });
    }
  });

  
  
  app.get('/api/hourlySales/by-date/:currentDate', async (req, res) => {
    try {
      const { currentDate } = req.params;
  
      const result = await pool.query(
        `
          SELECT EXTRACT(HOUR FROM time_ordered) AS hour,
          COALESCE(SUM(total_cost), 0) AS total_sales
          FROM customer_order
          WHERE time_ordered::date = $1
            AND EXTRACT(HOUR FROM time_ordered) BETWEEN 8 AND 21
          GROUP BY hour
          ORDER BY hour
        `,
        [currentDate]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching hourly sales:', err);
      res.status(500).json({ error: 'Failed to fetch hourly sales' });
    }
  });

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
