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

  const now = new Date()
  const todayStr = now.toDateString()

  const todayMeetings = (meetings || []).filter(
    (m: Meeting) => new Date(m.meeting_date).toDateString() === todayStr
  )
  const upcomingMeetings = (meetings || []).filter(
    (m: Meeting) => new Date(m.meeting_date) > now && new Date(m.meeting_date).toDateString() !== todayStr
  )
  const liveMeeting = (meetings || []).find((m: Meeting) => m.status === 'live')

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-white/25 uppercase mb-1">{dayName}</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{dateStr}</h1>
          <p className="text-sm text-white/35 mt-1">
            {todayMeetings.length === 0
              ? 'No meetings scheduled today'
              : `${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} today`}
          </p>
        </div>
        <Link
          href="/meeting/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Meeting
        </Link>
      </div>

      {/* Live banner */}
      {liveMeeting && (
        <Link href={`/meeting/${liveMeeting.id}/live`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/60 to-emerald-900/40 border border-green-500/20 p-5 hover:border-green-500/40 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Live Now</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div>
                  <p className="font-semibold text-white">{liveMeeting.title}</p>
                  <p className="text-sm text-white/40">
                    {new Date(liveMeeting.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-400 group-hover:translate-x-1 transition-transform">
                Join →
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Today"
          value={todayMeetings.length.toString()}
          sub="meetings"
          color="indigo"
        />
        <StatCard
          label="Upcoming"
          value={upcomingMeetings.length.toString()}
          sub="scheduled"
          color="purple"
        />
        <StatCard
          label="In Progress"
          value={liveMeeting ? '1' : '0'}
          sub={liveMeeting ? 'meeting live' : 'all clear'}
          color="green"
          live={!!liveMeeting}
        />
      </div>

      {/* Today */}
      {todayMeetings.length > 0 && (
        <Section title="Today" count={todayMeetings.length}>
          {todayMeetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
        </Section>
      )}

      {/* Upcoming */}
      {upcomingMeetings.length > 0 && (
        <Section title="Upcoming" count={upcomingMeetings.length}>
          {upcomingMeetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
        </Section>
      )}

      {/* Empty state */}
      {(meetings || []).length === 0 && (
        <div className="mt-12 text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p className="text-white/60 font-medium">No meetings yet</p>
          <p className="text-sm text-white/25 mt-1 mb-6">Create your first meeting to get started</p>
          <Link
            href="/meeting/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          >
            Create a meeting
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color, live }: {
  label: string; value: string; sub: string; color: 'indigo' | 'purple' | 'green'; live?: boolean
}) {
  const colors = {
    indigo: 'from-indigo-500/10 border-indigo-500/15 text-indigo-400',
    purple: 'from-purple-500/10 border-purple-500/15 text-purple-400',
    green: 'from-green-500/10 border-green-500/15 text-green-400',
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} to-transparent border p-5`}>
      <p className="text-xs font-semibold tracking-widest uppercase text-white/25 mb-3">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {live && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mb-1.5" />}
      </div>
      <p className="text-xs text-white/30 mt-1">{sub}</p>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase">{title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-medium">{count}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    pre:      { label: 'Brief Ready',   dot: 'bg-blue-400',   badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    live:     { label: 'Live',          dot: 'bg-green-400 animate-pulse', badge: 'bg-green-500/10 text-green-300 border-green-500/20' },
    post:     { label: 'Minutes Ready', dot: 'bg-amber-400',  badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    archived: { label: 'Archived',      dot: 'bg-white/20',   badge: 'bg-white/5 text-white/30 border-white/10' },
  }

  const cfg = statusConfig[meeting.status] || statusConfig.pre

  const href =
    meeting.status === 'pre'      ? `/meeting/${meeting.id}/brief`
    : meeting.status === 'live'   ? `/meeting/${meeting.id}/live`
    : meeting.status === 'post'   ? `/meeting/${meeting.id}/minutes`
    : `/meeting/${meeting.id}/archive`

  const time = new Date(meeting.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dateLabel = new Date(meeting.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <Link href={href} className="block group">
      <div className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl px-5 py-4 transition-all">
        {/* Time column */}
        <div className="w-16 shrink-0 text-right">
          <p className="text-sm font-semibold text-white/70">{time}</p>
          <p className="text-[11px] text-white/25 mt-0.5">{dateLabel}</p>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/8 shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white/90 group-hover:text-white transition-colors truncate">{meeting.title}</p>
          {meeting.attendees?.length > 0 && (
            <p className="text-sm text-white/30 mt-0.5 truncate">
              {meeting.attendees.slice(0, 3).join(' · ')}{meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3}`}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        {/* Arrow */}
        <svg className="w-4 h-4 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}
