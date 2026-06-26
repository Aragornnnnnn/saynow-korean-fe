// 온보딩 4단계 — 첫 시나리오 해금 (흑백 → 컬러 전환)
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { type ApiScenario } from '@/lib/api';
import { getScenarioImage } from '@/lib/scenarioImages';

export function ScenarioStep({
  scenario,
  isPending,
  errorMessage,
  isUnlocked,
  onRetry,
  onStart,
}: {
  scenario: ApiScenario | null;
  isPending: boolean;
  errorMessage: string | null;
  isUnlocked: boolean;
  onRetry: () => void;
  onStart: () => void;
}) {
  return (
    <>
      <div className="flex flex-1 flex-col pt-7 gap-6">
        <h1 className="text-[30px] font-black leading-[1.18] tracking-normal">
          You&apos;re all set
          <br />
          Your first conversation is waiting
        </h1>

        {isPending ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--onboarding-muted)]">
            <LoaderCircle className="animate-spin" size={28} />
            <p className="text-sm font-semibold">Loading your scenario...</p>
          </div>
        ) : errorMessage ? (
          <div
            className="space-y-4 rounded-[24px] border p-5 text-center"
            style={{ backgroundColor: 'var(--onboarding-panel)', borderColor: 'var(--onboarding-line)' }}
          >
            <p className="text-sm font-semibold leading-relaxed text-[var(--onboarding-muted)]">{errorMessage}</p>
            <button type="button" onClick={onRetry} className="text-sm font-bold text-primary">
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            {/* 메인 이미지 */}
            <div className="relative w-full overflow-hidden rounded-[24px]" style={{ aspectRatio: '4/3' }}>
              <img
                src={scenario ? getScenarioImage(scenario.scenarioId) : getScenarioImage(1)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            {/* 이미지 바깥 텍스트 */}
            <AnimatePresence>
              {isUnlocked && scenario && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <p className="text-lg font-extrabold text-foreground">{scenario.scenarioTitle}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--onboarding-muted)] line-clamp-2">{scenario.briefing}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Button onClick={onStart} disabled={!scenario || isPending || !!errorMessage || !isUnlocked}>
        Let&apos;s start!
      </Button>
    </>
  );
}
