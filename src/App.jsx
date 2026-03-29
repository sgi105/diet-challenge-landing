import { Routes, Route, useNavigate } from 'react-router-dom';
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
import ApplyPage from './pages/ApplyPage';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';

function LandingPage() {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/apply');
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
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
    </Routes>
  );
}
