import Anthropic from '@anthropic-ai/sdk'
import { BriefJSON } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateBrief(
  title: string,
  date: string,
  attendees: string[],
  description: string
): Promise<BriefJSON> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: 'You are MJW Meeting OS. Generate a concise pre-meeting brief. Return JSON only. No preamble.',
    messages: [
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

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleaned) as BriefJSON
}
