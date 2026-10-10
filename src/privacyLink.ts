/**
 * 개인정보처리방침 링크 배선 — 2026-08-22 Partner 지시, 2026-08-23 번들
 * 동봉으로 전환(Chief 지시, 머니리그 레인 선례).
 *
 * ── 왜 별도 파일인가 ────────────────────────────────────────────────────
 * exitConfirmUi.ts 와 같은 패턴(원본 게임 파일 무접촉, index.html 의 정적
 * 마크업 위에 얹는다). #linkPrivacy 는 index.html 에 <a href target=_blank>
 * 로 «이미» 정적으로 박혀 있다 — JS 가 실패해도 기본 앵커 동작이 살아있는
 * 게 기본값이다(폴백의 폴백). 이 모듈은 ko/en 텍스트를 실시간 반영하는
 * 것만 얹는다.
 *
 * ── ★2026-08-23 SDK openURL 분기 제거(단순화, 되돌린 게 아님) ─────────────
 * 이전(라이브 URL 시절)에는 isInToss() 를 동기로 먼저 검사해 토스 안에서만
 * preventDefault 후 SDK openURL 로 우회했다 — 그 이유는 openURL 이 「기기
 * 기본 브라우저로 «외부» URL 열기」용(RN Linking.openURL 래퍼, web-bridge
 * d.ts: "지정된 URL을 기기의 기본 브라우저나 관련 앱에서 열어요")이라
 * https:// «외부» 오리진으로 점프할 때만 필요했기 때문이다.
 * 지금은 privacy.html 이 index.html 과 «같은 번들·같은 오리진»에 실려서
 * 상대경로(./privacy.html)로 연결된다 — 더 이상 「외부로 나가는」 게 아니라
 * 「내부 상대 리소스를 새 탭에 여는」 문제다. openURL 을 relative path 로
 * 부르면 Linking.openURL 이 유효한 외부 URL/딥링크로 못 받아들여 원리상
 * 안 맞는다. 그래서 SDK 우회를 걷어내고 네이티브 <a target=_blank> 그대로
 * 둔다(클릭 핸들러가 preventDefault 를 아예 안 함 → 팝업차단 함정 자체가
 * 구조적으로 발생할 수 없다 — 우회 코드가 없으므로 우회가 실패할 경로도
 * 없다). ⚠️토스 실기기 WebView 가 같은 오리진 상대경로 target=_blank 를
 * 어떻게 처리하는지(새 웹뷰 탭 vs 무반응)는 이 레인에서 실기기로 검증하지
 * 못했다 — headless(웹 채널, 로컬 정적서버 시뮬레이션)로는 same-origin
 * 상대경로 새 탭 오픈이 정상 동작함만 확인했다. Chief/Partner 보고 필요.
 *
 * ── ko/en 텍스트를 어떻게 따라가는가 ────────────────────────────────────
 * 원본 게임(public/game/bloom-circuit-game.js)의 applyLang() 이 언어 전환마다
 * `document.documentElement.lang` 을 그 언어 코드로 갱신한다(원본 1780행
 * 실측, 게임 코드 자체는 안 건드림). 이 모듈은 그 속성을 MutationObserver 로
 * «관측»만 한다 — 게임 내부 함수를 호출하거나 훅을 걸지 않는다(다른
 * 래핑 코드와 동일 원칙, interstitialAd.ts 의 "게임 JS 0줄" 철학 재사용).
 */

const LABEL: Record<string, string> = {
  ko: '개인정보처리방침',
  en: 'Privacy Policy',
};

function currentLang(): string {
  const lang = document.documentElement.lang;
  return LABEL[lang] ? lang : 'ko';
}

function syncLabel(link: HTMLAnchorElement): void {
  link.textContent = LABEL[currentLang()];
}

export function installPrivacyLink(): void {
  const link = document.getElementById('linkPrivacy') as HTMLAnchorElement | null;
  if (!link) return;

  syncLabel(link);

  const observer = new MutationObserver(() => syncLabel(link));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // 클릭 핸들러 없음 — 네이티브 <a href="./privacy.html" target="_blank">
  // 기본 동작에 전부 맡긴다(의도적, 위 설명 참고).
}
