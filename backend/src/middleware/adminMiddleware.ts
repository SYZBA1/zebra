import { Request, Response, NextFunction } from "express";
import pool from "../lib/db";

/**
 * Requires authMiddleware to run first (req.user must be set).
 * Checks user_roles table for the 'admin' role.
 * Returns 403 if the user is not an admin.
 */
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT role FROM user_roles WHERE user_id = $1 AND role = $2 LIMIT 1",
      [req.user.id, "admin"]
    );

    if (result.rowCount === 0) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (err) {
    console.error("adminMiddleware error:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
}
