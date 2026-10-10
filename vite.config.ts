import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fsSync from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { stripPublicGameJs, stripHtmlFileComments } from './scripts/stripBuildComments.mjs';

const TOSS_BARREL = '/src/toss/index.ts';
const TOSS_INTERSTITIAL = '/src/toss/interstitialAd.ts';
const TOSS_ANALYTICS = '/src/toss/analytics.ts';
const WEB_FRAMEWORK_PKG = '@apps-in-toss/web-framework';

const WEB_SHIM_INDEX = fileURLToPath(new URL('./src/toss-web/index.ts', import.meta.url));
const WEB_SHIM_INTERSTITIAL = fileURLToPath(new URL('./src/toss-web/interstitialAd.ts', import.meta.url));
const WEB_SHIM_ANALYTICS = fileURLToPath(new URL('./src/toss-web/analytics.ts', import.meta.url));
const WEB_SHIM_FRAMEWORK = fileURLToPath(new URL('./src/toss-web/web-framework.ts', import.meta.url));

/**
 * 웹 빌드에서 토스 SDK·광고·계측을 통째로 들어낸다. (땅따먹기 src/toss-web
 * 방식을 이식 — Chief 지시, 검증된 패턴 재사용. sumo-bounce 가 먼저 밟은
 * 함정 5개를 그대로 회피하며 이식함).
 *
 * ── 왜 필요한가 (실측 근거) ─────────────────────────────────────────────────
 * dist/web **하나**가 토스판(.ait)과 웹/MS Store 판 «양쪽»에 그대로 쓰인다.
 * 이 vite.config 가 생기기 전에는 mode 분기가 아예 없었다 — 즉 웹 산출물에도
 * 실운영 광고 ID 3종(interstitialAd.ts 리터럴 1 + index.html data-ad-* 2)과
 * eventLog 계측이 «리터럴로» 박혀 나갔다. GitHub Pages 에 지금 광고가 안
 * 보이는 건 8/11 이전 스냅샷이 재배포되지 않은 «우연»이었을 뿐 구조적
 * 안전장치가 아니었다. MS Store 에는 "no ads, no data collection" 으로
 * 신고했다 — 이 신고와 산출물이 항상 일치해야 한다.
 *
 * ── 피고지고는 «단일 배럴」이 아니다 (sumo-bounce 와 동일 계열 함정) ─────────
 * 이 게임은 SDK 진입점이 4곳이다. 배럴 하나만 갈아끼우면 안 된다:
 *   ① src/toss/index.ts          (배럴)               — exitConfirmUi.ts, sdk-boot.ts
 *   ② src/toss/interstitialAd.ts (배럴 밖 직접 import) — sdk-boot.ts
 *      ⚠️ 실운영 광고 ID 리터럴(`ait.v2.live.XXXXXXXXXXXXXXXX`)이 이 파일
 *      소스에 «직접» 박혀 있다.
 *   ③ src/toss/analytics.ts      (배럴 밖, 다중 importer) — sdk-boot.ts·
 *      (real) interstitialAd.ts 양쪽이 배럴을 거치지 않고 직접 import한다.
 *   ④ '@apps-in-toss/web-framework' 패키지 자체 (bare specifier) — TossAds 를
 *      startBanner.ts 가 배럴·analytics 어느 쪽도 거치지 않고 직접 import한다.
 * src/toss/navigationBar.ts·safeArea.ts·storage.ts·identity.ts·env.ts·bridge.ts
 * 는 ①(배럴)·②(interstitialAd 경유 storage.ts 직접 import) 말고 다른 진입점이
 * 없음을 확인했다(2026-08-22 전수 grep) — ①②를 막으면 서브트리 전체가
 * 그래프에서 빠진다.
 *
 * ── 미니앱은 절대 이 경로를 타지 않는다 ─────────────────────────────────────
 *   vite build              → shim 4종 전부 (웹 / 마이크로소프트 스토어)
 *   vite build --mode toss  → 원본 전부    (`ait build` 가 이 모드로 부른다)
 * granite.config.ts 의 web.commands 가 --mode toss 를 넘긴다. 그 플래그를
 * 지우면 미니앱에서 토스 SDK 4종이 통째로 사라져 심사 반려된다.
 *
 * ── ⚠️출하 규율 (스모 실측 — clean 충돌은 기각됐지만 다른 함정이 진짜다) ──────
 * emptyOutDir:true 라 web:build/build 어느 순서로 불러도 dist 가 매번
 * «통째로» 갈아끼워진다(잔여물 섞임은 구조적으로 불가능, 스모 왕복 실측).
 * ★진짜 위험은 따로 있다: **`.ait` 파일 자체는 마지막 `ait build`(=`npm run
 * build`) 시점에 고정된다.** 소스를 고친 뒤 `web:build`(vite build, GH
 * Pages/MS Store 용)만 돌리고 끝내면 dist 는 최신인데 `.ait` 는 예전 그대로
 * 라 낡은 것을 최신인 줄 알고 올리는 사고가 난다 — 폴더를 봐도, md5 일치
 * 검사를 해도 안 걸린다(양쪽 다 "같이" 낡으므로). ⇒ **출하 `.ait` 는 항상
 * 「마지막으로 실행한 명령」이 `npm run build` 여야 한다.** GH Pages/MS
 * Store 산출물은 `npm run web:build` 산출물만 올린다(dist/index.html 루트,
 * dist/web/ 아님) — `npm run build`(=ait build) 결과를 그쪽에 올리면 광고가
 * 실린다.
 */
