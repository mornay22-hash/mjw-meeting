import Anthropic from '@anthropic-ai/sdk'
import { MinutesJSON } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function draftMinutes(
  title: string,
  date: string,
  duration: number | null,
  attendees: string[],
  transcript: string
): Promise<MinutesJSON> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system:
      'You are MJW Meeting OS. Draft structured meeting minutes. Extract decisions and actions precisely. No hallucination. Return JSON only.',
    messages: [
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

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleaned) as MinutesJSON
}
