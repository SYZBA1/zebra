import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const useSsl = process.env.DATABASE_SSL !== "false";
const sslConfig = useSsl
  ? { rejectUnauthorized: process.env.DATABASE_TLS_REJECT_UNAUTHORIZED !== "false" }
  : false;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export default pool;
