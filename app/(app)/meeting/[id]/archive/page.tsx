import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MeetingArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) notFound()

  const { data: minutes } = await supabase.from('minutes').select('*').eq('meeting_id', id).single()
  const { data: transcript } = await supabase.from('transcripts').select('raw_text').eq('meeting_id', id).single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Archive</p>
          <h1 className="text-xl font-semibold text-white">{meeting.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {meeting.attendees?.length > 0 && ` · ${meeting.attendees.join(', ')}`}
            {minutes?.sent_at && ` · Sent ${new Date(minutes.sent_at).toLocaleDateString()}`}
          </p>
        </div>
        <Link
          href={`/meeting/${id}/minutes`}
          className="shrink-0 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Re-send minutes
        </Link>
      </div>

      {minutes && (
        <div className="space-y-4">
          <Section title="Agenda">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{minutes.agenda || '—'}</p>
          </Section>
          <Section title="Discussion Summary">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{minutes.discussion || '—'}</p>
          </Section>
          <Section title="Decisions Made">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{minutes.decisions || '—'}</p>
          </Section>
          {minutes.actions && minutes.actions.length > 0 && (
            <Section title="Action Items">
              <div className="space-y-2">
                {(minutes.actions as { item: string; owner: string; due_date: string }[]).map((a, i) => (
                  <div key={i} className="flex gap-4 text-sm">
                    <span className="text-gray-300 flex-1">{a.item}</span>
                    <span className="text-gray-500 shrink-0">{a.owner}</span>
                    <span className="text-gray-500 shrink-0">{a.due_date}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          <Section title="Next Steps">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{minutes.next_steps || '—'}</p>
          </Section>
        </div>
      )}

      {transcript?.raw_text && (
        <details className="group">
          <summary className="text-xs font-semibold tracking-widest text-gray-500 uppercase cursor-pointer hover:text-gray-300 transition-colors">
            Transcript ▸
          </summary>
          <div className="mt-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{transcript.raw_text}</p>
          </div>
        </details>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">{title}</h3>
      {children}
    </div>
  )
}
