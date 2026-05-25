import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApplicantAvatar from '../components/ui/ApplicantAvatar';
import { matchTeams, SKILL_SCORE } from '../lib/teamMatching';
import { normalizeInstagram } from '../lib/instagram';
import { guessGender, GENDER_LABEL } from '../lib/genderGuess';

// 카드 표시용 성별 — 저장된 값 없으면 이름에서 추정
const effectiveGender = (row) => row.gender || guessGender(row.name) || null;

// 팀 ID(int) → 알파벳 라벨 (1→A, 2→B, ..., 26→Z, 27→AA). 안 들어오면 빈 문자열.
function teamLabel(id) {
  if (id == null) return '';
  let n = Number(id);
  if (!Number.isFinite(n) || n < 1) return String(id);
  let s = '';
  while (n > 0) {
    n -= 1;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

// "@user" / "instagram.com/user" / "user" → ig.me DM 링크. 핸들 없으면 null.
// 주의: 상대가 "팔로워만 DM 허용" 이면 작동 안 함 (인스타 프라이버시 설정).
function igDmUrl(raw) {
  const handle = normalizeInstagram(raw);
  return handle ? `https://ig.me/m/${handle}` : null;
}

// 프로필 페이지 — DM 링크 막혀도 항상 작동. 거기서 사용자가 직접 "메시지" 누름.
function igProfileUrl(raw) {
  const handle = normalizeInstagram(raw);
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

const TOKEN_KEY = 'admin_token_v1';
const ADMIN_PASSWORD = 'qkffl1000';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

const RUN_LABELS = {
  full_marathon: '풀마라톤',
  half_marathon: '하프',
  run_10km: '10km',
  run_5km: '5km',
  run_1km: '1km',
  almost_none: '입문',
  // legacy
  none: '없음',
  walking: '걷기만',
  run_3km: '3km까지',
};

export default function AdminApplicationsPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // list | teams
  const [teamCount, setTeamCount] = useState(10);
  const [matching, setMatching] = useState(false);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [cohortTab, setCohortTab] = useState('season1'); // all | season0 | season1

  const fetchData = async (t) => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (r.status === 401) {
        setError('비밀번호가 틀렸습니다.');
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
        setData(null);
        return;
      }
      if (!r.ok) {
        const t = await r.text();
        setError(`서버 오류 (${r.status}): ${t}`);
        return;
      }
      const json = await r.json();
      setData(json);
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      setError(`요청 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token) return;
    if (token !== ADMIN_PASSWORD) {
      setError('비밀번호가 틀렸습니다.');
      return;
    }
    fetchData(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setData(null);
  };

  // ---------- 인스타 inline edit ----------
  const [editingIgId, setEditingIgId] = useState(null);
  const [igDraft, setIgDraft] = useState('');
  const [igSavingId, setIgSavingId] = useState(null);
  const startEditIg = (row) => { setEditingIgId(row.id); setIgDraft(row.instagram || ''); setError(''); };
  const cancelEditIg = () => { setEditingIgId(null); setIgDraft(''); };
  const saveIg = async (row) => {
    // 저장 시 핸들 정규화 (@ / URL / 슬래시 제거). 정규화 실패 시 입력값 그대로 trim.
    const draft = igDraft.trim();
    const next = normalizeInstagram(draft) || draft;
    const current = (row.instagram || '').trim();
    if (next === current) { cancelEditIg(); return; }
    setIgSavingId(row.id);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ instagram: next || null }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`인스타 저장 실패 (${r.status}): ${t}`);
        return;
      }
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, instagram: next || null } : x) } : prev);
      cancelEditIg();
    } catch (e) {
      setError(`인스타 저장 요청 실패: ${e.message}`);
    } finally {
      setIgSavingId(null);
    }
  };

  // ---------- 지인 toggle (O/X) — optimistic ----------
  const toggleAcq = async (row) => {
    const next = !row.is_acquaintance;
    setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, is_acquaintance: next } : x) } : prev);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_acquaintance: next }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`지인 토글 실패 (${r.status}): ${t}`);
        setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, is_acquaintance: !next } : x) } : prev);
      }
    } catch (e) {
      setError(`지인 토글 요청 실패: ${e.message}`);
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, is_acquaintance: !next } : x) } : prev);
    }
  };

  // ---------- 인스타 핸들 복사 ----------
  const [copiedId, setCopiedId] = useState('');
  const copyHandle = async (rawIg) => {
    const handle = normalizeInstagram(rawIg);
    if (!handle) return;
    try {
      await navigator.clipboard.writeText(handle);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = handle;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopiedId(handle);
    setTimeout(() => setCopiedId(''), 1200);
  };

  // ---------- 팀 수동 편집 (배정 / 빼기, optimistic) ----------
  const assignTeam = async (row, nextTeamId) => {
    const prevTeam = row.team_id ?? null;
    setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, team_id: nextTeamId } : x) } : prev);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ team_id: nextTeamId }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`팀 변경 실패 (${r.status}): ${t}`);
        setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, team_id: prevTeam } : x) } : prev);
      }
    } catch (e) {
      setError(`팀 변경 요청 실패: ${e.message}`);
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, team_id: prevTeam } : x) } : prev);
    }
  };

  // ---------- 입금 / 자소 체크 토글 (optimistic UI — 즉시 반영, 실패 시 롤백) ----------
  const toggleFlag = async (row, field) => {
    const next = !row[field];
    // 1) 즉시 로컬 상태 갱신
    setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, [field]: next } : x) } : prev);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: next }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`${field} 저장 실패 (${r.status}): ${t}`);
        // 롤백
        setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, [field]: !next } : x) } : prev);
      }
    } catch (e) {
      setError(`${field} 요청 실패: ${e.message}`);
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, [field]: !next } : x) } : prev);
    }
  };

  // ---------- 성별 토글 (M → F → null → M) — optimistic ----------
  const cycleGender = async (row) => {
    const cur = row.gender; // 'M' | 'F' | null/undefined
    let next;
    if (cur === 'M') next = 'F';
    else if (cur === 'F') next = null;
    else next = 'M';
    setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, gender: next } : x) } : prev);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gender: next }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`성별 저장 실패 (${r.status}): ${t}`);
        setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, gender: cur } : x) } : prev);
      }
    } catch (e) {
      setError(`성별 저장 요청 실패: ${e.message}`);
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, gender: cur } : x) } : prev);
    }
  };

  // ---------- 메모 inline edit ----------
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [memoSavingId, setMemoSavingId] = useState(null);
  const startEditMemo = (row) => { setEditingMemoId(row.id); setMemoDraft(row.memo || ''); setError(''); };
  const cancelEditMemo = () => { setEditingMemoId(null); setMemoDraft(''); };
  const saveMemo = async (row) => {
    const next = memoDraft.trim();
    const current = (row.memo || '').trim();
    if (next === current) { cancelEditMemo(); return; }
    setMemoSavingId(row.id);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memo: next || null }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`메모 저장 실패 (${r.status}): ${t}`);
        return;
      }
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => x.id === row.id ? { ...x, memo: next || null } : x) } : prev);
      cancelEditMemo();
    } catch (e) {
      setError(`메모 저장 요청 실패: ${e.message}`);
    } finally {
      setMemoSavingId(null);
    }
  };

  // ---------- 배제 toggle — optimistic ----------
  const toggleExclude = async (row) => {
    const next = !row.excluded;
    const prevTeam = row.team_id ?? null;
    setData((prev) => prev ? {
      ...prev,
      rows: prev.rows.map((x) => x.id === row.id ? { ...x, excluded: next, team_id: next ? null : x.team_id } : x),
    } : prev);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ excluded: next }),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`배제 토글 실패 (${r.status}): ${t}`);
        setData((prev) => prev ? {
          ...prev,
          rows: prev.rows.map((x) => x.id === row.id ? { ...x, excluded: !next, team_id: prevTeam } : x),
        } : prev);
      }
    } catch (e) {
      setError(`배제 토글 요청 실패: ${e.message}`);
      setData((prev) => prev ? {
        ...prev,
        rows: prev.rows.map((x) => x.id === row.id ? { ...x, excluded: !next, team_id: prevTeam } : x),
      } : prev);
    }
  };

  // ---------- 팀 매칭 실행 + 저장 ----------
  const runMatching = async () => {
    if (!rows.length) return;
    if (matching) return;
    const eligible = rows.filter((r) => !r.excluded);
    const ok = confirm(`매칭 대상 ${eligible.length}명 (배제 ${rows.length - eligible.length}명 제외)을 ${teamCount}개 팀으로 자동 배정합니다.\n기존 팀 배정은 덮어씁니다. 진행할까요?`);
    if (!ok) return;
    setMatching(true);
    setError('');
    try {
      const result = matchTeams(rows, teamCount);
      const { assignments, conflicts } = result;

      // 모두 PATCH (병렬, 세마포어 5)
      const queue = [...assignments];
      const concurrency = 5;
      const results = [];
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length) {
          const item = queue.shift();
          if (!item) break;
          try {
            const r = await fetch(`/api/applications?id=${encodeURIComponent(item.id)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ team_id: item.team_id }),
            });
            results.push({ id: item.id, ok: r.ok });
          } catch {
            results.push({ id: item.id, ok: false });
          }
        }
      });
      await Promise.all(workers);
      const failed = results.filter((x) => !x.ok).length;

      // local state 갱신
      const teamMap = Object.fromEntries(assignments.map((a) => [a.id, a.team_id]));
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => ({ ...x, team_id: teamMap[x.id] ?? x.team_id })) } : prev);
      setView('teams');
      if (conflicts.length || failed) {
        setError(`매칭 완료. ${conflicts.length > 0 ? `지인 2명 이상인 팀 ${conflicts.length}개 (수동 조정 필요). ` : ''}${failed > 0 ? `저장 실패 ${failed}건.` : ''}`);
      }
    } catch (e) {
      setError(`매칭 실행 실패: ${e.message}`);
    } finally {
      setMatching(false);
    }
  };

  const clearTeams = async () => {
    if (!data?.rows?.length) return;
    const ok = confirm('모든 팀 배정을 초기화할까요?');
    if (!ok) return;
    setMatching(true);
    try {
      const queue = data.rows.filter((r) => r.team_id != null).map((r) => r.id);
      const concurrency = 5;
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length) {
          const id = queue.shift();
          if (!id) break;
          await fetch(`/api/applications?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ team_id: null }),
          });
        }
      });
      await Promise.all(workers);
      setData((prev) => prev ? { ...prev, rows: prev.rows.map((x) => ({ ...x, team_id: null })) } : prev);
      setView('list');
    } finally {
      setMatching(false);
    }
  };

  const [deletingId, setDeletingId] = useState(null);
  const handleDelete = async (row) => {
    const ok = confirm(`정말 "${row.name}" (${row.age}세) 지원서를 삭제할까요?\n복구 불가합니다.`);
    if (!ok) return;
    setDeletingId(row.id);
    setError('');
    try {
      const r = await fetch(`/api/applications?id=${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { const t = await r.text(); setError(`삭제 실패 (${r.status}): ${t}`); return; }
      setData((prev) => prev ? { ...prev, rows: prev.rows.filter((x) => x.id !== row.id), count: Math.max(0, (prev.count || prev.rows.length) - 1) } : prev);
    } catch (e) {
      setError(`삭제 요청 실패: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // 지인 마킹은 단일 boolean 이라 컬러 팔레트 불필요. 강조색 하나로 통일.

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="bg-bg-card rounded-2xl p-6 w-full max-w-sm shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
          <h1 className="text-card-ink font-extrabold text-xl mb-2">Admin · 지원자 조회</h1>
          <p className="text-card-ink-faint text-xs mb-4">비밀번호를 입력하세요.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-xl bg-bg-card-hover text-card-ink placeholder:text-card-ink-faint border border-card-border focus:border-bg-primary focus:outline-none mb-3"
            autoFocus
          />
          {error && <p className="text-accent-orange text-xs mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 rounded-xl bg-bg-primary text-white font-extrabold disabled:opacity-50"
          >
            {loading ? '확인 중...' : '조회'}
          </button>
        </form>
      </div>
    );
  }

  const allRows = data.rows || [];
  const SEASON1_CUTOFF = new Date('2026-05-24T15:00:00.000Z'); // 2026-05-25 00:00 KST
  const season0Count = allRows.filter((r) => new Date(r.created_at) < SEASON1_CUTOFF).length;
  const season1Count = allRows.length - season0Count;
  const rows = cohortTab === 'season0'
    ? allRows.filter((r) => new Date(r.created_at) < SEASON1_CUTOFF)
    : cohortTab === 'season1'
      ? allRows.filter((r) => new Date(r.created_at) >= SEASON1_CUTOFF)
      : allRows;
  const teamGroups = {};
  rows.forEach((r) => {
    const t = r.team_id;
    if (t == null) return;
    (teamGroups[t] ??= []).push(r);
  });
  const allTeamIds = Object.keys(teamGroups).map(Number).sort((a, b) => a - b);
  // 팀 목표 인원 = 현재 가장 큰 팀 크기 (매칭이 ceil 분배라 빠진 슬롯이 있으면 max보다 작음)
  const targetTeamSize = allTeamIds.length > 0
    ? Math.max(...allTeamIds.map((tid) => teamGroups[tid].length))
    : 0;
  const isTeamComplete = (tid) => {
    const ms = teamGroups[tid];
    return ms.length >= targetTeamSize && ms.every((m) => m.paid);
  };
  const isTeamUnpaid = (tid) => {
    const ms = teamGroups[tid];
    return ms.length < targetTeamSize || ms.some((m) => !m.paid);
  };
  const teamIds = unpaidOnly
    ? allTeamIds
        .filter(isTeamUnpaid)
        .sort((a, b) => {
          const ma = teamGroups[a];
          const mb = teamGroups[b];
          const missingA = (targetTeamSize - ma.length) + ma.filter((m) => !m.paid).length;
          const missingB = (targetTeamSize - mb.length) + mb.filter((m) => !m.paid).length;
          if (missingB !== missingA) return missingB - missingA;
          return a - b;
        })
    : allTeamIds;
  const unassigned = rows.filter((r) => r.team_id == null);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-text-primary font-extrabold text-2xl">
              지원자 {rows.length}명
              {cohortTab !== 'all' && <span className="text-text-muted text-base font-bold"> / 전체 {allRows.length}</span>}
            </h1>
            <p className="text-text-muted text-xs">
              최신순 정렬 · 새로고침으로 갱신
              {' · '}
              <Link to="/admin/testimonials" className="underline hover:text-text-primary">후기 관리 →</Link>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchData(token)} className="px-3 py-2 rounded-lg bg-bg-card text-card-ink text-xs font-bold hover:bg-bg-card-hover">
              새로고침
            </button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-transparent border border-white/30 text-text-muted text-xs font-bold hover:text-text-primary">
              로그아웃
            </button>
          </div>
        </div>

        {/* 코호트 탭 — 5/25 KST 기준 분할 */}
        <div className="flex gap-1 bg-bg-card rounded-xl p-1 mb-4 w-fit">
          {[
            { key: 'season1', label: '시즌1', count: season1Count },
            { key: 'season0', label: '260504_team_run', count: season0Count },
            { key: 'all', label: '전체', count: allRows.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setCohortTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${cohortTab === key ? 'bg-bg-primary text-white' : 'text-card-ink-muted hover:text-card-ink'}`}
            >
              {label} <span className="tabular-nums opacity-80">{count}</span>
            </button>
          ))}
        </div>

        {/* 팀 매칭 툴바 */}
        <div className="bg-bg-card rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-card-ink-faint text-xs font-bold">팀 수</label>
            <input
              type="number"
              min={2}
              max={50}
              value={teamCount}
              onChange={(e) => setTeamCount(Math.max(2, Math.min(50, parseInt(e.target.value, 10) || 2)))}
              className="w-16 px-2 py-1.5 rounded-lg bg-bg-card-hover text-card-ink text-sm font-bold border border-card-border focus:border-bg-primary focus:outline-none tabular-nums"
            />
            <span className="text-card-ink-faint text-xs">개 (≈{Math.ceil(rows.length / teamCount)}명/팀)</span>
          </div>
          <button
            onClick={runMatching}
            disabled={matching || rows.length === 0}
            className="px-4 py-2 rounded-lg bg-bg-primary text-white text-sm font-extrabold hover:brightness-110 disabled:opacity-50"
          >
            {matching ? '매칭 중...' : '🎯 팀 매칭 실행'}
          </button>
          <button
            onClick={clearTeams}
            disabled={matching}
            className="px-3 py-2 rounded-lg bg-transparent border border-white/30 text-text-muted text-xs font-bold hover:text-accent-orange hover:border-accent-orange disabled:opacity-50"
          >
            팀 초기화
          </button>
          <div className="ml-auto flex gap-1 bg-bg-card-hover rounded-lg p-1">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-bold ${view === 'list' ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}>전체 목록</button>
            <button onClick={() => setView('teams')} className={`px-3 py-1.5 rounded-md text-xs font-bold ${view === 'teams' ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}>팀별 보기</button>
          </div>
        </div>

        {/* 진행도 — 팀 배정된 인원 기준 입금/자소 완료율 */}
        {(() => {
          const assigned = rows.filter((r) => r.team_id != null);
          if (assigned.length === 0) return null;
          const paid = assigned.filter((r) => r.paid).length;
          const intro = assigned.filter((r) => r.intro_done).length;
          const paidPct = Math.round((paid / assigned.length) * 100);
          const introPct = Math.round((intro / assigned.length) * 100);
          return (
            <div className="bg-bg-card rounded-2xl p-4 mb-4 space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-card-ink font-extrabold text-sm">💰 입금</span>
                  <span className="text-card-ink-muted text-xs font-bold tabular-nums">
                    <span className="text-bg-primary text-base">{paid}</span> / {assigned.length}명 ({paidPct}%)
                  </span>
                </div>
                <div className="h-2 bg-bg-card-hover rounded-full overflow-hidden">
                  <div className="h-full bg-bg-primary transition-[width] duration-300" style={{ width: `${paidPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-card-ink font-extrabold text-sm">🙋 자기소개</span>
                  <span className="text-card-ink-muted text-xs font-bold tabular-nums">
                    <span className="text-bg-primary text-base">{intro}</span> / {assigned.length}명 ({introPct}%)
                  </span>
                </div>
                <div className="h-2 bg-bg-card-hover rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green transition-[width] duration-300" style={{ width: `${introPct}%` }} />
                </div>
              </div>
            </div>
          );
        })()}

        {error && <p className="text-accent-orange text-sm mb-4">{error}</p>}

        {rows.length === 0 ? (
          <div className="bg-bg-card rounded-2xl p-8 text-center">
            <p className="text-card-ink-muted">아직 지원자 없음</p>
          </div>
        ) : view === 'teams' ? (
          <div className="space-y-6">
            {allTeamIds.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-2 -mt-2">
                <div className="text-card-ink-faint text-xs">
                  {unpaidOnly
                    ? `미완료 팀 ${teamIds.length}개 (미입금/빈자리 많은 순)`
                    : `전체 ${allTeamIds.length}개 팀 · 목표 ${targetTeamSize}명/팀`}
                </div>
                <button
                  onClick={() => setUnpaidOnly((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${unpaidOnly ? 'bg-accent-orange text-white' : 'bg-bg-card text-card-ink-muted hover:text-card-ink border border-card-border'}`}
                >
                  {unpaidOnly ? '✓ 미완료 팀만' : '미완료 팀만 보기'}
                </button>
              </div>
            )}
            {teamIds.length === 0 && allTeamIds.length === 0 && (
              <div className="bg-bg-card rounded-2xl p-6 text-center">
                <p className="text-card-ink-muted text-sm">아직 팀 배정이 안 됐습니다. "팀 매칭 실행" 버튼을 눌러주세요.</p>
              </div>
            )}
            {teamIds.length === 0 && allTeamIds.length > 0 && unpaidOnly && (
              <div className="bg-accent-green/10 rounded-2xl p-6 text-center">
                <p className="text-accent-green text-sm font-extrabold">🎉 모든 팀 완료 (정원 충족 + 전원 입금)</p>
              </div>
            )}
            {teamIds.map((tid) => {
              const members = teamGroups[tid];
              const avgSkill = members.reduce((s, m) => s + (SKILL_SCORE[m.running_exp] ?? 0), 0) / members.length;
              const complete = isTeamComplete(tid);
              const missingSlots = Math.max(0, targetTeamSize - members.length);
              return (
                <div
                  key={tid}
                  className="rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  style={complete
                    ? { background: 'rgba(200, 255, 77, 0.22)', boxShadow: '0 0 0 2px rgba(200, 255, 77, 0.55), 0 8px 24px rgba(0,0,0,0.12)' }
                    : { background: 'var(--color-bg-card)' }}
                >
                  <div
                    className="flex items-baseline justify-between mb-3 pb-2 border-b flex-wrap gap-2"
                    style={{ borderColor: complete ? 'rgba(200, 255, 77, 0.45)' : 'var(--color-card-border)' }}
                  >
                    <h2 className="font-extrabold text-lg flex items-center gap-2" style={{ color: complete ? 'var(--color-accent-green)' : 'var(--color-card-ink)' }}>
                      팀 {teamLabel(tid)}
                      {complete && (
                        <span
                          className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(200, 255, 77, 0.35)', color: '#1a2a00' }}
                        >
                          💰 전원 입금
                        </span>
                      )}
                      {missingSlots > 0 && (
                        <span
                          className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255, 140, 0, 0.18)', color: '#b85c00' }}
                        >
                          빈 자리 {missingSlots}
                        </span>
                      )}
                    </h2>
                    <span className="text-card-ink-faint text-xs">
                      {members.length}명 · 실력 {avgSkill.toFixed(1)} ·
                      {' '}남 {members.filter((m) => effectiveGender(m) === 'M').length}
                      {' / '}여 {members.filter((m) => effectiveGender(m) === 'F').length}
                      {members.some((m) => !effectiveGender(m)) && ` / ? ${members.filter((m) => !effectiveGender(m)).length}`}
                      {' · '}<span className={members.every((m) => m.paid) ? 'text-accent-green font-bold' : ''}>💰 {members.filter((m) => m.paid).length}/{members.length}</span>
                      {' · '}<span className={members.every((m) => m.intro_done) ? 'text-accent-green font-bold' : ''}>🙋 {members.filter((m) => m.intro_done).length}/{members.length}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-bg-card-hover">
                       <div className="flex items-center gap-3">
                        <ApplicantAvatar name={m.name} instagram={m.instagram} size={36} className="text-[12px]" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-card-ink font-bold text-sm">{m.name}</span>
                            {(() => {
                              const eff = effectiveGender(m);
                              const isManual = !!m.gender;
                              if (!eff) {
                                return (
                                  <button
                                    onClick={() => cycleGender(m)}
                                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-bg-card text-card-ink-faint border border-card-border hover:text-card-ink"
                                    title="클릭해서 성별 지정"
                                  >
                                    ? 성별
                                  </button>
                                );
                              }
                              const tone = eff === 'M'
                                ? { bg: 'rgba(59, 130, 246, 0.18)', fg: '#1d4ed8' }
                                : { bg: 'rgba(236, 72, 153, 0.18)', fg: '#be185d' };
                              return (
                                <button
                                  onClick={() => cycleGender(m)}
                                  className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
                                  style={{ background: tone.bg, color: tone.fg }}
                                  title={`${isManual ? '수동' : '추정'} · 클릭해서 변경`}
                                >
                                  {GENDER_LABEL[eff]}{isManual ? '' : '·추정'}
                                </button>
                              );
                            })()}
                            <span className="text-card-ink-faint text-xs">{m.age}세 · {m.region}</span>
                            <span className="text-card-ink-muted text-xs">· {RUN_LABELS[m.running_exp] || m.running_exp}</span>
                            {m.is_acquaintance && <span className="text-accent-green text-xs font-bold" title="내 지인">⭐</span>}
                            <button
                              onClick={() => editingMemoId === m.id ? cancelEditMemo() : startEditMemo(m)}
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full transition-colors"
                              style={m.memo
                                ? { background: 'rgba(255, 200, 50, 0.25)', color: '#8a6a00' }
                                : { background: 'transparent', color: 'var(--color-card-ink-faint)' }}
                              title={m.memo ? '메모 수정' : '메모 추가'}
                            >
                              📝 {m.memo ? '메모' : '＋'}
                            </button>
                          </div>
                          {normalizeInstagram(m.instagram) && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs flex-wrap">
                              <span className="text-card-ink-muted font-mono select-all">@{normalizeInstagram(m.instagram)}</span>
                              <button
                                type="button"
                                onClick={() => copyHandle(m.instagram)}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${copiedId === normalizeInstagram(m.instagram) ? 'bg-accent-green text-bg-primary' : 'bg-bg-card text-card-ink-muted hover:text-card-ink'}`}
                                title="인스타 핸들 복사"
                              >
                                {copiedId === normalizeInstagram(m.instagram) ? '✓' : '📋'}
                              </button>
                              <a
                                href={igDmUrl(m.instagram)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-bg-primary/15 text-bg-primary text-[10px] font-extrabold hover:bg-bg-primary/25"
                                title="DM 보내기 (막혀있으면 프로필 사용)"
                              >
                                💬
                              </a>
                              <a
                                href={igProfileUrl(m.instagram)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 text-[10px] font-extrabold hover:bg-pink-500/25"
                                title="프로필로 이동"
                              >
                                📷
                              </a>
                            </div>
                          )}
                        </div>
                        {/* 우측 — 체크박스 + 팀 빼기 */}
                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          <label className="flex items-center gap-1.5 text-[12px] font-extrabold text-card-ink cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!m.paid}
                              onChange={() => toggleFlag(m, 'paid')}
                              className="w-4 h-4 rounded accent-bg-primary cursor-pointer"
                            />
                            <span className={m.paid ? 'text-bg-primary' : 'text-card-ink-muted'}>입금</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-[12px] font-extrabold text-card-ink cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!m.intro_done}
                              onChange={() => toggleFlag(m, 'intro_done')}
                              className="w-4 h-4 rounded accent-bg-primary cursor-pointer"
                            />
                            <span className={m.intro_done ? 'text-bg-primary' : 'text-card-ink-muted'}>자소</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => assignTeam(m, null)}
                            className="text-card-ink-faint hover:text-accent-orange text-[10px] font-bold mt-0.5"
                            title="팀에서 빼기"
                          >
                            × 팀 빼기
                          </button>
                        </div>
                       </div>
                       {/* 메모 영역 — 편집 중이거나 메모 있을 때만 */}
                       {editingMemoId === m.id ? (
                         <div className="rounded-lg p-2" style={{ background: 'rgba(255, 200, 50, 0.1)', border: '1px solid rgba(255, 200, 50, 0.3)' }}>
                           <textarea
                             value={memoDraft}
                             onChange={(e) => setMemoDraft(e.target.value)}
                             onKeyDown={(e) => {
                               if (e.key === 'Escape') cancelEditMemo();
                               if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveMemo(m);
                             }}
                             autoFocus
                             rows={2}
                             disabled={memoSavingId === m.id}
                             placeholder="메모 (Cmd+Enter 저장, Esc 취소)"
                             className="w-full px-2 py-1.5 rounded bg-bg-card text-card-ink text-xs border border-card-border focus:border-bg-primary focus:outline-none resize-y"
                           />
                           <div className="flex gap-2 justify-end mt-1.5">
                             <button onClick={cancelEditMemo} disabled={memoSavingId === m.id} className="px-2 py-0.5 rounded text-card-ink-faint text-[11px] font-bold hover:text-accent-orange">취소</button>
                             <button onClick={() => saveMemo(m)} disabled={memoSavingId === m.id} className="px-2 py-0.5 rounded bg-bg-primary text-white text-[11px] font-extrabold disabled:opacity-50">{memoSavingId === m.id ? '⋯' : '저장'}</button>
                           </div>
                         </div>
                       ) : m.memo ? (
                         <button
                           onClick={() => startEditMemo(m)}
                           className="text-left rounded-lg px-2 py-1.5 hover:opacity-80 transition-opacity"
                           style={{ background: 'rgba(255, 200, 50, 0.1)', border: '1px solid rgba(255, 200, 50, 0.25)' }}
                           title="클릭해서 수정"
                         >
                           <p className="text-xs whitespace-pre-line" style={{ color: '#8a6a00' }}>{m.memo}</p>
                         </button>
                       ) : null}
                      </div>
                    ))}
                    {/* 빈 슬롯 — 미배정 인원을 여기로 끌어올 수 있게 select 제공 */}
                    {Array.from({ length: missingSlots }, (_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed"
                        style={{ borderColor: 'rgba(255, 140, 0, 0.35)', background: 'rgba(255, 140, 0, 0.05)' }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(255, 140, 0, 0.15)', color: '#b85c00' }}
                        >
                          <span className="text-lg font-extrabold">?</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold" style={{ color: '#b85c00' }}>빈 자리</p>
                          <p className="text-[11px]" style={{ color: 'rgba(184, 92, 0, 0.7)' }}>미배정 지원자를 이 팀에 배정하세요</p>
                        </div>
                        {unassigned.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              const uid = e.target.value;
                              if (!uid) return;
                              const u = unassigned.find((x) => x.id === uid);
                              if (u) assignTeam(u, tid);
                              e.target.value = '';
                            }}
                            className="bg-bg-card text-card-ink text-xs font-bold px-2 py-1 rounded-lg border border-card-border focus:border-bg-primary focus:outline-none shrink-0"
                          >
                            <option value="">＋ 배정 →</option>
                            {unassigned.map((u) => (
                              <option key={u.id} value={u.id}>{u.name} ({u.age}, {RUN_LABELS[u.running_exp] || u.running_exp})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {unassigned.length > 0 && (
              <div className="bg-bg-card rounded-2xl p-4 border-l-4 border-accent-orange">
                <h2 className="text-accent-orange font-extrabold text-sm mb-3">미배정 {unassigned.length}명</h2>
                <div className="space-y-2">
                  {unassigned.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-card-hover">
                      <ApplicantAvatar name={u.name} instagram={u.instagram} size={32} className="text-[11px]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-card-ink font-bold text-sm">{u.name}</span>
                          <span className="text-card-ink-faint text-xs">{u.age}세 · {u.region}</span>
                          <span className="text-card-ink-muted text-xs">· {RUN_LABELS[u.running_exp] || u.running_exp}</span>
                          {u.is_acquaintance && <span className="text-accent-green text-xs font-bold">⭐</span>}
                        </div>
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) return;
                          assignTeam(u, parseInt(v, 10));
                          e.target.value = '';
                        }}
                        className="bg-bg-card text-card-ink text-xs font-bold px-2 py-1 rounded-lg border border-card-border focus:border-bg-primary focus:outline-none"
                      >
                        <option value="">팀 배정 →</option>
                        {Array.from({ length: teamCount }, (_, i) => i + 1).map((tid) => (
                          <option key={tid} value={tid}>팀 {teamLabel(tid)}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className={`bg-bg-card rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] relative ${r.excluded ? 'opacity-60' : ''}`}>
                <button
                  onClick={() => handleDelete(r)}
                  disabled={deletingId === r.id}
                  title="이 지원서 삭제"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-card-ink-faint hover:bg-accent-orange/15 hover:text-accent-orange transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {deletingId === r.id ? '⋯' : '×'}
                </button>
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2 pr-10">
                  <div className="flex items-center gap-3">
                    <ApplicantAvatar name={r.name} instagram={r.instagram} size={44} className="text-sm" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-card-ink font-extrabold text-lg leading-tight">{r.name}</span>
                        {normalizeInstagram(r.instagram) && (
                          <>
                            <a
                              href={igDmUrl(r.instagram)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-primary/15 text-bg-primary text-[10px] font-extrabold tracking-wider hover:bg-bg-primary/25 transition-colors"
                              title={`${normalizeInstagram(r.instagram)}에게 DM (DM 막혀있으면 프로필 사용)`}
                            >
                              💬 DM
                            </a>
                            <a
                              href={igProfileUrl(r.instagram)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 text-[10px] font-extrabold tracking-wider hover:bg-pink-500/25 transition-colors"
                              title="프로필로 이동 (DM 막혀있어도 항상 작동)"
                            >
                              📷 프로필
                            </a>
                            <button
                              type="button"
                              onClick={() => copyHandle(r.instagram)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors ${copiedId === normalizeInstagram(r.instagram) ? 'bg-accent-green text-bg-primary' : 'bg-bg-card-hover text-card-ink-muted hover:text-card-ink'}`}
                              title="인스타 핸들 복사"
                            >
                              {copiedId === normalizeInstagram(r.instagram) ? '✓ 복사됨' : '📋 복사'}
                            </button>
                          </>
                        )}
                        {r.team_id != null && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bg-primary/20 text-bg-primary text-[10px] font-extrabold tracking-wider">
                            팀 {teamLabel(r.team_id)}
                          </span>
                        )}
                        {r.referrer_name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange text-[10px] font-extrabold tracking-wider">
                            REF · {r.referrer_name}
                          </span>
                        )}
                      </div>
                      <span className="text-card-ink-faint text-sm">{r.age}세 · {r.region}</span>
                    </div>
                  </div>
                  <span className="text-card-ink-faint text-xs">{fmtDate(r.created_at)}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-card-ink-muted mb-3">
                  <div><span className="text-card-ink-faint">📞</span> <a href={`tel:${r.phone}`} className="underline hover:text-bg-primary">{r.phone}</a></div>
                  <div><span className="text-card-ink-faint">직업</span> {r.job}</div>
                  <div><span className="text-card-ink-faint">러닝</span> {RUN_LABELS[r.running_exp] || r.running_exp}</div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-card-ink-faint shrink-0">IG</span>
                    {editingIgId === r.id ? (
                      <>
                        <input
                          type="text"
                          autoFocus
                          value={igDraft}
                          onChange={(e) => setIgDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveIg(r); else if (e.key === 'Escape') cancelEditIg(); }}
                          placeholder="@아이디"
                          disabled={igSavingId === r.id}
                          className="flex-1 min-w-0 px-2 py-0.5 rounded bg-bg-card-hover text-card-ink text-xs border border-bg-primary/40 focus:border-bg-primary focus:outline-none"
                        />
                        <button onClick={() => saveIg(r)} disabled={igSavingId === r.id} className="text-bg-primary text-xs font-extrabold px-1 hover:opacity-70 disabled:opacity-40" title="저장 (Enter)">{igSavingId === r.id ? '⋯' : '✓'}</button>
                        <button onClick={cancelEditIg} disabled={igSavingId === r.id} className="text-card-ink-faint text-xs px-1 hover:text-accent-orange" title="취소 (Esc)">×</button>
                      </>
                    ) : (
                      <button onClick={() => startEditIg(r)} className="text-left truncate hover:text-bg-primary hover:underline cursor-pointer" title="클릭해서 수정">
                        {normalizeInstagram(r.instagram) || r.instagram || <span className="text-card-ink-faint italic">＋ 추가</span>}
                      </button>
                    )}
                  </div>
                </div>

                {/* 토글 — 성별 / 지인 / 배제 */}
                <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-card-ink-faint shrink-0">성별</span>
                    {(() => {
                      const eff = effectiveGender(r);
                      const isManual = !!r.gender;
                      const label = eff ? GENDER_LABEL[eff] : '?';
                      const tone = eff === 'M' ? 'bg-blue-500/20 text-blue-300' : eff === 'F' ? 'bg-pink-500/20 text-pink-300' : 'bg-bg-card-hover text-card-ink-faint';
                      return (
                        <button
                          onClick={() => cycleGender(r)}
                          className={`px-3 py-1 rounded-full font-extrabold text-xs transition-colors ${tone}`}
                          title={`클릭해서 변경 (현재: ${isManual ? '수동' : '추정'})`}
                        >
                          {label}{isManual ? '' : '·추정'}
                        </button>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-card-ink-faint shrink-0">내 지인</span>
                    <button
                      onClick={() => toggleAcq(r)}
                      className={`px-3 py-1 rounded-full font-extrabold text-xs transition-colors ${r.is_acquaintance ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30' : 'bg-bg-card-hover text-card-ink-faint hover:text-card-ink'}`}
                      title="클릭해서 토글"
                    >
                      {r.is_acquaintance ? '⭐ O · 지인' : '○ X'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-card-ink-faint shrink-0">팀 배정 배제</span>
                    <button
                      onClick={() => toggleExclude(r)}
                      className={`px-3 py-1 rounded-full font-extrabold text-xs transition-colors ${r.excluded ? 'bg-accent-orange/20 text-accent-orange hover:bg-accent-orange/30' : 'bg-bg-card-hover text-card-ink-faint hover:text-card-ink'}`}
                      title="클릭해서 토글"
                    >
                      {r.excluded ? '🚫 배제됨' : '○ 매칭 대상'}
                    </button>
                  </div>
                </div>

                <div className="bg-bg-card-hover rounded-lg p-3">
                  <p className="text-card-ink-faint text-[10px] font-bold tracking-wider mb-1">동기</p>
                  <p className="text-card-ink-muted text-sm whitespace-pre-line">{r.motivation}</p>
                </div>
                {/* 메모 */}
                <div className="mt-2 rounded-lg p-3" style={{ background: 'rgba(255, 200, 50, 0.08)', border: '1px solid rgba(255, 200, 50, 0.25)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold tracking-wider" style={{ color: '#b8860b' }}>📝 메모</p>
                    {editingMemoId !== r.id && (
                      <button
                        onClick={() => startEditMemo(r)}
                        className="text-[10px] font-extrabold text-card-ink-faint hover:text-bg-primary"
                      >
                        {r.memo ? '수정' : '＋ 추가'}
                      </button>
                    )}
                  </div>
                  {editingMemoId === r.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={memoDraft}
                        onChange={(e) => setMemoDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') cancelEditMemo();
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveMemo(r);
                        }}
                        autoFocus
                        rows={3}
                        disabled={memoSavingId === r.id}
                        placeholder="이 지원자에 대한 메모 (Cmd+Enter 저장, Esc 취소)"
                        className="w-full px-3 py-2 rounded-lg bg-bg-card text-card-ink text-sm border border-card-border focus:border-bg-primary focus:outline-none resize-y"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEditMemo} disabled={memoSavingId === r.id} className="px-3 py-1 rounded-lg text-card-ink-faint text-xs font-bold hover:text-accent-orange">취소</button>
                        <button onClick={() => saveMemo(r)} disabled={memoSavingId === r.id} className="px-3 py-1 rounded-lg bg-bg-primary text-white text-xs font-extrabold disabled:opacity-50">{memoSavingId === r.id ? '저장 중...' : '저장'}</button>
                      </div>
                    </div>
                  ) : r.memo ? (
                    <p className="text-card-ink-muted text-sm whitespace-pre-line">{r.memo}</p>
                  ) : (
                    <p className="text-card-ink-faint text-xs italic">메모 없음</p>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-[10px] font-bold tracking-wider">
                  <span className={r.agree_deposit ? 'text-bg-primary' : 'text-accent-orange'}>{r.agree_deposit ? '✓' : '✗'} 보증금 동의</span>
                  <span className={r.agree_schedule ? 'text-bg-primary' : 'text-accent-orange'}>{r.agree_schedule ? '✓' : '✗'} 일정 동의</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
