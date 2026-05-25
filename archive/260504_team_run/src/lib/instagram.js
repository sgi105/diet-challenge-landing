// "@user", "user", "https://instagram.com/user/..." → "user"
// 영문/숫자/._ 만 허용. 부적절하면 빈 문자열.
export function normalizeInstagram(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';
  const urlMatch = s.match(/instagram\.com\/([^/?#\s]+)/i);
  if (urlMatch) s = urlMatch[1];
  s = s.replace(/^@+/, '').replace(/\/+$/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) return '';
  return s.toLowerCase();
}
