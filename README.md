# 피고지고 (Bloom Circuit) — 앱인토스 `.ait` 래핑

트랙 K(기존 게임 4종 래핑) 2번째 게임. `sumo-bounce`의 8단계 레시피
(`../sumo-bounce/README.md` §11)를 **그대로** 적용했다. 새로 설계한 부분 없음
— 설계 근거/방법론은 전부 sumo-bounce README를 참고할 것. 이 문서는 이 게임
적용 시 실측값·조정 지점·검증 결과만 기록한다.

라벨: **[확인]** = 이 세션에서 직접 실행/렌더/디코드해서 봄. **[추정]** = 코드만
읽고 판단, 미실행. **실기기(진짜 토스 앱) 검증은 이 세션 범위 밖 — 미수행.**

---

## 0. 최종 상태 요약

- `.ait` 빌드: **성공**. `bloom-circuit.ait`, **3,788,006 bytes** (약 3.61MB).
  [확인]
- 11개 엔트리(4 RN 호스트 번들 + `web/index.html` + `web/game/
  bloom-circuit-game.js` + `web/assets/index-*.js`) 전수 검증 완료 — 개수·
  구조가 sumo-bounce와 동일. [확인]
- 게임 필수 SDK 4종(사용자 식별키·Safe Area·네이티브 Storage·내비게이션 바)
  코드 배선 완료, `src/toss/`를 sumo-bounce에서 통째로 재사용(범용 코드,
  게임별 커스텀 없음 — 함수 이름 그대로). [확인]
- 원본 게임 HTML **1바이트도 재작성하지 않음**(113,872 bytes 불변, 라인
  슬라이싱 추출). [확인]
- Playwright 헤드리스 크롬으로 프로덕션 빌드 렌더 확인: 콘솔 에러 0, 타이틀
  화면 렌더, 사운드 토글 → `localStorage` 반영 확인, 종료 확인 모달 렌더+
  "계속하기" 클릭으로 닫힘 확인. [확인]
- 국문명 **미확정**. 미션 지시대로 "피고지고"를 `brand.displayName`으로
  채택하고 코드에는 이 표기 하나만 남겼다 — 아래 §1 참고.

---

## 1. sumo-bounce와 달랐던 지점 (조정 필요했던 것만)

### 1-1. 국문명 표기 — "피고지고" 채택, President 확인 대기

미션 지시서 자체에 "피고지고"/"블룸 서킷" 두 표기가 혼재했다. **`brand.
displayName`은 "피고지고"로 확정**(미션 본문이 대상 게임을 지칭할 때 1순위로
쓴 표기를 채택 — `granite.config.ts` 주석에 사유 기록). 원본 게임 HTML의
`I18N.ko.title`은 `"블룸 서킷"`인데(원본 게임 내부 로컬라이제이션 데이터,
420행), **이 값은 원본 게임 콘텐츠라 1바이트도 안 건드렸다** — 그래서 게임
내부 화면(타이틀 헤더)에는 "블룸 서킷"이, 콘솔/RN 호스트 내비게이션 바
쪽에는(`brand.displayName` 주입 경로) "피고지고"가 노출되는 불일치가 지금
그대로 남아있다. **TODO(President): 국문명 최종 확정 필요.** 확정되면
`granite.config.ts`의 `brand.displayName` 한 곳만 바꾸고 재빌드하면 된다
(원본 게임 내부 텍스트는 건드리지 않는 게 원칙이라 그쪽은 별도 판단 필요).

### 1-2. 브랜드 컬러·내비게이션 바 테마 — 재계산

원본 배경 `--bg:#04161c`(짙은 청록, sumo-bounce의 `#0b0e14`보다 더 진한
정원/자연 톤)이라 WCAG 대비비를 이 세션에서 다시 계산했다(python colorimetry,
sumo-bounce와 동일 공식):

| 아이콘 색 | 배경 | 대비비 | 판정 |
|---|---|---|---|
| `#FFFFFF`(흰 아이콘) | `#04161c` | **18.47 : 1** | PASS (기준 4.5:1) |
| `#191F28`(검정 아이콘) | `#04161c` | **1.12 : 1** | FAIL |

결론은 sumo-bounce와 같은 `theme: 'dark'`(흰 아이콘)이지만, 수치는 독립
재계산했다(배경색이 다르므로 우연히 같은 결론이 나온 것 — 재계산을 생략하지
않았다).

