import { createClient } from '@/lib/supabase/server'
import NotesClient from './NotesClient'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
  return <NotesClient initialNotes={notes || []} />
}
