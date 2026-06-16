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
          <p style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--slate-dk)', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono, monospace)', marginBottom: 4 }}>
            {dayName}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {dateStr}
          </h1>
          <p className="mt-1" style={{ fontSize: 13, color: 'var(--slate)' }}>
            {todayMeetings.length === 0
              ? '0 meetings scheduled today'
              : `${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} today`}
          </p>
        </div>
        <Link
          href="/meeting/new"
          className="flex items-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))',
            color: '#000',
            fontWeight: 600,
            fontSize: 13,
            padding: '9px 16px',
            borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 2px 16px rgba(201,162,75,0.18)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Meeting
        </Link>
      </div>

      {/* Live banner */}
      {liveMeeting && (
        <Link href={`/meeting/${liveMeeting.id}/live`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(120deg, rgba(46,77,143,0.35), rgba(90,127,214,0.12))',
            border: '1px solid rgba(90,127,214,0.25)',
            borderRadius: 16,
            padding: '18px 20px',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--blue-lt)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--blue-lt)', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                    Live Now
                  </span>
                </div>
                <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--paper)', fontSize: 14 }}>{liveMeeting.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                    {new Date(liveMeeting.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--blue-lt)' }}>Join →</span>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Today" value={todayMeetings.length.toString()} sub="meetings" color="gold" />
        <StatCard label="Upcoming" value={upcomingMeetings.length.toString()} sub="scheduled" color="blue" />
        <StatCard label="In Progress" value={liveMeeting ? '1' : '0'} sub={liveMeeting ? 'meeting live' : 'all clear'} color={liveMeeting ? 'blue' : 'muted'} live={!!liveMeeting} />
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
        <div className="text-center py-20 mt-12" style={{ borderRadius: 16, border: '1px solid var(--line)', background: 'var(--ink2)' }}>
          <div className="flex items-center justify-center mx-auto mb-4" style={{ width: 52, height: 52, borderRadius: 14, border: '1px solid rgba(201,162,75,0.2)', background: 'rgba(201,162,75,0.06)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p style={{ color: 'var(--paper)', fontWeight: 500, fontSize: 14 }}>No meetings yet</p>
          <p style={{ fontSize: 13, color: 'var(--slate-dk)', marginTop: 4, marginBottom: 20 }}>Create your first meeting to get started</p>
          <Link
            href="/meeting/new"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))',
              color: '#000',
              fontWeight: 600,
              fontSize: 13,
              padding: '9px 20px',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            Create a meeting
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color, live }: {
  label: string; value: string; sub: string; color: 'gold' | 'blue' | 'muted'; live?: boolean
}) {
  const s = {
    gold:  { bg: 'rgba(201,162,75,0.07)',  border: 'rgba(201,162,75,0.15)',  val: 'var(--gold-lt)' },
    blue:  { bg: 'rgba(46,77,143,0.15)',   border: 'rgba(90,127,214,0.2)',   val: 'var(--blue-lt)' },
    muted: { bg: 'var(--ink2)',             border: 'var(--line)',             val: 'var(--slate)' },
  }[color]
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: '20px 18px' }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)', marginBottom: 10 }}>
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span style={{ fontSize: 30, fontWeight: 300, color: s.val, fontFamily: 'var(--font-fraunces, Georgia, serif)', lineHeight: 1 }}>
          {value}
        </span>
        {live && <span className="w-2 h-2 rounded-full animate-pulse mb-1" style={{ background: 'var(--blue-lt)' }} />}
      </div>
      <p style={{ fontSize: 11, color: 'var(--slate-dk)', marginTop: 4 }}>{sub}</p>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
          {title}
        </h2>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--ink3)', border: '1px solid var(--line)', color: 'var(--slate-dk)' }}>
          {count}
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
    pre:      { label: 'Brief Ready',   dot: 'var(--blue-lt)',  bg: 'rgba(46,77,143,0.12)',  text: 'var(--blue-lt)',  border: 'rgba(90,127,214,0.2)' },
    live:     { label: 'Live',          dot: 'var(--blue-lt)',  bg: 'rgba(46,77,143,0.2)',   text: 'var(--blue-lt)',  border: 'rgba(90,127,214,0.3)' },
    post:     { label: 'Minutes Ready', dot: 'var(--gold)',     bg: 'rgba(201,162,75,0.10)', text: 'var(--gold)',     border: 'rgba(201,162,75,0.2)' },
    archived: { label: 'Archived',      dot: 'var(--slate-dk)', bg: 'var(--ink3)',           text: 'var(--slate-dk)', border: 'var(--line)' },
  }

  const cfg = statusConfig[meeting.status] || statusConfig.pre

  const href =
    meeting.status === 'pre'    ? `/meeting/${meeting.id}/brief`
    : meeting.status === 'live' ? `/meeting/${meeting.id}/live`
    : meeting.status === 'post' ? `/meeting/${meeting.id}/minutes`
    : `/meeting/${meeting.id}/archive`

  const time = new Date(meeting.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dateLabel = new Date(meeting.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <Link href={href} style={{ textDecoration: 'none' }} className="block">
      <div
        className="flex items-center gap-4 transition-all"
        style={{ background: 'var(--ink2)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 18px', cursor: 'pointer' }}
      >
        <div style={{ width: 56, flexShrink: 0, textAlign: 'right' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--paper)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{time}</p>
          <p style={{ fontSize: 10, color: 'var(--slate-dk)', marginTop: 2, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{dateLabel}</p>
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--line)', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: 'var(--paper)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meeting.title}
          </p>
          {meeting.attendees?.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--slate-dk)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meeting.attendees.slice(0, 3).join(' · ')}{meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3}`}
            </p>
          )}
        </div>

        <span className="flex items-center gap-1.5" style={{ flexShrink: 0, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>

        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--slate-dk)', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}
