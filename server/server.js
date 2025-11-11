import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// GET item by ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM item WHERE item_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE item
app.put("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { item_cost, in_stock } = req.body;
    await pool.query(
      "UPDATE item SET item_cost = $1, in_stock = $2 WHERE item_id = $3",
      [item_cost, in_stock, id]
    );
    res.json({ message: "Item updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD new item
app.post("/api/items", async (req, res) => {
  try {
    const { item_name, item_cost, in_stock } = req.body;
    await pool.query(
      "INSERT INTO item (item_name, item_cost, in_stock) VALUES ($1, $2, $3)",
      [item_name, item_cost, in_stock]
    );
    res.json({ message: "Item added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
