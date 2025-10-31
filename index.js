// index.js
import express from 'express';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Extract Pool from pg package
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- PostgreSQL setup ---
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: { rejectUnauthorized: false }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Application successfully shutdown');
  process.exit(0);
});

// Serve static React build files
app.use(express.static(path.join(__dirname, 'dist')));

// Example API route
app.get('/api/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teammembers;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Catch-all route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
