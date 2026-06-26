// 온보딩 3단계 — 마이크 권한 요청
'use client';

import { Button } from '@/components/ui/Button';
import { PermissionPreview } from '../_components/PermissionPreview';
import { type MicPermissionState } from '../_types';

export function MicStep({
  micState,
  onAllow,
  onOpenSettings,
  isNative,
}: {
  micState: MicPermissionState;
  onAllow: () => void;
  onOpenSettings: () => void;
  isNative: boolean;
}) {
  const isDenied = micState === 'denied';

  return (
    <>
      <div className="flex flex-1 flex-col pt-7">
        <h1 className="text-[30px] font-black leading-[1.18] tracking-normal">
          Next, turn on your mic
          <br />
          so I can hear you speak
        </h1>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-8">
          <PermissionPreview />

          {isDenied && (
            <p className="text-center text-sm font-medium leading-relaxed text-[var(--onboarding-muted)]">
              Mic access is turned off.
              <br />
              Enable it in Settings to continue.
            </p>
          )}
        </div>
      </div>

      {isDenied ? (
        isNative && (
          <Button variant="ghost" onClick={onOpenSettings}>
            Open Settings
          </Button>
        )
      ) : (
        <Button onClick={onAllow} loading={micState === 'requesting'}>
          Turn on my mic!
        </Button>
      )}
    </>
  );
}
