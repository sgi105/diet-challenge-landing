import { useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';

const TYPE_META = {
  '회의론자→전환': { bg: 'bg-orange-50', text: 'text-orange-600' },
  '팀효과':        { bg: 'bg-sky-50',    text: 'text-sky-600' },
  '습관형성':      { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  '바쁜일상':      { bg: 'bg-violet-50',  text: 'text-violet-600' },
  '경쟁심리':      { bg: 'bg-rose-50',    text: 'text-rose-600' },
  '초보가능':      { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
};

// 상단 배치 기준: 1) 인물 사진 선명한 카드 2) 전환율 유형 순
// likes/comments: 앱 피드 실측 기준 근사치
const TESTIMONIALS = [
  {
    name: '성현곤',
    type: '경쟁심리',
    highlight: ['긴장해야겠다는 생각이 자주들어요'],
    caption: '정말 열심히 하는데 다른팀들도 점수가 비슷해서 긴장해야겠다는 생각이 자주들어요!!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/734fb172-26f7-403e-90bd-652e6aedca9d/posts/1779321229853-w13x353aevq.jpg',
    likes: 14, comments: 3,
  },
  {
    name: '박민아',
    type: '회의론자→전환',
    highlight: ['못할줄', '조아보인다 요즘에'],
    caption: '야 민아야 너 대단하다야!! 햇네!!!! 못할줄 ! ㅠ 니 원래 횡단보도 간당간당해도 안 건너갓자나,,, 앞으로도 계속행 ~ >_< 조아보인다 요즘에!!!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/c869cac1-a99c-4029-abb8-e81ad93ec0d2/posts/1779626456707-43umsyup63i.jpg',
    likes: 18, comments: 4,
  },
  {
    name: '이혜윤',
    type: '회의론자→전환',
    highlight: ['뛰기가 너무 싫은데', '스스로 빨리 뛰러 나가고 싶다라고 생각하게 될 줄 몰랐어요'],
    caption: '뛰기가 너무 싫은데 러너가 되고 싶어서 신청한 챌린지인데, 제가 스스로 빨리 뛰러 나가고 싶다라고 생각하게 될 줄 몰랐어요. 타잔 코치님 우리 팀원들 모두 정말 감사합니다',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/053a57b6-f700-4776-bd52-d6533f8075b5/posts/1779075356087-hpvjb2rkr4.jpg',
    likes: 9, comments: 1,
  },
  {
    name: '한소현',
    type: '습관형성',
    highlight: ['생일런', '뿌듯해용'],
    caption: '오늘 생일이라 해보고 싶었던 생일런 뛰고 왔습니다! 나름 몸 가볍게 뛰고 페이스도 잘 나온 것 같아서 뿌듯해용',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/0f8543cc-821b-4e9a-9a01-9ef739063adf/posts/1779499377041-7dw42juacw6.jpg',
    likes: 15, comments: 3,
  },
  {
    name: '지소희',
    type: '습관형성',
    highlight: ['하루도 빼먹지않고', '어떤기분이어도 한다'],
    caption: '스스로 칭찬! 하루도 빼먹지않고 꾸준함 대다나다 지쏘히!! 안 하는거 안한다! 한다면 한다! 어떤기분이어도 한다!!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/a5d12622-ff6a-4393-bdac-8ecbf06a926a/2026-05-18/run/1779146921270-033p9o0f97p2.jpg',
    likes: 12, comments: 2,
  },
  {
    name: '이민영',
    type: '팀효과',
    highlight: ['다들 열심히 하니까 나두 자극받고'],
    caption: '모든 팀들을 보고 자극받지.. 다들 열심히 하니까 나두 자극받고 기냥 뛰는거지... 모두들 잘하고 있고 성공할거에요',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/426c872c-b22d-4329-89e7-333426d872a7/posts/1779320713747-lp73v32wklg.jpg',
    likes: 16, comments: 3,
  },
  {
    name: '최우혁',
    type: '바쁜일상',
    highlight: ['일 끝나고 집가는 길에 뛰는 나의 모습'],
    caption: '나와의 약속을 지키기 위해 일 끝나고 집가는 길에 뛰는 나의 모습. 앞으로도 파이팅.',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/5a2bf9ca-1d7e-4a3d-a4f0-3209b38f83f2/posts/1779196592790-kokou47q7lq.jpg',
    likes: 11, comments: 2,
  },
  {
    name: '신연우',
    type: '팀효과',
    highlight: ['혼자가 아닌 팀원과 함께해서', '포기하고싶을때 으쌰으쌰 할수있었어요'],
    caption: '매일 오전에 작은습관으로 시작해서 런닝습관을 키울수있었고, 혼자가 아닌 팀원과 함께해서 더 포기하고싶을때 으쌰으쌰 할수있었어요 ❤︎ 좋은 챌린지 앞으로도 계속 해나갈거에요',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/587cc169-0d99-4e5e-8e1e-0451c0883f89/posts/1777279895853-wjhp93wztzb.jpg',
    likes: 19, comments: 4,
  },
  {
    name: '이지연',
    type: '바쁜일상',
    highlight: ['건강이 최고다'],
    caption: '나는 노는걸 좋아해요. 먹는것도 좋아해요. 원하는걸 하려면 건강해야해서 운동하는 것 같아요. 건강이 최고다!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/af2623ac-aa71-4d3c-bab0-e525c4654f8d/posts/1779493865715-kjvm6hw0w5b.jpg',
    likes: 13, comments: 2,
  },
  {
    name: '신연우',
    type: '습관형성',
    highlight: ['나 매일 대단한 도전을 하고있구나 느꼈어'],
    caption: '9분동안 7속도로 쉬지않고 달린건 처음인데, 인터벌 방식만 해오다가 이렇게 1분씩 늘려가면서 점점 심폐지구력도 늘어가고 체력도 늘어가겠구나.. 나 매일 대단한 도전을 하고있구나 느꼈어',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/587cc169-0d99-4e5e-8e1e-0451c0883f89/posts/1775478492245-9mrhfnxkpzv.jpg',
    likes: 17, comments: 3,
  },
  {
    name: '이지영',
    type: '초보가능',
    highlight: ['매일 성장하고 있는 내가 자랑스러워'],
    caption: '오늘은 중간에 2분 안걷고 풀로 쭉 뛰었어! 매일 성장하고 있는 내가 자랑스러워!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/e3c67456-47fa-48af-ad25-49ca3a06a87b/posts/1778367835003-ug88i4wysd.jpg',
    likes: 14, comments: 2,
  },
  {
    name: '조유정',
    type: '습관형성',
    highlight: ['지구력이 조금씩 좋아지고있는거 같습니다'],
    caption: '지구력이 조금씩 좋아지고있는거 같습니다!!! 끈기도…!!! 화이팅~~!!!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/08094f75-2713-42a2-a276-c7e9c1bd2ec6/posts/1779100841721-e8dgft3qzpb.jpg',
    likes: 12, comments: 2,
  },
  {
    name: '김지운',
    type: '바쁜일상',
    highlight: ['필라테스 끝나고 러닝 한 바퀴'],
    caption: '집 앞 저녁 9시, 필라테스 끝나고 러닝 한 바퀴. 땀이 줄줄',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/4bfcdf4c-e539-43e9-a7f8-fa65e57f5369/posts/1778588263613-joe60nna6ng.jpg',
    likes: 15, comments: 2,
  },
  {
    name: '신대훈',
    type: '바쁜일상',
    highlight: ['실패하면 저녁'],
    caption: '대부분 중랑천에서 뛰어요! 시간은 웬만하면 아침, 실패하면 저녁..ㅎ',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/b458e153-7617-4a5d-8756-57cbb1224193/posts/1778575914309-os2sj4g1ba.jpg',
    likes: 11, comments: 2,
  },
  {
    name: '천윤희',
    type: '경쟁심리',
    highlight: ['비와도 야외런'],
    caption: '매일매일 모닝런 하는 분! 비와도 야외런 하는 분! 부지런하고 꾸준하다 🔥',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/e28f1480-b3af-4fc4-b350-d99647429015/posts/1779319208652-x1gxup7oqmm.jpg',
    likes: 13, comments: 2,
  },
  {
    name: '김신현',
    type: '초보가능',
    highlight: ['다시 운동 열심히 해보려고'],
    caption: '안녕 나는 여름에는 잠 잘때 빼곤 집에 없는데 겨울에는 집에만 있는 사람이야🥲 다시 운동 열심히 해보려고!!',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/ecdacb6f-04ea-43ba-9abc-9ae03b25e9c8/posts/1777960453215-vtxhnj7nz8.jpg',
    likes: 17, comments: 3,
  },
  {
    name: '이혜윤',
    type: '초보가능',
    highlight: ['매일 조금씩 배워가는 중'],
    caption: '시선처리..? 발 디딜 곳을 봐야할지 멀리 봐야할지 왔다갔다 하고 있어요 ㅋㅋㅋ 매일 조금씩 배워가는 중',
    img: 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/053a57b6-f700-4776-bd52-d6533f8075b5/posts/1778905433125-we1btrk9sqo.jpg',
    likes: 16, comments: 3,
  },
];

const stats = [
  { value: '30/30', label: '인증 완주율' },
  { value: '20일+', label: '최장 연속 인증' },
  { value: '10팀', label: '3인 × 10팀 운영' },
];

function anonymize(name) {
  if (name.length <= 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function renderCaption(caption, highlights) {
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
    if (idx > cursor)
      parts.push(<span key={`p-${cursor}`}>{caption.slice(cursor, idx)}</span>);
    parts.push(
      <span key={`h-${idx}`} className="text-bg-deep font-extrabold">
        {hl}
      </span>
    );
    cursor = idx + hl.length;
  }

  if (cursor < caption.length)
    parts.push(<span key="p-tail">{caption.slice(cursor)}</span>);

  return parts;
}

function TestimonialCard({ t }) {
  const meta = TYPE_META[t.type] || { bg: 'bg-gray-50', text: 'text-gray-500' };

  return (
    <div className="max-w-lg mx-auto w-full bg-bg-card rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
      {/* Photo — full width, 4:3 ratio */}
      <div className="relative w-full aspect-[4/3] bg-bg-card-hover">
        <img
          src={t.img}
          alt={`${t.name} 인증`}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
        />
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-4 flex flex-col gap-3">
        {/* Name + type badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-card-ink font-extrabold text-sm">{anonymize(t.name)}</span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${meta.bg} ${meta.text}`}>
            {t.type}
          </span>
        </div>

        {/* Caption — full, no truncation */}
        <p className="text-card-ink-muted text-[12px] leading-relaxed">
          {renderCaption(t.caption, t.highlight)}
        </p>

        {/* Likes + comments */}
        <div className="flex items-center gap-4 pt-1 border-t border-card-border">
          <span className="flex items-center gap-1 text-card-ink-faint text-[11px] font-bold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rose-400">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {t.likes}
          </span>
          <span className="flex items-center gap-1 text-card-ink-faint text-[11px] font-bold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-card-ink-faint">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {t.comments}
          </span>
        </div>
      </div>
    </div>
  );
}

const INITIAL_COUNT = 6;

export default function TestimonialSection() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? TESTIMONIALS : TESTIMONIALS.slice(0, INITIAL_COUNT);

  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">REAL VOICES · 참가자 후기</span>
          <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary">
            한 명도 빠지지 않고<br />
            <span className="text-accent-green">매일 움직이고 있습니다.</span>
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            시즌0 30명의 실제 인증 피드에서.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {stats.map((s, i) => (
              <div key={i} className="bg-bg-card rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-card-ink font-extrabold text-xl md:text-2xl leading-none">{s.value}</p>
                <p className="text-card-ink-faint text-[10px] md:text-[11px] mt-1.5 font-bold tracking-wide leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="flex flex-col gap-4 mb-6">
            {visible.map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} t={t} />
            ))}
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full bg-bg-card text-card-ink font-extrabold py-4 rounded-2xl border border-white/10 hover:border-accent-green/40 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            {expanded ? '접기' : '후기 더보기 (20개 전체 보기)'}
          </button>
        </AnimateOnScroll>

        <p className="text-text-muted text-[11px] text-center leading-relaxed mt-6">
          사진/캡션은 실제 앱 피드 기준. 이름은 본인 동의 하에 실명 노출.
        </p>
      </div>
    </section>
  );
}
