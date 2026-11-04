import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  sector: string;
  type: string;
  template_id: string | null;
  outline: unknown;
  contents: Record<string, string>;
  custom_titles: Record<string, string>;
  document_type: string;
  language: string;
  service_description: string | null;
  phase1_answers: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type NewProject = Pick<ProjectRecord, "name" | "sector"> &
  Partial<Omit<ProjectRecord, "id" | "user_id" | "name" | "sector" | "created_at" | "updated_at" | "deleted_at">>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) throw new Error("You must be signed in to access projects.");

  const response = await fetch(`${API_URL}/api/projects${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || `Project request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const listProjects = (includeDeleted = false) =>
  request<ProjectRecord[]>(includeDeleted ? "?includeDeleted=true" : "");

export const createProject = (project: NewProject) =>
  request<ProjectRecord>("", { method: "POST", body: JSON.stringify(project) });

export const updateProject = (projectId: string, updates: Partial<NewProject>) =>
  request<ProjectRecord>(`/${encodeURIComponent(projectId)}`, { method: "PATCH", body: JSON.stringify(updates) });

export const deleteProject = (projectId: string) =>
  request<ProjectRecord>(`/${encodeURIComponent(projectId)}`, { method: "DELETE" });

export const restoreProject = (projectId: string) =>
  request<ProjectRecord>(`/${encodeURIComponent(projectId)}/restore`, { method: "POST" });
