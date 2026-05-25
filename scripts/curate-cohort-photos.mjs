#!/usr/bin/env node
// 시즌0 (260504_team_run) 인증 사진 큐레이션
//
// 1) cohort_memberships → 30명 user_id + name + avatar
// 2) mission_logs.photo_url + numeric_value + duration_secs + logged_at
// 3) social_posts → daily_mission_id + post_likes(count) 으로 좋아요 매핑
// 4) 후보 정렬 (좋아요 + 사용자당 상한) → vision 검사 batch (gpt-4o-mini)
// 5) yes 만 추리고 다양성 적용 (한 사람당 최대 2장) → 최종 12장
// 6) src/data/season0-photos.json 저장
//
// Usage:
//   OPENAI_API_KEY=... node --env-file=.env.local scripts/curate-cohort-photos.mjs

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SR = process.env.SUPABASE_SERVICE_ROLE;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!SUPABASE_URL || !SR) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  process.exit(1);
}
if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const COHORT_ID = 'cf14f8e6-6c3f-4c3f-9837-14a714a0233c';
const DAY1 = '2026-05-04';
const DAY21_END = '2026-05-25';
const PER_USER_CANDIDATE_LIMIT = 999; // 후보 단계 사용자당 사실상 무제한 (likes 정렬은 유지)
const VISION_MODEL = 'gpt-4o-mini';   // 비용 절감용 vision 가능 모델
const FINAL_COUNT = 12;
const PER_USER_FINAL_CAP = 2;         // 최종 12장에서 한 사람당 최대 2장

const H = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

