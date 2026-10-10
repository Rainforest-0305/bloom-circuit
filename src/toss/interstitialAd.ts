/**
 * 전면광고(인터스티셜) 게이트 v2 — 피고지고(bloom-circuit).
 *
 * ═══ v1 → v2 왜 고치는가 (Partner 승인 2026-08-14) ═══
 *
 * v1 결함: 카운트가 «결과화면 버튼 click 리스너 안»에서만 올라갔다.
 *   → 그 버튼을 안 누르는 모든 경로(일시정지→재시작, 일시정지→나가기,
 *      하드웨어 뒤로가기, 백그라운드 이탈)가 «0판»으로 취급됐다.
 *   President 지시: 「어떤 방식으로 플레이해도 연속 2판 하면 광고 나오게 해」
 *
 * ★★Partner 인용 의무 문장 (원문 그대로 — 검수·출시 보고에도 그대로 간다):
 *   「광고 노출 0 의 원인은 안 풀렸다. 판정 누락은 고쳤지만 노출이 는다는 보장은 없다」
 *   → 이 수정은 「노출 0 을 해결하는 것」이 «아니라» 「기회가 왔을 때 놓치지 않는 것」이다.
 *     고친 뒤에도 노출이 «안 늘 수 있다». 그걸 실패로 읽지 마라(트래픽 부족은 별개 문제).
 *
 * ═══ 설계 (게임 JS 0줄) ═══
 *
 * ★ 원본 게임 파일(`public/game/bloom-circuit-game.js`)을 «한 글자도» 고치지 않는다.
 *   훅은 «DOM 관측(MutationObserver)» 과 «capture 클릭 가로채기» 로만 건다.
 *
 * ── 계수(count) 와 노출(show) 을 «분리» 한다 ──────────────────────────────
 *   계수 : 「판 시작」/「판 종료」 신호로 «직전 판»을 소급 확정. ★멱등
 *   노출 : «합법 노출 지점» 에서만. 플레이 중엔 «절대» 안 띄운다.
 *
 * ── 「판 시작」 판별 = buildRail 방식 (Q-C, Partner 승인) ──────────────────
 *   [실측] setScreen("play") 호출처 2곳 = startStage():664 / togglePause():1365
 *          → 단독 사용 시 pause↔play 왕복이 전부 「판 시작」 = «매판 광고». 금지사항 직격.
 *   [실측] buildRail() 은 #railInner 자식을 «전면 교체»(game.js:1076 innerHTML="")하고
 *          이어하기(togglePause)는 buildRail 을 부르지 않는다.
 *          buildRail() 호출처 전수 2곳 = startStage():665 / applyLang():1483.
 *          applyLang 을 부르는 setLang 은 #langRow 의 언어버튼에서만 오는데
 *          #langRow(index.html:575)는 «#scTitle 내부»라 play/pause 중엔 클릭 불가.
 *   → 「#railInner 자식 «추가» 관측 + 화면이 play」 = 새 판 시작.
 *      pause→play(이어하기)는 rail 교체가 «없어» 계수되지 않는다.
 *
 *   ⚠ 이 근거의 «깨지는 조건»을 명시한다(고치는 사람이 알아야 한다):
 *     ① setScreen("play") 단독으로 되돌리지 «마라». 호출처 :1365 가 «이어하기»라
 *        pause↔play 왕복이 전부 새 판이 되어 «매판 광고»가 터진다. 「더 간단해 보인다」는
 *        함정이다 — [실측] Playwright 왕복 5회에서 v2 는 계수 0, setScreen 방식은 5.
 *     ② 「applyLang 은 play/pause 에서 도달 불가」는 «DOM 구조에 의존»한다.
 *        언어버튼을 일시정지/플레이 화면으로 «옮기면 조용히 깨진다».
 *        그래서 isPlayScreen() 가드를 «따로» 둔다 — pause 중 applyLang 이 와도 계수되지 않는다.
 *        [실측] pause 중 언어버튼을 «강제 클릭»해도 plays 불변임을 Playwright 로 확인.
 *        ⚠ 다만 play «중» applyLang 이 도달 가능해지면 거짓 계수가 난다. 화면 구조를 바꾸면
 *          이 파일을 «같이» 손봐라.
 *     ③ [실측] #vCoins 는 언어 변경 시 «같은 값으로 다시 써진다»(refreshHud(true) 가
 *        hudCache 를 비우므로 setTxt 가 동일 값도 기록한다, game.js:1023). 그래서
 *        「mutation 레코드가 왔다」가 아니라 «텍스트 값이 달라졌는가»로 판정한다.
 *        레코드 유무로 판정하면 언어 변경이 「1수」로 둔갑한다.
 *
 * ── 최소 자격 조건 (Q-B, Partner 승인 = 「1수 또는 5초」) ────────────────
 *   [실측] 모든 밭이 seed:-1 로 시작(buildPlots:633) → 유효한 첫 액션은 «반드시»
 *          심기 또는 돌 제거이고 둘 다 coins 를 바꾼다(act:741-751, spend 필수).
 *   [실측] coins 변경 지점 전수 3곳 = startStage:654 / spend:732 / harvest:797.
 *          harvest 는 act() 에서만 불린다 = 전부 «유저 액션». 자동돌봄(U(3), :857)은
 *          ripen 만 하고 coins 를 «안 바꾼다».
 *   ⚠ 이 전제가 깨지는 조건: 게임 규칙이 바뀌어 «시간이 지나면 저절로 코인이 드는» 요소가
 *      생기면 최소 자격 조건이 무력화된다(가만히 둬도 「1수」로 잡힌다). 그때는
 *      MIN_PLAY_MOVE=false 로 내리고 시간 조건만 쓰거나, 관측점을 다시 잡아라.
 *   → DOM 관측점 #vCoins (setTxt 는 «값이 바뀔 때만» textContent 를 쓴다, :1023)
 *   ⛔ moves 제한 스테이지(9·14·20·24)의 #vTime 은 «쓰지 않는다» — time 스테이지에선 매초 바뀐다.
 *
 * ── 노출 지점 (Q-A, Partner 승인 = ★C(주) + A(pRestart 폴백)) ────────────
 *   ① 결과화면 «이탈» : rMap · rRetry · rNext 클릭 가로채기 → 광고 → «같은 버튼 재발화»
 *   ② 결과화면 «없는» 이탈 : pQuit(나가기) 클릭 가로채기 / 하드웨어 뒤로가기
 *      → 이때 화면은 pause 또는 map 이라 «플레이 중이 아니다» = 안전
 *   ③ pRestart(일시정지→바로 재시작)는 «계수만» 하고 노출은 «다음 합법 지점»으로 미룬다.
 *      ★광고가 최대 한 판 늦게 뜨는 건 «감수한다». 플레이 중 광고 위반보다 훨씬 싸다.
 *   ⛔ 「판 시작 직후」엔 «절대» 안 띄운다 — startStage 는 running=true 를 «먼저» 세우므로
 *      그 위에 광고를 덮으면 게임이 «뒤에서» 돈다 = 「플레이 중 금지」 위반.
 *   ⛔ 결과화면 «등장» 직후에도 안 띄운다 — 별·기록·해금을 가린다.
 *
 * 세이브 안전
 *   게임 세이브 키는 `bloomCircuitSave3` 다. 여기엔 «손대지 않는다».
 *   광고 카운터는 «별도 키»(`bloomcircuit.ads.v1` — v1 과 «같은 키») 를 쓴다.
 *   ⛔ GAME_STORAGE_KEYS 에 광고 키를 «추가하지 않는다» — 게임 세이브 프라이밍 전용이다.
 *
 * ── ★기각한 후보와 «기각 사유» (되살릴 사람을 위해 남긴다) ───────────────
 *   ⛔[기각] Q-A B안 — 「판 시작 직후 즉시 광고 + webview blur 로 게임이 자동 일시정지된다」
 *      사유: 그 자동 일시정지는 «실기기에서만 확정 가능한 가정»이다. game.js:1419 의
 *            addEventListener("blur") 가 네이티브 전면광고에서 «정말» 발화하는지 미확인.
 *            검증 안 된 가정 위에 라이브를 올리지 않는다(Partner 승인 기각).
 *            → 나중에 「blur 쓰면 간단한데」 하는 사람이 있을 자리다. 실기기 실측 없이 되살리지 마라.
 *   ⛔[기각] setScreen("play") 단독 관측으로 「판 시작」 판별
 *      사유: 호출처 2곳 중 하나가 togglePause():1365(이어하기)라 pause↔play 왕복이
 *            전부 새 판이 된다 = «매판 광고». [실측] Playwright 로 왕복 5회 → v2 는 계수 0.
 *   ⛔[기각] 카운터 키를 새로 파기(`bloomcircuit.ads.v2`)
 *      사유: 기존 유저의 plays 위상이 통째로 리셋된다. 같은 키 안에서 «필드»로 나눴다.
 *   ⛔[기각] `{plays, shown}` (shown=광고 표시 «횟수») 스키마
 *      사유: 구버전 값 `{plays:37}` 이 shown=0 으로 읽히면 `37-0>=2` 가 계속 참이라
 *            «매판 광고»가 터진다. 막으려면 이관 시 shown 을 보정해야 하는데,
 *            그 순간 「정수 카운터로 만들면 빚이 쌓인다」는 경고를 정면으로 밟는다.
 *            → `{plays, adPending:boolean}` 채택. 구버전은 adPending=false 로 읽혀 «안전».
 *   ⛔[기각] 실패 카운터(preloadFails) 를 localStorage 에 영속
 *      사유: 한 번 소진되면 다음 세션에 광고가 «아예» 안 뜨는 새 결함이 된다.
 *   ⛔[기각] #vTime 을 「진행」 관측점으로 사용
 *      사유: time 스테이지(20/24개)에선 «매초» 바뀐다 = 최소 자격 조건이 무의미해진다.
 *   ⛔[기각] 관측자(MutationObserver)를 rail/coins 로 «둘» 두기
 *      사유: startStage() 가 rail 과 coins 를 «같은 동기 블록»에서 바꿔서, 콜백 순서가
 *            엔진 구현에 의존하면 직전 판에 «거짓 자격»이 붙는다. 관측자 1개로 순서를 고정했다.
 *
 * ☠ 못 막는 것 [미확인]
 *   네이티브 광고 화면이 어떻게 그려지는지, isSupported() 가 실기기에서 무엇을
 *   반환하는지는 «실기기에서만» 확정된다.
 */
