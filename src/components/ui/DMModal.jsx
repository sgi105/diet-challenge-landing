import { useState } from 'react';

const DM_URL = 'https://ig.me/m/bali_tarzan';

const TEMPLATE = `🏃 팀 다이어트 챌린지 신청

- 이름:
- 나이:
- 현재 몸무게:  kg
- 목표 몸무게:  kg
- 현재 주 운동 횟수:

📅 4/1(수) 21:00~21:40에 온라인 OT가 있어요. 식단 교육과 팀원들을 만나는 시간으로, 불참시 영상으로 자료를 전달드려요.
- OT 참석 가능: O / X
`;

export default function DMModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDM = () => {
    window.open(DM_URL, '_blank');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-bold text-lg">📩 DM 신청 양식</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-2xl leading-none">×</button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-text-secondary">아래 양식을 복사 후 작성하세요</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="text-text-secondary"><span className="text-accent-green font-semibold">@bali_tarzan</span> DM으로 보내주세요</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <span className="text-text-secondary">확인 후 입금 안내드립니다</span>
          </div>
        </div>

        {/* Template */}
        <div className="bg-bg-primary border border-border rounded-xl px-4 py-4">
          <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans leading-relaxed">{TEMPLATE}</pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
              copied
                ? 'border-accent-green bg-accent-green/10 text-accent-green'
                : 'border-border text-text-secondary hover:border-accent-green/50'
            }`}
          >
            {copied ? '복사됨 ✓' : '양식 복사하기'}
          </button>
          <button
            onClick={handleOpenDM}
            className="flex-1 bg-accent-green text-bg-primary font-bold py-3 rounded-xl text-sm hover:brightness-110 transition-all"
          >
            DM 열기 →
          </button>
        </div>
      </div>
    </div>
  );
}
