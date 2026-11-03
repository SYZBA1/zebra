import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
    }
  }
}

/**
 * Verifies the Supabase JWT from the Authorization: Bearer header.
 * Attaches req.user = { id, email } on success.
 * Returns 401 if missing or invalid.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header required" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    // Create client inside handler so env vars are guaranteed loaded
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
}
