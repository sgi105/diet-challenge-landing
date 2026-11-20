// 금액 표시 — 490000 → '490,000원'
export const won = (n) => `${Number(n || 0).toLocaleString('ko-KR')}원`;
