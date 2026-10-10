/**
 * 피고지고 (Bloom Circuit) — 부팅 엔트리 (index.html 이 로드하는 유일한
 * 모듈 스크립트). sumo-bounce/src/sdk-boot.ts 레시피를 그대로 적용(§11).
 *
 * 이 파일이 하는 일:
 *   1. src/toss (게임 필수 SDK 4종 통합 부트스트랩) 가동 — 사용자 식별키·
 *      Safe Area·네이티브 Storage self-test·내비게이션 바 back/home 배선.
 *      전부 절대 throw 하지 않는다(src/toss/index.ts 참고) — 토스 밖(로컬
 *      dev)에서도 폴백으로 동작한다는 걸 sumo-bounce 세션에서 Playwright 로
 *      실측함(이 게임도 동일 코드 재사용).
 *   2. 종료 확인 모달 배선(G3) — src/toss 의 pushBackHandler 위에 얹는다.
 *   3. 원본 게임의 loadSave/writeSave(localStorage) 을 네이티브 Storage 로
 *      미러링하는 훅 노출 + 프라이밍(await, 게임 스크립트 주입 전에 완료돼야
 *      한다 — src/toss/storage.ts 의 주석 참고).
 *   4. 원본 게임 스크립트(public/game/bloom-circuit-game.js, 원본 index.html
 *      의 <script> 내용을 그대로 옮긴 것 + writeSave() 1줄 패치)를 동적으로
 *      주입해 실행한다.
 *
 * ★ 게임 로직 자체는 이 파일에 없다. 원본 게임이 이미 완성돼 있고, 미션
 *   지시가 "게임 코드는 그대로 두고 래핑만"이기 때문이다.
 */
import { initTossSdk, primeGameStorage, mirrorGameWrite, GAME_STORAGE_KEYS, pushBackHandler } from './toss';
import { trackEvent } from './toss/analytics';
import { installAdGateOnDocument, hydrateAdCounter, onHardwareBack } from './toss/interstitialAd';
import { installExitConfirm } from './exitConfirmUi';
import { installPrivacyLink } from './privacyLink';

declare global {
  interface Window {
    /** public/game/bloom-circuit-game.js 의 패치된 writeSave() 이 호출하는 훅. */
    __nativeStorageMirror?: (key: string, value: string) => void;
    /** public/game/bloom-circuit-game.js 의 track() 이 호출하는 계측 훅
     *  (2026-08-22, 작업순서 ⑤). 실제 구현은 src/toss/analytics.ts. */
    __gcTrack?: (name: string, params?: Record<string, string | number | boolean | null>) => void;
    /**
     * 게임 코드가 «뒤로가기»를 선점할 수 있게 여는 훅 (2026-08-23).
     *
     * ★왜 필요한가: public/game/*.js 는 vite publicDir 이라 번들/트랜스폼을
     *   타지 않는다 — import 가 불가능하다. 그런데 출석 오버레이가 떠 있는 동안
     *   뒤로가기가 「앱 종료 확인」으로 내려가면 사고다(팝업을 닫으려던 것이지
     *   앱을 나가려던 게 아니다). backHandlers 배열은 navigationBar.ts 의
     *   모듈 private 이라 게임 쪽에서 닿을 방법이 이 훅뿐이다.
     * ★LIFO 라 «게임 스크립트 주입 시점»(= 이 파일의 맨 마지막 단계)에 등록되는
     *   핸들러가 종료확인·광고계수보다 «먼저» 실행된다. 순서를 바꾸지 마라.
     */
    __gcPushBack?: (handler: () => boolean | void) => () => void;
  }
}

function injectGameScript(): void {
  const script = document.createElement('script');
  script.src = '/game/bloom-circuit-game.js';
  script.onerror = () => {
    console.error('[sdk-boot] failed to load /game/bloom-circuit-game.js');
  };
  document.body.appendChild(script);
}

