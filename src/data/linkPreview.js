// 링크 미리보기(카톡·인스타·페북에 링크 붙였을 때 뜨는 카드) — 단일 출처.
//
// 여기 값이 자동으로 세 군데에 들어간다:
//   ① index.html 의 제목·설명 메타 태그 (vite.config.js 의 linkPreviewPlugin 이 빌드 때 채움)
//   ② 미리보기 이미지 /api/og (api/og.js 가 요청 때 이 값으로 그림)
//   ③ 이미지 주소의 ?v= 버전 — 아래 값이 바뀌면 주소가 바뀌어서 카톡·메타가 새 이미지로 인식
// 기수가 바뀌면 season 데이터만 바꾸면 따라온다. 데이터에 없는 값(firstMinutes)만 여기서 직접 고친다.
//
// 디자인 SOT: design-references/og6/og6.html ② (가인 2026-10-25)
import { COHORT7 as COHORT, HERO_BAR7 as HERO_BAR, PROGRAM7 } from './season7.js';

// 첫날 러닝 시간(분). 261130_team_run_season7 = Day 1 합류 → 5분.
const FIRST_MINUTES = PROGRAM7.startMinutes;

const trial = HERO_BAR.freeDays;
const total = HERO_BAR.totalDays;
const fee = PROGRAM7.feeLabel;

export const LINK_PREVIEW = {
  title: `${total}일 하프마라톤 프로그램 · 첫 ${trial}일 ${fee} 체험`,
  description: `첫 ${trial}일 ${fee} 체험 · 하루 ${FIRST_MINUTES}분부터 · ${COHORT.teamSize}인 1팀 · 정원 ${COHORT.totalSpots}명 · ${COHORT.startDate} 시작`,
  // 검색엔진용 설명(조금 길게)
  metaDescription: `혼자선 맨날 실패한 러닝. ${total}일 하프마라톤 프로그램의 첫 ${trial}일을 ${fee}으로 체험해. 하루 ${FIRST_MINUTES}분부터 · ${COHORT.teamSize}인 1팀 · 정원 ${COHORT.totalSpots}명 · ${COHORT.startDate} 시작.`,
  image: {
    tag: `${total}D HALF · TEAM`,
    kickerAccent: `${total}일`,
    kicker: ' 안에 완성하는',
    headline: '인생 최고의 몸',
    sub: '하프 뛰면 저절로 따라온다',
    chips: [`첫 ${trial}일 ${fee}`, `하루 ${FIRST_MINUTES}분부터`, `${COHORT.teamSize}인 1팀`],
    photo: '/s5v2/after.jpg',
  },
};

export const SITE_URL = 'https://challenge.samuraihabits.com';

// 내용이 바뀌면 바뀌는 짧은 버전 문자열 — 이미지 주소에 붙여 캐시를 깬다.
export function previewVersion() {
  const s = JSON.stringify(LINK_PREVIEW);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export const PREVIEW_IMAGE_URL = `${SITE_URL}/api/og?v=${previewVersion()}`;
