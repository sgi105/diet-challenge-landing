import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitRuntripApplication } from '../lib/runtripApi';

// [785] 웰니스 런트립 외부 공개 페이지. 앱 멤버용은 1000runclub /runtrip.
const BASE = '/runtrip';
const TOTAL_SPOTS = 12;
const DEADLINE = '2026-11-04';
const ACCOUNT = '1000 2641 8699 토스뱅크 신가인';
const HERO_TAGS = ['러닝', '명상', '핀란드 사우나', '알코올 프리'];

const OPTIONS = [
  { key: 'full', name: '풀코스 2박 3일', price: 290000, amount: '29만원', desc: '숙소 2박 · 금요일 바비큐 + 파이어사이드 챗부터 전부 같이', recommended: true },
  { key: 'weekend', name: '주말 1박 2일 (토-일)', price: 190000, amount: '19만원', desc: '토요일 09:00 아침 러닝부터 합류 · 숙소 1박 · 금요일 바비큐와 파이어사이드 챗은 빠져' },
];

const GALLERY = [
  { src: 'hanok-fire', label: '한옥 독채', wide: true },
  { src: 'river', label: '가평 러닝', wide: true },
  { src: 'pavilion', label: '정자' },
  { src: 'fire', label: '파이어사이드 챗' },
];

const DAYS = [
  { title: 'DAY 1 · 금', name: 'BBQ & Fireside Chat', note: '13:00 용산역 · 16:00 가평역 · 17:00 바비큐', items: [
    { icon: '🚐', title: '픽업 · 체크인', desc: '용산역 혹은 가평역에서 픽업' },
    { photo: 'hanok-fire', title: '바비큐', desc: '맛있는 고기를 먹으면서 사람들과 친해지는 시간' },
    { photo: 'fire', title: '파이어사이드 챗', desc: '고요한 밤에 평소에 이야기해 보지 못했던 주제들에 대해 진솔한 이야기를 나누는 시간' },
  ] },
  { title: 'DAY 2 · 토', name: 'Run & Sauna', note: '09:00 아침 러닝 출발 · 조식 포함 · 점심과 저녁은 각자', items: [
    { photo: 'sauna', title: '아침 러닝 · 핀란드식 사우나', desc: '아침에 러닝하고 핀란드식 사우나로 완벽한 디톡스와 리커버리를 하는 웰니스 세션' },
    { photo: 'pavilion', title: '디지털 디톡스 · 자유 시간', desc: '잠시 핸드폰을 내려놓고 책을 읽거나 옆 사람과 대화하거나 일기를 쓰며 온전히 몰입하는 시간' },
    { photo: 'team-game', title: '팀별 활동 · 게임', desc: '팀원들과 함께 상품 및 벌칙을 걸고 진행하는 재미있는 활동' },
  ] },
  { title: 'DAY 3 · 일', name: 'Yoga & Table Talk', note: '조식 포함 · 11:00 체크아웃 · 카풀로 서울 복귀', items: [
    { photo: 'river', title: '아침 러닝', desc: '가평의 경치를 즐기며 깨끗한 공기와 함께 상쾌한 러닝' },
    { photo: 'meditation', title: '요가 · 명상', desc: '복잡한 몸과 마음을 완전히 릴랙스하는 시간' },
    { photo: 'table-talk', title: '테이블 토크', desc: '아침을 먹으며 이 시간 동안 어땠는지 돌아가서 어떻게 지낼 건지 이야기하고 일상으로 복귀할 준비' },
  ] },
];

