// [621] 신청 폼 e2e — 새 목표/OT 단계 화면 캡처 + 실제 제출까지.
import { chromium } from 'playwright';

const KEY = 'samurai-season2-apply-v1';
const base = {
  name: '621폼테스트', age: '33', gender: 'M', phoneCountry: 'KR', phone: '01000000622',
  job: '테스트', region: '서울', runningExp: 'run_5km',
  motivation: '621 폼 개편 점검용 테스트 지원서입니다. 30자를 넘기기 위한 문장입니다.',
  goals: [], goalsOther: '', instagram: 'test621', kakaoId: '', friend: '', referrerName: '',
  agreeDeposit: true, agreeSchedule: false,
  shortGoal: '', current5k: { h: '', m: '', s: '' },
  targetDistance: '', targetTime: { h: '', m: '', s: '' }, otAttend: '',
};

const STEPS = ['intro','name','age','gender','phone','job','region','runningExp','shortGoal','motivation','goals','instagram','friend','deposit','ot'];
const at = (k) => STEPS.indexOf(k);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));

async function show(stepKey, form, file) {
  await p.goto('http://localhost:5173/apply');
  await p.evaluate(([k, s, f]) => localStorage.setItem(k, JSON.stringify({ step: s, form: f })), [KEY, at(stepKey), form]);
  await p.goto('http://localhost:5173/apply', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `/tmp/${file}.png`, fullPage: true });
  console.log(`${stepKey} → ${file}.png`);
}

// 1) 단기 목표 — 미선택 / 기록향상 선택(기록 입력 노출)
await show('shortGoal', base, '621-f-short-empty');
await show('shortGoal', { ...base, shortGoal: 'pr_5k', current5k: { h: '', m: '28', s: '30' } }, '621-f-short-pr');

// 2) 최종 목표 — 기록 단축 선택 → 거리 + 목표시간
await show('goals', { ...base, shortGoal: 'pr_5k', current5k: { h: '', m: '28', s: '30' }, goals: ['pr_pace'], targetDistance: 'half', targetTime: { h: '1', m: '45', s: '00' } }, '621-f-goals-pace');

// 3) OT 단계
await show('ot', { ...base, shortGoal: 'pr_5k', current5k: { h: '', m: '28', s: '30' }, goals: ['pr_pace'], targetDistance: 'half', targetTime: { h: '1', m: '45', s: '00' } }, '621-f-ot');

// 4) 검증 동작 — OT 미선택 상태로 제출 시도
await p.getByRole('button', { name: /제출/ }).click();
await p.waitForTimeout(300);
const errText = await p.locator('.text-accent-orange, [class*="text-red"]').first().innerText().catch(() => '(에러문구 못찾음)');
console.log('OT 미선택 제출 →', errText.replace(/\n/g, ' '));

// 5) 실제 제출
await p.getByRole('button', { name: /참석할 수 있어/ }).click();
await p.waitForTimeout(200);
await p.getByRole('button', { name: /제출/ }).click();
await p.waitForURL(/apply\/done/, { timeout: 15000 });
console.log('제출 완료 →', p.url());
await p.screenshot({ path: '/tmp/621-f-done.png', fullPage: true });

console.log('errors:', errs.length ? errs : 'none');
await b.close();
