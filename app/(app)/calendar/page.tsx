import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Meeting } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pre:      '#5A7FD6',
  live:     '#4caf82',
  post:     '#C9A24B',
  archived: '#4A5266',
}
const STATUS_LABELS: Record<string, string> = {
  pre: 'Brief Ready', live: 'Live', post: 'Minutes', archived: 'Archived',
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ y?: string; m?: string }> }) {
  const supabase = await createClient()
  const sp = await searchParams
  const now = new Date()
  const year  = parseInt(sp.y || String(now.getFullYear()))
  const month = parseInt(sp.m || String(now.getMonth() + 1))

  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59)

  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, meeting_date, status')
    .gte('meeting_date', start.toISOString())
    .lte('meeting_date', end.toISOString())
    .order('meeting_date')

  // Build day map
  const dayMap: Record<number, Meeting[]> = {}
  for (const m of (meetings || [])) {
    const d = new Date(m.meeting_date).getDate()
    if (!dayMap[d]) dayMap[d] = []
    dayMap[d].push(m as Meeting)
  }

  const firstDow = start.getDay() // 0=Sun
  const daysInMonth = end.getDate()
  const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear  = month === 12 ? year + 1 : year

  const days: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (days.length % 7 !== 0) days.push(null)

  const totalMeetings = (meetings || []).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono, monospace)', marginBottom: 4 }}>Calendar</p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.02em', margin: 0 }}>{monthName}</h1>
          <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{totalMeetings} meeting{totalMeetings !== 1 ? 's' : ''} this month</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/calendar?y=${prevYear}&m=${prevMonth}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', textDecoration: 'none' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </Link>
          <Link href={`/calendar?y=${now.getFullYear()}&m=${now.getMonth() + 1}`} style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 36, borderRadius: 8, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>
            Today
          </Link>
          <Link href={`/calendar?y=${nextYear}&m=${nextMonth}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', textDecoration: 'none' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </Link>
          <Link href="/meeting/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, borderRadius: 8, background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))', color: '#000', textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            + New Meeting
          </Link>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ padding: '8px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)', textAlign: 'center' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'rgba(236,232,221,0.05)', border: '1px solid rgba(236,232,221,0.05)', borderRadius: 12, overflow: 'hidden' }}>
        {days.map((day, i) => {
          const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()
          const meetings = day ? (dayMap[day] || []) : []
          return (
            <div key={i} style={{ background: 'var(--ink2)', minHeight: 90, padding: '8px 8px', position: 'relative' }}>
              {day && (
                <>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, background: isToday ? 'var(--gold)' : 'transparent' }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#000' : 'var(--slate)' }}>{day}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {meetings.slice(0, 3).map(m => {
                      const href = m.status === 'pre' ? `/meeting/${m.id}/brief` : m.status === 'live' ? `/meeting/${m.id}/live` : m.status === 'post' ? `/meeting/${m.id}/minutes` : `/meeting/${m.id}/archive`
                      return (
                        <Link key={m.id} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                          <div style={{ borderRadius: 4, padding: '2px 6px', background: `${STATUS_COLORS[m.status] || '#5A7FD6'}22`, borderLeft: `2px solid ${STATUS_COLORS[m.status] || '#5A7FD6'}` }}>
                            <p style={{ fontSize: 10, color: 'var(--paper)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{m.title}</p>
                            <p style={{ fontSize: 9, color: STATUS_COLORS[m.status] || '#5A7FD6', margin: 0, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                              {new Date(m.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                    {meetings.length > 3 && (
                      <p style={{ fontSize: 9, color: 'var(--slate-dk)', margin: 0, paddingLeft: 6 }}>+{meetings.length - 3} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[k] }} />
            <span style={{ fontSize: 11, color: 'var(--slate)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
