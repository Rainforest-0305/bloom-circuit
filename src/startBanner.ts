/**
 * 피고지고 — «시작화면 상단 + 하단» 배너 2개.  2026-08-18
 *
 * President 지시: 「피고지고 상하단 (…) 배너 광고를 넣어라」
 *   대상 화면 = 타이틀 화면(#scTitle) «하나». 게임 중·결과·튜토리얼 «무접촉».
 *
 * ── ★이 파일은 스모바운스 src/arenaBanner.ts 를 «구조 복제»한 것이다 ────────
 *  그쪽은 이미 라이브이고 함정을 다 먹은 코드다. 새로 설계하지 않았다.
 *  그대로 가져온 규율:
 *   ① 지면 ID 를 «소스 리터럴»로 두지 않는다 → #ad-slots 의 data-* 에서 런타임에
 *      읽는다(번들러 상수 접기로 광고 호출이 통째로 사라진 다른 레인 실사고).
 *   ② initialize() → onInitialized 를 «기다린 뒤» attachBanner.
 *   ③ 등록을 attach «앞»에 — attachBanner 는 예외 시 onAdFailedToRender 를
 *      «동기»로 먼저 부르고 반환한다. 뒤에 등록하면 좀비 호스트가 남는다.
 *   ④ 숨김이 아니라 «destroy». 다른 화면에 터치 구멍을 남기지 않는다.
 *   ⑤ ⛔TossAds.destroyAll() 금지 — 상·하단이 «서로를» 지운다. 자기 핸들만.
 *
 * ── ★피고지고 고유 함정 3가지 (index.html 실측) ────────────────────────────
 *  ㄱ) ⛔#scTitle «안»에 붙이면 안 된다.
 *      `#scTitle>*:first-child{margin-top:auto}` / `:last-child{margin-bottom:auto}`
 *      로 카드를 가운데 정렬한다. 배너를 자식으로 넣으면 그 auto 마진이 «배너»에
 *      걸려 카드 정렬이 통째로 어긋난다. → #wrap 에 붙인다.
 *  ㄴ) z-index 11. index.html 의 최대값이 .screen 의 10 이다(0/1/6/7/8/10).
 *      배너는 그 위에 떠야 한다.
 *  ㄷ) ★풀블리드 정원 아트 위에 반투명 카드가 뜨는 구조다. 배너를 그냥 얹으면
 *      꽃 그림 위에 흰 카드가 «떠 있는» 것처럼 보여 조잡하다.
 *      → 렌더 성공 «뒤»에만 배너 뒤에 불투명 배경(#wrap 배경 #04161c 와 같은 색)을
 *        깔아 «경계»를 만든다. President 가 명시적으로 지시한 처리다.
 *  ㄹ) 상단 오프셋에 navigationBar 높이를 «더하지 않는다».
 *      granite.config.ts 의 transparentBackground:false 라 웹뷰가 검은 띠 «아래»에서
 *      시작한다 — 즉 y=0 이 이미 토스 시스템 UI 밑이다. 더하면 배너가 내려앉는다.
 *      (땅따먹기는 transparentBackground:true 라 --navh 를 «더해야» 했다. 반대다)
 *
 * ⛔public/** 게임 파일 · src/toss/** · src/sdk-boot.ts · src/exitConfirmUi.ts 무접촉.
 * ⛔MS Store 산출물 무접촉 — 이 파일은 앱스인토스 번들에만 들어간다.
 */
import { TossAds } from '@apps-in-toss/web-framework';

/** 이보다 낮게 그려지면 광고가 아니라 잔해다. 회수한다. */
const MIN_USEFUL = 24;
/** 배너와 카드 사이 최소 숨돌릴 틈. */
const GAP = 8;
const TITLE_ID = 'scTitle';
/** #wrap 배경색. 배너 뒤 «경계»를 이 색으로 만든다. 새 색을 만들지 않는다. */
const SCRIM = 'rgba(4,22,28,.97)';

type Side = 'top' | 'bot';
interface Slot {
  host: HTMLDivElement;
  inner: HTMLElement;
  handle: { destroy(): void } | null;
}

const slots: Partial<Record<Side, Slot>> = {};
const dead: Record<Side, boolean> = { top: false, bot: false };
let inited = false;
let ready = false;
let busy = false;

/** ★상수 접기 함정 회피: DOM 속성에서 런타임에 읽는다. */
function placementId(side: Side): string {
  const el = document.getElementById('ad-slots');
  if (!el) return '';
  const v = el.getAttribute(side === 'top' ? 'data-ad-start-top' : 'data-ad-start-bottom');
  return (v || '').trim();
}

function titleScreen(): HTMLElement | null {
  return document.getElementById(TITLE_ID);
}

