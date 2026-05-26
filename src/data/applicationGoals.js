export const GOAL_OPTIONS = [
  { value: '5K_complete', label: '5K 완주' },
  { value: '10K_complete', label: '10K 완주' },
  { value: 'half_marathon', label: '하프 마라톤(21K) 완주' },
  { value: 'full_marathon', label: '풀 마라톤(42K) 완주' },
  { value: 'weight_5kg', label: '5kg 감량' },
  { value: 'weight_10kg', label: '10kg 감량' },
  { value: 'abs', label: '복근 만들기' },
  { value: 'lean_body', label: '탄탄한 몸 만들기' },
  { value: 'pr_pace', label: 'PR 갱신 (페이스)' },
  { value: '100days_streak', label: '100일 연속 운동' },
  { value: 'other', label: '기타 (자유 서술)' },
]

export const GOAL_LABEL = Object.fromEntries(GOAL_OPTIONS.map(o => [o.value, o.label]))

export const MAX_GOALS = 2
