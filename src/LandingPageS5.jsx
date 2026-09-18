import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from './lib/eventLog';
import { metaTrack } from './lib/metaPixel';
import HeroSection from './components/s5/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/s5/FounderSection';
import SystemSection from './components/s5/SystemSection';
import GameSection from './components/s5/GameSection';
import PaceResultSection from './components/s5/PaceResultSection';
import MoneyMechanicSection from './components/s5/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/s5/PricingSection';
import BenefitsSection from './components/s5/BenefitsSection';
import BonusSection from './components/s5/BonusSection';
import LiveApplicantsSection from './components/s5/LiveApplicantsSection';
import UrgencySection from './components/s5/UrgencySection';
import FAQSection from './components/s5/FAQSection';
import FinalCTASection from './components/s5/FinalCTASection';
import StickyCTA from './components/s5/StickyCTA';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason5Status, COPY5, applyPathForStatus5 } from './hooks/useSeason5Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';
import { COHORT5 } from './data/season5';

// 260921_team_run_season5 모집 랜딩 — LandingPageS4 fork.
// 섹션 구성은 260824_team_run 그대로. 바뀐 건 일정/보증금/상금/누적 성과 숫자.
//   21일 · 30명 5인 1팀(6팀) · 참가비 무료 + 보증금 10만 · 미션 90% + 5K 완주 시 전액 환급 · 우승팀 현금 10만(팀 합산)
//   하루 10분 시작 → 하루 1분씩 → Day 11부터 20분 유지 → 10/11(일) 파이널 5K
//   9/16(수) 20:00 모집 오픈 · 9/19(토) 24:00 마감(1회 연장) · 9/21(월) 시작 · 9/22(화) OT·팀 배정
// 시기별로 바뀌는 건 상단 배너 / CTA 문구 / 카운트다운뿐. 본문은 그대로.
export default function LandingPageS5() {
  const navigate = useNavigate();
  const status = useSeason5Status();
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const acceptingApps = status === 'official';
  const copy = COPY5[status];
  const count = useApplicantCount(acceptingApps, COHORT5.cohortCode);

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
    metaTrack('ViewContent', { content_name: `cta_${placement}` });
    // 오픈 전에는 신청을 받지 않음 — 히어로(카운트다운)로 스크롤만.
    if (isUpcoming) {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(applyPathForStatus5(status));
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
        {/* 세일즈 흐름 순서: 문제 → 방법 → 증거 → 반론 해소 → 오퍼 → 신뢰 → FAQ → 마감 → 최종 CTA.
            창업자 소개는 오퍼 뒤 신뢰 보강 자리로 이동(예전엔 4번째라 너무 일렀다). */}
        <HeroSection onCTA={() => handleCTA('hero')} />
        <PainPointSection />
        <SystemSection />
        <GameSection />
        <PaceResultSection />
        <TestimonialSection />
        {acceptingApps && <LiveApplicantsSection />}
        <StartingPointsSection />
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
        {!isClosed && <BonusSection />}
        <PricingSection onCTA={() => handleCTA('pricing')} />
        {!isClosed && <BenefitsSection />}
        <FounderSection />
        {!isClosed && <UrgencySection />}
        <FAQSection />
        <FinalCTASection onCTA={() => handleCTA('final')} />
        <Footer />
        <StickyCTA onCTA={() => handleCTA('sticky')} />
      </div>
    </div>
  );
}
