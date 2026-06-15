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
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Meeting</h1>
        <p className="text-sm text-gray-500 mt-1">Create a meeting not in your calendar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Meeting title</label>
          <input
            name="title"
            required
            placeholder="e.g. Q3 Review"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={defaultDate}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Time</label>
            <input
              type="time"
              name="time"
              defaultValue={defaultTime}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Attendees</label>
          <input
            name="attendees"
            placeholder="John Smith, Jane Doe (comma separated)"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-white text-gray-900 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create meeting'}
          </button>
        </div>
      </form>
    </div>
  )
}
