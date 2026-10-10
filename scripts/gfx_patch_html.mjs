#!/usr/bin/env node
/**
 * 피고지고 그래픽 고도화(2026-08-30) — index.html «스타일·아이콘·카드 문서순서·스크립트 태그·출석표 CSS»만 패치.
 * 광고 지면(#ad-slots data-ad-start-top/bottom)·모든 id·module 스크립트 순서·결과 버튼 3종 id·문구는 무접촉(끝에서 검증한다).
 *   node scripts/gfx_patch_html.mjs
 * 입력: scripts/_pristine_index_20260823.html  출력: index.html
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SRC = resolve(ROOT, 'scripts/_pristine_index_20260823.html');
const OUT = resolve(ROOT, 'index.html');
let html = readFileSync(SRC, 'utf8');
const crlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');
const log = [];
function count(s, sub) { return s.split(sub).length - 1; }
function patch(name, oldS, newS, times = 1) {
  const n = count(html, oldS);
  if (n !== times) throw new Error(`«${name}» anchor found ${n} times (need ${times})`);
  html = html.split(oldS).join(newS);
  log.push(`${name} ×${n}`);
}
/* 보존 대상 스냅샷(패치 전) */
const adSlot = html.match(/<div id="ad-slots"[\s\S]*?>/)[0];
const ids = (html.match(/ id="[^"]+"/g) || []).sort();
const moduleScripts = html.match(/<script type="module"[^>]*><\/script>/g);
const resultBtns = html.match(/<button class="[^"]*" id="r(Map|Retry|Next)"><\/button>/g);

/* ── 1. 토큰 + 디스플레이 서체(self-host, OFL) ── */
patch('tokens',
`    --mint:#79f2bd;--mint2:#38cda2;--gold:#ffd166;--coral:#ff7a85;--violet:#c3a4ff;--sky:#8ae6ff;`,
`    --mint:#79f2bd;--mint2:#38cda2;--gold:#ffd166;--coral:#ff7a85;--violet:#c3a4ff;--sky:#8ae6ff;
    /* 그래픽 고도화(2026-08-30) DESIGN.md §6 — 디스플레이 서체(숫자·영문·버튼). 한글은 unicode-range 밖이라 시스템 고딕 폴백. */
    --display:"Fredoka",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif;
    --card:#0f2b22;`);
patch('font-face', `<style>\n  :root{`,
`<style>
  /* Fredoka (Google Fonts, SIL OFL 1.1) — 가변 서체 latin 서브셋만 self-host(29.7KB, 외부 요청 0). font-display:swap 이라
     서체 도착 전에도 시스템 서체로 «즉시» 그려진다(빈 글자 구간 없음). */
  @font-face{font-family:"Fredoka";font-style:normal;font-weight:600 700;font-display:swap;
    src:url(./fonts/fredoka-600-700-latin.woff2) format("woff2");
    unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
  :root{`);

/* ── 2. 버튼 — 중립 그림자(색 글로우 제거), 디스플레이 서체 ── */
patch('button hover shadow', `button:hover:not(:disabled){transform:translateY(-2px);border-color:var(--line2);box-shadow:0 10px 26px rgba(0,0,0,.32)}`,
  `button:hover:not(:disabled){transform:translateY(-2px);border-color:var(--line2);box-shadow:0 6px 14px rgba(0,0,0,.32)}`);
patch('primary', `  .primary{border:0;background:linear-gradient(135deg,#8dfbc8,#2fbf95);color:#04231c;
    box-shadow:0 14px 34px rgba(54,217,166,.28);font-size:clamp(15px,2.2vmin,20px);padding:1em 2em;font-weight:900;letter-spacing:-.01em}
  .primary:hover:not(:disabled){box-shadow:0 18px 42px rgba(54,217,166,.4)}`,
`  .primary{font-family:var(--display);border:0;background:linear-gradient(135deg,#8dfbc8,#2fbf95);color:#04231c;
    box-shadow:0 10px 24px rgba(2,14,12,.45),inset 0 1px 0 rgba(255,255,255,.35);font-size:clamp(15px,2.2vmin,20px);padding:1em 2em;font-weight:700;letter-spacing:0}
  .primary:hover:not(:disabled){box-shadow:0 14px 30px rgba(2,14,12,.55),inset 0 1px 0 rgba(255,255,255,.35)}`);
patch('gold btn', `  .gold{border:0;background:linear-gradient(135deg,#ffe08a,#f2a93b);color:#37220a;box-shadow:0 12px 30px rgba(255,190,80,.24)}`,
  `  .gold{border:0;background:linear-gradient(135deg,#ffe08a,#f2a93b);color:#37220a;box-shadow:0 10px 24px rgba(2,14,12,.45)}`);

/* ── 3. backdrop-filter 전량 제거(게임 루프와 GPU 공유) — 불투명도로 대비 확보 ── */
patch('langRow no blur', `    border-radius:14px;background:rgba(4,24,29,.66);backdrop-filter:blur(10px);max-width:100%;`,
  `    border-radius:14px;background:rgba(4,24,29,.86);max-width:100%;`);
patch('iconBtn font', `    background:rgba(4,24,29,.94);font-size:15px}`, `    background:rgba(4,24,29,.94)}`);
patch('lang-btn', `    border-radius:10px;padding:6px 4px;font-weight:900;font-size:11px;letter-spacing:.02em}`,
  `    border-radius:10px;padding:6px 4px;font-family:var(--display);font-weight:700;font-size:11.5px;letter-spacing:0}`);
patch('lang active', `  .lang-btn.active{color:#05251e;background:linear-gradient(135deg,var(--gold),var(--mint));box-shadow:0 4px 14px rgba(121,242,189,.28)}`,
  `  .lang-btn.active{color:#05251e;background:linear-gradient(135deg,var(--gold),var(--mint));box-shadow:0 3px 8px rgba(0,0,0,.35)}`);
patch('screen no blur', `    backdrop-filter:blur(1.5px) saturate(1.06);transition:opacity .3s var(--ease),transform .3s var(--ease);overflow:hidden}`,
  `    transition:opacity .3s var(--ease),transform .3s var(--ease);overflow:hidden}`);

/* ── 4. 카드 — 궤도 애니메이션(16s 무한 회전 = GPU 상시 가동) → 정적 하이라이트, 헤어라인+광폭 섀도 → 엘리베이션 ── */
patch('card', `  .card{position:relative;overflow:hidden;width:100%;max-width:560px;border:1px solid rgba(165,255,220,.22);border-radius:var(--r3);
    padding:clamp(20px,4.4vmin,40px);text-align:center;
    background:#0f2b22;
    box-shadow:0 28px 90px rgba(0,0,0,.55),inset 0 1px rgba(220,255,238,.22)}
  .card:before{content:"";position:absolute;inset:-55%;pointer-events:none;
    background:conic-gradient(from 90deg,transparent,rgba(121,242,189,.09),transparent,rgba(255,209,102,.08),transparent);
    animation:orbit 16s linear infinite}
  .card>*{position:relative}
  @keyframes orbit{to{transform:rotate(1turn)}}`,
`  .card{position:relative;overflow:hidden;width:100%;max-width:560px;border-radius:var(--r3);
    padding:clamp(20px,4.4vmin,40px);text-align:center;
    /* 정적 이슬 하이라이트(위·왼쪽)를 배경 층으로 — 라이브의 16초 무한 회전 conic(:before) 은 GPU 를 계속 깨웠다 */
    background:radial-gradient(70% 42% at 28% -6%,rgba(121,242,189,.13),transparent 70%),var(--card);
    box-shadow:0 22px 48px rgba(0,0,0,.5),inset 0 1px rgba(220,255,238,.24)}
  .card>*{position:relative}`);

/* ── 5. 타이포 위계 — 그라데이션/아이브로우/트래킹 대문자 없음, 디스플레이 서체 ── */
patch('h1', `  h1{margin:0;font-size:clamp(36px,7.4vmin,70px);line-height:.94;letter-spacing:-.055em;font-weight:900;color:var(--ink)}`,
  `  h1{font-family:var(--display);margin:0;font-size:clamp(36px,7.4vmin,70px);line-height:1;letter-spacing:-.03em;font-weight:700;color:var(--ink);text-wrap:balance}`);
patch('kicker', `  .kicker{color:var(--gold);font-weight:900;letter-spacing:.16em;font-size:clamp(10px,1.5vmin,12.5px);margin-bottom:12px;text-transform:uppercase}`,
  `  /* 제목 «아래» 한 줄 부제(아이브로우 아님: 대문자·자간 없음). 문서 순서도 제목 다음이다. */
  .kicker{color:var(--dim);font-weight:700;letter-spacing:0;font-size:clamp(12.5px,1.8vmin,14.5px);margin:6px 0 0;word-break:keep-all}
  .kicker:empty{display:none}`);
patch('secTitle', `  h2.secTitle{margin:0;font-size:clamp(20px,3.2vmin,30px);letter-spacing:-.03em;color:var(--ink);font-weight:900}`,
  `  h2.secTitle{font-family:var(--display);margin:0;font-size:clamp(20px,3.2vmin,30px);letter-spacing:-.02em;color:var(--ink);font-weight:700;text-wrap:balance}`);
patch('title kicker 1', `  #titleCard .kicker{font-size:clamp(9.5px,1.45vmin,12.5px);letter-spacing:.1em}\n`, ``);
patch('title kicker 2', `  #titleCard .kicker{margin-bottom:8px}\n`, ``);
patch('titleStats b', `  .titleStats b{color:var(--gold);font-size:1.12em;font-weight:900}`, `  .titleStats b{font-family:var(--display);color:var(--gold);font-size:1.12em;font-weight:700;font-variant-numeric:tabular-nums}`);
patch('pill bg', `  .pill{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.06);`,
  `  .pill{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:rgba(4,24,29,.88);`);
patch('pill b', `  .pill b{color:var(--gold);font-size:1.12em}`, `  .pill b{font-family:var(--display);color:var(--gold);font-size:1.12em;font-weight:700;font-variant-numeric:tabular-nums}`);
patch('privacy tracking', `    color:var(--faint);font-size:11px;font-weight:700;letter-spacing:.02em;`, `    color:var(--dim);font-size:11px;font-weight:700;letter-spacing:0;`);
patch('verTag', `  .verTag{margin:9px 0 8px;color:#9fc4b8;font-size:11px;font-weight:800;letter-spacing:.05em;`, `  .verTag{margin:9px 0 8px;color:#9fc4b8;font-size:11px;font-weight:700;letter-spacing:0;`);

/* ── 6. 정원 지도·연구소 — 대문자 라벨 제거, 색 글로우 → 중립, 디스플레이 숫자 ── */
patch('stage sn', `  .stageCard .sn{font-size:clamp(19px,2.8vmin,26px);font-weight:900;letter-spacing:-.04em;color:var(--ink);line-height:1}`,
  `  .stageCard .sn{font-family:var(--display);font-size:clamp(19px,2.8vmin,26px);font-weight:700;letter-spacing:-.02em;color:var(--ink);line-height:1}`);
patch('stage sg', `  .stageCard .sg{font-size:10px;font-weight:800;color:var(--faint);letter-spacing:.04em;`, `  .stageCard .sg{font-size:10.5px;font-weight:700;color:var(--dim);letter-spacing:0;`);
patch('stage next', `  .stageCard.next{border-color:var(--gold);box-shadow:0 0 0 2px rgba(255,209,102,.18),0 12px 28px rgba(0,0,0,.3)}`,
  `  .stageCard.next{border-color:var(--gold);box-shadow:0 0 0 2px rgba(255,209,102,.18),0 8px 14px rgba(0,0,0,.3)}`);
patch('newBadge', `    color:#3a2408;font-size:8.5px;font-weight:900;letter-spacing:.1em;padding:3px 6px;border-radius:6px}`,
  `    color:#3a2408;font-family:var(--display);font-size:9.5px;font-weight:700;letter-spacing:0;padding:3px 6px;border-radius:6px}`);
patch('cstar', `  .chapHead .cstar{color:var(--gold);font-weight:900;font-size:12.5px;white-space:nowrap}`,
  `  .chapHead .cstar{font-family:var(--display);color:var(--gold);font-weight:700;font-size:13px;white-space:nowrap;font-variant-numeric:tabular-nums}`);
patch('star on', `  .st.on{background:linear-gradient(160deg,#ffe89a,#f5a623);box-shadow:0 0 8px rgba(255,190,80,.5)}`,
  `  .st.on{background:linear-gradient(160deg,#ffe89a,#f5a623);box-shadow:0 1px 3px rgba(0,0,0,.45)}`);
patch('branch h4', `  .branch>h4{margin:0 0 10px;text-align:center;font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}`,
  `  .branch>h4{margin:0 0 10px;text-align:center;font-size:14px;font-weight:800;letter-spacing:0}`);
patch('branch line', `  .branch:before{content:"";position:absolute;z-index:0;left:26px;top:42px;bottom:18px;width:2px;
    background:repeating-linear-gradient(180deg,rgba(160,240,210,.22) 0 5px,transparent 5px 11px)}\n`, ``);
patch('node nc', `  .node .nc{font-size:11px;font-weight:900;color:var(--gold);white-space:nowrap}`,
  `  .node .nc{font-family:var(--display);font-size:11.5px;font-weight:700;color:var(--gold);white-space:nowrap;font-variant-numeric:tabular-nums}`);
patch('node ns', `  .node .ns{margin-top:6px;font-size:9.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}`,
  `  .node .ns{margin-top:6px;font-size:10.5px;font-weight:800;letter-spacing:0;color:var(--dim)}`);
patch('node dot glow', `  .node.owned .dot{background:var(--mint);box-shadow:0 0 10px var(--mint)}`, `  .node.owned .dot{background:var(--mint);box-shadow:0 1px 3px rgba(0,0,0,.5)}`);
/* 좁은 화면의 연구소 단축 버튼: 유니코드 글리프(◇) 대신 SVG 마스크 아이콘 */
patch('mapLab icon', `    #mapLab:after{content:"\\25C7";font-size:18px;font-weight:900;color:var(--violet)}`,
  `    #mapLab:after{content:"";width:18px;height:18px;background-color:var(--violet);
      -webkit-mask-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3l7 9-7 9-7-9z"/></svg>');
      mask-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3l7 9-7 9-7-9z"/></svg>');
      -webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}`);

/* ── 7. HUD — 라벨 대문자 제거, 코인 펀치, 연쇄 태그 펀치·중립 그림자, 디스플레이 숫자 ── */
patch('stat small', `  .stat small{font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap}`,
  `  .stat small{font-size:10px;font-weight:700;letter-spacing:0;color:var(--dim);white-space:nowrap}`);
patch('stat b', `  .stat b{font-size:clamp(15px,2.3vmin,21px);font-weight:900;letter-spacing:-.02em;color:var(--ink);white-space:nowrap}`,
  `  .stat b{font-family:var(--display);font-size:clamp(16px,2.3vmin,22px);font-weight:700;letter-spacing:-.01em;color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums}
  /* 코인 펀치 — 게임 js 가 코인 증가를 관찰해 punch/punch2 를 번갈아 붙인다(재트리거용 2개) */
  #vCoins{display:inline-block;transform-origin:left center}
  #vCoins.punch{animation:coinPunch .26s var(--ease)}
  #vCoins.punch2{animation:coinPunch2 .26s var(--ease)}
  @keyframes coinPunch{0%{transform:scale(1)}35%{transform:scale(1.22)}100%{transform:scale(1)}}
  @keyframes coinPunch2{0%{transform:scale(1)}35%{transform:scale(1.22)}100%{transform:scale(1)}}`);
patch('stat small 420', `    .stat small{font-size:8px}`, `    .stat small{font-size:10px}`);
patch('goal gn', `  .goal .gn{font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums;white-space:nowrap}`,
  `  .goal .gn{font-family:var(--display);font-weight:700;color:var(--gold);font-variant-numeric:tabular-nums;white-space:nowrap}`);
patch('chainTag', `    top:calc(100% + 7px);font-weight:900;font-size:clamp(13px,2.1vmin,18px);color:#3a2408;
    padding:6px 15px;border-radius:999px;letter-spacing:.02em;
    background:linear-gradient(135deg,#ffe08a,#f5a623);
    box-shadow:0 6px 22px rgba(255,170,50,.45),0 0 0 3px rgba(255,209,102,.16);
    white-space:nowrap;transition:.18s var(--ease)}
  #chainTag.on{opacity:1;transform:translateX(-50%) scale(1)}`,
`    top:calc(100% + 7px);font-family:var(--display);font-weight:700;font-size:clamp(13px,2.1vmin,18px);color:#3a2408;
    padding:6px 15px;border-radius:999px;letter-spacing:0;
    background:linear-gradient(135deg,#ffe08a,#f5a623);
    box-shadow:0 6px 14px rgba(0,0,0,.4);
    white-space:nowrap;transition:.18s var(--ease)}
  #chainTag.on{opacity:1;transform:translateX(-50%) scale(1)}
  #chainTag.on.punch{animation:chainPunch .3s var(--ease)}
  @keyframes chainPunch{0%{transform:translateX(-50%) scale(1)}40%{transform:translateX(-50%) scale(1.2)}100%{transform:translateX(-50%) scale(1)}}`);
patch('seed on', `    box-shadow:0 0 0 2px rgba(255,209,102,.16),0 10px 24px rgba(0,0,0,.34)}`, `    box-shadow:0 0 0 2px rgba(255,209,102,.16),0 6px 14px rgba(0,0,0,.34)}`);
patch('seed sc', `  .seed .sc{font-size:10.5px;font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums}`,
  `  .seed .sc{font-family:var(--display);font-size:11px;font-weight:700;color:var(--gold);font-variant-numeric:tabular-nums}`);
patch('seed sn2', `  .seed .sn2{font-size:9.5px;font-weight:800;`, `  .seed .sn2{font-size:10px;font-weight:700;`);
patch('toast shadow', `    text-align:center;max-width:min(84vw,460px);word-break:keep-all;box-shadow:0 12px 34px rgba(0,0,0,.45)}`,
  `    text-align:center;max-width:min(84vw,460px);word-break:keep-all;box-shadow:0 8px 14px rgba(0,0,0,.45)}`);

/* ── 8. 결과 — 통계 숫자 디스플레이체 + 카드 팝·행 스태거(변형만, 노출은 애니메이션에 «의존하지 않는다») ── */
patch('statRows b', `  .statRows b{color:var(--ink);font-weight:900;font-variant-numeric:tabular-nums}`,
  `  .statRows b{font-family:var(--display);color:var(--ink);font-weight:700;font-variant-numeric:tabular-nums}
  /* 결과 카드 연출 — opacity 는 건드리지 않는다(애니메이션이 안 돌아도 «이미 보이는» 상태). */
  #scResult:not(.hidden) .card{animation:cardPop .42s var(--ease)}
  #scResult:not(.hidden) .statRows div{animation:rowIn .38s var(--ease) backwards}
  #scResult:not(.hidden) .statRows div:nth-child(2){animation-delay:.05s}
  #scResult:not(.hidden) .statRows div:nth-child(3){animation-delay:.1s}
  #scResult:not(.hidden) .statRows div:nth-child(4){animation-delay:.15s}
  #scResult:not(.hidden) .statRows div:nth-child(5){animation-delay:.2s}
  #scResult:not(.hidden) .statRows div:nth-child(6){animation-delay:.25s}
  @keyframes cardPop{0%{transform:translateY(14px) scale(.96)}60%{transform:translateY(-2px) scale(1.01)}100%{transform:none}}
  @keyframes rowIn{from{transform:translateX(-10px)}to{transform:none}}`);

/* ── 9. 출석 — 오버레이 7칸 사이클 스트립(금액 표기) + 홈 카드 스트립 + 정원 지도 미니 칩 ── */
patch('attend css', `  .aBadges{display:flex;gap:6px;justify-content:center;margin:4px 0 10px;flex-wrap:wrap}
  .aBadge{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:900;color:var(--faint);background:rgba(255,255,255,.06);border:1px solid var(--line)}
  .aBadge.on{color:#05251e;background:linear-gradient(135deg,var(--gold),var(--mint));border-color:transparent}
  .aRewardRow{color:var(--gold);font-weight:900;font-size:clamp(15px,2.4vmin,20px);margin:2px 0 14px;text-align:center}`,
`  /* 출석 사이클 스트립(2026-08-30, DESIGN.md §8) — 7칸: 받은 날 민트 체크 · 오늘(받을 칸) 골드 강조 · 7일 칸 크게 · 칸마다 보상 정수.
     규칙·금액·지급은 game.js(무접촉) 것 — 여기는 표시만. 칸 터치 타깃 ≥ 44px. */
  .aBadges{display:grid;grid-template-columns:repeat(6,1fr) 1.3fr;gap:5px;margin:10px 0 12px;align-items:end}
  .aBadge{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:50px;padding:6px 2px;
    border-radius:12px;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--dim)}
  .aBadge i{display:block;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.09)}
  .aBadge em{font-style:normal;font-family:var(--display);font-size:11px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
  .aBadge b{font-family:var(--display);font-size:11px;font-weight:700;line-height:1;color:var(--gold);font-variant-numeric:tabular-nums}
  .aBadge.on{background:rgba(121,242,189,.12);border-color:rgba(121,242,189,.36);color:#dcffe9}
  .aBadge.on i{background-color:var(--mint);
    -webkit-mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6"/></svg>') center/70% no-repeat,linear-gradient(#000,#000);
    mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6"/></svg>') center/70% no-repeat,linear-gradient(#000,#000);
    -webkit-mask-composite:xor;mask-composite:exclude}
  .aBadge.today{background:rgba(255,209,102,.16);border-color:var(--gold);color:var(--ink);box-shadow:0 0 0 1px rgba(255,209,102,.35),0 4px 10px rgba(0,0,0,.35)}
  .aBadge.today i{background:var(--gold)}
  .aBadge.last{min-height:60px;border-radius:14px}
  .aBadge.last i{width:20px;height:20px}
  .aBadge.last b{font-size:13px}
  #aDay{font-family:var(--display);font-size:clamp(22px,4vmin,32px);margin-top:4px}
  .aRewardRow{font-family:var(--display);color:var(--gold);font-weight:700;font-size:clamp(17px,2.6vmin,22px);margin:2px 0 12px;text-align:center;font-variant-numeric:tabular-nums}
  /* 홈 카드 출석표(읽기 전용, public/game/attend-ui.js 가 그린다) */
  .attend{width:100%;margin:0 0 12px;padding:10px 10px 9px;border-radius:var(--r1);background:rgba(4,24,29,.55);border:1px solid var(--line);text-align:left}
  .attend-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px}
  .attend-head b{font-size:13px;font-weight:800;color:var(--ink);word-break:keep-all}
  .attend-head span{font-family:var(--display);font-size:12px;font-weight:700;color:var(--dim);font-variant-numeric:tabular-nums;white-space:nowrap}
  .attend-days{display:grid;grid-template-columns:repeat(6,1fr) 1.25fr;gap:4px;align-items:end}
  .ad{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:44px;padding:5px 1px;
    border-radius:10px;background:rgba(255,255,255,.05);border:1px solid var(--line);color:var(--dim)}
  .ad i{display:block;width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.09)}
  .ad em{font-style:normal;font-family:var(--display);font-size:10px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
  .ad b{font-family:var(--display);font-size:10px;font-weight:700;line-height:1;color:var(--gold);font-variant-numeric:tabular-nums}
  .ad.done{background:rgba(121,242,189,.11);border-color:rgba(121,242,189,.32);color:#dcffe9}
  .ad.done i{background-color:var(--mint);
    -webkit-mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6"/></svg>') center/70% no-repeat,linear-gradient(#000,#000);
    mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6"/></svg>') center/70% no-repeat,linear-gradient(#000,#000);
    -webkit-mask-composite:xor;mask-composite:exclude}
  .ad.today{background:rgba(255,209,102,.15);border-color:var(--gold);color:var(--ink)}
  .ad.today i{background:var(--gold)}
  .ad.last{min-height:52px;border-radius:12px}
  .ad.last b{font-size:11.5px}
  .attend-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0 0;font-size:11.5px;font-weight:600;color:var(--dim);line-height:1.45;word-break:keep-all}
  .attend-foot b{color:var(--ink);font-weight:800}
  .attend-foot button{min-height:32px;padding:.35em .9em;font-size:11.5px;flex:0 0 auto}
  /* 정원 지도 한 줄 미니 표시 */
  .attend-mini{display:inline-flex;align-items:center;gap:7px;margin:0 0 10px;padding:6px 12px;border-radius:999px;
    background:rgba(4,24,29,.8);border:1px solid var(--line);color:var(--dim);font-size:12px;font-weight:700;word-break:keep-all}
  .attend-mini i{display:block;width:12px;height:12px;border-radius:50%;background:var(--mint)}
  .attend-mini b{font-family:var(--display);font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
  .attend-mini:empty,.attend:empty{display:none}`);

/* ── 10. 아이콘 — 문자 글리프(II·←) 대신 SVG ── */
patch('pause icon', `<button id="pauseBtn" class="iconBtn" aria-label="Pause game">II</button>`,
  `<button id="pauseBtn" class="iconBtn" aria-label="Pause game"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5"></rect><rect x="14" y="4" width="5" height="16" rx="1.5"></rect></svg></button>`);
patch('back icon map', `<button class="iconBtn" id="mapBack" aria-label="Back">&#8592;</button>`,
  `<button class="iconBtn" id="mapBack" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>`);
patch('back icon lab', `<button class="iconBtn" id="labBack" aria-label="Back">&#8592;</button>`,
  `<button class="iconBtn" id="labBack" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>`);

/* ── 11. 카드 문서 순서 — 부제(kicker)는 제목 «다음» ── */
patch('result order', `      <div class="kicker" id="rKicker"></div>
      <h2 class="secTitle" id="rTitle" style="font-size:clamp(26px,5vmin,44px)"></h2>`,
`      <h2 class="secTitle" id="rTitle" style="font-size:clamp(26px,5vmin,44px)"></h2>
      <div class="kicker" id="rKicker"></div>`);
patch('pause order', `      <div class="kicker" id="pKicker"></div>
      <h2 class="secTitle" id="pTitle" style="font-size:clamp(26px,4.6vmin,40px)"></h2>`,
`      <h2 class="secTitle" id="pTitle" style="font-size:clamp(26px,4.6vmin,40px)"></h2>
      <div class="kicker" id="pKicker"></div>`);
patch('tut order', `      <div class="kicker" id="uKicker"></div>
      <h2 class="secTitle" id="uTitle" style="font-size:clamp(23px,4vmin,34px)"></h2>`,
`      <h2 class="secTitle" id="uTitle" style="font-size:clamp(23px,4vmin,34px)"></h2>
      <div class="kicker" id="uKicker"></div>`);
/* 출석 카드: 제목(aKicker = 다이얼로그 제목) → 일차 → 스트립 → 설명 → 보상·받기 */
patch('attend order', `      <div class="kicker" id="aKicker"></div>
      <div class="aBadges" id="aBadges" role="img"></div>
      <h2 class="secTitle" id="aDay" style="font-size:clamp(26px,4.6vmin,40px)"></h2>
      <p class="desc" id="aDesc"></p>`,
`      <h2 class="secTitle" id="aKicker"></h2>
      <div class="kicker" id="aDay"></div>
      <div class="aBadges" id="aBadges" role="img"></div>
      <p class="desc" id="aDesc" style="margin:6px auto 12px"></p>`);

/* ── 12. 스크립트 — 블룸 레이어(classic, 게임 동적 로드 «전») + 출석표·UI 연출(읽기 전용) ── */
patch('post script', `  <canvas id="game" aria-label="Bloom Circuit garden board"></canvas>`,
`  <canvas id="game" aria-label="Bloom Circuit garden board"></canvas>
  <!-- 그래픽 고도화(2026-08-30): 블룸 후처리 레이어(의존성 0). classic script — sdk-boot.ts(module, deferred)가 게임을
       동적 로드하기 «전»에 실행된다. WebGL 이 없으면 BloomPost.init 이 false 를 돌려주고 게임은 단일 캔버스 경로로 간다. -->
  <script src="./game/bloom-post.js"></script>`);
patch('ui scripts', `<script type="module" src="/src/sdk-boot.ts"></script>`,
`<!-- 출석표 UI + 결과 카드 카운트업(둘 다 읽기 전용, 게임 js 무접촉). -->
<script src="./game/attend-ui.js"></script>
<script src="./game/ui-fx.js"></script>
<script type="module" src="/src/sdk-boot.ts"></script>`);

/* ── 검증: 광고 지면·id 집합·module 스크립트·결과 버튼 무변경, backdrop-filter 0 ── */
const adSlot2 = html.match(/<div id="ad-slots"[\s\S]*?>/)[0];
if (adSlot2 !== adSlot) throw new Error('ad slot changed');
const ids2 = (html.match(/ id="[^"]+"/g) || []).sort();
if (ids2.join() !== ids.join()) throw new Error('id set changed');
const ms2 = html.match(/<script type="module"[^>]*><\/script>/g);
if (ms2.join() !== moduleScripts.join()) throw new Error('module scripts changed');
const rb2 = html.match(/<button class="[^"]*" id="r(Map|Retry|Next)"><\/button>/g);
if (rb2.join() !== resultBtns.join()) throw new Error('result buttons changed');
if (/backdrop-filter:/.test(html)) throw new Error('backdrop-filter still present');
if (/text-transform:uppercase/.test(html)) throw new Error('uppercase label still present');
writeFileSync(OUT, crlf ? html.replace(/\n/g, '\r\n') : html);
console.log(`patched ${log.length} → ${OUT}\n  ` + log.join('\n  '));