const FAQS = [
  ['러닝 초보도 가도 돼?', '완전 돼. 페이스 맞춰서 같이 뛰고 기록 경쟁 아니야'],
  ['자리는 언제 확정돼?', '입금 완료 순으로 확정돼. 신청한 날까지 입금해줘'],
  ['혼자 신청해도 돼?', '완전 돼. 혼자 와도 2박 3일 같이 지내다 보면 금방 친해져'],
  ['방은 어떻게 써?', '방은 팀별로 배정할 거고 남녀 구분돼'],
  ['식사는 어떻게 돼?', '금요일 바비큐 저녁이랑 조식 2회가 참가비에 포함이야. 토요일 점심 · 저녁은 포함이 아니라 각자 부담이야'],
  ['환불은 언제까지 돼?', '11/5(목)까지 돼. 숙소를 미리 예약해야 해서 그 이후로는 안 돼'],
  ['사우나 복장이랑 준비물은?', '사우나는 운동복 입고 하면 돼. 준비물은 러닝화 챙겨와'],
  ['금요일에 못 가면?', '주말 1박 2일로 합류하면 돼. 토요일 아침 러닝이 09:00 출발이라 러닝에 참여하려면 그때까지 와줘'],
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function SectionTitle({ children }) {
  return <h2 className="text-[22px] font-extrabold tracking-tight mb-4">{children}</h2>;
}

function ApplySheet({ option, onClose, onDone }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const digits = phone.replace(/[^0-9]/g, '');
  const valid = name.trim().length > 0 && /^01[0-9]{8,9}$/.test(digits) && agreed;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setError('');
    try {
      await submitRuntripApplication({ name: name.trim(), phone: digits, option: option.key });
      onDone();
    } catch (err) {
      console.error('[runtrip] 신청 실패:', err);
      setError(err?.message?.includes('runtrip_closed') ? '신청이 마감됐어' : '전송에 실패했어. 다시 눌러줘');
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={sending ? undefined : onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="런트립 신청"
        className="w-full max-w-[480px] bg-white text-[#1c1f1a] rounded-t-2xl px-6 pt-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <p className="text-lg font-extrabold">{option.name}</p>
        <p className="text-2xl font-extrabold">{option.price.toLocaleString()}원</p>
        <label className="block mt-4 text-sm font-bold">이름
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="name" className="mt-1 block w-full h-12 rounded-xl border border-[#d9cfbb] px-3 text-base font-normal outline-none focus:border-[#1f4d3a]" />
        </label>
        <label className="block mt-3 text-sm font-bold">휴대폰 번호
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="01012345678" className="mt-1 block w-full h-12 rounded-xl border border-[#d9cfbb] px-3 text-base font-normal outline-none focus:border-[#1f4d3a]" />
        </label>
        <label className="flex items-center gap-2 mt-3 min-h-11 text-sm text-[#4f554b]">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 accent-[#1f4d3a]" />
          <span>신청 안내 연락을 위한 <Link to="/privacy" target="_blank" className="underline">개인정보 수집 · 이용</Link>에 동의해</span>
        </label>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} disabled={sending} className="h-14 flex-1 rounded-2xl bg-[#ece7dc] font-bold">취소</button>
          <button type="submit" disabled={!valid || sending} className="h-14 flex-[2] rounded-2xl bg-[#d9531e] text-white font-extrabold disabled:opacity-50">
            {sending ? '보내는 중' : '신청하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DonePopup({ option, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT);
      setCopied(true);
    } catch (err) {
      console.error('[runtrip] 복사 실패:', err);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
      <div role="dialog" aria-label="런트립 신청 완료" className="w-full max-w-[340px] bg-white text-[#1c1f1a] rounded-2xl p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="text-xl font-extrabold">런트립에 온 걸 환영해!</p>
        <p className="mt-2 text-[15px] text-[#4f554b]">오늘까지 아래 계좌로 입금 부탁할게.<br />입금 완료 순으로 자리가 확정돼.</p>
        <div className="mt-4 rounded-xl bg-[#f6f3ec] p-3">
          <p className="font-extrabold">{ACCOUNT}</p>
          <p className="mt-1 font-extrabold text-[#d9531e]">{option.amount}</p>
        </div>
        <button onClick={copy} className="mt-3 w-full h-12 rounded-xl bg-[#ece7dc] font-bold">{copied ? '복사했어' : '계좌 복사'}</button>
        <p className="mt-3 text-[13px] text-[#4f554b]">입금 확인되면 남겨준 번호로 연락할게</p>
        <button onClick={onClose} className="mt-3 w-full h-14 rounded-2xl bg-[#1f4d3a] text-white font-extrabold">확인</button>
      </div>
    </div>
  );
}

export default function RuntripPage() {
  const [optionKey, setOptionKey] = useState(OPTIONS[0].key);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const option = OPTIONS.find((o) => o.key === optionKey);
  const closed = todayLocal() > DEADLINE;

  useEffect(() => {
    const prev = document.title;
    document.title = '지금 이 순간에 100% 몰입하는 웰니스 런트립';
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="min-h-dvh bg-[#f6f3ec] text-[#1c1f1a] leading-relaxed">
      <div className="max-w-[480px] mx-auto pb-[calc(170px+env(safe-area-inset-bottom))]">
        <img src={`${BASE}/bali-run.jpg`} alt="같이 달리는 러너들" className="block w-full aspect-[5/4] object-cover object-[50%_75%]" />

        <header className="bg-[#1f4d3a] text-white px-6 pt-6 pb-10">
          <span className="inline-block text-[13px] font-bold px-3 py-1.5 rounded-full bg-[#d9531e] mb-4">선착순 {TOTAL_SPOTS}명 · 11/4(수) 마감</span>
          <p className="text-[15px] font-semibold">발리타잔과 함께하는</p>
          <h1 className="mt-1 mb-4 text-[34px] leading-tight font-extrabold tracking-tight">지금 이 순간에<br />100% 몰입하는<br />웰니스 런트립</h1>
          <p className="text-[17px] opacity-90">내가 온전히 느끼고 즐기는 걸 방해하는 핸드폰은 잠시 멀리하고 청정 자연 가평에서 맑은 공기와 함께 건강한 사람들 그리고 나 자신과 온전히 연결되는 2박 3일</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {HERO_TAGS.map((tag) => (
              <span key={tag} className="text-[13px] font-bold px-3 py-1.5 rounded-full bg-white/15">{tag}</span>
            ))}
          </div>
          <dl className="mt-6 grid gap-2.5 text-[15px]">
            {[['일정', '11월 13일(금) - 15일(일)'], ['장소', '경기도 가평'], ['집결', '금 13:00 용산역 · 16:00 가평역 픽업'], ['인원', `선착순 ${TOTAL_SPOTS}명`]].map(([k, v]) => (
              <div key={k} className="flex gap-2.5"><dt className="min-w-11 opacity-70 font-semibold">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </header>

        <section className="px-6 pt-10">
          <SectionTitle>왜 만들었냐면</SectionTitle>
          <div className="bg-white border border-[#e2ddd1] rounded-2xl overflow-hidden">
            <img src={`${BASE}/cover-sauna.jpg`} alt="사우나에서 쉬고 있는 사람들" className="block w-full aspect-[5/4] object-cover object-[50%_65%]" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3.5">
                <img src={`${BASE}/a-gain.jpg`} alt="발리타잔" className="w-12 h-12 rounded-full object-cover" />
                <p className="font-extrabold">발리타잔</p>
              </div>
              <div className="grid gap-3 text-[15px]">
                <p>웰니스 선진국 발리에서 내가 느꼈던 경험을 그대로 한국으로 가져왔어.</p>
                <p>아침에 러닝하고 사우나하고 다 같이 아침 먹고 자연을 즐기고.</p>
                <p>잠시 일상을 멈추고 온전히 내 몸과 마음 그리고 지금에 집중하는 시간.</p>
                <p className="font-bold">늦은 밤이나 술 없이 진행되는 알코올 프리 웰니스 런트립이야.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-10">
          <SectionTitle>가평에서 보낼 2박 3일</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {GALLERY.map(({ src, label, wide }) => (
              <figure key={src} className={`relative ${wide ? 'col-span-2' : ''}`}>
                <img src={`${BASE}/${src}.jpg`} alt={label} className={`block w-full rounded-xl object-cover ${wide ? 'h-auto' : 'aspect-square'}`} />
                <figcaption className="absolute left-2 bottom-2 bg-black/65 text-white text-[13px] font-bold px-2 py-0.5 rounded-md">{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="px-6 pt-10">
          <SectionTitle>2박 3일 동안 하는 것</SectionTitle>
          {DAYS.map((day) => (
            <div key={day.title} className="mb-6">
              <p className="text-[13px] font-bold text-[#4f554b]">{day.title}</p>
              <h3 className="text-lg font-extrabold text-[#1f4d3a] mb-2.5">{day.name}</h3>
              <div className="grid gap-2">
                {day.items.map((item) => (
                  <div key={item.title} className="flex gap-3 bg-white border border-[#e2ddd1] rounded-2xl p-3">
                    {item.photo
                      ? <img src={`${BASE}/${item.photo}.jpg`} alt="" className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" />
                      : <div className="w-[72px] h-[72px] rounded-xl bg-[#ece7dc] grid place-items-center text-3xl shrink-0">{item.icon}</div>}
                    <div className="min-w-0">
                      <p className="font-extrabold">{item.title}</p>
                      <p className="text-sm leading-snug text-[#4f554b] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-[#4f554b]">{day.note}</p>
            </div>
          ))}
        </section>

        <section className="px-6 pt-4">
          <SectionTitle>참가비</SectionTitle>
          <div className="bg-[#1f4d3a] text-white rounded-2xl px-5 py-4 mb-3">
            <p className="font-extrabold mb-2">참가비에 포함된 것 (풀코스 기준)</p>
            <p className="text-[15px] opacity-90">숙소 · 바비큐 저녁 · 조식 2회 · 가평역 픽업 · 아침 러닝 2회 · 핀란드식 사우나 · 요가 · 명상 · 팀별 활동 · 파이어사이드 챗 · 디지털 디톡스</p>
          </div>
          <div className="bg-white border border-[#e2ddd1] rounded-2xl px-5 py-4 mb-3">
            <p className="font-extrabold mb-2">참가비에 포함되지 않은 것</p>
            <p className="text-[15px] text-[#4f554b]">토요일 점심 · 토요일 저녁</p>
          </div>
          <div role="radiogroup" aria-label="참가 옵션">
            {OPTIONS.map((o) => {
              const selected = o.key === optionKey;
              return (
                <button
                  key={o.key}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setOptionKey(o.key)}
                  disabled={applied || closed}
                  className={`w-full text-left bg-white border-2 rounded-2xl p-5 mb-3 ${selected ? 'border-[#1f4d3a]' : 'border-[#e2ddd1]'}`}
                >
                  <span className="flex items-center gap-2 text-[15px] font-bold text-[#4f554b]">
                    <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${selected ? 'border-[#1f4d3a]' : 'border-[#d9cfbb]'}`}>
                      {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#1f4d3a]" />}
                    </span>
                    {o.name}
                    {o.recommended && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#1f4d3a] text-white">추천</span>}
                  </span>
                  <span className="block text-[30px] font-extrabold mt-1 mb-1.5">{o.price.toLocaleString()}<small className="text-base font-semibold">원</small></span>
                  <span className="block text-[15px] text-[#4f554b]">{o.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-6 pt-10">
          <SectionTitle>궁금한 거</SectionTitle>
          {FAQS.map(([q, a]) => (
            <details key={q} className="bg-white border border-[#e2ddd1] rounded-xl px-[18px] py-4 mb-2.5">
              <summary className="font-bold cursor-pointer">{q}</summary>
              <p className="mt-2.5 text-[15px] text-[#4f554b]">{a}</p>
            </details>
          ))}
        </section>

        <div className="text-center px-6 pt-12">
          <p className="text-lg font-bold">잠시 일상을 멈추고<br />같은 길을 같이 뛰는 주말 🔥</p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-[#f6f3ec]/95 border-t border-[#e2ddd1] px-4 pt-3 z-20" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-[448px] mx-auto">
          <button
            onClick={() => setSheetOpen(true)}
            disabled={closed || applied}
            className="block w-full h-14 rounded-2xl bg-[#d9531e] text-white font-extrabold disabled:opacity-50"
          >
            {closed ? '마감됐어' : applied ? '신청 완료' : `${option.name} 신청하기`}
          </button>
          <p className="text-center text-[13px] text-[#4f554b] mt-1.5">입금 완료 순 확정 · {TOTAL_SPOTS}명 차면 바로 마감 · 11/4(수)까지</p>
        </div>
      </div>

      {sheetOpen && (
        <ApplySheet
          option={option}
          onClose={() => setSheetOpen(false)}
          onDone={() => { setSheetOpen(false); setApplied(true); setDoneOpen(true); }}
        />
      )}
      {doneOpen && <DonePopup option={option} onClose={() => setDoneOpen(false)} />}
    </div>
  );
}
