import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { QUESTIONS } from '../../data/diet';
import { submitDietConsult } from '../../lib/dietApi';
import { logEvent } from '../../lib/eventLog';
import { metaTrackApplication } from '../../lib/metaPixel';

// /diet 상담 신청서 — 한 화면에 질문 하나. 하나만 고르는 질문도 '다음'을 눌러야 넘어간다(가인 2026-11-17).
// 닫았다 다시 열어도 답은 남는다(부모가 answers 를 들고 있음).
const fmtKR = (d) => (d.length <= 3 ? d : d.length <= 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`);

function validate(q, a) {
  const v = a[q.key];
  switch (q.type) {
    case 'single': return v ? null : '하나 골라줘.';
    case 'multi': return v?.length ? null : '하나 이상 골라줘.';
    case 'number': return Number(v) >= 10 && Number(v) <= 99 ? null : '나이를 숫자로 적어줘.';
    case 'text': return (v || '').trim().length >= 2 ? null : '한 줄이라도 적어줘.';
    case 'name': return (v || '').trim() ? null : '이름 적어줘.';
    case 'phone': {
      const d = (v || '').replace(/\D/g, '');
      if (a.phoneCountry === 'INTL') return d.length >= 7 ? null : '국가번호 포함 7자 이상의 숫자를 입력해줘.';
      return /^01[016789]\d{7,8}$/.test(d) ? null : '휴대폰 번호 형식이 맞지 않아. (010으로 시작 11자리)';
    }
    default: return null;
  }
}

function Title({ t }) {
  const lines = Array.isArray(t) ? t : [t];
  return <h3>{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>)}</h3>;
}

export default function DietApplySheet({ answers, setAnswers, step, setStep, onClose }) {
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fieldRef = useRef(null);
  const q = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;
  const set = (k, v) => { setAnswers((a) => ({ ...a, [k]: v })); setErr(''); };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    if (fieldRef.current) setTimeout(() => fieldRef.current?.focus(), 250);
    logEvent('diet_q_view', { step_index: step + 1, step_key: q.key }); // landing_events 칸 이름 그대로
  }, [step, q.key]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitDietConsult(answers);
      track('diet_consult_submit');
      logEvent('diet_consult_submit');
      metaTrackApplication({ phone: answers.phone, phoneCountry: answers.phoneCountry, waitlist: false, contentName: 'diet_consult' });
      setDone(true);
    } catch (e) {
      logEvent('diet_consult_error', { step_key: 'submit', placement: String(e.message).slice(0, 80) });
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    const msg = validate(q, answers);
    if (msg) { setErr(msg); return; }
    if (last) { submit(); return; }
    setStep(step + 1);
  };
  const back = () => { setErr(''); if (step > 0) setStep(step - 1); };
  const onEnter = (e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) next(); };

  if (done) {
    return (
      <div className="sheet" role="dialog" aria-label="상담 신청 완료">
        <div className="done">
          <p style={{ fontSize: 56 }}>🙌</p>
          <p className="h2" style={{ marginTop: 6 }}>신청 <span className="lime">완료!</span></p>
          <p className="body" style={{ marginTop: 12 }}>
            <b>{answers.name.trim()}</b>, 신청서 내가 직접 다 읽어볼게.<br />
            확인하고 <b>{answers.phone}</b>로<br />연락 줄게.
          </p>
          <p className="body" style={{ marginTop: 18, fontSize: 13 }}>
            그동안 인스타 <a href="https://www.instagram.com/bali_tarzan/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--d-lime)' }}>@bali_tarzan</a> 에서<br />
            다른 애슬릿들 구경하고 있어.
          </p>
          <button className="btn" style={{ marginTop: 26 }} onClick={() => onClose(true)}>처음으로</button>
        </div>
      </div>
    );
  }

  const v = answers[q.key];
  return (
    <div className="sheet" role="dialog" aria-label="애슬릿 프로그램 상담 신청">
      <div className="sh-top">
        <button onClick={back} style={{ visibility: step ? 'visible' : 'hidden' }} aria-label="이전">←</button>
        <div className="bar"><i style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
        <span className="sh-count">{step + 1}/{QUESTIONS.length}</span>
        <button onClick={() => onClose(false)} aria-label="닫기">✕</button>
      </div>

      <div className="sh-body">
        <div className="q" key={q.key}>
          <Title t={q.title} />
          {q.hint && <p className="hint">{q.hint}</p>}
          {q.chips && <div className="chips">{q.chips.map((c) => <span key={c}>{c}</span>)}</div>}

          {(q.type === 'single' || q.type === 'multi') && (
            <div className={`opts ${q.type === 'single' ? 'single' : ''} ${q.layout === 'two' ? 'two' : ''}`}>
              {q.options.map((o) => {
                const label = typeof o === 'string' ? o : o.label;
                const value = typeof o === 'string' ? o : o.value;
                const sel = q.type === 'single' ? v === value : (v || []).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={`opt ${sel ? 'sel' : ''}`}
                    onClick={() => {
                      if (q.type === 'single') set(q.key, value);
                      else set(q.key, sel ? v.filter((x) => x !== value) : [...(v || []), value]);
                    }}
                  >
                    <span className="ck" />{label}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'number' && (
            <input ref={fieldRef} className="field" type="number" inputMode="numeric" placeholder={q.placeholder}
              value={v ?? ''} onChange={(e) => set(q.key, e.target.value.slice(0, 2))} onKeyDown={onEnter} />
          )}
          {q.type === 'name' && (
            <input ref={fieldRef} className="field" type="text" maxLength={20} autoComplete="given-name" placeholder={q.placeholder}
              value={v ?? ''} onChange={(e) => set(q.key, e.target.value)} onKeyDown={onEnter} />
          )}
          {q.type === 'text' && (
            <textarea ref={fieldRef} className="field" maxLength={500} placeholder={q.placeholder}
              value={v ?? ''} onChange={(e) => set(q.key, e.target.value)} />
          )}
          {q.type === 'phone' && (
            <>
              <div className="ctry">
                {[{ c: 'KR', l: '🇰🇷 한국' }, { c: 'INTL', l: '🌏 해외' }].map(({ c, l }) => (
                  <button key={c} type="button" className={answers.phoneCountry === c ? 'on' : ''}
                    onClick={() => setAnswers((a) => ({ ...a, phoneCountry: c, phone: '' }))}>{l}</button>
                ))}
              </div>
              <input ref={fieldRef} className="field" type="tel" autoComplete="tel"
                inputMode={answers.phoneCountry === 'KR' ? 'numeric' : 'tel'}
                placeholder={answers.phoneCountry === 'KR' ? '010-1234-5678' : '+1 415 555 0123'}
                value={v ?? ''}
                onChange={(e) => set('phone', answers.phoneCountry === 'KR' ? fmtKR(e.target.value.replace(/\D/g, '').slice(0, 11)) : e.target.value.slice(0, 30))}
                onKeyDown={onEnter} />
            </>
          )}
          {err && <p className="err">{err}</p>}
        </div>
      </div>

      <div className="sh-foot">
        <button className="btn" onClick={next} disabled={submitting}>
          {submitting ? '보내는 중…' : last ? '상담 신청 제출하기' : '다음'}
        </button>
        {last && <p className="note">제출하면 상담 연락을 위해 번호를 받는 데 동의하는 걸로 볼게.</p>}
      </div>
    </div>
  );
}
