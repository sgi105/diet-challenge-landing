import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroSection from './components/sections/HeroSection';
import PainPointSection from './components/sections/PainPointSection';
import FounderSection from './components/sections/FounderSection';
import InstagramSection from './components/sections/InstagramSection';
import ProgramIntroSection from './components/sections/ProgramIntroSection';
import HowItWorksSection from './components/sections/HowItWorksSection';
import MoneyMechanicSection from './components/sections/MoneyMechanicSection';
import TestimonialSection from './components/sections/TestimonialSection';
import PricingSection from './components/sections/PricingSection';
import UrgencySection from './components/sections/UrgencySection';
import FAQSection from './components/sections/FAQSection';
import FinalCTASection from './components/sections/FinalCTASection';
import StickyCTA from './components/layout/StickyCTA';
import Footer from './components/layout/Footer';
import UserInfoModal from './components/ui/UserInfoModal';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import { requestPayment } from './lib/tossPayments';

function LandingPage() {
  const [showModal, setShowModal] = useState(false);

  const handleCTA = () => {
    setShowModal(true);
  };

  const handleFormSubmit = async (userInfo) => {
    setShowModal(false);
    try {
      await requestPayment(userInfo);
    } catch (error) {
      if (error.code === 'USER_CANCEL') return;
      console.error('결제 오류:', error);
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen">
      <HeroSection onCTA={handleCTA} />
      <PainPointSection />
      <FounderSection />
      <InstagramSection />
      <ProgramIntroSection />
      <HowItWorksSection />
      <MoneyMechanicSection />
      <TestimonialSection />
      <PricingSection onCTA={handleCTA} />
      <UrgencySection />
      <FAQSection />
      <FinalCTASection onCTA={handleCTA} />
      <Footer />
      <StickyCTA onCTA={handleCTA} />
      <UserInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
    </Routes>
  );
}
