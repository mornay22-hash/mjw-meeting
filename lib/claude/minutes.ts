import OpenAI from 'openai'
import { MinutesJSON } from '@/types'

const openai = new OpenAI({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function draftMinutes(
  title: string,
  date: string,
  duration: number | null,
  attendees: string[],
  transcript: string
): Promise<MinutesJSON> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are MJW Meeting OS. Draft structured meeting minutes. Extract decisions and actions precisely. No hallucination. Return JSON only.',
      },
      {
        role: 'user',
        content: `Meeting: ${title}
Date: ${date}, Duration: ${duration ? `${duration} mins` : 'unknown'}
Attendees: ${attendees.join(', ')}
Transcript: ${transcript}

Return JSON:
{
  "agenda": "string",
  "discussion": "string",
  "decisions": ["string"],
  "actions": [{ "item": "string", "owner": "string", "due_date": "string" }],
  "next_steps": ["string"]
}`,
      },
    ],
  })

  const text = response.choices[0].message.content || ''
  return JSON.parse(text) as MinutesJSON
}
