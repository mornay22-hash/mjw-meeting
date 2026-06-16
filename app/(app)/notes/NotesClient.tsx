'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Note { id: string; title: string; body: string; tag: string | null; updated_at: string }

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selected, setSelected] = useState<Note | null>(initialNotes[0] || null)
  const [title, setTitle] = useState(initialNotes[0]?.title || '')
  const [body, setBody] = useState(initialNotes[0]?.body || '')
  const [tag, setTag] = useState(initialNotes[0]?.tag || '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function selectNote(n: Note) {
    setSelected(n); setTitle(n.title); setBody(n.body); setTag(n.tag || ''); setSavedAt(null)
  }

  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('notes').insert({ title: 'Untitled Note', body: '', user_id: user!.id }).select().single()
    if (data) { setNotes(prev => [data, ...prev]); selectNote(data) }
  }

  async function saveNote() {
    if (!selected) return
    setSaving(true)
    const { data } = await supabase.from('notes').update({ title, body, tag: tag || null, updated_at: new Date().toISOString() }).eq('id', selected.id).select().single()
    if (data) {
      setNotes(prev => prev.map(n => n.id === data.id ? data : n))
      setSelected(data)
      setSavedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    }
    setSaving(false)
  }

  async function deleteNote() {
    if (!selected) return
    await supabase.from('notes').delete().eq('id', selected.id)
    const remaining = notes.filter(n => n.id !== selected.id)
    setNotes(remaining)
    if (remaining[0]) { selectNote(remaining[0]) } else { setSelected(null); setTitle(''); setBody(''); setTag('') }
  }

  function exportPDF() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;color:#111;font-size:13px;line-height:1.7}
    h1{font-size:20px;font-weight:400;border-bottom:1px solid #ccc;padding-bottom:10px;margin-bottom:4px}
    .meta{color:#888;font-size:11px;margin-bottom:24px}pre{white-space:pre-wrap;font-family:inherit}</style>
    </head><body><h1>${title}</h1><div class="meta">${tag ? `Tag: ${tag} · ` : ''}${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
    <pre>${body}</pre></body></html>`)
    win.document.close(); win.focus(); setTimeout(() => win.print(), 300)
  }

  function exportWord() {
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,sans-serif;font-size:11pt;margin:1cm}h1{font-size:16pt}p{white-space:pre-wrap}</style></head>
    <body><h1>${title}</h1>${tag ? `<p style="color:#888;font-size:9pt">Tag: ${tag}</p>` : ''}<p>${body}</p></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${title.replace(/\s+/g,'_')}.doc`; a.click()
  }

  const card: React.CSSProperties = { borderRadius: 10, background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', padding: '12px 14px', cursor: 'pointer', overflow: 'hidden' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono,monospace)', marginBottom: 4 }}>Notes</p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces,Georgia,serif)', letterSpacing: '-0.02em', margin: 0 }}>Your Notes</h1>
        </div>
        <button onClick={createNote} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + New Note
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {notes.length === 0 && <p style={{ fontSize: 12, color: 'var(--slate-dk)', padding: '12px 0' }}>No notes yet.</p>}
          {notes.map(n => (
            <div key={n.id} onClick={() => selectNote(n)} style={{ ...card, border: selected?.id === n.id ? '1px solid rgba(201,162,75,0.35)' : '1px solid rgba(236,232,221,0.1)', background: selected?.id === n.id ? 'rgba(201,162,75,0.06)' : 'var(--ink2)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--paper)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || 'Untitled'}</p>
              <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body?.slice(0, 60) || 'Empty note'}</p>
              {n.tag && <span style={{ marginTop: 4, display: 'inline-block', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{n.tag}</span>}
            </div>
          ))}
        </div>

        {/* Editor */}
        {selected ? (
          <div style={{ background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(236,232,221,0.1)', paddingBottom: 10, fontSize: 18, fontWeight: 400, color: 'var(--paper)', fontFamily: 'var(--font-fraunces,Georgia,serif)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag (optional)" style={{ background: 'transparent', border: 'none', fontSize: 11, color: 'var(--gold)', outline: 'none', letterSpacing: '0.1em', width: '100%', boxSizing: 'border-box' }} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Start writing…" rows={16} style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--paper)', outline: 'none', resize: 'vertical', lineHeight: 1.75, width: '100%', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: '1px solid rgba(236,232,221,0.08)', paddingTop: 14 }}>
              <button onClick={saveNote} disabled={saving} style={{ fontSize: 12, fontWeight: 600, color: 'var(--paper)', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.12)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
              {savedAt && <span style={{ fontSize: 11, color: '#4caf82' }}>✓ Saved {savedAt}</span>}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button onClick={exportWord} style={{ fontSize: 12, color: 'var(--paper)', background: 'rgba(90,127,214,0.15)', border: '1px solid rgba(90,127,214,0.25)', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Word</button>
                <button onClick={exportPDF} style={{ fontSize: 12, fontWeight: 600, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>PDF</button>
                <button onClick={deleteNote} style={{ fontSize: 12, color: '#e05c5c', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.18)', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Delete</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 12 }}>Select a note or create one</p>
            <button onClick={createNote} style={{ fontSize: 12, fontWeight: 600, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer' }}>+ New Note</button>
          </div>
        )}
      </div>
    </div>
  )
}
