# 랜딩 공개 링크 SOT

`challenge.samuraihabits.com` 에서 나가는 모든 공개 URL의 단일 출처.
링크를 새로 만들거나 바꾸면 **여기부터 업데이트**한다.

---

## URL 네임스페이스

| 네임스페이스 | 용도 |
|---|---|
| `/guide/<slug>` | 상시 가이드 (DM·댓글로 뿌리는 리드마그넷) |
| `/ot/<코호트코드>` | 기수 자료 (OT 자료 등, 코호트별) |
| `/r/<name>` | 단축 리다이렉트 |

**슬러그 규칙**: 영문 소문자 + 하이픈만. **기수명·날짜·연도를 넣지 않는다.**
(가이드는 여러 기수에 걸쳐 재사용되므로 슬러그에 기수를 박으면 다음 기수에서 URL이 어긋난다.)

---

## 현재 살아있는 링크

| 이름 | 공개 URL | 소스 파일 | 용도 |
|---|---|---|---|
| 런린이 실수 7가지 | https://challenge.samuraihabits.com/guide/run-mistakes | `public/guide/run-mistakes.html` | 러닝 초보 대상 리드마그넷. DM·댓글 배포 |
| 식단 가이드 (1.5끼 전략) | https://challenge.samuraihabits.com/guide/diet | `public/guide/diet.html` | 다이어트 식단 리드마그넷. DM·댓글 배포 |

`/ot/`, `/r/` 는 자리만 확보된 상태 (2026-08-24 기준 파일 없음).

---

## 가이드 추가하는 법

1. `public/guide/<slug>.html` 파일 추가
2. 위 "현재 살아있는 링크" 표에 한 줄 추가
3. commit + push

`vercel.json` 은 건드릴 필요 없다. `/guide/:slug` 와일드카드가 이미 확장자 없는 주소를 파일로 연결한다.

---

## 구 링크 301 매핑

파일 이동 전에 이미 뿌려진 주소들. `vercel.json` 의 `redirects` 에 영구(301) 리다이렉트로 살려둔다.
**절대 지우지 말 것** — 지우면 이미 나간 DM·댓글 링크가 전부 깨진다.

| 구 주소 | 새 주소 |
|---|---|
| `/running-mistakes-guide.html` | `/guide/run-mistakes` |
| `/diet-guide.html` | `/guide/diet` |

---

## vercel.json 라우팅 구조 (왜 이렇게 생겼나)

```
redirects   구 링크 2개 → 새 주소 (301). rewrites 보다 먼저 평가된다.
rewrites[0] /guide/:slug        → /guide/:slug.html   (확장자 없이 접근)
rewrites[1] /((?!guide/|ot/|r/).*) → /                (SPA catch-all)
```

catch-all 에서 `guide/`, `ot/`, `r/` 를 제외하는 이유:
예전에는 `/(.*)` 가 **모든 주소를 200 + 랜딩 홈**으로 삼켰다.
그래서 오타 난 가이드 링크를 뿌려도 404가 안 나고 그냥 랜딩이 떠서 아무도 눈치를 못 챘다.
이제 `/guide/없는슬러그` 는 진짜 404가 난다.

⚠️ `cleanUrls` 옵션은 쓰지 않는다. redirect 순서와 충돌해서 구 링크가 깨질 수 있다.
