'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

const DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1nDWWdaPH4QSA5OmeETVzUHPY_uFHeXQH'

interface Doc { id: string; name: string; url: string | null; doc_type: string; created_at: string }
interface MeetingMinute { meeting_id: string; agenda: string | null; meetings: { id: string; title: string; meeting_date: string; status: string } | null }

export default function DocumentsClient({ initialDocs, meetingMinutes }: { initialDocs: Doc[]; meetingMinutes: MeetingMinute[] }) {
  const supabase = createClient()
  const [docs, setDocs] = useState<Doc[]>(initialDocs)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'drive'|'links'|'minutes'>('drive')

  async function addDoc() {
    if (!newName.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('documents').insert({ name: newName, url: newUrl || null, user_id: user!.id }).select().single()
    if (data) { setDocs(prev => [data, ...prev]); setNewName(''); setNewUrl(''); setAdding(false) }
  }

  async function deleteDoc(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--paper)' : 'var(--slate)', background: active ? 'var(--ink3)' : 'transparent', border: active ? '1px solid rgba(236,232,221,0.12)' : '1px solid transparent', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', whiteSpace: 'nowrap'
  })

  const card: React.CSSProperties = { background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono,monospace)', marginBottom: 4 }}>Documents</p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces,Georgia,serif)', letterSpacing: '-0.02em', margin: 0 }}>Documents & Drive</h1>
          <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>Your linked files, Google Docs, and meeting notes archive</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'rgba(90,127,214,0.15)', border: '1px solid rgba(90,127,214,0.3)', borderRadius: 8, color: 'var(--blue-lt)', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            Open Drive Folder
          </a>
          <button onClick={() => setAdding(true)} style={{ fontSize: 12, fontWeight: 700, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Link</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(236,232,221,0.08)', paddingBottom: 12 }}>
        <button onClick={() => setActiveTab('drive')} style={tabStyle(activeTab === 'drive')}>Google Drive</button>
        <button onClick={() => setActiveTab('links')} style={tabStyle(activeTab === 'links')}>Saved Links ({docs.length})</button>
        <button onClick={() => setActiveTab('minutes')} style={tabStyle(activeTab === 'minutes')}>Meeting Notes ({meetingMinutes.length})</button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: 'var(--ink2)', border: '1px solid rgba(201,162,75,0.25)', borderRadius: 10, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Document name *" style={{ background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 7, padding: '8px 12px', color: 'var(--paper)', fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' as const }} autoFocus />
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Google Doc URL (optional)" style={{ background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 7, padding: '8px 12px', color: 'var(--paper)', fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addDoc} style={{ fontSize: 12, fontWeight: 700, color: '#000', background: 'linear-gradient(120deg,var(--gold-lt),var(--gold))', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setAdding(false)} style={{ fontSize: 12, color: 'var(--slate)', background: 'var(--ink3)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 7, padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* DRIVE TAB */}
      {activeTab === 'drive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Primary folder card */}
          <a href={DRIVE_FOLDER} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(90,127,214,0.08)', border: '1px solid rgba(90,127,214,0.25)', borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(90,127,214,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#5A7FD6" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>MJW Meeting — Google Drive Folder</p>
                <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Past meeting notes, agendas and documents</p>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--blue-lt)" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </div>
          </a>
          <div style={{ padding: '12px 4px' }}>
            <p style={{ fontSize: 12, color: 'var(--slate)' }}>Use this folder to store all meeting-related files. Click to open in Google Drive.</p>
            <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>Add individual document links using the <strong style={{ color: 'var(--paper)' }}>Saved Links</strong> tab, or view auto-saved meeting notes under <strong style={{ color: 'var(--paper)' }}>Meeting Notes</strong>.</p>
          </div>
        </div>
      )}

      {/* LINKS TAB */}
      {activeTab === 'links' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {docs.length === 0 && <div style={{ padding: '32px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 10 }}><p style={{ fontSize: 13, color: 'var(--slate)' }}>No saved links yet. Click <strong style={{ color: 'var(--paper)' }}>+ Add Link</strong> to save a Google Doc URL.</p></div>}
          {docs.map(d => (
            <div key={d.id} style={card}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                {d.url && <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.url}</p>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--blue-lt)', background: 'rgba(90,127,214,0.1)', border: '1px solid rgba(90,127,214,0.2)', borderRadius: 6, padding: '4px 10px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Open</a>}
                <button onClick={() => deleteDoc(d.id)} style={{ fontSize: 11, color: '#e05c5c', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.15)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MINUTES TAB */}
      {activeTab === 'minutes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {meetingMinutes.length === 0 && <div style={{ padding: '32px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid rgba(236,232,221,0.1)', borderRadius: 10 }}><p style={{ fontSize: 13, color: 'var(--slate)' }}>No meeting notes saved yet. Notes are auto-saved when you complete a meeting&apos;s minutes.</p></div>}
          {meetingMinutes.map(m => {
            if (!m.meetings) return null
            const href = m.meetings.status === 'post' ? `/meeting/${m.meetings.id}/minutes` : `/meeting/${m.meetings.id}/archive`
            return (
              <Link key={m.meeting_id} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ ...card, cursor: 'pointer' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.meetings.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0 }}>{new Date(m.meetings.meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: 'rgba(201,162,75,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,75,0.2)', flexShrink: 0, whiteSpace: 'nowrap' }}>View Notes →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
