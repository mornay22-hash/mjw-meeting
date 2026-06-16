import { headers } from 'next/headers'
import Image from 'next/image'

export default async function LoginPage() {
  const headersList = await headers()
  const host = headersList.get('host') || 'mjw-meeting.vercel.app'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/api/auth/callback`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.file',
  ].join(' ')

  const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&scopes=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--black)' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(201,162,75,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-6" style={{ width: 64, height: 64 }}>
            <Image
              src="/mjw-logo.png"
              alt="MJW"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
          <p className="mb-1" style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--slate-dk)', fontFamily: 'var(--font-jetbrains-mono, monospace)', textTransform: 'uppercase' }}>
            MJW
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: 'var(--paper)', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.02em' }}>
            Meeting <em style={{ color: 'var(--gold-lt)', fontStyle: 'italic' }}>Command</em>
          </h1>
          <p className="mt-2" style={{ fontSize: 13, color: 'var(--slate)', letterSpacing: '0.03em' }}>
            No Noise. Just Signal.
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'var(--ink2)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '28px 24px',
        }}>
          <div className="mb-6">
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper)', marginBottom: 4 }}>Sign in to continue</h2>
            <p style={{ fontSize: 12, color: 'var(--slate-dk)' }}>Access your meeting workspace with Google</p>
          </div>

          <a
            href={oauthUrl}
            className="flex items-center gap-3 w-full transition-opacity hover:opacity-90 active:scale-[0.99]"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '12px 16px',
              textDecoration: 'none',
              boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
            }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
              Sign in with Google
            </span>
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 10, color: 'var(--slate-dk)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              Secure access
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* Features */}
          <div className="flex justify-center gap-5">
            {['Calendar', 'Email minutes', 'Drive'].map(f => (
              <span key={f} className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--slate-dk)' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--gold-dk)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center mt-6" style={{ fontSize: 11, color: 'var(--slate-dk)', letterSpacing: '0.05em' }}>
          MJW Environment — Confidential
        </p>
      </div>
    </div>
  )
}
