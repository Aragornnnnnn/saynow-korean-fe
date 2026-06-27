// OpenRouter TTS(기본 Gemini Flash TTS)로 한국어 음성을 생성해 프록시하는 라우트
import { NextResponse } from 'next/server';

const OPENROUTER_TTS_URL = 'https://openrouter.ai/api/v1/audio/speech';

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get('text')?.trim();
  if (!text) {
    return NextResponse.json({ error: 'text 파라미터가 필요합니다.' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const res = await fetch(OPENROUTER_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_TTS_MODEL ?? 'google/gemini-3.1-flash-tts-preview',
      voice: process.env.OPENROUTER_TTS_VOICE ?? 'Kore',
      input: text,
      response_format: 'mp3',
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[tts] OpenRouter TTS 실패:', res.status, detail);
    return NextResponse.json({ error: 'TTS 생성 실패' }, { status: 502 });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
