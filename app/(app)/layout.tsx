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
    <div className="min-h-screen flex" style={{ background: 'var(--black)', color: 'var(--paper)' }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col" style={{ background: 'var(--ink)', borderRight: '1px solid var(--line)' }}>

        {/* Brand */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mjw-logo.png"
              alt="MJW"
              width={32}
              height={32}
              className="rounded-full object-cover shrink-0"
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.06em]" style={{ color: 'var(--paper)', fontFamily: 'var(--font-inter, Inter, system-ui)' }}>
                MJW Meeting
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                Meeting Command
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink href="/" icon={<HomeIcon />} label="Dashboard" />
          <NavLink href="/meeting/new" icon={<PlusIcon />} label="New Meeting" highlight />
          <div className="pt-5 pb-1.5 px-2">
            <span className="text-[9px] font-semibold tracking-[0.22em] uppercase" style={{ color: 'var(--slate)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              Workspace
            </span>
          </div>
          <NavLink href="/archive" icon={<ArchiveIcon />} label="Archive" />
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            {avatar ? (
              <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--line)' }} />
            ) : (
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--gold-dk), var(--gold))', color: '#000' }}>
                {name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--paper)' }}>{name}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" title="Sign out" style={{ color: 'var(--slate-dk)' }}>
                <SignOutIcon />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
  if (highlight) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(201,162,75,0.10)', border: '1px solid rgba(201,162,75,0.18)', color: 'var(--gold-lt)' }}
      >
        <span style={{ color: 'var(--gold)' }}>{icon}</span>
        {label}
      </Link>
    )
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
      style={{ color: 'var(--paper)' }}
    >
      <span style={{ color: 'var(--slate)' }}>{icon}</span>
      {label}
    </Link>
  )
}

function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}
