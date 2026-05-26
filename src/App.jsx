import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HeroSection from './components/sections/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import Season0ResultsSection from './components/sections/Season0ResultsSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/sections/FounderSection';
import InstagramSection from './components/sections/InstagramSection';
import SystemSection from './components/sections/SystemSection';
import MoneyMechanicSection from './components/sections/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/sections/PricingSection';
import LiveApplicantsSection from './components/sections/LiveApplicantsSection';
import BenefitsSection from './components/sections/BenefitsSection';
import ReferralBonusSection from './components/sections/ReferralBonusSection';
import UrgencySection from './components/sections/UrgencySection';
import FAQSection from './components/sections/FAQSection';
import FinalCTASection from './components/sections/FinalCTASection';
import StickyCTA from './components/layout/StickyCTA';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import ApplyPage from './pages/ApplyPage';
import ApplyDonePage from './pages/ApplyDonePage';
import PayPage from './pages/PayPage';
import { useCohortStatus, COPY, COPY_REFERRAL } from './hooks/useCohortStatus';

export const DM_URL = 'https://ig.me/m/bali_tarzan';
export const APPLY_PATH = '/apply';
export const REFERRAL_APPLY_PATH = '/apply?type=referral';

function LandingPage({ variant = 'main' }) {
  const navigate = useNavigate();
  const status = useCohortStatus(variant);
  const isClosed = status === 'closed';
  const isReferral = variant === 'referral';
  const copy = (isReferral ? COPY_REFERRAL : COPY)[status];
  useEffect(() => {
    if (!isReferral) return;
    const prev = document.title;
    document.title = '초대 전용 · 시즌 1 추천인 전형';
    return () => { document.title = prev; };
  }, [isReferral]);

  const handleCTA = () => {
    navigate(isReferral ? REFERRAL_APPLY_PATH : APPLY_PATH);
  };

  const scrollToCTA = (e) => {
    e.preventDefault();
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bannerTone = isReferral
    ? 'bg-accent-orange text-bg-primary'
    : 'bg-accent-green text-bg-primary';

  return (
    <div className="min-h-screen">
      <a
        href={isClosed ? '#waitlist' : '#hero'}
        onClick={scrollToCTA}
        className={`fixed top-0 left-0 right-0 z-50 ${bannerTone} text-center text-[11px] sm:text-sm font-extrabold py-2.5 px-3 block hover:brightness-105 transition-all tracking-tight leading-tight font-kr whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {copy.banner}
      </a>
      <div className="pt-12">
        <HeroSection onCTA={handleCTA} variant={variant} />
        <PainPointSection variant={variant} />
        <StartingPointsSection />
        <Season0ResultsSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              혼자선 맨날 실패한 러닝.<br />
              <span className="text-accent-green font-bold">30명 중 30명 전원 성공한 미친 결과</span>
            </p>
            <Button onClick={handleCTA} className="w-full max-w-xs">지원하기 →</Button>
          </section>
        )}
        <TestimonialSection />
        <FounderSection />
        {!isClosed && !isReferral && <BenefitsSection onCTA={handleCTA} />}
        {isReferral && !isClosed && <ReferralBonusSection onCTA={handleCTA} />}
        {!isReferral && !isClosed && <LiveApplicantsSection />}
        <SystemSection />
        <MoneyMechanicSection />
        {!isClosed && (
          <section className="px-6 pt-2 pb-10 max-w-lg mx-auto text-center">
            <p className="text-text-secondary text-sm mb-4">
              30명이 다 받아간 환급금.<br />
              <span className="text-accent-green font-bold">시즌1도 합류해</span>
            </p>
            <Button onClick={handleCTA} className="w-full max-w-xs">지원하기 →</Button>
          </section>
        )}
        <PricingSection onCTA={handleCTA} variant={variant} />
        <InstagramSection />
        {!isClosed && <UrgencySection variant={variant} />}
        <FAQSection />
        <FinalCTASection onCTA={handleCTA} variant={variant} />
        <Footer />
        <StickyCTA onCTA={handleCTA} variant={variant} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/referral" element={<LandingPage variant="referral" />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/apply/done" element={<ApplyDonePage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/pay" element={<PayPage />} />
    </Routes>
  );
}
