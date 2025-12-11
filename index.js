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

// Get kiosk items
app.get('/api/kiosk/items', async (_req, res) => {
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
        ic.category_id,
        i.contains_dairy,
        i.contains_gluten
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


app.get('/api/admin/items', async (_req, res) => {
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
        i.seasonal_item_beginning_time,
        i.seasonal_item_ending_time,
        i.category_id,
        c.name AS category_name,
        i.contains_dairy,
        i.contains_gluten,

        /* 👇 true if ANY ingredient for this item has supply_level <= 0 */
        EXISTS (
          SELECT 1
          FROM item_ingredient ii
          JOIN ingredient ing ON ing.ingredient_id = ii.ingredient_id
          WHERE ii.item_id = i.item_id
            AND ing.supply_level <= 0
        ) AS has_oos_ingredient

      FROM Item i
      LEFT JOIN Item_Category c ON i.category_id = c.category_id
      ORDER BY i.item_id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load items' });
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

// Ingredient Categories 
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


// Create orders
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();

  try {
    const { customerId, employeeId, items, totalCost, tax, tip } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    // Calculate total usage per ingredient
    const usageByIngredient = new Map();


    for (const [ingredientId, totalUsed] of usageByIngredient.entries()) {
      const { rows } = await client.query(
        'SELECT supply_level, ingredient_name FROM ingredient WHERE ingredient_id = $1',
        [ingredientId]
      );

      if (!rows.length) {
        console.error('Ingredient missing in DB:', ingredientId);
        throw new Error(`Ingredient ID ${ingredientId} not found`);
      }

      const { supply_level, ingredient_name } = rows[0];

      console.log(
        'Checking stock for ingredient:',
        { ingredientId, ingredient_name, supply_level, totalUsed }
      );

      if (supply_level < totalUsed) {
        console.warn(
          `Out of stock: ${ingredient_name} (have ${supply_level}, need ${totalUsed})`
        );
        return res.status(400).json({
          error: `Not enough stock for ingredient: ${ingredient_name}`,
        });
      }
    }

    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      if (!qty) continue;

      // Base ingredients
      const { rows: baseIngredients } = await client.query(
        'SELECT ingredient_id FROM item_ingredient WHERE item_id = $1',
        [item.item_id]
      );
      baseIngredients.forEach(({ ingredient_id }) => {
        usageByIngredient.set(ingredient_id, (usageByIngredient.get(ingredient_id) || 0) + qty);
      });

      // Extras
      if (Array.isArray(item.extras)) {
        item.extras.forEach(extra => {
          const ingId = typeof extra === 'number' ? extra : extra?.ingredient_id;
          if (!ingId) return;
          const extraQty = Number(extra.quantity) || 1;
          usageByIngredient.set(ingId, (usageByIngredient.get(ingId) || 0) + qty * extraQty);
        });
      }
    }

    // Check stock before inserting anything
    for (const [ingredientId, totalUsed] of usageByIngredient.entries()) {
      const { rows } = await client.query(
        'SELECT supply_level, ingredient_name FROM ingredient WHERE ingredient_id = $1',
        [ingredientId]
      );

      if (!rows.length) throw new Error(`Ingredient ID ${ingredientId} not found`);
      if (rows[0].supply_level < totalUsed) {
        return res.status(400).json({
          error: `Not enough stock for ingredient: ${rows[0].ingredient_name}`,
        });
      }
    }

    // Insert order and items
    await client.query('BEGIN');

    const orderResult = await client.query(
      `
      INSERT INTO customer_order (time_ordered, total_cost, tax, tip, customer_id, employee_id)
      VALUES (NOW(), $1, $2, $3, $4, $5)
      RETURNING order_id;
      `,
      [totalCost, tax, tip, customerId || null, employeeId || null]
    );

    const orderId = orderResult.rows[0].order_id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (order_id, item_id, quantity, subtotal)
        VALUES ($1, $2, $3, $4);
        `,
        [orderId, item.item_id, item.quantity, item.subtotal]
      );
    }

    // Deduct ingredient stock
    for (const [ingredientId, totalUsed] of usageByIngredient.entries()) {
      await client.query(
        `
        UPDATE ingredient
        SET supply_level = supply_level - $1
        WHERE ingredient_id = $2;
        `,
        [totalUsed, ingredientId]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});




  // Fetch employee data
  app.get('/api/employees', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM employee ORDER BY employee_id ASC'
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
      const { first_name, last_name, ismanager } = req.body;

      const result = await pool.query(
        `INSERT INTO Employee (first_name, last_name, ismanager)
        VALUES ($1, $2, $3)
        RETURNING first_name, last_name, ismanager`,
        [first_name, last_name, ismanager]
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

  app.patch('/api/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, ismanager } = req.body;

      if (!first_name || !last_name || typeof ismanager !== 'boolean') {
        return res
          .status(400)
          .json({ error: 'first_name, last_name, and ismanager (boolean) are required' });
      }

      const result = await pool.query(
        `
        UPDATE Employee
        SET first_name = $1,
            last_name  = $2,
            ismanager  = $3
        WHERE employee_id = $4
        RETURNING employee_id, first_name, last_name, ismanager;
        `,
        [first_name, last_name, ismanager, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating employee:', err);
      res.status(500).json({ error: 'Failed to update employee' });
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

  
// Fixed UPDATE route
// UPDATE route
// /api/updatemenu/updateitem/:name/:id/:price/:availability/:sizes/:photo/:seasonal/:start/:end/:category/:contains_dairy/:contains_gluten
app.get(
  '/api/updatemenu/updateitem/:name/:id/:price/:availability/:sizes/:photo/:seasonal/:start/:end/:category/:contains_dairy/:contains_gluten',
  async (req, res) => {
    const {
      name,
      id,
      price,
      availability,
      sizes,
      photo,
      seasonal,
      start,
      end,
      category,
      contains_dairy,
      contains_gluten,
    } = req.params;

    console.log('UPDATE item hit:', req.path, req.params);

    const containsDairyBool =
      contains_dairy === 'true' || contains_dairy === '1';
    const containsGlutenBool =
      contains_gluten === 'true' || contains_gluten === '1';

    try {
      await pool.query(
        `
        UPDATE Item
        SET
          item_name  = $1,
          item_cost  = $2,
          in_stock   = $3,
          size_options = $4,
          photo      = $5,
          seasonal_item = $6,
          seasonal_item_beginning_time = $7,
          seasonal_item_ending_time    = $8,
          category_id = $9,
          contains_dairy  = $10,
          contains_gluten = $11
        WHERE item_id = $12
        `,
        [
          name,
          price,
          availability === 'true',
          sizes,
          photo,
          seasonal === 'true',
          start,
          end,
          category || null,
          containsDairyBool,
          containsGlutenBool,
          id,
        ]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('UPDATE item error:', err);
      res.status(500).send('Failed to update item');
    }
  }
);



// Fixed CREATE route
app.get(
  '/api/updatemenu/createnewitem/:name/:id/:price/:availability/:sizes/:photo/:seasonal/:start/:end/:category/:contains_dairy/:contains_gluten',
  async (req, res) => {
    const {
      name,
      id,
      price,
      availability,
      sizes,
      photo,
      seasonal,
      start,
      end,
      category,
      contains_dairy,
      contains_gluten,
    } = req.params;

    console.log('CREATE item hit:', req.path, req.params);

    const containsDairyBool =
      contains_dairy === 'true' || contains_dairy === '1';
    const containsGlutenBool =
      contains_gluten === 'true' || contains_gluten === '1';

    try {
      await pool.query(
        `
        INSERT INTO Item (
          item_id, item_name, item_cost, in_stock, size_options, photo,
          seasonal_item, seasonal_item_beginning_time, seasonal_item_ending_time,
          category_id, contains_dairy, contains_gluten
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
        [
          id,
          name,
          price,
          availability === 'true',
          sizes,
          photo,
          seasonal === 'true',
          start,
          end,
          category || null,
          containsDairyBool,
          containsGlutenBool,
        ]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('CREATE item error:', err);
      res.status(500).send('Failed to create item');
    }
  }
);

  app.get('/api/updatemenu/deleteitem/:itemId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { itemId } = req.params;

    await client.query('BEGIN');

    // 1) Remove ingredient links
    await client.query(
      'DELETE FROM item_ingredient WHERE item_id = $1;',
      [itemId]
    );

    // 2) Remove order_items rows that reference this item (if your schema has this FK)
    await client.query(
      'DELETE FROM order_items WHERE item_id = $1;',
      [itemId]
    );

    // 3) Delete the item itself
    const result = await client.query(
      'DELETE FROM item WHERE item_id = $1 RETURNING *;',
      [itemId]
    );

    await client.query('COMMIT');

    res.json(result.rows); 
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  } finally {
    client.release();
  }
});


