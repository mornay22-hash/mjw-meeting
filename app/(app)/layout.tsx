import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'MJW'
  const avatar = user.user_metadata?.avatar_url

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--black)', color: 'var(--paper)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--ink)', borderRight: '1px solid var(--line)' }}>

        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--line)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg, #c8a94a, #e8c96a)', border: '2px solid rgba(201,162,75,0.6)', boxShadow: '0 0 14px rgba(201,162,75,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/mjw-logo.png" alt="MJW" width={34} height={34} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--paper)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>MJW Meeting</p>
              <p style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-jetbrains-mono, monospace)', opacity: 0.75 }}>Meeting Command</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <NavLink href="/" icon={<HomeIcon />} label="Dashboard" />
          <NavLink href="/meeting/new" icon={<PlusIcon />} label="New Meeting" highlight />

          <NavSection label="Workspace" />
          <NavLink href="/calendar" icon={<CalendarIcon />} label="Calendar" />
          <NavLink href="/notes" icon={<NotesIcon />} label="Notes" />
          <NavLink href="/tasks" icon={<TasksIcon />} label="Tasks" />
          <NavLink href="/documents" icon={<DocsIcon />} label="Documents" />

          <NavSection label="History" />
          <NavLink href="/archive" icon={<ArchiveIcon />} label="Archive" />
        </nav>

        {/* User */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10 }}>
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line)' }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg, var(--gold-dk), var(--gold))', color: '#000' }}>
                {name[0].toUpperCase()}
              </div>
            )}
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-dk)', padding: 2, display: 'flex' }}>
                <SignOutIcon />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

function NavSection({ label }: { label: string }) {
  return (
    <div style={{ padding: '14px 10px 4px' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{label}</span>
    </div>
  )
}

function NavLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
  if (highlight) {
    return (
      <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--gold-lt)', background: 'rgba(201,162,75,0.10)', border: '1px solid rgba(201,162,75,0.18)', textDecoration: 'none', overflow: 'hidden' }}>
        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </Link>
    )
  }
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: 'var(--paper)', textDecoration: 'none', overflow: 'hidden' }}>
      <span style={{ color: 'var(--slate)', flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </Link>
  )
}

function HomeIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"/></svg> }
function PlusIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> }
function CalendarIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V12zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm-3-6h.008v.008H9.75V12zm0 3h.008v.008H9.75v-.008zm0 3h.008v.008H9.75v-.008zm6-6h.008v.008h-.008V12zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/></svg> }
function NotesIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg> }
function TasksIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function DocsIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg> }
function ArchiveIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg> }
function SignOutIcon() { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg> }
