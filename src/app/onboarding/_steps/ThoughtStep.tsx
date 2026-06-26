// 온보딩 — Sona가 상대 속마음을 대신 알려주는 걸 표정별로 시연하는 스텝
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ThoughtCard, type FloatingThought } from '@/components/chat/ThoughtOverlay';

const DEMOS: FloatingThought[] = [
  { type: 'GOOD', text: 'Ooh, they even gave a reason. This chat is flowing!' },
  { type: 'NORMAL', text: 'Got it, I understood you just fine.' },
  { type: 'BAD', text: 'Hmm, I was a little lost there. Try going slower next time!' },
];

export function ThoughtStep({ onNext }: { onNext: () => void }) {
  const [index, setIndex] = useState(0);

  // 표정·예시가 하나씩 바뀌며 반복 시연
  useEffect(() => {
    const timer = setTimeout(() => setIndex((p) => (p + 1) % DEMOS.length), 2600);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <>
      <div className="flex flex-1 flex-col pt-7">
        <h1 className="text-[30px] font-black leading-[1.18] tracking-normal">
          Every time you speak, I&apos;ll pop up
          <br />
          to share what they&apos;re really thinking
        </h1>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex min-h-30 w-full items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex w-full justify-center"
              >
                <ThoughtCard thought={DEMOS[index]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Button onClick={onNext}>Got it!</Button>
    </>
  );
}