/** 타이틀 화면이 «실제로» 떠 있는가. .screen.hidden 은 display 가 아니라 opacity 다. */
function isTitleNow(): boolean {
  const sc = titleScreen();
  if (!sc) return false;
  if (sc.classList.contains('hidden')) return false;
  return sc.getBoundingClientRect().height > 0;
}

/** 배너가 «실제로 차지한» 만큼 화면 여백을 넓힌다(카드는 «재배치하지 않는다»). */
function reserve(side: Side): void {
  const sc = titleScreen();
  const s = slots[side];
  if (!sc || !s) return;
  const h = Math.round(s.host.getBoundingClientRect().height);
  if (h <= 0) return;
  sc.style.setProperty(side === 'top' ? 'padding-top' : 'padding-bottom', h + GAP + 'px');
}

function unreserve(side: Side): void {
  // 인라인 값만 지운다 → 원래 CSS 규칙(calc(14px + safe)) 으로 복귀.
  titleScreen()?.style.removeProperty(side === 'top' ? 'padding-top' : 'padding-bottom');
}

function destroyOne(side: Side): void {
  const s = slots[side];
  if (!s) return;
  delete slots[side]; // ★먼저 지운다 — 콜백 재진입 방지
  try {
    s.handle?.destroy();
  } catch {
    /* SDK 내부 예외는 삼킨다 — 호스트 제거가 더 중요하다 */
  }
  s.host.remove();
  unreserve(side);
}

export function destroyStartBanners(): void {
  destroyOne('top');
  destroyOne('bot');
}

function makeHost(side: Side): Slot {
  const d = document.createElement('div');
  // ★id 는 «전체 단어»로. 'start-ad-bot' 처럼 줄이면 검증 셀렉터·스텁의
  //   side 판정과 어긋나 「하단 배너가 0건」으로 오독된다(실제로 한 번 걸렸다).
  d.id = side === 'top' ? 'start-ad-top' : 'start-ad-bottom';
  d.setAttribute('role', 'complementary');
  d.setAttribute('aria-label', 'AD');
  // ★height 를 고정하지 «않는다». SDK 래퍼가 height:100% 라 고정하면 소재가
  //   칸 한가운데 떠서 죽은 여백이 생긴다(arenaBanner.ts 실기기 확인 함정).
  // ★비어 있으면 padding 만 남고 배경이 «없어» 화면에 아무것도 안 보인다.
  //   자리를 잡아뒀다 접는 방식이 아니다 — 애초에 자국을 안 남긴다.
  // ★★2026-08-18 2차 — President 실기기 지시:
  //   「상단은 좀더 «올리고», 하단은 좀더 «내려서» 배경을 덜 가리게, «진한 부분 안»으로」
  //
  //   ── 남은 여유를 «먼저 쟀다» (390x844, --safeT 12 / --safeB 34 실측) ──────
  //     상단: 호스트가 «이미» y=0 에서 시작한다. granite.config 의
  //           transparentBackground:false 라 y=0 이 곧 토스 시스템 UI(검은 띠
  //           103css) «바로 아래» 첫 픽셀이다. 그 위로는 웹뷰가 «그릴 수 없다».
  //           ⇒ 올릴 수 있는 여유 = 광고 위 padding «22px 이 전부»다. 그걸 다 쓴다.
  //     하단: 광고 bottom 800 · 홈인디케이터 시작 810 ⇒ 여유 «10px».
  //           2px 만 남기고 8px 내린다(침범 금지 — 안전선).
  //
  //   ── ★진짜 요구는 위치가 아니라 «불투명 판이 아트를 덮지 않는 것»이다 ────
  //     scrim 은 호스트 «전체»를 덮는다. 그래서 광고 위·아래의 padding 이 곧
  //     「새로 가려지는 하늘/잔디 면적」이다. 그 padding 을 깎는 게 본질이다.
  //       상단 호스트 110px → 84px  (하늘 26px 회수, 그리고 y=0 시작이라
  //                                 네이티브 검은 띠와 «이어져» 보인다)
  //       하단 호스트 132px → 120px (잔디 12px 회수)
  //   ⛔더 줄이면 광고 카드가 화면 가장자리에 그대로 붙어 잘린 것처럼 보인다.
  const anchor = side === 'top' ? 'top:0;' : 'bottom:0;';
  const padV =
    side === 'top'
      ? 'padding-top:0;padding-bottom:8px;'
      : 'padding-top:8px;padding-bottom:calc(var(--safeB) + 2px);';
  d.style.cssText =
    'position:absolute;left:0;right:0;z-index:11;pointer-events:auto;height:auto;overflow:hidden;' +
    anchor +
    padV +
    'padding-left:calc(12px + var(--safeL));padding-right:calc(12px + var(--safeR));';
  // 게임이 window 레벨 포인터 리스너를 쓰는 경우를 대비해 배너 자리 입력을 끊는다.
  // (스모바운스에서 「배너 자리를 눌렀는데 게임 조작이 광고 클릭이 되는」 실사고를 막은 수법)
  (['touchstart', 'mousedown', 'pointerdown'] as const).forEach((ev) => {
    d.addEventListener(ev, (e: Event) => e.stopPropagation(), { passive: true });
  });
  const inner = document.createElement('div');
  inner.style.cssText = 'max-width:560px;margin:0 auto;'; // .card 와 같은 폭
  d.appendChild(inner);
  return { host: d, inner, handle: null };
}

