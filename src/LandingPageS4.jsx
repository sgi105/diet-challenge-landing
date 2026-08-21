import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from './lib/eventLog';
import HeroSection from './components/s4/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import Season0ResultsSection from './components/sections/Season0ResultsSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/s2/FounderSection';
import InstagramSection from './components/s4/InstagramSection';
import SystemSection from './components/s4/SystemSection';
import GameSection from './components/s4/GameSection';
import PaceResultSection from './components/s4/PaceResultSection';
import MoneyMechanicSection from './components/s4/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/s4/PricingSection';
import BenefitsSection from './components/s4/BenefitsSection';
import LiveApplicantsSection from './components/s4/LiveApplicantsSection';
import UrgencySection from './components/s4/UrgencySection';
import FAQSection from './components/s4/FAQSection';
import FinalCTASection from './components/s4/FinalCTASection';
import StickyCTA from './components/s4/StickyCTA';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason4Status, COPY4, applyPathForStatus4 } from './hooks/useSeason4Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';
import { COHORT4 } from './data/season4';

// 시즌4 (260824_team_run) 모집 랜딩 — LandingPageS2 fork.
// 섹션 구성은 시즌2 그대로. 바뀐 건 카피/일정/인원/프로그램 숫자뿐.
//   21일 · 30명 5인 1팀(6팀) · 참가비 무료 + 보증금 20만 · 미션 90% + 5K 완주 시 전액 환급
//   하루 10분 시작 → 하루 1분씩 → Day 11부터 20분 유지 → 9/13(일) 파이널 5K
//   8/19(수) 08:00 모집 오픈 · 8/21(금) 14:00 마감 · 8/24(월) 시작
// 시기별로 바뀌는 건 상단 배너 / CTA 문구 / 카운트다운뿐. 본문은 그대로.
export default function LandingPageS4() {
  const navigate = useNavigate();
  const status = useSeason4Status();
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const acceptingApps = status === 'official';
  const copy = COPY4[status];
  const count = useApplicantCount(acceptingApps, COHORT4.cohortCode);

  // 방문 기록 — 세션당 1회. 퍼널의 맨 윗칸.
  useEffect(() => {
    if (once('page_view')) logEvent('page_view');
  }, []);
  const spots = acceptingApps ? spotsInfo(count) : null;
  // 배너 "선착순 30명" → 동적 "N자리 남음"(임박이면 🔥)
  const bannerText = (spots && !spots.full)
    ? copy.banner.replace('선착순 30명', `${spots.low ? '🔥 ' : ''}${spots.remaining}자리 남음`)
    : copy.banner;

  // CTA 클릭 추적 — 방문 → 신청하기 클릭 → 폼 완료 퍼널을 보려면 이 지점이 필요하다.
  // placement로 어느 버튼이 실제로 눌리는지 구분한다(히어로/가격/최종/하단고정/중간).
  const handleCTA = (placement = 'unknown') => {
    track('landing_cta_click', { placement, status });
    logEvent('cta_click', { placement });
    // 오픈 전에는 신청을 받지 않음 — 히어로(카운트다운)로 스크롤만.
    if (isUpcoming) {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(applyPathForStatus4(status));
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    track('landing_banner_click', { status });
    logEvent('cta_click', { placement: 'banner' });
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bannerTone = (isClosed || isUpcoming)
    ? 'bg-accent-orange text-bg-primary'
    : 'bg-accent-green text-bg-primary';

  return (
    <div className="min-h-screen">
      <a
        href="#hero"
        onClick={scrollToCTA}
        className={`fixed top-0 left-0 right-0 z-50 ${bannerTone} text-center text-[11px] sm:text-sm font-extrabold py-2.5 px-3 block hover:brightness-105 transition-all tracking-tight leading-tight font-kr whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {bannerText}
      </a>
      <div className="pt-12">
        <HeroSection onCTA={() => handleCTA('hero')} />
        <PainPointSection />
        <StartingPointsSection />
        <FounderSection />
        <SystemSection />
        <GameSection />
        <PaceResultSection />
        <Season0ResultsSection />
        <TestimonialSection />
        {acceptingApps && <LiveApplicantsSection />}
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <Button onClick={() => handleCTA('mid_testimonial')} disabled={isUpcoming} className="w-full max-w-xs">{copy.cta.hero}{!isUpcoming && ' →'}</Button>
          </section>
        )}
        <MoneyMechanicSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              다 같이 가는 21일.<br />
              <span className="text-accent-green font-bold">팀이 있을 때 시작해</span>
            </p>
            <Button onClick={() => handleCTA('mid_reward')} disabled={isUpcoming} className="w-full max-w-xs">{copy.cta.pricing}{!isUpcoming && ' →'}</Button>
          </section>
        )}
        <PricingSection onCTA={() => handleCTA('pricing')} />
        {!isClosed && <BenefitsSection />}
        <InstagramSection />
        {!isClosed && <UrgencySection />}
        <FAQSection />
        <FinalCTASection onCTA={() => handleCTA('final')} />
        <Footer />
        <StickyCTA onCTA={() => handleCTA('sticky')} />
      </div>
    </div>
  );
}
