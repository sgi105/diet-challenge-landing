import { useEffect, useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { CardByStyle } from './TestimonialCards';
import { getFeedPrompt } from '../../data/feedPrompts';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const INITIAL_COUNT = 6;

function getVersionOverride() {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  return p.get('version') || null;
}

export default function TestimonialSection() {
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState([]);
  const [cardStyle, setCardStyle] = useState('classic');

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    let alive = true;
    (async () => {
      try {
        const headers = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };

        const override = getVersionOverride();
        const versionUrl = override
          ? `${SUPABASE_URL}/rest/v1/landing_versions?name=eq.${encodeURIComponent(override)}&select=*&limit=1`
          : `${SUPABASE_URL}/rest/v1/landing_versions?is_current=eq.true&select=*&limit=1`;
        const vr = await fetch(versionUrl, { headers });
        if (!vr.ok) return;
        const versions = await vr.json();
        const version = versions[0];
        if (!alive || !version) return;
        setCardStyle(version.card_style || 'classic');

        const picksUrl = `${SUPABASE_URL}/rest/v1/landing_testimonial_picks?landing_version_id=eq.${version.id}&order=display_order.asc&select=display_order,social_posts:post_id(id,caption,media_url,like_count,created_at,prompt_set_key,program_day,profiles!social_posts_user_id_fkey(full_name))`;
        const pr = await fetch(picksUrl, { headers });
        if (!pr.ok) return;
        const picks = await pr.json();
        if (!alive) return;

        const postIds = picks.map(p => p.social_posts?.id).filter(Boolean);
        const commentMap = new Map();
        if (postIds.length > 0) {
          const inList = postIds.map(id => `"${id}"`).join(',');
          const cr = await fetch(
            `${SUPABASE_URL}/rest/v1/post_comments?post_id=in.(${inList})&select=post_id`,
            { headers }
          );
          if (cr.ok) {
            const comments = await cr.json();
            for (const c of comments) {
              commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1);
            }
          }
        }

        const mapped = picks
          .map(pk => {
            const p = pk.social_posts;
            if (!p) return null;
            return {
              id: p.id,
              name: p.profiles?.full_name || '익명',
              caption: p.caption || '',
              img: p.media_url || '',
              type: '',
              likes: p.like_count || 0,
              comments: commentMap.get(p.id) || 0,
              highlight: null,
              prompt: getFeedPrompt(p.program_day, p.prompt_set_key) || '',
              programDay: p.program_day || null,
            };
          })
          .filter(Boolean);

        if (alive) setRows(mapped);
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
            <span className="text-accent-green">매일 움직이고 있어.</span>
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            런클럽 실제 인증 피드에서.
          </p>
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
              사진/캡션은 실제 앱 피드 기준. 이름은 익명 처리.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
