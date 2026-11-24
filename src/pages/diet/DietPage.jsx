import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { logEvent, once } from '../../lib/eventLog';
import { metaTrack } from '../../lib/metaPixel';
import Footer from '../../components/layout/Footer';
import { AZ, RECEIPT, RECEIPT_TOTAL, REVIEWS } from '../../data/diet';
import DietApplySheet from './DietApplySheet';
import './diet.css';

// /diet — 식단 없이 100일 애슬릿 프로그램 1:1 상담 랜딩 (가인 2026-11-17).
// 시안 SOT: design-references/diet100-landing-v2.html · 문구·선택지는 src/data/diet.js
// 흐름: 식단 없이(훅) → 1,000만원 쓴 사람(타깃) → 안 된 이유 → 애슬릿 각인 → 3가지 → A to Z → 내 이야기 → 영상 후기 3 → 상담 신청
// 가격은 쓰지 않는다(상담 때만).

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.12 });
    document.querySelectorAll('.d100 .reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// 100칸 — 보일 때 하나씩 채워진다. 101번째는 빈칸(“안 할 수 있겠어?”).
function Grid100() {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => setN((x) => { if (x >= 100) { clearInterval(timer); return x; } return x + 2; }), 36);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, []);
  return (
    <div className="grid100" ref={ref} aria-label="100일 매일 운동">
      {Array.from({ length: 100 }, (_, i) => <i key={i} className={i < n ? 'on' : ''} />)}
    </div>
  );
}

// 영상 후기 — 탭하면 소리 켜고 재생. 하나 틀면 나머지는 멈춘다.
function Reviews() {
  const [playing, setPlaying] = useState(-1);
  const refs = useRef([]);
  const play = (i) => {
    refs.current.forEach((v, j) => { if (v && j !== i) v.pause(); });
    const v = refs.current[i];
    v.muted = false;
    v.controls = true;
    v.play().catch(() => {});
    setPlaying(i);
    track('diet_review_play', { name: REVIEWS[i].name });
    logEvent('diet_review_play', { placement: REVIEWS[i].name }); // landing_events 칸에 맞춰야 저장됨(없는 칸이면 통째로 실패)
  };
  return (
    <div className="reviews">
      {REVIEWS.map((r, i) => (
        <div className="rv" key={r.name}>
          <div className="vbox">
            {playing !== i && <span className="tag">{r.tag}</span>}
            <video
              ref={(el) => { refs.current[i] = el; }}
              src={r.src}
              poster={r.poster}
              playsInline
              preload="metadata"
              onPause={(e) => { if (!e.currentTarget.seeking && playing === i) { e.currentTarget.controls = false; setPlaying(-1); } }}
              onEnded={() => setPlaying(-1)}
            />
            {playing !== i && (
              <button className="play" onClick={() => play(i)}><i /><span>{r.name} 후기 듣기</span></button>
            )}
          </div>
          <h4>{r.quote[0]}<br /><em>{r.quote[1]}</em>{r.quote[2]}</h4>
          <p className="who">{r.who}</p>
        </div>
      ))}
    </div>
  );
}

