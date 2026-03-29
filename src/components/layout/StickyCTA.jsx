import { useState, useEffect } from 'react';

export default function StickyCTA({ onCTA }) {
  const [show, setShow] = useState(false);

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
      <div className="bg-bg-primary/90 backdrop-blur-md border-t border-border px-4 py-3">
        <button
          onClick={onCTA}
          className="w-full bg-accent-green text-bg-primary font-bold py-4 rounded-xl text-base hover:brightness-110 transition-all duration-300 cursor-pointer"
        >
          📩 인스타 DM으로 신청하기 (@samurai_habit)
        </button>
      </div>
    </div>
  );
}
