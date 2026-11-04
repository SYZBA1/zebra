ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS projects_deleted_by_user_idx
  ON public.projects (user_id, deleted_at DESC)
  WHERE deleted_at IS NOT NULL;
