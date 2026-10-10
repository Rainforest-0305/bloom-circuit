/**
 * 웹 전용 Toss SDK 대체 shim (브라우저 / Microsoft Store / Capacitor APK 용) — 피고지고.
 *
 * ── 왜 존재하는가 ───────────────────────────────────────────────────────────
 * `src/exitConfirmUi.ts`·`src/sdk-boot.ts` 는 `src/toss/index.ts` 배럴을 import
 * 한다. 이 배럴이 끌어오는 `src/toss/navigationBar.ts`·`safeArea.ts`·
 * `storage.ts` 가 `@apps-in-toss/web-framework` 를 직접 import하는데, 이
 * 배럴은 트리셰이킹이 되지 않아 **토스 SDK(광고 포함)가 통째로 웹 번들에
 * 딸려 들어간다**. 게임은 이 서브트리를 웹/스토어 빌드에서 한 줄도 필요로
 * 하지 않는다.
 *
 * ── 어떻게 갈아끼우는가 ─────────────────────────────────────────────────────
 * vite.config.ts 의 shim 플러그인이 `src/toss/index.ts` 로 해석되는 import 를
 * 이 파일로 되돌린다. 배럴만 갈아끼우면 `src/toss/**` 서브트리 대부분
 * (bridge.ts·env.ts·identity.ts·navigationBar.ts·safeArea.ts)이 모듈
 * 그래프에서 빠진다 — 배럴 말고 이 파일들을 직접 import 하는 곳이 없음을
 * 확인했다(exitConfirmUi.ts·sdk-boot.ts 전부 배럴 경유, 2026-08-22 전수 grep).
 * ⚠️예외 2건, 배럴 shim 하나로 안 끝나는 이유:
 *   1) `src/toss/interstitialAd.ts` — sdk-boot.ts 가 배럴을 거치지 않고
 *      «직접» import한다(`from './toss/interstitialAd'`). 게다가 이 파일
 *      소스에 실운영 광고 ID 리터럴이 직접
 *      박혀 있다 — `src/toss-web/interstitialAd.ts` 가 별도로 갈아끼운다.
 *   2) `src/toss/analytics.ts` — sdk-boot.ts(`./toss/analytics`)와 (real)
 *      interstitialAd.ts(`./analytics`) 둘 다 배럴 밖에서 직접 import한다
 *      — `src/toss-web/analytics.ts` 가 별도로 갈아끼운다.
 * 그리고 `src/startBanner.ts` 는 `@apps-in-toss/web-framework` 에서 `TossAds`
 * 를 배럴·analytics 어느 쪽도 거치지 않고 «패키지에서 직접» import한다 —
 * `src/toss-web/web-framework.ts` 가 패키지 bare specifier 자체를 alias한다
 * (vite.config.ts 참고). storage.ts 는 배럴(index.ts)과 interstitialAd.ts
 * 양쪽에서 참조되지만, 그 두 참조자 모두 shim으로 갈아끼워지므로 storage.ts
 * 자신은 자동으로 그래프에서 빠진다(별도 shim 불요).
 *
 *   vite build              → 이 shim   (웹 / 스토어)
 *   vite build --mode toss  → 진짜 SDK  (`ait build` 가 이 모드로 부른다)
 *
 * ★ 미니앱 빌드는 절대 이 파일을 타지 않는다. 토스 심사 필수 SDK 4종은
 *   `src/toss/**` 원본 그대로 살아 있다.
 *
 * ── 타입 드리프트 방지 ──────────────────────────────────────────────────────
 * 아래 모든 export 는 진짜 모듈의 타입(`typeof RealToss.*`)을 직접 붙여서
 * 선언한다. 원본 시그니처가 바뀌면 이 파일이 **컴파일 에러**로 터진다.
 * `import type` 이라 런타임에는 완전히 제거되며 프레임워크가 딸려오지 않는다.
 *
 * 출처: `04_땅따먹기/src/toss-web/` + sumo-bounce/src/toss-web/index.ts 방식을
 * 이식(Chief 지시 — 검증된 패턴 재사용, sumo가 먼저 밟은 함정들 그대로 회피).
 * 이 프로젝트의 barrel export 목록(GAME_STORAGE_KEYS 1개짜리 배열·Identity에
 * channel 필드 없음)에 맞춰 export 목록·타입을 다시 짰다.
 */
import type * as RealToss from '../toss';

// ── 환경 판별 ────────────────────────────────────────────────────────────────
/** 웹 빌드에서는 정의상 토스 밖이다. */
export const isInToss: typeof RealToss.isInToss = () => false;

// ── ③ Storage (localStorage 백엔드) ─────────────────────────────────────────
const NS = 'bloom:'; // src/toss/storage.ts 와 반드시 동일해야 한다(저장 데이터 호환).

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
    /* quota / private mode — 무시 */
  }
}

