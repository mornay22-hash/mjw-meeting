'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Meeting } from '@/types'
import { useState } from 'react'

interface Note { id: string; title: string; body: string; tag: string | null; updated_at: string }
interface Task { id: string; title: string; owner: string | null; due_date: string | null; status: string; priority: string }

interface Props {
  meetings: Meeting[]
  notes: Note[]
  tasks: Task[]
  q?: string
}

export default function ArchiveClient({ meetings: initialMeetings, notes: initialNotes, tasks: initialTasks, q }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [meetings, setMeetings] = useState(initialMeetings)
  const [notes, setNotes] = useState(initialNotes)
  const [tasks, setTasks] = useState(initialTasks)

  async function deleteNote(id: string) {
    if (!confirm('Permanently delete this note?')) return
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  async function deleteTask(id: string) {
    if (!confirm('Permanently delete this task?')) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const totalMeetings = meetings.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/25 uppercase mb-1">Archive</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Past & Archived</h1>
          <p className="text-sm text-white/35 mt-1">
            {totalMeetings} meeting{totalMeetings !== 1 ? 's' : ''} · {notes.length} note{notes.length !== 1 ? 's' : ''} · {tasks.length} task{tasks.length !== 1 ? 's' : ''} archived
          </p>
        </div>
      </div>

      {/* Search for meetings */}
      <form className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search archived meetings…"
          className="w-full bg-white/[0.04] border border-white/8 hover:border-white/12 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
        />
      </form>

      {/* Meetings Section */}
      <Section title="Meetings" count={totalMeetings}>
        {totalMeetings === 0 ? (
          <EmptyState icon="📁" text={q ? `No meetings matching "${q}"` : 'No archived meetings yet'} />
        ) : (
          <div className="space-y-2">
            {meetings.map((m) => {
              const date = new Date(m.meeting_date)
              return (
                <Link key={m.id} href={`/meeting/${m.id}/archive`} className="block group">
                  <div className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl px-5 py-4 transition-all">
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-lg font-bold text-white/60 leading-none">{date.getDate()}</p>
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{date.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                    <div className="w-px h-8 bg-white/8 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white/80 group-hover:text-white transition-colors truncate">{m.title}</p>
                      {m.attendees?.length > 0 && (
                        <p className="text-sm text-white/25 mt-0.5 truncate">{m.attendees.slice(0, 4).join(' · ')}{m.attendees.length > 4 && ` +${m.attendees.length - 4}`}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-xs text-white/20">{date.getFullYear()}</span>
                      <svg className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Section>

      {/* Notes Section */}
      <Section title="Archived Notes" count={notes.length}>
        {notes.length === 0 ? (
          <EmptyState icon="📝" text="No archived notes" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {notes.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--paper)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || 'Untitled'}</p>
                  <p style={{ fontSize: 11, color: 'var(--slate)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body?.slice(0, 80) || 'Empty note'}</p>
                  {n.tag && <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{n.tag}</span>}
                </div>
                <button onClick={() => deleteNote(n.id)} style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#e05c5c', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Tasks Section */}
      <Section title="Completed Tasks" count={tasks.length}>
        {tasks.length === 0 ? (
          <EmptyState icon="✓" text="No completed tasks" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: '#4caf82', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate-dk)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{t.title}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                    {t.owner && <span style={{ fontSize: 11, color: 'var(--slate-dk)' }}>{t.owner}</span>}
                    {t.due_date && <span style={{ fontSize: 11, color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono,monospace)' }}>{new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  </div>
                </div>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#e05c5c', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-jetbrains-mono, monospace)', margin: 0 }}>{title}</p>
        <span style={{ fontSize: 10, color: 'var(--slate-dk)', background: 'var(--ink3)', borderRadius: 99, padding: '1px 7px', border: '1px solid rgba(236,232,221,0.08)' }}>{count}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(201,162,75,0.1)' }} />
      </div>
      {children}
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ fontSize: 20, marginBottom: 8 }}>{icon}</p>
      <p style={{ fontSize: 12, color: 'var(--slate-dk)' }}>{text}</p>
    </div>
  )
}
