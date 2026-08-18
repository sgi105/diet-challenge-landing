export const GOAL_OPTIONS = [
  { value: '10K_complete', label: '10K 완주' },
  { value: 'half_marathon', label: '하프 마라톤(21K) 완주' },
  { value: 'full_marathon', label: '풀 마라톤(42K) 완주' },
  { value: 'pr_pace', label: '더 빠르게 (기록 단축)' },
  { value: 'lean_body', label: '탄탄한 몸 만들기' },
  { value: 'other', label: '기타 (직접 입력)' },
]

export const GOAL_LABEL = Object.fromEntries(GOAL_OPTIONS.map(o => [o.value, o.label]))

export const MAX_GOALS = 2

// ── 단기 목표 (21일 챌린지 동안) ──────────────────────────────
// 'pr_5k' 선택 시 현재 5K 기록을 이어서 받는다 (페이스 그룹·팀 매칭 참고용).
export const SHORT_GOAL_OPTIONS = [
  { value: 'first_5k', label: '첫 5K 완주', desc: '아직 5K를 안 뛰어봤거나, 끝까지 못 가봤어' },
  { value: 'pr_5k', label: '5K 기록 향상', desc: '이미 5K는 뛰어. 더 빠르게 가고 싶어', needsRecord: true },
]

export const SHORT_GOAL_LABEL = Object.fromEntries(SHORT_GOAL_OPTIONS.map(o => [o.value, o.label]))

// ── 최종 목표가 '더 빠르게(기록 단축)'일 때 고르는 거리 ──────────
// hasHours: 목표 시간 입력에 '시간' 칸을 띄울지 (하프·풀은 1시간 넘음).
export const TARGET_DISTANCE_OPTIONS = [
  { value: '5k', label: '5K', hasHours: false },
  { value: '10k', label: '10K', hasHours: true },
  { value: 'half', label: '하프(21K)', hasHours: true },
  { value: 'full', label: '풀(42K)', hasHours: true },
]

export const TARGET_DISTANCE_LABEL = Object.fromEntries(TARGET_DISTANCE_OPTIONS.map(o => [o.value, o.label]))

// 기록 단축 목표를 붙일 수 있는 최종 목표 값.
export const PACE_GOAL_VALUE = 'pr_pace'

// 초 ↔ {h,m,s} 변환 — 폼 입력과 DB 저장(정수 초) 사이 다리.
export function secToParts(sec) {
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return { h: '', m: '', s: '' }
  return {
    h: String(Math.floor(n / 3600)),
    m: String(Math.floor((n % 3600) / 60)),
    s: String(n % 60),
  }
}

export function partsToSec({ h, m, s }) {
  const num = (v) => {
    const n = parseInt(v, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }
  const total = num(h) * 3600 + num(m) * 60 + num(s)
  return total > 0 ? total : null
}

// 표시용 — 3661 → "1:01:01", 1830 → "30:30"
export function formatSec(sec) {
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  const h = Math.floor(n / 3600)
  const m = Math.floor((n % 3600) / 60)
  const s = n % 60
  const pad = (v) => String(v).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
