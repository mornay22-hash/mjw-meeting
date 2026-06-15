import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Meeting } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .neq('status', 'archived')
    .order('meeting_date', { ascending: true })

  const today = new Date().toDateString()

  const todayMeetings = (meetings || []).filter(
    (m: Meeting) => new Date(m.meeting_date).toDateString() === today
  )
  const upcomingMeetings = (meetings || []).filter(
    (m: Meeting) => new Date(m.meeting_date).toDateString() !== today
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {todayMeetings.length === 0 ? 'No meetings today' : `${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} today`}
          </p>
        </div>
        <Link
          href="/meeting/new"
          className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          + New meeting
        </Link>
      </div>

      {todayMeetings.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">Today</h2>
          <div className="space-y-2">
            {todayMeetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </section>
      )}

      {upcomingMeetings.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcomingMeetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </section>
      )}

      {(meetings || []).length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <p className="text-lg">No upcoming meetings</p>
          <p className="text-sm mt-1">Create one or connect your Google Calendar</p>
        </div>
      )}
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusLabel: Record<string, string> = {
    pre: 'Pre-meeting',
    live: 'Live',
    post: 'Post-meeting',
    archived: 'Archived',
  }

  const statusColor: Record<string, string> = {
    pre: 'bg-blue-950 text-blue-300',
    live: 'bg-green-950 text-green-300',
    post: 'bg-yellow-950 text-yellow-300',
    archived: 'bg-gray-800 text-gray-400',
  }

  const href =
    meeting.status === 'pre' ? `/meeting/${meeting.id}/brief`
    : meeting.status === 'live' ? `/meeting/${meeting.id}/live`
    : meeting.status === 'post' ? `/meeting/${meeting.id}/minutes`
    : `/meeting/${meeting.id}/archive`

  return (
    <Link href={href}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{meeting.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(meeting.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {meeting.attendees?.length > 0 && ` · ${meeting.attendees.join(', ')}`}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColor[meeting.status]}`}>
            {statusLabel[meeting.status]}
          </span>
        </div>
      </div>
    </Link>
  )
}
