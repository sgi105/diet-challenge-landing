import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from './lib/eventLog';
import { metaTrack } from './lib/metaPixel';
import HeroSection from './components/s5v2/HeroSection';
import PainPointSection from './components/s5v2/PainPointSection';
import TogetherSection from './components/s5v2/TogetherSection';
import SystemSection from './components/s5v2/SystemSection';
import PricingSection from './components/s5v2/PricingSection';
import NextStepSection from './components/s5v2/NextStepSection';
import PaceResultSection from './components/s5/PaceResultSection';
import FounderSection from './components/s5/FounderSection';
import BonusSection from './components/s5/BonusSection';
import UrgencySection from './components/s5/UrgencySection';
import FAQSection from './components/s5/FAQSection';
import FinalCTASection from './components/s5v2/FinalCTASection';
import StickyCTA from './components/s5/StickyCTA';
import TestimonialSection from './components/sections/TestimonialSection';
import LevelsSection from './components/s5v2/LevelsSection';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason5Status, COPY5, applyPathForStatus5 } from './hooks/useSeason5Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';
import { COHORT5 } from './data/season5';
import { CTA_LABEL_V2, TESTIMONIAL_SIGNALS_V2 } from './data/season5v2';

// 260921_team_run_season5 랜딩 v2 — /s5v2 (라이브 / 와 /s5 는 v1 그대로).
//
// v1 대비 바뀐 것은 '무엇을 파는가'가 아니라 '무엇을 욕망으로 거는가'다.
//   v1: 21일 자체가 목적지 ("상위 1%로 가는 첫 21일") → 5K에서 끝나는 3주 이벤트로 읽힘
//   v2: 하프마라톤 완주가 목적지, 21일은 거기로 가는 1단계
// 파는 상품(21일 · 보증금 10만 · 정원 30)은 v1과 동일하다. 일정/숫자 SOT도 season5.js 그대로.
//
// 뺀 섹션(2026-09-19 점검): 3가지 결과 · 게임 · "21일 뒤 뭐가 남을까"(성장·같이 하면과 중복) · "다 같이 가는 21일" 중간 버튼 · 마감 임박 카운트다운(최종 섹션과 중복)
// 흐름: 목적지 → 공감·원인·증거(혼자 vs 함께) → 후기 → 같이 하면(이유 4개) → 21일 프로그램 → 기록 → 오퍼 → 다음 단계 → 신뢰 → 마감
export default function LandingPageS5v2() {
  const navigate = useNavigate();
  const status = useSeason5Status();
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const acceptingApps = status === 'official';
  const copy = COPY5[status];
  // 모집 중엔 모든 버튼을 "21일 챌린지 지원하기"로 통일. 오픈 전/마감은 공용 문구.
  const ctaLabel = acceptingApps ? CTA_LABEL_V2 : null;
  const count = useApplicantCount(acceptingApps, COHORT5.cohortCode);

  useEffect(() => {
    if (once('page_view')) logEvent('page_view');
  }, []);

  const spots = acceptingApps ? spotsInfo(count) : null;
  // 남은 자리는 마감 임박(9자리 이하)일 때만 띠에 노출. 넉넉하면 '선착순 30명' 그대로.
  const bannerText = spots?.low
    ? copy.banner.replace('선착순 30명', `🔥 ${spots.remaining}자리 남음`)
    : copy.banner;

  const handleCTA = (placement = 'unknown') => {
    track('landing_cta_click', { placement, status, variant: 'v2' });
    logEvent('cta_click', { placement });
    metaTrack('ViewContent', { content_name: `cta_${placement}` });
    if (isUpcoming) {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(applyPathForStatus5(status));
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    track('landing_banner_click', { status, variant: 'v2' });
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
        <TestimonialSection signals={TESTIMONIAL_SIGNALS_V2} />

        {/* 같이 하면 결국 하게 돼 — 팀 배정 · 응원 · 책임감 · 팀 우승 (앱 화면) */}
        <TogetherSection />

        {/* 21일 프로그램 — 쉬운 시작 · 주차 흐름 · 매일 러닝 시간 */}
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

        {/* 다음 단계 — 21일이 어디로 이어지는지 (가격 없음) */}
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
