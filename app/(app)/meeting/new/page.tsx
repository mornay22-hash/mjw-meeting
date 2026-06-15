'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewMeetingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const meeting_date = new Date(`${date}T${time}`).toISOString()
    const attendees = attendeesRaw.split(',').map(a => a.trim()).filter(Boolean)

    const { data: meeting, error: err } = await supabase
      .from('meetings')
      .insert({ title, meeting_date, attendees, user_id: user.id, status: 'pre' })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/meeting/${meeting.id}/brief`)
  }

  const now = new Date()
  const defaultDate = now.toISOString().split('T')[0]
  const defaultTime = `${String(now.getHours()).padStart(2,'0')}:00`

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold text-white tracking-tight">New Meeting</h1>
        <p className="text-sm text-white/35 mt-1">Set up your meeting and generate an AI brief</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold tracking-widest text-white/30 uppercase">
            Meeting Title
          </label>
          <input
            name="title"
            required
            placeholder="e.g. Q3 Strategy Review"
            className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-widest text-white/30 uppercase">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={defaultDate}
              required
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-widest text-white/30 uppercase">
              Time
            </label>
            <input
              type="time"
              name="time"
              defaultValue={defaultTime}
              required
              className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold tracking-widest text-white/30 uppercase">
            Attendees
            <span className="ml-2 font-normal normal-case tracking-normal text-white/20">optional</span>
          </label>
          <input
            name="attendees"
            placeholder="John Smith, Jane Doe  —  separate with commas"
            className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 py-3 rounded-xl transition-all text-sm font-medium border border-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : 'Create Meeting'}
          </button>
        </div>
      </form>
    </div>
  )
}
