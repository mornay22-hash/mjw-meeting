'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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

interface Props {
  meetings: Meeting[]
  year: number
  month: number
  monthName: string
  days: (number | null)[]
  dayMap: Record<number, Meeting[]>
  todayDay: number
  isCurrentMonth: boolean
  prevYear: number
  prevMonth: number
  nextYear: number
  nextMonth: number
}

export default function CalendarClient({ meetings, year, month, monthName, days, dayMap, todayDay, isCurrentMonth, prevYear, prevMonth, nextYear, nextMonth }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function deleteMeeting(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this meeting? This cannot be undone.')) return
    await supabase.from('meetings').delete().eq('id', id)
    router.refresh()
  }

  const totalMeetings = meetings.length

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
          <Link href={`/calendar?y=${new Date().getFullYear()}&m=${new Date().getMonth() + 1}`} style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 36, borderRadius: 8, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', color: 'var(--slate)', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>
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
          const isToday = day === todayDay && isCurrentMonth
          const dayMeetings = day ? (dayMap[day] || []) : []
          return (
            <div key={i} style={{ background: 'var(--ink2)', minHeight: 90, padding: '8px 8px', position: 'relative' }}>
              {day && (
                <>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, background: isToday ? 'var(--gold)' : 'transparent' }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#000' : 'var(--slate)' }}>{day}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayMeetings.slice(0, 3).map(m => {
                      const href = m.status === 'pre' ? `/meeting/${m.id}/brief` : m.status === 'live' ? `/meeting/${m.id}/live` : m.status === 'post' ? `/meeting/${m.id}/minutes` : `/meeting/${m.id}/archive`
                      return (
                        <div key={m.id} style={{ position: 'relative', group: 'meeting' } as React.CSSProperties}>
                          <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
                            <div style={{ borderRadius: 4, padding: '2px 6px', paddingRight: 32, background: `${STATUS_COLORS[m.status] || '#5A7FD6'}22`, borderLeft: `2px solid ${STATUS_COLORS[m.status] || '#5A7FD6'}` }}>
                              <p style={{ fontSize: 10, color: 'var(--paper)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{m.title}</p>
                              <p style={{ fontSize: 9, color: STATUS_COLORS[m.status] || '#5A7FD6', margin: 0, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                                {new Date(m.meeting_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </Link>
                          {/* Edit & Delete buttons */}
                          <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
                            <Link href={`/meeting/${m.id}/edit`} onClick={e => e.stopPropagation()} title="Edit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 3, background: 'rgba(90,127,214,0.25)', color: '#5A7FD6', textDecoration: 'none' }}>
                              <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
                            </Link>
                            <button onClick={e => deleteMeeting(m.id, e)} title="Delete" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 3, background: 'rgba(224,92,92,0.2)', border: 'none', cursor: 'pointer', color: '#e05c5c', padding: 0 }}>
                              <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {dayMeetings.length > 3 && (
                      <p style={{ fontSize: 9, color: 'var(--slate-dk)', margin: 0, paddingLeft: 6 }}>+{dayMeetings.length - 3} more</p>
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