function tossWebShim(): Plugin {
  return {
    name: 'bloom-toss-web-shim',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer) return null;
      const importerPath = importer.replace(/\\/g, '/');
      // shim 자신이 타입 재수출을 위해 real 파일을 참조한다 — 자기참조 방지.
      if (importerPath.includes('/src/toss-web/')) return null;

      // 패키지 bare specifier — 어느 importer 든(barrel 서브트리는 애초에 그래프에
      // 없으므로 startBanner.ts 만 실제로 이 경로를 탄다).
      if (source === WEB_FRAMEWORK_PKG) return WEB_SHIM_FRAMEWORK;

      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      const id = resolved.id.replace(/\\/g, '/');
      if (id.endsWith(TOSS_BARREL)) return WEB_SHIM_INDEX;
      if (id.endsWith(TOSS_INTERSTITIAL)) return WEB_SHIM_INTERSTITIAL;
      if (id.endsWith(TOSS_ANALYTICS)) return WEB_SHIM_ANALYTICS;
      return null;
    },

    /**
     * index.html 은 토스판/웹판 «공용 UI 셸」이다(양쪽이 같은 소스를 쓴다).
     * 그런데 시작화면 배너의 지면 ID 2종이 «상수 접기 함정 회피» 목적으로
     * JS 리터럴이 아니라 index.html 의 data 속성(data-ad-start-top/bottom)에
     * 실운영 값으로 박혀 있다(startBanner.ts 실측). JS 쪽 SDK 를 아무리
     * shim 해도 이 HTML 속성은 그대로 산출물에 남는다 — 그래서 빌드 산출
     * HTML 에서만 비운다(소스 index.html 자체는 건드리지 않는다 —
     * transformIndexHtml 은 «출력물»에만 적용된다).
     */
    transformIndexHtml(html) {
      return html
        .replace(/data-ad-start-top="[^"]*"/, 'data-ad-start-top=""')
        .replace(/data-ad-start-bottom="[^"]*"/, 'data-ad-start-bottom=""');
    },
  };
}

/**
 * ★2026-08-22 주석 제거 키트 이식(스모 바운스 원본, _COMMENT_STRIP_KIT.md
 * 그대로 복사 — 파일 수정 없이 vite.config.ts 배선 3줄만). public/game/
 * bloom-circuit-game.js 는 vite publicDir 경로라 esbuild 번들/minify 를
 * 안 타서 원본 그대로 dist 에 복사된다 — 조직 내부 주석(트랙·Partner·
 * President·Chief·무접촉 등)이 출하물에 그대로 노출됐다(preflight_ait.py
 * 실측: 188개 중 43개). index.html 도 <style> 인라인 CSS 블록 주석이
 * 별도 처리 없이는 안 잡힌다(스모가 먼저 밟은 함정 — HTML 주석 스트리퍼는
 * <style>/<script> 블록 «안»을 원칙적으로 안 건드린다).
 * ⛔정규식 통짜 제거 금지 — 이 키트는 JS는 terser(compress:false,
 * mangle:false, format:{comments:false}), CSS는 esbuild CSS 로더
 * (minifyWhitespace만), HTML은 script/style 블록 범위를 먼저 식별해 그
 * 밖의 <!-- --> 만 지운다. src/** 는 대상 아님(이미 esbuild 기본 minify로
 * 주석 0) — dist/** 산출물만 받는다, 소스는 절대 안 건드린다.
 * closeBundle 훅: vite 가 dist/**(에셋+publicDir 복사본)를 전부 디스크에
 * 쓴 «뒤» 실행되는 마지막 훅 — game/*.js 가 이미 dist 에 복사된 시점에
 * 정확히 걸린다. ait build 가 dist/* 를 dist/web/* 로 «이동»시키므로 경로는
 * 항상 vite 의 outDir('dist') 기준(web/ 붙은 최종경로 아님).
 */
