import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.url,
  user: process.env.user,
  password: process.env.password,
});
