// 팀 매칭 알고리즘.
// 입력: 지원자 배열 (running_exp, is_acquaintance, gender, excluded, name 포함), 팀 수.
// 출력: 팀 배정 + 미해결 충돌 리스트.
//
// 전략 (우선순위 순):
// 1) 배제(excluded=true) 제외
// 2) 성별 분리 후 각 그룹 내에서 실력 desc 스네이크 드래프트 → 자연스럽게 성비 균형
//    (성별 미정은 별도 그룹으로 같은 방식 분배)
// 3) 한 팀에 지인(is_acquaintance) 2명 이상이면 지인 0명인 팀의 비슷한 실력자와 swap

import { guessGender } from './genderGuess';

export const SKILL_SCORE = {
  full_marathon: 5,
  half_marathon: 4,
  run_10km: 3,
  run_5km: 2,
  run_1km: 1,
  almost_none: 0,
};

const skillOf = (a) => SKILL_SCORE[a?.running_exp] ?? 0;
const isAcq = (a) => !!a?.is_acquaintance;
const genderOf = (a) => a?.gender || guessGender(a?.name) || '?';

function countAcq(team) {
  return team.reduce((n, m) => n + (isAcq(m) ? 1 : 0), 0);
}

// 한 그룹을 실력 desc 정렬 + 스네이크 분배
function snakeDraft(group, teams) {
  const teamCount = teams.length;
  const sorted = [...group]
    .map((a) => ({ ...a, _r: Math.random() }))
    .sort((a, b) => skillOf(b) - skillOf(a) || a._r - b._r);

  // 가장 작은 팀부터 채우는 스네이크 (각 그룹마다 시작점이 다르도록 round-robin)
  // 팀 사이즈에 따라 라운드를 결정해야 균등해짐.
  for (let i = 0; i < sorted.length; i++) {
    // 현재 가장 작은 팀 선택 (동률이면 인덱스 작은 쪽)
    let target = 0;
    for (let t = 1; t < teamCount; t++) {
      if (teams[t].length < teams[target].length) target = t;
    }
    teams[target].push(sorted[i]);
  }
}

export function matchTeams(applicants, teamCount) {
  if (!Array.isArray(applicants) || applicants.length === 0 || teamCount < 1) {
    return { teams: [], assignments: [], conflicts: [] };
  }

  const eligible = applicants.filter((a) => !a.excluded);

  // 성별 그룹화 (M / F / ?)
  const groups = { M: [], F: [], '?': [] };
  for (const a of eligible) groups[genderOf(a)].push(a);

  // 1) 각 그룹별로 가장 작은 팀에 채워넣기 — 자연스럽게 성비 + 실력 균등
  const teams = Array.from({ length: teamCount }, () => []);
  // 큰 그룹부터 (안정적인 분배)
  const orderedGroups = [groups.F, groups.M, groups['?']].sort((a, b) => b.length - a.length);
  for (const g of orderedGroups) snakeDraft(g, teams);

  // 2) 지인 분산 — 한 팀에 지인 ≥ 2면 0명인 팀의 비슷한 실력 비지인과 swap
  for (let iter = 0; iter < 200; iter++) {
    let overTeamIdx = -1;
    let overAcqMember = null;
    for (let ti = 0; ti < teams.length; ti++) {
      if (countAcq(teams[ti]) >= 2) {
        let foundIdx = -1;
        for (let mi = 0; mi < teams[ti].length; mi++) {
          if (isAcq(teams[ti][mi])) {
            if (foundIdx === -1) foundIdx = mi;
            else { overTeamIdx = ti; overAcqMember = teams[ti][mi]; break; }
          }
        }
        if (overAcqMember) break;
      }
    }
    if (!overAcqMember) break;

    let swapped = false;
    for (const maxDiff of [0, 1, 2, 99]) {
      if (swapped) break;
      for (let tj = 0; tj < teams.length; tj++) {
        if (tj === overTeamIdx) continue;
        if (countAcq(teams[tj]) > 0) continue;
        const idx = teams[tj].findIndex(
          (c) => !isAcq(c) && Math.abs(skillOf(c) - skillOf(overAcqMember)) <= maxDiff
        );
        if (idx === -1) continue;
        const candidate = teams[tj][idx];
        teams[overTeamIdx] = teams[overTeamIdx].map((m) => (m.id === overAcqMember.id ? candidate : m));
        teams[tj] = teams[tj].map((m) => (m.id === candidate.id ? overAcqMember : m));
        swapped = true;
        break;
      }
    }
    if (!swapped) break;
  }

  const assignments = [];
  teams.forEach((team, idx) => {
    for (const m of team) assignments.push({ id: m.id, team_id: idx + 1 });
  });

  const conflicts = [];
  teams.forEach((team, ti) => {
    const c = countAcq(team);
    if (c >= 2) conflicts.push({ teamIdx: ti, acqCount: c });
  });

  return { teams, assignments, conflicts };
}