`brand.primaryColor`는 원본 CSS `:root`의 주 액션 버튼(`.primary`) 그라디언트
끝 색상 `#2fbf95`(민트그린)를 채택 — 정원 경영(파밍) 게임의 성장/새싹 테마와
직결되는 색이라는 근거를 config 주석에 남겼다.

### 1-3. Safe Area 패치 — sumo-bounce보다 더 적은 지점(2줄), 더 간단한 구조

원본 게임의 CSS 설계 자체가 sumo-bounce와 달랐다. sumo-bounce는 `env(
safe-area-inset-*)`가 CSS 여러 규칙에 흩어져 12곳 직접 등장했지만, **피고
지고는 `:root`에서 `--safeT`/`--safeB`/`--safeL`/`--safeR` 4개 커스텀 속성으로
한 번만 `env()`를 감싸두고**(8~17행), 나머지 CSS 규칙 3곳(62·187·221행)은
이 중간 변수만 참조한다. 그래서 **`env(safe-area-inset-*)` 리터럴 사용처는
단 2줄**(16~17행, 4방향 전부 이 2줄 안에 있음)이고, 여기만 패치하면 전체가
자동으로 커버된다:

```diff
- --safeT:env(safe-area-inset-top,0px);--safeB:env(safe-area-inset-bottom,0px);
- --safeL:env(safe-area-inset-left,0px);--safeR:env(safe-area-inset-right,0px);
+ --safeT:var(--sa-top, env(safe-area-inset-top,0px));--safeB:var(--sa-bottom, env(safe-area-inset-bottom,0px));
+ --safeL:var(--sa-left, env(safe-area-inset-left,0px));--safeR:var(--sa-right, env(safe-area-inset-right,0px));
```

`src/toss/safeArea.ts`가 주입하는 CSS 변수 이름(`--sa-top/--sa-bottom/
--sa-left/--sa-right`)과 정확히 일치하는지 확인 후 진행(범용 코드라 이름은
안 바뀜, 확인만 함) — SDK 값이 있으면 그걸 쓰고, 없으면 자동으로 기존
`env()` 폴백으로 넘어간다(sumo-bounce와 동일 동작 원리).

미션 배경 조사(`_원장/게임4종_래핑현황_실측_20260802.md` §2-6)의 "Bloom
Circuit safe-area-inset 2곳"이라는 사전 카운트와 실측이 정확히 일치했다
(라인 기준 2곳 = 방향 4개가 그 2줄 안에 다 들어있음).

### 1-4. 네이티브 Storage 미러링 — `lsGet`/`lsSet` 범용 헬퍼가 없는 구조

sumo-bounce는 `lsGet`/`lsSet` 범용 헬퍼 함수 2개, 호출부 6곳, 키 3개
(`sumoSave`/`sumoMuted`/`sumoLang`)였다. **피고지고는 다른 설계**다 —
`loadSave()`(읽기)/`writeSave()`(쓰기) 두 함수가 직접 `localStorage.getItem/
setItem`을 부르고(범용 헬퍼 없음), **호출부 2곳, 키 1개**(`bloomCircuitSave3`
— 음소거·언어 설정까지 이 JSON 객체 하나 안에 다 들어있음, `defaultSave()`
정의 참고).

패치는 sumo-bounce와 동일한 1줄 미러 훅 삽입 방식을 `writeSave()`(원본
게임의 유일한 쓰기 지점)에 적용했다:

```diff
  function writeSave(){try{localStorage.setItem(SKEY,JSON.stringify(save))}catch(_){}
+   try{ if (typeof window!=='undefined' && window.__nativeStorageMirror)
+     window.__nativeStorageMirror(SKEY,JSON.stringify(save)); }catch(_){} }
```

`src/toss/storage.ts`의 `GAME_STORAGE_KEYS`도 `['bloomCircuitSave3']`
(키 1개)로, 네임스페이스도 `sumo:` → `bloom:`로 교체했다(functional 문자열
전부 grep 재확인 후 교체 — `identity.ts`의 `LOCAL_ID_KEY`, `navigationBar.ts`의
커스텀 이벤트명 `'sumo:nav-home'` → `'bloom:nav-home'` 포함).

### 1-5. `<script>` 라인 범위

원본 `Games for Toss/Bloom Circuit/index.html`(113,872 bytes)에서 `<script>`
는 411행, `</script>`는 1923행(grep 실측, sumo-bounce의 532/3490행과 다름 —
매번 재확인해야 한다는 레시피 지시 그대로 따름). 시작(`(() => {`)/끝
(`})();`) 마커도 스크립트로 재확인 후 추출.

---

## 2. `.ait` 검증 결과

