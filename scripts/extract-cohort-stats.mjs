#!/usr/bin/env node
// Extracts 시즌0 (260504_team_run, cohort_id=cf14f8e6-...) 30 members × 21 days of
// attendance + run distance + time-of-day stats for the landing-page result section.
//
// Usage:
//   node --env-file=.env.local scripts/extract-cohort-stats.mjs
//
// Output: src/data/season0-stats.json (anonymized — first-char initial + ★)

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SR = process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SR) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE. Run with --env-file=.env.local');
  process.exit(1);
}

const COHORT_ID = 'cf14f8e6-6c3f-4c3f-9837-14a714a0233c';
const DAY1 = '2026-05-04';
const DAY21 = '2026-05-24';
const TZ_OFFSET_HOURS = 9; // KST

const H = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

async function rest(p) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${p}`, { headers: H });
  if (!res.ok) throw new Error(`REST ${p} → ${res.status}: ${await res.text()}`);
  return res.json();
}

function inFilter(ids) {
  return `(${ids.map(id => `"${id}"`).join(',')})`;
}

// First Korean character as the initial (e.g., "황현욱" → "황", "김혜인" → "김").
function initialOf(name) {
  if (!name) return '★';
  const s = name.trim();
  return s.length ? s[0] : '★';
}

// ---- 1) members ----
const memberships = await rest(
  `cohort_memberships?cohort_id=eq.${COHORT_ID}&status=eq.active&select=user_id,profiles(id,full_name,avatar_url)`
);
const members = memberships
  .map((m) => ({
    id: m.user_id,
    initial: initialOf(m.profiles?.full_name),
    avatar_url: m.profiles?.avatar_url || null,
  }))
  .sort((a, b) => a.initial.localeCompare(b.initial, 'ko'));
const userIds = members.map((m) => m.id);
console.log(`[1] cohort members: ${members.length}`);

// ---- 2) attendance matrix (daily_missions where status=success) ----
const missions = await rest(
  `daily_missions?user_id=in.${inFilter(userIds)}&date=gte.${DAY1}&date=lte.${DAY21}&status=eq.success&select=user_id,date`
);
console.log(`[2] success-status daily_missions rows: ${missions.length}`);

// Build day list day1..day21
const dayDates = [];
{
  const d = new Date(DAY1 + 'T00:00:00Z');
  for (let i = 0; i < 21; i++) {
    const dd = new Date(d);
    dd.setUTCDate(d.getUTCDate() + i);
    dayDates.push(dd.toISOString().slice(0, 10));
  }
}

const attendanceMatrix = {};
for (const u of members) attendanceMatrix[u.id] = Array(21).fill(false);
const dateToIdx = Object.fromEntries(dayDates.map((d, i) => [d, i]));
for (const m of missions) {
  const idx = dateToIdx[m.date];
  if (idx == null) continue;
  if (!attendanceMatrix[m.user_id]) continue;
  attendanceMatrix[m.user_id][idx] = true;
}

const totalAttendance = Object.values(attendanceMatrix).reduce(
  (sum, arr) => sum + arr.filter(Boolean).length,
  0
);
const possibleAttendance = members.length * 21;
const rate = totalAttendance / possibleAttendance;

// perfect days = days where all 30 members 인증
let perfectDays = 0;
const perDayAttendance = Array(21).fill(0);
for (let i = 0; i < 21; i++) {
  let c = 0;
  for (const u of members) if (attendanceMatrix[u.id][i]) c++;
  perDayAttendance[i] = c;
  if (c === members.length) perfectDays++;
}
console.log(`[2] attendance: ${totalAttendance}/${possibleAttendance} = ${(rate * 100).toFixed(1)}% — perfect days=${perfectDays}`);

// ---- 3) mission_logs for time-of-day + km ----
const logsStart = `${DAY1}T00:00:00Z`;
const logsEnd = `2026-05-25T23:59:59Z`;
const logs = await rest(
  `mission_logs?user_id=in.${inFilter(userIds)}&logged_at=gte.${encodeURIComponent(logsStart)}&logged_at=lte.${encodeURIComponent(logsEnd)}&is_test=eq.false&select=user_id,logged_at,log_type,numeric_value,unit`
);
console.log(`[3] mission_logs rows: ${logs.length}`);

// Hour × weekday heatmap. KST. Weekday 0 = Sun, 6 = Sat per JS getDay() — but Korean
// convention is 월=0 … 일=6. Let's use Mon=0..Sun=6 for the chart row order.
const hourlyByWeekday = {};
for (let w = 0; w < 7; w++) hourlyByWeekday[w] = {};
for (const l of logs) {
  if (!l.logged_at) continue;
  const d = new Date(l.logged_at);
  // shift to KST
  const kst = new Date(d.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  const jsDow = kst.getUTCDay(); // 0=Sun
  const wMonFirst = (jsDow + 6) % 7; // 0=Mon, 6=Sun
  const hour = kst.getUTCHours();
  hourlyByWeekday[wMonFirst][hour] = (hourlyByWeekday[wMonFirst][hour] || 0) + 1;
}

// Cumulative distance by day (run/km only)
const kmByDay = Array(21).fill(0);
const runnersByDay = Array.from({ length: 21 }, () => new Set());
let totalKm = 0;
for (const l of logs) {
  if (l.log_type !== 'run' || l.unit !== 'km') continue;
  const km = Number(l.numeric_value);
  if (!Number.isFinite(km) || km <= 0) continue;
  const d = new Date(l.logged_at);
  const kst = new Date(d.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  const dateStr = kst.toISOString().slice(0, 10);
  const idx = dateToIdx[dateStr];
  if (idx == null) continue;
  kmByDay[idx] += km;
  runnersByDay[idx].add(l.user_id);
  totalKm += km;
}
const cumulativeDistanceByDay = [];
let acc = 0;
for (let i = 0; i < 21; i++) {
  acc += kmByDay[i];
  cumulativeDistanceByDay.push({
    day: i + 1,
    dailyKm: +kmByDay[i].toFixed(2),
    totalKm: +acc.toFixed(2),
    perPerson: +(acc / members.length).toFixed(2),
    runnersCount: runnersByDay[i].size,
  });
}
console.log(`[4] total km: ${totalKm.toFixed(1)} · perPerson: ${(totalKm / members.length).toFixed(1)}`);

// time-of-day insight: peak hour bucket
const hourTotals = {};
for (const w of Object.keys(hourlyByWeekday)) {
  for (const [h, c] of Object.entries(hourlyByWeekday[w])) {
    hourTotals[h] = (hourTotals[h] || 0) + c;
  }
}
const sortedHours = Object.entries(hourTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`[5] top hour buckets (KST):`, sortedHours);

const out = {
  generated_at: new Date().toISOString(),
  cohort: { code: '260504_team_run', cohort_id: COHORT_ID, day1: DAY1, day21: DAY21 },
  members,
  attendanceMatrix,
  perDayAttendance,
  hourlyByWeekday,
  cumulativeDistanceByDay,
  summary: {
    cohortSize: members.length,
    totalAttendance,
    possibleAttendance,
    rate: +rate.toFixed(4),
    perfectDays,
    totalKm: +totalKm.toFixed(2),
    perPersonKm: +(totalKm / members.length).toFixed(2),
    topHoursKST: sortedHours.map(([h, c]) => ({ hour: Number(h), count: c })),
  },
};

const outPath = resolve(process.cwd(), 'src/data/season0-stats.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`✓ wrote ${outPath}`);
