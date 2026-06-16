'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const inputStyle = {
  width: '100%',
  background: 'var(--ink3)',
  border: '1px solid rgba(236,232,221,0.1)',
  borderRadius: 10,
  padding: '10px 14px',
  color: 'var(--paper)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'var(--slate)',
  marginBottom: 6,
}

export default function NewMeetingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agendaItems, setAgendaItems] = useState<string[]>([''])

  function addAgendaItem() {
    setAgendaItems(prev => [...prev, ''])
  }
  function updateAgendaItem(i: number, val: string) {
    setAgendaItems(prev => prev.map((item, idx) => idx === i ? val : item))
  }
  function removeAgendaItem(i: number) {
    setAgendaItems(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    const title = data.get('title') as string
    const date = data.get('date') as string
    const time = data.get('time') as string
    const attendeesRaw = data.get('attendees') as string
    const description = data.get('description') as string
    const objectives = data.get('objectives') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const meeting_date = new Date(`${date}T${time}`).toISOString()
    const attendees = attendeesRaw.split(',').map(a => a.trim()).filter(Boolean)
    const agenda_items = agendaItems.filter(Boolean)

    const { data: meeting, error: err } = await supabase
      .from('meetings')
      .insert({ title, meeting_date, attendees, user_id: user.id, status: 'pre', description, objectives, agenda_items })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/meeting/${meeting.id}/brief`)
  }

  const now = new Date()
  const defaultDate = now.toISOString().split('T')[0]
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:00`

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dashboard
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em', marginBottom: 4 }}>
          New Meeting
        </h1>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Fill in the details — the more context you provide, the better the AI brief.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Section: Basics */}
        <SectionDivider label="Meeting Details" />

        <div>
          <label style={labelStyle}>Meeting Title *</label>
          <input name="title" required placeholder="e.g. Q3 Strategy Review" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" name="date" defaultValue={defaultDate} required style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" name="time" defaultValue={defaultTime} required style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Attendees <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--slate-dk)' }}>optional</span></label>
          <input name="attendees" placeholder="John Smith, Jane Doe  —  separate with commas" style={inputStyle} />
        </div>

        {/* Section: Context for AI */}
        <SectionDivider label="Context for AI Brief" />

        <div>
          <label style={labelStyle}>Purpose & Background</label>
          <textarea
            name="description"
            rows={3}
            placeholder="What is this meeting about? Include any relevant background, history, or context the AI should know…"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        <div>
          <label style={labelStyle}>Objectives & Desired Outcomes</label>
          <textarea
            name="objectives"
            rows={2}
            placeholder="What must be achieved or decided in this meeting?"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Agenda Items</label>
            <button
              type="button"
              onClick={addAgendaItem}
              style={{ fontSize: 11, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add item
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {agendaItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--slate-dk)', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                <input
                  value={item}
                  onChange={e => updateAgendaItem(i, e.target.value)}
                  placeholder={`Agenda item ${i + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {agendaItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-dk)', flexShrink: 0, padding: 4 }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#e05c5c' }}>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ flex: 1, background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', fontSize: 13, fontWeight: 500, padding: '11px', borderRadius: 10, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 2, background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}
          >
            {loading ? 'Creating…' : 'Create Meeting & Generate Brief'}
          </button>
        </div>
      </form>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-jetbrains-mono, monospace)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(201,162,75,0.15)' }} />
    </div>
  )
}
