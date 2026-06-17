import { useNavigate } from 'react-router-dom';
import HeroSection from './components/s2/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import Season0ResultsSection from './components/sections/Season0ResultsSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/s2/FounderSection';
import InstagramSection from './components/s2/InstagramSection';
import SystemSection from './components/s2/SystemSection';
import MoneyMechanicSection from './components/s2/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/s2/PricingSection';
import LiveApplicantsSection from './components/s2/LiveApplicantsSection';
import UrgencySection from './components/s2/UrgencySection';
import FAQSection from './components/s2/FAQSection';
import FinalCTASection from './components/s2/FinalCTASection';
import StickyCTA from './components/s2/StickyCTA';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { useSeason2Status, COPY2, applyPathForStatus } from './hooks/useSeason2Status';

// 시즌2 (260629_team_run) 모집 랜딩 — 3단계 시기별 운영.
// 시기별로 바뀌는 건 상단 배너 / CTA 문구 / 마감 카운트다운뿐. 본문은 그대로.
export default function LandingPageS2() {
  const navigate = useNavigate();
  const status = useSeason2Status();
  const isClosed = status === 'closed';
  const isInterlude = status === 'interlude';
  const acceptingApps = status === 'prereg' || status === 'official';
  const copy = COPY2[status];

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
        {copy.banner}
      </a>
      <div className="pt-12">
        <HeroSection onCTA={handleCTA} />
        <PainPointSection />
        <StartingPointsSection />
        <Season0ResultsSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              혼자선 맨날 실패한 러닝.<br />
              <span className="text-accent-green font-bold">30명 중 30명 전원 성공한 미친 결과</span>
            </p>
            <Button onClick={handleCTA} className="w-full max-w-xs">{copy.cta.hero} →</Button>
          </section>
        )}
        <TestimonialSection />
        <FounderSection />
        {acceptingApps && <LiveApplicantsSection />}
        <SystemSection />
        <MoneyMechanicSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              다 같이 가는 21일.<br />
              <span className="text-accent-green font-bold">팀이 있을 때 시작해</span>
            </p>
            <Button onClick={handleCTA} className="w-full max-w-xs">{copy.cta.pricing} →</Button>
          </section>
        )}
        <PricingSection onCTA={handleCTA} />
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
