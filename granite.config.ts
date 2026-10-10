import { defineConfig } from '@apps-in-toss/web-framework/config';

/**
 * 트랙 K (기존 게임 4종 래핑) — 피고지고 / Bloom Circuit
 * 앱인토스 웹 프레임워크 설정 (RN/Granite 경로 아님)
 *
 * 이 파일은 스모 바운스(sumo-bounce) 레시피를 그대로 적용한 것이다(§11 재사용
 * 절차). 구조·경로 선택 근거는 sumo-bounce/README.md "설계 결정 1"을 그대로
 * 따른다 — 값만 이 게임에 맞게 재계산했다.
 *
 * ★ 경로 선택: 웹(web-framework) 경로다. RN(@apps-in-toss/framework) 경로가 아니다.
 *   `ait build` 는 이 파일의 소스 문자열에 '@apps-in-toss/web-framework' 가
 *   들어있는지로 빌드 전략을 고른다(@apps-in-toss/cli/dist/index.js:1216-1218).
 *   위 import 문을 지우거나 경로를 바꾸면 RN 전략으로 떨어져 빌드가 깨진다.
 *
 * ★ 파일 이름이 granite.config.ts 인 것은 오타가 아니다. 웹 경로도 이 이름을 쓴다
 *   (@apps-in-toss/cli/dist/index.js:2100).
 */
