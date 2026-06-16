import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .neq('status', 'archived')
    .order('meeting_date', { ascending: true })

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <DashboardClient
      initialMeetings={meetings || []}
      dayName={dayName}
      dateStr={dateStr}
    />
  )
}