async function rest(p) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${p}`, { headers: H });
  if (!res.ok) throw new Error(`REST ${p} → ${res.status}: ${await res.text()}`);
  return res.json();
}

function inFilter(ids) {
  return `(${ids.map(id => `"${id}"`).join(',')})`;
}

function initialOf(name) {
  if (!name) return '★';
  const s = name.trim();
  return s.length ? s[0] : '★';
}

// ---- 1) 멤버 ----
const memberships = await rest(
  `cohort_memberships?cohort_id=eq.${COHORT_ID}&status=eq.active&select=user_id,profiles(id,full_name,avatar_url)`
);
const members = memberships.map((m) => ({
  id: m.user_id,
  initial: initialOf(m.profiles?.full_name),
  avatar_url: m.profiles?.avatar_url || null,
}));
const userIds = members.map((m) => m.id);
const memberById = Object.fromEntries(members.map((m) => [m.id, m]));
console.log(`[1] members: ${members.length}`);

// ---- 2) mission_logs ----
// 발리 시즌0 21일 + 1일 margin
const logsStart = `${DAY1}T00:00:00Z`;
const logsEnd = `${DAY21_END}T23:59:59Z`;
const rawLogs = await rest(
  `mission_logs?user_id=in.${inFilter(userIds)}` +
    `&logged_at=gte.${encodeURIComponent(logsStart)}` +
    `&logged_at=lte.${encodeURIComponent(logsEnd)}` +
    `&is_test=eq.false` +
    `&photo_url=not.is.null` +
    `&select=id,user_id,photo_url,numeric_value,unit,duration_secs,log_type,logged_at,daily_mission_id`
);
const logs = rawLogs.filter((l) => l.photo_url && l.photo_url.startsWith('http'));
console.log(`[2] mission_logs with photo: ${logs.length}`);

// ---- 3) social_posts → likes ----
// daily_mission_id 로 daily_missions 의 user_id+date 매핑 가능. 여기서는 user_id + 같은 KST date 로 join.
const posts = await rest(
  `social_posts?user_id=in.${inFilter(userIds)}` +
    `&created_at=gte.${encodeURIComponent(logsStart)}` +
    `&created_at=lte.${encodeURIComponent(logsEnd)}` +
    `&select=id,user_id,daily_mission_id,media_url,created_at,post_likes(count)`
);
console.log(`[3] social_posts: ${posts.length}`);

// daily_mission_id → likes
const likesByDM = {};
const postsByMediaUrl = {};
for (const p of posts) {
  const likes = p.post_likes?.[0]?.count ?? 0;
  if (p.daily_mission_id) {
    likesByDM[p.daily_mission_id] = Math.max(likesByDM[p.daily_mission_id] ?? 0, likes);
  }
  if (p.media_url) {
    postsByMediaUrl[p.media_url] = Math.max(postsByMediaUrl[p.media_url] ?? 0, likes);
  }
}

// 후보 생성 + 좋아요 매핑
const candidatesRaw = logs.map((l) => {
  const likes =
    (l.daily_mission_id ? likesByDM[l.daily_mission_id] : 0) ||
    postsByMediaUrl[l.photo_url] ||
    0;
  const km =
    l.unit === 'km' && Number.isFinite(Number(l.numeric_value))
      ? Number(l.numeric_value)
      : null;
  const dur = Number.isFinite(Number(l.duration_secs)) ? Number(l.duration_secs) : null;
  return {
    id: l.id,
    user_id: l.user_id,
    photo_url: l.photo_url,
    distance_km: km,
    duration_sec: dur && dur > 0 ? dur : null,
    pace_sec_per_km: km && km > 0 && dur && dur > 0 ? Math.round(dur / km) : null,
    log_type: l.log_type,
    logged_at: l.logged_at,
    likes,
    user_initial: memberById[l.user_id]?.initial ?? '★',
    avatar_url: memberById[l.user_id]?.avatar_url ?? null,
    date: l.logged_at?.slice(0, 10) ?? null,
  };
});

// 사용자별 좋아요 desc 정렬, 사용자당 PER_USER_CANDIDATE_LIMIT 만 남기기
const byUser = {};
for (const c of candidatesRaw) {
  if (!byUser[c.user_id]) byUser[c.user_id] = [];
  byUser[c.user_id].push(c);
}
const candidates = [];
for (const uid of Object.keys(byUser)) {
  byUser[uid].sort((a, b) => b.likes - a.likes);
  candidates.push(...byUser[uid].slice(0, PER_USER_CANDIDATE_LIMIT));
}
// 전체 좋아요 desc
candidates.sort((a, b) => b.likes - a.likes);
console.log(`[4] vision 후보: ${candidates.length} (사용자별 ≤${PER_USER_CANDIDATE_LIMIT})`);

// ---- 4) vision 분류 ----
// 3단계: face(얼굴/상반신), body(팔/다리/손/발/손목+시계 등 사람 신체 일부), screen(앱/시계 screen만, 풍경, 정물)
const VISION_PROMPT =
  '이 사진을 정확히 한 단어로 분류해.\n' +
  '- "face": 사람의 얼굴 또는 상반신/전신이 보임 (셀카, 인물, 거울사진, 운동 중 인물)\n' +
  '- "body": 얼굴은 안 보이지만 손/팔/다리/발 등 사람 신체 일부가 명확히 보임 (예: 손목+시계 함께)\n' +
  '- "screen": 사람 신체 없음 (앱 화면 캡처, 시계 화면만 클로즈업, 풍경, 음식, 정물, 신발만)\n' +
  '정확히 "face" / "body" / "screen" 중 하나만 답해.';

async function classify(photoUrl) {
  const body = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: VISION_PROMPT },
          { type: 'image_url', image_url: { url: photoUrl, detail: 'low' } },
        ],
      },
    ],
    max_tokens: 5,
    temperature: 0,
  };

  // 최대 5회 재시도 + 지수 backoff (429/5xx 대응)
  let res;
  let lastText = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.ok) break;
    lastText = await res.text();
    const status = res.status;
    if (status !== 429 && status < 500) {
      return { ok: false, reason: `${status} ${lastText.slice(0, 200)}` };
    }
    // 429 또는 5xx → 백오프 (1s, 2s, 4s, 8s, 16s + jitter)
    const wait = (2 ** attempt) * 1000 + Math.floor(Math.random() * 500);
    await new Promise((r) => setTimeout(r, wait));
  }
  if (!res || !res.ok) {
    return { ok: false, reason: `retries exhausted ${res?.status} ${lastText.slice(0, 200)}` };
  }
  const j = await res.json();
  const out = (j.choices?.[0]?.message?.content || '').trim().toLowerCase();
  const usage = j.usage || {};
  let answer = 'screen';
  if (out.startsWith('face')) answer = 'face';
  else if (out.startsWith('body')) answer = 'body';
  else if (out.startsWith('screen')) answer = 'screen';
  return { ok: true, answer, rawAnswer: out, usage };
}

const CONCURRENCY = 3;
const results = new Array(candidates.length);
let processed = 0;
let totalIn = 0;
let totalOut = 0;
let errors = 0;

// 캐시: 이전 debug.json 에서 성공 분류된 결과는 재사용
const DEBUG_PATH = resolve(process.cwd(), 'scripts/.curate-photos-debug.json');
const cache = {};
if (existsSync(DEBUG_PATH)) {
  try {
    const prev = JSON.parse(readFileSync(DEBUG_PATH, 'utf8'));
    for (const r of prev.all || []) {
      if (r && ['face', 'body', 'screen'].includes(r.ai_decision)) {
        cache[r.photo_url] = { decision: r.ai_decision, raw: r.ai_raw };
      }
    }
    console.log(`[cache] reused ${Object.keys(cache).length} prior classifications`);
  } catch (e) {
    console.log(`[cache] skip: ${e.message}`);
  }
}

console.log(`[5] vision 분류 시작 (concurrency=${CONCURRENCY})…`);
// 캐시 hit 은 즉시 results 채우고, 나머지만 큐잉
const toClassify = [];
for (let i = 0; i < candidates.length; i++) {
  const c = candidates[i];
  if (cache[c.photo_url]) {
    results[i] = { ...c, ai_decision: cache[c.photo_url].decision, ai_raw: cache[c.photo_url].raw, cached: true };
    processed++;
  } else {
    toClassify.push(i);
  }
}
console.log(`[5] 캐시 hit ${processed}, 신규 분류 ${toClassify.length}`);

async function workerIdx(workerId) {
  while (toClassify.length > 0) {
    const i = toClassify.shift();
    if (i == null) break;
    const c = candidates[i];
    try {
      const r = await classify(c.photo_url);
      if (!r.ok) {
        errors++;
        results[i] = { ...c, ai_decision: 'error', ai_error: r.reason };
      } else {
        totalIn += r.usage.prompt_tokens || 0;
        totalOut += r.usage.completion_tokens || 0;
        results[i] = { ...c, ai_decision: r.answer, ai_raw: r.rawAnswer };
      }
    } catch (e) {
      errors++;
      results[i] = { ...c, ai_decision: 'error', ai_error: String(e).slice(0, 200) };
    }
    processed++;
    if (processed % 25 === 0) {
      console.log(`  vision ${processed}/${candidates.length} (worker=${workerId})`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, (_, k) => workerIdx(k)));
console.log(
  `[5] vision 완료. face=${results.filter((r) => r.ai_decision === 'face').length} ` +
    `body=${results.filter((r) => r.ai_decision === 'body').length} ` +
    `screen=${results.filter((r) => r.ai_decision === 'screen').length} ` +
    `err=${errors}`
);

// gpt-4o-mini 가격 (2026 기준 추정): input ≈ $0.150 / 1M, output ≈ $0.600 / 1M
// + image low-detail = ~85 토큰 in
const COST_IN_PER_M = 0.15;
const COST_OUT_PER_M = 0.6;
const estimatedCostUsd =
  (totalIn / 1_000_000) * COST_IN_PER_M + (totalOut / 1_000_000) * COST_OUT_PER_M;

// ---- 5) 최종 12장 선별 ----
// 우선순위:
//   1순위: face + 운동(run/pullup/pushup) — 인물+동작
//   2순위: face + weight — 인물+체중
//   3순위: body + 운동 — 신체일부+동작 (러닝화/팔뚝 등)
//   4순위: body + weight — 체중계 위 발 (마지막 fallback)
// 모든 단계 likes desc. 같은 user 는 최대 PER_USER_FINAL_CAP 장.
const allClassified = results.filter((r) =>
  ['face', 'body'].includes(r.ai_decision)
);
const isWorkout = (r) => ['run', 'pullup', 'pushup', 'exercise'].includes(r.log_type);
const tier1 = allClassified.filter((r) => r.ai_decision === 'face' && isWorkout(r));
const tier2 = allClassified.filter((r) => r.ai_decision === 'face' && !isWorkout(r));
const tier3 = allClassified.filter((r) => r.ai_decision === 'body' && isWorkout(r));
const tier4 = allClassified.filter((r) => r.ai_decision === 'body' && !isWorkout(r));
for (const t of [tier1, tier2, tier3, tier4]) t.sort((a, b) => b.likes - a.likes);

const perUserCount = {};
const finalSelected = [];
function pickFrom(tier) {
  for (const c of tier) {
    if (finalSelected.length >= FINAL_COUNT) return;
    const cnt = perUserCount[c.user_id] ?? 0;
    if (cnt >= PER_USER_FINAL_CAP) continue;
    perUserCount[c.user_id] = cnt + 1;
    finalSelected.push(c);
  }
}
pickFrom(tier1);
pickFrom(tier2);
pickFrom(tier3);
pickFrom(tier4);
// pass 2: 부족하면 user cap 풀고 채우기 (모든 tier 합쳐서)
if (finalSelected.length < FINAL_COUNT) {
  const fallback = [...tier1, ...tier2, ...tier3, ...tier4];
  for (const c of fallback) {
    if (finalSelected.length >= FINAL_COUNT) break;
    if (finalSelected.find((f) => f.id === c.id)) continue;
    finalSelected.push(c);
  }
}

const finalPayload = finalSelected.map((c) => ({
  id: c.id,
  photo_url: c.photo_url,
  user_initial: c.user_initial,
  avatar_url: c.avatar_url,
  distance_km: c.distance_km,
  duration_sec: c.duration_sec,
  pace_sec_per_km: c.pace_sec_per_km,
  date: c.date,
  likes: c.likes,
  log_type: c.log_type,
  ai_decision: c.ai_decision,
}));

const out = {
  generated_at: new Date().toISOString(),
  cohort: { code: '260504_team_run', cohort_id: COHORT_ID, day1: DAY1, day21: DAY21_END },
  stats: {
    candidates_scanned: candidates.length,
    vision_face: results.filter((r) => r.ai_decision === 'face').length,
    vision_body: results.filter((r) => r.ai_decision === 'body').length,
    vision_screen: results.filter((r) => r.ai_decision === 'screen').length,
    vision_error: results.filter((r) => r.ai_decision === 'error').length,
    final_count: finalPayload.length,
    tier_breakdown: {
      tier1_face_workout: tier1.length,
      tier2_face_other: tier2.length,
      tier3_body_workout: tier3.length,
      tier4_body_other: tier4.length,
    },
    openai_model: VISION_MODEL,
    openai_input_tokens: totalIn,
    openai_output_tokens: totalOut,
    estimated_cost_usd: +estimatedCostUsd.toFixed(4),
  },
  photos: finalPayload,
};

const outPath = resolve(process.cwd(), 'src/data/season0-photos.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`✓ wrote ${outPath}`);

// 디버그 dump (전체 vision 결과 — 다음 실행 캐시로 재사용됨)
writeFileSync(
  DEBUG_PATH,
  JSON.stringify({ generated_at: out.generated_at, stats: out.stats, all: results }, null, 2)
);
console.log(`✓ debug → ${DEBUG_PATH}`);
console.log(`\n💰 추정 비용: $${estimatedCostUsd.toFixed(4)} (in=${totalIn} out=${totalOut})`);