export default defineConfig({
  /**
   * appName: 콘솔에 등록한 appName 과 글자 그대로 일치해야 한다(불일치 시
   * 서버 컴파일 단계에서 BUILD_FAILED — miri 실측 이력).
   *
   * ★ 2026-08-02 Chief 실사고 정정: "appName 은 kebab-case 강제"라는 이전
   *   주석은 틀렸다. 강제 규칙이 아니라 콘솔 등록값을 그대로 쓰는 것뿐이다.
   *   이전 세션은 콘솔값을 확인할 수 없어 'bloom-circuit'(하이픈 포함)으로
   *   추정 진행했으나, Partner 콘솔 실조회 정본은 **하이픈 없는
   *   'bloomcircuit'** 였다.
   */
  appName: 'bloomcircuit',

  brand: {
    /**
     * ★ 국문명 확정 (2026-08-02 Chief → Partner 콘솔 실조회, 재질의 금지):
     *   miniAppId 58896 = appName 'bloomcircuit' = title "피고지고".
     *   "블룸 서킷"은 쓰지 않는다. 원본 index.html 의 i18n 데이터
     *   (I18N.ko.title)에는 "블룸 서킷"이 그대로 남아있을 수 있으나 — 게임
     *   콘텐츠는 1바이트도 재작성하지 않는다는 지시라 그대로 둔다. 래퍼
     *   브랜드명(이 필드)과 게임 내부 표기가 다를 수 있다는 뜻이다.
     */
    displayName: '피고지고',
    /**
     * 게임 UI 배경(--bg:#04161c, 짙은 청록 정원 톤)과 어울리는 임시 브랜드
     * 컬러. 원본 index.html :root 팔레트에서 주 액션 버튼(.primary)의
     * 그라디언트 끝 색상 #2fbf95(민트그린, 성장/새싹 테마와 직결)를 채택 —
     * sumo-bounce 가 게임 배경톤에 맞춰 주황을 고른 것과 같은 방법론
     * (버튼/강조색 중 대표성 있는 값을 실측해서 채택).
     * TODO(콘솔등록): 콘솔 브랜드 컬러 확정 시 교체.
     */
    primaryColor: '#2fbf95',
    /**
     * ★ 2026-08-02 Chief → Partner 콘솔 실조회로 확보(재질의 금지). miniAppId
     *   58896 등록 아이콘의 실제 publicUrl. 빌드타임 인라인이라 이 값을 넣고
     *   반드시 재빌드해야 반영된다.
     */
    icon: 'https://static.toss.im/appsintoss/63105/5dd8a04d-31bf-4769-b106-4dbe9cdf859e.png',
  },

  web: {
    host: 'localhost',
    port: 5175,
    /**
     * ★ 이 명령들은 npm run 이 아니라 npx 로 실행된다
     *   (@apps-in-toss/cli/dist/index.js:1274-1278 -> web-config/dist/index.js:78).
     *   'run web:build' 처럼 쓰면 `npx run web:build` 가 되어 실패한다.
     */
    commands: {
      // ★2026-08-22 필수 추가(shim 이식, Chief 지시) — 이 플래그가 빠지면
      // ait build(미니앱 빌드)가 vite.config.ts 의 웹 shim 경로를 타 광고·
      // 계측이 «없는» 토스 앱이 되어 심사 반려된다. mode==='toss' 일 때만
      // vite.config.ts 의 tossWebShim 플러그인이 꺼지고 원본 SDK 전부가 산다.
      dev: 'vite --mode toss',
      build: 'vite build --mode toss',
    },
  },

  /**
   * permissions: 빈 배열. 피고지고는 정원 경영(파밍) 게임이라 위치·카메라·
   * 마이크·연락처·사진 어느 것도 쓰지 않는다(원본 HTML 에 네트워크/fetch/
   * getUserMedia 등 권한성 API 호출 0건, 완전 오프라인 단일 파일 게임).
   */
  permissions: [],

  /**
   * webViewProps — 게임 판정의 전부다. sumo-bounce 와 동일 근거로 동일 값.
   *   type: 'game' 이 없으면 기본값 'partner' 로 떨어져 게임으로 인식되지
   *   않는다(@apps-in-toss/cli/dist/index.js:1246, isGame 계산 로직).
   *
   * 나머지 옵션은 "기본값이 게임에 해로운" 것들이라 명시적으로 끈다:
   *   bounces/pullToRefreshEnabled/overScrollMode/
   *   allowsBackForwardNavigationGestures — 이 게임도 밭을 탭/드래그로
   *   조작하므로 가로 스와이프 화면 이탈·당겨서 새로고침 오작동 방지가
   *   동일하게 중요하다.
   *   mediaPlaybackRequiresUserAction: false — WebAudio 신스 BGM/효과음
   *   자동재생 차단 방지(원본 주석 "all audio is WebAudio synth").
   */
  webViewProps: {
    type: 'game',
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
    allowsBackForwardNavigationGestures: false,
  },

  /**
   * navigationBar — 빌드타임 고정값. 런타임/화면별 동적 전환 API가 없다.
   *
   * theme: 'dark' — 뒤로가기 아이콘 색만 결정한다.
   *   light = #191F28(어두운 아이콘), dark = #FFFFFF(흰 아이콘).
   *   게임 배경 --bg:#04161c (원본 index.html <style> 블록, :root 변수) 기준
   *   WCAG 대비비 실측(python colorimetry, 이 세션에서 직접 계산 —
   *   sumo-bounce 의 #0b0e14 와 배경색이 달라 재계산 필수했음):
   *     #FFFFFF(흰 아이콘) on #04161c   ->  18.47 : 1   PASS (기준 4.5:1)
   *     #191F28(검정 아이콘) on #04161c ->   1.12 : 1   FAIL
   *   흰 아이콘 쪽이 압도적으로 우세해 dark 로 확정(sumo-bounce와 결론은
   *   같지만 수치는 재계산된 값).
   *
   * withBackButton: true  — 미니앱은 자체 나가기 수단이 필요하다.
   * withTitle: false      — 게임 자체 타이틀 화면(#sc-title)이 있어 중복 방지.
   * transparentBackground: false — 배경이 단색에 가까운 어두운 톤이라 네비바와
   *   끊겨 보일 위험이 낮다고 판단. 실기기에서 끊김이 확인되면 재판단.
   */
  navigationBar: {
    withBackButton: true,
    withTitle: false,
    transparentBackground: false,
    theme: 'dark',
  },

  /**
   * outdir: 웹 빌드 산출물 디렉터리. vite 기본 출력(dist)과 일치해야 한다.
   *
   * ★ 함정: ait build 는 outdir 안의 내용을 outdir/web/ 으로 옮긴 뒤
   *   outdir/web/index.html 존재를 요구한다. 그런데 이미 dist/web/index.html 이
   *   있으면 웹 빌드를 통째로 건너뛴다(early return) — 재빌드 전 반드시
   *   `npm run clean && npm run build`.
   */
  outdir: 'dist',
});