export const storage: typeof RealToss.storage = {
  async getItem(key: string): Promise<string | null> {
    return localGet(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    localSet(key, value);
  },
  async removeItem(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/** 저장 키 정본. src/toss/storage.ts 의 KEYS 와 값이 다르면 컴파일 에러가 난다. */
export const KEYS: typeof RealToss.KEYS = {
  sdkSelfTest: `${NS}sdkSelfTest`,
  gameMirrorPrefix: `${NS}game.mirror.`,
} as const;

/** 원본 게임이 실제로 쓰는 localStorage 키 1개. src/toss/storage.ts 와 동일해야 한다. */
export const GAME_STORAGE_KEYS: typeof RealToss.GAME_STORAGE_KEYS = ['bloomCircuitSave3'] as const;

/**
 * 웹에는 「네이티브 미러」가 없다 — 미러할 대상 자체가 없으므로 no-op.
 * localStorage 는 이미 게임 자체(writeSave)가 직접 쓰고 있으므로 여기서
 * 다시 쓸 이유가 없다(이중 쓰기 방지).
 */
export const mirrorGameWrite: typeof RealToss.mirrorGameWrite = () => {};

/**
 * 웹에는 프라이밍할 네이티브 소스가 없다 — no-op(즉시 resolve).
 * 원본은 "네이티브에 있고 localStorage 에 없는 키를 역주입"하는데, 웹에는
 * 네이티브가 없으므로 항상 아무 일도 하지 않는 게 원본과 동치 동작이다.
 */
export const primeGameStorage: typeof RealToss.primeGameStorage = async () => {};

// ── ④ 뒤로가기 스택 ─────────────────────────────────────────────────────────
type BackHandler = Parameters<typeof RealToss.pushBackHandler>[0];

const backHandlers: BackHandler[] = [];

export const pushBackHandler: typeof RealToss.pushBackHandler = (handler) => {
  backHandlers.push(handler);
  return () => {
    const i = backHandlers.indexOf(handler);
    if (i >= 0) backHandlers.splice(i, 1);
  };
};

/** 원본 navigationBar.ts 의 "토스 밖" 분기와 동일하게 popstate 를 뒤로가기로 잇는다. */
function handleBack(): void {
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    try {
      if (backHandlers[i]!() === true) return;
    } catch (err) {
      console.warn('[web-shim][nav] back handler threw:', err);
    }
  }
  // 아무도 소비하지 않았다. 웹에서는 닫을 창이 없으므로 아무 일도 하지 않는다.
}

/** 웹에는 닫을 미니앱이 없다 — 원본도 토스 밖에서는 closeView 브릿지가 no-op 폴백을 탄다. */
export const exitMiniApp: typeof RealToss.exitMiniApp = async () => {};

// ── 외부 URL 열기 (개인정보처리방침 링크) ─────────────────────────────────
// 웹에는 네이티브 브릿지가 없다 — window.open 이 곧 원본과 동치 동작이다
// (원본도 openURL 실패 시 이 경로로 떨어진다, src/toss/externalLink.ts 참고).
export const openExternalUrl: typeof RealToss.openExternalUrl = async (url) => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (_) {
    /* noop */
  }
};

// ── 식별키 (로컬 익명 ID) ────────────────────────────────────────────────────
const LOCAL_ID_KEY = 'bloom:localAnonId'; // src/toss/identity.ts 와 동일해야 한다.

let cached: RealToss.Identity | null = null;

function makeLocalId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return `local-${c.randomUUID()}`;
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function resolveLocalIdentity(): Promise<RealToss.Identity> {
  const existing = await storage.getItem(LOCAL_ID_KEY);
  if (existing) return { userKey: existing, source: 'local', invalidCategory: false };
  const fresh = makeLocalId();
  await storage.setItem(LOCAL_ID_KEY, fresh);
  return { userKey: fresh, source: 'local', invalidCategory: false };
}

export const currentIdentity: typeof RealToss.currentIdentity = () => cached;

// ── 부트스트랩 ──────────────────────────────────────────────────────────────
export const initTossSdk: typeof RealToss.initTossSdk = async () => {
  console.log('[web-shim] boot (browser build — Toss SDK not bundled)');

  const onPop = () => handleBack();
  window.addEventListener('popstate', onPop);

  cached = await resolveLocalIdentity();

  // 원본과 같은 위치에 저장 왕복 확인을 남긴다.
  const stamp = `${Date.now()}`;
  await storage.setItem(KEYS.sdkSelfTest, stamp);
  const storageOk = (await storage.getItem(KEYS.sdkSelfTest)) === stamp;

  return {
    identity: cached,
    inToss: false,
    selfTest: {
      userKey: 'fallback',
      safeArea: 'fallback',
      storage: storageOk ? 'ok' : 'fallback',
      navigationBar: 'fallback',
    },
    dispose: () => {
      window.removeEventListener('popstate', onPop);
    },
  };
};

// ── 타입 재수출 (런타임 코드 없음) ──────────────────────────────────────────
export type { TossRuntime, SdkSelfTest, Identity } from '../toss';
