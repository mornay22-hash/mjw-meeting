'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Meeting, Brief, BriefJSON } from '@/types'

export default function BriefClient({
  meeting,
  existingBrief,
}: {
  meeting: Meeting
  existingBrief: Brief | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState<BriefJSON | null>(
    existingBrief
      ? {
          context_summary: existingBrief.context_summary || '',
          agenda_draft: JSON.parse(existingBrief.agenda_draft || '[]'),
          questions_to_raise: [],
          watch_points: [],
        }
      : null
  )
  const [error, setError] = useState('')

  async function generateBrief() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      })
      if (!res.ok) throw new Error('Brief generation failed')
      const data = await res.json()
      setBrief(data.brief)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate brief')
    }
    setLoading(false)
  }

  async function startMeeting() {
    const supabase = createClient()
    await supabase.from('meetings').update({ status: 'live' }).eq('id', meeting.id)
    router.push(`/meeting/${meeting.id}/live`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Pre-Meeting Brief</p>
          <h1 className="text-xl font-semibold text-white">{meeting.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            {meeting.attendees?.length > 0 && ` · ${meeting.attendees.join(', ')}`}
          </p>
        </div>
        <button
          onClick={startMeeting}
          className="shrink-0 bg-green-700 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Start meeting →
        </button>
      </div>

      {!brief && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center space-y-4">
          <p className="text-gray-400 text-sm">Generate an AI brief for this meeting</p>
          <button
            onClick={generateBrief}
            disabled={loading}
            className="bg-white text-gray-900 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate brief'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          <Section title="Context">
            <p className="text-gray-300 text-sm leading-relaxed">{brief.context_summary}</p>
          </Section>

          <Section title="Agenda draft">
            <ol className="space-y-1">
              {brief.agenda_draft.map((item, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-gray-600 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Section>

          {brief.questions_to_raise?.length > 0 && (
            <Section title="Questions to raise">
              <ul className="space-y-1">
                {brief.questions_to_raise.map((q, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-gray-600 shrink-0">·</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {brief.watch_points?.length > 0 && (
            <Section title="Watch points">
              <ul className="space-y-1">
                {brief.watch_points.map((w, i) => (
                  <li key={i} className="text-sm text-yellow-300 flex gap-2">
                    <span className="text-yellow-600 shrink-0">⚠</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={generateBrief}
              disabled={loading}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        </div>
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
