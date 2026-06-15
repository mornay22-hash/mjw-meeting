-- MJW Meeting OS — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- meetings
CREATE TABLE IF NOT EXISTS meetings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  title           text NOT NULL,
  meeting_date    timestamptz NOT NULL,
  attendees       text[],
  duration_mins   integer,
  calendar_event_id text,
  status          text DEFAULT 'pre' CHECK (status IN ('pre','live','post','archived')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- transcripts
CREATE TABLE IF NOT EXISTS transcripts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      uuid REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users NOT NULL,
  source          text CHECK (source IN ('mic','import')),
  raw_text        text,
  storage_path    text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(meeting_id)
);

-- minutes
CREATE TABLE IF NOT EXISTS minutes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      uuid REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users NOT NULL,
  agenda          text,
  discussion      text,
  decisions       text,
  actions         jsonb,
  next_steps      text,
  full_draft      text,
  sent_at         timestamptz,
  sent_to         text[],
  drive_file_id   text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(meeting_id)
);

-- briefs
CREATE TABLE IF NOT EXISTS briefs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      uuid REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users NOT NULL,
  context_summary text,
  agenda_draft    text,
  past_actions    jsonb,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(meeting_id)
);

-- user_tokens (stores Google OAuth tokens)
CREATE TABLE IF NOT EXISTS user_tokens (
  id              uuid PRIMARY KEY REFERENCES auth.users,
  access_token    text,
  refresh_token   text,
  expires_at      timestamptz,
  updated_at      timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies — user owns their rows
CREATE POLICY "User owns their meetings"
  ON meetings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User owns their transcripts"
  ON transcripts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User owns their minutes"
  ON minutes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User owns their briefs"
  ON briefs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User owns their tokens"
  ON user_tokens FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER minutes_updated_at BEFORE UPDATE ON minutes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_tokens_updated_at BEFORE UPDATE ON user_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
