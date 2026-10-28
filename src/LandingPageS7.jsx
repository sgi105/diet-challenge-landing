import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from './lib/eventLog';
import { metaTrack } from './lib/metaPixel';
import HeroSection from './components/s7/HeroSection';
import PainPointSection from './components/s7/PainPointSection';
import TogetherSection from './components/s7/TogetherSection';
import SystemSection from './components/s7/SystemSection';
import PricingSection from './components/s7/PricingSection';
import NextStepSection from './components/s7/NextStepSection';
import PaceResultSection from './components/s5/PaceResultSection';
import FounderSection from './components/s7/FounderSection';
import JoinLink from './components/s7/JoinLink';
import UrgencySection from './components/s7/UrgencySection';
import FAQSection from './components/s7/FAQSection';
import FinalCTASection from './components/s7/FinalCTASection';
import StickyCTA from './components/s7/StickyCTA';
import TestimonialSection from './components/sections/TestimonialSection';
import LevelsSection from './components/s5v2/LevelsSection';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason7Status, COPY7, applyPathForStatus7 } from './hooks/useSeason7Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';
import { COHORT7, CTA_LABEL7, TESTIMONIAL_IDS7, TESTIMONIAL_EXCERPTS7 } from './data/season7';

// 261130_team_run_season7 랜딩 — LandingPageS6 fork (시즌6 파일은 그대로 두고 /s6 에 아카이브).
// 바뀐 것: 90일 하프 프로그램의 첫 28일 = 1만원 체험(참가비 · 환급 없음) · 11/30(월) 시작.
//   모집 오픈 전(upcoming)엔 메인 버튼 = 오픈 알림 신청(/notify), 결제는 공개 링크(/s7/join)로 미리 받는다.
//   보증금·환급·몰수 표현은 쓰지 않는다(PG 정책). 얼리버드 보너스 없음.
// 흐름은 v2와 같다: 목적지 → 공감·증거 → 후기 → 같이 하면 → 28일 프로그램 → 기록 → 오퍼 → 다음 단계 → 신뢰 → 마감
export default function LandingPageS7() {
  const navigate = useNavigate();
  const status = useSeason7Status();
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const acceptingApps = status === 'official';
  const copy = COPY7[status];
  // 모집 중엔 모든 버튼을 "28일 챌린지 참가하기"로 통일. 오픈 전/마감은 공용 문구.
  const ctaLabel = acceptingApps ? CTA_LABEL7 : null;
  const count = useApplicantCount(acceptingApps, COHORT7.cohortCode);

  useEffect(() => {
    if (once('page_view')) logEvent('page_view');
  }, []);

  const spots = acceptingApps ? spotsInfo(count) : null;
  // 남은 자리는 마감 임박(9자리 이하)일 때만 띠에 노출. 넉넉하면 '선착순 30명' 그대로.
  const bannerText = spots?.low
    ? copy.banner.replace(`정원 ${COHORT7.totalSpots}명`, `🔥 ${spots.remaining}자리 남음`)
    : copy.banner;

  const handleCTA = (placement = 'unknown') => {
    track('landing_cta_click', { placement, status, variant: 's7' });
    logEvent('cta_click', { placement });
    metaTrack('ViewContent', { content_name: `cta_${placement}` });
    navigate(applyPathForStatus7(status));
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    track('landing_banner_click', { status, variant: 's7' });
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
        <TestimonialSection pinnedIds={TESTIMONIAL_IDS7} excerpts={TESTIMONIAL_EXCERPTS7} />

        {/* 같이 하면 결국 하게 돼 — 팀 배정 · 응원 · 책임감 · 팀 우승 (앱 화면) */}
        <TogetherSection />

        {/* 28일 체험 프로그램 — 쉬운 시작 · 주차 흐름 · 매일 러닝 시간 */}
        <SystemSection />

        {/* 기록 — (게임 섹션은 뺐다: 팀 대항전·상금은 공감 섹션 "팀 우승" 항목이 담당) */}
        {/* 레벨 맞춤 → 21일 뒤 결과 (가인 2026-09-19) */}
        <LevelsSection />
        <PaceResultSection heading={<>21일 만에<br /><span className="text-accent-green">얼마나 성장해?</span></>} />

        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <Button onClick={() => handleCTA('mid_testimonial')} className="w-full max-w-xs">{ctaLabel ?? copy.cta.hero} →</Button>
          </section>
        )}

        {/* 오퍼 — 90일의 첫 28일 1만원 체험(참가비 · 환급 없음) */}
        <PricingSection onCTA={() => handleCTA('pricing')} />

        {/* 다음 단계 — 28일 체험이 어디로 이어지는지 (가격 없음) */}
        <NextStepSection />


        <FounderSection />
        {!isClosed && <UrgencySection hideCountdown />}
        <FAQSection />
        <FinalCTASection onCTA={() => handleCTA('final')} />
        {/* 결제 페이지(/s7/join) 공개 링크 — 맨 밑에 한 번만, 눈에 덜 띄게(가인 2026-10-28). 알림 모드에서만. */}
        {isUpcoming && <JoinLink placement="bottom" subtle />}
        <Footer />
        <StickyCTA onCTA={() => handleCTA('sticky')} label={ctaLabel ?? undefined} />
      </div>
    </div>
  );
}
