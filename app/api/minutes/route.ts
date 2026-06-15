import { createClient } from '@/lib/supabase/server'
import { draftMinutes } from '@/lib/claude/minutes'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { meetingId } = await req.json()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', meetingId).eq('user_id', user.id).single()
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

  const { data: transcriptRow } = await supabase.from('transcripts').select('raw_text').eq('meeting_id', meetingId).single()
  if (!transcriptRow?.raw_text) return NextResponse.json({ error: 'No transcript found' }, { status: 400 })

  let minutes
  try {
    minutes = await draftMinutes(
      meeting.title,
      meeting.meeting_date,
      meeting.duration_mins,
      meeting.attendees || [],
      transcriptRow.raw_text
    )
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Claude API error: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 502 })
  }

  await supabase.from('minutes').upsert({
    meeting_id: meetingId,
    user_id: user.id,
    agenda: minutes.agenda,
    discussion: minutes.discussion,
    decisions: Array.isArray(minutes.decisions) ? minutes.decisions.join('\n') : minutes.decisions,
    actions: minutes.actions,
    next_steps: Array.isArray(minutes.next_steps) ? minutes.next_steps.join('\n') : minutes.next_steps,
  }, { onConflict: 'meeting_id' })

  return NextResponse.json({ minutes })
}
