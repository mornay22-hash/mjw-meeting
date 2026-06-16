import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.slice(0, 7) || 'not set',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
  })
}
