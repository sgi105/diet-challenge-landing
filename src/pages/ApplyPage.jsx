import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { submitApplication, countApplicantsPublic } from '../lib/applyApi';
import { PRESEASON } from '../data/configPre';
import { previewCount } from '../lib/spots';
import { useCountdown } from '../hooks/useCountdown';
import { GOAL_OPTIONS, MAX_GOALS } from '../data/applicationGoals';

const STORAGE_KEY_MAIN = 'samurai-season2-apply-v1';
const STORAGE_KEY_REFERRAL = 'samurai-season2-apply-referral-v1';

const initialForm = {
  name: '',
  age: '',
  gender: '',
  phoneCountry: 'KR',
  phone: '',
  job: '',
  region: '',
  runningExp: '',
  motivation: '',
  goals: [],
  goalsOther: '',
  instagram: '',
  kakaoId: '',
  friend: '',
  referrerName: '',
  agreeDeposit: false,
  agreeSchedule: false,
};

const runningExpOptions = [
  { value: 'full_marathon', label: '풀마라톤(42km) 완주 경험' },
  { value: 'half_marathon', label: '하프(21km) 완주 경험' },
  { value: 'run_10km', label: '10km 뛸 수 있다' },
  { value: 'run_5km', label: '5km 뛸 수 있다' },
  { value: 'run_1km', label: '1km 정도 뛸 수 있다' },
  { value: 'almost_none', label: '거의 안 뛰어봤다' },
];

const MAIN_STEPS = ['intro', 'name', 'age', 'gender', 'phone', 'job', 'region', 'runningExp', 'motivation', 'goals', 'instagram', 'friend', 'deposit', 'schedule'];
const REFERRAL_STEPS = ['intro', 'referrer', 'name', 'age', 'gender', 'phone', 'job', 'region', 'runningExp', 'motivation', 'goals', 'instagram', 'deposit', 'schedule'];

