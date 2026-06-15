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
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sendError, setSendError] = useState('')
  const [recipients, setRecipients] = useState('')
  const [showSendForm, setShowSendForm] = useState(false)

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('minutes').upsert({
      meeting_id: meeting.id,
      user_id: user.id,
      agenda,
      discussion,
      decisions,
      actions,
      next_steps: nextSteps,
    }, { onConflict: 'meeting_id' })
  }

  async function handleSend() {
    if (!recipients.trim()) { setSendError('Enter at least one recipient email'); return }
    setSending(true)
    setSendError('')

    await saveMinutes()

    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId: meeting.id,
        recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setSendError(d.error || 'Send failed. Draft preserved.')
      setSending(false)
      return
    }

    await supabase.from('meetings').update({ status: 'archived' }).eq('id', meeting.id)
    router.push('/archive')
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

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/25 uppercase mb-2">Meeting Minutes</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{meeting.title}</h1>
          <p className="text-sm text-white/35 mt-1.5">
            {new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {meeting.attendees?.length > 0 && (
              <span className="before:content-['·'] before:mx-2 before:text-white/20">
                {meeting.attendees.join(', ')}
              </span>
            )}
          </p>
        </div>
        {!hasDraft && hasTranscript && (
          <button
            onClick={draftMinutes}
            disabled={drafting}
            className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {drafting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drafting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Draft with AI
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* No transcript state */}
      {!hasDraft && !hasTranscript && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="text-white/50 text-sm">No transcript found.</p>
          <p className="text-white/25 text-sm mt-1">Start typing minutes manually below.</p>
        </div>
      )}

      {/* Minutes form */}
      {(hasDraft || !hasTranscript) && (
        <div className="space-y-4">
          <MinutesField label="Agenda" value={agenda} onChange={setAgenda} rows={3} />
          <MinutesField label="Discussion Summary" value={discussion} onChange={setDiscussion} rows={5} />
          <MinutesField label="Decisions Made" value={decisions} onChange={setDecisions} rows={4} />

          {/* Action Items */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-widest text-white/35 uppercase">Action Items</h3>
              <button
                onClick={addAction}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add item
              </button>
            </div>
            {actions.length === 0 && (
              <p className="text-sm text-white/20 py-2">No action items yet</p>
            )}
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
                  <input
                    value={a.item}
                    onChange={e => updateAction(i, 'item', e.target.value)}
                    placeholder="Action item"
                    className="bg-transparent text-sm text-white/80 placeholder-white/20 focus:outline-none"
                  />
                  <input
                    value={a.owner}
                    onChange={e => updateAction(i, 'owner', e.target.value)}
                    placeholder="Owner"
                    className="bg-transparent text-sm text-white/40 placeholder-white/20 focus:outline-none w-24"
                  />
                  <input
                    type="date"
                    value={a.due_date}
                    onChange={e => updateAction(i, 'due_date', e.target.value)}
                    className="bg-transparent text-sm text-white/40 focus:outline-none w-32 [color-scheme:dark]"
                  />
                  <button onClick={() => removeAction(i)} className="text-white/15 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <MinutesField label="Next Steps" value={nextSteps} onChange={setNextSteps} rows={3} />

          {/* Actions bar */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={saveMinutes}
              className="bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 text-sm px-4 py-2.5 rounded-xl transition-all border border-white/5"
            >
              Save draft
            </button>
            {hasDraft && (
              <button
                onClick={draftMinutes}
                disabled={drafting}
                className="bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 text-sm px-4 py-2.5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
              >
                {drafting ? 'Regenerating…' : 'Regenerate'}
              </button>
            )}
            <button
              onClick={() => setShowSendForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send minutes
            </button>
          </div>

          {/* Send form */}
          {showSendForm && (
            <div className="rounded-2xl bg-white/[0.03] border border-indigo-500/20 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Send minutes via email</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Recipients</label>
                <input
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  placeholder="email@example.com, another@example.com"
                  className="w-full bg-white/[0.04] border border-white/8 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              {sendError && <p className="text-sm text-red-400">{sendError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendForm(false)}
                  className="bg-white/5 hover:bg-white/8 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  {sending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : 'Confirm send'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MinutesField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-3">
      <h3 className="text-[10px] font-bold tracking-widest text-white/35 uppercase">{label}</h3>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-transparent text-sm text-white/70 placeholder-white/15 resize-none focus:outline-none"
      />
    </div>
  )
}
