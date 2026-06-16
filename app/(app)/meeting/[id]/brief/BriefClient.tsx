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
  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState('')
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Brief generation failed')
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

  const dateStr = new Date(meeting.meeting_date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/')}
            style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </button>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--slate)' }}>Pre-Meeting Brief</p>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em' }}>{meeting.title}</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--slate)' }}>
            {dateStr}
            {meeting.attendees?.length > 0 && (
              <span className="before:content-['·'] before:mx-2 before:text-white/20">
                {meeting.attendees.join(', ')}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={startMeeting}
          className="shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
          Start meeting
        </button>
      </div>

      {/* Empty state */}
      {!brief && !manualMode && (
        <div style={{ borderRadius: 12, border: '1px solid rgba(236,232,221,0.1)', background: 'var(--ink2)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AI option */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid rgba(236,232,221,0.08)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(90,127,214,0.1)', border: '1px solid rgba(90,127,214,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--blue-lt)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper)', margin: '0 0 4px' }}>Generate AI Brief</p>
              <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}>Uses OpenAI to create context, agenda and questions. Requires OpenAI credits.</p>
            </div>
            <button onClick={generateBrief} disabled={loading} style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', background: 'rgba(90,127,214,0.15)', border: '1px solid rgba(90,127,214,0.3)', borderRadius: 8, padding: '9px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Generating…' : 'Generate with AI'}
            </button>
            {error && <p style={{ fontSize: 12, color: '#e05c5c', margin: 0, maxWidth: '100%', wordBreak: 'break-word' }}>{error}</p>}
          </div>

          {/* Manual option */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,162,75,0.08)', border: '1px solid rgba(201,162,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper)', margin: '0 0 4px' }}>Paste Your Own Brief</p>
              <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}>Run your meeting context through Claude or ChatGPT, then paste the result here.</p>
            </div>
            <button onClick={() => setManualMode(true)} style={{ fontSize: 13, fontWeight: 600, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer' }}>
              Paste Brief Manually
            </button>
          </div>
        </div>
      )}

      {/* Manual paste mode */}
      {!brief && manualMode && (
        <div style={{ borderRadius: 12, border: '1px solid rgba(201,162,75,0.25)', background: 'var(--ink2)', padding: '24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', marginBottom: 4 }}>Paste your brief below</p>
          <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 16 }}>Copy your brief from Claude or ChatGPT and paste it here. It will be saved as your meeting context.</p>
          <textarea value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Paste your AI-generated brief here…" rows={14} style={{ width: '100%', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 8, padding: '12px 14px', color: 'var(--paper)', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => { setBrief({ context_summary: manualText, agenda_draft: [], questions_to_raise: [], watch_points: [] }) }} disabled={!manualText.trim()} style={{ fontSize: 13, fontWeight: 600, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer' }}>Save Brief</button>
            <button onClick={() => setManualMode(false)} style={{ fontSize: 13, color: 'var(--slate)', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer' }}>Back</button>
          </div>
        </div>
      )}

      {/* Brief content */}
      {brief && (
        <div className="space-y-3">
          <BriefSection
            title="Context"
            icon={<ContextIcon />}
            color="indigo"
          >
            <p className="text-white/65 text-sm leading-relaxed">{brief.context_summary}</p>
          </BriefSection>

          <BriefSection
            title="Agenda Draft"
            icon={<AgendaIcon />}
            color="purple"
          >
            <ol className="space-y-2">
              {brief.agenda_draft.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/65">
                  <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </BriefSection>

          {brief.questions_to_raise?.length > 0 && (
            <BriefSection title="Questions to Raise" icon={<QuestionsIcon />} color="blue">
              <ul className="space-y-2">
                {brief.questions_to_raise.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/65">
                    <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </BriefSection>
          )}

          {brief.watch_points?.length > 0 && (
            <BriefSection title="Watch Points" icon={<WatchIcon />} color="amber">
              <ul className="space-y-2">
                {brief.watch_points.map((w, i) => (
                  <li key={i} className="flex gap-3 text-sm text-amber-300/80">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </BriefSection>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={generateBrief}
              disabled={loading}
              className="bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 text-sm px-4 py-2.5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
            >
              {loading ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BriefSection({
  title, icon, color, children,
}: {
  title: string; icon: React.ReactNode; color: 'indigo' | 'purple' | 'blue' | 'amber'; children: React.ReactNode
}) {
  const colors = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/15',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/15',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/15',
  }
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center border ${colors[color]}`}>
          {icon}
        </span>
        <h3 className="text-xs font-bold tracking-widest text-white/35 uppercase">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ContextIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}

function AgendaIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function QuestionsIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  )
}

function WatchIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    </svg>
  )
}
