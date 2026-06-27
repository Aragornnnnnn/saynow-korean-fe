// OpenRouter TTS(기본 Gemini Flash TTS)로 한국어 음성을 생성해 프록시하는 라우트
// Gemini TTS는 PCM(24kHz/16bit/mono)만 반환하므로 WAV 헤더를 씌워 브라우저가 재생 가능한 audio/wav로 변환
import { NextResponse } from 'next/server';

const OPENROUTER_TTS_URL = 'https://openrouter.ai/api/v1/audio/speech';
const SAMPLE_RATE = 24000; // Gemini TTS 출력 샘플레이트
const BITS = 16;
const CHANNELS = 1;

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
      voice: process.env.OPENROUTER_TTS_VOICE ?? 'Charon',
      input: text,
      response_format: 'pcm',
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[tts] OpenRouter TTS 실패:', res.status, detail);
    return NextResponse.json({ error: 'TTS 생성 실패' }, { status: 502 });
  }

  const pcm = Buffer.from(await res.arrayBuffer());
  const wav = Buffer.concat([wavHeader(pcm.length), pcm]);

  return new NextResponse(wav, {
    headers: {
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

// PCM 데이터 앞에 붙일 44바이트 WAV 헤더 생성
function wavHeader(dataSize: number): Buffer {
  const byteRate = (SAMPLE_RATE * CHANNELS * BITS) / 8;
  const blockAlign = (CHANNELS * BITS) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return header;
}
