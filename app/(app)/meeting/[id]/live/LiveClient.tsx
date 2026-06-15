'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Meeting, Transcript } from '@/types'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (e: { error: string }) => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionEvent = {
  resultIndex: number
  results: SpeechRecognitionResultList
}

export default function LiveClient({
  meeting,
  existingTranscript,
}: {
  meeting: Meeting
  existingTranscript: Transcript | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [transcript, setTranscript] = useState(existingTranscript?.raw_text || '')
  const [notes, setNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech recognition not supported. Please use Chrome.'); return }

    const recognition: SpeechRecognitionInstance = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
      }
      if (final) setTranscript(prev => prev + final)
    }

    recognition.onerror = (e: { error: string }) => setError(`Mic error: ${e.error}`)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setTranscript(prev => prev ? prev + '\n\n--- Imported ---\n\n' + text : text)
  }

  async function endMeeting() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fullTranscript = transcript + (notes ? `\n\n--- Notes ---\n${notes}` : '')

    await supabase.from('transcripts').upsert({
      meeting_id: meeting.id,
      user_id: user.id,
      source: isRecording ? 'mic' : 'import',
      raw_text: fullTranscript,
    }, { onConflict: 'meeting_id' })

    await supabase.from('meetings').update({
      status: 'post',
      duration_mins: Math.round((Date.now() - new Date(meeting.meeting_date).getTime()) / 60000),
    }).eq('id', meeting.id)

    router.push(`/meeting/${meeting.id}/minutes`)
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-green-400 uppercase">Live</span>
            {isRecording && (
              <span className="text-[10px] text-white/30 font-mono">{formatElapsed(elapsed)}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{meeting.title}</h1>
        </div>
        <button
          onClick={endMeeting}
          disabled={saving}
          className="shrink-0 flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 border border-red-500/30"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
              End meeting
            </>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/15"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Start mic
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-600/60 hover:bg-red-600/80 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all border border-red-500/30"
          >
            <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
            Recording…  stop
          </button>
        )}

        <label className="flex items-center gap-2 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 text-sm px-4 py-2.5 rounded-xl transition-all border border-white/5 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Import transcript
          <input type="file" accept=".txt,.vtt,.docx" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Dual panels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold tracking-widest text-white/25 uppercase">Transcript</p>
            {isRecording && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
          </div>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Transcript will appear here…"
            className="w-full h-72 bg-white/[0.03] border border-white/5 hover:border-white/8 rounded-2xl p-4 text-sm text-white/70 placeholder-white/15 resize-none focus:outline-none focus:border-white/15 transition-colors font-mono"
          />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-white/25 uppercase">Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes, decisions, or action items…"
            className="w-full h-72 bg-white/[0.03] border border-white/5 hover:border-white/8 rounded-2xl p-4 text-sm text-white/70 placeholder-white/15 resize-none focus:outline-none focus:border-white/15 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
