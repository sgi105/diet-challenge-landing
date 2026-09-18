import { JOURNEY } from '../../data/season5v2';

// 21일이 어디로 이어지는지를 한 장면으로 보여주는 여정 바.
// 히어로에서 "90일 하프마라톤"을 약속하는 순간, 지금 파는 21일이 그 여정의 어느 칸인지
// 즉시 보이지 않으면 "21일 만에 하프를 뛴다"로 잘못 읽힌다. 그 오독을 막는 게 이 컴포넌트의 일.
export default function JourneyBar({ className = '' }) {
  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* 노드 + 연결선 — 현재 구간(21일)까지만 실선 라임, 이후는 점선 */}
      <div className="flex items-center" aria-hidden="true">
        {JOURNEY.map((step, i) => (
          <div key={step.label} className="flex items-center" style={{ flex: i === 0 ? '0 0 auto' : '1 1 0%' }}>
            {i > 0 && (
              <div
                className={`h-[2px] flex-1 mx-1.5 ${
                  i === 1
                    ? 'bg-gradient-to-r from-accent-green to-accent-green/30'
                    : 'bg-white/15'
                }`}
              />
            )}
            <span
              className={`shrink-0 rounded-full ${
                step.now
                  ? 'w-3.5 h-3.5 bg-accent-green shadow-[0_0_14px_var(--color-accent-green)]'
                  : step.goal
                    ? 'w-3 h-3 border-2 border-accent-orange bg-accent-orange/20'
                    : 'w-3 h-3 border-2 border-white/30'
              }`}
            />
          </div>
        ))}
      </div>

      {/* 라벨 — 노드 아래 3칸 균등. 가운데/끝은 정렬을 맞춰 선과 어긋나지 않게 */}
      <div className="flex mt-2.5">
        {JOURNEY.map((step, i) => (
          <div
            key={step.label}
            className={`min-w-0 ${i === 0 ? 'text-left' : i === 1 ? 'text-center flex-1' : 'text-right flex-1'}`}
          >
            <p
              className={`text-[12px] font-black leading-tight tabular-nums break-keep ${
                step.now ? 'text-accent-green' : step.goal ? 'text-accent-orange' : 'text-text-secondary'
              }`}
            >
              {step.label}
            </p>
            <p className="text-text-muted text-[10.5px] font-bold leading-tight mt-0.5 break-keep">
              {step.title}
            </p>
            {step.now && (
              <p className="text-accent-green text-[10px] font-extrabold mt-1 leading-tight">
                지금 모집 중
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