// ★ 2026-08-11 정정: 이 프로젝트는 «웹 래핑»이라 RN 패키지(@apps-in-toss/framework)를
//   쓰면 vite 가 react-native 를 끌어와 빌드가 죽는다(실측 EXIT=1).
//   웹 배럴(@apps-in-toss/web-framework)이 web-bridge 를 재수출하며, 거기에
//   loadFullScreenAd/showFullScreenAd 가 «공식 export» 로 실재한다(web-bridge d.ts 실측).
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { storage, KEYS } from './storage';
// ★2026-08-22 배선(작업순서 ⑤ 재확인, ad_request_fail 실배선) — 스키마만 있던
// 이벤트에 호출부를 붙인다. sumo-bounce/neon-thread 가 이미 이 패턴으로 붙여둔
// 선례를 그대로 따른다(reason 열거값 문자열만, PII 없음). 오직주님 전면광고가
// 30일간 0회였던 걸 아무도 몰랐던 이유가 정확히 이 부재였다 — 계측 도입에서
// 가장 우선순위 높은 이벤트.
import { trackEvent } from './analytics';

/* ─────────────────────── 상수 — «한 곳»에 모은다 ─────────────────────── */

/**
 * ═══ ★ 2026-08-11 «운영 ID» 상태다 (Partner 승인) ═══
 *   지면: 「피고지고_전면형_260807 #1」 · adFormat INTERSTITIAL · state ENABLED · abuse NONE
 *
 * ★★★ 절대 금지 — 이 값이 박힌 번들을 «로컬에서 렌더하지 마라».
 *   `granite dev`·브라우저·헤드리스(Playwright 포함) «전부» 금지.
 *   실 광고단위를 등록되지 않은 매체에서 호출하는 것은 «계정 중단 사유»다.
 *   → 이 상태의 검증은 «번들 정적 검사» + «SDK 스텁 + 테스트 ID 본» 으로만 한다.
 *
 * ★ 되돌릴 때: 공식 문서의 «전면광고용 테스트 ID»를 쓴다. 값은 문서에서 다시 확인해라 —
 *   여기 적지 않는다(주석 문자열도 출고물에 실린다, 실측).
 */
