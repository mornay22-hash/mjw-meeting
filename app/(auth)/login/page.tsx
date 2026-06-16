'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
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
            <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--paper)', margin: '0 0 4px', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em' }}>
              Sign in
            </h1>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 24px' }}>Welcome back.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    background: 'var(--ink3)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: 'var(--paper)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'var(--ink3)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: 'var(--paper)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
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
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--slate-dk)' }}>
              {"Don't have an account? "}
              <Link href="/signup" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Create one.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
