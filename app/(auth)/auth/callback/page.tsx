'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/')
        return
      }

      // Handle hash-based implicit flow tokens
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.push('/')
          } else if (event === 'SIGNED_OUT' || !session) {
            router.push('/login?error=auth_failed')
          }
        })
      } else {
        // Handle PKCE code flow
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) {
              router.push('/login?error=auth_failed')
            } else {
              router.push('/')
            }
          })
        } else {
          router.push('/login?error=auth_failed')
        }
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
