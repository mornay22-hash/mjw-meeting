import OpenAI from 'openai'
import { BriefJSON } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateBrief(
  title: string,
  date: string,
  attendees: string[],
  description: string,
  objectives: string,
  agendaItems: string[]
): Promise<BriefJSON> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are MJW Meeting OS — a professional meeting intelligence assistant. Generate a concise, practical pre-meeting brief. Be specific and actionable. Return JSON only. No preamble.',
      },
      {
        role: 'user',
        content: `Meeting: ${title}
Date: ${date}
Attendees: ${attendees.length > 0 ? attendees.join(', ') : 'Not specified'}
${description ? `Background & Context: ${description}` : ''}
${objectives ? `Objectives & Desired Outcomes: ${objectives}` : ''}
${agendaItems.length > 0 ? `Pre-set Agenda Items:\n${agendaItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : ''}

Based on the above, generate a pre-meeting brief. Return JSON:
{
  "context_summary": "3-5 sentences summarising what this meeting is about and why it matters",
  "agenda_draft": ["Complete agenda — incorporate pre-set items and add any missing ones, 4-8 items total"],
  "questions_to_raise": ["2-4 key questions that should be asked or resolved in this meeting"],
  "watch_points": ["1-3 risks, blockers, or things to watch out for going into this meeting"]
}`,
      },
    ],
  })

  const text = response.choices[0].message.content || ''
  return JSON.parse(text) as BriefJSON
}