function stripBuildCommentsPlugin(): Plugin {
  return {
    name: 'strip-build-comments',
    apply: 'build',
    async closeBundle() {
      const outDir = 'dist'; // vite.config.ts build.outDir 와 일치
      const jsResults = await stripPublicGameJs(outDir, 'game');
      for (const r of jsResults) {
        if (!r.ok) this.error(`[strip-comments] ${r.file} 실패: ${String(r.error)}`);
      }
      const htmlResult = await stripHtmlFileComments(path.join(outDir, 'index.html'));
      if (!htmlResult.ok) this.warn(`[strip-comments] index.html 스킵: ${String(htmlResult.error)}`);

      // ★2026-08-23 privacy.html도 같은 처리 대상에 추가(번들 동봉 전환 직후
      // 발견 — preflight_ait.py FAIL 실측). public/privacy.html은 vite
      // publicDir 복사로 dist/privacy.html에 그대로 실리는데, 원본 초안에
      // 조직 내부 편집 주석(<!-- ... Chief 경유 승인 대기 ... -->)이 있어
      // 다른 게임 4종과 달리 이 파일은 이제 «번들 안»에 실리므로 같은 함정을
      // 그대로 밟는다. 법적 본문(1~11항)은 HTML 주석이 아니라 <p>/<table>
      // 텍스트라 이 처리로 전혀 안 건드린다 — 조직 내부 편집 메모만 빠진다.
      const privacyPath = path.join(outDir, 'privacy.html');
      if (fsSync.existsSync(privacyPath)) {
        const privacyResult = await stripHtmlFileComments(privacyPath);
        if (!privacyResult.ok) this.error(`[strip-comments] privacy.html 실패: ${String(privacyResult.error)}`);
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  // 토스판/웹판 둘 다 주석 제거 적용(public/ 복사는 mode와 무관하게 항상 일어났다).
  plugins: mode === 'toss' ? [stripBuildCommentsPlugin()] : [tossWebShim(), stripBuildCommentsPlugin()],

  /**
   * base: './'  ← 반드시 상대경로.
   *   .ait 안의 웹 산출물은 `web/` 하위에 통째로 zip 되고, 토스 앱이
   *   file:// 또는 임의 origin 아래에서 index.html 을 연다. 절대경로('/')로
   *   두면 자산 404 가 나면서 흰 화면만 뜬다. MS Store(Capacitor) 경로도
   *   동일하게 상대경로를 요구한다.
   */
  base: './',

  build: {
    // granite.config.ts 의 outdir 과 반드시 동일해야 한다.
    outDir: 'dist',
    emptyOutDir: true,
    // .ait 는 RN 0.72.6 런타임(구형 WebView)에서도 떠야 한다.
    target: 'es2019',
    // ★2026-08-22 sourcemap:false(Chief/Partner 지시, 실측). vite 소스맵의
    // sourcesContent 가 shim 파일 «주석»까지 그대로 산출물에 실어 진짜 광고ID·
    // eventLog 문자열을 새게 한 사고를 자체 발견했는데(위쪽 shim 3파일 이력
    // 참고), 근본 대책은 주석만 고치는 게 아니라 소스맵 자체를 끄는 것이다.
    // 게다가 web/assets/index-*.js.map 하나가 원본 224KB(피고지고 실측)로
    // 웹/토스 양쪽 산출물 용량의 상당 부분을 차지한다 — 유저가 그 바이트를
    // 그대로 내려받는다. 프로덕션 에러스택 복원용 소스맵은 '_verify_260822/
    // tooling/strip_ait_sourcemaps.cjs' 실행 «전» 백업 폴더에 남긴다(출하물
    // 에서만 뺀다 — 우리 보관본에서는 안 지운다).
    sourcemap: false,
    // 청크가 하나(cssCodeSplit:false, manualChunks:undefined)라 modulepreload
    // 폴리필이 할 일이 없다 — 남겨두면 "네트워크 전송 코드"로 오해받는다.
    modulePreload: { polyfill: false },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  server: {
    // granite.config.ts 의 web.port 와 반드시 같아야 한다.
    port: 5175,
    host: 'localhost',
  },
}));
