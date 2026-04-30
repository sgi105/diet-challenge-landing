import { useState } from 'react';
import { normalizeInstagram } from '../../lib/instagram';

// 인스타 핸들 있으면 unavatar.io로 프사 시도, 실패 시 이니셜 폴백.
// 인스타 차단 등으로 실패율이 높아 onError 폴백이 필수.
export default function ApplicantAvatar({ name, instagram, size = 36, className = '' }) {
  const handle = normalizeInstagram(instagram);
  const initial = name?.[0] || '?';
  const [failed, setFailed] = useState(false);
  const px = `${size}px`;

  if (handle && !failed) {
    return (
      <img
        src={`https://unavatar.io/instagram/${handle}?fallback=false`}
        alt={initial}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: px, height: px }}
        className={`rounded-full shrink-0 object-cover bg-bg-primary ${className}`}
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px }}
      className={`rounded-full bg-bg-primary text-white flex items-center justify-center font-extrabold shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