const AD_GROUP_ID = 'ait.v2.live.XXXXXXXXXXXXXXXX';

/** 몇 판마다 띄울지. 「2판마다」 = President 지시. */
const AD_EVERY = 2;

/**
 * 광고 카운터 저장 키 — 게임 세이브 키와 «명확히 다르게» 짓는다.
 * ⛔ v1 과 «같은 키»를 유지한다. 새 키를 파면 기존 유저 위상이 통째로 리셋된다.
 *    v1 값 `{plays:n}` 은 그대로 읽히고(무손실), 없는 필드만 안전한 기본값을 받는다.
 */
const AD_STORAGE_KEY = 'bloomcircuit.ads.v1';

/**
 * ★D4 — 네이티브 Storage 미러 키.
 * storage.ts:6-9 원문: 「미니앱 WebView 의 localStorage 는 영속을 보장하지 않는다」.
 * 게임 세이브는 이미 미러로 보호받는데 광고 카운터만 raw localStorage 였다.
 * ⛔ GAME_STORAGE_KEYS 에 «추가하지 않는다» — 거긴 게임 세이브 프라이밍 전용이다.
 */
const AD_MIRROR_KEY = `${KEYS.gameMirrorPrefix}${AD_STORAGE_KEY}`;

/* ── Q-B 최소 자격 (★상수 2개로 «분리». 하나만 고치면 하나만 바뀐다) ── */
/**
 * 이 시간 이상 붙잡고 있었으면 「한 판」으로 인정한다.
 *
 * ★정직하게 적는다:
 *   · 5000ms 는 Partner 가 정한 «판단값»이다 [추정]. 피고지고의 「한 판 최소 소요 시간」을
 *     측정해서 유도한 값이 «아니다».
 *   · 실제로 이 게이트에서 시간 조건은 «보조»다 — 주 조건은 coins 변동(MIN_PLAY_MOVE)이고
 *     [실측] 유효한 첫 액션은 반드시 coins 를 바꾼다.
 *   · ★어떤 시간 임계값도 «자동화 방어가 아니다». 사람의 연타만 늦출 뿐,
 *     스크립트로는 얼마든지 통과시킬 수 있다. 어뷰징 방어로 «착각하지 마라».
 */
const MIN_PLAY_MS = 5000;
/** 「1수(=coins 변동)」 조건을 쓸지. false 로 두면 시간 조건만 남는다. */
const MIN_PLAY_MOVE = true;

/* ── DF-1 preload 재시도 ── */
/**
 * ★선행 조치: preload 에도 타임아웃을 건다.
 * [실측] LoadFullScreenAdEvent 는 `{type:'loaded'}` «단 하나»다(types d.ts:312-314).
 *        실패는 onError 로만 오고 «무응답 pending»을 구분할 SDK 수단이 «없다».
 *        타임아웃이 없으면 SDK 가 콜백을 아예 안 줄 때 loading 이 «영구 true» 로 굳어
 *        `if (adReady || loading) return;` 에서 이후 모든 재시도가 튕긴다.
 */
const PRELOAD_TIMEOUT_MS = 5000;
/**
 * 실패 후 «다음 시도까지의 최소 간격».
 *
 * ★★근거에 대한 Partner 원문 (2026-08-14, 그대로 옮긴다):
 *   「[미검증] 이 수열은 Partner 가 정한 «임의값»이다. 업계 수치·SDK 문서 근거 «없음».
 *    실사용 데이터가 쌓이면 재검토할 것. 근거를 물으면 «없다»가 정답이다」
 */
const PRELOAD_BACKOFF_MS = [5000, 15000, 45000, 120000, 300000, 300000];
/**
 * 연속 실패 상한. ⛔이 카운터는 «영속하지 않는다»(§DF-1⑤ — 영속하면 다음 세션에 아예 안 뜬다).
 * ★위와 같은 [미검증] 임의값이다. 근거 없음.
 */
const MAX_PRELOAD_FAILS = 6;

/* ── DF-4 show 타임아웃 «분리» (★상수 2개만 되돌리면 원복) ── */
/**
 * 광고가 «열리지 않는» 경우만의 상한. 'show'/'impression' 이 오면 «해제»된다.
 * v1 은 이 값 하나(5000ms)로 «열린 뒤»까지 잘라서, 5초 넘게 보는 «정상» 광고에서
 * 게임이 광고 «뒤에서» 시작됐다 = 「플레이 중 금지」 위반.
 */
const SHOW_OPEN_TIMEOUT_MS = 7000;
/** 광고가 «열린 뒤»의 안전망. 사실상 미발동. */
const SHOW_HARD_CAP_MS = 180000;

