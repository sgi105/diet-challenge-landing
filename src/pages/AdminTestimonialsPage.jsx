import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CARD_STYLES, CardByStyle } from '../components/sections/TestimonialCards';

const TOKEN_KEY = 'admin_token_v1';
const ADMIN_PASSWORD = 'qkffl1000';

const TYPE_OPTIONS = ['', '회의론자→전환', '팀효과', '습관형성', '바쁜일상', '경쟁심리', '초보가능', '미라클모닝'];

export default function AdminTestimonialsPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [rows, setRows] = useState(null);
  const [settings, setSettings] = useState({ card_style: 'classic' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('select'); // select | order | style

  // Filters for "select" tab
  const [filterCohort, setFilterCohort] = useState('');
  const [filterPrompt, setFilterPrompt] = useState('');
  const [sortByLen, setSortByLen] = useState('none'); // none | asc | desc

  // Add modal
  const [showAdd, setShowAdd] = useState(false);

  const fetchAll = async (t) => {
    setLoading(true);
    setError('');
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin-testimonials', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/admin-testimonials?type=settings', { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (r1.status === 401 || r2.status === 401) {
        setError('비밀번호가 틀렸습니다.');
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
        setRows(null);
        return;
      }
      if (!r1.ok) { setError(`목록 조회 실패 (${r1.status}): ${await r1.text()}`); return; }
      if (!r2.ok) { setError(`설정 조회 실패 (${r2.status}): ${await r2.text()}`); return; }
      const j1 = await r1.json();
      const j2 = await r2.json();
      setRows(j1.rows || []);
      setSettings(j2.settings || { card_style: 'classic' });
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch (e) {
      setError(`요청 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token) return;
    if (token !== ADMIN_PASSWORD) {
      setError('비밀번호가 틀렸습니다.');
      return;
    }
    fetchAll(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setRows(null);
  };

  // ── PATCH a row, optimistic ──
  const patchRow = async (id, patch) => {
    setRows((prev) => prev ? prev.map((r) => r.id === id ? { ...r, ...patch } : r) : prev);
    try {
      const r = await fetch(`/api/admin-testimonials?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (!r.ok) {
        const t = await r.text();
        setError(`업데이트 실패 (${r.status}): ${t}`);
        await fetchAll(token);
      }
    } catch (e) {
      setError(`업데이트 요청 실패: ${e.message}`);
      await fetchAll(token);
    }
  };

  const deleteRow = async (row) => {
    if (!confirm(`"${row.name}" 후기를 삭제할까요? (복구 불가)`)) return;
    try {
      const r = await fetch(`/api/admin-testimonials?id=${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { setError(`삭제 실패 (${r.status}): ${await r.text()}`); return; }
      setRows((prev) => prev ? prev.filter((x) => x.id !== row.id) : prev);
    } catch (e) {
      setError(`삭제 요청 실패: ${e.message}`);
    }
  };

  const insertRow = async (data) => {
    try {
      const r = await fetch('/api/admin-testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!r.ok) { setError(`추가 실패 (${r.status}): ${await r.text()}`); return false; }
      await fetchAll(token);
      return true;
    } catch (e) {
      setError(`추가 요청 실패: ${e.message}`);
      return false;
    }
  };

  const updateStyle = async (style) => {
    setSettings((s) => ({ ...s, card_style: style }));
    try {
      const r = await fetch('/api/admin-testimonials?type=settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ card_style: style }),
      });
      if (!r.ok) { setError(`카드 스타일 저장 실패 (${r.status}): ${await r.text()}`); await fetchAll(token); }
    } catch (e) {
      setError(`카드 스타일 요청 실패: ${e.message}`);
      await fetchAll(token);
    }
  };

  // ── derived ──
  const cohortOptions = useMemo(() => {
    if (!rows) return [];
    const s = new Set();
    rows.forEach((r) => { if (r.cohort_code) s.add(r.cohort_code); });
    return Array.from(s).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    let out = rows.slice();
    if (filterCohort) out = out.filter((r) => r.cohort_code === filterCohort);
    if (filterPrompt) {
      const q = filterPrompt.toLowerCase();
      out = out.filter((r) => (r.prompt_text || '').toLowerCase().includes(q));
    }
    if (sortByLen === 'asc') out.sort((a, b) => (a.caption || '').length - (b.caption || '').length);
    else if (sortByLen === 'desc') out.sort((a, b) => (b.caption || '').length - (a.caption || '').length);
    return out;
  }, [rows, filterCohort, filterPrompt, sortByLen]);

  const selectedRows = useMemo(() => {
    if (!rows) return [];
    return rows
      .filter((r) => r.is_selected)
      .slice()
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [rows]);

  // ── order ↑↓ swap display_order ──
  const moveRow = async (idx, dir) => {
    const list = selectedRows;
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx];
    const b = list[target];
    const aOrder = a.display_order || 0;
    const bOrder = b.display_order || 0;
    // optimistic
    setRows((prev) => prev ? prev.map((r) => {
      if (r.id === a.id) return { ...r, display_order: bOrder };
      if (r.id === b.id) return { ...r, display_order: aOrder };
      return r;
    }) : prev);
    try {
      await Promise.all([
        fetch(`/api/admin-testimonials?id=${encodeURIComponent(a.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ display_order: bOrder }),
        }),
        fetch(`/api/admin-testimonials?id=${encodeURIComponent(b.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ display_order: aOrder }),
        }),
      ]);
    } catch (e) {
      setError(`순서 변경 실패: ${e.message}`);
      await fetchAll(token);
    }
  };

  if (rows === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="bg-bg-card rounded-2xl p-6 w-full max-w-sm shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
          <h1 className="text-card-ink font-extrabold text-xl mb-2">Admin · 후기 관리</h1>
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

  const sampleForPreview = selectedRows[0] || rows[0] || {
    name: '샘플',
    caption: '여기는 카드 미리보기입니다. 짧은 본문이지만 실제 후기는 더 길 수 있어요.',
    highlight: ['카드 미리보기'],
    type: '습관형성',
    img: rows[0]?.img || '',
    likes: 12,
    comments: 3,
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-text-primary font-extrabold text-2xl">후기 관리 · {rows.length}개 (선택 {selectedRows.length})</h1>
            <p className="text-text-muted text-xs">
              <Link to="/admin/applications" className="underline hover:text-text-primary">← 지원자 조회</Link>
              {' · '}현재 카드 스타일: <span className="text-bg-primary font-bold">{CARD_STYLES[settings.card_style]?.label || settings.card_style}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchAll(token)} className="px-3 py-2 rounded-lg bg-bg-card text-card-ink text-xs font-bold hover:bg-bg-card-hover">
              새로고침
            </button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-transparent border border-white/30 text-text-muted text-xs font-bold hover:text-text-primary">
              로그아웃
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-bg-card-hover rounded-lg p-1 mb-4 w-fit">
          {[
            ['select', '후기 선택'],
            ['order', '순서'],
            ['style', '카드 스타일'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-md text-xs font-bold ${tab === k ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-accent-orange text-sm mb-4">{error}</p>}

        {tab === 'select' && (
          <div className="space-y-3">
            <div className="bg-bg-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-card-ink-faint text-xs font-bold">코호트</label>
                <select
                  value={filterCohort}
                  onChange={(e) => setFilterCohort(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-bg-card-hover text-card-ink text-xs font-bold border border-card-border focus:border-bg-primary focus:outline-none"
                >
                  <option value="">전체</option>
                  {cohortOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-card-ink-faint text-xs font-bold">프롬프트</label>
                <input
                  type="text"
                  value={filterPrompt}
                  onChange={(e) => setFilterPrompt(e.target.value)}
                  placeholder="검색"
                  className="flex-1 px-2 py-1.5 rounded-lg bg-bg-card-hover text-card-ink text-xs border border-card-border focus:border-bg-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-bg-card-hover rounded-lg p-1">
                <button onClick={() => setSortByLen('none')} className={`px-2 py-1 rounded text-[10px] font-bold ${sortByLen === 'none' ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}>기본</button>
                <button onClick={() => setSortByLen('asc')} className={`px-2 py-1 rounded text-[10px] font-bold ${sortByLen === 'asc' ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}>길이↑</button>
                <button onClick={() => setSortByLen('desc')} className={`px-2 py-1 rounded text-[10px] font-bold ${sortByLen === 'desc' ? 'bg-bg-primary text-white' : 'text-card-ink-muted'}`}>길이↓</button>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-2 rounded-lg bg-accent-green text-bg-primary text-xs font-extrabold hover:brightness-110"
              >
                ＋ 후기 추가
              </button>
            </div>

            <div className="space-y-2">
              {filteredRows.map((r) => (
                <div key={r.id} className="bg-bg-card rounded-xl p-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!r.is_selected}
                    onChange={() => patchRow(r.id, { is_selected: !r.is_selected })}
                    className="w-5 h-5 mt-1 accent-bg-primary cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-card-ink font-extrabold text-sm">{r.name}</span>
                      {r.type && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-bg-card-hover text-card-ink-muted">{r.type}</span>
                      )}
                      {r.cohort_code && (
                        <span className="text-[10px] font-bold text-card-ink-faint">{r.cohort_code}</span>
                      )}
                      <span className="text-[10px] font-bold text-card-ink-faint ml-auto">{r.caption?.length || 0}자</span>
                    </div>
                    <p className="text-card-ink-muted text-[12px] leading-relaxed line-clamp-2">{r.caption}</p>
                  </div>
                  <button
                    onClick={() => deleteRow(r)}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-card-ink-faint hover:bg-accent-orange/15 hover:text-accent-orange transition-colors"
                    title="삭제"
                  >×</button>
                </div>
              ))}
              {filteredRows.length === 0 && (
                <div className="bg-bg-card rounded-xl p-8 text-center text-card-ink-muted text-sm">
                  조건에 맞는 후기가 없습니다.
                </div>
              )}
            </div>

            {showAdd && (
              <AddModal
                onClose={() => setShowAdd(false)}
                onSubmit={async (data) => {
                  const ok = await insertRow(data);
                  if (ok) setShowAdd(false);
                }}
              />
            )}
          </div>
        )}

        {tab === 'order' && (
          <div className="space-y-3">
            <p className="text-text-muted text-xs">선택된 후기 {selectedRows.length}개 · ↑↓ 버튼으로 순서 변경</p>
            <div className="space-y-2">
              {selectedRows.map((r, idx) => (
                <div key={r.id} className="bg-bg-card rounded-xl p-3 flex items-center gap-3">
                  <span className="text-card-ink-faint font-mono text-[11px] w-8 shrink-0">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-card-ink font-extrabold text-sm">{r.name}</span>
                      {r.type && <span className="text-[10px] font-bold text-card-ink-faint">{r.type}</span>}
                    </div>
                    <p className="text-card-ink-muted text-[11px] line-clamp-1">{r.caption}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveRow(idx, -1)}
                      disabled={idx === 0}
                      className="w-7 h-6 rounded bg-bg-card-hover text-card-ink text-xs font-bold hover:bg-bg-primary hover:text-white disabled:opacity-30"
                      title="위로"
                    >↑</button>
                    <button
                      onClick={() => moveRow(idx, 1)}
                      disabled={idx === selectedRows.length - 1}
                      className="w-7 h-6 rounded bg-bg-card-hover text-card-ink text-xs font-bold hover:bg-bg-primary hover:text-white disabled:opacity-30"
                      title="아래로"
                    >↓</button>
                  </div>
                </div>
              ))}
              {selectedRows.length === 0 && (
                <div className="bg-bg-card rounded-xl p-8 text-center text-card-ink-muted text-sm">
                  선택된 후기가 없습니다. "후기 선택" 탭에서 체크하세요.
                </div>
              )}
            </div>

            {selectedRows.length > 0 && (
              <div className="bg-bg-card rounded-2xl p-4 mt-6">
                <p className="text-card-ink-faint text-[10px] font-bold tracking-wider mb-3">미리보기 (현재 카드 스타일)</p>
                <CardByStyle style={settings.card_style} t={selectedRows[0]} />
              </div>
            )}
          </div>
        )}

        {tab === 'style' && (
          <div className="space-y-4">
            <p className="text-text-muted text-xs">랜딩 후기 섹션 전체에 적용됩니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CARD_STYLES).map(([key, def]) => (
                <label
                  key={key}
                  className={`block bg-bg-card rounded-2xl p-4 cursor-pointer transition-all ${settings.card_style === key ? 'ring-2 ring-bg-primary' : 'hover:bg-bg-card-hover'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      name="card_style"
                      checked={settings.card_style === key}
                      onChange={() => updateStyle(key)}
                      className="w-4 h-4 accent-bg-primary"
                    />
                    <div>
                      <p className="text-card-ink font-extrabold text-sm">{def.label}</p>
                      <p className="text-card-ink-faint text-xs">{def.desc}</p>
                    </div>
                  </div>
                  <div className="bg-bg-card-hover rounded-xl p-3">
                    <CardByStyle style={key} t={sampleForPreview} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    caption: '',
    highlight: '',
    cohort_code: '260504_team_run',
    prompt_text: '',
    img: '',
    likes: 0,
    comments: 0,
    is_selected: true,
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.caption.trim()) return;
    setBusy(true);
    const data = {
      name: form.name.trim(),
      type: form.type || null,
      caption: form.caption.trim(),
      highlight: form.highlight ? form.highlight.split(',').map((s) => s.trim()).filter(Boolean) : [],
      cohort_code: form.cohort_code.trim() || null,
      prompt_text: form.prompt_text.trim() || null,
      img: form.img.trim() || null,
      likes: parseInt(form.likes, 10) || 0,
      comments: parseInt(form.comments, 10) || 0,
      is_selected: !!form.is_selected,
    };
    await onSubmit(data);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-8 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl p-6 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.4)] my-auto">
        <h2 className="text-card-ink font-extrabold text-lg mb-4">＋ 후기 추가</h2>
        <div className="space-y-3">
          <Field label="이름 *">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
          </Field>
          <Field label="유형">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t || '(없음)'}</option>)}
            </select>
          </Field>
          <Field label="본문 *">
            <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className={inputCls} rows={4} required />
          </Field>
          <Field label="강조 (콤마 분리)">
            <input type="text" value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} className={inputCls} placeholder="강조1, 강조2" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="코호트">
              <input type="text" value={form.cohort_code} onChange={(e) => setForm({ ...form, cohort_code: e.target.value })} className={inputCls} />
            </Field>
            <Field label="프롬프트">
              <input type="text" value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="이미지 URL">
            <input type="text" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="좋아요">
              <input type="number" value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} className={inputCls} />
            </Field>
            <Field label="댓글">
              <input type="number" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-card-ink text-sm">
            <input type="checkbox" checked={form.is_selected} onChange={(e) => setForm({ ...form, is_selected: e.target.checked })} className="w-4 h-4 accent-bg-primary" />
            추가하자마자 선택 (랜딩 노출)
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 rounded-lg text-card-ink-faint text-sm font-bold hover:text-accent-orange">취소</button>
          <button type="submit" disabled={busy || !form.name.trim() || !form.caption.trim()} className="px-4 py-2 rounded-lg bg-bg-primary text-white text-sm font-extrabold disabled:opacity-40">
            {busy ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-bg-card-hover text-card-ink text-sm border border-card-border focus:border-bg-primary focus:outline-none';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-card-ink-faint text-[11px] font-bold mb-1">{label}</label>
      {children}
    </div>
  );
}
