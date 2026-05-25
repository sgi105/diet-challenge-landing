import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import PainPointSection from '../components/sections/PainPointSection';
import FounderSection from '../components/sections/FounderSection';
import InstagramSection from '../components/sections/InstagramSection';
import ProgramIntroSection from '../components/sections/ProgramIntroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import MoneyMechanicSection from '../components/sections/MoneyMechanicSection';
import TestimonialSection from '../components/sections/TestimonialSection';
import PricingSection from '../components/sections/PricingSection';
import UrgencySection from '../components/sections/UrgencySection';
import FAQSection from '../components/sections/FAQSection';
import FinalCTASection from '../components/sections/FinalCTASection';
import Footer from '../components/layout/Footer';

export default function LandingPageApril() {
  const navigate = useNavigate();
  const handleCTA = () => { navigate('/'); };

  return (
    <div className="bg-bg-primary min-h-screen">
      <Link
        to="/"
        className="fixed top-0 left-0 right-0 z-50 bg-accent-orange text-bg-primary text-center text-sm font-bold py-2.5 px-4 block hover:brightness-110 transition-all"
      >
        🔴 4월 기수는 마감되었습니다 · 다음 기수 모집 보기 →
      </Link>
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
      </div>
    </div>
  );
}
