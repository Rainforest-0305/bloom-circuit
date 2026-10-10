/**
 * 피고지고 — «시작화면 상·하단» 배너 진입점. 2026-08-18
 *
 * ⛔ 왜 sdk-boot.ts 에 안 얹었나:
 *   src/sdk-boot.ts 와 src/toss/* 는 전면광고 게이트 소유이고 이번 작업의
 *   «무접촉» 대상이다. 그래서 index.html 에 «두 번째 module 진입점»으로 분리한다.
 *   (스모바운스가 arenaBannerBoot.ts 를 같은 이유로 분리한 선례를 따른다)
 *
 * ★로드 순서 의존이 없다: isTitleNow() 가 #scTitle 부재를 감지해 false 를
 *   돌려주고, 250ms 폴링이 계속 재판정하므로 화면이 뜬 «뒤» 자연히 붙는다.
 * ★절대 throw 하지 않는다 — 배너가 실패해도 «게임은 반드시 떠야» 한다.
 */
import { installStartBanners } from './startBanner';

try {
  installStartBanners();
} catch (e) {
  console.error('[start-ad] install failed (게임은 계속 진행):', e);
}
