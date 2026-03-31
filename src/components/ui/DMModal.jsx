import { useState } from 'react';

const TEMPLATE = `🏃 팀 다이어트 챌린지 신청

- 이름:
- 나이:
- 현재 몸무게:  kg
- 최종 목표 몸무게:  kg
- 주 운동 횟수:

📅 4/1(수) 21:00-21:40 OT 참석 가능: O / X
(* 식단 교육 + 팀원들 만나는 시간, 불참시 영상으로 자료 전달)
`;

export default function DMModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-bg-card border border-border rounded-2xl p-5 space-y-3">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-bold text-lg">신청 방법</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-2xl leading-none">×</button>
        </div>

        {/* Step 1 */}
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-text-primary font-semibold text-sm">양식을 복사해서 작성하세요</span>
          </div>
          <pre className="text-text-secondary text-xs whitespace-pre-wrap font-sans leading-relaxed mb-3">{TEMPLATE}</pre>
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              copied
                ? 'bg-accent-green/10 border border-accent-green text-accent-green'
                : 'bg-accent-green text-bg-primary hover:brightness-110'
            }`}
          >
            {copied ? '복사됨 ✓' : '양식 복사하기'}
          </button>
        </div>

        {/* Step 2 */}
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="text-text-primary font-semibold text-sm">작성 후 DM으로 보내주세요</span>
          </div>
          <p className="text-text-secondary text-sm pl-8">
            인스타그램에서 <a href="https://www.instagram.com/bali_tarzan/" target="_blank" rel="noopener noreferrer" className="text-accent-green font-bold hover:underline">@bali_tarzan</a> 검색 후 DM 보내주세요
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <span className="text-text-primary font-semibold text-sm">확인 후 입금 안내드립니다</span>
          </div>
          <p className="text-text-muted text-xs pl-8">보통 몇 시간 이내로 답장드려요 😊</p>
        </div>

      </div>
    </div>
  );
}
