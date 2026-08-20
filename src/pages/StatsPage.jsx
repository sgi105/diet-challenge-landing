import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/applyApi';
import { ACTIVE } from '../data/activeCohort';

// 모집 퍼널 대시보드 (/stats) — 운영용. 푸터에 링크하지 않는 비공개 주소.
// 원본 이벤트는 RLS로 잠겨 있고, 집계 함수(landing_funnel)만 열어뒀다.

// 지원서 단계 키 → 사람이 읽는 이름. ApplyPage의 STEPS와 같은 순서.
const STEP_LABEL = {
  intro: '시작 화면',
  referrer: '추천인',
  name: '이름',
  age: '나이',
  gender: '성별',
  phone: '연락처',
  job: '하는 일',
  region: '지역',
  runningExp: '러닝 경력',
  shortGoal: '21일 목표',
  motivation: '지원 동기',
  goals: '최종 목표',
  instagram: '인스타·카톡',
  friend: '친구 추천',
  deposit: '보증금 동의',
  ot: 'OT 참석',
};

const PLACEMENT_LABEL = {
  hero: '첫 화면',
  banner: '상단 배너',
  mid_testimonial: '후기 아래',
  mid_reward: '보상 아래',
  pricing: '가격표',
  final: '마지막',
  sticky: '하단 고정',
};

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

function Card({ label, value, sub, tone = 'default' }) {
  const toneCls = tone === 'accent' ? 'text-accent-green' : 'text-card-ink';
  return (
    <div className="bg-bg-card rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-1.5">{label}</p>
      <p className={`text-3xl font-black tabular-nums leading-none ${toneCls}`}>{value}</p>
      {sub && <p className="text-card-ink-muted text-[11px] mt-1.5 font-semibold">{sub}</p>}
    </div>
  );
}

