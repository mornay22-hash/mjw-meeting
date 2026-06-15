import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MinutesClient from './MinutesClient'

export default async function MinutesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) notFound()

  const { data: minutes } = await supabase.from('minutes').select('*').eq('meeting_id', id).single()
  const { data: transcript } = await supabase
    .from('transcripts')
    .select('raw_text')
    .eq('meeting_id', id)
    .single()

  return <MinutesClient meeting={meeting} existingMinutes={minutes} hasTranscript={!!transcript?.raw_text} />
}
