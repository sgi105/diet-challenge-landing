import cohort from '../../data/cohort.json';

const VIDEO_RE = /\.(mp4|mov|webm|m4v)(\?|$)/i;

function MediaTile({ url, alt }) {
  if (VIDEO_RE.test(url)) {
    return (
      <video
        src={url}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        className="w-full h-full object-cover bg-black"
      />
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover bg-bg-card-hover"
      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
    />
  );
}

export default function CohortPhotoCarousel() {
  const posts = cohort.top_posts;

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
      {posts.map((p, i) => {
        const lossSoFar =
          p.weight_start && p.weight != null
            ? +(p.weight_start - p.weight).toFixed(1)
            : null;
        const captionShort = p.caption.length > 90 ? p.caption.slice(0, 90).trim() + '…' : p.caption;
        return (
          <div
            key={i}
            className="snap-start shrink-0 w-[68vw] max-w-[280px] bg-bg-card rounded-2xl overflow-hidden flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
          >
            <div className="relative aspect-square">
              <MediaTile url={p.media_url} alt={`${p.name} Day ${p.day} 인증`} />
              <div className="absolute top-2 left-2 bg-bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider">
                DAY {p.day}
              </div>
              {lossSoFar > 0 && (
                <div className="absolute top-2 right-2 bg-accent-green text-bg-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  -{lossSoFar}kg
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-card-ink text-xs font-extrabold">{p.name}</span>
                <span className="text-card-ink-faint text-[10px] font-semibold">♥ {p.likes}</span>
              </div>
              <p className="text-card-ink-muted text-[11px] leading-relaxed line-clamp-3 whitespace-pre-line">
                {captionShort}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
