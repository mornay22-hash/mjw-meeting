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
  const count = (meetings || []).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/25 uppercase mb-1">Archive</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Past Meetings</h1>
          <p className="text-sm text-white/35 mt-1">
            {count === 0 ? 'No archived meetings' : `${count} meeting${count !== 1 ? 's' : ''} archived`}
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title…"
          className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
        />
      </form>

      {/* Empty state */}
      {count === 0 && (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-white/40 font-medium text-sm">
            {q ? `No meetings matching "${q}"` : 'No archived meetings yet'}
          </p>
          {q && (
            <Link href="/archive" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors">
              Clear search
            </Link>
          )}
        </div>
      )}

      {/* Meeting list */}
      {count > 0 && (
        <div className="space-y-2">
          {(meetings || []).map((m: Meeting) => {
            const date = new Date(m.meeting_date)
            return (
              <Link key={m.id} href={`/meeting/${m.id}/archive`} className="block group">
                <div className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl px-5 py-4 transition-all">
                  {/* Date block */}
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-lg font-bold text-white/60 leading-none">{date.getDate()}</p>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>

                  <div className="w-px h-8 bg-white/8 shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white/80 group-hover:text-white transition-colors truncate">{m.title}</p>
                    {m.attendees?.length > 0 && (
                      <p className="text-sm text-white/25 mt-0.5 truncate">
                        {m.attendees.slice(0, 4).join(' · ')}{m.attendees.length > 4 && ` +${m.attendees.length - 4}`}
                      </p>
                    )}
                  </div>

                  {/* Year + arrow */}
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs text-white/20">{date.getFullYear()}</span>
                    <svg className="w-4 h-4 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
