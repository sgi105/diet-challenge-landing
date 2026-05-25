// 한국어 이름 → 성별 best-effort 추정.
// 마지막 글자 기반 휴리스틱. 강한 시그널만 'M'/'F' 반환, 애매하면 null.
// 어드민이 수동 보정해야 하는 케이스 발생함을 가정.

const STRONG_F = new Set([
  // 전형적 여성 끝글자
  '혜', '지', '림', '연', '윤', '은', '별', '라', '아', '희', '정', '자', '숙', '미', '화',
  // 부분적 여성 (오인 가능 — 약한 신호로만 사용)
  '진',
]);

const STRONG_M = new Set([
  '호', '준', '석', '환', '욱', '훈', '식', '철', '길', '권', '동', '만', '섭', '용', '종', '중', '혁',
  '재', '범', '재', '광', '욱', '진', '균', '도',
]);

// 충돌 해결: 둘 다에 있으면 (예: '진') female-leaning 으로 판단
// 강한 male-only 끝글자만 STRONG_M 으로 분리하면 더 안전
const STRONG_M_ONLY = new Set([
  '호', '준', '석', '환', '욱', '훈', '식', '철', '길', '권', '동', '만', '섭', '용', '종', '중', '혁',
  '재', '범', '광', '균', '도',
]);

export function guessGender(fullName) {
  if (!fullName) return null;
  const trimmed = String(fullName).trim();
  if (!trimmed) return null;
  const last = trimmed[trimmed.length - 1];
  if (STRONG_M_ONLY.has(last)) return 'M';
  if (STRONG_F.has(last)) return 'F';
  return null;
}

export const GENDER_LABEL = {
  M: '남',
  F: '여',
};
