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
import BenefitsSection from './components/sections/BenefitsSection';
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
import LandingPageApril from './pages/LandingPageApril';
import ApplyPage from './pages/ApplyPage';
import ApplyDonePage from './pages/ApplyDonePage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';

export const DM_URL = 'https://ig.me/m/bali_tarzan';
export const APPLY_PATH = '/apply';

function LandingPage() {
  const navigate = useNavigate();
  const handleCTA = () => { navigate(APPLY_PATH); };
  const scrollToHero = (e) => {
    e.preventDefault();
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <a
        href="#hero"
        onClick={scrollToHero}
        className="fixed top-0 left-0 right-0 z-50 bg-accent-green text-bg-primary text-center text-sm font-extrabold py-3 px-4 block hover:brightness-105 transition-all tracking-wide font-kr"
      >
        🟢 시즌 0 지원 마감 D-1 · 4/27(일) 23:59 →
      </a>
      <div className="pt-12">
        <HeroSection onCTA={handleCTA} />
        <PainPointSection />
        <StartingPointsSection />
        <FounderSection />
        <InstagramSection />
        <ProgramIntroSection />
        <HowItWorksSection />
        <MoneyMechanicSection />
        <TestimonialSection />
        <PricingSection onCTA={handleCTA} />
        <BenefitsSection onCTA={handleCTA} />
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
      <Route path="/april" element={<LandingPageApril />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/apply/done" element={<ApplyDonePage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
    </Routes>
  );
}
