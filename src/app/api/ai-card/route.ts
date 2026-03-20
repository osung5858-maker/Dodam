import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { ageMonths, cardType, context } = await request.json()

  const prompt = `당신은 "도담"이라는 육아 앱의 AI 케어 파트너입니다.
따뜻하고 부드러운 톤으로, 부모를 안심시키면서 구체적 행동을 제안하세요.
"도담하게"라는 표현을 자연스럽게 사용하세요.
의료 조언은 절대 하지 마세요.

아기 개월수: ${ageMonths}개월
카드 유형: ${cardType}
컨텍스트: ${context}

2~3문장으로 짧고 따뜻하게 작성해주세요. JSON이 아닌 순수 텍스트로만 응답하세요.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
        }),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({ text: text.trim() })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
