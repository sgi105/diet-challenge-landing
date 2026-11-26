import { useEffect, useState } from 'react';
import { supabase } from '../../lib/applyApi';

// /diet 상담 랜딩 현황 (/diet/stats) — 운영용 비공개 주소. 링크는 어디에도 걸지 않는다.
// 숫자는 DB 집계 함수 diet_stats() 하나에서 온다(한국 시간 날짜 · 세션 = 사람 수).

const STEP_LABEL = {
  gender: '성별', age: '나이', spentRange: '쓴 돈', spentOn: '쓴 곳', tried: '해본 방법',
  hardest: '제일 어려운 것', worry: '걱정 한 가지', name: '이름', phone: '번호',
};
const PLACEMENT_LABEL = { hero: '첫 화면', sticky: '하단 고정 버튼', final: '맨 아래 버튼' };
const SOURCE_LABEL = { ig: '인스타그램', instagram: '인스타그램', facebook: '페이스북', direct: '링크 정보 없음', kakaotalk: '카카오톡' };

const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '-');
const md = (d) => { const [, m, dd] = d.split('-'); return `${Number(m)}/${Number(dd)}`; };
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const dow = (d) => DOW[new Date(`${d}T12:00:00+09:00`).getDay()];

const C = { bg: '#0d0f12', card: '#171a1f', line: '#262a31', text: '#f2f4f7', muted: '#8b929c', lime: '#c8ff4d' };

function Card({ label, value, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 12px' }}>
      <div style={{ color: C.muted, fontSize: 12, fontWeight: 700 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 28, fontWeight: 900, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, note, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>{title}</h2>
      {note && <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 0' }}>{note}</p>}
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

const th = { color: C.muted, fontSize: 12, fontWeight: 700, padding: '8px 6px', textAlign: 'right', borderBottom: `1px solid ${C.line}` };
const td = { color: C.text, fontSize: 14, padding: '9px 6px', textAlign: 'right', borderBottom: `1px solid ${C.line}`, fontVariantNumeric: 'tabular-nums' };

function Bars({ rows, base }) {
  return rows.map((r) => (
    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 104, color: C.text, fontSize: 13, flexShrink: 0 }}>{r.label}</div>
      <div style={{ flex: 1, background: C.line, borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{ width: base ? `${(r.n / base) * 100}%` : 0, background: C.lime, height: '100%' }} />
      </div>
      <div style={{ width: 34, textAlign: 'right', color: C.text, fontSize: 13, fontWeight: 800 }}>{r.n}</div>
    </div>
  ));
}

export default function DietStatsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const { data: d, error: e } = await supabase.rpc('diet_stats');
    if (e) setError(e.message); else { setData(d); setError(''); }
  };
  useEffect(() => {
    document.title = '애슬릿 랜딩 현황';
    load(); // eslint-disable-line react-hooks/set-state-in-effect -- 비동기 조회 후 setState (StatsPage와 같은 방식)
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const wrap = { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Pretendard, -apple-system, sans-serif' };
  if (error) return <div style={{ ...wrap, padding: 24 }}>불러오지 못했어: {error} <button onClick={load}>다시 시도</button></div>;
  if (!data) return <div style={{ ...wrap, padding: 24, color: C.muted }}>불러오는 중…</div>;

  const t = data.totals;
  const steps = data.steps || [];
  const stepBase = steps.length ? Math.max(...steps.map((s) => s.sessions)) : 0;

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 16px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>애슬릿 랜딩 현황</h1>
          <button onClick={load} style={{ background: 'none', border: 0, color: C.muted, fontSize: 12, fontWeight: 700 }}>새로고침</button>
        </div>
        <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 18px' }}>/diet · 한국 시간 기준 · 1분마다 자동 갱신 · 숫자 = 사람 수</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <Card label="방문" value={t.visitors} />
          <Card label="신청서 클릭" value={t.cta} sub={`방문의 ${pct(t.cta, t.visitors)}`} />
          <Card label="신청 완료" value={t.submits} sub={`클릭의 ${pct(t.submits, t.cta)}`} />
        </div>

        <Section title="날짜별">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left' }}>날짜</th>
                <th style={th}>방문</th>
                <th style={th}>신청서 클릭</th>
                <th style={th}>신청 완료</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((r) => (
                <tr key={r.d}>
                  <td style={{ ...td, textAlign: 'left', color: C.muted }}>{md(r.d)} ({dow(r.d)})</td>
                  <td style={td}>{r.visitors}</td>
                  <td style={td}>{r.cta}</td>
                  <td style={{ ...td, color: r.submits ? C.lime : C.text, fontWeight: r.submits ? 900 : 400 }}>{r.submits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="신청서 어디까지 갔나" note="질문 화면을 본 사람 수 · 11/25부터 기록">
          {steps.length ? (
            <Bars base={stepBase} rows={steps.map((s) => ({ label: `${s.step_index}. ${STEP_LABEL[s.step_key] || s.step_key}`, n: s.sessions }))} />
          ) : <p style={{ color: C.muted, fontSize: 13 }}>아직 기록 없음</p>}
        </Section>

        <Section title="어디서 왔나">
          <Bars base={Math.max(1, ...(data.sources || []).map((s) => s.visitors))}
            rows={(data.sources || []).map((s) => ({ label: SOURCE_LABEL[s.src] || s.src, n: s.visitors }))} />
        </Section>

        <Section title="어느 버튼을 눌렀나">
          <Bars base={Math.max(1, ...(data.placements || []).map((s) => s.clicks))}
            rows={(data.placements || []).map((s) => ({ label: PLACEMENT_LABEL[s.placement] || s.placement, n: s.clicks }))} />
        </Section>
      </div>
    </div>
  );
}