export default function DietPage() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({ phoneCountry: 'KR' });
  const [step, setStep] = useState(0);
  const [stickyOn, setStickyOn] = useState(false);
  const heroRef = useRef(null);
  useReveal();

  useEffect(() => {
    if (once('diet_view')) logEvent('diet_view');
    const prev = document.title;
    document.title = '식단 없이 100일 · 애슬릿 프로그램';
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setStickyOn(!e.isIntersecting));
    if (heroRef.current) io.observe(heroRef.current);
    return () => io.disconnect();
  }, []);

  const cta = (placement) => () => {
    track('diet_cta_click', { placement });
    logEvent('diet_cta_click', { placement });
    metaTrack('ViewContent', { content_name: `diet_cta_${placement}` });
    document.querySelectorAll('.d100 video').forEach((v) => { if (!v.muted) v.pause(); });
    setOpen(true);
  };

  const close = (finished) => {
    setOpen(false);
    if (finished) { setAnswers({ phoneCountry: 'KR' }); setStep(0); window.scrollTo({ top: 0 }); }
  };

  return (
    <div className="d100">
      <button className="band" onClick={cta('banner')}>⚡ 100일 애슬릿 프로그램 · 1:1 상담 신청 받는 중</button>

      <div className="wrap">
        {/* ① 히어로 — '식단 없이'가 제일 먼저 */}
        <section className="hero" id="hero" ref={heroRef}>
          <span className="nodiet"><s>식단</s> 없이</span>
          <h1>
            <span className="l1"><span className="lime">100일</span> 안에</span>
            <span className="l2 glow">다이어트 고민<br />평생 끝내줄게</span>
            <span className="l3">닭가슴살·도시락·굶기 <span className="orange">전부 X</span></span>
          </h1>
          <div className="media2">
            <div className="slot">
              <span className="badge">BEFORE</span>
              <video src="/s5v2/before.mp4" poster="/s5v2/before.jpg" autoPlay muted loop playsInline preload="metadata" />
              <p>12년 동안 못 만든 몸</p>
            </div>
            <div className="slot">
              <span className="badge on">AFTER</span>
              <video src="/s5v2/after.mp4" poster="/s5v2/after.jpg" autoPlay muted loop playsInline preload="metadata" />
              <p>애슬릿이 된 몸</p>
            </div>
          </div>
          <p className="nopay">그리고 앞으로 다이어트에<br /><span className="lime">한 푼도</span> 안 쓰게 해줄게</p>
          <div style={{ marginTop: 18 }}>
            <button className="btn pulse" onClick={cta('hero')}>1:1 상담 신청하기<small>2분이면 끝 · 내가 직접 연락할게</small></button>
          </div>
        </section>

        {/* ② 타깃 — 1,000만원 */}
        <section className="reveal">
          <p className="kicker">이 페이지는</p>
          <h2 className="h2">다이어트에<br /><span className="orange">1,000만원</span> 이상 쓴<br />사람만 봐</h2>
          <div className="receipt">
            <div className="rh">MY DIET RECEIPT</div>
            <span className="stamp">또 요요</span>
            <ul>{RECEIPT.map((r) => <li key={r.label}><span>{r.label}</span><b>{r.amount}</b></li>)}</ul>
            <div className="sum"><span>합계</span><b>{RECEIPT_TOTAL}</b></div>
            <p className="rnote">흔한 다이어트 영수증 · 업계 평균 시세로 계산한 예시</p>
          </div>
          <p className="body" style={{ marginTop: 28 }}>그런데도 <b>아직도</b> 다이어트 고민하고 있고<br />돈 <b>또</b> 써야 하고.</p>
          <p className="big" style={{ marginTop: 10 }}>지겹지 않아?</p>
        </section>

        {/* ③ 여태 안 된 이유 */}
        <section className="reveal">
          <div className="simple">
            <p className="kicker">다이어트는 간단해</p>
            <p className="big lime" style={{ marginTop: 6 }}>운동 꾸준히<br />하면 돼.</p>
          </div>
          <p className="kicker" style={{ marginTop: 40 }}>근데 안 되는 이유는</p>
          <h2 className="h2">딱 하나야</h2>
          <p style={{ marginTop: 22, fontSize: 17, lineHeight: 1.6, color: 'var(--d-t2)', fontWeight: 600 }}>
            네가 스스로를<br />
            <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--d-t1)' }}>“운동 안 하는 사람”</span><br />
            이라고 생각해서.
          </p>
        </section>

        {/* ④ 애슬릿 각인 */}
        <section className="reveal">
          <p className="kicker">그래서 내가 해줄 건 딱 하나</p>
          <p className="big glow" style={{ marginTop: 8 }}>널 <span className="lime">애슬릿</span>으로<br />만들어줄게</p>
          <div className="word">
            <div className="en">ATHLETE</div>
            <div className="pr">애슬릿 · 명사</div>
            <div className="df">“나는 운동하는 사람이다.”<br />이걸 <span style={{ color: 'var(--d-bg)' }}>진짜로 믿는 사람.</span></div>
          </div>
          <div className="vs">
            <div className="d">
              <h4>다이어터</h4>
              <ul><li>살 빼려고 운동</li><li>먹고 싶은 거 참기</li><li>혼자 결심</li><li>목표 찍으면 끝 → 요요</li></ul>
            </div>
            <div className="a">
              <h4>애슬릿</h4>
              <ul><li>대회 위해 훈련</li><li>몸은 따라오는 것</li><li>팀이랑 같이</li><li>평생 → 안 하는 게 어려움</li></ul>
            </div>
          </div>
          <p className="body" style={{ marginTop: 26 }}>스스로를 애슬릿이라고 <b>진짜 믿게 되는 순간</b><br />평생 운동하는 게 어렵지 않아.<br />아니, 오히려</p>
          <p className="h2" style={{ marginTop: 4 }}><span className="lime">안 하는 게</span> 더 어려워져.</p>
        </section>

        {/* ⑤ 3가지 */}
        <section className="reveal" style={{ paddingTop: 16 }}>
          <p className="kicker">애슬릿이 되려면</p>
          <h2 className="h2">딱 <span className="lime">3가지</span>만 하면 돼</h2>
          <div className="step">
            <div className="num">01</div>
            <h3>성공 관성 만들기</h3>
            <p>100일 동안 매일 운동하면 뇌가 이렇게 생각해.<br /><b>“아, 나는 매일 운동하는 사람이구나.”</b></p>
            <Grid100 />
            <div className="day101">
              <div><div className="dd">DAY 101</div><div className="dq">안 할 수 있겠어?</div></div>
              <div className="box" />
            </div>
          </div>
          <div className="step">
            <div className="num">02</div>
            <h3>팀에 들어가기</h3>
            <p>운동 선수는 혼자 안 해. 항상 팀이랑 같이 하지.<br /><b>너랑 같은 목표를 가진 팀원들과 같이 도전하는 거야.</b></p>
            <img className="photo" src="/s5v2/feed.jpg" alt="같이 운동한 팀원과 사진" loading="lazy" />
          </div>
          <div className="step">
            <div className="num">03</div>
            <h3>대회 나가기</h3>
            <p>운동 선수는 대회를 나가려고 준비해.<br /><b>하루하루 운동에 의미가 생기는 거야.</b></p>
            <div className="row2">
              <div className="ph"><img src="/founder/hyrox.jpg" alt="하이록스 대회" loading="lazy" /><span>HYROX</span></div>
              <div className="ph"><img src="/founder/marathon.png" alt="100km 울트라마라톤" loading="lazy" /><span>100K 울트라</span></div>
            </div>
          </div>
        </section>

        {/* ⑥ A to Z */}
        <section className="reveal">
          <p className="kicker">운동만 알려주는 거 아니야</p>
          <h2 className="h2">애슬릿 되는 데 필요한 거<br /><span className="lime">A부터 Z까지 전부</span></h2>
          <div className="az">
            {AZ.map((x) => <div key={x.title}><div className="ic">{x.icon}</div><b>{x.title}</b><p>{x.desc}</p></div>)}
            <div className="wide"><div className="ic">🔥</div><b>그리고 내가 직접 붙어서</b><p>100일 동안 네 옆에서 같이 간다</p></div>
          </div>
          <p className="vow">이것만 하면 <span className="lime">무조건</span> 바뀌어.<br />내가 장담할게.</p>
        </section>

        {/* ⑦ 내 이야기 */}
        <section className="reveal">
          <h2 className="h2" style={{ textAlign: 'left' }}>이 방법으로<br />나는 <span className="lime">12년 만에</span><br />드디어 몸을 만들었어.</h2>
          <div className="fcard">
            <p><b>12년 동안 운동을 꾸준히 못 했어.</b><br />“이번엔 진짜!!!” 하고 바로 작심삼일.<br />몸은 못 만들고 돈만 썼어.</p>
            <p>그러다 다이어터를 그만두고<br /><span className="hl">애슬릿으로 살기로 했어.</span><br />매일 하고, 팀이랑 하고, 대회를 나갔어.</p>
            <p>결과?<br />풀마라톤 완주. 100km 울트라 완주.<br />HYROX <span className="hl">버피 구간 전체 1등.</span><br />그리고 처음으로 바디프로필.</p>
            <div className="scroller">
              {[['/founder/bodyprofile0.webp', '바디프로필'], ['/founder/bodyprofile2.png', '바디프로필'], ['/founder/hyrox_rank.png', '버피 1등'], ['/founder/marathon.png', '100K 울트라']].map(([src, l]) => (
                <div className="ph" key={src}><img src={src} alt={l} loading="lazy" /><span>{l}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑧ 영상 후기 3개 — 소리 포함 */}
        <section className="reveal" style={{ paddingTop: 8 }}>
          <p className="kicker">그리고 이 방법으로</p>
          <h2 className="h2">정말 많은 사람들의<br /><span className="lime">몸을 만들어줬어</span></h2>
          <p className="body" style={{ marginTop: 10, fontSize: 13 }}>🔊 소리 켜고 들어봐</p>
          <Reviews />
        </section>

        {/* ⑨ 마지막 */}
        <section className="reveal">
          <p className="big glow">너도<br /><span className="lime">할 수 있어.</span></p>
          <p className="body" style={{ marginTop: 14 }}>질문 몇 개만 답해줘.<br /><b>내가 직접 읽고 연락할게.</b></p>
          <div style={{ marginTop: 22 }}><button className="btn pulse" onClick={cta('final')}>1:1 상담 신청하기<small>2분이면 끝</small></button></div>
        </section>
      </div>

      <Footer />

      <div className={`sticky ${stickyOn && !open ? 'show' : ''}`}>
        <button className="btn" onClick={cta('sticky')}>1:1 상담 신청하기<small>식단 없이 100일 · 애슬릿 프로그램</small></button>
      </div>

      {open && <DietApplySheet answers={answers} setAnswers={setAnswers} step={step} setStep={setStep} onClose={close} />}
    </div>
  );
}
