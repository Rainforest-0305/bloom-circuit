/**
 * 게임 필수 SDK ⑤ — 외부 URL 열기 (2026-08-22, Partner 지시: 개인정보처리방침
 * 링크 접근성 확보).
 *
 * ── 왜 SDK 경로가 우선인가 ───────────────────────────────────────────────
 * 토스 미니앱 WebView 안에서 `<a target="_blank">` 는 새 탭이 아니라 같은
 * WebView 안에서 막히거나 무반응일 수 있다(공식 문서가 `openURL` 을 「기기의
 * 기본 브라우저나 관련 앱에서 열기」용으로 명시 — RN Linking.openURL 래퍼).
 * 그래서 SDK 를 먼저 시도하고, 실패(토스 밖·브릿지 없음 등)하면
 * `window.open` 으로 떨어진다 — 절대 throw 하지 않는다(이 코드베이스 전역
 * 원칙, src/toss/index.ts 참고).
 *
 * ⛔개인정보 없음 — url 은 고정 상수 하나뿐이다.
 */
import { openURL } from '@apps-in-toss/web-framework';

export async function openExternalUrl(url: string): Promise<void> {
  try {
    await openURL(url);
  } catch (e) {
    try {
      console.warn('[toss][openExternalUrl] openURL failed, falling back to window.open', e);
    } catch (_) {
      /* noop */
    }
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      /* 그래도 실패하면 <a href target=_blank> 의 기본 동작에 맡긴다(호출부가 이미
         real <a> 태그의 클릭을 preventDefault 하지 않은 채로 넘어왔다면 브라우저
         자체 내비게이션이 동작한다 — 이중 안전망). */
    }
  }
}
