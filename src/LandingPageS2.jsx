import { useNavigate } from 'react-router-dom';
import HeroSection from './components/s2/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import Season0ResultsSection from './components/sections/Season0ResultsSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/s2/FounderSection';
import InstagramSection from './components/s2/InstagramSection';
import SystemSection from './components/s2/SystemSection';
import GameSection from './components/s2/GameSection';
import MoneyMechanicSection from './components/s2/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/s2/PricingSection';
import BenefitsSection from './components/s2/BenefitsSection';
import LiveApplicantsSection from './components/s2/LiveApplicantsSection';
import UrgencySection from './components/s2/UrgencySection';
import FAQSection from './components/s2/FAQSection';
import FinalCTASection from './components/s2/FinalCTASection';
import StickyCTA from './components/s2/StickyCTA';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason2Status, COPY2, applyPathForStatus } from './hooks/useSeason2Status';
import { useApplicantCount } from './hooks/useApplicantCount';
import { spotsInfo } from './lib/spots';

// 시즌2 (260629_team_run) 모집 랜딩 — 3단계 시기별 운영.
// 시기별로 바뀌는 건 상단 배너 / CTA 문구 / 마감 카운트다운뿐. 본문은 그대로.
export default function LandingPageS2() {
  const navigate = useNavigate();
  const status = useSeason2Status();
  const isClosed = status === 'closed';
  const isInterlude = status === 'interlude';
  const acceptingApps = status === 'prereg' || status === 'official';
  const copy = COPY2[status];
  const count = useApplicantCount(status === 'official');
  const spots = status === 'official' ? spotsInfo(count) : null;
  // 배너 "선착순 30명" → 동적 "N자리 남음"(임박이면 🔥)
  const bannerText = (spots && !spots.full)
    ? copy.banner.replace('선착순 30명', `${spots.low ? '🔥 ' : ''}${spots.remaining}자리 남음`)
    : copy.banner;

  const handleCTA = () => {
    // 막간 단계는 신청을 받지 않음 — 히어로(카운트다운)로 스크롤만.
    if (isInterlude) {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(applyPathForStatus(status));
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bannerTone = (isClosed || isInterlude)
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
        <HeroSection onCTA={handleCTA} />
        <PainPointSection />
        <StartingPointsSection />
        <FounderSection />
        <SystemSection />
        <GameSection />
        <Season0ResultsSection />
        <TestimonialSection />
        {acceptingApps && <LiveApplicantsSection />}
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <Button onClick={handleCTA} disabled={isInterlude} className="w-full max-w-xs">{copy.cta.hero}{!isInterlude && ' →'}</Button>
          </section>
        )}
        <MoneyMechanicSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              다 같이 가는 21일.<br />
              <span className="text-accent-green font-bold">팀이 있을 때 시작해</span>
            </p>
            <Button onClick={handleCTA} disabled={isInterlude} className="w-full max-w-xs">{copy.cta.pricing}{!isInterlude && ' →'}</Button>
          </section>
        )}
        <PricingSection onCTA={handleCTA} />
        {!isClosed && <BenefitsSection />}
        <InstagramSection />
        {!isClosed && <UrgencySection />}
        <FAQSection />
        <FinalCTASection onCTA={handleCTA} />
        <Footer />
        <StickyCTA onCTA={handleCTA} />
      </div>
    </div>
  );
}