function attachOne(side: Side): void {
  if (dead[side] || slots[side]) return;
  const id = placementId(side);
  if (!id) return;
  if (!TossAds.attachBanner.isSupported()) return;
  const wrap = document.getElementById('wrap');
  if (!wrap || !titleScreen()) return;

  const s = makeHost(side);
  // ⛔#scTitle 의 자식으로 넣으면 first/last-child auto 마진 정렬이 깨진다.
  wrap.appendChild(s.host);
  slots[side] = s; // ★등록을 attach «앞»에 — 동기 실패 콜백 대비

  const reclaim = (): void => {
    dead[side] = true; // ★재시도 금지. 폴링이 다시 붙이면 깜빡임이 된다.
    destroyOne(side);
  };

  try {
    const res = TossAds.attachBanner(id, s.inner, {
      theme: 'dark', // 정원 배경은 어둡다(--bg / #wrap #04161c)
      variant: 'card',
      callbacks: {
        onAdRendered: () => {
          const cur = slots[side];
          if (!cur) return;
          if (cur.host.getBoundingClientRect().height < MIN_USEFUL) {
            reclaim();
            return;
          }
          // ★렌더 «성공 뒤에만» 경계를 만든다. 정원 아트 위에 배너가 «떠 있는»
          //   것처럼 보이지 않게 하는 처리(President 지시).
          //   ⛔렌더 «전»에 칠하면 노필일 때 빈 띠가 남는다.
          // ★페이드 길이도 22px → 12px 로 줄인다. 페이드 구간은 «반투명하게
          //   아트를 어둡게 만드는» 띠라, 길수록 정원이 더 죽는다(President 지적).
          cur.host.style.background =
            side === 'top'
              ? `linear-gradient(180deg,${SCRIM} 0,${SCRIM} calc(100% - 12px),rgba(4,22,28,0) 100%)`
              : `linear-gradient(0deg,${SCRIM} 0,${SCRIM} calc(100% - 12px),rgba(4,22,28,0) 100%)`;
          cur.host.style.backdropFilter = 'blur(6px)';
          (cur.host.style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
            .webkitBackdropFilter = 'blur(6px)';
          reserve(side);
        },
        onNoFill: reclaim,
        onAdFailedToRender: reclaim,
      },
    });
    if (slots[side]) {
      slots[side]!.handle = res;
    } else {
      // 콜백이 «이미» 회수했다 — 늦게 받은 핸들도 확실히 파기한다.
      try {
        res.destroy();
      } catch {
        /* ignore */
      }
    }
  } catch {
    reclaim();
  }
}

function sync(): void {
  if (busy) return;
  busy = true;
  try {
    if (!isTitleNow()) {
      destroyStartBanners(); // ⛔숨김이 아니라 destroy
      return;
    }
    if (!inited) {
      if (!TossAds.initialize.isSupported()) return;
      inited = true;
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            ready = true;
          },
          onInitializationFailed: () => {
            dead.top = dead.bot = true; // 초기화 실패 = 광고 없음. 자국도 안 남긴다.
          },
        },
      });
      return;
    }
    if (!ready) return;
    // ★두 지면을 «각각» 붙인다. 각자 자기 핸들만 들고 있어 서로를 지우지 않는다.
    attachOne('top');
    attachOne('bot');
    // 소재 리프레시로 높이가 바뀌면 예약도 따라간다.
    if (slots.top) reserve('top');
    if (slots.bot) reserve('bot');
  } finally {
    busy = false;
  }
}

export function installStartBanners(): void {
  // 게임에 화면 전이 이벤트가 없다. arenaBanner.ts 와 같은 250ms 폴링을 쓴다.
  window.setInterval(sync, 250);
  let raf = 0;
  const relayout = (): void => {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      if (slots.top) reserve('top');
      if (slots.bot) reserve('bot');
    });
  };
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', () => window.setTimeout(relayout, 300));
}
