import { useEffect, useState } from 'react';

const TOKEN_KEY = 'admin_token_v1';
const ADMIN_PASSWORD = 'qkffl1000';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

const RUN_LABELS = {
  none: '없음',
  walking: '걷기만',
  run_3km: '3km까지',
  run_5km: '5km까지',
  run_10km: '10km+',
};

export default function AdminApplicationsPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const rows = data.rows || [];
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="text-text-primary font-extrabold text-2xl">지원자 {data.count}명</h1>
            <p className="text-text-muted text-xs">최신순 정렬 · 새로고침으로 갱신</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(token)}
              className="px-3 py-2 rounded-lg bg-bg-card text-card-ink text-xs font-bold hover:bg-bg-card-hover"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-transparent border border-white/30 text-text-muted text-xs font-bold hover:text-text-primary"
            >
              로그아웃
            </button>
          </div>
        </div>

        {error && <p className="text-accent-orange text-sm mb-4">{error}</p>}

        {rows.length === 0 ? (
          <div className="bg-bg-card rounded-2xl p-8 text-center">
            <p className="text-card-ink-muted">아직 지원자 없음</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-bg-card rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-card-ink font-extrabold text-lg">{r.name}</span>
                    <span className="text-card-ink-faint text-sm">{r.age}세 · {r.region}</span>
                  </div>
                  <span className="text-card-ink-faint text-xs">{fmtDate(r.created_at)}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-card-ink-muted mb-3">
                  <div><span className="text-card-ink-faint">📞</span> <a href={`tel:${r.phone}`} className="underline hover:text-bg-primary">{r.phone}</a></div>
                  <div><span className="text-card-ink-faint">직업</span> {r.job}</div>
                  <div><span className="text-card-ink-faint">러닝</span> {RUN_LABELS[r.running_exp] || r.running_exp}</div>
                  <div><span className="text-card-ink-faint">IG</span> {r.instagram || '-'}</div>
                </div>
                <div className="bg-bg-card-hover rounded-lg p-3">
                  <p className="text-card-ink-faint text-[10px] font-bold tracking-wider mb-1">동기</p>
                  <p className="text-card-ink-muted text-sm whitespace-pre-line">{r.motivation}</p>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] font-bold tracking-wider">
                  <span className={r.agree_deposit ? 'text-bg-primary' : 'text-accent-orange'}>
                    {r.agree_deposit ? '✓' : '✗'} 보증금 동의
                  </span>
                  <span className={r.agree_schedule ? 'text-bg-primary' : 'text-accent-orange'}>
                    {r.agree_schedule ? '✓' : '✗'} 일정 동의
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
