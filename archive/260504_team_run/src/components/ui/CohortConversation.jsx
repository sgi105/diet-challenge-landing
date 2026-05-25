import { useState } from 'react';
import cohort from '../../data/cohort.json';

const VIDEO_RE = /\.(mp4|mov|webm|m4v)(\?|$)/i;

function relTime(ts) {
  const ms = new Date(ts).getTime();
  const start = new Date('2026-04-02T00:00:00+09:00').getTime();
  const day = Math.floor((ms - start) / 86400000) + 1;
  return `Day ${day}`;
}

function Avatar({ name, src, size = 'md' }) {
  const palette = ['bg-bg-primary', 'bg-accent-green', 'bg-accent-orange', 'bg-bg-deep'];
  const idx = (name?.charCodeAt(0) || 0) % palette.length;
  const ink = palette[idx] === 'bg-accent-green' ? 'text-bg-primary' : 'text-white';
  const dim = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name?.[0] || '?'}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover bg-bg-card-hover ${dim}`}
      />
    );
  }
  return (
    <div className={`shrink-0 rounded-full ${palette[idx]} ${ink} flex items-center justify-center font-extrabold ${dim}`}>
      {name?.[0] || '?'}
    </div>
  );
}

// "@김OO ..." 같은 답글이면 (mention, rest) 반환, 아니면 null
function parseReply(content) {
  const trimmed = (content || '').trim();
  const m = trimmed.match(/^(@\S+)\s*([\s\S]*)$/);
  return m ? { mention: m[1], rest: m[2] } : null;
}

function CommentRow({ c }) {
  const reply = parseReply(c.content);
  if (reply) {
    // 답글 — 들여쓰기 + 작은 아바타 + 어두운 톤
    return (
      <div className="flex items-start gap-2 ml-7 pl-2 border-l-2 border-card-border/60">
        <Avatar name={c.sender} src={c.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-card-ink-muted text-[11px] font-extrabold leading-tight mb-0.5">{c.sender}</p>
          <p className="text-card-ink-muted text-[12px] leading-snug whitespace-pre-line break-words">
            <span className="text-bg-primary font-bold">{reply.mention}</span>{reply.rest ? ' ' + reply.rest : ''}
          </p>
        </div>
      </div>
    );
  }
  // 일반 댓글
  return (
    <div className="flex items-start gap-2">
      <Avatar name={c.sender} src={c.avatar} />
      <div className="flex-1 min-w-0">
        <p className="text-card-ink text-[11px] font-extrabold leading-tight mb-0.5">{c.sender}</p>
        <p className="text-card-ink-muted text-[12px] leading-snug whitespace-pre-line break-words">{c.content}</p>
      </div>
    </div>
  );
}

function ConversationCard({ convo }) {
  const isVideo = VIDEO_RE.test(convo.media_url || '');
  return (
    <div className="snap-start shrink-0 w-[88vw] max-w-[360px] bg-bg-card rounded-2xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-card-border">
        <Avatar name={convo.author} src={convo.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-card-ink text-xs font-extrabold leading-tight">{convo.author}</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">{relTime(convo.created_at)}</p>
        </div>
        <span className="text-card-ink-faint text-[10px] font-bold">💬 {convo.comment_count}</span>
      </div>

      {/* media — 모든 카드 동일 높이 (1:1 정방형) */}
      {convo.media_url && (
        <div className="w-full aspect-square bg-bg-card-hover relative overflow-hidden">
          {isVideo ? (
            <video src={convo.media_url} muted playsInline loop autoPlay preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src={convo.media_url} alt={`${convo.author} Day ${convo.day}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
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
        {convo.comments.map((c, i) => <CommentRow key={i} c={c} />)}
      </div>
    </div>
  );
}

// 랜딩에 노출 안 할 게시물 (`{author}|{day}` 키). 눈바디 측면 사진 등 본인 미공개 의사일 가능성 있는 글.
const EXCLUDE = new Set(['한O진|1']);

export default function CohortConversation() {
  const picks = cohort.conversations
    .filter(c => c.comments.length >= 5 && c.caption.length >= 20 && !EXCLUDE.has(`${c.author}|${c.day}`))
    .slice(0, 4);

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
      {picks.map((c, i) => <ConversationCard key={i} convo={c} />)}
    </div>
  );
}
