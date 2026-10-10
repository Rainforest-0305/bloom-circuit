/**
 * 계측 배선 (venture-frontend, 2026-08-22, Chief 지시 — 작업순서 ⑤, SDK 확정).
 *
 * ── 실제 전송을 붙였다 ────────────────────────────────────────────────
 * `@apps-in-toss/web-framework` 가 `export * from '@apps-in-toss/web-bridge'`
 * 로 재수출하는 `eventLog()` 를 쓴다(Chief 실측: 재수출 배럴이 얕아서 죽은
 * 검사기가 "없다"고 오판하기 쉬운 자리였다 — 이 프로젝트가 이미 같은
 * 패턴으로 loadFullScreenAd·graniteEvent·SafeAreaInsets·Storage 를 전부
 * `@apps-in-toss/web-framework` 에서 직접 import 해 쓰고 있다, src/toss/*.ts
 * 참고). 샌드박스(토스 밖)에서는 콘솔 출력만 하고 죽지 않는다 — isInToss()
 * 가드 불요(Chief 확인). 그래도 SDK 호출은 전부 try/catch 로 감싼다(계측
 * 실패가 게임을 막으면 안 된다는 이 코드베이스 전역 원칙).
 *
 * ── 이벤트 표준 — 5개 게임 공통, 이름을 바꾸지 않는다 ────────────────────
 * app_enter / run_start / run_end / stage_enter / stage_exit / screen_view /
 * ad_request_fail / attendance_claim. 호출부는 game.js 의 track(name,params)
 * 가 그대로 이 이름들을 쓴다(2026-08-22 재작업 — 이전 버전의 임의 이름
 * app_open/stage_start/stage_end/stage_leave/screen_enter 는 전량 교체).
 *
 * ── 아직 호출부가 없는 이벤트 ─────────────────────────────────────────
 * `ad_request_fail` 은 스키마만 여기 정의돼 있다. 실제 호출부는
 * src/toss/interstitialAd.ts·startBanner.ts 를 다뤄야 하는데, 그 작업은
 * Chief 가 재확인한 순서상 «작업순서 ③ 리워드광고» 단계다 — 오늘은 실운영
 * 광고ID 파일을 스코프 밖에서 건드리지 않으려 의도적으로 미룬다.
 * `attendance_claim` 도 마찬가지로 «작업순서 ④ 출석» 승인 후 호출부가 붙는다.
 *
 * ── 제약 준수 ─────────────────────────────────────────────────────────
 * - Promise 비동기, «상태 전이 시점에만» 호출(게임 루프/프레임에서 직접
 *   호출 «금지» — game.js 쪽 호출부가 전부 스테이지 시작/종료·화면전환 같은
 *   이산 지점이다, 매 프레임 호출 0건).
 * - PII 없음 — params 는 game 이름·스테이지id·enum 문자열·정수·불리언뿐이다.
 *   유저ID·기기ID·좌표 등 식별값은 어디에도 없다(SDK 가 필터링해 주지
 *   않는다는 Chief 경고를 이 파일이 스스로 책임진다).
 */
import { eventLog } from '@apps-in-toss/web-framework';
import type { EventLogParams } from '@apps-in-toss/web-bridge';

const GAME = 'bloom';

type LogType = EventLogParams['log_type'];
type Primitive = string | number | boolean | null;

/** game.js 의 window.__gcTrack(name, params) 훅이 그대로 넘기는 표준 이벤트 이름. */
const LOG_TYPE_BY_EVENT: Record<string, LogType> = {
  app_enter: 'event',
  run_start: 'event',
  run_end: 'event',
  stage_enter: 'event',
  stage_exit: 'event',
  screen_view: 'screen',
  ad_request_fail: 'error',
  attendance_claim: 'event',
};

const DEBUG_BUFFER_CAP = 200; // QA/하네스 확인용 - 무한누적 방지 상한, 운영 경로 무관
interface DebugEntry { name: string; params: Record<string, Primitive>; t: number }
const debugBuffer: DebugEntry[] = [];

/** 디버깅/QA(headless 하네스) 전용 - 실제 전송 경로(eventLog)와 별개다. */
export function getTrackBufferForDebug(): readonly DebugEntry[] {
  return debugBuffer.slice();
}

/** game.js 의 track() 이 호출하는 훅의 실제 구현. 절대 던지지 않는다. */
export function trackEvent(name: string, params: Record<string, Primitive> = {}): void {
  debugBuffer.push({ name, params, t: Date.now() });
  if (debugBuffer.length > DEBUG_BUFFER_CAP) debugBuffer.shift();
  try {
    const logType = LOG_TYPE_BY_EVENT[name] || 'event';
    const payload: EventLogParams = {
      log_name: name,
      log_type: logType,
      params: { game: GAME, ...params },
    };
    // eventLog() 는 Promise 를 반환하지만 호출부(game.js)는 상태 전이 지점에서
    // fire-and-forget 으로 부른다 — 계측 지연이 게임 진행을 막으면 안 된다.
    eventLog(payload).catch((e) => {
      try {
        console.debug('[track] eventLog rejected', name, e);
      } catch (_) {
        /* noop */
      }
    });
  } catch (e) {
    try {
      console.debug('[track] eventLog threw synchronously', name, e);
    } catch (_) {
      /* noop */
    }
  }
}
