import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/ui/Button';
import AnimateOnScroll from './components/ui/AnimateOnScroll';
import CountdownTimer from './components/ui/CountdownTimer';
import AccordionItem from './components/ui/AccordionItem';
import SpotsBadge from './components/s2/SpotsBadge';
import PainPointSection from './components/sections/PainPointSection';
import TestimonialSection from './components/sections/TestimonialSection';
import FounderSection from './components/s2/FounderSection';
import Footer from './components/layout/Footer';
import { PRESEASON } from './data/configPre';
import { faqItems } from './data/faqPre';
import { spotsInfo } from './lib/spots';
import { countApplicantsPublic } from './lib/applyApi';
import { useCountdown } from './hooks/useCountdown';

// 프리시즌 신청자수 폴링(60초) — 남은 자리(30명 한정) 표시용. 코호트 row 없어도 count=0 방어.
function usePreseasonCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () => countApplicantsPublic(PRESEASON.cohortCode)
      .then((n) => { if (alive) setCount(n); })
      .catch(() => { /* DB row 없음 등 — 무시, 배지 숨김 */ });
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return count;
}

// 시즌3 프리시즌 랜딩 — "작심삼일: 3일 만에 뿌시기 챌린지" (무료).
// 결제·보증금·팀대항 없음. 3일 미션 + 5인 1팀 전원 완주 시 전원 스타벅스.
export default function LandingPagePreseason() {
  const navigate = useNavigate();
  const goApply = () => navigate('/apply');

  const count = usePreseasonCount();
  const spots = spotsInfo(count);
  // 마감 = 데드라인(7/22 20시) 지남 OR 정원 30명 참. 마감 후엔 대기명단 접수.
  const { isExpired: deadlinePassed } = useCountdown(PRESEASON.deadline);
  const isClosed = deadlinePassed || (spots?.full ?? false);
  const ctaLabel = isClosed ? '대기 명단 신청 →' : '무료로 신청하기 →';
  const stickyLabel = isClosed ? '대기 명단 신청 →' : `무료로 신청하기 · 마감 ${PRESEASON.deadlineLabel} →`;

  const scrollToHero = (e) => {
    e.preventDefault();
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 배너 우측 상태 문구 — 정원(30명)/마감 반영.
  const bannerStatus = isClosed
    ? '⏰ 마감 · 대기 명단 받는 중'
    : spots?.remaining != null
      ? `${spots.low ? '🔥 ' : ''}${spots.remaining}자리 남음`
      : '지금 신청받는 중';

  return (
    <div className="min-h-screen">
      {/* 상단 배너 */}
      <a
        href="#hero"
        onClick={scrollToHero}
        className="fixed top-0 left-0 right-0 z-50 bg-accent-green text-bg-primary text-center text-[11px] sm:text-sm font-extrabold py-2.5 px-3 block hover:brightness-105 transition-all tracking-tight leading-tight font-kr whitespace-nowrap overflow-hidden text-ellipsis"
      >
        🟢 무료 프리시즌 · 신청 마감 {PRESEASON.deadlineLabel} · {bannerStatus}
      </a>

      <div className="pt-12">
        <HeroSection onCTA={goApply} count={count} ctaLabel={ctaLabel} isClosed={isClosed} />
        <PainPointSection />
        <MissionSection onCTA={goApply} ctaLabel={ctaLabel} />
        <WhyTogetherSection />
        <FounderSection />
        <TestimonialSection />
        <TeamRewardSection onCTA={goApply} ctaLabel={ctaLabel} />
        <FAQSection />
        <FinalCTASection onCTA={goApply} ctaLabel={ctaLabel} />
        <Footer />
      </div>

      <StickyCTA onCTA={goApply} label={stickyLabel} />
    </div>
  );
}

function HeroSection({ onCTA, count, ctaLabel }) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-accent-green/10" />
      <div className="relative min-h-screen flex flex-col justify-center items-center px-6 py-16">
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <div className="flex justify-center mb-4 animate-fade-up">
            <span className="text-text-muted text-[11px] font-bold tracking-[0.18em]">
              run like <span className="font-black tracking-[0.25em] text-[13px] text-accent-green">TARZAN</span>
              <span className="text-white/30 mx-1">·</span>
              <span className="font-bold tracking-wide">FREE PRE-SEASON</span>
            </span>
          </div>

          <div className="flex justify-center mb-5 animate-fade-up">
            <span className="pill text-accent-green">무료 · 보증금 없음</span>
          </div>

          <h1
            className="font-kr text-4xl md:text-6xl font-black leading-[1.12] break-keep mb-3 animate-fade-up text-text-primary"
            style={{ animationDelay: '0.1s' }}
          >
            작심삼일,<br />
            <span className="text-accent-green" style={{ textShadow: '0 0 32px rgba(200,255,77,0.5)' }}>
              3일 만에 뿌시기
            </span>
          </h1>
          <p
            className="text-text-secondary text-base leading-relaxed mb-7 animate-fade-up"
            style={{ animationDelay: '0.18s' }}
          >
            10 - 11 - 12분.<br />
            <span className="text-text-primary font-bold">매일 조금씩 뛰면 성공.</span>
          </p>

          {/* 큰 카운트다운 — 신청 마감까지 */}
          <div className="my-7 animate-fade-up flex flex-col items-center gap-3" style={{ animationDelay: '0.22s' }}>
            <p className="text-text-secondary text-[11px] font-bold tracking-widest">
              DEADLINE · 신청 마감까지
            </p>
            <CountdownTimer targetDate={PRESEASON.deadline} size="lg" expiredText="신청이 마감되었어" />
            <p className="text-text-muted text-[12px] font-semibold">
              {PRESEASON.deadlineLabel} 마감
            </p>
          </div>

          {/* 한눈에 요약 */}
          <ul className="text-left space-y-2.5 text-sm bg-bg-card rounded-3xl p-6 mb-8 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)] animate-fade-up" style={{ animationDelay: '0.28s' }}>
            <li>💸 <span className="text-card-ink font-bold">완전 무료</span> · 보증금·참가비 없음</li>
            <li>📅 <span className="text-card-ink font-bold">7/23(목) ~ 7/25(토)</span>, 딱 3일</li>
            <li>🏃 하루 <span className="text-card-ink font-bold">10 · 11 · 12분</span> 러닝 (페이스·거리 자유)</li>
            <li>☕ <span className="text-bg-primary font-bold">팀 전원 완주 시 전원 스타벅스</span></li>
          </ul>

          <div className="animate-fade-up" style={{ animationDelay: '0.32s' }}>
            <SpotsBadge count={count} className="mb-4" />
            <Button onClick={onCTA} className="w-full max-w-xs shadow-[0_12px_40px_rgba(200,255,77,0.4)]">
              {ctaLabel}
            </Button>
            <p className="text-text-muted text-[11px] mt-3 font-semibold tracking-wide">
              누구나 · 지금 바로 · 2분이면 끝
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection({ onCTA, ctaLabel }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">MISSION · 3일 미션</span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 mb-3 text-text-primary leading-tight">
          하루 딱<br />10분부터.
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          거창하게 시작 안 해도 돼. 시간만 채우면 성공.<br />
          <span className="text-text-primary font-bold">페이스도, 거리도 네 맘대로.</span>
        </p>
      </AnimateOnScroll>

      <div className="space-y-3">
        {PRESEASON.missions.map((m) => (
          <AnimateOnScroll key={m.day}>
            <div className="bg-bg-card rounded-2xl p-5 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="w-14 h-14 rounded-2xl bg-accent-green/15 flex flex-col items-center justify-center shrink-0">
                <span className="text-bg-primary text-[10px] font-extrabold tracking-widest leading-none">DAY</span>
                <span className="text-bg-primary text-2xl font-black leading-none mt-0.5">{m.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-card-ink-faint text-[11px] font-extrabold tracking-widest">
                  {m.date}({m.weekday})
                </p>
                <p className="text-card-ink font-extrabold text-lg leading-tight">
                  {m.minutes}분 러닝
                </p>
              </div>
              <span className="text-2xl shrink-0">🏃</span>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      {/* 파이널 이벤트 */}
      <AnimateOnScroll className="mt-4">
        <div className="rounded-2xl p-5 border-2 border-dashed border-accent-orange/50 bg-accent-orange/10">
          <p className="text-accent-orange text-[11px] font-extrabold tracking-widest mb-1">
            🎉 {PRESEASON.finale.label}
          </p>
          <p className="text-text-primary font-bold text-[15px] leading-snug">
            {PRESEASON.finale.date}({PRESEASON.finale.weekday}) {PRESEASON.finale.time}
          </p>
          <p className="text-text-secondary text-[13px] mt-1 leading-relaxed">
            마지막 날 아침, 다같이 마지막 러닝하고 완주를 축하해.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-8">
        <Button onClick={onCTA} className="w-full">{ctaLabel}</Button>
      </AnimateOnScroll>
    </section>
  );
}

function WhyTogetherSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">WHY TEAM</span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 mb-6 text-text-primary leading-tight">
          혼자 하면<br />또 작심삼일.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <span className="inline-block bg-bg-primary/10 text-bg-primary text-[11px] font-extrabold px-3 py-1 rounded-full mb-5">
            📊 {PRESEASON.dataSampleLabel}
          </span>
          <div className="flex items-end gap-4">
            <div className="flex-1 text-center">
              <div className="h-28 rounded-2xl bg-white/10 flex items-end justify-center overflow-hidden">
                <div className="w-full bg-card-ink-faint/40" style={{ height: '29%' }} />
              </div>
              <p className="text-card-ink-faint text-3xl font-black mt-3 leading-none">29%</p>
              <p className="text-card-ink-faint text-xs mt-1 font-semibold">혼자 시작</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-28 rounded-2xl bg-accent-green/15 flex items-end justify-center overflow-hidden">
                <div className="w-full bg-accent-green" style={{ height: '95.7%' }} />
              </div>
              <p className="text-bg-primary text-3xl font-black mt-3 leading-none">95.7%</p>
              <p className="text-bg-primary text-xs mt-1 font-semibold">팀과 함께</p>
            </div>
          </div>
          <p className="text-card-ink-muted text-[13px] leading-relaxed mt-6 text-center">
            같은 목표를 향해 <span className="text-card-ink font-bold">서로 끌어주면</span> 완주율이 3배로 뛴다.<br />
            <span className="text-bg-primary font-bold">가장 최근 70명 중 95.7%가 끝까지 완주</span> — 그게 증거야.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

function TeamRewardSection({ onCTA, ctaLabel }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="bg-bg-card rounded-[28px] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
          <div className="text-5xl mb-5">☕</div>
          <span className="pill text-bg-primary block w-fit mx-auto mb-4">TEAM REWARD</span>
          <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
            {PRESEASON.rewardHeadline}
          </h2>
          <p className="text-card-ink-muted text-sm leading-relaxed mb-6">
            {PRESEASON.rewardText}
          </p>

          {/* 스타벅스 기프티콘 스크린샷 — public/에 파일 있으면 노출, 없으면 자동 숨김 */}
          <img
            src={PRESEASON.rewardImage}
            alt="스타벅스 기프티콘"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-full max-w-[240px] mx-auto rounded-2xl mb-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
          />

          <div className="rounded-2xl bg-bg-primary/5 border border-bg-primary/15 p-4 text-left space-y-2 text-[13px]">
            <p className="text-card-ink"><span className="text-bg-primary font-extrabold">5인 1팀</span> 으로 배정돼.</p>
            <p className="text-card-ink">팀원 <span className="text-bg-primary font-extrabold">5명 전원</span> 이 3일 완주하면</p>
            <p className="text-card-ink">팀 전원에게 <span className="text-bg-primary font-extrabold">스타벅스 기프티콘</span> 🎁</p>
          </div>
          <p className="text-card-ink-faint text-xs mt-4 leading-relaxed">
            혼자보다 같이. 팀이 있으면 끝까지 간다.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-8">
        <Button onClick={onCTA} className="w-full">{ctaLabel}</Button>
      </AnimateOnScroll>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">FAQ</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-8 text-text-primary leading-tight">
          자주 묻는 질문
        </h2>
      </AnimateOnScroll>
      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl px-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

function FinalCTASection({ onCTA, ctaLabel }) {
  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-4xl font-black text-text-primary mb-3 leading-tight">
          딱 3일.<br />
          <span className="text-accent-green">이번엔 진짜 뿌셔보자.</span>
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          무료야. 잃을 게 없어.<br />
          신청 마감 {PRESEASON.deadlineLabel} — 지금 자리 잡아둬.
        </p>
        <div className="flex flex-col items-center gap-3 mb-7">
          <CountdownTimer targetDate={PRESEASON.deadline} size="md" expiredText="신청이 마감되었어" />
        </div>
        <Button onClick={onCTA} className="w-full max-w-xs">{ctaLabel}</Button>
      </AnimateOnScroll>
    </section>
  );
}

function StickyCTA({ onCTA, label }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-bg-deep via-bg-deep/95 to-transparent">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onCTA}
          className="w-full bg-accent-green text-bg-primary font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all shadow-[0_8px_24px_rgba(200,255,77,0.35)]"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
