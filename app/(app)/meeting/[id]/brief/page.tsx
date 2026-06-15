import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import BriefClient from './BriefClient'

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) notFound()

  const { data: brief } = await supabase.from('briefs').select('*').eq('meeting_id', id).single()

  return <BriefClient meeting={meeting} existingBrief={brief} />
}
