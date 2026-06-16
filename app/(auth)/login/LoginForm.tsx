'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ logoSrc }: { logoSrc: string }) {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--line)',
    padding: '6px 0 8px',
    color: 'var(--paper)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    color: 'var(--slate)',
    marginBottom: 4,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Branding — ABOVE card, like MJW Site Report */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingLeft: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="MJW"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block' }}
          />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper)', margin: 0, lineHeight: 1.3 }}>MJW Meeting</p>
            <p style={{ fontSize: 11, color: 'var(--slate-dk)', margin: 0, letterSpacing: '0.08em' }}>No Noise. Just Signal.</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--line)', borderRadius: 12, padding: '28px 28px 24px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 400, color: 'var(--paper)', margin: '0 0 4px', fontFamily: 'var(--font-fraunces, Georgia, serif)', letterSpacing: '-0.01em' }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 24px' }}>Welcome back.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#e05c5c', margin: '-8px 0 0' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(120deg, var(--gold-lt), var(--gold))',
                border: 'none',
                borderRadius: 8,
                color: '#000',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                marginTop: 4,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--slate-dk)' }}>
            {"Don't have an account? "}
            <Link href="/signup" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Create one.</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
