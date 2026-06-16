import { createClient } from '@/lib/supabase/server'
import { Meeting } from '@/types'
import CalendarClient from './CalendarClient'

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

  const dayMap: Record<number, Meeting[]> = {}
  for (const m of (meetings || [])) {
    const d = new Date(m.meeting_date).getDate()
    if (!dayMap[d]) dayMap[d] = []
    dayMap[d].push(m as Meeting)
  }

  const firstDow = start.getDay()
  const daysInMonth = end.getDate()
  const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear  = month === 12 ? year + 1 : year

  const days: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (days.length % 7 !== 0) days.push(null)

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  return (
    <CalendarClient
      meetings={meetings as Meeting[] || []}
      year={year}
      month={month}
      monthName={monthName}
      days={days}
      dayMap={dayMap}
      todayDay={now.getDate()}
      isCurrentMonth={isCurrentMonth}
      prevYear={prevYear}
      prevMonth={prevMonth}
      nextYear={nextYear}
      nextMonth={nextMonth}
    />
  )
}
