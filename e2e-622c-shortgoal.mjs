// 622c — 5K 기록 입력 안내문 + 페이스 오입력 검증 확인
// 폼이 localStorage에 {step, form}을 자동저장하므로, 그걸 심어서 shortGoal 단계로 바로 진입한다.
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5176'
const STORAGE_KEY = 'samurai-season2-apply-v1'
const MAIN_STEPS = ['intro', 'name', 'age', 'gender', 'phone', 'job', 'region', 'runningExp', 'shortGoal', 'motivation', 'goals', 'instagram', 'friend', 'deposit', 'ot']
const SHORT_GOAL_STEP = MAIN_STEPS.indexOf('shortGoal')

const seed = {
  step: SHORT_GOAL_STEP,
  form: {
    name: '테스트', age: '30', gender: 'M', phone: '01099998888',
    job: '개발', region: '서울', runningExp: 'run_5km',
    shortGoal: 'pr_5k', current5k: { h: '', m: '5', s: '32' },
    motivation: '', goals: [], goalsOther: '', targetDistance: '', targetTime: { h: '', m: '', s: '' },
    instagram: '', kakaoId: '', referrerName: '', friendName: '',
  },
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } })
const page = await ctx.newPage()
page.on('console', m => { if (m.type() === 'error') console.log('[console error]', m.text()) })
await page.addInitScript(({ k, v }) => localStorage.setItem(k, v), { k: STORAGE_KEY, v: JSON.stringify(seed) })

await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle', timeout: 45000 })
await page.waitForTimeout(1500)

const label = await page.evaluate(() => document.querySelector('label')?.textContent.trim())
console.log('[step] label:', label)

const body = await page.evaluate(() => document.body.innerText)
for (const n of ['5km 완주 기록이 어떻게 돼?', '5km를 다 뛰는 데 걸리는 시간', '1km 페이스 아니야', '27분 30초']) {
  console.log(`[copy] "${n}" →`, body.includes(n) ? 'OK' : '❌ MISSING')
}
console.log('[copy] 옛 문구 "페이스 그룹" 제거 →', body.includes('페이스 그룹') ? '❌ 남아있음' : 'OK')
await page.screenshot({ path: 'e2e-622c-copy.png', fullPage: true })

// 5:32(= 이강민이 실제로 넣은 값) 상태에서 다음 → 막혀야 한다
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /다음/.test(x.textContent))
  b?.click()
})
await page.waitForTimeout(800)
const afterBad = await page.evaluate(() => document.body.innerText)
const blocked = afterBad.includes('1km 페이스 같아')
console.log('[validate] 5:32 입력 →', blocked ? 'OK (차단됨)' : '❌ 통과해버림')
const stillHere = (await page.evaluate(() => document.querySelector('label')?.textContent.trim())) === label
console.log('[validate] 단계 안 넘어감 →', stillHere ? 'OK' : '❌ 넘어감')
await page.screenshot({ path: 'e2e-622c-blocked.png', fullPage: true })

// 정상값(27:30)이면 통과해야 한다 — 새 컨텍스트로(같은 페이지는 initScript가 값을 되돌림)
const okSeed = { ...seed, form: { ...seed.form, current5k: { h: '', m: '27', s: '30' } } }
const ctx2 = await browser.newContext({ viewport: { width: 430, height: 932 } })
const page2 = await ctx2.newPage()
await page2.addInitScript(({ k, v }) => localStorage.setItem(k, v), { k: STORAGE_KEY, v: JSON.stringify(okSeed) })
await page2.goto(`${BASE}/apply`, { waitUntil: 'networkidle', timeout: 45000 })
await page2.waitForTimeout(1200)
await page2.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /다음/.test(x.textContent))
  b?.click()
})
await page2.waitForTimeout(900)
const nextLabel = await page2.evaluate(() => document.querySelector('label')?.textContent.trim())
console.log('[validate] 27:30 입력 → 다음 단계:', nextLabel, nextLabel !== label ? '(OK 통과)' : '❌ 막힘')

await browser.close()
