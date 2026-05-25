import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HeroSection from './components/sections/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import StartingPointsSection from './components/sections/StartingPointsSection';
import FounderSection from './components/sections/FounderSection';
import InstagramSection from './components/sections/InstagramSection';
import ProgramIntroSection from './components/sections/ProgramIntroSection';
import HowItWorksSection from './components/sections/HowItWorksSection';
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
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import ApplyPage from './pages/ApplyPage';
import ApplyDonePage from './pages/ApplyDonePage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import PayPage from './pages/PayPage';
import WaitlistSection from './components/sections/WaitlistSection';
import { useCohortStatus, COPY, COPY_REFERRAL } from './hooks/useCohortStatus';
import UserInfoModal from './components/ui/UserInfoModal';
import { requestPayment } from './lib/tossPayments';

export const DM_URL = 'https://ig.me/m/bali_tarzan';
export const APPLY_PATH = '/apply';
export const REFERRAL_APPLY_PATH = '/apply?type=referral';

function LandingPage({ variant = 'main' }) {
  const navigate = useNavigate();
  const status = useCohortStatus(variant);
  const isClosed = status === 'closed';
  const isReferral = variant === 'referral';
  const copy = (isReferral ? COPY_REFERRAL : COPY)[status];
  const [payModalOpen, setPayModalOpen] = useState(false);

  useEffect(() => {
    if (!isReferral) return;
    const prev = document.title;
    document.title = '초대 전용 · 시즌 0 추천인 전형';
    return () => { document.title = prev; };
  }, [isReferral]);

  const handleCTA = () => {
    if (isClosed) {
      navigate(isReferral ? REFERRAL_APPLY_PATH : APPLY_PATH);
    } else {
      setPayModalOpen(true);
    }
  };

  const handlePaySubmit = async (userInfo) => {
    try {
      await requestPayment(userInfo);
    } catch (err) {
      if (err.code !== 'PAYMENT_CANCELLED') {
        alert(`결제 오류: ${err.message}`);
      }
      setPayModalOpen(false);
    }
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
        className={`fixed top-0 left-0 right-0 z-50 ${bannerTone} text-center text-sm font-extrabold py-3 px-4 block hover:brightness-105 transition-all tracking-wide font-kr`}
      >
        {copy.banner}
      </a>
      <div className="pt-12">
        <HeroSection onCTA={handleCTA} variant={variant} />
        {isReferral && !isClosed && <ReferralBonusSection onCTA={handleCTA} />}
        <PainPointSection variant={variant} />
        <TestimonialSection />
        {!isReferral && !isClosed && <LiveApplicantsSection />}
        <StartingPointsSection />
        <FounderSection />
        <InstagramSection />
        <ProgramIntroSection />
        <HowItWorksSection />
        <MoneyMechanicSection />
        {isClosed ? <WaitlistSection /> : <PricingSection onCTA={handleCTA} variant={variant} />}
        {!isClosed && !isReferral && <BenefitsSection onCTA={handleCTA} />}
        {!isClosed && <UrgencySection variant={variant} />}
        <FAQSection />
        <FinalCTASection onCTA={handleCTA} variant={variant} />
        <Footer />
        <StickyCTA onCTA={handleCTA} variant={variant} />
      </div>
      <UserInfoModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSubmit={handlePaySubmit}
      />
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
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/pay" element={<PayPage />} />
    </Routes>
  );
}
