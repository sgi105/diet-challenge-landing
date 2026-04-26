import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitApplication } from '../lib/applyApi';

const STORAGE_KEY = 'samurai-season0-apply-v1';

const initialForm = {
  name: '',
  age: '',
  phoneCountry: 'KR',
  phone: '',
  job: '',
  region: '',
  runningExp: '',
  motivation: '',
  instagram: '',
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const TOTAL_QUESTIONS = 10;

export default function ApplyPage() {
  const navigate = useNavigate();
  const persisted = useMemo(() => loadState(), []);
  const [step, setStep] = useState(persisted?.step ?? 0);
  const [form, setForm] = useState(persisted?.form ?? initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    saveState({ step, form });
  }, [step, form]);

  useEffect(() => {
    setError('');
  }, [step]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    const v = validateStep(step, form);
    if (v) { setError(v); return; }
    setStep(s => Math.min(s + 1, TOTAL_QUESTIONS));
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const v = validateStep(step, form);
    if (v) { setError(v); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitApplication(form);
      clearState();
      navigate('/apply/done');
    } catch (e) {
      setError(e.message || '제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!confirm('지금까지 입력한 내용을 모두 지우고 처음부터 다시 시작할까요?')) return;
    clearState();
    setForm(initialForm);
    setStep(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="text-text-muted text-sm hover:text-accent-green transition-colors font-semibold">← 메인</Link>
        {step > 0 && (
          <span className="text-text-muted text-xs font-extrabold tracking-widest">
            {Math.min(step, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
          </span>
        )}
        {step > 0 ? (
          <button onClick={handleReset} className="text-text-muted text-xs hover:text-accent-orange transition-colors font-semibold">
            처음부터
          </button>
        ) : (
          <span className="w-12" />
        )}
      </header>

      {/* Progress bar */}
      {step > 0 && (
        <div className="h-1.5 bg-white/10">
          <div
            className="h-full bg-accent-green transition-all duration-300"
            style={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      )}

      {/* Body */}
      <main className="flex-1 px-6 py-10 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <StepContent step={step} form={form} update={update} />
          {error && (
            <p className="text-accent-orange text-sm mt-4 font-semibold">{error}</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-8 pt-4 border-t border-white/10 sticky bottom-0 bg-bg-deep/80 backdrop-blur">
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
              {step === 0 ? '시작하기 →' : '다음 →'}
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
                {submitting ? '제출 중...' : '지원서 제출하기 →'}
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

function StepContent({ step, form, update }) {
  switch (step) {
    case 0:
      return <IntroStep />;
    case 1:
      return <TextStep label="이름" placeholder="홍길동" value={form.name} onChange={v => update('name', v)} autoFocus />;
    case 2:
      return (
        <TextStep
          label="나이"
          placeholder="28"
          value={form.age}
          onChange={v => update('age', v.replace(/\D/g, '').slice(0, 3))}
          inputMode="numeric"
          autoFocus
          suffix="세"
        />
      );
    case 3:
      return <PhoneStep form={form} update={update} />;
    case 4:
      return <TextStep label="하는 일" placeholder="예: 스타트업 마케터, 대학생, 프리랜서" value={form.job} onChange={v => update('job', v)} autoFocus />;
    case 5:
      return <TextStep label="거주 지역" placeholder="예: 서울 마포구 / 경기 분당 / 부산 해운대" value={form.region} onChange={v => update('region', v)} autoFocus />;
    case 6:
      return (
        <RadioStep
          label="러닝 경력은 어느 정도인가요?"
          options={runningExpOptions}
          value={form.runningExp}
          onChange={v => update('runningExp', v)}
        />
      );
    case 7:
      return (
        <TextareaStep
          label="왜 이번 챌린지에 지원하시나요?"
          placeholder="구체적일수록 선발에 유리해요."
          value={form.motivation}
          onChange={v => update('motivation', v)}
          minLength={20}
          autoFocus
        />
      );
    case 8:
      return (
        <TextStep
          label="인스타 아이디 (선택)"
          placeholder="@your_handle"
          value={form.instagram}
          onChange={v => update('instagram', v)}
          hint="단톡방 안내용입니다. 없으면 비워두세요."
          autoFocus
        />
      );
    case 9:
      return (
        <ConsentStep
          label="보증금 안내"
          checked={form.agreeDeposit}
          onChange={v => update('agreeDeposit', v)}
          checkboxLabel="20만원 보증금 시스템을 이해했습니다"
        >
          <p className="text-card-ink font-bold mb-1.5">🎯 왜 보증금을 받나요?</p>
          <p className="text-sm">
            팀 챌린지이기 때문에, <span className="text-card-ink font-bold">끝까지 열심히 할 사람만 선발하기 위함</span>입니다.
            한 명이 포기하면 팀 전체 보너스가 날아갑니다.
          </p>

          <div className="mt-4 p-4 rounded-2xl border-l-[5px] border-accent-green bg-accent-green/10">
            <p className="text-card-ink font-bold text-sm">📊 직전 기수 평균 수행률 95% · 11명 전원 성공</p>
            <p className="text-card-ink-muted text-xs mt-1">참여만 하면 성공할 수밖에 없는 시스템입니다.</p>
          </div>

          <p className="mt-4 text-sm font-semibold text-card-ink">합격 후 20만원 입금 → 환급 구조:</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>• 4주 미션 90% 완료 + 5K 파이널 완주 시 <span className="text-bg-primary font-bold">전액 환급</span></li>
            <li>• 팀 전원 성공 시 <span className="text-bg-primary font-bold">+4만원 (24만원 환급)</span></li>
            <li>• 우승팀 시 <span className="text-bg-primary font-bold">+20만원 (40만원 환급)</span></li>
            <li>• 중도 포기 시 <span className="text-accent-orange font-bold">전액 몰수</span> → 우승팀 상금 풀로</li>
          </ul>
        </ConsentStep>
      );
    case 10:
      return (
        <ConsentStep
          label="합격 / 입금 일정"
          checked={form.agreeSchedule}
          onChange={v => update('agreeSchedule', v)}
          checkboxLabel="합격 발표·입금 마감 일정을 확인했습니다"
        >
          <ul className="space-y-2 text-sm">
            <li>• 합격 발표: <span className="text-card-ink font-bold">4/28(화) 16:00</span> 문자 + 인스타 단톡방 안내</li>
            <li>• 입금 마감: <span className="text-accent-orange font-bold">4/28(화) 23:59</span></li>
            <li>• 마감까지 미입금 시 <span className="text-accent-orange font-bold">자동으로 다음 순번</span>으로 넘어갑니다</li>
            <li>• OT: 5/3(토) · 챌린지 시작: 5/4(월) · 5K 파이널: 5/31(일)</li>
          </ul>
        </ConsentStep>
      );
    default:
      return null;
  }
}

function IntroStep() {
  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <span className="pill text-accent-green block w-fit mx-auto mb-4">SEASON [0] · APPLY</span>
      <h1 className="font-kr text-4xl font-black text-text-primary mb-4 leading-tight">
        지원서 작성<br />약 2분 소요
      </h1>
      <p className="text-text-secondary leading-relaxed">
        30명 한정으로 모집합니다.<br />
        모든 항목은 선발과 팀 매칭에 사용됩니다.
      </p>
      <ul className="mt-8 text-left space-y-3 text-sm bg-bg-card rounded-3xl p-6 text-card-ink-muted shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        <li>📝 <span className="text-card-ink font-bold">총 10문항</span> (대부분 1줄짜리)</li>
        <li>💾 작성 중 새로고침해도 <span className="text-card-ink font-bold">자동 저장</span></li>
        <li>📨 합격 결과는 <span className="text-card-ink font-bold">4/28(화) 16:00</span> 문자로 안내</li>
      </ul>
    </div>
  );
}

function TextStep({ label, placeholder, value, onChange, inputMode, autoFocus, suffix, hint }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">{label}</label>
      {hint && <p className="text-text-muted text-sm mb-4">{hint}</p>}
      <div className="relative mt-3">
        <input
          type="text"
          inputMode={inputMode}
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

function TextareaStep({ label, placeholder, value, onChange, minLength, autoFocus }) {
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
      <p className="text-text-muted text-xs mt-2 text-right font-semibold">
        {value.length}{minLength ? ` / 최소 ${minLength}자` : ''}
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
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-2">연락처</label>
      <p className="text-text-muted text-sm mb-4">합격 안내·입금 확인용입니다.</p>

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
        value={form.phone}
        onChange={e => {
          const raw = e.target.value;
          const cleaned = isKR ? raw.replace(/\D/g, '').slice(0, 11) : raw.slice(0, 30);
          update('phone', cleaned);
        }}
        placeholder={isKR ? '01012345678' : '+1 415 555 0123'}
        className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
      />
      <p className="text-text-muted text-xs mt-2 font-semibold">
        {isKR ? '하이픈 없이 숫자만 입력. 010으로 시작.' : '국가번호 포함해서 입력해주세요. 예: +1 415 555 0123'}
      </p>
    </div>
  );
}

function ConsentStep({ label, children, checked, onChange, checkboxLabel }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-text-primary text-2xl font-black font-kr mb-4">{label}</label>
      <div className="bg-bg-card rounded-3xl p-6 text-card-ink-muted leading-relaxed shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
        {children}
      </div>
      <button
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

function validateStep(step, form) {
  switch (step) {
    case 0:
      return null;
    case 1:
      if (!form.name.trim()) return '이름을 입력해주세요.';
      if (form.name.trim().length < 2) return '이름을 2자 이상 입력해주세요.';
      return null;
    case 2: {
      const n = parseInt(form.age, 10);
      if (!form.age || isNaN(n)) return '나이를 입력해주세요.';
      if (n < 14 || n > 80) return '14~80세 사이로 입력해주세요.';
      return null;
    }
    case 3:
      if (!form.phone.trim()) return '연락처를 입력해주세요.';
      if (form.phoneCountry === 'KR') {
        const digits = form.phone.replace(/\D/g, '');
        if (!/^01[016789]\d{7,8}$/.test(digits)) return '한국 휴대폰 번호 형식이 맞지 않습니다. (010으로 시작 11자리)';
      } else {
        if (form.phone.replace(/\D/g, '').length < 7) return '국가번호 포함 7자 이상의 숫자를 입력해주세요.';
      }
      return null;
    case 4:
      if (!form.job.trim()) return '하는 일을 입력해주세요.';
      return null;
    case 5:
      if (!form.region.trim()) return '거주 지역을 입력해주세요.';
      return null;
    case 6:
      if (!form.runningExp) return '러닝 경력을 선택해주세요.';
      return null;
    case 7:
      if (!form.motivation.trim()) return '지원 동기를 입력해주세요.';
      if (form.motivation.trim().length < 20) return '최소 20자 이상 입력해주세요.';
      return null;
    case 8:
      return null;
    case 9:
      if (!form.agreeDeposit) return '보증금 안내에 동의해주세요.';
      return null;
    case 10:
      if (!form.agreeSchedule) return '합격·입금 일정에 동의해주세요.';
      return null;
    default:
      return null;
  }
}
