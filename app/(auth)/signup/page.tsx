'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      // Auto sign in after signup
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) {
        setDone(true) // show "check email" if auto-login fails (email confirmation required)
      } else {
        router.push('/')
        router.refresh()
      }
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjw-logo.png" alt="MJW" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', margin: 0 }}>MJW Meeting</p>
              <p style={{ fontSize: 10, color: 'var(--slate-dk)', margin: 0, marginTop: 1, letterSpacing: '0.05em' }}>No Noise. Just Signal.</p>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '28px 24px 24px' }}>
            {done ? (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--paper)', margin: '0 0 8px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>
                  Check your email
                </h1>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 20px' }}>
                  A confirmation link has been sent to <strong style={{ color: 'var(--paper)' }}>{email}</strong>. Click it to activate your account.
                </p>
                <Link href="/login" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>Back to sign in →</Link>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--paper)', margin: '0 0 4px', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em' }}>
                  Create account
                </h1>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 24px' }}>Set up your MJW Meeting access.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', color: 'var(--paper)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', color: 'var(--paper)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Confirm password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', color: 'var(--paper)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {error && (
                    <p style={{ fontSize: 12, color: '#e05c5c', margin: 0 }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: loading ? 'var(--gold-dk)' : 'linear-gradient(120deg, var(--gold-lt), var(--gold))',
                      border: 'none',
                      borderRadius: 8,
                      color: '#000',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginTop: 4,
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--slate-dk)' }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in.</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
