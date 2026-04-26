#!/usr/bin/env node
// Pulls direct-cohort (team_diet_30d, program_start_date=2026-04-02) data from Supabase
// for the landing page social proof.
//
// Usage:
//   node --env-file=.env.local scripts/extract-cohort-data.mjs <mode>
//
// Modes:
//   schema     — print OpenAPI table list + column hints
//   sample     — sample first row of each candidate table
//   stats      — compute headline stats (avg loss, total cert days, etc.)
//   posts      — pull top social_posts (likes, photos, captions)
//   chat       — pull representative team_chat_messages
//   all        — schema + sample + stats + posts + chat → write src/data/cohort.json
//
// SECURITY: Reads SUPABASE_SERVICE_ROLE from env (no VITE_ prefix → not bundled).
//           Output JSON contains ONLY anonymized + curated fields. Never write the
//           service role into the JSON or src/.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const COHORT = { challenge_type_id: 'team_diet_30d', program_start_date: '2026-04-02' };

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env. Run with: node --env-file=.env.local scripts/extract-cohort-data.mjs <mode>');
  process.exit(1);
}

const HEADERS = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  'Content-Type': 'application/json',
};

async function rest(path, { method = 'GET', body, headers = {} } = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: { ...HEADERS, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`REST ${method} ${path} → ${res.status}: ${txt}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// ---- mode: schema ----
async function modeSchema() {
  // PostgREST exposes OpenAPI at /rest/v1/ (root). It lists every table + columns.
  const spec = await rest('');
  const tables = Object.keys(spec.definitions || spec.components?.schemas || {}).sort();
  console.log(`\n[SCHEMA] ${tables.length} tables exposed via PostgREST:\n`);
  for (const t of tables) {
    const def = (spec.definitions || spec.components?.schemas)[t];
    const cols = Object.keys(def.properties || {});
    console.log(`  ${t}  (${cols.length} cols)`);
  }
  console.log('\n[CANDIDATE TABLES] columns:\n');
  const candidates = [
    'profiles', 'daily_missions', 'social_posts', 'post_comments', 'post_likes',
    'team_chat_messages', 'teams', 'team_members', 'team_scores',
    'refunds', 'payments', 'rewards', 'enrollments', 'reenrollments',
    'weight_logs', 'mission_evidence',
  ];
  const defs = spec.definitions || spec.components?.schemas || {};
  for (const t of candidates) {
    if (!defs[t]) continue;
    const cols = Object.keys(defs[t].properties || {});
    console.log(`  ${t}:\n    ${cols.join(', ')}\n`);
  }
}

// ---- mode: sample ----
async function modeSample() {
  const tables = [
    'profiles', 'daily_missions', 'social_posts', 'post_comments', 'post_likes',
    'team_chat_messages', 'teams', 'team_members',
  ];
  for (const t of tables) {
    try {
      const rows = await rest(`${t}?select=*&limit=1`);
      console.log(`\n[${t}] sample row:`);
      console.log(JSON.stringify(rows[0] || null, null, 2));
    } catch (e) {
      console.log(`\n[${t}] error: ${e.message}`);
    }
  }
}

// ---- helpers ----
function maskName(name) {
  if (!name) return '익명';
  // Korean: keep first char, mask rest with O. Latin: first char + ***.
  const trimmed = name.trim();
  if (/^[ㄱ-힝]/.test(trimmed)) {
    return trimmed[0] + 'OO';
  }
  return trimmed[0] + '***';
}

async function fetchCohortUserIds() {
  const rows = await rest(
    `profiles?challenge_type_id=eq.${COHORT.challenge_type_id}` +
    `&program_start_date=eq.${COHORT.program_start_date}` +
    `&select=id,full_name,gender,age,height_cm,current_weight_kg,goal_weight_kg`
  );
  return rows;
}

// Cache cohort names so we can mask @mentions in captions/comments.
let _allNames = null;
async function loadAllNames() {
  if (_allNames) return _allNames;
  // Pull every profile name (across all cohorts) so non-cohort commenters are masked too.
  const rows = await rest(`profiles?select=full_name&full_name=not.is.null&limit=2000`);
  _allNames = rows.map(r => (r.full_name || '').trim()).filter(Boolean);
  return _allNames;
}

// Replace any @realname (or bare full name) found in `text` with masked form.
async function maskInlineNames(text) {
  if (!text) return text;
  const names = await loadAllNames();
  // sort by length desc so longer matches win first
  const sorted = [...names].sort((a, b) => b.length - a.length);
  let out = text;
  for (const n of sorted) {
    if (n.length < 2) continue;
    // match @name OR bare name (Korean names without word boundary support)
    const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`@?${escaped}`, 'g');
    out = out.replace(re, (m) => (m.startsWith('@') ? `@${maskName(n)}` : maskName(n)));
  }
  return out;
}

// ---- mode: stats ----
async function modeStats() {
  const users = await fetchCohortUserIds();
  console.log(`\n[STATS] cohort = ${users.length} users`);
  if (!users.length) return null;

  const ids = users.map(u => u.id);
  const inFilter = `(${ids.map(id => `"${id}"`).join(',')})`;

  // pull all daily_missions for these users
  const missions = await rest(
    `daily_missions?user_id=in.${inFilter}&select=user_id,date,program_day,weight_done,exercise_done,calories_done,upload_done,completed_at`
  );
  console.log(`  daily_missions rows: ${missions.length}`);

  // pull all social_posts (with mission_stats for weight time series)
  const posts = await rest(
    `social_posts?user_id=in.${inFilter}&select=user_id,program_day,mission_stats,created_at,caption,media_url`
  );
  console.log(`  social_posts rows: ${posts.length}`);

  // weight progression per user (latest mission_stats.weight vs weight_start)
  const perUser = {};
  for (const u of users) perUser[u.id] = { startName: u.full_name, weight_start: u.current_weight_kg, weight_goal: u.goal_weight_kg, weights: [] };
  for (const p of posts) {
    const ms = p.mission_stats || {};
    const w = Number(ms.weight);
    if (!Number.isFinite(w)) continue;
    perUser[p.user_id]?.weights.push({ day: p.program_day, w, ts: p.created_at });
    if (!perUser[p.user_id].weight_start && Number.isFinite(Number(ms.weight_start))) {
      perUser[p.user_id].weight_start = Number(ms.weight_start);
    }
    if (!perUser[p.user_id].weight_goal && Number.isFinite(Number(ms.weight_goal))) {
      perUser[p.user_id].weight_goal = Number(ms.weight_goal);
    }
  }

  let totalLoss = 0, lossCount = 0;
  const losses = [];
  for (const [uid, d] of Object.entries(perUser)) {
    if (!d.weights.length) continue;
    d.weights.sort((a, b) => a.day - b.day);
    const first = d.weight_start ?? d.weights[0].w;
    const last = d.weights[d.weights.length - 1].w;
    const loss = first - last;
    losses.push({ uid, name: d.startName, first, last, loss: +loss.toFixed(1) });
    if (Number.isFinite(loss)) { totalLoss += loss; lossCount++; }
  }

  // certification days: count of distinct (user, date) where any 인증 done
  const certByUser = {};
  for (const m of missions) {
    const any = m.weight_done || m.exercise_done || m.calories_done || m.upload_done;
    if (!any) continue;
    certByUser[m.user_id] = certByUser[m.user_id] || new Set();
    certByUser[m.user_id].add(m.date);
  }
  const certCounts = Object.values(certByUser).map(s => s.size);
  const totalCertDays = certCounts.reduce((a, b) => a + b, 0);
  const avgCertDays = certCounts.length ? totalCertDays / certCounts.length : 0;

  const stats = {
    cohortSize: users.length,
    avgLossKg: lossCount ? +(totalLoss / lossCount).toFixed(1) : null,
    totalLossKg: +totalLoss.toFixed(1),
    avgCertDays: +avgCertDays.toFixed(1),
    totalCertDays,
    losses,
  };
  console.log('\n[STATS RESULT]');
  console.log(JSON.stringify(stats, null, 2));
  return stats;
}

// ---- mode: posts ----
async function modePosts() {
  const users = await fetchCohortUserIds();
  const ids = users.map(u => u.id);
  const inFilter = `(${ids.map(id => `"${id}"`).join(',')})`;

  // fetch posts + likes count
  const posts = await rest(
    `social_posts?user_id=in.${inFilter}` +
    `&select=id,user_id,program_day,caption,media_url,mission_stats,created_at,profiles(full_name)` +
    `&order=created_at.asc&limit=500`
  );

  // fetch likes for these posts
  const postIds = posts.map(p => p.id);
  const likeRows = postIds.length ? await rest(
    `post_likes?post_id=in.(${postIds.map(id => `"${id}"`).join(',')})&select=post_id`
  ) : [];
  const likeCount = {};
  for (const l of likeRows) likeCount[l.post_id] = (likeCount[l.post_id] || 0) + 1;

  // attach + filter to posts with media
  const enriched = await Promise.all(posts
    .filter(p => p.media_url)
    .map(async p => ({
      id: p.id,
      day: p.program_day,
      name: maskName(p.profiles?.full_name),
      caption: await maskInlineNames((p.caption || '').trim()),
      media_url: p.media_url,
      proof_photos: p.mission_stats?.proof_photos || null,
      weight: p.mission_stats?.weight ?? null,
      weight_start: p.mission_stats?.weight_start ?? null,
      weight_goal: p.mission_stats?.weight_goal ?? null,
      likes: likeCount[p.id] || 0,
      created_at: p.created_at,
    })));
  enriched.sort((a, b) => b.likes - a.likes);

  console.log(`\n[POSTS] total with media: ${enriched.length}, top 12 by likes:`);
  console.log(JSON.stringify(enriched.slice(0, 12), null, 2));
  return enriched;
}

// ---- mode: comments ----
// team_chat_messages is barely used (15 total rows). The real conversation
// happens in post_comments — teammates encouraging each other on each feed post.
// We pull comments on top-engaged cohort posts to reconstruct the "단톡방" feel.
async function modeComments() {
  const users = await fetchCohortUserIds();
  const ids = users.map(u => u.id);
  const userInFilter = `(${ids.map(id => `"${id}"`).join(',')})`;

  // get all cohort posts
  const posts = await rest(
    `social_posts?user_id=in.${userInFilter}` +
    `&select=id,user_id,program_day,caption,media_url,created_at,profiles(full_name)` +
    `&order=created_at.asc&limit=500`
  );
  const postIds = posts.map(p => p.id);
  const postInFilter = `(${postIds.map(id => `"${id}"`).join(',')})`;

  // pull all comments on these posts (including non-cohort commenters — they're real users)
  const comments = await rest(
    `post_comments?post_id=in.${postInFilter}` +
    `&select=id,post_id,user_id,content,created_at,profiles(full_name)` +
    `&order=created_at.asc&limit=1000`
  );
  console.log(`\n[COMMENTS] total comments on cohort posts: ${comments.length}`);

  // group comments by post + count
  const commentsByPost = {};
  for (const c of comments) {
    commentsByPost[c.post_id] = commentsByPost[c.post_id] || [];
    commentsByPost[c.post_id].push({
      sender: maskName(c.profiles?.full_name),
      content: await maskInlineNames((c.content || '').trim()),
      ts: c.created_at,
    });
  }
  // sort within each post chronologically
  for (const arr of Object.values(commentsByPost)) arr.sort((a, b) => a.ts.localeCompare(b.ts));

  // pick posts with most comments (real conversations)
  const posted = await Promise.all(posts.map(async p => ({
    post_id: p.id,
    author: maskName(p.profiles?.full_name),
    day: p.program_day,
    caption: await maskInlineNames((p.caption || '').trim()),
    media_url: p.media_url,
    created_at: p.created_at,
    comment_count: (commentsByPost[p.id] || []).length,
    comments: commentsByPost[p.id] || [],
  })));
  const filtered = posted
    .filter(p => p.comment_count >= 3)
    .sort((a, b) => b.comment_count - a.comment_count);

  console.log(`\n[CONVERSATIONS] posts with ≥3 comments: ${filtered.length}, top 8:`);
  console.log(JSON.stringify(filtered.slice(0, 8), null, 2));
  return filtered;
}

// ---- mode: all ----
async function modeAll() {
  console.log('\n=== stats ===');
  const stats = await modeStats();
  console.log('\n=== posts ===');
  const posts = await modePosts();
  console.log('\n=== conversations ===');
  const conversations = await modeComments();

  // STRIP PII: replace real names with masked versions, drop uids.
  // top losers = sorted by loss desc, masked + rounded
  const leaderboard = (stats?.losses || [])
    .map(l => ({ name: maskName(l.name), loss: l.loss, start: l.first, latest: l.last }))
    .sort((a, b) => b.loss - a.loss);

  // also strip media_url/proof_photos that point at uid paths — they're public bucket so OK to keep
  const out = {
    generated_at: new Date().toISOString(),
    cohort: COHORT,
    stats: {
      cohortSize: stats.cohortSize,
      avgLossKg: stats.avgLossKg,
      totalLossKg: stats.totalLossKg,
      avgCertDays: stats.avgCertDays,
      totalCertDays: stats.totalCertDays,
      leaderboard,
    },
    top_posts: (posts || []).slice(0, 12).map(p => {
      const { id, ...rest } = p;
      return rest;
    }),
    conversations: (conversations || []).slice(0, 8).map(c => {
      const { post_id, ...rest } = c;
      return rest;
    }),
  };
  const outPath = resolve(process.cwd(), 'src/data/cohort.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\n✓ wrote ${outPath}`);
  console.log(`  leaderboard top 3: ${leaderboard.slice(0, 3).map(x => `${x.name} -${x.loss}kg`).join(', ')}`);
}

const mode = process.argv[2] || 'schema';
const dispatch = { schema: modeSchema, sample: modeSample, stats: modeStats, posts: modePosts, comments: modeComments, all: modeAll };
const fn = dispatch[mode];
if (!fn) { console.error(`unknown mode: ${mode}`); process.exit(1); }
fn().catch(e => { console.error(e); process.exit(1); });
