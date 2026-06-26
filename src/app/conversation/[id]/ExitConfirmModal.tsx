// 대화 중 나가기 버튼 클릭 시 표시되는 확인 모달
'use client';

import { Button } from '@/components/ui/Button';

interface ExitConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ExitConfirmModal({ onConfirm, onCancel }: ExitConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="mx-6 w-full max-w-sm rounded-2xl bg-card px-6 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-foreground mb-2">End this conversation?</h2>
        <p className="text-sm text-muted-foreground mb-6 whitespace-nowrap">
          If you leave now, your progress won't be saved.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" onClick={onConfirm}>Leave</Button>
          <Button size="md" onClick={onCancel}>Keep going</Button>
        </div>
      </div>
    </div>
  );
}