// 퍼널 한 칸 — 폭이 곧 전환율. 이탈 인원을 옆에 붙여 어디서 새는지 바로 보이게.
function FunnelRow({ label, value, base, prev, note }) {
  const width = base > 0 ? Math.max((value / base) * 100, 2) : 0;
  const lost = prev != null ? prev - value : null;
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1 gap-2">
        <span className="text-text-primary text-sm font-bold">{label}</span>
        <span className="text-text-secondary text-xs font-semibold tabular-nums shrink-0">
          {value.toLocaleString()}명
          {base > 0 && <span className="text-text-muted"> · 전체의 {pct(value, base)}%</span>}
        </span>
      </div>
      <div className="h-7 rounded-lg bg-white/10 overflow-hidden">
        <div className="h-full bg-accent-green" style={{ width: `${width}%` }} />
      </div>
      {lost != null && lost > 0 && (
        <p className="text-accent-orange text-[11px] font-bold mt-1">
          ↓ 여기서 {lost.toLocaleString()}명 이탈 ({pct(lost, prev)}%)
        </p>
      )}
      {note && <p className="text-text-muted text-[11px] mt-1">{note}</p>}
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState(null);
  const [applicants, setApplicants] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [funnelRes, countRes] = await Promise.all([
        supabase.rpc('landing_funnel', { p_cohort: ACTIVE.cohortCode }),
        supabase.rpc('count_applicants_public', { p_cohort: ACTIVE.cohortCode }),
      ]);
      if (funnelRes.error) throw new Error(funnelRes.error.message);
      setData(funnelRes.data);
      setApplicants(Number(countRes.data) || 0);
      setError('');
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000); // 1분마다 갱신
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-muted text-sm">불러오는 중…</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-3">
        <p className="text-accent-orange text-sm font-bold">불러오지 못했어</p>
        <p className="text-text-muted text-xs">{error}</p>
        <button onClick={load} className="text-accent-green text-sm font-bold underline underline-offset-4">다시 시도</button>
      </div>
    );
  }

  const t = data?.totals || { visitors: 0, cta_clicks: 0, apply_opens: 0, submits: 0 };
  const steps = data?.steps || [];
  const placements = data?.placements || [];
  const daily = data?.daily || [];

  // 단계별 도달 — 가장 많이 도달한 단계를 기준(100%)으로 이탈을 계산한다.
  const stepBase = steps.length ? Math.max(...steps.map((s) => s.reached)) : 0;
  const worst = steps.reduce((acc, s, i) => {
    if (i === 0) return acc;
    const drop = steps[i - 1].reached - s.reached;
    return !acc || drop > acc.drop ? { ...s, drop, from: steps[i - 1] } : acc;
  }, null);

  return (
    <div className="min-h-screen px-5 py-10 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <Link to="/" className="text-text-muted text-sm font-semibold hover:text-accent-green">← 메인</Link>
        <button onClick={load} className="text-text-muted text-xs font-bold hover:text-accent-green">새로고침</button>
      </div>
      <h1 className="font-kr text-3xl font-black text-text-primary leading-tight mb-1">모집 현황</h1>
      <p className="text-text-muted text-xs font-semibold mb-8">
        {ACTIVE.cohortCode} · 1분마다 자동 갱신
      </p>

      {/* 핵심 숫자 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card label="VISITORS" value={t.visitors.toLocaleString()} sub="랜딩 방문 (세션 기준)" />
        <Card label="APPLICANTS" value={applicants ?? 0} sub={`정원 ${ACTIVE.totalSpots}명`} tone="accent" />
        <Card label="CTA CLICK" value={t.cta_clicks.toLocaleString()} sub={`방문의 ${pct(t.cta_clicks, t.visitors)}%`} />
        <Card
          label="전환율"
          value={`${pct(t.submits, t.visitors)}%`}
          sub="방문 → 지원 완료"
          tone="accent"
        />
      </div>

      {/* 퍼널 */}
      <h2 className="text-text-primary font-black text-lg mb-3">퍼널</h2>
      <div className="bg-bg-card/10 rounded-2xl p-4 mb-8 border border-white/10">
        <FunnelRow label="1. 랜딩 방문" value={t.visitors} base={t.visitors} />
        <FunnelRow label="2. 신청하기 클릭" value={t.cta_clicks} base={t.visitors} prev={t.visitors} />
        <FunnelRow label="3. 지원서 진입" value={t.apply_opens} base={t.visitors} prev={t.cta_clicks} />
        <FunnelRow label="4. 지원 완료" value={t.submits} base={t.visitors} prev={t.apply_opens} />
      </div>

      {/* 지원서 단계별 이탈 */}
      <h2 className="text-text-primary font-black text-lg mb-1">지원서 단계별 이탈</h2>
      <p className="text-text-muted text-xs mb-3">각 단계에 도달한 사람 수. 줄어드는 지점이 막히는 질문이야.</p>
      {steps.length === 0 ? (
        <p className="text-text-muted text-sm bg-bg-card/10 rounded-2xl p-4 border border-white/10 mb-8">
          아직 지원서에 들어온 사람이 없어.
        </p>
      ) : (
        <div className="bg-bg-card/10 rounded-2xl p-4 mb-8 border border-white/10">
          {worst && worst.drop > 0 && (
            <p className="text-accent-orange text-xs font-bold mb-3">
              🔻 가장 많이 빠지는 곳: {STEP_LABEL[worst.from.step_key] || worst.from.step_key} → {STEP_LABEL[worst.step_key] || worst.step_key} ({worst.drop}명)
            </p>
          )}
          {steps.map((s, i) => {
            const prev = i > 0 ? steps[i - 1].reached : null;
            const lost = prev != null ? prev - s.reached : 0;
            const width = stepBase > 0 ? Math.max((s.reached / stepBase) * 100, 2) : 0;
            return (
              <div key={s.step_key} className="mb-2.5">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-text-primary text-[13px] font-bold">
                    {i + 1}. {STEP_LABEL[s.step_key] || s.step_key}
                  </span>
                  <span className="text-text-secondary text-[11px] font-semibold tabular-nums shrink-0">
                    {s.reached}명
                    {lost > 0 && <span className="text-accent-orange"> (-{lost})</span>}
                  </span>
                </div>
                <div className="h-4 rounded bg-white/10 overflow-hidden">
                  <div className={`h-full ${lost > 0 ? 'bg-accent-orange' : 'bg-accent-green'}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA 위치별 */}
      <h2 className="text-text-primary font-black text-lg mb-1">어느 버튼이 눌렸나</h2>
      <p className="text-text-muted text-xs mb-3">전환을 만드는 섹션. 다음 시즌 랜딩 짤 때 근거로 써.</p>
      {placements.length === 0 ? (
        <p className="text-text-muted text-sm bg-bg-card/10 rounded-2xl p-4 border border-white/10 mb-8">
          아직 클릭이 없어.
        </p>
      ) : (
        <div className="bg-bg-card rounded-2xl p-4 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          {placements.map((p) => (
            <div key={p.placement} className="flex justify-between items-baseline py-1.5 text-sm">
              <span className="text-card-ink font-bold">{PLACEMENT_LABEL[p.placement] || p.placement}</span>
              <span className="text-card-ink-muted font-semibold tabular-nums">
                {p.sessions}명 <span className="text-card-ink-faint">/ {p.clicks}회</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 일자별 */}
      <h2 className="text-text-primary font-black text-lg mb-3">일자별</h2>
      {daily.length === 0 ? (
        <p className="text-text-muted text-sm bg-bg-card/10 rounded-2xl p-4 border border-white/10">데이터 없음</p>
      ) : (
        <div className="bg-bg-card rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-card-ink-faint text-[10px] font-extrabold tracking-widest">
                <th className="text-left pb-2">날짜</th>
                <th className="text-right pb-2">방문</th>
                <th className="text-right pb-2">클릭</th>
                <th className="text-right pb-2">진입</th>
                <th className="text-right pb-2">완료</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day} className="border-t border-card-border/50">
                  <td className="py-2 text-card-ink font-bold whitespace-nowrap">{d.day?.slice(5)}</td>
                  <td className="py-2 text-right text-card-ink-muted tabular-nums">{d.visitors}</td>
                  <td className="py-2 text-right text-card-ink-muted tabular-nums">{d.cta_clicks}</td>
                  <td className="py-2 text-right text-card-ink-muted tabular-nums">{d.apply_opens}</td>
                  <td className="py-2 text-right text-card-ink font-extrabold tabular-nums">{d.submits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-text-muted text-[11px] mt-6 leading-relaxed">
        방문·클릭은 브라우저 세션 기준이라 같은 사람이 다른 기기로 오면 따로 잡혀.
        지원 완료 수는 지원서 DB 기준이라 이게 정확한 숫자야.
      </p>
    </div>
  );
}
