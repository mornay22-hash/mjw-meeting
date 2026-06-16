import { createClient } from '@/lib/supabase/server'
import TasksClient from './TasksClient'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, meetings(title)')
    .eq('user_id', user!.id)
    .eq('archived', false)
    .order('due_date', { ascending: true, nullsFirst: false })
  return <TasksClient initialTasks={tasks || []} />
}
