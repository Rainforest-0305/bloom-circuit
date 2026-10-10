---
name: Bloom Circuit(피고지고) — a living garden you tend against the clock
surface: game (canvas garden + HTML overlay UI), mobile portrait first, Toss mini-app WebView
reference: Ketchapp-grade 2D (Neon Thread pilot 2026-08-29 — bloom post layer, background depth, palette discipline, juice, SFX)
family: awesome-claude-design «playful» (toss playful: mobile-first density, one confident action colour, tabular numerals,
  generous radii) with a «warm» tone — a garden is daylight, soil and petals, not a dark gallery. Structure borrowed from
  toss (4px base, 7–14px radii ramp, hairline dividers, 44px tap rows). Brand colours/fonts NOT copied.
  «cinematic» rejected (the world is bright — dark canvas would fight the sky); «glass» rejected (backdrop-filter shares the GPU with the loop).
mode: Operate (title, map, lab, result) / Experience (garden board)
colors:
  # overlay UI (index.html tokens) — the moss-green card over a living garden is the approved identity (B6, 2026-08-22); kept.
  bg: "#04161c"
  card: "#0f2b22"                 # opaque; no blur anywhere
  panel: "rgba(4,24,29,.93)"      # HUD chips / rail / mini chips — opaque enough that no blur is needed
  ink: "#effff8"
  ink2: "#cfeade"                 # body copy on card
  dim: "#9fc4b8"                  # labels (≥ 8:1 on card)
  faint: "#6f9188"                # separators only, never text
  line: "rgba(176,255,221,.16)"
  mint: "#79f2bd"                 # primary CTA · done/complete
  gold: "#ffd166"                 # reward · today · focus ring · ripe freshness
  coral: "#ff7a85"                # danger · wither · cannot afford
  sky: "#8ae6ff"                  # time refunds · tend
  violet: "#c3a4ff"               # essence
  shadow: "rgba(2,14,12,.45)"     # neutral elevation (offset + blur, never a colour halo)
  # derived overlay tokens actually shipped in index.html (documented 2026-08-30 so the design-system check is complete; values inherited from live B6 identity + gfx pass)
  ctaInk: "rgb(4, 35, 28)"        # text on the mint CTA (#04231c)
  ctaTop: "#8dfbc8"               # mint CTA vertical gradient top
  ctaBottom: "#2fbf95"            # mint CTA vertical gradient bottom
  btnGhost: "rgba(7, 29, 36, 0.84)"   # secondary button fill
  btnGhostLine: "rgba(255, 255, 255, 0.12)"  # secondary button top edge
  scrim: "rgba(0, 0, 0, 0.22)"    # start-banner scrim
  goldTop: "#ffe08a"              # gold chip gradient top
  goldBottom: "#f2a93b"           # gold chip gradient bottom
  goldInk: "#37220a"              # text on gold
  goldInk2: "#3a2408"
  goldHi: "#ffe89a"               # gold highlight pair with goldDeep
  goldDeep: "#f5a623"
  cream: "#ffeec2"                # reward callout text
  cream2: "#ffe6a6"
  creamLine: "rgba(255,225,150,.4)"
  peach: "#ff9d5c"                # order chip accent
  blush: "#ff9b9b"                # soft danger text (lab cannot-afford)
  cardDeep: "#05251e"             # card bottom tone
  cardEdge: "#0a2b32"
  cardShade: "rgba(3,16,21,.18)"  # inset shade under card header
  cardInk: "#d7f3e8"              # card body copy variants
  cardInk2: "#d9f2e7"
  cardInk3: "#d6efe4"
  chipInk: "#dcffe9"
  chipLine: "rgba(220,255,238,.24)"
  panelTeal: "rgba(17,62,63,.8)"  # attendance strip / rail panel gradients (teal -> deep)
  panelDeep: "rgba(6,30,37,.9)"
  panelMoss: "rgba(24,84,72,.82)"
  panelDeep2: "rgba(6,32,36,.9)"
  panelMoss2: "rgba(20,74,64,.8)"
  panelDeep3: "rgba(13,48,52,.86)"
  panelDim: "rgba(10,42,46,.72)"
  moss: "#175447"                 # attendance done-cell fill
  # world (game SEASON_SKY) — midday → dusk pairs per season; every key is blended continuously by envPalette()
  spring: { top: "#7cc6e6", mid: "#dbeec4", haze: "#f4f7d6", far: "#8fbfb0", hill: "#3f8f66", grass: "#5fb56f", glow: "#fff3bd" }
  summer: { top: "#3aa3dc", mid: "#ffe7a3", haze: "#fff2c4", far: "#7fb5c0", hill: "#2f8256", grass: "#4fb066", glow: "#fff4a0" }
  autumn: { top: "#78adc4", mid: "#f6c98a", haze: "#f8dcb0", far: "#a89a8c", hill: "#7a5a33", grass: "#b48a48", glow: "#ffd79a" }
  winter: { top: "#98c0dc", mid: "#e6f1f8", haze: "#f6fbff", far: "#a9c2d2", hill: "#65818c", grass: "#7ea5a2", glow: "#f4fbff" }
  soil: { lit: "#7b5a41", base: "#5c4029", deep: "#262220", frame: "#6b4a30 → #3a281a" }
  crops: 22 palettes (a/b/c) — untouched; distinguishability is by SHAPE (petal count/shape, leaf style, centre) not hue
