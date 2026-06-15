import { headers } from 'next/headers'

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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      {/* Background radial */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold tracking-[0.35em] text-white/20 uppercase mb-2">MJW</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Meeting OS</h1>
          <p className="text-sm text-white/30 mt-2">No Noise. Just Signal.</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Sign in to continue</h2>
            <p className="text-xs text-white/30">Use your Google account to access your workspace</p>
          </div>

          <a
            href={oauthUrl}
            className="w-full flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-black/20 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="flex-1 text-center text-sm">Sign in with Google</span>
          </a>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[10px] text-white/20 uppercase tracking-wider">Secure access</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-white/20">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Calendar
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Email minutes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Drive export
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-6">
          MJW Environment — Confidential
        </p>
      </div>
    </div>
  )
}
