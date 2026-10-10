#!/usr/bin/env node
/**
 * 게임 규칙(성장·수확 타이밍·배율·경제)·출석 판정/지급·저장·랭킹·리워드/계측 훅 «로직 함수·테이블»이 정본(2026-08-23 빌드)과
 * 바이트 단위로 같은지 증명한다.
 *   node scripts/check_logic_bytes.mjs [pristine.js] [patched.js]
 * 방식: 두 파일에서 같은 이름의 최상위 function / const / let 선언 본문을 잘라 비교.
 *       ALLOWED 에 «없는» 이름은 전부 보호 대상(반드시 동일). ALLOWED 는 렌더/사운드/UI 표시만.
 *       선언에 안 잡히는 최상위 구간(입력 리스너·버튼 배선·부팅 try 블록·루프 캐던스)은 VERBATIM 으로 통째 대조.
 *       양성대조: harvest() 에 공백 1개 · 버튼 배선 스왑 · ATN_CURVE 숫자 변조 → 전부 FAIL 이어야 한다.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const A = process.argv[2] || resolve(ROOT, 'scripts/_pristine_game_20260823.js');
const B = process.argv[3] || resolve(ROOT, 'public/game/bloom-circuit-game.js');

/* 달라져도 되는 이름(렌더·사운드·출석 «표시») — 이 밖의 모든 최상위 선언은 보호 대상 */
const ALLOWED = new Set([
  'canvas', 'POST', 'ctxMain', 'ctx', 'vs', 'vr', 'hexa', 'postOn', 'FONT',            // E1 컨텍스트 배선·시각 난수·헬퍼
  'ZZR', 'zzfxG', 'ZZ_MASTER', '_zzCache', 'ZZ', 'zz', 'SFX',                            // E2 효과음
  'SEASON_SKY',                                                                           // E3 계절 팔레트(값만)
  'DUSK_Q', 'skyCv', 'skyKey', 'skyCv2', 'skyKey2', 'skyLayer', 'cloudCache', 'cloudSprite', 'fgCache', 'fgFlowerSprite',
  'auroraCv', 'auroraKey', 'auroraSprite', 'drawSkyDecor', 'drawSkyGlow', 'drawSky',      // E4 하늘·배경
  'petalPath', 'centerPath', 'drawLeaves', 'headCache', 'headSprite', 'drawCropOn', 'drawCrop', 'haloCache', 'haloSprite', 'drawRipeGlow', 'iconCache', 'cropIcon', // E5 작물
  'resize',                                                                               // E6 dpr 상한(기하 무변경 — 아래 verbatim 으로 별도 증명)
  'bedCache', 'bedSprite', 'plateCv', 'plateKey', 'boardPlate', 'drawBoard',              // E7 보드
  'PTN', 'PT', 'ptN', 'SPN', 'SP', 'spN', 'CNN', 'CN', 'cnN', 'GRN', 'GR', 'grN', 'coinTarget', 'chainPunchT', 'coinPunchFlip', 'resultBurstT', 'resultSeen',
  'prevSeed', 'prevGrowth', 'prevCoins', 'prevChain', 'prevWithered', 'prevScreen', 'prevStageId',
  'spawnPetal', 'spawnSpark', 'spawnCoin', 'spawnGlowRing', 'coinTargetPos', 'bloomBurst', 'harvestBurst', 'witherFall',
  'observeEvents', 'stepVfx', 'drawVfxWorld', 'drawVfxGlow',                              // E8 이펙트 풀·관찰
  'draw',                                                                                 // E9
  'refreshAttend', 'attendView',                                                          // E10 출석 «표시»(판정·지급은 attendanceStatus/claimAttendance — 보호)
  'loop',                                                                                 // E13
  'syncDpr',                                                                              // E13 DPR 잠금 동기화(플레이 밖)
  'drawTutArt',                                                                           // E12 튜토리얼 아트(서체만) (업데이트 캐던스는 verbatim 으로 별도 증명)
]);
/* 선언 추출기가 못 보는 최상위 구간 — 정본 원문이 패치본에 «그대로» 있어야 한다 */
const VERBATIM_RANGES = [
  ['canvas.addEventListener("pointerdown",e=>{', 'function audioSuspend(){'],                       // 입력·키보드
  ['addEventListener("blur",()=>{audioSuspend();', '/* ------------------------------------------------------------ buttons -- */'],
  ['$("btnPlay").addEventListener("click",()=>{pendingStage=maxUnlocked();goPlay()});', '  if(got){'], // 버튼 배선(출석 클레임 직전까지)
  ['  closeAttend();\n  refreshTitle();', '/* ------------------------------------------------------------- i18n UI - */'],  // 출석 닫기·뒤로가기·나머지 버튼
  ['try{loadSave()}catch(e)', 'resize();'],                                                          // 부팅(출석 오버레이 조건 포함)
  ['const STEP=1/60;', '  if(layoutDirty){layoutDirty=false;resize()}'],                              // 루프 캐던스(update 6회 가드)
  ['addEventListener("resize",()=>{resize();layoutDirty=true;', '/* -------------------------------------------------------- effects fx --- */'],
  ['addEventListener("pointerdown",bgmKick,true);', '/* ------------------------------------------------------------ elements -- */'],
  /* resize 의 기하(뷰포트·보드 크기·셀·오프셋) — dpr 줄 «다음»부터 끝까지 동일 */
  ['  canvas.width=Math.round(view.w*view.dpr);', 'addEventListener("resize",'],
  /* drawBoard 안의 흔들림(rnd 소비) 줄 */
  ['  if(shake>0)ctx.translate((rnd()-.5)*shake,(rnd()-.5)*shake);', '\n'],
  /* draw 의 로직 파티클 렌더(rings/particles 그대로) */
  ['    for(const r of rings){const a=Math.max(0,r.life/r.max);', '    ctx.globalAlpha=1;ctx.textAlign="center"'],
];