/* ── DOM 훅 ── */
/** 결과 화면에서 «다음 행동»으로 넘어가는 버튼 + 결과화면 «없는» 이탈 버튼. */
const SHOW_EXIT_BUTTON_IDS = ['rMap', 'rRetry', 'rNext', 'pQuit'] as const;
/** ★Q-A 승인안 A — 계수만 하고 «노출은 미룬다»(pause→바로 play 라 띄울 자리가 없다). */
const COUNT_ONLY_BUTTON_IDS = ['pRestart'] as const;
/** 「판 시작」 관측점 — buildRail() 이 자식을 전면 교체한다. */
const RAIL_ID = 'railInner';
/** 「1수」 관측점 — setTxt("vCoins", ...) */
const COINS_ID = 'vCoins';
/** 「판 종료」 관측점 — setScreen("result") 이 hidden 을 뗀다. */
const RESULT_SCREEN_ID = 'scResult';
/** 「지금 play 화면인가」 판정용 — setScreen 이 이 전부에 hidden 을 토글한다(game.js:1108). */
const OVERLAY_SCREEN_IDS = ['scTitle', 'scMap', 'scLab', 'scResult', 'scPause', 'scTut'] as const;

/* ─────────────────────────── 카운터 (DF-2 / DF-3) ─────────────────────────── */

/**
 * ★★★ Partner 명시 경고 — 원문 그대로 박아둔다:
 *
 *     「정수 카운터로 만들면 빚이 쌓여 매판 광고가 터진다」
 *
 * 그래서 `adPending` 은 ★«boolean» 이다. 「몇 번 밀렸는지」를 «세지 않는다».
 * 광고를 못 띄웠으면 «빚을 소비하지 않고» 그대로 둔다 → 다음 합법 지점에서 곧바로 재시도.
 * 「2판마다」 리듬은 «미뤄질 뿐 깨지지 않는다».
 */
interface AdCounter {
  /** 누적 「판」 수. ★증가 지점은 finalizeRun() «단 한 곳»뿐이다. */
  plays: number;
  /** 「띄울 차례인데 아직 못 띄웠다」. ★boolean — 절대 정수로 바꾸지 마라. */
  adPending: boolean;
}

let counter: AdCounter = { plays: 0, adPending: false };
/** hydrateAdCounter() 가 «시작»됐는가. */
let hydrated = false;
/**
 * hydrateAdCounter() 가 «끝났는가».
 * ★이게 false 인 동안은 «저장하지 않는다» — 저장된 기존 값(예: plays 41)을 읽기 «전»에
 *   0 에서 출발한 값으로 덮어써 버리면 기존 유저 위상이 통째로 날아간다.
 *   [실측] Playwright 경합 시험에서 실제로 재현됐다(네이티브 응답 2초 지연 + 그 사이 판 확정).
 */
let hydrateDone = false;

function localGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function localSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode — 무시. 광고가 덜 뜰 뿐 게임은 계속돼야 한다. */
  }
}

/**
 * 저장된 JSON 을 카운터로 읽는다. 어떤 이유로든 실패하면 null.
 * ★v1 호환: v1 은 `{plays:n}` 만 썼다. `adPending` 이 «없으면» false 로 읽는다.
 *   → 구버전 유저의 plays 는 «그대로 보존»되고(무손실),
 *     adPending=false 라서 업그레이드 직후 광고가 «터지지 않는다».
 */
function parseCounter(raw: string | null): AdCounter | null {
  if (raw == null) return null;
  try {
    const o = JSON.parse(raw) as { plays?: unknown; adPending?: unknown };
    const n = o?.plays;
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return null;
    return { plays: Math.floor(n), adPending: o?.adPending === true };
  } catch {
    return null;
  }
}

function persist(): void {
  // ★하이드레이트가 «끝나기 전»엔 쓰지 않는다(위 hydrateDone 주석 참고).
  //   메모리 카운터는 계속 올라가고, 하이드레이트가 끝나는 즉시 «합쳐서» 한 번에 기록된다.
  if (!hydrateDone) return;
  const json = JSON.stringify({ plays: counter.plays, adPending: counter.adPending });
  // ① v1 과 같은 raw 키 — 하위호환·복구 경로로 계속 유지한다.
  localSet(AD_STORAGE_KEY, json);
  // ② ★네이티브 Storage 미러 — fire-and-forget(게임 루프를 막지 않는다).
  void storage.setItem(AD_MIRROR_KEY, json);
}

/**
 * ★D4 — 부팅 시 «1회». 네이티브 미러 → 없으면 v1 raw localStorage 순으로 복원한다.
 * 절대 throw 하지 않는다. 실패하면 {plays:0, adPending:false} 로 시작한다.
 * ★sdk-boot.ts 가 primeGameStorage 와 «같은 await» 안에서 부른다 → 순서 변경 불필요.
 *
 * ★★경합(race) 방어 — 이 함수는 «비동기»다(safeBridge 최대 3초).
 *   그 사이에 판이 확정될 수 있다(게이트 설치가 먼저 끝나 있거나, 하이드레이트가 느릴 때).
 *   그때 읽어온 값으로 «덮어쓰면» 그동안 센 판이 날아가고, 반대로 무시하면 기존 유저
 *   위상(plays)이 «0 으로 리셋»된다. → «덮어쓰지 않고 합친다».
 */
export async function hydrateAdCounter(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  try {
    const stored = parseCounter(await storage.getItem(AD_MIRROR_KEY)) ?? parseCounter(localGet(AD_STORAGE_KEY));
    // ★★carried 는 «await 뒤»에 읽는다. await «앞»에서 읽으면 그 사이에 확정된 판(경합분)이
    //   0 으로 굳어 사라진다 — Playwright 실측으로 잡힌 실제 결함이다.
    const carriedPlays = counter.plays;
    const carriedPending = counter.adPending;
    if (stored) {
      const merged = stored.plays + carriedPlays; // ★기존 plays 무손실 + 경합분 보존
      counter = {
        plays: merged,
        adPending: stored.adPending || carriedPending || (carriedPlays > 0 && merged % AD_EVERY === 0),
      };
    }
  } catch {
    /* 카운터가 앱을 막으면 안 된다. 지금까지 센 값으로 계속 간다. */
  } finally {
    hydrateDone = true;
    persist(); // 여기서 «처음» 기록된다 — 저장·미러 양쪽에 합쳐진 값이 심긴다.
  }
}

/* ─────────────────────────── 강제 옵션 ─────────────────────────── */

type ForceMode = 'off' | 'always' | 'normal';

