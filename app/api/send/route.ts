import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/google/gmail'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { meetingId, recipients } = await req.json()
  if (!recipients?.length) return NextResponse.json({ error: 'No recipients' }, { status: 400 })

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', meetingId).eq('user_id', user.id).single()
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

  const { data: minutes } = await supabase.from('minutes').select('*').eq('meeting_id', meetingId).single()
  if (!minutes) return NextResponse.json({ error: 'No minutes to send' }, { status: 400 })

  // Get Google access token
  const serviceSupabase = await createServiceClient()
  const { data: tokenRow } = await serviceSupabase.from('user_tokens').select('access_token').eq('id', user.id).single()
  if (!tokenRow?.access_token) {
    return NextResponse.json({ error: 'Google token missing. Please re-authenticate.' }, { status: 401 })
  }

  const subject = `MJW Meeting OS — ${meeting.title} — ${new Date(meeting.meeting_date).toLocaleDateString()}`

  const actions = (minutes.actions || []) as { item: string; owner: string; due_date: string }[]
  const body = [
    `MJW Meeting OS — ${meeting.title}`,
    `Date: ${new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Attendees: ${meeting.attendees?.join(', ') || '—'}`,
    '',
    'AGENDA',
    minutes.agenda || '—',
    '',
    'DISCUSSION SUMMARY',
    minutes.discussion || '—',
    '',
    'DECISIONS MADE',
    minutes.decisions || '—',
    '',
    'ACTION ITEMS',
    actions.length > 0
      ? actions.map(a => `• ${a.item} — ${a.owner} (${a.due_date})`).join('\n')
      : '—',
    '',
    'NEXT STEPS',
    minutes.next_steps || '—',
    '',
    '—',
    'MJW Meeting OS — No Noise. Just Signal.',
  ].join('\n')

  try {
    await sendEmail(tokenRow.access_token, recipients, subject, body)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Gmail send failed. Draft preserved. Error: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 502 })
  }

  await supabase.from('minutes').update({
    sent_at: new Date().toISOString(),
    sent_to: recipients,
  }).eq('id', minutes.id)

  return NextResponse.json({ ok: true })
}
