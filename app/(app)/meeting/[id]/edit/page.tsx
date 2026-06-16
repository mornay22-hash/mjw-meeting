'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

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

export default function EditMeetingPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [agendaItems, setAgendaItems] = useState<string[]>([''])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [attendees, setAttendees] = useState('')
  const [description, setDescription] = useState('')
  const [objectives, setObjectives] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.from('meetings').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      const dt = new Date(data.meeting_date)
      setTitle(data.title || '')
      setDate(dt.toISOString().split('T')[0])
      setTime(`${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`)
      setAttendees((data.attendees || []).join(', '))
      setDescription(data.description || '')
      setObjectives(data.objectives || '')
      setAgendaItems(data.agenda_items?.length ? data.agenda_items : [''])
      setReady(true)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const meeting_date = new Date(`${date}T${time}`).toISOString()
    const attendeesArr = attendees.split(',').map(a => a.trim()).filter(Boolean)
    const agenda_items = agendaItems.filter(Boolean)
    const { error: err } = await supabase.from('meetings').update({ title, meeting_date, attendees: attendeesArr, description, objectives, agenda_items }).eq('id', id)
    if (err) { setError(err.message); setLoading(false); return }
    router.back()
  }

  async function handleDelete() {
    if (!confirm('Delete this meeting permanently? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('meetings').delete().eq('id', id)
    router.push('/calendar')
  }

  if (!ready) return <div style={{ color: 'var(--slate)', fontSize: 13, padding: 40 }}>Loading…</div>

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em', marginBottom: 4 }}>Edit Meeting</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionDivider label="Meeting Details" />

        <div>
          <label style={labelStyle}>Meeting Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Attendees <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--slate-dk)' }}>optional</span></label>
          <input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="John Smith, Jane Doe" style={inputStyle} />
        </div>

        <SectionDivider label="Context" />

        <div>
          <label style={labelStyle}>Purpose & Background</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        <div>
          <label style={labelStyle}>Objectives & Desired Outcomes</label>
          <textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Agenda Items</label>
            <button type="button" onClick={() => setAgendaItems(p => [...p, ''])} style={{ fontSize: 11, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add item</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {agendaItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--slate-dk)', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                <input value={item} onChange={e => setAgendaItems(p => p.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Agenda item ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                {agendaItems.length > 1 && (
                  <button type="button" onClick={() => setAgendaItems(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-dk)', padding: 4 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 10, padding: '12px 16px' }}><p style={{ fontSize: 13, color: '#e05c5c' }}>{error}</p></div>}

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={handleDelete} disabled={deleting} style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.25)', color: '#e05c5c', fontSize: 13, padding: '11px 20px', borderRadius: 10, cursor: 'pointer' }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', fontSize: 13, fontWeight: 500, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ flex: 2, background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}>
            {loading ? 'Saving…' : 'Save Changes'}
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
