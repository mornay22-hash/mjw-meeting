import OpenAI from 'openai'
import { BriefJSON } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateBrief(
  title: string,
  date: string,
  attendees: string[],
  description: string
): Promise<BriefJSON> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are MJW Meeting OS. Generate a concise pre-meeting brief. Return JSON only. No preamble.',
      },
      {
        role: 'user',
        content: `Meeting: ${title}
Date: ${date}
Attendees: ${attendees.join(', ')}
Calendar description: ${description || 'None provided'}

Return JSON:
{
  "context_summary": "3-5 sentences max",
  "agenda_draft": ["4-6 agenda items"],
  "questions_to_raise": ["2-3 max"],
  "watch_points": ["risks or blockers to flag"]
}`,
      },
    ],
  })

  const text = response.choices[0].message.content || ''
  return JSON.parse(text) as BriefJSON
}
