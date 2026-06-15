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
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const interimRef = useRef('')

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech recognition not supported in this browser. Please use Chrome.'); return }

    const recognition: SpeechRecognitionInstance = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
        else interim += t
      }
      if (final) setTranscript(prev => prev + final)
      interimRef.current = interim
    }

    recognition.onerror = (e: { error: string }) => setError(`Mic error: ${e.error}`)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setIsRecording(false)
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
    return () => recognitionRef.current?.stop()
  }, [])

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Meeting Room</p>
          <h1 className="text-xl font-semibold text-white">{meeting.title}</h1>
        </div>
        <button
          onClick={endMeeting}
          disabled={saving}
          className="shrink-0 bg-red-800 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'End meeting'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-green-700 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-green-300 rounded-full" />
            Start mic
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
            Stop mic
          </button>
        )}

        <label className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer">
          Import transcript
          <input type="file" accept=".txt,.vtt,.docx" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Transcript</p>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Transcript will appear here…"
            className="w-full h-72 bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-700 resize-none focus:outline-none focus:border-gray-600"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes, decisions, or action items…"
            className="w-full h-72 bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-700 resize-none focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>
    </div>
  )
}
