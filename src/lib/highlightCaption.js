// 후기 캡션에서 중요 구문 자동 추출 (heuristic — 백엔드 LLM 없이 클라이언트에서)
// 반환: highlights string[] — renderCaption()에서 그대로 bold 처리됨

// 1) 숫자 + 단위 (성과/스펙)
const NUMERIC_PATTERN = /\d+(?:[.,]\d+)?\s?(?:km|kg|키로(?:대)?|분(?:동안)?|초|시간|점(?:대)?|%|일|달|주|개|번|층|회|차|등|위|m(?!ile))/gi;

// 2) 시간/속도 표현 (예: "7속도로", "1km도", "2주 회고")
const TIME_SPEED_PATTERN = /\d+\s?(?:속도(?:로)?|페이스(?:로)?)/gi;

// 3) 강한 감정/성취 키워드 — 앞뒤 5~10자 함께 가져오기
const STRONG_KEYWORDS = [
  '처음인데', '처음이야', '처음으로', '오늘 처음', '이런 적 없', '인생 처음',
  'PB', 'pb',
  '일등', '1등', '우승', '완주', '완료',
  '해냈', '해냈어요', '해냈다',
  '뿌듯', '감동', '행복', '신기', '놀라',
  '바뀌었', '바뀌어', '달라졌', '변했', '달랐',
  '최고', '기적', '대박', '미쳤',
  '꾸준', '매일', '하루도', '한번도',
  '쉬지않고', '쉬지 않고', '쉬지않', '한참',
  '내가', '나도',
];

// 한 후기당 최대 highlights 개수
const MAX_HIGHLIGHTS = 4;
// 너무 짧은(<2자) 또는 너무 긴(>30자) 매칭은 버림
const MIN_LEN = 2;
const MAX_LEN = 30;

function captureSurrounding(text, idx, len) {
  // 단어 단위(공백/문장부호)로 앞뒤 확장 — 매칭 단어 통째로 가져오기
  let start = idx;
  let end = idx + len;
  while (start > 0 && !/[\s.,!?…\n"']/.test(text[start - 1])) start--;
  while (end < text.length && !/[\s.,!?…\n"']/.test(text[end])) end++;
  return text.slice(start, end).trim();
}

export function extractHighlights(caption) {
  if (!caption || typeof caption !== 'string') return [];
  const text = caption;
  const found = [];
  const seenLower = new Set();

  function tryAdd(phrase) {
    if (!phrase) return;
    const trimmed = phrase.trim().replace(/[.,!?…"']+$/, '').trim();
    if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) return;
    const key = trimmed.toLowerCase();
    if (seenLower.has(key)) return;
    // 너무 일반적인 단어 차단
    if (/^(이|그|저|나|너|있|없|하|되|봤|돼)$/.test(trimmed)) return;
    seenLower.add(key);
    found.push(trimmed);
  }

  // 1) 숫자 + 단위
  for (const m of text.matchAll(NUMERIC_PATTERN)) {
    if (found.length >= MAX_HIGHLIGHTS) break;
    tryAdd(captureSurrounding(text, m.index, m[0].length));
  }

  // 2) 속도/페이스
  if (found.length < MAX_HIGHLIGHTS) {
    for (const m of text.matchAll(TIME_SPEED_PATTERN)) {
      if (found.length >= MAX_HIGHLIGHTS) break;
      tryAdd(captureSurrounding(text, m.index, m[0].length));
    }
  }

  // 3) 키워드 — 문자열 검색
  for (const kw of STRONG_KEYWORDS) {
    if (found.length >= MAX_HIGHLIGHTS) break;
    const idx = text.indexOf(kw);
    if (idx === -1) continue;
    tryAdd(captureSurrounding(text, idx, kw.length));
  }

  return found;
}
