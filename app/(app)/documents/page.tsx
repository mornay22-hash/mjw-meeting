import { createClient } from '@/lib/supabase/server'
import DocumentsClient from './DocumentsClient'

interface MeetingMinute { meeting_id: string; agenda: string | null; meetings: { id: string; title: string; meeting_date: string; status: string } | null }

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: docs }, { data: minutes }] = await Promise.all([
    supabase.from('documents').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('minutes').select('meeting_id, agenda, meetings(id, title, meeting_date, status)').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])
  return <DocumentsClient initialDocs={docs || []} meetingMinutes={(minutes as unknown as MeetingMinute[]) || []} />
}
