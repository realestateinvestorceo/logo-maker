-- Logo Explorer & Review Tool — Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE projects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  company_brief          JSONB NOT NULL DEFAULT '{}',
  existing_logo_analysis JSONB,
  competitor_analysis    JSONB,
  selected_directions    TEXT[],
  phase_progress         INTEGER NOT NULL DEFAULT 1,
  share_token            TEXT UNIQUE,
  winner_logo_id         UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_share_token ON projects(share_token);

CREATE TABLE directions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  name           TEXT NOT NULL,
  rationale      TEXT NOT NULL,
  style_keywords TEXT[],
  color_palette  JSONB,
  selected       BOOLEAN NOT NULL DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_directions_project ON directions(project_id);

CREATE TABLE logos (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id             UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  direction_id           UUID REFERENCES directions(id),
  parent_logo_id         UUID REFERENCES logos(id),
  storage_path           TEXT NOT NULL,
  thumbnail_path         TEXT,
  prompt                 TEXT NOT NULL,
  style_levers           JSONB NOT NULL DEFAULT '{}',
  generation_type        TEXT NOT NULL DEFAULT 'initial',
  refinement_instruction TEXT,
  scores                 JSONB,
  favicon_test           JSONB,
  accessibility          JSONB,
  mockups                JSONB,
  is_favorite            BOOLEAN NOT NULL DEFAULT false,
  is_archived            BOOLEAN NOT NULL DEFAULT false,
  branch_depth           INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logos_project ON logos(project_id);
CREATE INDEX idx_logos_direction ON logos(direction_id);
CREATE INDEX idx_logos_parent ON logos(parent_logo_id);

CREATE TABLE boss_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  logo_id       UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  reaction      TEXT CHECK (reaction IN ('thumbs_up', 'thumbs_down', 'star')),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boss_feedback_project ON boss_feedback(project_id);
CREATE INDEX idx_boss_feedback_logo ON boss_feedback(logo_id);

CREATE TABLE export_packages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  logo_id    UUID NOT NULL REFERENCES logos(id),
  assets     JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- For this single-user app, we use service_role key for all writes
-- from serverless functions. RLS is configured to allow:
-- 1. Anonymous read access to shared projects (for boss review)
-- 2. Anonymous feedback submission (for boss review)

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_packages ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so serverless functions work unrestricted.
-- These policies are for anon (browser) access only.

-- Projects: allow read if share_token exists (boss review page)
CREATE POLICY "Allow public read of shared projects"
  ON projects FOR SELECT TO anon
  USING (share_token IS NOT NULL);

-- Directions: allow read for shared projects
CREATE POLICY "Allow public read of directions for shared projects"
  ON directions FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = directions.project_id
      AND projects.share_token IS NOT NULL
    )
  );

-- Logos: allow read for shared projects
CREATE POLICY "Allow public read of logos for shared projects"
  ON logos FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = logos.project_id
      AND projects.share_token IS NOT NULL
    )
  );

-- Boss feedback: allow insert from anyone (anonymous reviewers)
CREATE POLICY "Allow anonymous feedback submission"
  ON boss_feedback FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boss_feedback.project_id
      AND projects.share_token IS NOT NULL
    )
  );

-- Boss feedback: allow read for shared projects
CREATE POLICY "Allow public read of feedback for shared projects"
  ON boss_feedback FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boss_feedback.project_id
      AND projects.share_token IS NOT NULL
    )
  );

-- Export packages: no anon access needed
CREATE POLICY "No anon access to exports"
  ON export_packages FOR SELECT TO anon
  USING (false);
