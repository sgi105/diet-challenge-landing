import { useState, useEffect } from 'react';
import { useCohortStatus, COPY, COPY_REFERRAL } from '../../hooks/useCohortStatus';
import { COHORT } from '../../data/config';

export default function StickyCTA({ onCTA, variant = 'main' }) {
  const [show, setShow] = useState(false);
  const status = useCohortStatus(variant);
  const copy = (variant === 'referral' ? COPY_REFERRAL : COPY)[status];
  const firstDayBonusActive = status === 'open' && !variant.startsWith('referral') && new Date() < new Date(COHORT.firstDayBonusExpireAt);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-bg-deep/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <button
          onClick={onCTA}
          className="block w-full bg-accent-green text-bg-primary font-extrabold py-3 rounded-2xl text-center hover:brightness-110 transition-all duration-300 cursor-pointer shadow-[0_8px_24px_rgba(200,255,77,0.35)] leading-tight"
        >
          <span className="block text-base">{firstDayBonusActive ? '첫날 보너스 받고 지원하기' : copy.cta.sticky}</span>
          <span className="block text-[10px] font-bold opacity-80 mt-0.5 tracking-wide">{firstDayBonusActive ? '5/25(월) 24:00까지 · +1만 보너스' : copy.stickySub}</span>
        </button>
      </div>
    </div>
  );
}
