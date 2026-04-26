import { useState } from 'react';

const isInstagramIAB = () => /Instagram/.test(navigator.userAgent);

export default function IABGuide() {
  const [dismissed, setDismissed] = useState(false);

  if (!isInstagramIAB() || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6">
      <div className="w-full max-w-lg mx-auto bg-bg-card rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-card-ink font-bold text-sm">링크가 제대로 열리지 않을 수 있어요</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-card-ink-faint text-xl leading-none ml-2">×</button>
        </div>

        <p className="text-card-ink-muted text-sm mb-4 leading-relaxed">
          인스타그램 내부 브라우저에서는 링크가 막혀요.<br />
          외부 브라우저로 열면 바로 연결됩니다.
        </p>

        <div className="bg-bg-primary/5 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-card-ink-muted text-sm">우측 상단 <span className="text-card-ink font-bold">···</span> 버튼을 탭하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="text-card-ink-muted text-sm"><span className="text-bg-primary font-bold">"브라우저에서 열기"</span>를 선택하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <span className="text-card-ink-muted text-sm">버튼을 누르면 바로 연결됩니다 ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
