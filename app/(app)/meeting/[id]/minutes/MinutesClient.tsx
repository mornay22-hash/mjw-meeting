'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Meeting, Minutes, ActionItem } from '@/types'

export default function MinutesClient({
  meeting,
  existingMinutes,
  hasTranscript,
}: {
  meeting: Meeting
  existingMinutes: Minutes | null
  hasTranscript: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [drafting, setDrafting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [agenda, setAgenda] = useState(existingMinutes?.agenda || '')
  const [discussion, setDiscussion] = useState(existingMinutes?.discussion || '')
  const [decisions, setDecisions] = useState(existingMinutes?.decisions || '')
  const [actions, setActions] = useState<ActionItem[]>(existingMinutes?.actions || [])
  const [nextSteps, setNextSteps] = useState(existingMinutes?.next_steps || '')

  async function draftMinutes() {
    setDrafting(true)
    setError('')
    try {
      const res = await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      })
      if (!res.ok) throw new Error('Draft failed')
      const data = await res.json()
      const m = data.minutes
      setAgenda(m.agenda || '')
      setDiscussion(m.discussion || '')
      setDecisions(Array.isArray(m.decisions) ? m.decisions.join('\n') : m.decisions || '')
      setActions(m.actions || [])
      setNextSteps(Array.isArray(m.next_steps) ? m.next_steps.join('\n') : m.next_steps || '')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Draft failed')
    }
    setDrafting(false)
  }

  async function saveMinutes() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error: err } = await supabase.from('minutes').upsert({
        meeting_id: meeting.id,
        user_id: user.id,
        agenda,
        discussion,
        decisions,
        actions,
        next_steps: nextSteps,
      }, { onConflict: 'meeting_id' })
      if (err) throw err
      setSavedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    } catch {
      setError('Save failed. Please try again.')
    }
    setSaving(false)
  }

  function downloadPDF() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const dateStr = new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    printWindow.document.write(`
      <!DOCTYPE html><html><head>
      <title>Minutes — ${meeting.title}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 13px; line-height: 1.7; }
        h1 { font-size: 22px; font-weight: 400; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 6px; }
        .meta { color: #666; font-size: 12px; margin-bottom: 32px; }
        h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; margin: 28px 0 8px; font-family: Arial, sans-serif; }
        p, pre { margin: 0 0 8px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        th { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 8px; color: #888; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
        td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
        @media print { body { margin: 20px; } }
      </style>
      </head><body>
      <h1>${meeting.title}</h1>
      <div class="meta">${dateStr}${meeting.attendees?.length ? ' &nbsp;·&nbsp; ' + meeting.attendees.join(', ') : ''}</div>
      ${agenda ? `<h2>Agenda</h2><p>${agenda}</p>` : ''}
      ${discussion ? `<h2>Discussion Summary</h2><p>${discussion}</p>` : ''}
      ${decisions ? `<h2>Decisions Made</h2><p>${decisions}</p>` : ''}
      ${actions.length > 0 ? `<h2>Action Items</h2>
        <table><tr><th>Action</th><th>Owner</th><th>Due</th></tr>
        ${actions.map(a => `<tr><td>${a.item}</td><td>${a.owner}</td><td>${a.due_date}</td></tr>`).join('')}
        </table>` : ''}
      ${nextSteps ? `<h2>Next Steps</h2><p>${nextSteps}</p>` : ''}
      </body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 400)
  }

  function downloadWord() {
    const dateStr = new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const actionRows = actions.map(a =>
      `<tr><td style="border:1px solid #ccc;padding:6px">${a.item}</td><td style="border:1px solid #ccc;padding:6px">${a.owner}</td><td style="border:1px solid #ccc;padding:6px">${a.due_date}</td></tr>`
    ).join('')

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Minutes</title>
      <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; margin: 1cm; }
        h1 { font-size: 18pt; font-weight: bold; border-bottom: 1pt solid #999; padding-bottom: 6pt; }
        .meta { color: #666; font-size: 10pt; margin-bottom: 20pt; }
        h2 { font-size: 9pt; text-transform: uppercase; letter-spacing: 2pt; color: #888; margin-top: 16pt; }
        p { font-size: 11pt; white-space: pre-wrap; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f0f0f0; border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left; }
      </style>
      </head><body>
      <h1>${meeting.title}</h1>
      <div class="meta">${dateStr}${meeting.attendees?.length ? ' · ' + meeting.attendees.join(', ') : ''}</div>
      ${agenda ? `<h2>Agenda</h2><p>${agenda}</p>` : ''}
      ${discussion ? `<h2>Discussion Summary</h2><p>${discussion}</p>` : ''}
      ${decisions ? `<h2>Decisions Made</h2><p>${decisions}</p>` : ''}
      ${actions.length > 0 ? `<h2>Action Items</h2>
        <table><tr><th>Action</th><th>Owner</th><th>Due</th></tr>${actionRows}</table>` : ''}
      ${nextSteps ? `<h2>Next Steps</h2><p>${nextSteps}</p>` : ''}
      </body></html>
    `
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Minutes.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  function updateAction(i: number, field: keyof ActionItem, value: string) {
    setActions(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a))
  }
  function addAction() {
    setActions(prev => [...prev, { item: '', owner: '', due_date: '' }])
  }
  function removeAction(i: number) {
    setActions(prev => prev.filter((_, idx) => idx !== i))
  }

  const hasDraft = agenda || discussion || decisions || actions.length > 0
  const dateStr = new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

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
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--slate)', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono, monospace)', marginBottom: 8 }}>Meeting Minutes</p>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em' }}>{meeting.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
            {dateStr}
            {meeting.attendees?.length > 0 && <span style={{ marginLeft: 8, color: 'var(--slate-dk)' }}>· {meeting.attendees.join(', ')}</span>}
          </p>
        </div>
        {!hasDraft && hasTranscript && (
          <button
            onClick={draftMinutes}
            disabled={drafting}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))', color: '#000', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: drafting ? 'not-allowed' : 'pointer', opacity: drafting ? 0.7 : 1 }}
          >
            {drafting ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Drafting…</>
            ) : 'Draft with AI'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: '#e05c5c' }}>{error}</p>
        </div>
      )}

      {/* No transcript state */}
      {!hasDraft && !hasTranscript && (
        <div style={{ borderRadius: 12, border: '1px solid rgba(236,232,221,0.1)', background: 'var(--ink2)', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--slate)', fontSize: 13 }}>No transcript found.</p>
          <p style={{ color: 'var(--slate-dk)', fontSize: 12, marginTop: 4 }}>Start typing minutes manually below.</p>
        </div>
      )}

      {/* Minutes form */}
      {(hasDraft || !hasTranscript) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MinutesField label="Agenda" value={agenda} onChange={setAgenda} rows={3} />
          <MinutesField label="Discussion Summary" value={discussion} onChange={setDiscussion} rows={5} />
          <MinutesField label="Decisions Made" value={decisions} onChange={setDecisions} rows={4} />

          {/* Action Items */}
          <div style={{ borderRadius: 12, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>Action Items</h3>
              <button onClick={addAction} style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add item
              </button>
            </div>
            {actions.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--slate-dk)', paddingBottom: 4 }}>No action items yet</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {actions.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                  <input value={a.item} onChange={e => updateAction(i, 'item', e.target.value)} placeholder="Action item" style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--paper)', outline: 'none' }} />
                  <input value={a.owner} onChange={e => updateAction(i, 'owner', e.target.value)} placeholder="Owner" style={{ background: 'transparent', border: 'none', fontSize: 12, color: 'var(--slate)', outline: 'none', width: 90 }} />
                  <input type="date" value={a.due_date} onChange={e => updateAction(i, 'due_date', e.target.value)} style={{ background: 'transparent', border: 'none', fontSize: 12, color: 'var(--slate)', outline: 'none', width: 120, colorScheme: 'dark' }} />
                  <button onClick={() => removeAction(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-dk)', padding: 2 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <MinutesField label="Next Steps" value={nextSteps} onChange={setNextSteps} rows={3} />

          {/* Actions bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
            <button
              onClick={saveMinutes}
              disabled={saving}
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.12)', borderRadius: 8, padding: '9px 16px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>

            {savedAt && (
              <span style={{ fontSize: 11, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#4caf82' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Saved {savedAt}
              </span>
            )}

            {hasDraft && (
              <button
                onClick={draftMinutes}
                disabled={drafting}
                style={{ fontSize: 13, color: 'var(--slate)', background: 'none', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 8, padding: '9px 14px', cursor: drafting ? 'not-allowed' : 'pointer', opacity: drafting ? 0.7 : 1 }}
              >
                {drafting ? 'Regenerating…' : 'Regenerate'}
              </button>
            )}

            {/* Download buttons */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={downloadWord}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', background: 'rgba(90,127,214,0.15)', border: '1px solid rgba(90,127,214,0.3)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Word
              </button>
              <button
                onClick={downloadPDF}
                style={{ fontSize: 13, fontWeight: 600, color: '#000', background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))', border: 'none', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function MinutesField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div style={{ borderRadius: 12, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', padding: '18px 20px' }}>
      <h3 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono, monospace)', marginBottom: 12 }}>{label}</h3>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={`Enter ${label.toLowerCase()}…`}
        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 13, color: 'var(--paper)', resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box' }}
      />
    </div>
  )
}
