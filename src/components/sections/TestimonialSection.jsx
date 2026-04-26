import AnimateOnScroll from '../ui/AnimateOnScroll';
import CohortLeaderboard from '../ui/CohortLeaderboard';
import CohortPhotoCarousel from '../ui/CohortPhotoCarousel';
import CohortConversation from '../ui/CohortConversation';
import cohort from '../../data/cohort.json';

const stats = [
  { value: '11/11', label: '전원 감량 성공' },
  { value: `-${cohort.stats.avgLossKg}kg`, label: '1인 평균 (Day 25)' },
  { value: `${cohort.stats.avgCertDays}일`, label: '평균 인증 (25일 중)' },
  { value: `-${cohort.stats.totalLossKg}kg`, label: '11명 누적 감량' },
];

export default function TestimonialSection() {
  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">DIRECT EVIDENCE</span>
          <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary">
            11명이 시작했고,<br />
            <span className="text-accent-green">11명이 모두 줄었습니다</span>
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            다이어트도, 러닝도, 사람을 매일 움직이게 하는 시스템은 같습니다.<br />
            직전 다이어트 30일 챌린지 — 시작 4월 2일, 오늘 25일차. 결과는 아래.
          </p>
        </AnimateOnScroll>

        {/* Stats grid */}
        <AnimateOnScroll>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-bg-card rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-bg-primary font-extrabold text-2xl leading-none">{s.value}</p>
                <p className="text-card-ink-faint text-[11px] mt-1.5 font-bold tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Leaderboard */}
        <AnimateOnScroll>
          <CohortLeaderboard />
        </AnimateOnScroll>
      </div>

      {/* Photo carousel — full bleed */}
      <div className="px-6 max-w-lg mx-auto mt-10">
        <AnimateOnScroll>
          <p className="text-text-muted text-xs font-bold tracking-widest mb-3">DAILY PROOF · 인증 사진</p>
        </AnimateOnScroll>
      </div>
      <AnimateOnScroll>
        <div className="px-6">
          <CohortPhotoCarousel />
        </div>
      </AnimateOnScroll>

      {/* Conversations — full bleed */}
      <div className="px-6 max-w-lg mx-auto mt-10">
        <AnimateOnScroll>
          <p className="text-text-muted text-xs font-bold tracking-widest mb-1">TEAM IN ACTION · 팀이 서로를 미는 방식</p>
          <p className="text-text-muted text-[11px] mb-3">
            앱 단톡방이 아닌, 매일 올리는 인증 피드 댓글. 의무가 아닌 자발적 응원.
          </p>
        </AnimateOnScroll>
      </div>
      <AnimateOnScroll>
        <div className="px-6">
          <CohortConversation />
        </div>
      </AnimateOnScroll>

      <div className="px-6 max-w-lg mx-auto mt-6">
        <p className="text-text-muted text-[11px] text-center leading-relaxed">
          이름은 익명 처리(김OO). 사진/체중 데이터는 실제 앱 DB 기준({new Date(cohort.generated_at).toLocaleDateString('ko-KR')}).
          <br />
          시즌 0(러닝) 후기는 5/31 이후 동일한 형식으로 추가됩니다.
        </p>
      </div>
    </section>
  );
}
