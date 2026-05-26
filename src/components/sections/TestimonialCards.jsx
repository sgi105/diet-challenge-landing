// 5 card style variants for testimonials. Each takes the same props (t = testimonial row).
// Style key in DB: 'classic' | 'compact' | 'quote' | 'polaroid' | 'minimal'

const TYPE_META = {
  '회의론자→전환': { bg: 'bg-orange-50', text: 'text-orange-600' },
  '팀효과':        { bg: 'bg-sky-50',    text: 'text-sky-600' },
  '습관형성':      { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  '바쁜일상':      { bg: 'bg-violet-50',  text: 'text-violet-600' },
  '경쟁심리':      { bg: 'bg-rose-50',    text: 'text-rose-600' },
  '초보가능':      { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  '미라클모닝':    { bg: 'bg-amber-50',   text: 'text-amber-600' },
};

// eslint-disable-next-line react-refresh/only-export-components
export function anonymize(name) {
  if (!name) return '';
  return name[0] + '★';
}

// eslint-disable-next-line react-refresh/only-export-components
export function renderCaption(caption, highlights) {
  if (!caption) return '';
  if (!highlights || highlights.length === 0) return caption;
  const ranges = highlights
    .map((hl) => ({ hl, idx: caption.indexOf(hl) }))
    .filter(({ idx }) => idx !== -1)
    .sort((a, b) => a.idx - b.idx);
  if (ranges.length === 0) return caption;
  const parts = [];
  let cursor = 0;
  for (const { hl, idx } of ranges) {
    if (idx < cursor) continue;
    if (idx > cursor) parts.push(<span key={`p-${cursor}`}>{caption.slice(cursor, idx)}</span>);
    parts.push(
      <span key={`h-${idx}`} className="text-bg-deep font-extrabold">{hl}</span>
    );
    cursor = idx + hl.length;
  }
  if (cursor < caption.length) parts.push(<span key="p-tail">{caption.slice(cursor)}</span>);
  return parts;
}

function meta(t) {
  return TYPE_META[t.type] || { bg: 'bg-gray-50', text: 'text-gray-500' };
}

function Likes({ t }) {
  return (
    <div className="flex items-center gap-4 pt-1 border-t border-card-border">
      <span className="flex items-center gap-1 text-card-ink-faint text-[11px] font-bold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rose-400">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        {t.likes || 0}
      </span>
      <span className="flex items-center gap-1 text-card-ink-faint text-[11px] font-bold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-card-ink-faint">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {t.comments || 0}
      </span>
    </div>
  );
}

// ─── 1) CLASSIC ──── big square photo on top, name+type+caption+likes below
function ClassicCard({ t }) {
  const m = meta(t);
  return (
    <div className="max-w-lg mx-auto w-full bg-bg-card rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
      <div className="relative w-full aspect-[4/3] bg-bg-card-hover">
        {t.img && (
          <img
            src={t.img}
            alt={`${t.name} 인증`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
          />
        )}
      </div>
      <div className="px-5 pt-4 pb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-card-ink font-extrabold text-sm">{anonymize(t.name)}</span>
          {t.type && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${m.bg} ${m.text}`}>
              {t.type}
            </span>
          )}
        </div>
        <p className="text-card-ink-muted text-[12px] leading-relaxed">
          {renderCaption(t.caption, t.highlight)}
        </p>
        <Likes t={t} />
      </div>
    </div>
  );
}

// ─── 2) COMPACT ──── horizontal thumbnail + text
function CompactCard({ t }) {
  const m = meta(t);
  return (
    <div className="max-w-lg mx-auto w-full bg-bg-card rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
      <div className="flex gap-3 p-3">
        {t.img && (
          <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-bg-card-hover">
            <img src={t.img} alt={`${t.name} 인증`} loading="lazy" className="w-full h-full object-cover"
                 onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
          </div>
        )}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-card-ink font-extrabold text-sm">{anonymize(t.name)}</span>
            {t.type && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${m.bg} ${m.text}`}>
                {t.type}
              </span>
            )}
          </div>
          <p className="text-card-ink-muted text-[12px] leading-relaxed line-clamp-4">
            {renderCaption(t.caption, t.highlight)}
          </p>
          <div className="flex items-center gap-3 text-card-ink-faint text-[10px] font-bold pt-1">
            <span>♥ {t.likes || 0}</span>
            <span>💬 {t.comments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3) QUOTE ──── big quotation marks, no photo, name at bottom
function QuoteCard({ t }) {
  const m = meta(t);
  return (
    <div className="max-w-lg mx-auto w-full bg-bg-card rounded-3xl px-6 py-7 shadow-[0_12px_32px_rgba(0,0,0,0.14)] relative overflow-hidden">
      <div className="absolute top-2 left-4 text-[80px] leading-none text-bg-card-hover font-serif select-none pointer-events-none">"</div>
      <div className="relative">
        <p className="text-card-ink text-[15px] leading-relaxed mb-5 italic">
          {renderCaption(t.caption, t.highlight)}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-card-border">
          <span className="text-card-ink font-extrabold text-sm">— {anonymize(t.name)}</span>
          {t.type && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${m.bg} ${m.text}`}>
              {t.type}
            </span>
          )}
          <span className="ml-auto text-card-ink-faint text-[11px] font-bold">♥ {t.likes || 0} · 💬 {t.comments || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 4) POLAROID ──── photo main + caption at bottom like a polaroid
function PolaroidCard({ t }) {
  const m = meta(t);
  return (
    <div className="max-w-lg mx-auto w-full bg-white rounded-sm overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.22)] pt-3 px-3 pb-4 -rotate-[0.4deg]">
      <div className="relative w-full aspect-square bg-bg-card-hover">
        {t.img && (
          <img src={t.img} alt={`${t.name} 인증`} loading="lazy" className="w-full h-full object-cover"
               onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
        )}
      </div>
      <div className="pt-3 px-1 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-900 font-extrabold text-sm">{anonymize(t.name)}</span>
          {t.type && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${m.bg} ${m.text}`}>
              {t.type}
            </span>
          )}
        </div>
        <p className="text-gray-700 text-[12px] leading-relaxed font-handwriting">
          {renderCaption(t.caption, t.highlight)}
        </p>
        <p className="text-gray-400 text-[10px] font-bold pt-1">♥ {t.likes || 0} · 💬 {t.comments || 0}</p>
      </div>
    </div>
  );
}

// ─── 5) MINIMAL ──── small circular avatar + text-forward
function MinimalCard({ t }) {
  const m = meta(t);
  const initial = (t.name || '?').charAt(0);
  return (
    <div className="max-w-lg mx-auto w-full bg-bg-card rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-bg-card-hover flex items-center justify-center text-card-ink-muted font-extrabold text-sm">
          {t.img ? (
            <img src={t.img} alt={t.name} loading="lazy" className="w-full h-full object-cover"
                 onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : initial}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-card-ink font-extrabold text-sm">{anonymize(t.name)}</span>
          {t.type && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none self-start mt-1 ${m.bg} ${m.text}`}>
              {t.type}
            </span>
          )}
        </div>
        <span className="text-card-ink-faint text-[11px] font-bold shrink-0">♥{t.likes || 0}</span>
      </div>
      <p className="text-card-ink-muted text-[13px] leading-relaxed">
        {renderCaption(t.caption, t.highlight)}
      </p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const CARD_STYLES = {
  classic: { label: 'Classic', desc: '큰 사진 + 강조 본문', Component: ClassicCard },
  compact: { label: 'Compact', desc: '가로형 작은 썸네일', Component: CompactCard },
  quote:   { label: 'Quote',   desc: '인용문 큰 따옴표',    Component: QuoteCard },
  polaroid:{ label: 'Polaroid',desc: '폴라로이드 캡션',     Component: PolaroidCard },
  minimal: { label: 'Minimal', desc: '아바타 원형 + 텍스트',Component: MinimalCard },
};

export function CardByStyle({ style, t }) {
  const def = CARD_STYLES[style] || CARD_STYLES.classic;
  const Cmp = def.Component;
  return <Cmp t={t} />;
}