async function boot(): Promise<void> {
  // 1+2. SDK 4종 부트스트랩 + 종료확인 모달 배선.
  //    initTossSdk() 는 절대 throw 하지 않지만(내부 전부 safeBridge/safeSync),
  //    혹시 모를 예상 밖 예외까지 여기서 한 번 더 막는다 — 이게 실패해도
  //    게임 자체는 반드시 떠야 한다(injectGameScript 는 아래에서 별도로 돈다).
  try {
    const runtime = await initTossSdk();
    console.log('[sdk-boot] toss sdk ready:', runtime.selfTest);
  } catch (e) {
    console.error('[sdk-boot] initTossSdk() threw unexpectedly:', e);
  }
  installExitConfirm();
  // ★2026-08-22 Partner 지시 — 개인정보처리방침 링크 배선. installExitConfirm()
  //   과 같은 자리(SDK 부트스트랩 직후, 게임 스크립트 주입 «전») — #linkPrivacy 는
  //   index.html 정적 마크업이라 이 시점에 이미 DOM에 있다.
  installPrivacyLink();

  // 3. 네이티브 Storage 미러 훅 노출 + 프라이밍.
  //    게임 스크립트가 실행되기 전에 완료돼야 하므로 여기서 await 한다.
  //    primeGameStorage 는 내부적으로 safeBridge(3초 타임아웃)를 쓰므로
  //    네이티브가 응답을 안 줘도 무한 대기하지 않는다.
  window.__nativeStorageMirror = mirrorGameWrite;
  //    계측 훅도 game.js 주입 «전»에 연결한다 — track("app_open",...) 이 game.js
  //    부팅 시퀀스 맨 앞(loadSave/initLang 직후)에서 곧바로 불리기 때문이다.
  window.__gcTrack = trackEvent;
  //    ★뒤로가기 선점 훅도 game.js 주입 «전»에 연결한다. game.js 는 실행되자마자
  //      출석 오버레이용 핸들러를 등록해야 하고, 그 등록이 이 파일의 다른 두
  //      핸들러(종료확인·광고계수)보다 «뒤»여야 LIFO 상 «먼저» 실행된다.
  window.__gcPushBack = pushBackHandler;
  //    ★전면광고 카운터(v2)도 «같은 await» 안에서 네이티브에서 복원한다.
  //      ⛔GAME_STORAGE_KEYS 에 광고 키를 «넣지 않는다» — 거긴 게임 세이브 프라이밍 전용이라
  //        의미가 섞인다. 광고 카운터는 자기 전용 미러 키를 쓴다(interstitialAd.ts).
  //      hydrateAdCounter() 는 절대 throw 하지 않는다(내부 전량 try/catch + safeBridge).
  await Promise.all([primeGameStorage(GAME_STORAGE_KEYS), hydrateAdCounter()]);

  // 3-b. 전면광고 게이트 설치 — ★반드시 injectGameScript() «전»이어야 한다.
  //    결과 화면 버튼(rMap·rRetry·rNext)은 index.html 에 «정적»으로 있고 게임 스크립트는
  //    아래에서 «주입»된다. 여기서 capture 리스너를 먼저 달아야 게임 리스너보다 앞선다.
  //    ★ 원본 게임 파일은 «한 글자도» 고치지 않는다. 자세한 설계는 toss/interstitialAd.ts.
  //    ★v2 정정(2026-08-14): «부팅 isSupported 가드를 제거»했다(Partner 지시).
  //      광고 지원 여부와 무관하게 «판 계수»는 돌아야 한다 — v1 은 여기서 return 해버려
  //      미지원 환경에서 게이트가 통째로 죽었다. isSupported 는 이제 «로드/표시»에만 걸린다.
  try {
    installAdGateOnDocument();
  } catch (e) {
    // 광고 때문에 게임이 안 뜨면 안 된다. 삼키고 계속한다.
    console.error('[sdk-boot] installAdGate failed (게임은 계속 진행):', e);
  }

  // 3-c. 하드웨어 뒤로가기 = 「결과화면 없는 이탈」 경로. 계수 + (차례면) 노출.
  //    ★반드시 installExitConfirm() «뒤»에 등록한다 — handleBack 은 LIFO 로 돌아
  //      (navigationBar.ts:48) 나중에 등록된 이 핸들러가 «먼저» 실행된다.
  //    ⛔false 를 반환해 «소비하지 않는다». 소비하면 종료확인 모달이 안 뜬다.
  try {
    pushBackHandler(() => {
      onHardwareBack();
      return false;
    });
  } catch (e) {
    console.error('[sdk-boot] ad back-handler 등록 실패 (게임은 계속 진행):', e);
  }

  // 4. 원본 게임 스크립트 실행.
  injectGameScript();
}

void boot();
