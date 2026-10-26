import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { submitApplication, countApplicantsPublic, fetchPayStatus, findPaidByPhone } from '../lib/applyApi';
import { ACTIVE } from '../data/activeCohort';
import { PROOF } from '../data/season5v2';
import { previewCount } from '../lib/spots';
import { logEvent, once } from '../lib/eventLog';
import { metaTrack, metaTrackApplication } from '../lib/metaPixel';
import { startPayment } from '../lib/payapp';
import { useCountdown } from '../hooks/useCountdown';
import { GOAL_OPTIONS, MAX_GOALS, SHORT_GOAL_OPTIONS, TARGET_DISTANCE_OPTIONS, TARGET_MILESTONES, PACE_GOAL_VALUE, partsToSec, secToParts, paceLabel } from '../data/applicationGoals';

const STORAGE_KEY_MAIN = 'samurai-season2-apply-v1';
const STORAGE_KEY_REFERRAL = 'samurai-season2-apply-referral-v1';
// 제출은 됐는데 결제를 안 마친 지원서 id — 결제창에서 뒤로 와서 다시 누르면 지원서를 또 만들지 않고 결제만 다시 연다.
const PENDING_PAY_KEY = `ttr_pending_pay_${ACTIVE.cohortCode}`;

function loadPendingPay() {
  try { return localStorage.getItem(PENDING_PAY_KEY) || null; } catch { return null; }
}
function savePendingPay(id) {
  try { localStorage.setItem(PENDING_PAY_KEY, id); } catch { /* ignore */ }
}
// 결제 완료가 확인된 지원서 id — 완료 화면(ApplyPaidPage)이 남긴다. 기수 코드가 키에 들어 있어 다음 기수엔 자동으로 무시된다.
const PAID_KEY = `ttr_paid_${ACTIVE.cohortCode}`;
function loadPaid() {
  try { return localStorage.getItem(PAID_KEY) || null; } catch { return null; }
}

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
  shortGoal: '',
  current5k: { h: '', m: '', s: '' },
  targetDistance: '',
  targetTime: { h: '', m: '', s: '' },
  targetTimeMode: 'preset', // 'preset' = 마일스톤 객관식 | 'custom' = 기타(휠로 직접)
  otAttend: '',
  failReason: '',
};

// 초보 → 상급 순. 지원자 대부분이 초심자라 위에서 바로 자기 자리를 찾게 한다.
const runningExpOptions = [
  { value: 'almost_none', label: '거의 안 뛰어봤다' },
  { value: 'run_1km', label: '1km 정도 뛸 수 있다' },
  { value: 'run_5km', label: '5km 뛸 수 있다' },
  { value: 'run_10km', label: '10km 뛸 수 있다' },
  { value: 'half_marathon', label: '하프(21km) 완주 경험' },
  { value: 'full_marathon', label: '풀마라톤(42km) 완주 경험' },
];

