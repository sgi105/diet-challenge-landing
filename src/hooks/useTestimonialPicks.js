import { useEffect, useState } from 'react';
import { getFeedPrompt } from '../data/feedPrompts';
import { extractHighlights } from '../lib/highlightCaption';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const EMPTY = { rows: [], photoRows: [], cardStyle: 'classic' };

function getVersionOverride() {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  return p.get('version') || null;
}

function deriveLogType(ms) {
  if (!ms) return null;
  if (ms.exercise_km || ms.exercise_secs) return 'running';
  if (ms.pullup_reps) return 'pullup';
  if (ms.pushup_reps) return 'pushup';
  if (ms.squat_reps) return 'squat';
  if (ms.weight != null) return 'weight';
  return null;
}

async function fetchAll() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return EMPTY;
  const headers = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };

  const override = getVersionOverride();
  const versionUrl = override
    ? `${SUPABASE_URL}/rest/v1/landing_versions?name=eq.${encodeURIComponent(override)}&select=*&limit=1`
    : `${SUPABASE_URL}/rest/v1/landing_versions?is_current=eq.true&select=*&limit=1`;
  const vr = await fetch(versionUrl, { headers });
  if (!vr.ok) return EMPTY;
  const versions = await vr.json();
  const version = versions[0];
  if (!version) return EMPTY;
  const cardStyle = version.card_style || 'classic';

  const picksUrl = `${SUPABASE_URL}/rest/v1/landing_testimonial_picks?landing_version_id=eq.${version.id}&order=display_order.asc&select=display_order,highlights,social_posts:post_id(id,caption,media_url,like_count,created_at,prompt_set_key,program_day,mission_stats,profiles!social_posts_user_id_fkey(full_name,avatar_url))`;
  const pr = await fetch(picksUrl, { headers });
  if (!pr.ok) return { ...EMPTY, cardStyle };
  const picks = await pr.json();

  const postIds = picks.map((p) => p.social_posts?.id).filter(Boolean);
  const commentMap = new Map();
  if (postIds.length > 0) {
    const inList = postIds.map((id) => `"${id}"`).join(',');
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

  const rows = [];
  const photoRows = [];
  for (const pk of picks) {
    const p = pk.social_posts;
    if (!p) continue;
    const fullName = p.profiles?.full_name || '익명';
    const initial = fullName.charAt(0) || '★';
    const ms = p.mission_stats || {};
    const km = Number.isFinite(Number(ms.exercise_km)) ? Number(ms.exercise_km) : null;
    const dur = Number.isFinite(Number(ms.exercise_secs)) ? Number(ms.exercise_secs) : null;
    const dateStr = p.created_at ? p.created_at.slice(0, 10) : null;

    rows.push({
      id: p.id,
      name: fullName,
      caption: p.caption || '',
      img: p.media_url || '',
      type: '',
      likes: p.like_count || 0,
      comments: commentMap.get(p.id) || 0,
      highlight: (Array.isArray(pk.highlights) && pk.highlights.length > 0)
        ? pk.highlights
        : extractHighlights(p.caption || ''),
      prompt: getFeedPrompt(p.program_day, p.prompt_set_key) || '',
      programDay: p.program_day || null,
    });

    photoRows.push({
      id: p.id,
      photo_url: p.media_url || '',
      user_initial: initial,
      avatar_url: p.profiles?.avatar_url || null,
      distance_km: km && km > 0 ? km : null,
      duration_sec: dur && dur > 0 ? dur : null,
      pace_sec_per_km: km && km > 0 && dur && dur > 0 ? Math.round(dur / km) : null,
      date: dateStr,
      likes: p.like_count || 0,
      log_type: deriveLogType(ms),
    });
  }

  return { rows, photoRows, cardStyle };
}

let cachedPromise = null;

export function useTestimonialPicks() {
  const [state, setState] = useState(EMPTY);
  useEffect(() => {
    let alive = true;
    if (!cachedPromise) {
      cachedPromise = fetchAll().catch(() => EMPTY);
    }
    cachedPromise.then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
