import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Meeting } from '@/types'
import ArchiveClient from './ArchiveClient'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let meetingQuery = supabase
    .from('meetings')
    .select('*')
    .eq('status', 'archived')
    .order('meeting_date', { ascending: false })
  if (q) meetingQuery = meetingQuery.ilike('title', `%${q}%`)
  const { data: meetings } = await meetingQuery

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, body, tag, updated_at')
    .eq('user_id', user!.id)
    .eq('archived', true)
    .order('updated_at', { ascending: false })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, owner, due_date, status, priority')
    .eq('user_id', user!.id)
    .eq('archived', true)
    .order('due_date', { ascending: false, nullsFirst: false })

  return (
    <ArchiveClient
      meetings={(meetings || []) as Meeting[]}
      notes={notes || []}
      tasks={tasks || []}
      q={q}
    />
  )
}
