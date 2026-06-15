import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Meeting } from '@/types'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('meetings')
    .select('*')
    .eq('status', 'archived')
    .order('meeting_date', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: meetings } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Archive</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(meetings || []).length} meeting{(meetings || []).length !== 1 ? 's' : ''}</p>
      </div>

      <form className="relative">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title…"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 text-sm"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          ↵
        </button>
      </form>

      {(meetings || []).length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <p>{q ? `No meetings matching "${q}"` : 'No archived meetings yet'}</p>
        </div>
      )}

      <div className="space-y-2">
        {(meetings || []).map((m: Meeting) => (
          <Link key={m.id} href={`/meeting/${m.id}/archive`}>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{m.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(m.meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {m.attendees?.length > 0 && ` · ${m.attendees.join(', ')}`}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 shrink-0">Archived</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