function forceMode(): ForceMode {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('ads') === 'off') return 'off';
    if (q.get('ads') === '1') return 'always';
  } catch {
    /* URL 파싱 실패는 무시하고 기본 동작 */
  }
  return 'normal';
}

let mode: ForceMode = 'normal';

/** 지금 광고를 띄울 «차례»인가. ⛔여기서 빚을 소비하지 않는다. */
function hasDebt(): boolean {
  if (mode === 'off') return false;
  if (mode === 'always') return true;
  return counter.adPending;
}

function consumeDebt(): void {
  counter.adPending = false;
  persist();
}

/* ────────────────────── 판 상태 (계수·멱등) ────────────────────── */

interface PendingRun {
  startedAt: number;
  /** 판 시작 시점의 #vCoins textContent 스냅샷. */
  baseCoins: string | null;
  /** 「1수 뒀다」 — coins 가 기준선에서 «달라진 적이 있다». */
  progressed: boolean;
}

let runPending: PendingRun | null = null;
/** #railInner 를 실제로 관측 중인가. 폴백 경로 판정에만 쓴다. */
let railObserved = false;

function el(id: string): HTMLElement | null {
  try {
    return document.getElementById(id);
  } catch {
    return null;
  }
}

function readCoinsText(): string | null {
  const e = el(COINS_ID);
  return e ? e.textContent : null;
}

/** 「지금 play 화면인가」 — 오버레이 6종이 «전부» hidden 이면 play 다(game.js:1108). */
function isPlayScreen(): boolean {
  for (const id of OVERLAY_SCREEN_IDS) {
    const e = el(id);
    if (e && !e.classList.contains('hidden')) return false;
  }
  return true;
}

/** coins 가 기준선에서 벗어났으면 「1수 뒀다」로 표시한다. 몇 번 불려도 안전. */
function pollProgress(): void {
  const r = runPending;
  if (!r) return;
  const now = readCoinsText();
  if (now === null) return;
  if (r.baseCoins === null) {
    r.baseCoins = now;
    return;
  }
  if (now !== r.baseCoins) r.progressed = true;
}

/**
 * ★한 판을 «정확히 한 번» 확정한다. 어디서 몇 번 불려도 안전(멱등).
 * ★★ counter.plays 를 증가시키는 코드는 이 함수 «단 한 곳»뿐이다 — grep 으로 증명 가능.
 */
function finalizeRun(): void {
  const r = runPending;
  if (!r) return; // ★★멱등성의 핵심 — 이미 확정됐으면 즉시 반환
  runPending = null; // ★증가 «전»에 비운다. 재진입·중첩 호출에도 1회만 센다.

  // Q-B: 「1수 또는 5초」. 상수 2개가 «분리»돼 있어 하나만 고칠 수 있다.
  const moved = MIN_PLAY_MOVE && r.progressed;
  const longEnough = Date.now() - r.startedAt >= MIN_PLAY_MS;
  if (!moved && !longEnough) return; // 시작하자마자 나간 판은 «안 센다»

  counter.plays += 1;
  if (counter.plays % AD_EVERY === 0) counter.adPending = true;
  persist();
}

/**
 * 「판 시작」. 직전 판을 소급 확정하고 새 판을 연다.
 * ⛔여기서 «광고를 띄우지 않는다» — startStage() 는 running=true 를 «먼저» 세운다.
 *   그 위에 광고를 덮으면 게임이 뒤에서 돈다 = 「플레이 중 금지」 위반(Q-A, B안 기각 사유).
 */
function beginRun(): void {
  // ★여기서는 pollProgress() 를 «부르지 않는다».
  //   이 시점의 #vCoins 는 이미 «새 스테이지» 값이라, 직전 판의 기준선과 비교하면
  //   무조건 「달라졌다」가 나와 «거짓 자격»이 된다. 시간 조건만으로 확정한다.
  finalizeRun();
  runPending = { startedAt: Date.now(), baseCoins: readCoinsText(), progressed: false };
}

/* ─────────────────────────── 광고 로드 (DF-1) ─────────────────────────── */

let adReady = false;
let loading = false;
let preloadFails = 0;
let lastPreloadAt = 0;
let preloadTimer: ReturnType<typeof setTimeout> | null = null;
/** ★loadFullScreenAd 의 반환값은 «해지 함수»다(web-bridge d.ts:849-854 실측). */
let unsubscribeLoad: (() => void) | null = null;

function clearPreloadTimer(): void {
  if (preloadTimer !== null) {
    clearTimeout(preloadTimer);
    preloadTimer = null;
  }
}

function detachLoad(): void {
  if (unsubscribeLoad) {
    try {
      unsubscribeLoad();
    } catch {
      /* 해지 실패는 삼킨다 */
    }
    unsubscribeLoad = null;
  }
}

/** ★isSupported 는 «로드/표시»에만 적용한다. «계수»는 지원 여부와 무관하게 항상 돈다. */
function supportsAds(): boolean {
  try {
    return loadFullScreenAd.isSupported() && showFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

function notePreloadFailure(reason: 'timeout' | 'onError' | 'exception'): void {
  trackEvent('ad_request_fail', { kind: 'interstitial', reason });
  if (preloadFails < MAX_PRELOAD_FAILS) preloadFails += 1;
}

/** 다음 광고를 미리 로드해 둔다. 실패해도 «조용히» 넘어간다(광고만 안 뜬다). */
export function preload(): void {
  if (adReady || loading) return;
  if (mode === 'off') return;
  if (preloadFails >= MAX_PRELOAD_FAILS) return; // ⛔무한 재시도 금지
  // ★sumo-bounce 선례와 동일 — isSupported 확인 실패도 요청 실패의 한 형태다.
  if (!supportsAds()) { trackEvent('ad_request_fail', { kind: 'interstitial', reason: 'unsupported' }); return; }

  loading = true;
  lastPreloadAt = Date.now();
  detachLoad(); // ★재시도 시 구독 «중첩» 방지 — 이전 해지 함수를 반드시 부른다
  clearPreloadTimer();

  // ★DF-1① 고착부터 푼다. 콜백이 «아예 안 오면» loading 을 강제로 내린다.
  preloadTimer = setTimeout(() => {
    preloadTimer = null;
    if (!loading) return;
    loading = false;
    adReady = false;
    detachLoad();
    notePreloadFailure('timeout');
  }, PRELOAD_TIMEOUT_MS);

  let handle: (() => void) | null = null;
  try {
    handle =
      (loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (e) => {
          if (e?.type === 'loaded') {
            clearPreloadTimer();
            adReady = true;
            loading = false;
            preloadFails = 0; // 로드 성공 → 백오프 리셋
          }
        },
        onError: () => {
          clearPreloadTimer();
          adReady = false;
          loading = false;
          detachLoad();
          notePreloadFailure('onError');
        },
      }) as (() => void) | undefined) ?? null;
  } catch {
    clearPreloadTimer();
    adReady = false;
    loading = false;
    notePreloadFailure('exception');
  }
  // 콜백이 «동기»로 끝나버린 경우에도 해지 함수를 흘리지 않는다.
  if (loading || adReady) unsubscribeLoad = handle;
  else if (handle) {
    try {
      handle();
    } catch {
      /* noop */
    }
  }
}

