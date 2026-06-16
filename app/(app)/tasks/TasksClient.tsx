'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Task { id: string; title: string; owner: string | null; due_date: string | null; status: 'open' | 'done' | 'overdue'; priority: 'low' | 'medium' | 'high'; meetings?: { title: string } | null }

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  open:    { bg: 'rgba(90,127,214,0.12)', text: 'var(--blue-lt)', border: 'rgba(90,127,214,0.25)', label: 'Open' },
  done:    { bg: 'rgba(76,175,130,0.10)', text: '#4caf82',        border: 'rgba(76,175,130,0.25)', label: 'Done' },
  overdue: { bg: 'rgba(224,92,92,0.10)',  text: '#e05c5c',        border: 'rgba(224,92,92,0.25)',  label: 'Overdue' },
}
const PRIORITY_COLOR: Record<string, string> = { high: '#e05c5c', medium: '#C9A24B', low: '#4A5266' }

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState<'low'|'medium'|'high'>('medium')
  const [filter, setFilter] = useState<'all'|'open'|'done'|'overdue'>('all')

  async function addTask() {
    if (!newTitle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('tasks').insert({ title: newTitle, owner: newOwner || null, due_date: newDue || null, priority: newPriority, user_id: user!.id }).select('*, meetings(title)').single()
    if (data) { setTasks(prev => [data, ...prev]); setNewTitle(''); setNewOwner(''); setNewDue(''); setAdding(false) }
  }

  async function toggleDone(t: Task) {
    const newStatus = t.status === 'done' ? 'open' : 'done'
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'done') updates.archived = true
    await supabase.from('tasks').update(updates).eq('id', t.id)
    if (newStatus === 'done') {
      setTasks(prev => prev.filter(x => x.id !== t.id))
    } else {
      setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x))
    }
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(x => x.id !== id))
  }

  function exportPDF() {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = filtered.map(t => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${t.title}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${t.owner||'—'}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${t.due_date||'—'}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-transform:capitalize">${t.status}</td></tr>`).join('')
    win.document.write(`<!DOCTYPE html><html><head><title>Tasks</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;font-size:13px}h1{font-size:20px;font-weight:400;border-bottom:1px solid #ccc;padding-bottom:10px}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#888;border-bottom:1px solid #ccc;padding:6px 8px}</style></head><body><h1>Tasks</h1><p style="color:#888;font-size:11px">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p><table><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr>${rows}</table></body></html>`)
    win.document.close(); win.focus(); setTimeout(() => win.print(), 300)
  }

  function exportWord() {
    const rows = filtered.map(t => `<tr><td style="border:1px solid #ccc;padding:5px 8px">${t.title}</td><td style="border:1px solid #ccc;padding:5px 8px">${t.owner||'—'}</td><td style="border:1px solid #ccc;padding:5px 8px">${t.due_date||'—'}</td><td style="border:1px solid #ccc;padding:5px 8px;text-transform:capitalize">${t.status}</td></tr>`).join('')
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,sans-serif;font-size:11pt;margin:1cm}h1{font-size:16pt}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;border:1px solid #ccc;padding:5px 8px;font-size:9pt}</style></head><body><h1>Tasks</h1><table><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr>${rows}</table></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Tasks.doc'; a.click()
  }

  const open = tasks.filter(t => t.status === 'open').length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => t.status === 'overdue').length
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const inputS: React.CSSProperties = { background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 7, padding: '7px 10px', color: 'var(--paper)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono,monospace)', marginBottom: 4 }}>Tasks</p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces,Georgia,serif)', letterSpacing: '-0.02em', margin: 0 }}>Action Tracker</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportWord} style={{ fontSize: 12, color: 'var(--paper)', background: 'rgba(90,127,214,0.15)', border: '1px solid rgba(90,127,214,0.25)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Word</button>
          <button onClick={exportPDF} style={{ fontSize: 12, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>PDF</button>
          <button onClick={() => setAdding(true)} style={{ fontSize: 12, fontWeight: 700, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Task</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{ label: 'Open', val: open, color: 'var(--blue-lt)', bg: 'rgba(90,127,214,0.1)', border: 'rgba(90,127,214,0.2)' }, { label: 'Done', val: done, color: '#4caf82', bg: 'rgba(76,175,130,0.08)', border: 'rgba(76,175,130,0.2)' }, { label: 'Overdue', val: overdue, color: '#e05c5c', bg: 'rgba(224,92,92,0.08)', border: 'rgba(224,92,92,0.2)' }].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: s.color, fontFamily: 'var(--font-jetbrains-mono,monospace)', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 300, color: s.color, fontFamily: 'var(--font-fraunces,Georgia,serif)', margin: 0, lineHeight: 1 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Add task form */}
      {adding && (
        <div style={{ background: 'var(--ink2)', border: '1px solid rgba(201,162,75,0.25)', borderRadius: 10, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title *" style={{ ...inputS, width: '100%' }} autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="Owner" style={inputS} />
            <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} style={{ ...inputS, colorScheme: 'dark' }} />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as 'low'|'medium'|'high')} style={{ ...inputS, cursor: 'pointer' }}>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addTask} style={{ fontSize: 12, fontWeight: 700, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer' }}>Add Task</button>
            <button onClick={() => setAdding(false)} style={{ fontSize: 12, color: 'var(--slate)', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 7, padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid rgba(236,232,221,0.08)', paddingBottom: 12 }}>
        {(['all','open','done','overdue'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, fontWeight: filter === f ? 600 : 400, color: filter === f ? 'var(--paper)' : 'var(--slate)', background: filter === f ? 'var(--ink3)' : 'transparent', border: filter === f ? '1px solid rgba(236,232,221,0.12)' : '1px solid transparent', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', textTransform: 'capitalize' }}>{f === 'all' ? `All (${tasks.length})` : f}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--slate-dk)', padding: '24px 0', textAlign: 'center' }}>No tasks here.</p>}
        {filtered.map(t => {
          const ss = STATUS_STYLE[t.status]
          return (
            <div key={t.id} style={{ background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Checkbox */}
              <button onClick={() => toggleDone(t)} style={{ width: 18, height: 18, borderRadius: 4, border: t.status === 'done' ? 'none' : '1.5px solid var(--slate-dk)', background: t.status === 'done' ? '#4caf82' : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {t.status === 'done' && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
              </button>

              {/* Priority dot */}
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLOR[t.priority], flexShrink: 0 }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: t.status === 'done' ? 'var(--slate-dk)' : 'var(--paper)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
                  {t.owner && <span style={{ fontSize: 11, color: 'var(--slate)' }}>{t.owner}</span>}
                  {t.due_date && <span style={{ fontSize: 11, color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono,monospace)' }}>{new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {t.meetings?.title && <span style={{ fontSize: 11, color: 'var(--slate-dk)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>· {t.meetings.title}</span>}
                </div>
              </div>

              {/* Status badge */}
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, flexShrink: 0, whiteSpace: 'nowrap' }}>{ss.label}</span>

              {/* Delete */}
              <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-dk)', padding: 2, flexShrink: 0, display: 'flex' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