typography:
  display: '"Fredoka", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif'
  body: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Inter, ui-rounded, "Segoe UI", "Noto Sans CJK KR", … sans-serif'  # unchanged
  weights: [600, 700]   # Fredoka variable, latin subset self-hosted (29.7KB, OFL); Korean falls back to system Gothic
  numerals: tabular everywhere a number changes (coins, time, goals, stats, streak, costs)
  tracking: 0 on labels; display -0.03em max; NO uppercase eyebrows; sub-lines sit BELOW their heading
rounded: { control: 14px, chip: 999px, card: 28px, bed: 15% of cell, frame: 26px }
spacing: 4px base (6 / 8 / 10 / 12 / 14 / 16 / 20)
glow:
  input: emissive layer (half-res transparent canvas) — the daytime sky must never bloom, so brightness alone cannot gate it
  scene-threshold: 0.985   # only pure-white cores from the scene itself
  knee: 0.015
  glow-gain: 0.85
  tight: 0.50              # 1/4-res pass — hot edge
  wide: 0.42               # 1/8-res pass — halo
  bright-pass: 1/2 res (quality 2) · 1/4 res direct (quality 1) · off (quality 0)
  dpr-cap: 2 (quality 2) · 1.5 (quality 1)
  what glows: ripe halo + 4 orbiting sparkles · bloom-moment petals (first 4 of 8) + light ring · harvest sparks + coin sparkle ·
              chain ring · sun/moon disc (weak at noon, strong at dusk) · fireflies (summer) / embers (autumn) · result confetti (half)
  what never glows: sky, soil, leaves, petals at rest, HUD, text (text is drawn on #game behind the bloom)
particles:
  logic pools (particles/floaters/rings, seeded rnd): untouched — they consume the seeded stream exactly as live
  petals: 160 typed (sway sin, gravity 70, rot) · sparks: 200 (streaks along velocity, gravity 300) · coins: 40 (quadratic bezier bed → HUD coin chip, smoothstep, shrink) · light rings: 12
  zero runtime allocation in new pools; events are OBSERVED (seed/growth/coins/chain/withered deltas per frame) — act/harvest/update untouched
---

# 피고지고 — DESIGN.md (그래픽 고도화, 2026-08-30)

## 1. 세계관 한 줄
「낮의 정원, 흙과 꽃잎. 시계가 흐르면 노을이 진다 — 꽃이 «피는 순간»과 «따는 순간»만 빛난다.」
꽃이 화면에서 가장 살아 있는 것이어야 한다. 하늘은 깊고(원경 언덕이 하늘색으로 밀린다), 흙은 따뜻하고 어둡고,
UI 는 이끼색 판 위의 한 가지 행동색(민트)이다.

## 2. 팔레트 규율
- 월드: 계절 4 × (정오/노을) 팔레트. `dayT`(스테이지 경과)가 두 팔레트를 연속 블렌드 → 하늘 캐시는 24단계로 양자화해 재래스터한다.
  원경(far)은 하늘 쪽으로 밀린 색, 근경(hill)·잔디(grass)는 채도 그대로 — 대기 원근이 깊이를 만든다.
- 작물 22종 팔레트는 무접촉. 색약 대비는 «모양»이 담당한다(꽃잎 수/모양·잎·중심). 성장 단계는 형태로 갈린다:
  씨앗(새싹 2잎) → 봉오리 → 개화(8단계 크기) → 익음(후광+반짝이) → 시듦(고개 숙임·갈색 혼합 2단계·바 색).
- 오버레이: 이끼색 카드(#0f2b22) 위 민트 CTA 하나. 보상 = 골드, 위험 = 코랄, 정수 = 바이올렛, 시간 = 스카이. 라벨은 dim(≥ 8:1).

## 3. 글로우(블룸) 규칙
- 후처리 한 장(`public/game/bloom-post.js`, WebGL). 낮 하늘은 밝기 문턱으로는 못 거른다 → «빛나는 것»만 반해상도 glow 캔버스에 따로 그려 입력한다.
- 익음 후광은 크기별 스프라이트 1장(drawImage). 글자(점수 팝·토스트)는 #game(블룸 뒤)에 그린다.
- 품질 3단계: 2(1/2 bright, DPR 2) → 1(1/4 bright, DPR 1.5) → 0(꺼짐). 플레이 중 프레임 간격 22ms 초과 25%/90프레임이면 한 단계 내린다.
  DPR 상한 변경(캐시 비움·리사이즈)은 «플레이 밖»에서만 반영된다(기하 로직은 그대로).
- 깜빡임 방지 6항(네온 3차 규격, `bloom-post.js` 3판): ① 히스테리시스 — 전환 뒤 체류 8s, 회복은 15s 조용, 승격 ≤2회/세션 ② 가중 k1/k2 400ms 크로스페이드(off 도 페이드 뒤 숨김)
  ③ 플레이 중 DPR 고정 ④ 세계는 scene 한 층(글자만 #game) ⑤ bright-pass 는 텍셀별 soft-knee → 평균, `precision highp`, gl_FragCoord + NEAREST ⑥ 컨텍스트 손실·자동 off 불가역.
- 연출 글로우의 감쇠는 «8프레임 max/min ≤1.5»(flicker_game 프로브) 안에서: 빛 고리 0.71s(l²), 불꽃 글로우 l^.4, 코인 글로우 HUD 도착 전 (1-e²) 페이드. 익음 후광 호흡은 7rad/s 사인(연속).

## 4. 배경 깊이 (4층)
1. 정적 캐시(계절×노을 24단계×크기): 하늘 그라데이션 + 지평선 안개 띠 + 해/달 후광·원반 + 언덕 3층(원경→근경, 능선 하이라이트) + 잔디(결) + 비네트.
2. 구름 스프라이트(그늘·몸통·하이라이트 3층, 계절 틴트) · 햇살 5개 · 새 · 겨울 권운.
3. 전경 꽃 실루엣 20개: 스프라이트 3종 × (계절·노을 단계) → 회전 drawImage(흔들림).
4. 부유물 + 날씨 오버레이(오로라는 띠 스프라이트 1장을 2겹 이동, 안개/비/바람/아지랑이는 원본 절차 유지).
프레임당 그라데이션 생성 0. 밭은 (크기×변형 4×심김) 스프라이트, 틀은 1회 래스터(나무 틀·나뭇결·그림자).

## 5. 주스(Juice)
| 사건 | 연출 |
|---|---|
| 개화(growth 1 도달) | 꽃잎 8장 튐(절반은 glow) + 빛 고리 + ZzFX 차임(작물별 음높이) |
| 익음 대기 | 후광 호흡(7Hz sin) + 반짝이 4개 궤도, 신선도 떨어지면 후광 약해지고 고개 숙임 |
| 수확 | 불꽃 12 + 꽃잎 6 + 코인 2~7개가 밭에서 «HUD 코인 칩»으로 베지어 비행(스무스스텝, 끝에서 축소) + 코인 칩 펀치(1.22×) + ZzFX 코인(연쇄 음높이, 3연쇄↑ 더블) |
| 연쇄 상승 | #chainTag 펀치(1.2×) + 골드 빛 고리 |
| 시듦 | 갈색 잎 7장 낙하(기존 burst 유지) |
| 스테이지 클리어 | 카드 백-아웃 팝 → 행 스태거(60ms) → 숫자 카운트업(400–800ms, 읽기 전용 스크립트) → 별 팝(기존) + 꽃잎 40장 축하 |
| 실패 | 기존 ZzFX 하강음, 카드는 동일 구조(색 남용 없음) |
| 출석 받기 | ZzFX 2음 상승 + 토스트(기존) |

## 6. 타이포
- 디스플레이/숫자/버튼: Fredoka 600–700(가변, latin 서브셋 self-host, OFL). 둥근 획이 정원의 «친근함»과 맞는다. 한글은 시스템 고딕 폴백.
- 본문: 시스템 스택(실기기 사고 이력이 있는 스택 — 무접촉). 숫자는 항상 tabular.
- 부제(kicker)는 제목 «아래», 대문자·자간 없음. 그라데이션 텍스트 없음.

## 7. UI 오버레이 규칙(게임 제약)
- `backdrop-filter` 0건(라이브 2곳 제거: .screen 1.5px, .langRow 10px) — 판 불투명도로 대비 확보.
- 무한 애니메이션 0건(라이브 .card:before 16s conic 회전 제거 → 정적 배경 층).
- 터치 타깃 ≥ 24 CSS px, 주요 버튼 ≥ 44(.primary 52, .iconBtn 44, 출석 칸 44/50/60, 스트립 «받기» 32×≥56).
- 그림자는 오프셋+블러의 중립색. 색 글로우(라이브 7곳) 0.
- 아이콘은 SVG(일시정지·뒤로·연구소 마름모·체크). 유니코드 글리프 아이콘 0(게임 콘텐츠의 ★◇◆ 는 무접촉).
- 출석 카드 문서 순서: 제목(출석 보상) → N일째 → 스트립 → 설명 → 보상·받기.

## 8. 출석표
- 규칙·금액·지급은 game.js(`attendanceStatus/claimAttendance/ATN_CURVE=[5,6,8,10,12,14,20]`, 무접촉). 표시는 세 곳:
  ① 오버레이(#scAttend) 7칸 스트립 — 받은 날 민트 체크, 오늘(받을 칸) 골드 강조, 7칸 크게, 칸마다 «+정수».
  ② 홈 카드 스트립(`public/game/attend-ui.js`, 읽기 전용, `window.__bloomAttend.view()` 만 읽음) — 「출석 N일째 · d/7일」 + 7칸 + 「내일 오면 정수 +M」.
     클레임 가능하면 「오늘 정수 +R 받을 수 있어요」 + 골드 «받기» 버튼 → 기존 오버레이(#aClaim 경로)만 연다.
  ③ 정원 지도 한 줄 미니 칩 「출석 N일째 · d/7」.
- 8일째부터는 7칸 전부 채움 + 「매일 정수 +20 · 연속 기록 유지 중」(곡선이 7일차 값 반복 — 게임 규칙 그대로 표기).
- 기록 없음(옛 세이브·첫 방문)은 빈 스트립 + 「매일 들르면 정수를 받아요」. 옛 세이브는 loadSave 기본값(atnDate null·atnStreak 0)으로 호환.

## 9. 하지 않는 것
- 이미지 에셋 0장. 규칙·점수·조작·저장·리워드/계측 훅·`src/` 바이트 무접촉(`scripts/check_logic_bytes.mjs`).
- 시드 난수 소비 불변(burst/floater/ring/shake verbatim, rnd() 호출 19회 동일). 새 이펙트는 vr() 만.
- 3D·원근 없음. 렌더 기법만.