/**
 * ★DF-1③ 재시도 트리거는 «타이머가 아니라 유저 행동»이다.
 *   판 종료 신호 / 광고 스킵 직후 / 광고 닫힘 직후에만 부른다.
 *   [실측] 피고지고 한 판은 STAGES.time 기준 92~140초 → 트리거 자체가 «자연 백오프».
 *   백오프 배열은 «같은 판 안에서 연달아 불릴 때»의 하한선으로만 쓴다.
 */
function requestPreload(): void {
  if (adReady || loading) return;
  if (mode === 'off') return;
  if (preloadFails >= MAX_PRELOAD_FAILS) return;
  if (preloadFails > 0) {
    const idx = Math.min(preloadFails - 1, PRELOAD_BACKOFF_MS.length - 1);
    const minGap = PRELOAD_BACKOFF_MS[idx] ?? 0;
    if (Date.now() - lastPreloadAt < minGap) return;
  }
  preload();
}

/* ─────────────────────────── 광고 표시 (DF-4) ─────────────────────────── */

/**
 * 광고를 보여주고, «끝나면» done() 을 부른다.
 * 성공/실패/타임아웃 «어느 경우에도» done() 은 «정확히 한 번» 불린다 —
 * 그래야 유저가 광고에 갇히지 않는다.
 *
 * ★DF-4: 타임아웃을 «둘로 분리»했다.
 *   SHOW_OPEN_TIMEOUT_MS — 광고가 «열리지 않는» 경우만. 'show'/'impression' 에 해제.
 *   SHOW_HARD_CAP_MS     — 광고가 «열린 뒤»의 안전망. 사실상 미발동.
 */
function show(done: () => void): void {
  let finished = false;
  let opened = false;
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let capTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribeShow: (() => void) | null = null;
  // ★계측(sumo-bounce 선례) — finish() 는 openTimer/capTimer/onError/failedToShow
  // 여러 경로에서 공유되므로, 부르기 직전에 사유를 적어두고 finish() 안에서 읽는다.
  // 기본값 'open_timeout' — 타이머 경로(열림 자체가 안 온 케이스)가 가장 흔하다.
  let showFailReason: 'open_timeout' | 'hard_cap' | 'onError' | 'failedToShow' | 'exception' = 'open_timeout';

  const clearOpenTimer = () => {
    if (openTimer !== null) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  };

  const finish = () => {
    if (finished) return;
    // ★열리지 않고(opened===false) 끝나면 실패다 — 정상 시청 완료(open 후
    // dismissed)는 opened=true 라 여기 안 걸린다. PII 없음(kind/reason 고정 열거값).
    if (!opened) trackEvent('ad_request_fail', { kind: 'interstitial', reason: showFailReason });
    finished = true;
    clearOpenTimer();
    if (capTimer !== null) {
      clearTimeout(capTimer);
      capTimer = null;
    }
    if (unsubscribeShow) {
      try {
        unsubscribeShow();
      } catch {
        /* noop */
      }
      unsubscribeShow = null;
    }
    adReady = false;
    requestPreload(); // ★ 「닫힌 뒤에는 다시 load 필요」(문서)
    done();
  };

  openTimer = setTimeout(() => {
    openTimer = null;
    if (!opened) finish(); // 광고가 «열리지도» 않았다 → 유저를 기다리게 하지 않는다
  }, SHOW_OPEN_TIMEOUT_MS);
  capTimer = setTimeout(() => {
    showFailReason = 'hard_cap';
    finish();
  }, SHOW_HARD_CAP_MS);

  let handle: (() => void) | null = null;
  try {
    handle =
      (showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (e) => {
          const t = e?.type;
          if (t === 'show' || t === 'impression') {
            // ★광고가 «열렸다». 여기서부터 5초든 30초든 «정상»이다 — open 타임아웃 해제.
            opened = true;
            clearOpenTimer();
            preloadFails = 0; // 성공적으로 «표시»했다 → 실패 카운터 리셋(DF-1④)
          } else if (t === 'dismissed') {
            finish();
          } else if (t === 'failedToShow') {
            showFailReason = 'failedToShow';
            finish();
          }
        },
        onError: () => {
          showFailReason = 'onError';
          finish();
        },
      }) as (() => void) | undefined) ?? null;
  } catch {
    showFailReason = 'exception';
    finish();
  }
  if (!finished) unsubscribeShow = handle;
  else if (handle) {
    try {
      handle();
    } catch {
      /* noop */
    }
  }
}

/* ─────────────────────────── 게이트 설치 ─────────────────────────── */

/**
 * 재발화 통과 플래그.
 * ★ 이게 없으면 「광고 → 재발화 → 다시 가로채기 → 광고 …」 «무한 루프»가 난다.
 *   유저가 광고를 빠져나오지 못하는, 이 설계에서 가장 나쁜 실패다.
 */
