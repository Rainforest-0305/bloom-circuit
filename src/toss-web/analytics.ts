/**
 * 웹 전용 계측 대체 shim — 피고지고.
 *
 * ── 왜 필요한가 ───────────────────────────────────────────────────────────
 * 실제 `src/toss/analytics.ts` 는 토스 SDK의 로그 전송 함수를
 * `@apps-in-toss/web-framework` 에서 import 한다(그 파일 자신의 주석에도
 * "재수출 배럴이 얕아서 죽은 검사기가 없다고 오판하기 쉬운 자리" 라고
 * 명시돼 있다 — 같은 이유로 이
 * shim 이 필요하다). `src/toss/analytics.ts` 는 `sdk-boot.ts`(`./toss/analytics`)
 * 와 (real) `src/toss/interstitialAd.ts`(`./analytics`) «양쪽»이 배럴을
 * 거치지 않고 직접 import한다 — barrel shim 하나로 안 끝나는 이유. 그래서
 * `./analytics`/`./toss/analytics` 로 해석되는 import 자체를 vite.config.ts
 * 의 플러그인이 이 파일로 돌린다.
 *
 * ── 웹판 동작 ────────────────────────────────────────────────────────────────
 * MS Store 에 "no ads, no data collection" 으로 신고한 앱이다 — 신고와 실제
 * 산출물이 항상 일치해야 한다. 그래서 네이티브 브릿지를 아예 참조하지 않고
 * 콘솔에만 남긴다 — 전송은 절대 하지 않는다. 광고만 빼는 게 아니라 계측
 * 자체를 통째로 뺀다(작업 지시 명시 — "계측도 shim 대상, 광고만 빼면 안 된다").
 *
 * ★이 shim 은 실제 SDK 로그 함수의 이름(위 문단에서도 일부러 재인용하지
 *   않았다)을 코드에서도, 주석에서도 쓰지 않는다 — 출고물 정적 검사가
 *   그 문자열 검출로 토스판/웹판을 대조하는데, 주석에 그대로 옮겨 적으면
 *   vite 소스맵(sourcesContent)에 그 문자열이 다시 실려 검사를 오염시킨다
 *   (실측: 이 파일의 이전 버전이 정확히 이 경로로 새고 있었다). "검사를
 *   통과하려고"가 아니라 "실제로 없게" 만드는 것이다(sumo-bounce 선례,
 *   Chief 지시).
 *
 *   vite build              → 이 shim   (웹 / 스토어) — SDK 로그 함수 호출 0건
 *   vite build --mode toss  → 진짜 계측 (`ait build` 가 이 모드로 부른다)
 */
import type { trackEvent as RealTrackEvent } from '../toss/analytics';

export const trackEvent: typeof RealTrackEvent = (name, params = {}) => {
  try {
    console.log('[web-shim][track]', name, params);
  } catch {
    /* 계측 자체가 게임을 막으면 안 된다 */
  }
};
