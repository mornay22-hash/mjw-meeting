# CLAUDE.md — MJW Meeting OS

## Product
MJW Meeting OS — full meeting lifecycle: pre · live · post · archive.
Single user. Responsive web. No noise. Just signal.

## Stack
Next.js 14 App Router · Supabase Auth + DB + Storage
Claude API (claude-sonnet-4-6) · Google Calendar + Gmail + Drive APIs
Tailwind CSS · Vercel · GitHub

## Non-negotiables
- Do not auto-send emails. Manual send only. Always.
- Do not overwrite existing transcript or minutes without explicit user action.
- Do not touch Drive without user clicking Save.
- RLS enabled on all tables. Verify before any schema change.
- Do not commit secrets. All keys in Vercel env vars only.
- Do not rebuild working screens unless explicitly approved.
- Verify current state before touching files.
- Do not code before build intake is complete.
- Do not run migrations before impact and rollback are approved.

## Data rules
- Transcripts: append-only during live session. Never overwrite.
- Minutes: Claude drafts first. User edits. User approves. Then save/send.
- Drive structure: MJW Meeting OS/YYYY/YYYY-MM-DD — Title/

## Security
- Google tokens stored encrypted in user_tokens table.
- Service role key: server-side only. Never in client bundle.
- All API routes validate session before processing.
- Auth uses Supabase Auth with Google OAuth provider (not NextAuth).

## Four phases
1. Pre-Meeting — Calendar pull · AI brief · agenda draft
2. During Meeting — Live mic transcription (Web Speech API) or file import
3. Post-Meeting — Claude drafts minutes · user edits · manual send
4. Archive — Searchable history · re-send · re-open

## Testing
- npm run dev · npm run build · npm run lint
- Test on mobile browser before marking any phase complete.
- Confirm Drive and Gmail on staging before production.

## Stop and escalation rules
| Trigger | Action |
|---|---|
| Google token missing or expired | STOP. Show re-auth prompt. Do not proceed with API call. |
| Claude API returns malformed JSON | STOP. Show error. Do not save partial minutes. |
| Drive save fails | STOP. Show error. Do not mark meeting as archived. |
| Gmail send fails | STOP. Show error. Preserve draft. Do not mark as sent. |
| RLS policy missing on new table | STOP. Add policy before any data operation. |
| Schema change required mid-build | STOP. Write migration. Review impact. Get approval. |

## Build phases
- Phase 1: Foundation (repo · Supabase · auth · Vercel) — IN PROGRESS
- Phase 2: Home + Calendar pull
- Phase 3: Meeting Room (mic transcription + import)
- Phase 4: Minutes + Send + Drive save
- Phase 5: Archive