let bypassOnce = false;

/** 테스트에서 주입할 수 있게 분리했다(브라우저에선 기본값이 그대로 쓰인다). */
export interface AdGateDeps {
  isReady?: () => boolean;
  showAd?: (done: () => void) => void;
  mode?: ForceMode;
}

let isReadyImpl: () => boolean = () => adReady;
let showAdImpl: (done: () => void) => void = show;

type ClickLike = { stopImmediatePropagation?: () => void; preventDefault?: () => void };
type ButtonLike = { addEventListener: Function; click: Function };

/**
 * ★합법 노출 지점에서만 호출. done() 은 «반드시 정확히 한 번» 불린다.
 * ⛔준비가 안 됐으면 «빚을 소비하지 않고» 통과시킨다 → 다음 지점에서 곧바로 재시도.
 */
function maybeShowAd(done: () => void): boolean {
  if (!hasDebt()) {
    done();
    return false;
  }
  if (!isReadyImpl()) {
    requestPreload(); // 다음 지점을 위해 다시 채워둔다
    done();
    return false; // ★빚 «미소비»
  }
  consumeDebt();
  showAdImpl(done);
  return true;
}

function installClickHooks(getButton: (id: string) => ButtonLike | null): void {
  // ① 계수 + 노출 — 가로채고, 광고가 끝나면 «같은 버튼»을 재발화한다.
  for (const id of SHOW_EXIT_BUTTON_IDS) {
    const btn = getButton(id);
    if (!btn) continue;
    btn.addEventListener(
      'click',
      (event: ClickLike) => {
        // ① 재발화로 들어온 클릭이면 «그대로 통과»시킨다(루프 방지).
        if (bypassOnce) {
          bypassOnce = false;
          return;
        }
        // ② 판을 «소급 확정»한다. 멱등이라 이미 확정됐으면 아무 일도 안 한다.
        pollProgress();
        finalizeRun();
        // ③ 띄울 차례가 아니거나 준비가 안 됐으면 «가로채지 않는다» = 원래 동작 그대로.
        if (!hasDebt()) return;
        if (!isReadyImpl()) {
          requestPreload();
          return; // ★빚 미소비 — 다음 지점에서 재시도
        }
        // ④ 여기서부터 «가로챈다».
        event.stopImmediatePropagation?.();
        event.preventDefault?.();
        consumeDebt();
        showAdImpl(() => {
          // ⑤ 광고가 끝나면 «같은 버튼»을 재발화 → 원래 동작이 실행된다.
          // ★★DF-5 — 재발화는 «반드시 비동기»여야 한다.
          //
          //   ⚠ 「4종 공통 결함」이라는 상급 판정은 «틀렸다». 피고지고에서 «직접 재서» 채택했다.
          //     [실측 · Playwright DOM 프로브]
          //       재발화 sync  + 트리거 «사용자 탭»       → 원래 동작 1회 (살아남는다)
          //       재발화 sync  + 트리거 «프로그램적 click» → 원래 동작 0회 (★삼켜진다)
          //       재발화 async + 두 트리거 «모두»          → 원래 동작 정확히 1회
          //     표준상 「click in progress」 플래그는 HTMLElement.click() 이 «설정»하고
          //     사용자 입력은 건드리지 않는다. 그래서 «바깥 클릭이 프로그램적일 때만» 터진다.
          //
          //   ★그런데 피고지고는 그 경로가 «실재»한다 —
          //     [실측] game.js:1392 `if(screen==="result"){ ... $("rNext").click() ... }`
          //     = 결과화면에서 Enter/Space 를 누르면 게임이 rNext 를 «프로그램적으로» 클릭한다.
          //     rNext 는 «게이트 대상 버튼»이다. 즉 이 조합이 실사용에서 도달 가능하다:
          //       결과화면 Enter → rNext.click()(프로그램적) → 게이트 가로채기 → 광고가
          //       «동기»로 끝남(throw·동기 onError·동기 dismissed) → 동기 재발화 → «삼켜짐»
          //       → 유저에게는 «버튼이 죽은 것»으로 보인다.
          //     [실측] v1 번들로 같은 경로를 태우면 rNext 핸들러 실행 «0회», v2 는 «1회».
          //
          //   ⛔setTimeout 을 지우지 마라. 지우려면 «먼저» game.js 에서 게이트 대상 버튼
          //     (rMap·rRetry·rNext·pQuit·pRestart)에 대한 프로그램적 .click() 이 «0건»임을
          //     실측으로 보여라. 지금은 1건이다(game.js:1392).
          //     ★verify.py 섹션 15 가 이 전제를 «검사»로 들고 있다 — 누가 .click() 을 더
          //       넣거나 빼면 그 검사에서 드러난다.
          setTimeout(() => {
            bypassOnce = true;
            btn.click();
          }, 0);
        });
      },
      true // ★ capture — 게임 리스너보다 «먼저» 잡아야 한다
    );
  }

  // ② 계수만 (Q-A 승인안 A) — pause→바로 play 라 띄울 «합법 자리»가 없다.
  for (const id of COUNT_ONLY_BUTTON_IDS) {
    const btn = getButton(id);
    if (!btn) continue;
    btn.addEventListener(
      'click',
      () => {
        pollProgress();
        finalizeRun();
        requestPreload(); // ★유저 행동 = 재시도 트리거
      },
      true
    );
  }
}

let observer: MutationObserver | null = null;
/**
 * 마지막으로 확인한 #railInner 의 «첫 자식 노드 그 자체».
 * ★MutationObserver 의 «레코드가 왔다» 는 「상태가 «변했다»」와 «다르다»
 *   (2026-08-14 네온 레인 실측: 이미 있는 클래스를 add 해도 레코드 5건이 나온다).
 *   그래서 레코드는 «트리거»로만 쓰고, 판정은 «정착된 DOM 을 다시 읽어» 한다.
 *   buildRail() 은 매번 «새 button 요소»를 만들어 넣으므로(game.js:1079 createElement)
 *   첫 자식의 «노드 동일성»이 바뀌었는지가 곧 「진짜 재구성됐는가」다.
 */
