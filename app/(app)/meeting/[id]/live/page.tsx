import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LiveClient from './LiveClient'

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) notFound()

  const { data: transcript } = await supabase
    .from('transcripts')
    .select('*')
    .eq('meeting_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <LiveClient meeting={meeting} existingTranscript={transcript} />
}