app.get('/api/orders/recent', async (req, res) => {
  const defaultLimit = 10;
  const rawLimit = req.query.limit;
  let limit = defaultLimit;

  if (rawLimit !== undefined) {
    const parsed = Number(rawLimit);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) {
      limit = parsed;
    }
  }

  const sql = `
    SELECT
      o.order_id,
      o.time_ordered AS order_date,
      o.total_cost,
      COALESCE(SUM(oi.quantity), 0) AS item_count
    FROM customer_order o
    LEFT JOIN order_items oi
      ON o.order_id = oi.order_id
    GROUP BY o.order_id, o.time_ordered, o.total_cost
    ORDER BY o.time_ordered DESC
    LIMIT $1;
  `;

  try {
    const { rows } = await pool.query(sql, [limit]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recent orders:', err);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});




  app.get('/api/inventorypage/ingredients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.ingredient_id,
        i.ingredient_name,
        i.supply_level,
        i.expiration_date,
        i.ingredient_cost,
        i.vendor,
        i.category_id,
        ic.name AS ingredient_category_name
      FROM ingredient i
      LEFT JOIN ingredient_category ic ON i.category_id = ic.category_id
      ORDER BY i.ingredient_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
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

  // Update ingredient BY ID (better for editing + renaming)
app.patch('/api/inventorypage/ingredients/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const {
      ingredient_name,
      supply_level,
      expiration_date,
      ingredient_cost,
      vendor,
      category_id,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE ingredient
      SET
        ingredient_name = COALESCE($2, ingredient_name),
        supply_level    = COALESCE($3, supply_level),
        expiration_date = COALESCE($4, expiration_date),
        ingredient_cost = COALESCE($5, ingredient_cost),
        vendor          = COALESCE($6, vendor),
        category_id     = COALESCE($7, category_id)
      WHERE ingredient_id = $1
      RETURNING *;
      `,
      [
        ingredientId,
        ingredient_name ?? null,
        supply_level ?? null,
        expiration_date ?? null,
        ingredient_cost ?? null,
        vendor ?? null,
        category_id ?? null,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating ingredient by ID:', err);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

app.post('/api/inventorypage/ingredients', async (req, res) => {
  try {
    const {
      ingredient_name,
      supply_level,
      expiration_date,
      ingredient_cost,
      vendor,
      category_id,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO ingredient (
        ingredient_name,
        supply_level,
        expiration_date,
        ingredient_cost,
        vendor,
        category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ingredient_id,
                ingredient_name,
                supply_level,
                expiration_date,
                ingredient_cost,
                vendor,
                category_id
      `,
      [
        ingredient_name,
        supply_level,
        expiration_date,
        ingredient_cost,
        vendor,
        category_id ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    res.status(500).json({ error: "Failed to create ingredient" });
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

app.get('/api/salesreport/by-date-range', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }
  
      const result = await pool.query(
        `
        SELECT
          time_ordered::date AS sale_date,
          COALESCE(SUM(total_cost), 0) AS total_sales
        FROM customer_order
        WHERE time_ordered >= $1
          AND time_ordered < ($2::date + INTERVAL '1 day')
        GROUP BY sale_date
        ORDER BY sale_date
      `,
      [startDate, endDate]
    );
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching sales by date range:', err);
      res.status(500).json({ error: 'Failed to fetch sales by date range' });
    }
  });

  app.get("/api/inventoryusage/by-date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate are required" });
      }
  
      const result = await pool.query(
        `
          SELECT 
            ing.ingredient_id,
            ing.ingredient_name,
            COALESCE(SUM(oi.quantity), 0) AS total_items_using_ingredient
          FROM order_items oi
          JOIN customer_order co ON oi.order_id = co.order_id
          JOIN item_ingredient ii ON oi.item_id = ii.item_id
          JOIN ingredient ing ON ii.ingredient_id = ing.ingredient_id
          WHERE co.time_ordered >= $1::date
            AND co.time_ordered <  $2::date + INTERVAL '1 day'
          GROUP BY ing.ingredient_id, ing.ingredient_name
          ORDER BY ing.ingredient_id;
        `,
        [startDate, endDate]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching inventory usage by date range:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch inventory usage by date range" });
    }
  });

// Get ingredients for a specific item
app.get('/api/items/:id/ingredients', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT ii.ingredient_id, ing.ingredient_name
      FROM item_ingredient ii
      JOIN ingredient ing ON ing.ingredient_id = ii.ingredient_id
      WHERE ii.item_id = $1
      ORDER BY ing.ingredient_name
      `,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching item ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch item ingredients' });
  }
});

// Replace all ingredients for an item
app.post('/api/items/:id/ingredients', async (req, res) => {
  const { id } = req.params;
  const { ingredient_ids } = req.body; // array of integers

  if (!Array.isArray(ingredient_ids)) {
    return res.status(400).json({ error: 'ingredient_ids must be an array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // remove old mappings
    await client.query(
      'DELETE FROM item_ingredient WHERE item_id = $1',
      [id]
    );

    // insert new mappings
    if (ingredient_ids.length > 0) {
      const values = ingredient_ids
        .map((_, idx) => `($1, $${idx + 2})`)
        .join(', ');

      await client.query(
        `INSERT INTO item_ingredient (item_id, ingredient_id) VALUES ${values}`,
        [id, ...ingredient_ids]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating item ingredients:', err);
    res.status(500).json({ error: 'Failed to update item ingredients' });
  } finally {
    client.release();
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
