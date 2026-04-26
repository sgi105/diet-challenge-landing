import cohort from '../../data/cohort.json';

const VIDEO_RE = /\.(mp4|mov|webm|m4v)(\?|$)/i;

function relTime(ts) {
  const ms = new Date(ts).getTime();
  const start = new Date('2026-04-02T00:00:00+09:00').getTime();
  const day = Math.floor((ms - start) / 86400000) + 1;
  return `Day ${day}`;
}

function Avatar({ name }) {
  // Use a deterministic color per masked name first char (limited palette = brand only)
  const palette = ['bg-bg-primary', 'bg-accent-green', 'bg-accent-orange', 'bg-bg-deep'];
  const idx = (name?.charCodeAt(0) || 0) % palette.length;
  const ink = palette[idx] === 'bg-accent-green' ? 'text-bg-primary' : 'text-white';
  return (
    <div className={`shrink-0 w-7 h-7 rounded-full ${palette[idx]} ${ink} flex items-center justify-center text-[11px] font-extrabold`}>
      {name?.[0] || '?'}
    </div>
  );
}

function ConversationCard({ convo }) {
  const isVideo = VIDEO_RE.test(convo.media_url || '');
  return (
    <div className="snap-start shrink-0 w-[88vw] max-w-[360px] bg-bg-card rounded-2xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-card-border">
        <Avatar name={convo.author} />
        <div className="flex-1 min-w-0">
          <p className="text-card-ink text-xs font-extrabold leading-tight">{convo.author}</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">{relTime(convo.created_at)}</p>
        </div>
        <span className="text-card-ink-faint text-[10px] font-bold">💬 {convo.comment_count}</span>
      </div>

      {/* media */}
      {convo.media_url && (
        <div className="aspect-[4/3] bg-bg-card-hover relative">
          {isVideo ? (
            <video src={convo.media_url} muted playsInline loop autoPlay preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <img src={convo.media_url} alt={`${convo.author} Day ${convo.day}`} loading="lazy" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* caption */}
      {convo.caption && (
        <div className="px-3 pt-3 pb-2">
          <p className="text-card-ink-muted text-[12px] leading-relaxed whitespace-pre-line line-clamp-4">
            <span className="text-card-ink font-extrabold mr-1.5">{convo.author}</span>
            {convo.caption}
          </p>
        </div>
      )}

      {/* comments */}
      <div className="px-3 pb-3 pt-1 space-y-2 border-t border-card-border bg-bg-card-hover/40">
        <p className="text-card-ink-faint text-[10px] font-bold tracking-wider pt-2">팀이 응원한 댓글</p>
        {convo.comments.map((c, i) => (
          <div key={i} className="flex items-start gap-2">
            <Avatar name={c.sender} />
            <div className="flex-1 min-w-0">
              <p className="text-card-ink text-[11px] font-extrabold leading-tight mb-0.5">{c.sender}</p>
              <p className="text-card-ink-muted text-[12px] leading-snug whitespace-pre-line break-words">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CohortConversation() {
  // pick conversations that have decent caption + at least 5 comments
  const picks = cohort.conversations
    .filter(c => c.comments.length >= 5 && c.caption.length >= 20)
    .slice(0, 4);

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
      {picks.map((c, i) => <ConversationCard key={i} convo={c} />)}
    </div>
  );
}
