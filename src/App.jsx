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
import IABGuide from './components/ui/IABGuide';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';

export const DM_URL = 'https://ig.me/m/bali_tarzan';

function LandingPage() {
  const handleCTA = () => { window.location.href = DM_URL; };

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* 상단 고정 배너 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-accent-orange text-bg-primary text-center text-sm font-bold py-2.5 px-4">
        🔴 4월 기수 이틀 만에 마감됐습니다
      </div>
      <div className="pt-10">
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
      <IABGuide />
      </div>
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