function loadState(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function saveState(storageKey, state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function clearState(storageKey) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReferral = searchParams.get('type') === 'referral';

  const STORAGE_KEY = isReferral ? STORAGE_KEY_REFERRAL : STORAGE_KEY_MAIN;
  // 프리시즌은 무료 → 보증금(deposit) step 제거.
  const STEPS = (isReferral ? REFERRAL_STEPS : MAIN_STEPS).filter(s => s !== 'deposit');
  const TOTAL_QUESTIONS = STEPS.length - 1;

  const persisted = useMemo(() => loadState(STORAGE_KEY), [STORAGE_KEY]);
  const [step, setStep] = useState(() => Math.min(persisted?.step ?? 0, STEPS.length - 1));
  const [form, setForm] = useState(persisted?.form ?? initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const stepKey = STEPS[step];

  useEffect(() => {
    if (!isReferral) return;
    const prev = document.title;
    document.title = '지인 추천 사전신청';
    return () => { document.title = prev; };
  }, [isReferral]);

  useEffect(() => {
    saveState(STORAGE_KEY, { step, form });
  }, [STORAGE_KEY, step, form]);

  useEffect(() => {
    track('apply_step_view', { step, stepKey, isReferral });
  }, [step, stepKey, isReferral]);

  useEffect(() => {
    // 동의 step(보증금/일정)은 본문이 길어 top으로 가면 체크박스가 viewport 밖.
    // → 체크박스로 직접 스크롤. 다른 step은 페이지 상단으로.
    const id = requestAnimationFrame(() => {
      const checkbox = document.querySelector('[data-consent-checkbox="true"]');
      if (checkbox) {
        checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [step]);

  // 마감(데드라인 7/22 20시 또는 정원 30명) 후 = 대기명단 접수 모드.
  const { isExpired: deadlinePassed } = useCountdown(PRESEASON.deadline);
  const [applicantCount, setApplicantCount] = useState(null);
  useEffect(() => {
    countApplicantsPublic(PRESEASON.cohortCode).then(setApplicantCount).catch(() => { /* row 없음 등 무시 */ });
  }, []);
  const previewedCount = previewCount(applicantCount); // URL ?spots=N 프리뷰 지원(마감 화면 확인용)
  const isClosed = deadlinePassed || (previewedCount != null && previewedCount >= (PRESEASON.totalSpots || 30));

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    const v = validateStep(stepKey, form);
    if (v) {
      setError(v);
      track('apply_step_invalid', { step, stepKey, reason: v, isReferral });
      return;
    }
    track('apply_step_complete', { step, stepKey, isReferral });
    setError('');
    setStep(s => Math.min(s + 1, TOTAL_QUESTIONS));
  };

  const goBack = () => {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const v = validateStep(stepKey, form);
    if (v) {
      setError(v);
      track('apply_step_invalid', { step, stepKey, reason: v, isReferral });
      return;
    }
    setSubmitting(true);
    setError('');
    track('apply_submit_attempt', { isReferral });
    let attempt = 0;
    while (attempt < 2) {
      try {
        const { id } = await submitApplication(form, { waitlist: isClosed });
        track('apply_submit_success', { isReferral });
        const friendAttached = !!(form.friend || '').trim();
        if (friendAttached) track('apply_submit_friend_attached');
        clearState(STORAGE_KEY);
        navigate('/apply/done', { state: { id, phone: form.phone.trim(), friendAttached, isReferral } });
        return;
      } catch (e) {
        attempt++;
        if (attempt >= 2) {
          track('apply_submit_failed', { message: String(e?.message || e).slice(0, 120), isReferral });
          setError(e.message || '제출 중 오류가 발생했어. 다시 시도해줘.');
          setSubmitting(false);
          return;
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  };

  const handleReset = () => {
    if (!confirm('지금까지 입력한 내용을 모두 지우고 처음부터 다시 시작할까?')) return;
    clearState(STORAGE_KEY);
    setForm(initialForm);
    setStep(0);
  };

  const nextLabel = (() => {
    if (step === 0) return '시작하기 →';
    if (step >= TOTAL_QUESTIONS - 2) return `다음 (${step + 1}/${TOTAL_QUESTIONS}) →`;
    return '다음 →';
  })();

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (step < TOTAL_QUESTIONS) goNext();
    else if (step === TOTAL_QUESTIONS && !submitting) handleSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col" onKeyDown={handleKeyDown}>
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="text-text-muted text-sm hover:text-accent-green transition-colors font-semibold">← 메인</Link>
        <div className="flex items-center gap-2">
          {isReferral && (
            <span className="pill text-accent-orange text-[10px] py-0.5 px-2">REFERRAL</span>
          )}
          {step > 0 && (
            <span className="text-text-muted text-xs font-extrabold tracking-widest">
              {Math.min(step, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
            </span>
          )}
        </div>
        <span className="w-12" />
      </header>

      {step > 0 && (
        <div className="h-1.5 bg-white/10">
          <div
            className={`h-full transition-all duration-300 ${isReferral ? 'bg-accent-orange' : 'bg-accent-green'}`}
            style={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      )}

      {isClosed && (
        <div className="bg-accent-orange/15 border-b border-accent-orange/30 px-6 py-3">
          <p className="max-w-md mx-auto text-accent-orange text-[13px] font-bold leading-tight text-center">
            ⏰ 정원 마감 · <span className="font-extrabold">대기 명단으로 접수 중</span>
            <span className="block text-text-muted text-[11px] font-semibold mt-0.5">자리 나면 신청 순서대로 합류 안내</span>
          </p>
        </div>
      )}

      <main className="flex-1 px-6 py-10 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <StepContent stepKey={stepKey} form={form} update={update} isReferral={isReferral} totalQuestions={TOTAL_QUESTIONS} />
          {error && (
            <p className="text-accent-orange text-sm mt-4 font-semibold">{error}</p>
          )}
        </div>
      </main>

      <footer className="px-6 pb-6 pt-4 border-t border-white/10 sticky bottom-0 bg-bg-deep/80 backdrop-blur">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && step < TOTAL_QUESTIONS && (
            <button
              onClick={goBack}
              className="px-5 py-4 rounded-2xl border-2 border-white/20 text-white font-bold hover:border-accent-green/60 transition-colors"
            >
              이전
            </button>
          )}
          {step < TOTAL_QUESTIONS && (
            <button
              onClick={goNext}
              className="flex-1 bg-accent-green text-bg-primary font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all cursor-pointer shadow-[0_8px_24px_rgba(200,255,77,0.3)]"
            >
              {nextLabel}
            </button>
          )}
          {step === TOTAL_QUESTIONS && (
            <>
              <button
                onClick={goBack}
                disabled={submitting}
                className="px-5 py-4 rounded-2xl border-2 border-white/20 text-white font-bold hover:border-accent-green/60 transition-colors disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-accent-green text-bg-primary font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_8px_24px_rgba(200,255,77,0.3)]"
              >
                {submitting ? '제출 중...' : (isClosed ? '대기 명단 신청하기 →' : '지원서 제출하기 →')}
              </button>
            </>
          )}
        </div>
        {step > 0 && (
          <div className="max-w-md mx-auto mt-3 text-center">
            <button onClick={handleReset} className="text-text-muted text-[11px] hover:text-accent-orange transition-colors">
              처음부터 다시 작성
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

const AGES = Array.from({ length: 67 }, (_, i) => i + 14);
const ITEM_H = 56;

function AgeScrollPicker({ value, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const idx = AGES.indexOf(parseInt(value) || 30);
    ref.current.scrollTop = (idx < 0 ? AGES.indexOf(30) : idx) * ITEM_H;
  }, []);

  const onScroll = () => {
    if (!ref.current) return;
    clearTimeout(ref.current._t);
    ref.current._t = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, AGES.length - 1));
      ref.current.scrollTop = clamped * ITEM_H;
      onChange(String(AGES[clamped]));
    }, 80);
  };

  const selected = parseInt(value);
  return (
    <div className="relative h-[168px] overflow-hidden rounded-2xl bg-bg-card border-2 border-white/20">
      <div className="absolute inset-x-0 top-[56px] h-14 bg-accent-green/15 border-y border-accent-green/40 pointer-events-none z-10" />
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
      >
        <div style={{ height: ITEM_H }} />
        {AGES.map(age => (
          <div
            key={age}
            style={{ scrollSnapAlign: 'center', height: ITEM_H }}
            className={`flex items-center justify-center text-2xl font-bold transition-colors ${selected === age ? 'text-accent-green font-extrabold' : 'text-card-ink font-semibold'}`}
          >
            {age}세
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

function StepContent({ stepKey, form, update, isReferral, totalQuestions }) {
  switch (stepKey) {
    case 'intro':
      return <IntroStep isReferral={isReferral} totalQuestions={totalQuestions} />;
    case 'name':
      return <TextStep label="이름" placeholder="홍길동" value={form.name} onChange={v => update('name', v)} autoComplete="name" autoFocus />;
    case 'referrer':
      return (
        <TextStep
          label="추천인 이름"
          placeholder="당신을 초대해 준 멤버 이름"
          value={form.referrerName}
          onChange={v => update('referrerName', v)}
          hint="추천을 통한 사전신청 필수 항목이야. 정식 모집보다 먼저 지원할 수 있어."
          autoComplete="off"
          autoFocus
        />
      );
    case 'age':
      return (
        <div className="flex-1 flex flex-col justify-center">
          <label className="block text-text-primary text-2xl font-black font-kr mb-6">나이 (만나이)</label>
          <AgeScrollPicker value={form.age || '30'} onChange={v => update('age', v)} />
        </div>
      );
    case 'gender': {
      const genderOptions = [
        { value: 'M', label: '남성' },
        { value: 'F', label: '여성' },
      ];
      return (
        <div className="flex-1 flex flex-col justify-center">
          <label className="block text-text-primary text-2xl font-black font-kr mb-2">성별</label>
          <div className="flex gap-3 mt-4">
            {genderOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('gender', opt.value)}
                className={`flex-1 py-5 rounded-2xl text-lg font-extrabold border-2 transition-all ${
                  form.gender === opt.value
                    ? 'bg-accent-green text-bg-primary border-accent-green'
                    : 'bg-bg-card text-card-ink border-white/20 hover:border-accent-green/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case 'phone':
      return <PhoneStep form={form} update={update} />;
    case 'job':
      return <TextStep label="하는 일" placeholder="예: 스타트업 마케터, 대학생, 프리랜서" value={form.job} onChange={v => update('job', v)} autoComplete="organization-title" autoFocus />;
    case 'region':
      return <TextStep label="거주 지역" placeholder="예: 서울 마포구 / 경기 분당 / 부산 해운대" value={form.region} onChange={v => update('region', v)} autoComplete="address-level1" autoFocus />;
    case 'runningExp':
      return (
        <RadioStep
          label="러닝 경력은 어느 정도야?"
          options={runningExpOptions}
          value={form.runningExp}
          onChange={v => update('runningExp', v)}
        />
      );
    case 'motivation':
      return (
        <div className="flex-1 flex flex-col justify-center">
          <label className="block text-text-primary text-2xl font-black font-kr mb-3">왜 이번 챌린지에 지원해?</label>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            내가 왜 꼭 이 챌린지에 참여해야 하는지 알려줘. 이유가 분명하고 열정 있는 사람들과만 함께할거야. <span className="text-accent-orange font-bold">성의 없는 지원서는 선발되지 않을 수 있어.</span>
          </p>
          <div className="bg-bg-card rounded-2xl p-4 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)] border-l-4 border-accent-green">
            <p className="text-card-ink-faint text-[11px] font-extrabold tracking-widest mb-3">✍️ 이렇게 쓰면 좋아</p>
            <p className="text-card-ink-muted text-[13px] leading-relaxed mb-3">"올해 인생 최대 몸무게를 찍고 나서, 집에 있던 러닝화 신고 무작정 뛰어봤어요. 첫날은 숨이 턱까지 차서 왜 시작했나 싶었는데, 딱 한 번만 더가 두 번, 세 번이 되더니 어느새 러닝이 좋아졌어요. 근데 사는 데가 외져서 늘 혼자라 한계가 오더라고요. 이번엔 팀이랑 같이 끝까지 가보고 싶어 지원해요. 우선 10K를 완주하고, 거기서 멈추지 않고 계속 달리는 사람이 되는 게 목표예요."</p>
            <p className="text-card-ink-muted text-[13px] leading-relaxed">"작년엔 퇴근하고 매일 한강을 뛰면서 몸도 마음도 건강했어요. 그런데 올해는 바쁘다는 핑계로 러닝화만 모셔두고 있네요. 그때의 저로 돌아가고 싶어 지원합니다. 혼자선 또 흐지부지될 것 같아서 팀이랑 서로 끌어주며 제대로 해보고 싶어요. 이번에 다시 페이스를 찾아서, 올해 안에 하프 마라톤에 도전하는 걸 목표로 잡았어요. 8월엔 발리에 가는데 거기서도 꼭 뛰어보고 싶고요!"</p>
          </div>
          <textarea
            value={form.motivation}
            onChange={e => update('motivation', e.target.value)}
            placeholder="여기에 너의 진짜 이유를 솔직하게 써줘."
            autoFocus
            rows={6}
            className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-3 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors resize-none"
          />
          <p className={`text-xs mt-2 text-right font-semibold ${form.motivation.trim().length >= 30 ? 'text-accent-green' : 'text-text-muted'}`}>
            {form.motivation.length} / 최소 30자{form.motivation.trim().length >= 30 ? ' ✓' : ''}
          </p>
        </div>
      );
    case 'goals':
      return (
        <GoalsStep
          goals={form.goals || []}
          goalsOther={form.goalsOther || ''}
          onToggle={(v) => {
            const cur = form.goals || [];
            if (cur.includes(v)) {
              update('goals', cur.filter(g => g !== v));
            } else if (cur.length < MAX_GOALS) {
              update('goals', [...cur, v]);
            }
          }}
          onOtherChange={(v) => update('goalsOther', v)}
        />
      );
    case 'instagram':
      return (
        <ContactStep
          instagram={form.instagram}
          kakaoId={form.kakaoId}
          onInstagram={v => update('instagram', v)}
          onKakao={v => update('kakaoId', v)}
        />
      );
    case 'friend':
      return (
        <TextStep
          label={isReferral ? '같이 지원할 친구 (선택)' : '추천인 (선택)'}
          placeholder="친구 이름 또는 @인스타 아이디"
          value={form.friend}
          onChange={v => update('friend', v)}
          hint="둘 다 폼을 작성하면 같은 팀으로 배정돼. 최대 2명까지 같은 팀 배정 가능. 없으면 비워두고 다음으로."
          autoComplete="off"
          autoFocus
        />
      );
    case 'deposit':
      return (
        <DepositConsentStep
          checked={form.agreeDeposit}
          onChange={v => update('agreeDeposit', v)}
        />
      );
    case 'schedule':
      return (
        <ScheduleConsentStep
          checked={form.agreeSchedule}
          onChange={v => update('agreeSchedule', v)}
          isReferral={isReferral}
        />
      );
    default:
      return null;
  }
}

function IntroStep({ isReferral, totalQuestions }) {
  if (isReferral) {
    return (
      <div className="flex-1 flex flex-col justify-center text-center">
        <span className="pill text-accent-orange block w-fit mx-auto mb-4">FREE · 친구랑 같이</span>
        <h1 className="font-kr text-4xl font-black text-text-primary mb-4 leading-tight">
          친구랑 같이<br />무료 신청
        </h1>
        <p className="text-text-secondary leading-relaxed">
          둘 다 신청하면 <span className="text-text-primary font-bold">같은 팀</span> 으로 묶여.<br />
          작심삼일, 같이 뿌시자.
        </p>
        <ul className="mt-8 text-left space-y-3 text-sm bg-bg-card rounded-3xl p-6 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
          <li>⚡ <span className="text-card-ink font-bold">짧은 질문 {totalQuestions}개</span> (대부분 1줄)</li>
          <li>💸 <span className="text-card-ink font-bold">완전 무료</span> · 보증금·참가비 없음</li>
          <li>🤝 <span className="text-card-ink font-bold">친구랑 같은 팀</span> 배정</li>
          <li>📅 <span className="text-bg-primary font-bold">{PRESEASON.startLabel}</span> · 딱 3일</li>
        </ul>
        <Link to="/" className="mt-6 inline-block text-accent-green text-sm font-bold underline underline-offset-4 hover:brightness-110">
          📖 챌린지 설명 먼저 보기 →
        </Link>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <span className="pill text-accent-green block w-fit mx-auto mb-4">FREE PRE-SEASON · APPLY</span>
      <h1 className="font-kr text-4xl font-black text-text-primary mb-4 leading-tight">
        2분이면<br />신청 끝
      </h1>
      <p className="text-text-secondary leading-relaxed">
        무료 3일 뿌시기 챌린지.<br />
        모든 항목은 팀 매칭에 사용돼.
      </p>
      <ul className="mt-8 text-left space-y-3 text-sm bg-bg-card rounded-3xl p-6 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        <li>⚡ <span className="text-card-ink font-bold">짧은 질문 {totalQuestions}개</span> (대부분 1줄)</li>
        <li>💾 작성 중 <span className="text-card-ink font-bold">자동 저장</span> (새로고침 안전)</li>
        <li>☕ <span className="text-bg-primary font-bold">팀 전원 완주 시 전원 스타벅스</span></li>
        <li>📅 <span className="text-card-ink font-bold">{PRESEASON.startLabel}</span> · 딱 3일</li>
      </ul>
      <Link to="/" className="mt-6 inline-block text-accent-green text-sm font-bold underline underline-offset-4 hover:brightness-110">
        📖 챌린지 설명 먼저 보기 →
      </Link>
    </div>
  );
}

function TextStep({ label, placeholder, value, onChange, inputMode, autoComplete, autoFocus, suffix, hint }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">{label}</label>
      {hint && <p className="text-text-muted text-sm mb-4">{hint}</p>}
      <div className="relative mt-3">
        <input
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-card-ink-faint text-base pointer-events-none font-semibold">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// 인스타 ↔ 카톡 토글 입력. 합격 후 단톡방 초대를 어디로 받을지 한 곳만 받음.
function ContactStep({ instagram, kakaoId, onInstagram, onKakao }) {
  const [mode, setMode] = useState(() => (kakaoId && !instagram ? 'kakao' : 'instagram'));

  if (mode === 'kakao') {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <label className="block text-text-primary text-2xl font-black font-kr mb-2">카톡 ID</label>
        <p className="text-text-muted text-sm mb-4">합격하면 여기로 단톡방 초대를 보내.</p>
        <div className="relative mt-3">
          <input
            type="text"
            value={kakaoId}
            onChange={e => onKakao(e.target.value)}
            placeholder="kakao_id"
            autoFocus
            className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => { onKakao(''); setMode('instagram'); }}
          className="mt-4 text-text-muted text-xs underline self-start hover:text-text-primary"
        >
          ← 인스타 ID로 입력하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">인스타 아이디</label>
      <p className="text-text-muted text-sm mb-4">이 계정으로 합격 소식을 보낼거니 정확히 입력해줘.</p>
      <div className="relative mt-3">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-card-ink select-none pointer-events-none">@</span>
        <input
          type="text"
          autoComplete="username"
          value={instagram}
          onChange={e => onInstagram(e.target.value.replace(/^@+/, ''))}
          placeholder="your_handle"
          autoFocus
          className="w-full bg-bg-card border-2 border-white/20 rounded-2xl pl-8 pr-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
        />
      </div>
    </div>
  );
}

function TextareaStep({ label, placeholder, value, onChange, minLength, autoFocus }) {
  const reached = value.trim().length >= (minLength || 0);
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-4">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={6}
        className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-3 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors resize-none"
      />
      <p className={`text-xs mt-2 text-right font-semibold ${reached ? 'text-accent-green' : 'text-text-muted'}`}>
        {value.length}{minLength ? ` / 최소 ${minLength}자` : ''}{reached ? ' ✓' : ''}
      </p>
    </div>
  );
}

function RadioStep({ label, options, value, onChange }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-6">{label}</label>
      <div className="space-y-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold transition-colors ${
              value === opt.value
                ? 'border-accent-green bg-accent-green text-bg-primary'
                : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhoneStep({ form, update }) {
  const isKR = form.phoneCountry === 'KR';
  const formatKR = (digits) => {
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };
  const displayValue = isKR ? formatKR(form.phone) : form.phone;
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">연락처</label>
      <p className="text-text-muted text-sm mb-4">합격 안내·입금 확인용이야.</p>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'KR', label: '🇰🇷 한국' },
          { value: 'INTL', label: '🌏 해외' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => update('phoneCountry', opt.value)}
            className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-colors ${
              form.phoneCountry === opt.value
                ? 'border-accent-green bg-accent-green text-bg-primary'
                : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        type="tel"
        inputMode={isKR ? 'numeric' : 'tel'}
        autoComplete="tel"
        value={displayValue}
        onChange={e => {
          const raw = e.target.value;
          const cleaned = isKR ? raw.replace(/\D/g, '').slice(0, 11) : raw.slice(0, 30);
          update('phone', cleaned);
        }}
        placeholder={isKR ? '010-1234-5678' : '+1 415 555 0123'}
        className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
      />
      <p className="text-text-muted text-xs mt-2 font-semibold">
        {isKR ? '010으로 시작하는 휴대폰. 자동 포맷돼.' : '국가번호 포함. 예: +1 415 555 0123'}
      </p>
    </div>
  );
}

function ConsentShell({ label, children, checked, onChange, checkboxLabel }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-4">{label}</label>
      <div className="bg-bg-card rounded-3xl p-6 text-card-ink leading-relaxed shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        {children}
      </div>
      <button
        data-consent-checkbox="true"
        onClick={() => onChange(!checked)}
        className={`mt-5 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left transition-colors ${
          checked
            ? 'border-accent-green bg-accent-green text-bg-primary'
            : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
        }`}
      >
        <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-sm font-extrabold shrink-0 ${
          checked ? 'border-bg-primary bg-bg-primary text-accent-green' : 'border-card-ink-faint text-transparent'
        }`}>
          ✓
        </span>
        <span className="font-bold text-sm">
          {checkboxLabel}
        </span>
      </button>
    </div>
  );
}

function DepositConsentStep({ checked, onChange }) {
  // 보증금 흐름 도식 — 입금 → 챌린지 → 환급. 완주 시나리오별 결과는 STEP 3에 통합.
  const steps = [
    { icon: '💳', step: 'STEP 1 · 시작 전', title: '보증금 20만원 입금', desc: '합격하면 챌린지 시작 전에 먼저' },
    { icon: '🏃', step: 'STEP 2 · 21일', title: '팀과 함께 끝까지', desc: '매일 러닝 인증하며 완주' },
    {
      icon: '💰', step: 'STEP 3 · 완주 후', title: '보증금 그대로 돌려받기',
      outcomes: [
        { mark: '✓', label: '21일 미션 90% 완수', amount: '전액 환급', tone: 'pos' },
        { mark: '🏆', label: '팀 1등', amount: '+ 러닝화', tone: 'pos' },
        { mark: '✕', label: '중도 포기', amount: '0원', tone: 'neg' },
      ],
    },
  ];

  return (
    <ConsentShell
      label="보증금 안내"
      checked={checked}
      onChange={onChange}
      checkboxLabel="20만원 보증금 시스템을 이해했어"
    >
      <p className="mb-3 text-card-ink text-[15px] leading-relaxed">
<span className="font-bold">네가 끝까지 완주할 수 있게</span> 도와줄 강제성을 만들려고 보증금 20만원을 받아. 돈이 걸려 있으면 쉽게 못 포기하거든. 그 강제성이 너를 <span className="font-extrabold text-bg-primary">완주까지, 러닝 습관까지</span> 끌고 가.
      </p>
      <p className="mb-5 text-card-ink-faint text-[13px] leading-relaxed">
        직전 시즌 30명 중 30명 전원 21일 완주 — 그게 증거야.
      </p>

      {/* 보증금 흐름 도식: 입금 → 챌린지 → 환급(시나리오별) */}
      <div>
        {steps.map((s, i, arr) => (
          <div key={i}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-bg-primary/10 flex items-center justify-center text-xl shrink-0">{s.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-bg-primary text-[10px] font-extrabold tracking-widest">{s.step}</p>
                <p className="text-card-ink font-bold text-[15px] leading-tight">{s.title}</p>
                {s.desc && <p className="text-card-ink-muted text-[12px] mt-0.5">{s.desc}</p>}
                {s.outcomes && (
                  <div className="mt-2.5 space-y-2">
                    {s.outcomes.map((o, j) => (
                      <div key={j} className="flex items-baseline gap-2">
                        <span className={`text-[13px] shrink-0 ${o.tone === 'neg' ? 'text-card-ink-faint' : 'text-card-ink'}`}>{o.mark} {o.label}</span>
                        <span className="flex-1 border-b border-dashed border-card-border/60 translate-y-[-3px]" />
                        <span className={`font-extrabold text-[13px] shrink-0 ${o.tone === 'neg' ? 'text-accent-orange' : 'text-bg-primary'}`}>{o.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div className="ml-[21px] my-1 h-4 border-l-2 border-dashed border-card-border" />
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-card-ink-faint text-xs whitespace-nowrap">🛡️ 합격 후 OT(6/28) 전까지 마음 바뀌면 전액 환불</p>
    </ConsentShell>
  );
}

function ScheduleConsentStep({ checked, onChange }) {
  const [d1, d2, d3] = PRESEASON.missions;
  return (
    <ConsentShell
      label="3일 일정"
      checked={checked}
      onChange={onChange}
      checkboxLabel="3일 일정을 확인했어"
    >
      <p className="mb-4 text-card-ink text-[15px] leading-relaxed">
        <span className="font-bold">무료</span> 3일 챌린지야. 보증금도, 참가비도 없어.
        시간만 채우면 성공(페이스·거리 자유).
      </p>
      <ul className="space-y-3 text-sm">
        <li>🏃 <span className="font-semibold">Day 1</span> · {d1.date}({d1.weekday}) — <span className="text-card-ink font-bold">{d1.minutes}분 러닝</span></li>
        <li>🏃 <span className="font-semibold">Day 2</span> · {d2.date}({d2.weekday}) — <span className="text-card-ink font-bold">{d2.minutes}분 러닝</span></li>
        <li>🏃 <span className="font-semibold">Day 3</span> · {d3.date}({d3.weekday}) — <span className="text-card-ink font-bold">{d3.minutes}분 러닝</span></li>
        <li>🎉 <span className="font-semibold">{PRESEASON.finale.label}:</span> <span className="text-accent-orange font-bold">{PRESEASON.finale.date}({PRESEASON.finale.weekday}) {PRESEASON.finale.time}</span></li>
        <li>☕ <span className="font-semibold">보상:</span> <span className="text-bg-primary font-bold">팀 5명 전원 완주 시 전원 스타벅스</span></li>
      </ul>
    </ConsentShell>
  );
}

function GoalsStep({ goals, goalsOther, onToggle, onOtherChange }) {
  const isOtherSelected = goals.includes('other');
  const maxReached = goals.length >= MAX_GOALS;
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">진짜 이루고 싶은 목표</label>
      <p className="text-text-secondary text-sm leading-relaxed mb-1">
        3일은 시작일 뿐이야. 그 뒤에도 계속 달려서 진짜 이루고 싶은 목표를 골라줘. <span className="font-bold">(최대 2개)</span>
      </p>
      <p className="text-text-muted text-xs mb-5">
        선발할 때 팀 매칭이랑 코칭 방향 잡는 데 써.
      </p>
      <div className="space-y-2">
        {GOAL_OPTIONS.map(opt => {
          const selected = goals.includes(opt.value);
          const disabled = !selected && maxReached;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              disabled={disabled}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-[15px] transition-colors ${
                selected
                  ? 'border-accent-green bg-accent-green text-bg-primary'
                  : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-extrabold shrink-0 ${
                selected ? 'border-bg-primary bg-bg-primary text-accent-green' : 'border-card-ink-faint text-transparent'
              }`}>
                ✓
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {isOtherSelected && (
        <textarea
          value={goalsOther}
          onChange={e => onOtherChange(e.target.value)}
          placeholder="구체적인 목표를 적어줘"
          rows={3}
          autoFocus
          className="mt-4 w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-3 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors resize-none"
        />
      )}
      <p className={`text-xs mt-3 text-right font-semibold ${goals.length > 0 ? 'text-accent-green' : 'text-text-muted'}`}>
        {goals.length} / {MAX_GOALS} 선택
      </p>
    </div>
  );
}

function validateStep(stepKey, form) {
  switch (stepKey) {
    case 'intro':
      return null;
    case 'name':
      if (!form.name.trim()) return '이름을 입력해줘.';
      if (form.name.trim().length < 2) return '이름을 2자 이상 입력해줘.';
      return null;
    case 'referrer':
      if (!form.referrerName?.trim()) return '추천인 이름을 입력해줘.';
      if (form.referrerName.trim().length < 2) return '추천인 이름을 2자 이상 입력해줘.';
      return null;
    case 'age': {
      const n = parseInt(form.age, 10);
      if (!form.age || isNaN(n)) return '나이를 입력해줘.';
      if (n < 14 || n > 80) return '14~80세 사이로 입력해줘.';
      return null;
    }
    case 'gender':
      if (!form.gender) return '성별을 선택해줘.';
      return null;
    case 'phone':
      if (!form.phone.trim()) return '연락처를 입력해줘.';
      if (form.phoneCountry === 'KR') {
        const digits = form.phone.replace(/\D/g, '');
        if (!/^01[016789]\d{7,8}$/.test(digits)) return '한국 휴대폰 번호 형식이 맞지 않아. (010으로 시작 11자리)';
      } else {
        if (form.phone.replace(/\D/g, '').length < 7) return '국가번호 포함 7자 이상의 숫자를 입력해줘.';
      }
      return null;
    case 'job':
      if (!form.job.trim()) return '하는 일을 입력해줘.';
      return null;
    case 'region':
      if (!form.region.trim()) return '거주 지역을 입력해줘.';
      return null;
    case 'runningExp':
      if (!form.runningExp) return '러닝 경력을 선택해줘.';
      return null;
    case 'motivation':
      if (!form.motivation.trim()) return '지원 동기를 입력해줘.';
      if (form.motivation.trim().length < 30) return '최소 30자 이상, 진짜 이유를 써줘.';
      return null;
    case 'goals': {
      const goals = form.goals || [];
      if (goals.length === 0) return '목표를 1개 이상 선택해줘.';
      if (goals.includes('other') && !(form.goalsOther || '').trim()) return '"기타" 선택 시 구체적인 목표를 적어줘.';
      return null;
    }
    case 'instagram':
      if (!form.instagram.trim() && !form.kakaoId.trim()) {
        return '연락받을 인스타 또는 카톡 ID를 입력해줘.';
      }
      return null;
    case 'friend':
      return null;
    case 'deposit':
      if (!form.agreeDeposit) return '보증금 안내에 동의해줘.';
      return null;
    case 'schedule':
      if (!form.agreeSchedule) return '합격·입금 일정에 동의해줘.';
      return null;
    default:
      return null;
  }
}
