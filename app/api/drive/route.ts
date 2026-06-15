import { createClient, createServiceClient } from '@/lib/supabase/server'
import { saveMinutesToDrive } from '@/lib/google/drive'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { meetingId } = await req.json()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', meetingId).eq('user_id', user.id).single()
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

  const { data: minutes } = await supabase.from('minutes').select('*').eq('meeting_id', meetingId).single()
  if (!minutes) return NextResponse.json({ error: 'No minutes found' }, { status: 400 })

  const serviceSupabase = await createServiceClient()
  const { data: tokenRow } = await serviceSupabase.from('user_tokens').select('access_token').eq('id', user.id).single()
  if (!tokenRow?.access_token) {
    return NextResponse.json({ error: 'Google token missing. Please re-authenticate.' }, { status: 401 })
  }

  const content = minutes.full_draft || [
    `MJW Meeting OS — ${meeting.title}`,
    `Date: ${new Date(meeting.meeting_date).toLocaleDateString()}`,
    '',
    'AGENDA', minutes.agenda || '—',
    '', 'DISCUSSION', minutes.discussion || '—',
    '', 'DECISIONS', minutes.decisions || '—',
    '', 'NEXT STEPS', minutes.next_steps || '—',
  ].join('\n')

  let fileId: string
  try {
    fileId = await saveMinutesToDrive(tokenRow.access_token, meeting.title, meeting.meeting_date, content)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Drive save failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 502 })
  }

  await supabase.from('minutes').update({ drive_file_id: fileId }).eq('id', minutes.id)

  return NextResponse.json({ fileId })
}