### 2-1. zip 전수 검사 [확인]

```
bundle.ios.0_84_0.js       1,658,635 bytes  (+.map 3,761,829)
bundle.android.0_84_0.js   1,658,382 bytes  (+.map 3,761,257)
bundle.ios.0_72_6.js       1,698,021 bytes  (+.map 3,842,835)
bundle.android.0_72_6.js   1,697,768 bytes  (+.map 3,842,269)
web/index.html                26,493 bytes
web/game/bloom-circuit-game.js 85,721 bytes
web/assets/index-OB2k-MWN.js   25,858 bytes
```
총 11개 엔트리, sumo-bounce와 동일 구조(4 RN 호스트 + 3 web 파일 + 4 .map).

### 2-2. 유니코드 언이스케이프 후 게임 문자열 검색 [확인]

`\uXXXX` 정규식 언이스케이프 후 검색(4개 RN 호스트 + 3개 web 파일, **7개
전부**):

| 파일 | 'Bloom' | 'Circuit' | 'BLOOM CIRCUIT' | '피고지고'(언이스케이프) | '블룸'/'서킷'(언이스케이프) |
|---|---|---|---|---|---|
| bundle.ios.0_84_0.js | 0 | 0 | 0 | **2** | 0 |
| bundle.android.0_84_0.js | 0 | 0 | 0 | **2** | 0 |
| bundle.ios.0_72_6.js | 0 | 0 | 0 | **2** | 0 |
| bundle.android.0_72_6.js | 0 | 0 | 0 | **2** | 0 |
| web/game/bloom-circuit-game.js | 3 | 3 | 1 | 0 | **각 2** |
| web/index.html | (title="Bloom Circuit", 육안 확인) | | | | |
| web/assets/index-*.js | 0 | 1(appName 문자열 'bloom-circuit' 안에 포함) | 0 | 0 | 0 |

**해석(sumo-bounce §6 "함정3" 해석 그대로 적용):** RN 호스트 4개엔
`brand.displayName='피고지고'`가 빌드 시점에 주입되고, 게임 자체 HTML/JS
에는 원본 게임 내부 로컬라이제이션 데이터(`I18N.ko.title="블룸 서킷"`,
영문 타이틀 "Bloom Circuit"/"BLOOM CIRCUIT")가 그대로 남아있다 — 서로 다른
층에 서로 다른 국문 표기가 있다는 뜻이고(§1-1의 미확정 문제와 직결), 둘 다
확인해야 완전한 검증이라는 sumo-bounce의 결론이 이 게임에도 그대로
적용됨을 확인했다.

### 2-3. protobuf 헤더 직접 디코드 [확인]

`.ait` = `[8바이트 매직][12바이트 헤더][protobuf][zip]` 구조를 스키마 없이
raw varint/length-delimited 파서로 직접 디코드:

- top-level field 1 (varint) = **1** — isGame=true로 추정되는 위치 (sumo-bounce
  §7과 동일 해석 근거)
- field 2 = deploymentId `019fc171-58f3-753c-bac8-a1c548be5dc1` — `ait build`
  콘솔 출력(`deploymentId: 019fc171-58f3-753c-bac8-a1c548be5dc1`)과 **정확히
  일치**
- field 3 = `bloom-circuit` (appName) — 일치
- `brand.displayName` bytes → UTF-8 디코드 → **정확히 "피고지고"**(4글자
  UTF-8 12바이트, 바이트 단위로 직접 확인: ed94bc/eab3a0/eca780/eab3a0 =
  피/고/지/고)
- `brand.primaryColor` = `#2fbf95`, `brand.icon` = `''`(빈 문자열, **아래
  §3 참고 — 제출 불가 상태**) — config와 일치
- `webViewProps.type` = `'game'`, 나머지 6개 옵션(mediaPlaybackRequiresUser
  Action=false, allowsInlineMediaPlayback=true, bounces=false, allowsBack
  ForwardNavigationGestures=false, pullToRefreshEnabled=false, overScrollMode=
  'never') 전부 config와 일치
- `navigationBar`: withBackButton=true, withHomeButton=false, withTitle=false,
  transparentBackground=false, theme='dark' — config와 일치
- 각 번들 파일 SHA256이 매니페스트 안에 박혀 있고, zip 안 실제 파일 바이트로
  계산한 SHA256과 **11개 전수 일치**
- 맨 끝 varint(1785656868014)를 밀리초 epoch로 해석하면 `2026-08-02 07:47:48
  UTC`(= KST 16:47) — 이 세션 빌드 시각과 일치

