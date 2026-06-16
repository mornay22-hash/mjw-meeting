import { createClient } from '@/lib/supabase/server'
import { generateBrief } from '@/lib/claude/brief'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { meetingId } = await req.json()

  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single()
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

  let brief
  try {
    brief = await generateBrief(
      meeting.title,
      meeting.meeting_date,
      meeting.attendees || [],
      meeting.description || '',
      meeting.objectives || '',
      meeting.agenda_items || []
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[/api/brief] OpenAI error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  await supabase.from('briefs').upsert({
    meeting_id: meetingId,
    user_id: user.id,
    context_summary: brief.context_summary,
    agenda_draft: JSON.stringify(brief.agenda_draft),
    past_actions: null,
  }, { onConflict: 'meeting_id' })

  return NextResponse.json({ brief })
}
