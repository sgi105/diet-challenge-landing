import { useEffect, useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { CardByStyle } from './TestimonialCards';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const stats = [
  { value: '30/30', label: '인증 완주율' },
  { value: '20일+', label: '최장 연속 인증' },
  { value: '10팀', label: '3인 × 10팀 운영' },
];

const INITIAL_COUNT = 6;

export default function TestimonialSection() {
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState([]);
  const [cardStyle, setCardStyle] = useState('classic');

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    let alive = true;
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/testimonials?is_selected=eq.true&order=display_order.asc&select=*`, {
            headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/testimonial_settings?id=eq.1&select=*`, {
            headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
          }),
        ]);
        if (!alive) return;
        if (r1.ok) setRows(await r1.json());
        if (r2.ok) {
          const arr = await r2.json();
          if (arr[0]?.card_style) setCardStyle(arr[0].card_style);
        }
      } catch {
        // silent — section just stays empty
      }
    })();
    return () => { alive = false; };
  }, []);

  const visible = expanded ? rows : rows.slice(0, INITIAL_COUNT);
  const hasMore = rows.length > INITIAL_COUNT;

  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">REAL VOICES · 참가자 후기</span>
          <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary">
            한 명도 빠지지 않고<br />
            <span className="text-accent-green">매일 움직이고 있습니다.</span>
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            260504_team_run 30명의 실제 인증 피드에서.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {stats.map((s, i) => (
              <div key={i} className="bg-bg-card rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-card-ink font-extrabold text-xl md:text-2xl leading-none">{s.value}</p>
                <p className="text-card-ink-faint text-[10px] md:text-[11px] mt-1.5 font-bold tracking-wide leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        {rows.length > 0 && (
          <>
            <AnimateOnScroll>
              <div className="flex flex-col gap-4 mb-6">
                {visible.map((t) => (
                  <CardByStyle key={t.id} style={cardStyle} t={t} />
                ))}
              </div>
            </AnimateOnScroll>

            {hasMore && (
              <AnimateOnScroll>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="w-full bg-bg-card text-card-ink font-extrabold py-4 rounded-2xl border border-white/10 hover:border-accent-green/40 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                >
                  {expanded ? '접기' : `후기 더보기 (${rows.length}개 전체 보기)`}
                </button>
              </AnimateOnScroll>
            )}

            <p className="text-text-muted text-[11px] text-center leading-relaxed mt-6">
              사진/캡션은 실제 앱 피드 기준. 이름은 본인 동의 하에 실명 노출.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