function extract(src) {
  src = src.replace(/\r\n/g, '\n');
  const out = new Map();
  const re = /^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|const\s+([A-Za-z_$][\w$]*)\s*=|let\s+([A-Za-z_$][\w$]*)\s*=)/gm;
  let m; const starts = [];
  while ((m = re.exec(src))) starts.push({ name: m[1] || m[2] || m[3], idx: m.index, kind: m[1] ? 'fn' : 'decl' });
  for (let k = 0; k < starts.length; k++) {
    const s = starts[k]; let end;
    if (s.kind === 'fn') {
      let depth = 0, i = src.indexOf('{', s.idx), started = false;
      for (; i < src.length; i++) { const ch = src[i]; if (ch === '{') { depth++; started = true; } else if (ch === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } } }
      const next = starts[k + 1] ? starts[k + 1].idx : src.length;
      if (end === undefined || end > next) end = next;
    } else {
      end = starts[k + 1] ? starts[k + 1].idx : src.length;
      const seg = src.slice(s.idx, end); const last = seg.lastIndexOf(';');
      end = s.idx + (last >= 0 ? last + 1 : seg.length);
    }
    const text = src.slice(s.idx, end);
    out.set(s.name, out.has(s.name) ? out.get(s.name) + '\n/*dup*/\n' + text : text);
  }
  return out;
}
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
function run(aSrc, bSrc, quiet) {
  const a = extract(aSrc), b = extract(bSrc);
  let fail = 0; const same = [], changed = [], allowedChanged = [], newNames = [];
  for (const [name, text] of a) {
    if (ALLOWED.has(name)) { if (b.get(name) !== text) allowedChanged.push(name); continue; }
    if (!b.has(name)) { fail++; changed.push(`${name}: MISSING`); continue; }
    if (b.get(name) === text) same.push(name); else { fail++; changed.push(`${name}: ${sha(text)} → ${sha(b.get(name))}`); }
  }
  for (const name of b.keys()) if (!a.has(name)) { if (!ALLOWED.has(name)) { fail++; changed.push(`${name}: NEW but not allowed`); } else newNames.push(name); }
  const vb = bSrc.replace(/\r\n/g, '\n'), va = aSrc.replace(/\r\n/g, '\n');
  const verb = [];
  for (const [s, e] of VERBATIM_RANGES) {
    const i = va.indexOf(s); const j = va.indexOf(e, i + 1);
    if (i < 0 || j < 0) { fail++; verb.push(`range not found in pristine: ${s.slice(0, 30)}`); continue; }
    const seg = va.slice(i, j);
    if (!vb.includes(seg)) { fail++; verb.push(`VERBATIM BROKEN: ${s.slice(0, 40)}…`); } else verb.push(`ok ${seg.length}B ${s.slice(0, 30).replace(/\n/g, ' ')}…`);
  }
  /* 시드 난수: 새 코드가 rnd() 를 추가로 부르지 않는가 — 호출 횟수는 정본과 같아야 한다 */
  const cnt = (s) => (s.match(/\brnd\(\)/g) || []).length;
  if (cnt(va) !== cnt(vb)) { fail++; verb.push(`rnd() call count changed: ${cnt(va)} → ${cnt(vb)}`); } else verb.push(`ok rnd() calls ${cnt(va)} = ${cnt(vb)}`);
  if (!quiet) {
    console.log(`protected identical: ${same.length}/${same.length + changed.length}`);
    console.log(`allowed changed (${allowedChanged.length}): ${allowedChanged.join(', ')}`);
    console.log(`new (allowed): ${newNames.join(', ')}`);
    if (changed.length) console.log('PROTECTED CHANGED:\n  ' + changed.join('\n  '));
    console.log('verbatim ranges:\n  ' + verb.join('\n  '));
  }
  return fail;
}
const aSrc = readFileSync(A, 'utf8'), bSrc = readFileSync(B, 'utf8');
let fail = run(aSrc, bSrc, false);
/* 양성대조 1: 보호 함수(harvest)에 공백 1개 */
{
  const c = bSrc.replace('function harvest(i){\n  const p=plots[i],C=CROPS[p.seed];', 'function harvest(i){\n  const p =plots[i],C=CROPS[p.seed];');
  const det = c !== bSrc && run(aSrc, c, true) > 0;
  console.log('positive control 1 (harvest + 1 space):', det ? 'DETECTED' : 'NOT DETECTED'); if (!det) fail++;
}
/* 양성대조 2: 선언 밖 구간(버튼 배선) 변조 */
{
  const c = bSrc.replace('$("rRetry").addEventListener("click",()=>startStage(stage.id));', '$("rRetry").addEventListener("click",()=>startStage(stage.id+1));');
  const det = c !== bSrc && run(aSrc, c, true) > 0;
  console.log('positive control 2 (button wiring swap):', det ? 'DETECTED' : 'NOT DETECTED'); if (!det) fail++;
}
/* 양성대조 3: 출석 보상 곡선 숫자 변조 */
{
  const c = bSrc.replace('const ATN_CURVE=[5,6,8,10,12,14,20];', 'const ATN_CURVE=[5,6,8,10,12,14,25];');
  const det = c !== bSrc && run(aSrc, c, true) > 0;
  console.log('positive control 3 (ATN_CURVE tamper):', det ? 'DETECTED' : 'NOT DETECTED'); if (!det) fail++;
}
console.log(fail ? `RESULT: FAIL (${fail})` : 'RESULT: PASS');
process.exit(fail ? 1 : 0);
