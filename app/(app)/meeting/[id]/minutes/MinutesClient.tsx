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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Minutes</p>
          <h1 className="text-xl font-semibold text-white">{meeting.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {meeting.attendees?.length > 0 && ` · ${meeting.attendees.join(', ')}`}
          </p>
        </div>
        {!hasDraft && hasTranscript && (
          <button
            onClick={draftMinutes}
            disabled={drafting}
            className="shrink-0 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {drafting ? 'Drafting…' : 'Draft with AI'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!hasDraft && !hasTranscript && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm">No transcript found. Start typing minutes manually or go back to record a transcript.</p>
        </div>
      )}

      {(hasDraft || !hasTranscript) && (
        <div className="space-y-4">
          <Field label="Agenda" value={agenda} onChange={setAgenda} rows={3} />
          <Field label="Discussion Summary" value={discussion} onChange={setDiscussion} rows={5} />
          <Field label="Decisions Made" value={decisions} onChange={setDecisions} rows={4} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Action Items</p>
              <button onClick={addAction} className="text-xs text-gray-400 hover:text-white transition-colors">+ Add</button>
            </div>
            {actions.length === 0 && (
              <p className="text-sm text-gray-600">No action items</p>
            )}
            {actions.map((a, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3 grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                <input
                  value={a.item}
                  onChange={e => updateAction(i, 'item', e.target.value)}
                  placeholder="Action item"
                  className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                />
                <input
                  value={a.owner}
                  onChange={e => updateAction(i, 'owner', e.target.value)}
                  placeholder="Owner"
                  className="bg-transparent text-sm text-gray-400 placeholder-gray-600 focus:outline-none w-24"
                />
                <input
                  type="date"
                  value={a.due_date}
                  onChange={e => updateAction(i, 'due_date', e.target.value)}
                  className="bg-transparent text-sm text-gray-400 focus:outline-none w-32"
                />
                <button onClick={() => removeAction(i)} className="text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
              </div>
            ))}
          </div>

          <Field label="Next Steps" value={nextSteps} onChange={setNextSteps} rows={3} />

          <div className="flex gap-3 pt-2">
            <button
              onClick={saveMinutes}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Save draft
            </button>
            {hasDraft && (
              <button
                onClick={draftMinutes}
                disabled={drafting}
                className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {drafting ? 'Regenerating…' : 'Regenerate'}
              </button>
            )}
            <button
              onClick={() => setShowSendForm(true)}
              className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Send minutes →
            </button>
          </div>

          {showSendForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-white">Send minutes</p>
              <input
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder="email@example.com, another@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              {sendError && <p className="text-sm text-red-400">{sendError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSendForm(false)}
                  className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Confirm send'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({
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
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">{label}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-700 resize-none focus:outline-none focus:border-gray-600"
      />
    </div>
  )
}
