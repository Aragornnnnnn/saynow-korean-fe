// 온보딩 사운드 스텝의 고정 문장을 OpenRouter TTS로 미리 .wav 생성하는 빌드 스크립트
// 런타임 실시간 생성(~1.6초)을 없애기 위해 public/onboarding-tts/sound-{i}.wav 로 굽는다.
// 보이스/모델이 바뀌면 다시 실행: `node scripts/generate-onboarding-tts.mjs`
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// src/app/onboarding/_types.ts 의 SOUND_QUESTIONS 와 동일하게 유지할 것
const SOUND_QUESTIONS = [
  '안녕하세요! 제 목소리 잘 들리세요?',
  '반가워요! 오늘 기분 어때요?',
  '안녕하세요! 한국어 같이 연습해요.',
  '제 말 또렷하게 들리나요?',
  '안녕하세요! 만나서 반가워요.',
];

const OPENROUTER_TTS_URL = 'https://openrouter.ai/api/v1/audio/speech';
const SAMPLE_RATE = 24000;
const BITS = 16;
const CHANNELS = 1;

// .env.local 에서 키/보이스/모델을 읽어온다(dotenv 없이 최소 파싱)
async function loadEnv() {
  const raw = await readFile(join(ROOT, '.env.local'), 'utf8').catch(() => '');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function wavHeader(dataSize) {
  const byteRate = (SAMPLE_RATE * CHANNELS * BITS) / 8;
  const blockAlign = (CHANNELS * BITS) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return header;
}

async function main() {
  const env = await loadEnv();
  const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY 가 .env.local 에 없습니다.');
  const model = env.OPENROUTER_TTS_MODEL || 'google/gemini-3.1-flash-tts-preview';
  const voice = env.OPENROUTER_TTS_VOICE || 'Charon';

  const outDir = join(ROOT, 'public', 'onboarding-tts');
  await mkdir(outDir, { recursive: true });

  console.log(`보이스=${voice} 모델=${model}`);
  for (let i = 0; i < SOUND_QUESTIONS.length; i++) {
    const text = SOUND_QUESTIONS[i];
    const res = await fetch(OPENROUTER_TTS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, voice, input: text, response_format: 'pcm' }),
    });
    if (!res.ok) {
      throw new Error(`[${i}] TTS 실패 ${res.status}: ${await res.text().catch(() => '')}`);
    }
    const pcm = Buffer.from(await res.arrayBuffer());
    const wav = Buffer.concat([wavHeader(pcm.length), pcm]);
    const file = join(outDir, `sound-${i}.wav`);
    await writeFile(file, wav);
    console.log(`✓ sound-${i}.wav (${wav.length}B) — "${text}"`);
  }
  console.log('완료. public/onboarding-tts/ 에 저장됨.');
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
