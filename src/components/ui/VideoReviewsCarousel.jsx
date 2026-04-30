import { useEffect, useRef, useState } from 'react';
import videos from '../../data/videoReviews.json';

// "**bold**" → <strong> 렌더링
function renderEmphasis(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="text-bg-primary font-extrabold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function VideoCard({ v }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => {
      if (el.duration > 0) setProgress(el.currentTime / el.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) { el.play(); }
    else { el.pause(); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  // 하위 호환: highlights 없으면 caption을 한 줄로
  const lines = Array.isArray(v.highlights) && v.highlights.length > 0
    ? v.highlights
    : (v.caption ? [v.caption] : []);

  return (
    <div className="snap-start shrink-0 w-[78vw] max-w-[300px] bg-bg-card rounded-3xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div className="relative aspect-[9/16] bg-black cursor-pointer" onClick={togglePlay}>
        <video
          ref={ref}
          src={v.src}
          poster={v.poster || undefined}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {/* progress bar (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-accent-green transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        {/* mute toggle */}
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-bg-primary border-2 border-accent-green text-accent-green flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
          aria-label={muted ? '음소거 해제' : '음소거'}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
        {/* play/pause overlay (when paused) */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-white text-5xl">▶</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-3 space-y-0.5">
          {lines.map((line, i) => (
            <p key={i} className="text-card-ink-muted text-[12.5px] font-medium leading-relaxed">
              {renderEmphasis(line)}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-card-border">
          <div className="w-7 h-7 rounded-full bg-bg-primary text-white flex items-center justify-center text-[11px] font-extrabold">
            {v.name?.[0] || '?'}
          </div>
          <div className="leading-tight">
            <p className="text-card-ink text-xs font-extrabold">{v.name}</p>
            <p className="text-card-ink-faint text-[10px] font-semibold">{v.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoReviewsCarousel() {
  if (!videos || videos.length === 0) return null;
  // 데스크톱: 가운데 정렬 / 모바일: 좌측부터 자연 스크롤
  // outer = 스크롤 컨테이너, inner = w-fit + mx-auto 로 콘텐츠 폭만큼만 잡고 가운데.
  return (
    <div
      className="overflow-x-auto pb-3 snap-x snap-mandatory"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="flex gap-4 w-fit mx-auto">
        {videos.map((v, i) => <VideoCard key={i} v={v} />)}
      </div>
    </div>
  );
}
