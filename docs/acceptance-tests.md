# MJW Meeting OS — Acceptance Tests

All 17 tests must pass before production deployment.

| # | Test | Steps | Pass condition | Status |
|---|---|---|---|---|
| 1 | Login | Open app · click Sign in with Google · complete OAuth | Redirected to Home · session persists on refresh | Not tested |
| 2 | Auth guard | Open /archive without session | Redirected to /login | Not tested |
| 3 | Calendar pull | Login · open Home | Today's and upcoming meetings appear from Google Calendar | Not tested |
| 4 | Manual meeting | Click New Meeting · fill form · save | Meeting appears in list · row created in Supabase | Not tested |
| 5 | Pre-meeting brief | Tap meeting · open Brief | AI generates context summary · agenda draft · watch points | Not tested |
| 6 | Live transcription | Open Meeting Room · click Start · speak · click Stop | Text appears in real time · saved to transcript table | Not tested |
| 7 | Transcript import | Open Meeting Room · click Import · upload .txt | Text parsed and displayed · saved to transcript table | Not tested |
| 8 | Flag decision | In Meeting Room · select transcript segment · click Decision | Segment flagged · appears in decisions panel | Not tested |
| 9 | Minutes draft | End meeting · Claude drafts minutes | Structured JSON returned · all five sections populated | Not tested |
| 10 | Minutes edit | Edit decisions field · change action owner | Changes persist · no data loss on refresh | Not tested |
| 11 | Send minutes | Add recipient email · click Send | Preview shown · confirm · Gmail sends · sent_at recorded | Not tested |
| 12 | Drive save | After send · click Save to Drive | File appears in Google Drive under correct folder | Not tested |
| 13 | Archive search | Open Archive · type meeting title | Filtered results appear instantly | Not tested |
| 14 | Re-send | Open archived meeting · click Re-send | Gmail send flow opens with previous draft | Not tested |
| 15 | RLS check | Attempt direct Supabase query with anon key | Returns no rows | Not tested |
| 16 | Mobile layout | Open on phone browser | All screens usable · buttons tappable · no clipped UI | Not tested |
| 17 | Auth guard (API) | Call /api/minutes without session | Returns 401 | Not tested |

## Run order

Phase 1 complete: Tests 1, 2
Phase 2 complete: Tests 3, 4
Phase 3 complete: Tests 6, 7
Phase 4 complete: Tests 5, 9, 10, 11, 12
Phase 5 complete: Tests 13, 14
Full build: Tests 15, 16, 17
