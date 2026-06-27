// OpenRouter TTS(기본 Gemini Flash TTS)로 한국어 음성을 생성해 프록시하는 라우트
// Gemini TTS는 PCM(24kHz/16bit/mono)만 반환하므로 WAV 헤더를 씌워 브라우저가 재생 가능한 audio/wav로 변환
import { NextResponse } from 'next/server';

const OPENROUTER_TTS_URL = 'https://openrouter.ai/api/v1/audio/speech';
const SAMPLE_RATE = 24000; // Gemini TTS 출력 샘플레이트
const BITS = 16;
const CHANNELS = 1;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const text = params.get('text')?.trim();
  if (!text) {
    return NextResponse.json({ error: 'text 파라미터가 필요합니다.' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  // voice 파라미터로 화자 보이스를 고른다.
  //  - feedback: 교정 카드 발음용 한국어 여성 보이스
  //  - female: 여성 화자 시나리오의 대화 보이스
  //  - 그 외: 기본 대화(남성) 보이스
  // env가 빈 문자열이면 ??는 폴백하지 않아(빈 voice → OpenRouter 500) 공백 제거 후 값이 있을 때만 쓴다.
  const voiceKey = params.get('voice');
  const pick = (env: string | undefined, fallback: string) => env?.trim() || fallback;
  const voice =
    voiceKey === 'feedback'
      ? pick(process.env.OPENROUTER_TTS_VOICE_FEEDBACK, 'Kore')
      : voiceKey === 'female'
        ? pick(process.env.OPENROUTER_TTS_VOICE_FEMALE, 'Kore')
        : pick(process.env.OPENROUTER_TTS_VOICE, 'Orus');

  const res = await fetch(OPENROUTER_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_TTS_MODEL ?? 'google/gemini-3.1-flash-tts-preview',
      voice,
      input: text,
      response_format: 'pcm',
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[tts] OpenRouter TTS 실패:', res.status, 'voice=', voice, detail);
    return NextResponse.json({ error: 'TTS 생성 실패' }, { status: 502 });
  }

  const pcm = Buffer.from(await res.arrayBuffer());
  const wav = Buffer.concat([wavHeader(pcm.length), pcm]);
  const total = wav.length;

  // iOS/macOS Safari(WebKit)는 오디오 재생 시 Range 요청을 보내고 206 + Content-Length를
  // 기대한다. 전체 바디를 200(chunked, Content-Length 없음)으로 주면 소스를 거부해
  // (iOS: MEDIA_ERR_SRC_NOT_SUPPORTED, macOS: play() AbortError) 소리가 안 난다.
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'audio/wav',
    'Cache-Control': 'public, max-age=86400',
    'Accept-Ranges': 'bytes',
  };

  const range = request.headers.get('range');
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
  if (match) {
    const start = match[1] ? parseInt(match[1], 10) : 0;
    const end = match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
    if (Number.isNaN(start) || start > end || start >= total) {
      return new NextResponse(null, {
        status: 416, // Range Not Satisfiable
        headers: { ...baseHeaders, 'Content-Range': `bytes */${total}` },
      });
    }
    const chunk = wav.subarray(start, end + 1);
    return new NextResponse(new Uint8Array(chunk), {
      status: 206, // Partial Content
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(chunk.length),
      },
    });
  }

  return new NextResponse(new Uint8Array(wav), {
    headers: { ...baseHeaders, 'Content-Length': String(total) },
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
