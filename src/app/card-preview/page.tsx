// 시나리오 카드 UI 확인용 임시 프리뷰 페이지
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getScenarioImage } from '@/lib/scenarioImages';

const MOCK_SCENARIOS = [
  { scenarioId: 4, scenarioTitle: 'Airport immigration', briefing: 'You’ve arrived at the airport and need to get through immigration. Answer the officer’s questions naturally.', locked: false, completed: true, lockReason: null },
  { scenarioId: 5, scenarioTitle: 'Ordering at a cafe', briefing: 'You step into a cozy little cafe. Order the drink you want and try a custom request too.', locked: false, completed: false, lockReason: null },
  { scenarioId: 6, scenarioTitle: 'Hotel check-in', briefing: 'You’ve arrived at the hotel you booked. Walk through the check-in with the front desk.', locked: true, completed: false, lockReason: null },
];

const allCompleted = MOCK_SCENARIOS.every((s) => s.completed);
const TOTAL_DOTS = MOCK_SCENARIOS.length + 1;

// 카드 높이 고정 — 슬롯(844)보다 작아야 위아래 peek 가능
const CARD_H = 560;
// 슬롯 높이 = 844 (뷰포트와 동일)
const SLOT_H = 680; // 뷰포트(844)보다 작아야 위아래 인접 슬롯이 노출됨

export default function CardPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1c1c1e' }}>
      <div className="relative flex flex-col overflow-hidden" style={{ width: 390, height: 844, background: '#F2F2F7' }}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ paddingTop: 16, paddingBottom: 8, borderBottom: '1px solid #ebebeb', background: '#fbfbfa' }}>
          <div className="flex items-center gap-2">
            <span className="tossface text-[22px] leading-none">🗂️</span>
            <span className="text-[17px] font-bold" style={{ color: '#111' }}>Conversations</span>
          </div>
          <button className="flex flex-col items-center gap-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-[9px] font-medium" style={{ color: '#888' }}>Profile</span>
          </button>
        </div>

        {/* 수직 인디케이터 */}
        <div className="absolute right-1.5 top-1/2 z-20 flex flex-col items-center gap-1.5 -translate-y-1/2">
          {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
            const isLast = i === TOTAL_DOTS - 1;
            const isActive = i === activeIndex;
            const color = isActive ? '#111' : '#ccc';
            if (isLast && !allCompleted) {
              return (
                <svg key={i} width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <rect x="1" y="4.5" width="8" height="7" rx="1.5" fill={color} />
                  <path d="M3 4.5V3a2 2 0 1 1 4 0v1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              );
            }
            return (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: 6, height: isActive ? 20 : 6, background: color }} />
            );
          })}
        </div>

        {/* 스크롤 컨테이너 */}
        <div
          className="no-scrollbar h-full overflow-y-auto snap-y snap-mandatory"
          style={{ paddingTop: 40, paddingBottom: 40, boxSizing: 'content-box' }}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActiveIndex(Math.round(el.scrollTop / SLOT_H));
          }}
        >
          {MOCK_SCENARIOS.map((scenario, index) => (
            <div
              key={scenario.scenarioId}
              className="snap-center flex items-center justify-center"
              style={{ height: SLOT_H, paddingLeft: 20, paddingRight: 20 }}
            >
              <motion.div
                style={{ width: '100%', height: CARD_H }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <ScenarioCard scenario={scenario} />
              </motion.div>
            </div>
          ))}

          {/* 4번째 슬롯 */}
          <div className="snap-start flex flex-col items-center justify-center gap-4" style={{ height: SLOT_H }}>
            {allCompleted ? (
              <>
                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" alt="🎉" style={{ width: 120, height: 120 }} />
                <div className="text-center px-6">
                  <p className="text-[26px] font-extrabold leading-snug" style={{ color: '#222' }}>You did all three!</p>
                  <p className="text-[18px] font-medium mt-3" style={{ color: '#888' }}>More situations coming soon!</p>
                </div>
              </>
            ) : (
              <>
                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2753/512.gif" alt="❓" style={{ width: 120, height: 120 }} />
                <div className="text-center px-6">
                  <p className="text-[26px] font-extrabold leading-snug" style={{ color: '#222' }}>The next situation is waiting</p>
                  <p className="text-[18px] font-medium mt-3" style={{ color: '#888' }}>Try all three to find out!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: typeof MOCK_SCENARIOS[0] }) {
  const isLocked = scenario.locked;
  const isCompleted = scenario.completed;

  return (
    <div className="w-full h-full flex flex-col rounded-[20px] overflow-hidden shadow-md" style={{ background: '#fff' }}>
      {/* 이미지 섹션 — flex-1로 남은 공간 채움 */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img
          src={getScenarioImage(scenario.scenarioId, 'play')}
          alt={scenario.scenarioTitle}
          className={`w-full h-full object-cover ${isLocked ? 'grayscale opacity-40' : ''}`}
        />
        {isCompleted && (
          <div className="absolute top-3 right-3 rounded-full p-1.5" style={{ background: '#22c55e' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Lock size={28} className="text-white/70" />
          </div>
        )}
      </div>

      {/* 텍스트 + 버튼 섹션 — 고정 높이 */}
      <div className="px-5 pt-4 pb-5" style={{ flexShrink: 0 }}>
        <p className="text-[20px] font-extrabold leading-snug" style={{ color: isLocked ? '#999' : '#111' }}>
          {scenario.scenarioTitle}
        </p>
        <p className="mt-1.5 text-[14px] font-medium leading-relaxed" style={{ color: '#888' }}>
          {scenario.briefing}
        </p>
        <button
          disabled={isLocked}
          className="mt-4 w-full rounded-[14px] py-4 text-[17px] font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: isLocked ? '#ccc' : '#111' }}
        >
          {isLocked ? 'Locked' : 'Start'}
        </button>
      </div>
    </div>
  );
}