let lastRailFirstChild: Node | null = null;

/**
 * DOM 관측 훅. ★관측자를 «하나»만 쓴다 —
 *   두 개로 나누면 같은 배치에서 콜백 «순서»가 엔진 구현에 의존하게 되고,
 *   startStage() 가 rail 과 coins 를 «같은 동기 블록»에서 바꾸기 때문에
 *   coins 콜백이 먼저 돌면 «직전 판»에 거짓 자격을 준다. 한 콜백 안에서 순서를 «내가» 정한다.
 */
function installDomObservers(): void {
  const rail = el(RAIL_ID);
  const coins = el(COINS_ID);
  const result = el(RESULT_SCREEN_ID);
  railObserved = rail !== null;

  if (typeof MutationObserver !== 'function') return;

  observer = new MutationObserver((records) => {
    let railHit = false;
    let coinsHit = false;
    let resultHit = false;

    for (const rec of records) {
      if (rail && rec.target === rail) {
        // buildRail(): innerHTML="" → appendChild × N. «추가»가 있으면 새로 그린 것이다.
        if (rec.type === 'childList' && rec.addedNodes.length > 0) railHit = true;
      } else if (coins && (rec.target === coins || coins.contains(rec.target as Node))) {
        coinsHit = true;
      } else if (result && rec.target === result) {
        if (!result.classList.contains('hidden')) resultHit = true;
      }
    }

    // ★순서를 «내가» 정한다: 종료 → 시작.
    if (resultHit) {
      pollProgress();
      if (!railObserved && !runPending) {
        // 폴백: rail 관측이 «불가능한» DOM 에서만 쓰인다(정상 index.html 에선 발생 안 함).
        runPending = { startedAt: 0, baseCoins: null, progressed: true };
      }
      finalizeRun();
      requestPreload();
    }
    // ★레코드는 «트리거»일 뿐이다. 「진짜 교체됐는가」는 정착된 DOM 을 «다시 읽어» 판정한다.
    if (railHit && rail) {
      const first = rail.firstChild;
      const reallyReplaced = first !== null && first !== lastRailFirstChild;
      lastRailFirstChild = first;
      if (reallyReplaced && isPlayScreen()) beginRun();
    }
    // rail 이 새로 그려진 배치의 coins 변화는 «새 스테이지 초기값»이다 — 진행으로 보지 않는다.
    if (coinsHit && !railHit) pollProgress();
  });

  if (rail) observer.observe(rail, { childList: true });
  if (coins) observer.observe(coins, { childList: true, characterData: true, subtree: true });
  if (result) observer.observe(result, { attributes: true, attributeFilter: ['class'] });
}

function onLeave(): void {
  pollProgress();
  finalizeRun(); // 강제종료·백그라운드 이탈도 «한 판»으로 확정한다(localStorage 는 동기 기록)
}

function installLifecycleHooks(): void {
  try {
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) onLeave();
    });
  } catch {
    /* noop */
  }
}

/**
 * 하드웨어 뒤로가기 훅 (EXIT 경로).
 * sdk-boot.ts 가 `pushBackHandler` 로 등록한다 — installExitConfirm() «뒤»에 등록해야
 * (handleBack 이 LIFO 로 돈다, navigationBar.ts:48) 종료확인 모달보다 «먼저» 실행된다.
 * ⛔여기서 true 를 반환하면 안 된다 — 소비하면 종료확인 모달이 안 뜬다.
 */
export function onHardwareBack(): void {
  pollProgress();
  finalizeRun();
  maybeShowAd(() => {});
  requestPreload();
}

export function installAdGate(getButton: (id: string) => ButtonLike | null, deps: AdGateDeps = {}): void {
  // 하이드레이트를 «아무도 시작하지 않았다면» 버퍼링할 이유가 없다 — 곧바로 저장을 연다.
  // (sdk-boot 는 hydrateAdCounter() 를 «await 한 뒤» 이 함수를 부르므로 정상 경로에선 이미 true 다.)
  if (!hydrated) hydrateDone = true;
  mode = deps.mode ?? forceMode();
  if (deps.isReady) isReadyImpl = deps.isReady;
  if (deps.showAd) showAdImpl = deps.showAd;

  installClickHooks(getButton);
  installDomObservers();
  installLifecycleHooks();

  if (mode !== 'off') requestPreload();
}

/** 브라우저에서 실제로 부르는 진입점. */
export function installAdGateOnDocument(): void {
  // ⛔부팅 가드로 «게이트 전체»를 죽이지 않는다(v1 은 죽였다).
  //   광고 지원 여부와 무관하게 «판 계수»는 돌아야 한다.
  //   isSupported 는 supportsAds() 안에서 «로드/표시»에만 적용된다.
  installAdGate((id) => document.getElementById(id));
}

/* ─────────────────────────── 테스트 전용 ─────────────────────────── */

/** 테스트 전용 — 모듈 상태를 초기화한다. */
export function __resetForTest(): void {
  bypassOnce = false;
  adReady = false;
  loading = false;
  preloadFails = 0;
  lastPreloadAt = 0;
  clearPreloadTimer();
  detachLoad();
  runPending = null;
  lastRailFirstChild = null;
  counter = { plays: 0, adPending: false };
  hydrated = false;
  hydrateDone = false;
  mode = 'normal';
  isReadyImpl = () => adReady;
  showAdImpl = show;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

export function __getStateForTest(): {
  plays: number;
  adPending: boolean;
  runPending: boolean;
  adReady: boolean;
  loading: boolean;
  preloadFails: number;
} {
  return {
    plays: counter.plays,
    adPending: counter.adPending,
    runPending: runPending !== null,
    adReady,
    loading,
    preloadFails,
  };
}

export function __setCounterForTest(plays: number, adPending: boolean): void {
  counter = { plays, adPending };
}
