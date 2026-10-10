/**
 * 웹 전용 `@apps-in-toss/web-framework` 패키지 대체 shim — 피고지고.
 *
 * ── 왜 필요한가 ───────────────────────────────────────────────────────────
 * `src/startBanner.ts`(시작화면 상하단 배너)는 `src/toss/**` 배럴도,
 * `src/toss/analytics.ts` 도 거치지 않고 **`@apps-in-toss/web-framework` 에서
 * `TossAds` 를 직접 import**한다. barrel shim·interstitialAd shim·analytics
 * shim 어느 것도 이 파일을 커버하지 못한다 — 그래서 vite.config.ts 가 이
 * 패키지 이름 자체(bare specifier)를 이 파일로 alias 한다.
 *
 * ── 왜 startBanner.ts 를 «다시 쓰지» 않고 패키지만 alias 하는가 ─────────────
 * startBanner.ts 는 예산 유도·핏가드·터치 제외 같은 300줄대 순수 로직을
 * 갖고 있다(광고 SDK 호출은 TossAds.initialize/attachBanner 단 2곳뿐, 둘 다
 * `TossAds.*.isSupported()` 가드를 이미 통과해야만 호출된다 — 원본 실측).
 * 이 로직을 shim 파일에 복제하면 두 벌을 유지해야 해서 드리프트 위험이
 * 크다. 대신 «SDK 진입점만» 항상 `isSupported()===false` 를 반환하게
 * 하면, 원본 소스 그대로가 자기 자신의 방어 코드로 안전하게 건너뛴다.
 * 즉 이 shim 은 새 로직이 아니라 «이미 있는 방어선을 트리거하는 신호»다.
 *
 * ⚠️ 광고 배너 데이터 속성(`index.html` 의 `data-ad-start-top/bottom`)은
 *   여기서 안 지운다 — 그건 vite.config.ts 의 `transformIndexHtml` 훅이 웹
 *   빌드 산출물 HTML 에서 빈 문자열로 치환한다(그래도 placementId() 가
 *   ''를 반환하면 attachOne 이 `if (!id) return` 으로 애초에 SDK 호출 전에
 *   걸러진다 — 이중 방어, startBanner.ts 실측).
 *
 *   vite build              → 이 shim   (웹 / 스토어) — 광고 SDK 네트워크 도메인 0건
 *   vite build --mode toss  → 진짜 SDK  (`ait build` 가 이 모드로 부른다)
 */

function withIsSupportedFalse<T extends (...args: never[]) => unknown>(fn: T): T & { isSupported(): boolean } {
  return Object.assign(fn, { isSupported: () => false });
}

/** startBanner.ts 가 쓰는 표면만 흉내낸다 — 항상 "미지원"으로 응답한다. */
export const TossAds = {
  initialize: withIsSupportedFalse((_options?: unknown): void => {
    /* 도달하지 않는다 — TossAds.initialize.isSupported() 가 먼저 false 를 본다 */
  }),
  attachBanner: withIsSupportedFalse((_id: string, _host: HTMLElement, _options?: unknown): { destroy(): void } => {
    /* 도달하지 않는다 — TossAds.attachBanner.isSupported() 가 먼저 false 를 본다 */
    return { destroy() {} };
  }),
};