// friction 최소화 — 선발에 실제로 쓰는 것만 질문으로 남긴다.
// 뺀 것: 'job'(선발·팀배정에 안 씀), 'friend'(선택 항목 → instagram 화면 하단으로 합침), 'region'(100% 온라인이라 불필요).
const MAIN_STEPS = ['intro', 'name', 'age', 'gender', 'phone', 'runningExp', 'shortGoal', 'motivation', 'goals', 'instagram', 'deposit', 'ot'];
const REFERRAL_STEPS = ['intro', 'referrer', 'name', 'age', 'gender', 'phone', 'runningExp', 'shortGoal', 'motivation', 'goals', 'instagram', 'deposit', 'ot'];
// 참가비(보증금) 결제 기수 — 마찰 최소 + 프리프레이밍(가인 2026-10-22).
// 탭 질문 3개(타잔 맞춤 한마디가 붙음)를 먼저, 개인정보는 뒤에. 지원 동기·28일 목표·인스타·OT 확인은 뺐다(앱 온보딩·결제 완료 화면이 대신).
const FEE_STEPS = ['intro', 'runningExp', 'failReason', 'goal90', 'name', 'age', 'gender', 'phone'];
const FEE_REFERRAL_STEPS = ['intro', 'referrer', 'runningExp', 'failReason', 'goal90', 'name', 'age', 'gender', 'phone'];

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
  // 무료 기수거나 참가비(카드 결제) 기수면 보증금(deposit) step 제거. 보증금 기수면 살아난다.
  const baseSteps = isReferral ? REFERRAL_STEPS : MAIN_STEPS;
  const STEPS = ACTIVE.fee
    ? (isReferral ? FEE_REFERRAL_STEPS : FEE_STEPS)
    : (ACTIVE.isFree ? baseSteps.filter(s => s !== 'deposit') : baseSteps);
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
    document.title = `친구랑 같이 참가 · ${ACTIVE.durationDays}일 팀 러닝 챌린지`;
    return () => { document.title = prev; };
  }, [isReferral]);

  useEffect(() => {
    saveState(STORAGE_KEY, { step, form });
  }, [STORAGE_KEY, step, form]);

  // 결제창에서 뒤로가기로 돌아오면(bfcache) "결제창 여는 중" 상태가 그대로 남아 버튼이 잠긴다 → 풀어준다.
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) setSubmitting(false); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  // 이미 결제한 사람이 지원서로 다시 오면 완료 화면으로(2026-10-26 가인: 랜딩은 그대로 두고 지원서만).
  // 간편결제(카카오·네이버·토스)는 앱에서 돌아와도 결제창이 우리 화면으로 안 넘겨줘 하얀 화면에 멈춘다 → 다시 들어온 사람을 여기서 받는다.
  useEffect(() => {
    if (!ACTIVE.fee) return undefined;
    const paidId = loadPaid();
    if (paidId) { navigate(`/apply/paid?id=${paidId}`, { replace: true }); return undefined; }
    const pendingId = loadPendingPay();
    if (!pendingId) return undefined;
    let alive = true;
    fetchPayStatus(pendingId).then(row => {
      if (alive && row?.pay_state === 'paid') {
        track('apply_pay_already_paid', { isReferral, at: 'open' });
        navigate(`/apply/paid?id=${pendingId}`, { replace: true });
      }
    }).catch(() => { /* 조회 실패면 지원서 그대로 */ });
    return () => { alive = false; };
  }, [navigate, isReferral]);

  // 지원서 페이지 진입 — "CTA는 눌렀는데 폼까지 안 온" 이탈을 구분하려면 이 지점이 필요하다.
  // 새로고침·중간 복귀도 있으므로 세션당 1회만 찍는다.
  useEffect(() => {
    if (!once('apply_open')) return;
    track('apply_page_open', { isReferral, resumed: (persisted?.step ?? 0) > 0 });
    logEvent('apply_open', { is_referral: isReferral });
    metaTrack('InitiateCheckout', { content_name: isReferral ? 'apply_referral' : 'apply' });
  }, [isReferral, persisted]);

  useEffect(() => {
    track('apply_step_view', { step, stepKey, isReferral });
    // 단계별 도달 — 어디서 이탈했는지는 "도달한 마지막 단계"로 읽는다.
    logEvent('apply_step', { step_key: stepKey, step_index: step, is_referral: isReferral });
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

  // 마감(ACTIVE.deadline 또는 정원 30명) 후 = 대기명단 접수 모드.
  const { isExpired: deadlinePassed } = useCountdown(ACTIVE.deadline);
  const [applicantCount, setApplicantCount] = useState(null);
  useEffect(() => {
    countApplicantsPublic(ACTIVE.cohortCode).then(setApplicantCount).catch(() => { /* row 없음 등 무시 */ });
  }, []);
  const previewedCount = previewCount(applicantCount); // URL ?spots=N 프리뷰 지원(마감 화면 확인용)
  // 결원 충원 백도어 — /apply?pass=<키> 로 들어오면 마감·정원과 무관하게 정상 접수한다.
  // 링크를 받은 사람만 쓰고, 들어온 지원서는 코치 목록에서 [결원 충원] 으로 구분된다.
  const isBackdoor = !!ACTIVE.backdoorKey && searchParams.get('pass') === ACTIVE.backdoorKey;
  const isClosed = !isBackdoor
    && (deadlinePassed || (previewedCount != null && previewedCount >= (ACTIVE.totalSpots || 30)));
  // 마감 뒤엔 지원서 대신 다음 기수 오픈 알림(/notify)으로 — 결원 대기는 없앴다(2026-09-19).
  // 광고·예전 링크로 /apply 에 바로 들어온 사람도 여기서 넘긴다.
  useEffect(() => {
    if (isClosed) navigate('/notify', { replace: true });
  }, [isClosed, navigate]);

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

  // 결제창 열기. ?payflow=back(폰 실기기 테스트 중, 2026-10-26)이면 먼저 우리 "결제 확인 중" 화면을 깔고 그 위에서 결제창을 연다
  // → 간편결제 뒤 하얀 화면에서 뒤로 가기만 하면 확인 화면이 나와 결제 완료를 자동으로 잡는다.
  const openPayment = (applicationId) => {
    const pay = () => startPayment({ applicationId, phone: form.phone.trim(), name: form.name.trim() });
    if (searchParams.get('payflow') !== 'back') { pay(); return; }
    navigate(`/apply/paid?id=${applicationId}`);
    setTimeout(pay, 80);
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
    // 참가비 기수: 이미 제출한 지원서가 결제 전이면 지원서는 건너뛰고 결제창만 다시 연다.
    const payFlow = !!ACTIVE.fee && !isClosed;
    // 다른 브라우저·경로로 다시 온 결제자는 브라우저 메모가 없다 → 번호로 확인. 조회 실패 시엔 그냥 진행.
    if (payFlow) {
      const paidId = await findPaidByPhone(ACTIVE.cohortCode, form.phone.trim()).catch(() => null);
      if (paidId) {
        track('apply_pay_already_paid', { isReferral, at: 'phone' });
        navigate(`/apply/paid?id=${paidId}`, { replace: true });
        return;
      }
    }
    const pendingId = payFlow ? loadPendingPay() : null;
    if (pendingId) {
      // 결제는 끝났는데 완료 화면까지 못 온 경우(카카오페이 등) 결제창을 또 열면 이중 결제가 된다(10/23 2건).
      // 결제 상태를 먼저 보고, 이미 결제됐으면 완료 화면으로 보낸다. 조회 실패 시엔 기존대로 결제창.
      const paid = await fetchPayStatus(pendingId).then(s => s?.pay_state === 'paid').catch(() => false);
      if (paid) {
        track('apply_pay_already_paid', { isReferral });
        navigate(`/apply/paid?id=${pendingId}`, { replace: true });
        return;
      }
      track('apply_pay_retry', { isReferral });
      openPayment(pendingId);
      return;
    }
    let attempt = 0;
    while (attempt < 2) {
      try {
        const { id } = await submitApplication(form, { waitlist: isClosed, backdoor: isBackdoor });
        track('apply_submit_success', { isReferral });
        logEvent('apply_submit', { is_referral: isReferral });
        metaTrackApplication({ phone: form.phone.trim(), phoneCountry: form.phoneCountry, waitlist: isClosed, isReferral });
        const friendAttached = !!(form.friend || '').trim();
        if (friendAttached) track('apply_submit_friend_attached');
        if (payFlow) {
          // 폼 내용은 결제 끝날 때까지 남겨 둔다(결제창에서 뒤로 오면 그대로 이어서).
          savePendingPay(id);
          metaTrack('AddPaymentInfo', { content_name: 'apply_fee', currency: 'KRW', value: ACTIVE.fee });
          openPayment(id);
          return;
        }
        clearState(STORAGE_KEY);
        navigate('/apply/done', { state: { id, phone: form.phone.trim(), friendAttached, isReferral, waitlist: isClosed } });
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
        {/* 퍼널: 마지막 화면 11명 → 제출 5명. 다 온 사람이 "제출하면 뭐가 되지?"에서 멈춘다.
            제출 버튼 바로 위에서 불안을 지운다 — 돈 안 나감 · 발표 시각 · 연락 경로. */}
        {step === TOTAL_QUESTIONS && !isClosed && (
          <div className="max-w-md mx-auto mb-3 text-center">
            {ACTIVE.fee ? (
              <>
                <p className="text-text-primary text-sm font-extrabold">🎉 보증금만 내면 {ACTIVE.durationDays}일 무료 체험 시작</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed break-keep">
                  참가비 무료 · 보증금 {ACTIVE.depositLabel}은 해내면 전액 환급 · {ACTIVE.otLabel} 전까지 취소하면 전액 환불
                </p>
                {/* 간편결제는 앱에서 돌아와도 화면이 하얗게 멈출 수 있다 — 결제는 된 거라고 미리 안심시킨다(2026-10-26) */}
                <p className="text-text-secondary text-xs mt-1 leading-relaxed break-keep">
                  간편결제 뒤 화면이 하얗게 멈춰도 결제는 된 거야 · 1분 안에 확인 문자 보내줄게
                </p>
                {/* 보증금 동의 step 을 뺐으니 결제 전 약관·환불정책 고지는 여기서 */}
                <p className="text-text-muted text-[11px] mt-1.5">
                  결제하면 <Link to="/terms" className="underline">이용약관</Link>·<Link to="/refund" className="underline">환불정책</Link>에 동의하는 거야
                </p>
              </>
            ) : (
              <>
                <p className="text-text-primary text-sm font-extrabold">🎉 여기까지 왔으면 제출만 누르면 끝</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed break-keep">
                  지원은 0원이야 · 합격 여부를 연락해줄게
                </p>
              </>
            )}
          </div>
        )}
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
                {submitting
                  ? (ACTIVE.fee ? '결제창 여는 중...' : '제출 중...')
                  : (isClosed ? '대기 명단 신청하기 →' : (ACTIVE.fee ? `보증금 ${ACTIVE.depositLabel} 내고 무료로 시작하기 →` : '지원서 제출하기 →'))}
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

// 공용 휠 픽커 — 나이·목표 기록(시/분/초)이 같이 쓴다.
// 터치/휠은 브라우저 기본 스크롤로 되고, PC 마우스 드래그는 pointer 이벤트로 직접 처리한다.
//   tone 'page' : 파란 페이지 위에 흰 카드로 올라감 (나이)
//   tone 'card' : 이미 흰 카드 안에 들어감 (목표 기록)
function WheelPicker({ values, value, onChange, itemH = ITEM_H, render, tone = 'page' }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);

  const idxOf = (v) => {
    const i = values.indexOf(v);
    return i < 0 ? 0 : i;
  };

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = idxOf(value) * itemH;
    // 최초 1회만 위치 잡는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 바깥에서 값이 리셋되면(거리 변경 등) 휠 위치도 따라간다. 드래그 중엔 건드리지 않는다.
  useEffect(() => {
    const el = ref.current;
    if (!el || drag.current) return;
    const want = idxOf(value) * itemH;
    if (Math.abs(el.scrollTop - want) > 1) el.scrollTop = want;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const settle = () => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / itemH);
    const clamped = Math.max(0, Math.min(idx, values.length - 1));
    el.scrollTop = clamped * itemH;
    onChange(values[clamped]);
  };

  const onScroll = () => {
    if (!ref.current || drag.current) return;
    clearTimeout(ref.current._t);
    ref.current._t = setTimeout(settle, 80);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    drag.current = { y: e.clientY, top: el.scrollTop };
    setDragging(true);
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el || !drag.current) return;
    e.preventDefault();
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };

  const endDrag = (e) => {
    const el = ref.current;
    if (!el || !drag.current) return;
    drag.current = null;
    setDragging(false);
    el.releasePointerCapture?.(e.pointerId);
    settle();
  };

  const shell = tone === 'card'
    ? 'bg-bg-primary/5 border-2 border-card-border'
    : 'bg-bg-card border-2 border-white/20';

  return (
    <div className={`relative overflow-hidden rounded-2xl ${shell}`} style={{ height: itemH * 3 }}>
      {/* 선택 밴드. 흰 배경이라 연두 글자는 안 보인다 → 밴드를 진하게 깔고 글자는 진한 남색으로. */}
      <div
        className="absolute inset-x-0 bg-accent-green/45 border-y-2 border-accent-green pointer-events-none z-10"
        style={{ top: itemH, height: itemH }}
      />
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`h-full overflow-y-scroll select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        // 드래그 중엔 스냅을 끈다 — 켜둔 채 scrollTop을 직접 만지면 스냅이 되받아쳐 끊긴다.
        style={{ scrollSnapType: dragging ? 'none' : 'y mandatory', scrollbarWidth: 'none' }}
      >
        <div style={{ height: itemH }} />
        {values.map((v) => (
          <div
            key={v}
            style={{ scrollSnapAlign: 'center', height: itemH }}
            className={`relative z-20 flex items-center justify-center tabular-nums transition-colors ${
              v === value ? 'text-bg-primary font-black' : 'text-card-ink/45 font-semibold'
            }`}
          >
            {render ? render(v) : v}
          </div>
        ))}
        <div style={{ height: itemH }} />
      </div>
    </div>
  );
}

function AgeScrollPicker({ value, onChange }) {
  const selected = parseInt(value, 10);
  return (
    <WheelPicker
      values={AGES}
      value={AGES.includes(selected) ? selected : 30}
      onChange={(v) => onChange(String(v))}
      render={(v) => <span className="text-2xl">{v}세</span>}
    />
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
        <ReactionStep
          label={<>러닝은<br />어느 정도 해봤어?</>}
          options={runningExpOptions}
          reactions={RUN_EXP_REACTIONS}
          value={form.runningExp}
          onChange={v => update('runningExp', v)}
        />
      );
    case 'failReason':
      return (
        <ReactionStep
          label={<>여태까지 왜 원하는 몸을<br />못 만들었다고 생각해?</>}
          options={FAIL_REASON_OPTIONS}
          reactions={FAIL_REASON_REACTIONS}
          value={form.failReason}
          onChange={v => update('failReason', v)}
        />
      );
    case 'goal90':
      return (
        <ReactionStep
          label={<>90일 뒤<br />어떤 모습이고 싶어?</>}
          options={GOAL90_OPTIONS}
          reactions={GOAL90_REACTIONS}
          value={form.goals?.[0] || ''}
          onChange={v => update('goals', [v])}
          extra={form.goals?.[0] === 'other' ? (
            <input
              type="text"
              value={form.goalsOther || ''}
              onChange={e => update('goalsOther', e.target.value)}
              placeholder="90일 뒤 이루고 싶은 것 (선택)"
              maxLength={100}
              className="mt-3 w-full px-4 py-3 rounded-2xl bg-bg-card text-card-ink font-semibold placeholder:text-card-ink-faint outline-none border-2 border-transparent focus:border-accent-green"
            />
          ) : null}
        />
      );
    case 'motivation':
      return (
        <div className="flex-1 flex flex-col justify-center">
          <label className="block text-text-primary text-2xl font-black font-kr mb-3">왜 이번 챌린지에 지원해?</label>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            내가 왜 꼭 이 챌린지에 참여해야 하는지 알려줘. 코칭이랑 팀 매칭에 그대로 쓸 거야. <span className="text-accent-orange font-bold">솔직하게 써줄수록 너한테 맞게 짜줄 수 있어.</span>
          </p>
          <textarea
            value={form.motivation}
            onChange={e => update('motivation', e.target.value)}
            placeholder="여기에 너의 진짜 이유를 솔직하게 써줘."
            autoFocus
            rows={6}
            className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-3 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors resize-none"
          />
          <p className="text-xs mt-2 text-right font-semibold text-text-muted">
            {form.motivation.length}자
          </p>
        </div>
      );
    case 'shortGoal':
      return (
        <ShortGoalStep
          shortGoal={form.shortGoal || ''}
          current5k={form.current5k || { h: '', m: '', s: '' }}
          onGoal={(v) => {
            update('shortGoal', v);
            // 첫 5K 완주로 바꾸면 기록 입력값은 버린다.
            if (v !== 'pr_5k') update('current5k', { h: '', m: '', s: '' });
          }}
          onRecord={(v) => update('current5k', v)}
        />
      );
    case 'goals':
      return (
        <GoalsStep
          goals={form.goals || []}
          goalsOther={form.goalsOther || ''}
          targetDistance={form.targetDistance || ''}
          targetTime={form.targetTime || { h: '', m: '', s: '' }}
          targetTimeMode={form.targetTimeMode || 'preset'}
          onMilestone={(sec) => {
            update('targetTimeMode', 'preset');
            update('targetTime', secToParts(sec));
          }}
          onCustom={() => {
            update('targetTimeMode', 'custom');
            update('targetTime', { h: '', m: '', s: '' });
          }}
          onDistance={(v) => {
            update('targetDistance', v);
            // 거리를 바꾸면 안 보이는 칸(시간/초)의 잔값을 비운다 — 안 그러면 합계에 몰래 섞인다.
            const opt = TARGET_DISTANCE_OPTIONS.find(d => d.value === v);
            const cur = form.targetTime || { h: '', m: '', s: '' };
            // 거리가 바뀌면 마일스톤 목록 자체가 달라지므로 목표 기록은 처음부터 다시 고른다.
            update('targetTimeMode', 'preset');
            update('targetTime', { h: '', m: '', s: '' });
            void opt; void cur;
          }}
          onTime={(v) => update('targetTime', v)}
          onToggle={(v) => {
            const cur = form.goals || [];
            if (cur.includes(v)) {
              update('goals', cur.filter(g => g !== v));
              // 기록 단축을 빼면 딸려 있던 거리·목표시간도 같이 비운다.
              if (v === PACE_GOAL_VALUE) {
                update('targetDistance', '');
                update('targetTime', { h: '', m: '', s: '' });
                update('targetTimeMode', 'preset');
              }
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
          friend={form.friend}
          onFriend={v => update('friend', v)}
          friendLabel={isReferral ? '같이 지원할 친구 (선택)' : '추천인 (선택)'}
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
    case 'ot':
      return (
        <OtStep
          value={form.otAttend || ''}
          onChange={(v) => {
            update('otAttend', v);
            // OT 안내를 읽고 고른 시점 = 일정 확인 완료.
            update('agreeSchedule', true);
          }}
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
        <span className="pill text-accent-orange block w-fit mx-auto mb-4">친구랑 같이 지원</span>
        <h1 className="font-kr text-4xl font-black text-text-primary mb-4 leading-tight">
          친구랑 같이<br />지원하기
        </h1>
        <p className="text-text-secondary leading-relaxed">
          둘 다 지원하면 <span className="text-text-primary font-bold">같은 팀</span> 으로 묶여.<br />
          {ACTIVE.durationDays}일, 같이 뿌시자.
        </p>
        <ul className="mt-8 text-left space-y-3 text-sm bg-bg-card rounded-3xl p-6 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
          <li>⚡ <span className="text-card-ink font-bold">짧은 질문 {totalQuestions}개</span> (대부분 1줄)</li>
          <li>💸 <span className="text-card-ink font-bold">{ACTIVE.durationDays}일 무료 체험</span> · 보증금 {ACTIVE.depositLabel}은 해내면 전액 환급</li>
          <li>🤝 <span className="text-card-ink font-bold">친구랑 같은 팀</span> 배정</li>
          <li>📅 <span className="text-bg-primary font-bold">{ACTIVE.startLabel}</span> · {ACTIVE.durationDays}일</li>
        </ul>
        <Link to="/" className="mt-6 inline-block text-accent-green text-sm font-bold underline underline-offset-4 hover:brightness-110">
          📖 챌린지 설명 먼저 보기 →
        </Link>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <span className="pill text-accent-green block w-fit mx-auto mb-4">{ACTIVE.durationDays}DAY RUN · APPLY</span>
      <h1 className="font-kr text-4xl font-black text-text-primary mb-4 leading-tight">
        2분이면<br />무료 체험 시작
      </h1>
      <p className="text-text-secondary leading-relaxed">
        90일 하프마라톤 프로그램 · 첫 {ACTIVE.durationDays}일 무료 체험.<br />
        모든 항목은 팀 매칭이랑 코칭에 쓰여.
      </p>
      {/* 퍼널: 시작 화면 42명 → 이름 29명(-31%). 원인 추정 2가지를 막는다.
          ① 보증금이 여기서 처음 눈에 띄는데 "지금 내는 돈"으로 오해 → 지원은 0원임을 먼저 말한다.
          ② "챌린지 설명 먼저 보기" 링크가 지원서 밖으로 내보냈다 → 제거. 뒤로가기는 상단 "메인"으로 충분. */}
      <ul className="mt-8 text-left space-y-3 text-sm bg-bg-card rounded-3xl p-6 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        <li>⚡ <span className="text-card-ink font-bold">짧은 질문 {totalQuestions}개</span> (대부분 탭 한 번)</li>
        <li>🆓 <span className="text-bg-primary font-bold">{ACTIVE.durationDays}일 무료 체험</span> · 보증금 {ACTIVE.depositLabel}은 해내면 전액 환급</li>
        <li>💾 작성 중 <span className="text-card-ink font-bold">자동 저장</span> (나갔다 와도 이어서)</li>
        <li>📅 <span className="text-card-ink font-bold">{ACTIVE.startLabel}</span> · {ACTIVE.durationDays}일</li>
        {ACTIVE.fee && <li>🇰🇷 <span className="text-card-ink font-bold">국내 거주자만</span> 참가 가능</li>}
      </ul>
      <p className="mt-5 text-accent-green text-sm font-extrabold">
        🎁 지금 참가하면 선착순 보너스까지
      </p>
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
function ContactStep({ instagram, kakaoId, onInstagram, onKakao, friend, onFriend, friendLabel }) {
  const [mode, setMode] = useState(() => (kakaoId && !instagram ? 'kakao' : 'instagram'));

  // 추천인은 화면 하나를 통째로 먹을 만큼 중요하지 않다 → 연락처 화면 아래에 붙인다.
  const friendField = onFriend ? (
    <div className="mt-8 pt-6 border-t border-white/15">
      <label className="block text-text-primary text-base font-black font-kr mb-1">{friendLabel}</label>
      <p className="text-text-muted text-xs mb-3 leading-relaxed">둘 다 지원하면 같은 팀으로 배정돼. 없으면 비워두고 넘어가.</p>
      <input
        type="text"
        value={friend || ''}
        onChange={e => onFriend(e.target.value)}
        placeholder="친구 이름 또는 @인스타 아이디"
        autoComplete="off"
        className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-3 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
      />
    </div>
  ) : null;

  if (mode === 'kakao') {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <label className="block text-text-primary text-2xl font-black font-kr mb-2">카톡 ID</label>
        <p className="text-text-muted text-sm mb-4">참가 확정되면 여기로 단톡방 초대를 보내.</p>
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
        {friendField}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">인스타 아이디</label>
      <p className="text-text-muted text-sm mb-4">이 계정으로 시작 안내를 보낼 거니까 정확히 입력해줘.</p>
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
      {friendField}
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

// 러닝 경험 + 타잔 맞춤 한마디 — 시안 SOT: design-references/s6-apply-runexp-reaction.html A (가인 2026-10-22).
// 목적은 결제 직전에 "나 같은 사람도 되는구나"를 확인시키는 것(프리프레이밍).
// 문구는 13주 플랜 사실과 실측 완주율만. "2주차부터 시작" 같은 선택지는 없다 — 그건 일요일 뒤 추가 모집으로
// 들어온 사람이 그 시점부터 이어서 하는 것일 뿐(가인).
const RUN_EXP_REACTIONS = {
  almost_none: <>딱 좋아. <b>첫날은 하루 8분</b>이야. 걷다 뛰다 해도 돼.<br />처음 참가한 사람 <b>{PROOF.newTotal}명 중 {PROOF.finished}명</b>이 끝까지 갔어.</>,
  run_1km: <>충분해. <b>하루 8분</b>부터 하루 1분씩 늘리면<br />11/15엔 <b>25분</b>, 마지막 날엔 <b>5km</b>를 뛰어.</>,
  run_5km: <>기초는 됐네. 첫 25일에는 <b>5km 스피드</b>를 올리는 데 집중해보자.<br />진짜 목표는 <b>90일 뒤 하프</b>야.</>,
  run_10km: <>체력은 있네. 첫 25일엔 <b>매일 뛰는 습관</b>을 단단하게 잡자.<br />그러면 <b>90일 뒤 하프</b>는 충분해.</>,
  half_marathon: <>하프 뛴 체력이면 충분해.<br />이제 이걸 기반으로 <b>인생 최고의 몸</b>을 만들어보자.</>,
  full_marathon: <>풀까지 뛴 체력이면 충분해.<br />이제 이걸 기반으로 <b>인생 최고의 몸</b>을 만들어보자.</>,
};

// 못 만든 이유 — 랜딩 훅("꾸준히 안 해서")을 본인이 고르게 하고, 보기마다 TARZAN이 그걸 어떻게 푸는지 답한다. 문구 = 가인 2026-10-22.
const FAIL_REASON_OPTIONS = [
  { value: 'consistency', label: '꾸준히 못해서' },
  { value: 'fun', label: '재미가 없어서' },
  { value: 'method', label: '방법을 몰라서' },
  { value: 'motivation', label: '동기가 부족해서' },
];
const FAIL_REASON_REACTIONS = {
  consistency: <>의지로 하는 게 아니라 <b>꾸준히 할 수밖에 없는 환경</b>에서<br />같이 해내자.</>,
  fun: <>혼자 하면 재미없어. 같은 목표를 향해 <b>으쌰으쌰하고 경쟁도 하면서</b><br />재밌게 하자.</>,
  method: <><b>정해진 프로그램대로 따라만 오면 돼.</b><br />몸 만드는 게 얼마나 쉬운지 알게 될 거야.</>,
  motivation: <>명확한 목표가 없어서 그래. <b>90일. 하프마라톤</b>이라는 목표를 향해 가면<br />동기는 저절로 생길 거야.</>,
};

// 90일 목표 — 랜딩 헤드라인("생애 첫 하프마라톤 완주하고 인생 최고의 몸")에 맞춘 보기(가인 2026-10-23).
// 하나만 고른다. 값은 applications.goals[0] (하프·몸·10K·기타는 기존 GOAL_LABEL 값 재사용, 연속 기록만 새 값 'streak90').
// 기타를 고르면 목표를 적는 칸(선택)이 뜬다 → goals_other.
// ⚠️ 반응 문구는 Claude 초안. 거리·일차는 13주 플랜 사실(5→10→14→21km · 9주차 롱런 10km = DAY 63).
const GOAL90_OPTIONS = [
  { value: 'half_marathon', label: '생애 첫 하프마라톤 완주' },
  { value: 'lean_body', label: '365일 유지되는 복근' },
  { value: '10K_complete', label: '일단 10km부터' },
  { value: 'streak90', label: '90일 연속 운동한 기록' },
  { value: 'other', label: '기타' },
];
const GOAL90_REACTIONS = {
  half_marathon: <>그게 이 90일의 결승선이야.<br />5km → 10km → 14km → <b>21km</b>, 한 계단씩 올라가.</>,
  lean_body: <>90일 동안 매일 뛰어서 <b>21km를 뛸 수 있는 몸</b>이 되면<br /><b>복근 윤곽</b>이 드러나기 시작할 거야.</>, // 문구 = 가인 2026-10-23
  '10K_complete': <>좋아. <b>12월 말쯤 롱런이 10km</b>야.<br />거기까지 가면 하프도 보여.</>,
  streak90: <>앱에 매일 <b>연속 기록</b>이 쌓여.<br />90까지 채우면 그건 습관이 아니라 <b>네 정체성</b>이야.</>,
  other: <>좋아. 뭐든 <b>90일 매일</b>이면 가까워져.<br />아래에 적어주면 같이 챙길게.</>,
};

// 탭 질문 + 타잔 맞춤 한마디(말풍선) — 시안 SOT: design-references/s6-apply-runexp-reaction.html A.
function ReactionStep({ label, options, reactions, value, onChange, extra = null }) {
  const reaction = value ? reactions[value] : null;
  // 폰에서는 보기 아래로 말풍선이 밀려 안 보인다 → 고르는 순간 말풍선이 보이게 스크롤.
  const bubbleRef = useRef(null);
  const picked = useRef(false);
  useEffect(() => {
    if (!picked.current || !bubbleRef.current) return;
    bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [value]);
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-6 break-keep">{label}</label>
      <div className="space-y-2.5">
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { picked.current = true; onChange(opt.value); }}
              className={`w-full text-left px-5 py-3 rounded-2xl border-2 font-bold transition-all ${
                selected
                  ? 'border-accent-green bg-accent-green text-bg-primary'
                  : `border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60 ${value ? 'opacity-55' : ''}`
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {reaction && (
        <div key={value} ref={bubbleRef} className="flex items-start gap-2.5 mt-4 animate-fade-up">
          {/* 가인 인스타 프로필 사진(@bali_tarzan, 2026-10-22 Graph API로 받아 160px로 줄임) */}
          <img src="/s6/tarzan-profile.jpg" alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shrink-0" />
          <div className="bg-bg-card text-card-ink rounded-[4px_16px_16px_16px] px-3.5 py-3 text-[14px] font-semibold leading-relaxed break-keep">
            <span className="block text-[11px] font-black text-card-ink-faint mb-0.5">발리타잔</span>
            {reaction}
          </div>
        </div>
      )}
      {extra}
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
  const isKR = ACTIVE.fee ? true : form.phoneCountry === 'KR';
  // 예전에 '해외'를 골라 저장된 폼이 남아 있어도 결제 기수에선 한국 번호로 되돌린다.
  useEffect(() => {
    if (ACTIVE.fee && form.phoneCountry !== 'KR') update('phoneCountry', 'KR');
  }, [form.phoneCountry, update]);
  const formatKR = (digits) => {
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };
  const displayValue = isKR ? formatKR(form.phone) : form.phone;
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">연락처</label>
      <p className="text-text-muted text-sm mb-4">{ACTIVE.fee ? '결제 확인·시작 안내 문자 받을 번호야.' : '시작 안내·앱 입장 문자용이야.'}</p>

      {/* 보증금 결제 기수는 국내 거주자만(가인 2026-10-23) — 해외 번호 선택지를 숨기고 한국 번호만 받는다 */}
      {!ACTIVE.fee && (
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
      )}

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
        {ACTIVE.fee && <><br />🇰🇷 지금은 국내 거주자만 참가할 수 있어.</>}
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
    { icon: '💳', step: 'STEP 1 · 시작 전', title: `보증금 ${ACTIVE.depositLabel} 입금`, desc: '합격하면 챌린지 시작 전에 먼저' },
    { icon: '🏃', step: 'STEP 2 · 21일', title: '팀과 함께 끝까지', desc: '매일 러닝 인증하며 완주' },
    {
      icon: '💰', step: 'STEP 3 · 완주 후', title: '보증금 그대로 돌려받기',
      outcomes: [
        { mark: '✓', label: `21일 중 ${21 - ACTIVE.passCount}일 이상 인증`, amount: '전액 환급', tone: 'pos' },
        { mark: '🏆', label: '팀 1등', amount: `+ ${ACTIVE.prizeTeam1st}`, tone: 'pos' },
        { mark: '✕', label: '중도 포기', amount: '0원', tone: 'neg' },
      ],
    },
  ];

  return (
    <ConsentShell
      label="보증금 안내"
      checked={checked}
      onChange={onChange}
      checkboxLabel={`${ACTIVE.depositLabel} 보증금 시스템을 이해했어`}
    >
      <p className="mb-3 text-card-ink text-[15px] leading-relaxed">
<span className="font-bold">네가 끝까지 완주할 수 있게</span> 도와줄 강제성을 만들려고 보증금 {ACTIVE.depositLabel}을 받아. 돈이 걸려 있으면 쉽게 못 포기하거든. 그 강제성이 너를 <span className="font-extrabold text-bg-primary">완주까지, 러닝 습관까지</span> 끌고 가.
      </p>
      <p className="mb-5 text-card-ink-faint text-[13px] leading-relaxed">
        첫 기수 30명 중 30명 전원 21일 완주 — 그게 증거야.
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

      <p className="mt-4 text-card-ink-faint text-xs whitespace-nowrap">🛡️ 합격 후 OT {ACTIVE.otLabel} 전까지 마음 바뀌면 전액 환불</p>
    </ConsentShell>
  );
}

// OT 참석 가능 여부. (시즌6부터 OT 안내에서 팀 배정 문구는 뺐다 — 가인 2026-10-22)
function OtStep({ value, onChange }) {
  // 시즌6: 참석 여부는 묻지 않고 일정 안내만(가인 2026-10-22). 녹화본 제공도 약속하지 않는다.
  const options = [
    { value: 'informed', label: 'OT 일정 확인했어', desc: '시간 맞으면 줌으로 들어갈게' },
  ];
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">온라인 OT 안내</label>
      <p className="text-text-secondary text-sm leading-relaxed mb-5">
        온라인 줌으로 1시간.
      </p>

      <div className="bg-bg-card rounded-2xl p-5 border-l-4 border-accent-green mb-5">
        <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-2">ORIENTATION</p>
        <p className="text-card-ink font-black text-xl leading-tight">
          {ACTIVE.otLabel} {ACTIVE.otTimeLabel} <span className="text-card-ink-muted text-base font-bold">· 1시간</span>
        </p>
        <p className="text-card-ink-muted text-[13px] mt-2 leading-relaxed">
          {ACTIVE.durationDays}일을 어떻게 해야 끝까지 갈 수 있는지 알려주고,
          같이 뛸 <span className="text-card-ink font-bold">사람들이랑 처음 인사하는 자리</span>야.
        </p>
      </div>

      <div className="space-y-2">
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full text-left flex items-start gap-3 px-4 py-4 rounded-2xl border-2 transition-colors cursor-pointer ${
                selected
                  ? 'border-accent-green bg-accent-green text-bg-primary'
                  : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                selected ? 'border-bg-primary bg-bg-primary text-accent-green' : 'border-card-ink-faint text-transparent'
              }`}>
                ✓
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[15px]">{opt.label}</span>
                <span className={`block text-[13px] mt-0.5 leading-relaxed ${selected ? 'text-bg-primary/75' : 'text-card-ink-muted'}`}>
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

// 시간 입력 — 시/분/초 휠 픽커. 값은 초 단위로 올려보낸다.
// 타이핑보다 휠·드래그가 빨라서 숫자 입력 대신 WheelPicker를 쓴다.
const HOUR_VALUES = Array.from({ length: 10 }, (_, i) => i);        // 0-9시간 (풀 마라톤 커버)
const MIN_VALUES = Array.from({ length: 60 }, (_, i) => i);
// 5K 세계기록 12:35. 이보다 빠른 입력은 1km 페이스를 잘못 넣은 것으로 본다.
const MIN_5K_SEC = 12 * 60;
const SEC_VALUES = Array.from({ length: 60 }, (_, i) => i);
const pad2 = (n) => String(n).padStart(2, '0');

function TimeInput({ parts, onChange, showHours, showSeconds = true }) {
  const num = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };
  const set = (k) => (v) => onChange({ ...parts, [k]: String(v) });
  const fields = [
    ...(showHours ? [{ k: 'h', label: '시간', values: HOUR_VALUES, render: (v) => <span className="text-2xl">{v}</span> }] : []),
    { k: 'm', label: '분', values: MIN_VALUES, render: (v) => <span className="text-2xl">{pad2(v)}</span> },
    ...(showSeconds ? [{ k: 's', label: '초', values: SEC_VALUES, render: (v) => <span className="text-2xl">{pad2(v)}</span> }] : []),
  ];
  return (
    <div className="flex items-end gap-2">
      {fields.map((f) => (
        <div key={f.k} className="flex-1 min-w-0">
          <label className="block text-card-ink-muted text-[11px] font-bold mb-1 text-center">{f.label}</label>
          <WheelPicker
            values={f.values}
            value={num(parts[f.k])}
            onChange={set(f.k)}
            itemH={44}
            render={f.render}
            tone="card"
          />
        </div>
      ))}
    </div>
  );
}

// 21일 챌린지 동안의 단기 목표. '5K 기록 향상'을 고르면 현재 기록을 이어서 받는다.
function ShortGoalStep({ shortGoal, current5k, onGoal, onRecord }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">{ACTIVE.durationDays}일 동안 달성하고 싶은 목표</label>
      <p className="text-text-secondary text-sm leading-relaxed mb-5">
        지금 어디쯤인지 알아야 {ACTIVE.durationDays}일을 제대로 짜줄 수 있어.
      </p>
      <div className="space-y-2">
        {SHORT_GOAL_OPTIONS.map(opt => {
          const selected = shortGoal === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onGoal(opt.value)}
              className={`w-full text-left flex items-start gap-3 px-4 py-4 rounded-2xl border-2 transition-colors cursor-pointer ${
                selected
                  ? 'border-accent-green bg-accent-green text-bg-primary'
                  : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                selected ? 'border-bg-primary bg-bg-primary text-accent-green' : 'border-card-ink-faint text-transparent'
              }`}>
                ✓
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[15px]">{opt.label}</span>
                <span className={`block text-[13px] mt-0.5 leading-relaxed ${selected ? 'text-bg-primary/75' : 'text-card-ink-muted'}`}>
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {shortGoal === 'pr_5k' && (
        <div className="mt-5 bg-bg-card rounded-2xl p-5 border-l-4 border-accent-green">
          <p className="text-card-ink font-bold text-[15px] mb-1">5km 완주 기록이 어떻게 돼?</p>
          <p className="text-card-ink-muted text-[13px] mb-1.5 leading-relaxed">
            <span className="font-bold text-card-ink">5km를 다 뛰는 데 걸리는 시간</span>이야.
            1km 페이스 아니야. 대충이어도 괜찮아.
          </p>
          <p className="text-card-ink-muted text-[12px] mb-4 leading-relaxed">
            예를 들어 1km에 5분 30초 페이스면 5km 기록은 <span className="font-bold text-card-ink">27분 30초</span>야.
          </p>
          <TimeInput parts={current5k} onChange={onRecord} showHours={false} />
        </div>
      )}
    </div>
  );
}

function GoalsStep({ goals, goalsOther, targetDistance, targetTime, targetTimeMode, onToggle, onOtherChange, onDistance, onTime, onMilestone, onCustom }) {
  const isOtherSelected = goals.includes('other');
  const isPaceSelected = goals.includes(PACE_GOAL_VALUE);
  const maxReached = goals.length >= MAX_GOALS;
  const distOpt = TARGET_DISTANCE_OPTIONS.find(d => d.value === targetDistance);
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">최종적으로 이루고 싶은 목표</label>
      <p className="text-text-secondary text-sm leading-relaxed mb-1">
        {ACTIVE.durationDays}일은 시작일 뿐이야. 그 뒤에도 계속 달려서 진짜 이루고 싶은 목표를 골라줘. <span className="font-bold">(최대 2개)</span>
      </p>
      <p className="text-text-muted text-xs mb-5">
        팀 매칭이랑 코칭 방향 잡는 데 써.
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
      {isPaceSelected && (
        <div className="mt-4 bg-bg-card rounded-2xl p-5 border-l-4 border-accent-green">
          <p className="text-card-ink font-bold text-[15px] mb-3">어느 거리를 단축하고 싶어?</p>
          <div className="grid grid-cols-4 gap-2">
            {TARGET_DISTANCE_OPTIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => onDistance(d.value)}
                className={`py-2.5 rounded-xl text-[13px] font-extrabold border-2 transition-colors ${
                  targetDistance === d.value
                    ? 'border-accent-green bg-accent-green text-bg-primary'
                    : 'border-card-border bg-bg-primary/5 text-card-ink hover:border-accent-green/60'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {distOpt && (
            <div className="mt-4">
              <p className="text-card-ink font-bold text-[15px] mb-1">{distOpt.label} 목표 기록</p>
              <p className="text-card-ink-muted text-[13px] mb-3 leading-relaxed">
                언젠가 찍고 싶은 기록을 골라줘.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(TARGET_MILESTONES[distOpt.value] || []).map(ms => {
                  const on = targetTimeMode === 'preset' && partsToSec(targetTime) === ms.sec;
                  return (
                    <button
                      key={ms.sec}
                      type="button"
                      onClick={() => onMilestone(ms.sec)}
                      className={`py-2.5 rounded-xl border-2 transition-colors leading-tight ${
                        on
                          ? 'border-accent-green bg-accent-green text-bg-primary'
                          : 'border-card-border bg-bg-primary/5 text-card-ink hover:border-accent-green/60'
                      }`}
                    >
                      <span className="block text-[14px] font-extrabold">{ms.label}</span>
                      <span className={`block text-[11px] font-bold tabular-nums mt-0.5 ${on ? 'text-bg-primary/70' : 'text-card-ink-faint'}`}>
                        {paceLabel(ms.sec, distOpt.km)}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={onCustom}
                  className={`py-2.5 rounded-xl border-2 transition-colors leading-tight ${
                    targetTimeMode === 'custom'
                      ? 'border-accent-green bg-accent-green text-bg-primary'
                      : 'border-card-border bg-bg-primary/5 text-card-ink hover:border-accent-green/60'
                  }`}
                >
                  <span className="block text-[14px] font-extrabold">기타</span>
                  <span className={`block text-[11px] font-bold mt-0.5 ${targetTimeMode === 'custom' ? 'text-bg-primary/70' : 'text-card-ink-faint'}`}>
                    직접 선택
                  </span>
                </button>
              </div>
              {targetTimeMode === 'custom' && (
                <div className="mt-4">
                  <TimeInput parts={targetTime} onChange={onTime} showHours={distOpt.hasHours} showSeconds={distOpt.hasSeconds} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {isOtherSelected && (
        <textarea
          value={goalsOther}
          onChange={e => onOtherChange(e.target.value)}
          placeholder="구체적인 목표를 적어줘"
          rows={3}
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
    case 'failReason':
      if (!form.failReason) return '하나 골라줘.';
      return null;
    case 'goal90':
      if (!form.goals?.[0]) return '하나 골라줘.';
      return null;
    case 'motivation':
      if (!form.motivation.trim()) return '지원 동기를 입력해줘.';
      return null;
    case 'shortGoal': {
      if (!form.shortGoal) return `${ACTIVE.durationDays}일 목표를 선택해줘.`;
      if (form.shortGoal === 'pr_5k') {
        const sec = partsToSec(form.current5k || {});
        if (!sec) return '지금 5km 완주 기록을 입력해줘. (대충이어도 괜찮아)';
        // 5K 세계기록이 12분 35초. 그보다 빠른 값 = 1km 페이스를 잘못 넣은 것.
        if (sec < MIN_5K_SEC) {
          return '그건 1km 페이스 같아. 5km 전체를 뛰는 데 걸리는 시간을 넣어줘. (예: 27분 30초)';
        }
      }
      return null;
    }
    case 'goals': {
      const goals = form.goals || [];
      if (goals.length === 0) return '목표를 1개 이상 선택해줘.';
      if (goals.includes('other') && !(form.goalsOther || '').trim()) return '"기타" 선택 시 구체적인 목표를 적어줘.';
      if (goals.includes(PACE_GOAL_VALUE)) {
        if (!form.targetDistance) return '기록 단축 목표 거리를 골라줘.';
        if (!partsToSec(form.targetTime || {})) return '목표 기록을 입력해줘.';
      }
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
    case 'ot':
      if (!form.otAttend) return 'OT 일정 확인을 눌러줘.';
      return null;
    default:
      return null;
  }
}
