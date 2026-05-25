function pad2(n) {
  return n.toString().padStart(2, '0');
}

function fmtDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${pad2(s)}`;
}

function fmtPace(secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return null;
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}'${pad2(s)}"/km`;
}

function fmtDate(iso) {
  if (!iso) return null;
  const [, mo, d] = iso.split('-');
  return `${parseInt(mo, 10)}/${parseInt(d, 10)}`;
}

export default function PhotoCard({ photo }) {
  const dist =
    Number.isFinite(photo.distance_km) && photo.distance_km > 0
      ? `${photo.distance_km.toFixed(2)}km`
      : null;
  const dur = fmtDuration(photo.duration_sec);
  const pace = fmtPace(photo.pace_sec_per_km);
  const dateStr = fmtDate(photo.date);

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-card-hover shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
      <img
        src={photo.photo_url}
        alt={`${photo.user_initial}★ ${dateStr ?? ''} 인증`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.opacity = '0.3';
        }}
      />

      {/* 아바타 — 좌상단 */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/45 backdrop-blur-sm rounded-full pl-1 pr-2 py-1">
        {photo.avatar_url ? (
          <img
            src={photo.avatar_url}
            alt=""
            className="w-5 h-5 rounded-full object-cover bg-white/20"
            loading="lazy"
          />
        ) : (
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold text-white">
            {photo.user_initial}
          </span>
        )}
        <span className="text-white text-[10px] font-extrabold leading-none">
          {photo.user_initial}★
        </span>
      </div>

      {/* 좋아요 — 우상단 (좋아요 1+ 일 때만) */}
      {photo.likes > 0 && (
        <div className="absolute top-2 right-2 bg-black/45 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <span className="text-white text-[10px] font-extrabold leading-none">♥ {photo.likes}</span>
        </div>
      )}

      {/* 하단 그라데이션 + 오버레이 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 pt-12 pb-2.5 px-3 bg-gradient-to-t from-black/85 via-black/55 to-transparent">
        {dist || dur ? (
          <p className="text-white font-black tabular-nums text-base sm:text-lg leading-tight drop-shadow-sm">
            {dist && <span>{dist}</span>}
            {dist && dur && <span className="text-white/70 mx-1.5">·</span>}
            {dur && <span>{dur}</span>}
          </p>
        ) : (
          <p className="text-white/80 font-extrabold text-xs leading-tight">
            {photo.log_type === 'weight' ? '체중 인증' : '운동 인증'}
          </p>
        )}
        <p className="text-white/85 text-[10px] sm:text-[11px] font-bold tabular-nums leading-tight mt-0.5">
          {pace && <span>{pace}</span>}
          {pace && dateStr && <span className="text-white/55 mx-1.5">·</span>}
          {dateStr && <span className="text-white/70">{dateStr}</span>}
        </p>
      </div>
    </div>
  );
}
