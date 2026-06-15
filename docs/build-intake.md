# MJW Meeting OS — Build Intake

**Date:** 15 June 2026
**Status:** Approved — implementation in progress

## Approved build

| Field | Value |
|---|---|
| Product name | MJW Meeting OS |
| Build type | Personal Meeting Operating System |
| Target user | Single user (MJW Environment) |
| Decision purpose | Full meeting lifecycle management |
| Risk class | High |
| Stack | Next.js 14 · Supabase · Vercel · Claude API |

## Scope confirmed

- Pre-meeting: Google Calendar pull, AI brief generation
- During meeting: Web Speech API live transcription + file import
- Post-meeting: Claude drafts minutes, user edits, manual send via Gmail
- Archive: Searchable history, re-send, Drive save

## Data sources

- Google Calendar API v3 (read-only)
- Gmail API (send only)
- Google Drive API v3 (file create)
- Supabase PostgreSQL (5 tables)
- Claude API claude-sonnet-4-6

## Non-negotiables confirmed

- No auto-send. Manual send only. Always.
- No auto-save to Drive. Manual only.
- Transcripts append-only. Never overwrite.
- Minutes: Claude drafts, user edits, user approves.
- RLS on all tables.
- No secrets committed to git.

## Deployment path

GitHub (private) → Vercel (auto-deploy on merge to main)
