CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'scratch',
  template_id TEXT,
  outline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  contents JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_titles JSONB NOT NULL DEFAULT '{}'::jsonb,
  document_type TEXT NOT NULL DEFAULT 'feasibility',
  language TEXT NOT NULL DEFAULT 'en',
  service_description TEXT DEFAULT '',
  phase1_answers JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS projects_user_updated_idx
  ON public.projects (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS projects_deleted_by_user_idx
  ON public.projects (user_id, deleted_at DESC)
  WHERE deleted_at IS NOT NULL;
