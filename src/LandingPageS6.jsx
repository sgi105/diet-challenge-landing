import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from './lib/eventLog';
import { metaTrack } from './lib/metaPixel';
import HeroSection from './components/s6/HeroSection';
import PainPointSection from './components/s6/PainPointSection';
import TogetherSection from './components/s6/TogetherSection';
import SystemSection from './components/s6/SystemSection';
import PricingSection from './components/s6/PricingSection';
import NextStepSection from './components/s6/NextStepSection';
import PaceResultSection from './components/s5/PaceResultSection';
import FounderSection from './components/s6/FounderSection';
import BonusSection from './components/s6/BonusSection';
import UrgencySection from './components/s6/UrgencySection';
import FAQSection from './components/s6/FAQSection';
import FinalCTASection from './components/s6/FinalCTASection';
import StickyCTA from './components/s6/StickyCTA';
import TestimonialSection from './components/sections/TestimonialSection';
import LevelsSection from './components/s5v2/LevelsSection';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason6Status, COPY6, applyPathForStatus6 } from './hooks/useSeason6Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';
import { COHORT6, CTA_LABEL6, TESTIMONIAL_IDS6, TESTIMONIAL_EXCERPTS6 } from './data/season6';

// 261019_team_run_season6 랜딩 — LandingPageS5v2 fork (시즌5 v2 파일은 그대로 둔다).
// 바뀐 것: 28일 · 정원 50명 · 보증금 대신 참가비 9,900원(결제하면 바로 참가 확정, 선발 없음)
//   · 해내면 리워드 1만원("오히려 +100원") · 팀 상금 없음.
// 흐름은 v2와 같다: 목적지 → 공감·증거 → 후기 → 같이 하면 → 28일 프로그램 → 기록 → 오퍼 → 다음 단계 → 신뢰 → 마감
export default function LandingPageS6() {
  const navigate = useNavigate();
  const status = useSeason6Status();
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const acceptingApps = status === 'official';
  const copy = COPY6[status];
  // 모집 중엔 모든 버튼을 "28일 챌린지 참가하기"로 통일. 오픈 전/마감은 공용 문구.
  const ctaLabel = acceptingApps ? CTA_LABEL6 : null;
  const count = useApplicantCount(acceptingApps, COHORT6.cohortCode);

  useEffect(() => {
    if (once('page_view')) logEvent('page_view');
  }, []);

  const spots = acceptingApps ? spotsInfo(count) : null;
  // 남은 자리는 마감 임박(9자리 이하)일 때만 띠에 노출. 넉넉하면 '선착순 30명' 그대로.
  const bannerText = spots?.low
    ? copy.banner.replace(`정원 ${COHORT6.totalSpots}명`, `🔥 ${spots.remaining}자리 남음`)
    : copy.banner;

  const handleCTA = (placement = 'unknown') => {
    track('landing_cta_click', { placement, status, variant: 's6' });
    logEvent('cta_click', { placement });
    metaTrack('ViewContent', { content_name: `cta_${placement}` });
    if (isUpcoming) {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(applyPathForStatus6(status));
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    track('landing_banner_click', { status, variant: 's6' });
    logEvent('cta_click', { placement: 'banner' });
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bannerTone = (isClosed || isUpcoming)
    ? 'bg-accent-orange text-bg-primary'
    : 'bg-accent-green text-bg-primary';

  return (
    <div className="min-h-screen v2-no-pill v2-heads">
      <a
        href="#hero"
        onClick={scrollToCTA}
        className={`fixed top-0 left-0 right-0 z-50 ${bannerTone} text-center text-[11px] sm:text-sm font-extrabold py-2.5 px-3 block hover:brightness-105 transition-all tracking-tight leading-tight font-kr whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {bannerText}
      </a>
      <div className="pt-12">
        <HeroSection onCTA={() => handleCTA('hero')} />

        {/* 공감 → 원인은 '혼자' → 혼자 25% vs 함께 96% */}
        <PainPointSection />

        {/* 후기 → "같이 하면" 제목 바로 위 (가인 2026-09-19) */}
        <TestimonialSection pinnedIds={TESTIMONIAL_IDS6} excerpts={TESTIMONIAL_EXCERPTS6} />

        {/* 같이 하면 결국 하게 돼 — 팀 배정 · 응원 · 책임감 · 팀 우승 (앱 화면) */}
        <TogetherSection />

        {/* 25일 무료 체험 프로그램 — 쉬운 시작 · 주차 흐름 · 매일 러닝 시간 */}
        <SystemSection />

        {/* 기록 — (게임 섹션은 뺐다: 팀 대항전·상금은 공감 섹션 "팀 우승" 항목이 담당) */}
        {/* 레벨 맞춤 → 21일 뒤 결과 (가인 2026-09-19) */}
        <LevelsSection />
        <PaceResultSection heading={<>21일 만에<br /><span className="text-accent-green">얼마나 성장해?</span></>} />

        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <Button onClick={() => handleCTA('mid_testimonial')} disabled={isUpcoming} className="w-full max-w-xs">{ctaLabel ?? copy.cta.hero}{!isUpcoming && ' →'}</Button>
          </section>
        )}

        {/* 오퍼 — 참가비 0원 + 보증금(해내면 환급 / 포기하면 몰수). v1의 3시나리오 섹션은 이게 대신한다 */}
        <PricingSection onCTA={() => handleCTA('pricing')} />

        {/* 다음 단계 — 무료 체험이 어디로 이어지는지 (가격 없음) */}
        <NextStepSection />


        {!isClosed && <BonusSection />}
        <FounderSection />
        {!isClosed && <UrgencySection hideCountdown />}
        <FAQSection />
        <FinalCTASection onCTA={() => handleCTA('final')} />
        <Footer />
        <StickyCTA onCTA={() => handleCTA('sticky')} label={ctaLabel ?? undefined} />
      </div>
    </div>
  );
}
