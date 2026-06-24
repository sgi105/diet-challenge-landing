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
