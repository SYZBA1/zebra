import { Router, Request, Response } from "express";
import pool from "../lib/db";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

const jsonFields = new Set(["outline", "contents", "custom_titles", "phase1_answers"]);
const textFields = new Set([
  "name",
  "sector",
  "type",
  "template_id",
  "document_type",
  "language",
  "service_description",
]);
const allowedFields = new Set([...textFields, ...jsonFields]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateProjectFields(body: unknown, partial: boolean): string | null {
  if (!isRecord(body)) return "Request body must be an object";
  if (!partial) {
    const name = body.name;
    const sector = body.sector;
    if (typeof name !== "string" || typeof sector !== "string") {
      return "name and sector are required";
    }
    if (!name.trim() || !sector.trim()) {
      return "name and sector cannot be empty";
    }
  }

  for (const [field, value] of Object.entries(body)) {
    if (!allowedFields.has(field)) return `Unsupported project field: ${field}`;
    if (textFields.has(field) && value === null && field !== "template_id" && field !== "service_description") {
      return `${field} cannot be null`;
    }
    if (textFields.has(field) && value !== null && typeof value !== "string") {
      return `${field} must be a string`;
    }
    if (jsonFields.has(field) && value === null && field !== "phase1_answers") {
      return `${field} cannot be null`;
    }
    if (jsonFields.has(field) && value !== null && typeof value !== "object") {
      return `${field} must be a JSON object or array`;
    }
    if ((field === "name" || field === "sector") && typeof value === "string" && !value.trim()) {
      return `${field} cannot be empty`;
    }
  }
  return null;
}

router.get("/projects", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    const { rows } = await pool.query(
      `SELECT * FROM public.projects
       WHERE user_id = $1 AND ($2::boolean OR deleted_at IS NULL)
       ORDER BY (deleted_at IS NOT NULL), updated_at DESC`,
      [req.user!.id, includeDeleted]
    );
    res.json(rows);
  } catch (error) {
    console.error("Failed to load projects:", error);
    res.status(500).json({ error: "Failed to load projects" });
  }
});

router.post("/projects", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const validationError = validateProjectFields(req.body, false);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const body = req.body as Record<string, unknown>;
    const { rows } = await pool.query(
      `INSERT INTO public.projects
        (user_id, name, sector, type, template_id, outline, contents, custom_titles,
         document_type, language, service_description, phase1_answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user!.id,
        body.name,
        body.sector,
        body.type ?? "scratch",
        body.template_id ?? null,
        body.outline ?? [],
        body.contents ?? {},
        body.custom_titles ?? {},
        body.document_type ?? "feasibility",
        body.language ?? "en",
        body.service_description ?? "",
        body.phase1_answers ?? {},
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Failed to create project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/projects/:projectId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  const validationError = validateProjectFields(req.body, true);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const fields = Object.keys(req.body as Record<string, unknown>);
  if (fields.length === 0) {
    res.status(400).json({ error: "At least one project field is required" });
    return;
  }

  try {
    const values: unknown[] = [projectId, req.user!.id];
    const assignments = fields.map((field) => {
      values.push((req.body as Record<string, unknown>)[field]);
      return `${field} = $${values.length}`;
    });
    const { rows } = await pool.query(
      `UPDATE public.projects
       SET ${assignments.join(", ")}, updated_at = now()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to update project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:projectId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE public.projects
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [projectId, req.user!.id]
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to move project to Recently Deleted:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.post("/projects/:projectId/restore", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE public.projects
       SET deleted_at = NULL, updated_at = now()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL
       RETURNING *`,
      [projectId, req.user!.id]
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Deleted project not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to restore project:", error);
    res.status(500).json({ error: "Failed to restore project" });
  }
});

export default router;
