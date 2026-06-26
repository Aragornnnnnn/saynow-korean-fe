// iOS / Android 마이크 권한 요청 UI 미리보기 (인터랙션 없음)
'use client';

import { useEffect, useState } from 'react';
import { type PermissionPreviewPlatform } from '../_types';

export function PermissionPreview() {
  const [platform, setPlatform] = useState<PermissionPreviewPlatform>('ios');

  useEffect(() => {
    if (/Android/i.test(navigator.userAgent)) {
      setPlatform('android');
    }
  }, []);

  if (platform === 'android') return <AndroidPermissionPreview />;
  return <IosPermissionPreview />;
}

function IosPermissionPreview() {
  return (
    <div className="relative mx-auto w-[310px] overflow-visible">
      <div
        className="overflow-hidden rounded-[16px] border"
        style={{ backgroundColor: 'var(--onboarding-panel)', borderColor: 'var(--onboarding-line)' }}
      >
        <div className="px-5 pb-5 pt-6 text-center">
          <div className="space-y-2">
            <p className="text-[19px] font-semibold leading-snug">
              &ldquo;Landit&rdquo; Would Like to
              <br />
              Access the Microphone
            </p>
            <p className="text-[14px] leading-snug text-[var(--onboarding-muted)]">
              Needed to hear your spoken replies and keep the conversation going.
            </p>
          </div>
        </div>
        <div
          className="grid h-13 grid-cols-2 border-t text-[18px]"
          style={{ borderColor: 'var(--onboarding-line)' }}
        >
          <div
            className="flex items-center justify-center border-r text-[#007AFF] opacity-60"
            style={{ borderColor: 'var(--onboarding-line)' }}
          >
            Don&apos;t Allow
          </div>
          <div className="flex items-center justify-center font-semibold text-[#007AFF]">
            Allow
          </div>
        </div>
      </div>
      <span className="tossface pointer-events-none absolute -bottom-9 right-[45px] text-[40px] leading-none">
        👆
      </span>
    </div>
  );
}

function AndroidPermissionPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[326px]">
      <div className="rounded-[30px] bg-white px-6 pb-5 pt-6 text-center text-[#202124]">
        <div className="mx-auto mb-5 flex h-7 w-10 items-center justify-center rounded-md bg-[#4D72F5]">
          <span className="h-3 w-3 rounded-full bg-white" />
          <span className="-ml-0.5 h-1.5 w-1.5 rounded-full bg-white/80" />
        </div>
        <p className="mx-auto max-w-[264px] text-[16px] font-semibold leading-snug">
          Allow Landit to record audio?
        </p>
        <div className="mt-7 space-y-1 text-[20px] font-bold leading-none">
          <div className="relative flex h-14 w-full items-center justify-center">
            While using the app
            <span className="tossface pointer-events-none absolute right-0 text-[34px] leading-none">👈</span>
          </div>
          <div className="flex h-14 items-center justify-center opacity-40">Only this time</div>
          <div className="flex h-14 items-center justify-center opacity-40">Don&apos;t allow</div>
        </div>
      </div>
    </div>
  );
}