### 2-4. Playwright 프로덕션 빌드 렌더 검증 [확인]

`dist/web/`(= `.ait` 안 `web/`과 바이트 동일)을 `python -m http.server`로
정적 서빙 → Playwright 헤드리스 Chromium(viewport 390×740)으로 렌더:

- 콘솔 에러 0건, 페이지 에러(uncaught exception) 0건.
- `#scTitle`(타이틀 화면, 이 게임은 id가 `scTitle`이지 sumo-bounce의
  `#sc-title`이 아님 — 실측 재확인 필요했던 지점) visible=true, `#game`
  (canvas, sumo-bounce는 `#gameCanvas`) 존재=true.
- `initTossSdk()` self-test 로그: `{userKey: fallback, safeArea: fallback,
  storage: ok, navigationBar: fallback}` — sumo-bounce와 동일하게 브릿지
  없는 환경에서 전부 안전 폴백.
- 사운드 토글(`#btnSound`) 클릭 → `writeSave()` 호출 확인(`localStorage`의
  `bloomCircuitSave3` 값에서 `"sound":true` → `"sound":false` 로 실제 변경됨)
  → `window.__nativeStorageMirror`가 함수로 존재.
- `popstate` 이벤트 강제 발화 → 종료 확인 모달(`#sdk-exit-confirm-overlay`,
  "게임을 종료할까요?") 렌더 확인 → "계속하기" 버튼 클릭 → 모달 닫힘
  확인(스크린샷: `_verify_evidence/title-screen-prod-build.png`,
  `exit-confirm-modal.png`, `after-continue-click.png`).
- 내비게이션 바 런타임부: `graniteEvent.addEventListener('backEvent', ...)`,
  `('homeEvent', ...)` 가 `initNavigationBar()`(`initTossSdk()`가 부팅 시
  호출) 안에서 실제로 등록됨을 소스에서 재확인 — 선언(config)뿐 아니라
  런타임 구독까지 확인.

---

## 3. 제출 전 남은 필수 조치 (sumo-bounce §9와 동일 항목, 이 게임 값으로)

1. **콘솔 앱 등록** — `appName: 'bloom-circuit'`가 플레이스홀더. 콘솔 실제
   appName과 일치 필수.
2. **아이콘 URL** — `brand.icon: ''`(빈 문자열). 에셋 자체는 있음
   (`Downloads\앱인토스_게임4종_에셋\Bloom Circuit\logo_600.png`,
   `logo_dark_600.png`). 콘솔 등록 후 publicUrl로 교체 + 재빌드 필수.
3. **앱 카테고리 = '게임'** 콘솔 등록.
4. **등급분류 증빙** — 참고용 메타데이터(miniAppId 58896, ratingNumber
   3cc8cc66-9f8b-8666-8350-3f6d63b2d543)는 콘솔에 직접 넣지 않았음(지시
   그대로). 실제 증빙 제출은 이 세션 범위 밖.
5. **국문명 최종 확정** — "피고지고" vs "블룸 서킷", §1-1 참고. President
   확인 대기.
6. **실기기 샌드박스 테스트 1회 이상** — 필수, 이 세션 미수행.

---

## 4. 레시피 재사용 노트 (다음 게임 2종 적용 시 참고)

- `src/toss/` 폴더는 **정말로** 게임 무관 범용 코드였다 — 로직 변경 0건,
  functional 문자열(네임스페이스 프리픽스·커스텀 이벤트명)만 grep으로 찾아
  교체하면 끝.
- 게임 저장소 설계(원본 `lsGet`/`lsSet` 헬퍼 vs `loadSave`/`writeSave`
  직접 호출)는 게임마다 다를 수 있다 — grep으로 실제 호출 패턴부터 확인하고
  패치 대상(항상 "쓰기 함수" 딱 1곳)을 정하는 게 핵심이지, 함수 이름이
  `lsSet`일 거라고 가정하면 안 된다.
- Safe Area 패치는 원본 CSS가 `env()`를 몇 군데서 직접 쓰는지, 아니면 중간
  커스텀 속성으로 한 번 감싸두는지에 따라 패치 지점 개수가 크게 달라진다
  (sumo-bounce 12곳 vs 이 게임 2곳) — 무조건 원본 CSS 구조부터 읽을 것.
- WCAG 대비비는 배경색이 다르면 결론이 같아도(둘 다 'dark' 테마) 반드시
  재계산해서 수치 근거를 남길 것 — "결론이 같으니 재계산 생략"은 금지.
