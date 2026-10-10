#!/usr/bin/env node
/**
 * 피고지고 그래픽 고도화(2026-08-30) — 게임 본체 «렌더링·사운드·출석 표시»만 바꾸는 패치를 정본 사본에 재현 가능하게 적용한다.
 *   node scripts/gfx_patch_game.mjs
 * 입력: scripts/_pristine_game_20260823.js (정본 build/bloom-circuit/public/game/bloom-circuit-game.js 그대로, md5 80f230bf…)
 * 출력: public/game/bloom-circuit-game.js
 * 규율: 앵커는 «정확히 1회» 존재해야 한다(아니면 throw). 성장·수확 타이밍·배율·경제·출석 판정/지급·저장·리워드/계측 훅은
 *       한 글자도 건드리지 않는다 — 증명은 scripts/check_logic_bytes.mjs 가 한다.
 *       시드 난수(rnd) 소비 패턴도 그대로다: burst/floater/ring/shake 는 verbatim, 새 이펙트는 시각 난수 vr() 만 쓴다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SRC = resolve(ROOT, 'scripts/_pristine_game_20260823.js');
const OUT = resolve(ROOT, 'public/game/bloom-circuit-game.js');
let js = readFileSync(SRC, 'utf8');
const crlf = js.includes('\r\n');
js = js.replace(/\r\n/g, '\n');
const log = [];
function count(s, sub) { return s.split(sub).length - 1; }
function patch(name, oldS, newS) {
  const n = count(js, oldS);
  if (n !== 1) throw new Error(`patch «${name}» anchor found ${n} times (need 1)`);
  js = js.replace(oldS, () => newS);
  log.push(name);
}
function replaceBlock(name, startAnchor, endAnchor, newText) {
  const i = js.indexOf(startAnchor);
  if (i < 0 || js.indexOf(startAnchor, i + 1) >= 0) throw new Error(`block «${name}» start anchor not unique`);
  const j = js.indexOf(endAnchor, i + startAnchor.length);
  if (j < 0) throw new Error(`block «${name}» end anchor missing`);
  js = js.slice(0, i) + newText + js.slice(j);
  log.push(name);
}

/* ───────────────────────── E1. 캔버스/컨텍스트 — 블룸 레이어 배선 + 시각 난수 + 색 헬퍼 ───────────────────────── */
patch('E1 ctx',
`const canvas=$("game"),ctx=canvas.getContext("2d",{alpha:false});`,
`const canvas=$("game");
/* 그래픽 고도화(2026-08-30): 블룸 후처리 레이어(public/game/bloom-post.js, 네온 파일럿·프리즘 기법 재사용).
   있으면 세계(하늘·밭·작물·파티클)는 POST 의 오프스크린 scene 캔버스에, «빛나는 것»(익은 후광·개화 꽃잎·수확 불꽃·노을 해)은
   반해상도 glow 캔버스에 그리고 #game 은 글자 전용 «투명» 캔버스가 된다(점수 팝은 안 번진다).
   없으면(WebGL 불가·?bloom=off) 예전처럼 #game 하나에 그린다. ctx 는 draw() 가 프레임마다 두 컨텍스트 사이를 오가므로 let 이다. */
const POST=(typeof window!=="undefined"&&window.BloomPost&&window.BloomPost.init(canvas))?window.BloomPost:null;
const ctxMain=canvas.getContext("2d",{alpha:!!POST});
let ctx=ctxMain;
/* 시각 전용 난수 — 게임이 쓰는 시드 난수(rnd) 와 «분리». 새 이펙트는 시드 스트림을 먹지 않는다. */
let vs=0x9e3779b9;function vr(){vs^=vs<<13;vs>>>=0;vs^=vs>>>17;vs^=vs<<5;vs>>>=0;return vs/4294967296}
function hexa(hex,a){const v=parseInt(hex.slice(1),16);return "rgba("+(v>>16)+","+(v>>8&255)+","+(v&255)+","+a+")"}
const postOn=()=>!!(POST&&POST.on);
const FONT='"Fredoka",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';`);

/* ───────────────────────── E2. SFX — ZzFX(MIT) 보강: 수확(코인)·개화·연쇄·클리어·실패·출석 ───────────────────────── */
replaceBlock('E2 SFX', 'const SFX={', '/* ----------------------------------------------------------- music (BGM) --',
`/* ZzFX — Zuper Zmall Zound Zynth (Micro Edition). MIT License, Copyright 2019 Frank Force
   https://github.com/KilledByAPixel/ZzFX — 파라미터 배열 하나로 효과음을 «생성»한다(음원 파일 0).
   원본 zzfx() 는 자체 AudioContext 를 만들지만 여기서는 게임의 ac()(sound 플래그·suspend 연동)로 재생하고,
   생성 샘플은 키별로 캐시해 재생 시 할당 0. 기존 tone() 기반 효과음은 유지, 6종(harvest/ripe/goal/win/lose/star)만 교체·보강. */
const ZZR=44100;
function zzfxG(volume,randomness,frequency,attack,sustain,release,shape,shapeCurve,slide,deltaSlide,pitchJump,pitchJumpTime,repeatTime,noise,modulation,bitCrush,delay,sustainVolume,decay,tremolo){
  volume=volume===undefined?1:volume;randomness=randomness||0;frequency=frequency===undefined?220:frequency;attack=attack||0;sustain=sustain||0;release=release===undefined?.1:release;
  shape=shape||0;shapeCurve=shapeCurve===undefined?1:shapeCurve;slide=slide||0;deltaSlide=deltaSlide||0;pitchJump=pitchJump||0;pitchJumpTime=pitchJumpTime||0;repeatTime=repeatTime||0;
  noise=noise||0;modulation=modulation||0;bitCrush=bitCrush||0;delay=delay||0;sustainVolume=sustainVolume===undefined?1:sustainVolume;decay=decay||0;tremolo=tremolo||0;
  const PI2=Math.PI*2,sign=v=>v>0?1:-1;
  let startSlide=slide*=500*PI2/ZZR/ZZR,startFrequency=frequency*=(1+randomness*2*Math.random()-randomness)*PI2/ZZR;
  let t=0,tm=0,i=0,j=1,r=0,c=0,s=0,f,length;
  attack=attack*ZZR+9;decay*=ZZR;sustain*=ZZR;release*=ZZR;delay*=ZZR;
  deltaSlide*=500*PI2/(ZZR*ZZR*ZZR);modulation*=PI2/ZZR;pitchJump*=PI2/ZZR;pitchJumpTime*=ZZR;repeatTime=repeatTime*ZZR|0;
  length=attack+decay+sustain+release+delay|0;
  const b=new Float32Array(length);
  for(;i<length;b[i++]=s){
    if(!(++c%(bitCrush*100|0))){
      s=shape?shape>1?shape>2?shape>3?Math.sin((t%PI2)*(t%PI2)*(t%PI2)):Math.max(Math.min(Math.tan(t),1),-1):1-(2*t/PI2%2+2)%2:1-4*Math.abs(Math.round(t/PI2)-t/PI2):Math.sin(t);
      s=(repeatTime?1-tremolo+tremolo*Math.sin(PI2*i/repeatTime):1)*sign(s)*Math.pow(Math.abs(s),shapeCurve)*volume*(
        i<attack?i/attack:i<attack+decay?1-((i-attack)/decay)*(1-sustainVolume):i<attack+decay+sustain?sustainVolume:i<length-delay?(length-i-delay)/release*sustainVolume:0);
      s=delay?s/2+(delay>i?0:(i<length-delay?1:(length-i)/delay)*b[i-delay|0]/2):s;
    }
    f=(frequency+=slide+=deltaSlide)*Math.cos(modulation*tm++);
    t+=f-f*noise*(1-(Math.sin(i)+1)*1e9%2);
    if(j&&++j>pitchJumpTime){frequency+=pitchJump;startFrequency+=pitchJump;j=0}
    if(repeatTime&&!(++r%repeatTime)){frequency=startFrequency;slide=startSlide;j=j||1}
  }
  return b;
}
const ZZ_MASTER=.16,_zzCache={};
/* [volume,randomness,freq,attack,sustain,release,shape,curve,slide,dSlide,pJump,pJumpT,repeat,noise,mod,crush,delay,susVol,decay,tremolo] */
const ZZ={
  coin:(c)=>[.6,0,880*Math.pow(1.06,Math.min(c,10)),.002,.05,.14,0,1.5,0,0,440,.04,0,0,0,0,.02,1,0,0],
  ripe:(i)=>[.45,0,1180+(i%6)*60,.004,.06,.22,0,1.4,20,0,0,0,0,0,8,0,.03,1,0,0],
  goal:()=>[.5,0,523,.005,.08,.2,0,1.3,0,0,262,.08,0,0,0,0,.03,1,0,0],
  win1:()=>[.5,0,523,.005,.09,.18,0,1.3,0,0,0,0,0,0,0,0,0,1,0,0],
  win2:()=>[.5,0,659,.005,.09,.18,0,1.3,0,0,0,0,0,0,0,0,0,1,0,0],
  win3:()=>[.5,0,784,.005,.09,.18,0,1.3,0,0,0,0,0,0,0,0,0,1,0,0],
  win4:()=>[.6,0,1047,.005,.2,.4,0,1.3,0,0,0,0,0,0,0,0,.04,1,0,0],
  lose:()=>[.7,0,260,.01,.16,.5,1,1.5,-28,-.1,0,0,0,.04,0,0,.03,1,.05,0],
  star:(i)=>[.5,0,780+i*200,0,.06,.24,0,1.4,60,0,0,0,0,0,0,0,.02,1,0,0],
  claim:()=>[.55,0,660,.004,.08,.26,0,1.3,0,0,330,.06,0,0,0,0,.04,1,0,0]
};
function zz(key,arg,when){
  const a=ac();if(!a)return;
  try{
    const ck=key+(arg===undefined?"":"|"+arg);
    let buf=_zzCache[ck];
    if(!buf){const d=zzfxG.apply(null,ZZ[key](arg));buf=a.createBuffer(1,d.length,ZZR);buf.getChannelData(0).set(d);_zzCache[ck]=buf}
    const s=a.createBufferSource(),g=a.createGain();s.buffer=buf;g.gain.value=ZZ_MASTER;
    s.connect(g);g.connect(a.destination);s.start(a.currentTime+(when||0));
  }catch(_){}
}
const SFX={
  click:()=>tone(520,.05,"triangle",.028),
  plant:()=>{tone(240,.09,"triangle",.035,60);noise(.1,.016,1400)},
  tend:()=>tone(430,.06,"sine",.026,110),
  ripe:i=>zz("ripe",i%6),
  harvest:c=>{zz("coin",Math.min(c,10));if(c>=3)zz("coin",Math.min(c+2,10),.06)},
  bad:()=>tone(150,.11,"square",.026,-40),
  wither:()=>{tone(190,.2,"sawtooth",.02,-70);noise(.2,.012,500)},
  goal:()=>{zz("goal")},
  win:()=>{zz("win1",undefined,0);zz("win2",undefined,.11);zz("win3",undefined,.22);zz("win4",undefined,.33)},
  lose:()=>zz("lose"),
  star:i=>zz("star",i),
  buy:()=>{tone(560,.09,"triangle",.038);setTimeout(()=>tone(840,.14,"sine",.032),70)},
  stone:()=>{noise(.22,.03,320);tone(120,.16,"square",.022,-40)},
  claim:()=>zz("claim")
};

`);

/* ───────────────────────── E3. 계절 팔레트 — 원경/잔디/지평 안개 키 추가(envPalette 가 자동 블렌드) ───────────────────────── */
replaceBlock('E3 SEASON_SKY', 'const SEASON_SKY=[', 'let ambientSeason=0;',
`/* season palettes: [midday, dusk] — index matches SEA / t("sea"). DESIGN.md §2.
   far = 원경 언덕(대기 원근: 하늘색으로 밀린다), grass = 전경 잔디, haze = 지평선 안개 띠. */
const SEASON_SKY=[
 [{top:"#7cc6e6",mid:"#dbeec4",low:"#3f8a6c",hill:"#3f8f66",far:"#8fbfb0",grass:"#5fb56f",haze:"#f4f7d6",glow:"#fff3bd",fol:"#5fbf74",blo:"#ffc0d8"},
  {top:"#4d4f93",mid:"#e8987f",low:"#2b5a52",hill:"#2c604b",far:"#7a6a8f",grass:"#3b7f5a",haze:"#ffb98f",glow:"#ffb774",fol:"#3f8f63",blo:"#ff9fc4"}],
 [{top:"#3aa3dc",mid:"#ffe7a3",low:"#2f7a58",hill:"#2f8256",far:"#7fb5c0",grass:"#4fb066",haze:"#fff2c4",glow:"#fff4a0",fol:"#4fbc6a",blo:"#ffd36a"},
  {top:"#33427f",mid:"#ff9b6a",low:"#21514a",hill:"#245a43",far:"#6d5a80",grass:"#2f7752",haze:"#ffa878",glow:"#ffa25c",fol:"#2f8055",blo:"#ff9a6a"}],
 [{top:"#78adc4",mid:"#f6c98a",low:"#6a5230",hill:"#7a5a33",far:"#a89a8c",grass:"#b48a48",haze:"#f8dcb0",glow:"#ffd79a",fol:"#c98b3f",blo:"#ff9a5c"},
  {top:"#42355c",mid:"#d8794f",low:"#3c2f22",hill:"#472f22",far:"#6b4f52",grass:"#8a5f30",haze:"#e88a5a",glow:"#ff9a55",fol:"#a86a30",blo:"#ff7a4c"}],
 [{top:"#98c0dc",mid:"#e6f1f8",low:"#5d7a86",hill:"#65818c",far:"#a9c2d2",grass:"#7ea5a2",haze:"#f6fbff",glow:"#f4fbff",fol:"#7fa5a0",blo:"#cfe6ff"},
  {top:"#2c3a68",mid:"#7d8fc4",low:"#2b3a45",hill:"#33454f",far:"#5a6a8c",grass:"#4f7378",haze:"#a9b8dc",glow:"#cfe0ff",fol:"#5b7d80",blo:"#a8c8ff"}]
];

`);

/* ───────────────────────── E4. 하늘·배경 — 정적 레이어 캐시(계절×노을 24단계) + 스프라이트(구름·전경 꽃) + 유기 장식 ───────────────────────── */
replaceBlock('E4 sky', '/* Upper-sky life: the top fifth', '/* ------------------------------------------------------- crop drawing --',
`/* 배경 깊이 4층 (DESIGN.md §4) — 모두 절차적, 매 프레임 그라데이션 생성 0.
   ① 정적 캐시(계절×노을 24단계×크기당 1회): 하늘 그라데이션 + 지평선 안개 띠 + 해/달 후광·원반 + 원경/중경/근경 언덕(대기 원근) + 잔디 + 비네트
   ② 구름 스프라이트 4장(계절 틴트별 1회 래스터) · 햇살 5개(계절·날씨) · 새 · 겨울 권운
   ③ 전경 꽃 실루엣 20개 — 스프라이트 3종×팔레트(노을 단계) → drawImage + 흔들림 회전
   ④ 계절 부유물 + 날씨 오버레이(오로라는 띠 스프라이트 1장)
   빛나는 것(노을 해·반딧불)은 glow 층에 «따로» 그린다 — 낮 하늘은 절대 번지지 않는다. */
const DUSK_Q=24;
let skyCv=null,skyKey="",skyCv2=null,skyKey2="";
function skyLayer(w,h,sea,dq,dim){
  const key=sea+"|"+dq+"|"+w+"x"+h+"|"+view.dpr+"|"+(dim?1:0);
  if(key===skyKey&&skyCv)return skyCv;
  if(key===skyKey2&&skyCv2){const c=skyCv;const k=skyKey;skyCv=skyCv2;skyKey=skyKey2;skyCv2=c;skyKey2=k;return skyCv}
  /* 새로 래스터 — 이전 것은 2번 슬롯으로(노을 경계에서 왕복해도 재래스터 0) */
  skyCv2=skyCv;skyKey2=skyKey;
  const d=view.dpr,cv=document.createElement("canvas");cv.width=Math.round(w*d);cv.height=Math.round(h*d);
  const q=cv.getContext("2d",{alpha:false});q.setTransform(d,0,0,d,0,0);
  const s=SEASON_SKY[sea],k=dq/(DUSK_Q-1),p={};for(const kk in s[0])p[kk]=mix(s[0][kk],s[1][kk],k);
  const g=q.createLinearGradient(0,0,0,h);
  g.addColorStop(0,p.top);g.addColorStop(.42,p.mid);g.addColorStop(.62,p.haze);g.addColorStop(.7,p.low);g.addColorStop(1,mix(p.low,"#0b2b28",.35));
  q.fillStyle=g;q.fillRect(0,0,w,h);
  /* 해/달 — 후광(라디얼) + 원반. 위치는 노을 진행에 따라 동쪽→서쪽 */
  const sx=w*(.14+k*.74),sy=h*(.26-Math.sin(k*Math.PI)*.11),sr=Math.max(28,Math.min(w,h)*.062);
  const gl=q.createRadialGradient(sx,sy,2,sx,sy,sr*3);
  gl.addColorStop(0,p.glow);gl.addColorStop(.22,p.glow+"bb");gl.addColorStop(.55,p.glow+"33");gl.addColorStop(1,p.glow+"00");
  q.fillStyle=gl;q.fillRect(sx-sr*3.1,sy-sr*3.1,sr*6.2,sr*6.2);
  q.globalAlpha=dim?.36:.9;q.fillStyle=p.glow;q.beginPath();q.arc(sx,sy,sr*.54,0,6.283);q.fill();q.globalAlpha=1;
  /* 원경 언덕(대기 원근: 하늘 쪽으로 밀린 색) → 중경 → 근경. 각 층 위에 얇은 능선 하이라이트 */
  const layers=[[.58,.028,.0072,1.1,p.far,.9],[.64,.05,.0105,1.4,mix(p.hill,"#0b2b28",.34),1],[.70,.042,.014,3,p.hill,1]];
  for(const L of layers){
    q.globalAlpha=L[5];q.fillStyle=L[4];q.beginPath();q.moveTo(0,h);
    for(let x=0;x<=w+40;x+=28)q.lineTo(x,h*(L[0]+Math.sin(x*L[2]+L[3])*L[1]));
    q.lineTo(w+40,h);q.closePath();q.fill();
    q.globalAlpha=.22;q.strokeStyle=p.haze;q.lineWidth=2;q.beginPath();
    for(let x=0;x<=w+40;x+=28)q.lineTo(x,h*(L[0]+Math.sin(x*L[2]+L[3])*L[1])+1);q.stroke();
  }
  q.globalAlpha=1;
  /* 잔디 — 근경 아래 그라데이션 + 잔디 결 */
  const gg=q.createLinearGradient(0,h*.72,0,h);
  gg.addColorStop(0,p.grass);gg.addColorStop(1,mix(p.grass,"#0a231c",.55));
  q.fillStyle=gg;q.beginPath();q.moveTo(0,h);
  for(let x=0;x<=w+40;x+=22)q.lineTo(x,h*(.78+Math.sin(x*.02+2)*.012));
  q.lineTo(w+40,h);q.closePath();q.fill();
  q.strokeStyle=mix(p.grass,"#ffffff",.25);q.lineWidth=1.2;q.globalAlpha=.35;
  for(let i=0;i<Math.max(24,w/9);i++){const x=(i*9.7+3)%(w+10),y=h*(.78+Math.sin(x*.02+2)*.012)+2+(i%3)*4;
    q.beginPath();q.moveTo(x,y+7);q.quadraticCurveTo(x+2,y+3,x+(i%2?3:-3),y-4);q.stroke()}
  q.globalAlpha=1;
  /* 비네트 */
  const vg=q.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.35,w*.5,h*.5,Math.max(w,h)*.85);
  vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(4,14,18,.42)");
  q.fillStyle=vg;q.fillRect(0,0,w,h);
  skyCv=cv;skyKey=key;return cv;
}
/* 구름 스프라이트: 계절 틴트 × 2 크기 */
const cloudCache={};
function cloudSprite(sea,big){
  const key=sea+"|"+(big?1:0)+"|"+view.dpr;
  if(cloudCache[key])return cloudCache[key];
  const tint=sea===3?"#eaf4ff":sea===2?"#ffe6c8":"#ffffff",d=view.dpr;
  const s=big?44:30,W=Math.round(s*4.4),H=Math.round(s*2.2);
  const cv=document.createElement("canvas");cv.width=Math.round(W*d);cv.height=Math.round(H*d);
  const q=cv.getContext("2d");q.setTransform(d,0,0,d,0,0);
  const cx=W/2,cy=H*.62;
  /* 아래쪽 그늘 → 몸통 → 위쪽 하이라이트: 뭉게구름의 입체 */
  for(const [col,dy,al] of [[mix(tint,"#8fb3c8",.35),4,.55],[tint,0,.95],[mix(tint,"#ffffff",.5),-4,.5]]){
    q.fillStyle=col;q.globalAlpha=al;
    for(let k=0;k<5;k++){q.beginPath();q.ellipse(cx+(k-2)*s*.62,cy+dy+Math.sin(k*1.9)*s*.17,s*(.5+.33*Math.cos(k*1.3)),s*(.3+.15*Math.sin(k)),0,0,6.283);q.fill()}
  }
  q.globalAlpha=1;
  return cloudCache[key]={cv,W,H};
}
/* 전경 꽃 실루엣 스프라이트: 변형 3 × 팔레트(계절·노을 단계) */
const fgCache={};
function fgFlowerSprite(v,p,keyP){
  const key=v+"|"+keyP+"|"+view.dpr;
  if(fgCache[key])return fgCache[key];
  const d=view.dpr,W=30,H=54,cv=document.createElement("canvas");cv.width=Math.round(W*d);cv.height=Math.round(H*d);
  const q=cv.getContext("2d");q.setTransform(d,0,0,d,0,0);
  const x=W/2,base=H-2,stem=v===0?26:v===1?36:31;
  q.lineCap="round";q.strokeStyle=p.fol;q.lineWidth=2.2;q.globalAlpha=.9;
  q.beginPath();q.moveTo(x,base);q.quadraticCurveTo(x+2,base-stem*.55,x,base-stem);q.stroke();
  q.fillStyle=mix(p.fol,"#ffffff",.12);
  q.beginPath();q.ellipse(x-4,base-stem*.45,5,2.2,-.7,0,6.283);q.fill();
  q.beginPath();q.ellipse(x+4,base-stem*.62,4.5,2,.8,0,6.283);q.fill();
  q.globalAlpha=.78;q.fillStyle=v===1?p.glow:p.blo;
  const pc=4+v;
  for(let k=0;k<pc;k++){const a=k*6.283/pc;q.beginPath();q.ellipse(x+Math.cos(a)*3.4,base-stem+Math.sin(a)*3.4,2.8,1.8,a,0,6.283);q.fill()}
  q.fillStyle=mix(p.glow,"#ffffff",.3);q.beginPath();q.arc(x,base-stem,1.6,0,6.283);q.fill();
  q.globalAlpha=1;
  return fgCache[key]={cv,W,H};
}
let auroraCv=null,auroraKey="";
function auroraSprite(w,h){
  const key=w+"x"+h;if(auroraCv&&auroraKey===key)return auroraCv;
  auroraKey=key;const cv=auroraCv||document.createElement("canvas");cv.width=Math.round(w/2);cv.height=Math.round(h*.4/2);
  const q=cv.getContext("2d");q.setTransform(.5,0,0,.5,0,0);q.clearRect(0,0,w,h);
  for(let i=0;i<5;i++){
    const gA=q.createLinearGradient(0,h*(.05+i*.05),w,h*(.28+i*.05));
    gA.addColorStop(0,"rgba(120,255,210,0)");gA.addColorStop(.5,"rgba(140,240,255,.13)");gA.addColorStop(1,"rgba(200,150,255,0)");
    q.fillStyle=gA;q.beginPath();
    for(let x=0;x<=w;x+=18)q.lineTo(x,h*(.08+i*.05)+Math.sin(x*.008+i)*20);
    for(let x=w;x>=0;x-=18)q.lineTo(x,h*(.20+i*.05)+Math.sin(x*.008+i)*20);
    q.closePath();q.fill()}
  return auroraCv=cv;
}
function drawSkyDecor(w,h,tm,p,sea,sx,sy){
  const cp=view.compact;
  /* --- clouds (스프라이트) --- */
  const nC=cp?3:4,span=w+340;
  for(let i=0;i<nC;i++){
    const cx=((i*span/nC)+tm*(5+i*2.4))%span-170;
    const cy=h*(.055+(i%3)*.052)+Math.sin(tm*.18+i)*3;
    const sp=cloudSprite(sea,i%2===1),sc=(cp?.62:1)*(h/844);
    ctx.globalAlpha=(sea===3?.42:.36)-(i%2)*.06;
    ctx.drawImage(sp.cv,cx-sp.W*sc/2,cy-sp.H*sc*.62,sp.W*sc,sp.H*sc);
  }
  ctx.globalAlpha=1;
  /* --- sun shafts (skip when the sky is already overcast/stormy) --- */
  if((sea===0||sea===1)&&wxIdx!==1&&wxIdx!==3){
    ctx.fillStyle=p.glow;ctx.globalAlpha=(sea===1?.12:.09)*(1-p.dusk*.45);
    for(let i=0;i<5;i++){
      const a=.42+i*.42+Math.sin(tm*.22+i)*.05,wd=.05+.018*Math.sin(tm*.45+i),L=h*1.1;
      ctx.beginPath();ctx.moveTo(sx,sy);
      ctx.lineTo(sx+Math.cos(a-wd)*L,sy+Math.sin(a-wd)*L);
      ctx.lineTo(sx+Math.cos(a+wd)*L,sy+Math.sin(a+wd)*L);
      ctx.closePath();ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  /* --- birds: a loose pair in spring/summer, a migrating flock in autumn --- */
  const flock=sea===2,nB=flock?7:sea===3?0:4;
  if(nB){
    ctx.strokeStyle=flock?"#41291a":"#12333c";ctx.lineWidth=cp?1.7:2.2;
    ctx.globalAlpha=.6;ctx.lineCap="round";
    const lead=w+150-((tm*24)%span);
    for(let i=0;i<nB;i++){
      let x,y;
      if(flock){const row=(i+1)>>1,side=i?(i%2?1:-1):0,gap=cp?20:26;x=lead+row*gap;y=h*.085+side*row*(cp?7:9)}
      else{x=((i*span/nB)+tm*(13+(i%3)*4))%span-160;y=h*(.075+(i%4)*.032)}
      y+=Math.sin(tm*.9+i)*3.5;
      const fl=Math.sin(tm*5.4+i*1.3)*.5+.5,s=cp?5.6:8;
      ctx.beginPath();ctx.moveTo(x-s,y+fl*s*.55);ctx.quadraticCurveTo(x-s*.4,y-s*.4,x,y);ctx.quadraticCurveTo(x+s*.4,y-s*.4,x+s,y+fl*s*.55);ctx.stroke();
    }
    ctx.globalAlpha=1;ctx.lineCap="butt";
  }
  /* --- winter cirrus --- */
  if(sea===3){
    ctx.strokeStyle="#dceaf6";ctx.lineWidth=1.4;
    for(let i=0;i<5;i++){
      const y=h*(.05+i*.036);ctx.globalAlpha=.2+.07*Math.sin(tm*.5+i);ctx.beginPath();
      for(let x=-20;x<=w+20;x+=40)ctx.lineTo(x,y+Math.sin(x*.006+tm*.18+i)*4);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
}
/* 빛나는 하늘 요소 — glow 층(있으면) 또는 scene(폴백) */
function drawSkyGlow(q,w,h,tm,p,sea,sx,sy){
  const sr=Math.max(28,Math.min(w,h)*.062);
  /* 노을·밤의 해/달 원반만 번진다(낮엔 약하게) */
  q.globalAlpha=.15+p.dusk*.55;q.fillStyle=p.glow;q.beginPath();q.arc(sx,sy,sr*.5,0,6.283);q.fill();
  /* fireflies (summer) / drifting embers (autumn) */
  if(sea===1||sea===2){
    const nF=view.compact?7:11;
    q.fillStyle=sea===1?"#fff3b0":"#ffc98a";
    for(let i=0;i<nF;i++){
      const x=(i*173+tm*(9+(i%5)*4))%(w+60)-30;
      const y=h*(.085+((i*53)%40)/100)+Math.sin(tm*(.7+(i%3)*.2)+i)*13;
      q.globalAlpha=(.34+.5*Math.max(0,Math.sin(tm*1.7+i*2.1)))*(.35+p.dusk*.65);
      q.beginPath();q.arc(x,y,1.6+(i%2)*.8,0,6.283);q.fill();
    }
  }
  q.globalAlpha=1;
}
function drawSky(w,h,tm,p){
  const sea=stage?stage.sea:ambientSeason;
  const dq=Math.round(Math.max(0,Math.min(1,p.dusk))*(DUSK_Q-1));
  ctx.drawImage(skyLayer(w,h,sea,dq,wxIdx===1),0,0,w,h);
  const sx=w*(.14+p.dusk*.74),sy=h*(.26-Math.sin(p.dusk*Math.PI)*.11);
  drawSkyDecor(w,h,tm,p,sea,sx,sy);
  if(!postOn())drawSkyGlow(ctx,w,h,tm,p,sea,sx,sy);
  /* foreground flower silhouettes (identity of the game visible on menus too) — 스프라이트 + 흔들림 */
  const nF=view.compact?12:20,keyP=sea+"|"+dq;
  for(let i=0;i<nF;i++){
    const x=(i*97+29)%Math.max(1,w+60)-30,base=h*(.80+(i%4)*.05),v=i%3;
    const sp=fgFlowerSprite(v,p,keyP),sc=.8+(i%5)*.12;
    const swy=Math.sin(tm*1.1+i)*.09;
    ctx.save();ctx.translate(x,base);ctx.rotate(swy);ctx.globalAlpha=.9;
    ctx.drawImage(sp.cv,-sp.W*sc/2,-sp.H*sc+2,sp.W*sc,sp.H*sc);ctx.restore();
  }
  ctx.globalAlpha=1;
  /* seasonal drifting motes */
  for(let i=0;i<(view.compact?14:22);i++){
    const sp=8+(i%4)*5, x=(i*131+tm*sp)%(w+50)-25, y=h*(.10+((i*37)%56)/100)+Math.sin(tm*.6+i)*10;
    ctx.globalAlpha=.30+.16*Math.sin(tm*1.5+i);
    ctx.fillStyle=sea===2?p.blo:(i%3?p.blo:"#ffffff");
    if(sea===3){ctx.beginPath();ctx.arc(x,y,1.6+i%2,0,6.283);ctx.fill()}
    else{ctx.beginPath();ctx.ellipse(x,y,3+i%3,1.7,tm*.8+i,0,6.283);ctx.fill()}
  }
  ctx.globalAlpha=1;
  /* weather overlay */
  if(wxIdx===1){
    ctx.fillStyle="rgba(226,248,244,.12)";
    for(let i=0;i<7;i++){const y=h*(.20+i*.085)+Math.sin(tm*.24+i)*12;
      ctx.beginPath();ctx.ellipse(w*(.1+i*.16),y,w*.3,17+i*3,0,0,6.283);ctx.fill()}
    ctx.fillStyle="rgba(212,240,238,.09)";ctx.fillRect(0,0,w,h);
  }else if(wxIdx===2){
    for(let i=0;i<18;i++){const x=(i*83+tm*(64+i%4*11))%(w+90)-45,y=(i*57+tm*14)%Math.max(120,h*.72);
      ctx.strokeStyle=i%3?p.blo:p.fol;ctx.globalAlpha=.4;ctx.lineWidth=1.4+i%2;
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+18,y-9,x+34,y-2);ctx.stroke()}
    ctx.globalAlpha=1;
  }else if(wxIdx===3){
    ctx.fillStyle="rgba(10,40,54,.2)";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(190,234,255,.5)";ctx.lineWidth=1.2;
    for(let i=0;i<64;i++){const x=(i*47+tm*150)%(w+70)-35,y=(i*71+tm*270)%Math.max(120,h);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+19);ctx.stroke()}
  }else if(wxIdx===4){
    ctx.fillStyle="rgba(255,160,60,.09)";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(255,220,150,.16)";ctx.lineWidth=2;
    for(let i=0;i<9;i++){ctx.beginPath();
      for(let x=0;x<=w;x+=16)ctx.lineTo(x,h*(.30+i*.06)+Math.sin(x*.03+tm*2.2+i)*4);
      ctx.stroke()}
  }else if(wxIdx===5){
    const au=auroraSprite(w,h);
    ctx.globalAlpha=.85+.15*Math.sin(tm*.9);
    ctx.drawImage(au,0,Math.sin(tm*.35)*8,w,h*.4);
    ctx.globalAlpha=.7+.3*Math.sin(tm*.6+2);
    ctx.drawImage(au,Math.sin(tm*.2)*30,h*.06+Math.sin(tm*.5+1)*10,w,h*.4);
    ctx.globalAlpha=1;
    ctx.fillStyle="rgba(30,20,60,.18)";ctx.fillRect(0,0,w,h);
  }else{
    ctx.fillStyle="rgba(255,238,170,.06)";ctx.fillRect(0,0,w,h);
  }
  ctx.globalAlpha=1;
}

`);

/* ───────────────────────── E5. 작물 — 꽃머리 스프라이트(하이라이트·그림자·잎맥) + 시듦 단계 + 익음 후광(glow 층) ───────────────────────── */
replaceBlock('E5 crops', 'function petalPath(q,ps,len,wid){', '/* ------------------------------------------------------------- layout -- */',
`function petalPath(q,ps,len,wid){
  q.beginPath();
  if(ps===0){q.ellipse(0,-len*.55,wid,len*.55,0,0,6.283)}
  else if(ps===1){q.moveTo(0,0);q.quadraticCurveTo(wid*1.75,-len*.42,0,-len);q.quadraticCurveTo(-wid*1.75,-len*.42,0,0)}
  else if(ps===2){q.moveTo(0,0);q.lineTo(wid,-len*.48);q.lineTo(0,-len);q.lineTo(-wid,-len*.48);q.closePath()}
  else{q.moveTo(-wid,0);q.quadraticCurveTo(0,-len*.35,0,-len);q.quadraticCurveTo(0,-len*.35,wid,0);q.closePath()}
}
function centerPath(q,ct,r){
  q.beginPath();
  if(ct===0){q.arc(0,0,r,0,6.283)}
  else if(ct===1){q.arc(0,0,r,0,6.283);q.moveTo(r*.45,0);q.arc(0,0,r*.45,0,6.283,true)}
  else if(ct===2){for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr2=i%2?r*.45:r;const x=Math.cos(a)*rr2,y=Math.sin(a)*rr2;i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath()}
  else{for(let i=0;i<6;i++){const a=i*Math.PI/3;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath()}
}
/* 잎: 두 톤(밑동 진함→끝 밝음) + 잎맥 1획. 스타일 3 = 잎 없음(원본과 동일). */
function drawLeaves(q,style,r,g,col,line){
  if(style===3)return;
  q.strokeStyle=line;q.lineWidth=Math.max(1.2,r*.035);
  const sets=style===2?3:1,lit=mix(col,"#ffffff",.22),vein=mix(col,"#ffffff",.42);
  for(let s=0;s<sets;s++){
    const yy=r*(.12-s*.13),sc=1-s*.2;
    for(const side of[-1,1]){
      q.save();q.translate(side*r*.17*sc,yy);q.rotate(side*(style===1?.9:.55));
      q.beginPath();
      if(style===1){q.moveTo(0,0);q.quadraticCurveTo(r*.2*sc,-r*.07*sc,r*.34*sc,0);q.quadraticCurveTo(r*.2*sc,r*.07*sc,0,0)}
      else{q.ellipse(r*.16*sc,0,r*.20*sc*g,r*.095*sc*g,0,0,6.283)}
      q.fillStyle=col;q.fill();q.stroke();
      /* 윗면 하이라이트 */
      q.save();q.clip();q.fillStyle=lit;q.globalAlpha=.55;q.beginPath();q.ellipse(r*.16*sc,-r*.04*sc,r*.15*sc,r*.04*sc,0,0,6.283);q.fill();q.restore();
      /* 잎맥 */
      q.strokeStyle=vein;q.lineWidth=Math.max(.8,r*.018);q.globalAlpha=.8;
      q.beginPath();q.moveTo(r*.02*sc,0);q.lineTo(r*(style===1?.3:.32)*sc,0);q.stroke();
      q.globalAlpha=1;q.strokeStyle=line;q.lineWidth=Math.max(1.2,r*.035);
      q.restore();
    }
  }
}
/* 꽃머리 스프라이트 — (작물, 개화 8단계, 반지름 4px 단위, 시듦 3단계, dpr) 당 1회 래스터.
   층: 꽃잎마다 «밑동 진함→끝 밝음» 그라데이션 + 끝 하이라이트 + 윤곽선, 중심 라디얼(볼륨) + 씨 점, 머리 아래 부드러운 그림자.
   petal spin(tm*.12)은 스프라이트 «전체 회전»으로 재현한다. */
const headCache=new Map();
function headSprite(ci,bq,R,wilt){
  const key=ci+"|"+bq+"|"+R+"|"+wilt+"|"+view.dpr;
  let sp=headCache.get(key);if(sp)return sp;
  if(headCache.size>200)headCache.clear();
  const C=CROPS[ci],S=C.sh,bloom=.55+.45*(bq/7),r=R,d=view.dpr;
  const wk=wilt===2?.62:wilt===1?.32:0;
  const ca=wk?mix(C.a,"#8a6a48",wk):C.a,cb=wk?mix(C.b,"#a48a68",wk):C.b,cc=wk?mix(C.c,"#7a5a3c",wk):C.c;
  const line=wk?mix("#123d39","#5a4a3a",wk):"#123d39";
  const ext=S.p>0?r*(S.pl+S.pw)*bloom+r*.08:r*.65*bloom+r*.1;
  const W=Math.ceil(ext*2+6),cv=document.createElement("canvas");cv.width=Math.round(W*d);cv.height=Math.round(W*d);
  const q=cv.getContext("2d");q.setTransform(d,0,0,d,W/2*d,W/2*d);
  q.lineCap="round";q.lineJoin="round";
  /* 머리 아래 그림자(부드러운 원) */
  const sg=q.createRadialGradient(0,ext*.15,0,0,ext*.15,ext*.9);sg.addColorStop(0,"rgba(0,0,0,.18)");sg.addColorStop(1,"rgba(0,0,0,0)");
  q.fillStyle=sg;q.fillRect(-W/2,-W/2,W,W);
  const pl=r*S.pl*bloom,pw=r*S.pw*bloom;
  if(S.p>0){
    q.strokeStyle=line;q.lineWidth=Math.max(1,r*.028);
    for(let k=0;k<S.p;k++){
      q.save();q.rotate(k*6.283/S.p);
      const base=k%2?cb:ca,tip=mix(base,"#ffffff",.35),root=mix(base,"#000000",.22);
      const pg=q.createLinearGradient(0,0,0,-pl);pg.addColorStop(0,root);pg.addColorStop(.45,base);pg.addColorStop(1,tip);
      q.fillStyle=pg;petalPath(q,S.ps,pl,pw);q.fill();q.stroke();
      /* 끝 하이라이트 */
      q.save();petalPath(q,S.ps,pl,pw);q.clip();q.fillStyle="rgba(255,255,255,.32)";q.beginPath();q.ellipse(-pw*.25,-pl*.72,pw*.45,pl*.2,-.3,0,6.283);q.fill();q.restore();
      q.restore();
    }
    const cr=r*.115*bloom;
    const cg=q.createRadialGradient(-cr*.3,-cr*.3,cr*.1,0,0,cr*1.1);cg.addColorStop(0,mix(cc,"#ffffff",.35));cg.addColorStop(.7,cc);cg.addColorStop(1,mix(cc,"#000000",.3));
    q.fillStyle=cg;q.strokeStyle=line;q.lineWidth=Math.max(1,r*.028);centerPath(q,S.ctr,cr);q.fill();q.stroke();
    if(S.ctr===0||S.ctr===3){q.fillStyle="rgba(0,0,0,.18)";for(let i=0;i<5;i++){const a=i*1.257,rr0=cr*.5;q.beginPath();q.arc(Math.cos(a)*rr0,Math.sin(a)*rr0,Math.max(.6,cr*.14),0,6.283);q.fill()}}
  }else{
    /* grain / frond crops: a cluster of pods running up the stalk */
    q.strokeStyle=line;q.lineWidth=Math.max(1,r*.026);
    for(let k=0;k<7;k++){const yy=k*r*.075*bloom-r*.22*bloom,side=k%2?1:-1;
      q.save();q.translate(side*r*.07,yy);q.rotate(side*.5);
      const pg=q.createLinearGradient(-r*.085,0,r*.085,0);pg.addColorStop(0,mix(ca,"#000000",.2));pg.addColorStop(.5,ca);pg.addColorStop(1,mix(ca,"#ffffff",.3));
      q.fillStyle=pg;q.beginPath();q.ellipse(0,0,r*.085*bloom,r*.045*bloom,0,0,6.283);q.fill();q.stroke();q.restore()}
    q.fillStyle=cc;centerPath(q,S.ctr,r*.075*bloom);q.fill();q.stroke();
  }
  sp={cv,W,ext};headCache.set(key,sp);return sp;
}
/* wilt: 0 싱싱 · 1 시들기 시작(고개 숙임·색 바램) · 2 시들기 직전 */
function drawCropOn(q,ci,g,cx,cy,r,tm,glow,wilt){
  const C=CROPS[ci],S=C.sh,line="#123d39";wilt=wilt|0;
  const stg=g>=1?3:g>=.62?2:g>=.28?1:0;
  q.save();q.translate(cx,cy);
  q.rotate(Math.sin(tm*1.5+cx*.06)*.05*g+wilt*.12);
  q.lineCap="round";q.lineJoin="round";
  q.fillStyle="rgba(0,0,0,.22)";q.beginPath();q.ellipse(0,r*.42,r*.34,r*.09,0,0,6.283);q.fill();
  const top=-r*S.h*(.42+.58*g);
  const stemCol=wilt?mix("#2f8f5f","#8a6a48",wilt*.4):mix("#1d5c48","#2f8f5f",.4);
  q.strokeStyle=stemCol;q.lineWidth=Math.max(2.4,r*.075);
  q.beginPath();q.moveTo(0,r*.36);
  if(S.stem===0)q.lineTo(0,top);
  else if(S.stem===1)q.quadraticCurveTo(r*.10,r*.02,0,top);
  else q.bezierCurveTo(-r*.16,r*.05,r*.16,top*.55,0,top);
  q.stroke();
  /* 줄기 하이라이트 */
  q.strokeStyle="rgba(255,255,255,.18)";q.lineWidth=Math.max(1,r*.025);
  q.beginPath();q.moveTo(-r*.012,r*.3);q.lineTo(-r*.012,top+r*.06);q.stroke();
  if(stg===0){
    /* 씨앗 단계: 흙 위 새싹 2잎 */
    q.fillStyle=mix(C.a,"#2f8f5f",.5);q.strokeStyle=line;q.lineWidth=Math.max(1,r*.03);
    q.beginPath();q.ellipse(-r*.09,r*.2,r*.1,r*.045,-.6,0,6.283);q.fill();q.stroke();
    q.beginPath();q.ellipse(r*.09,r*.18,r*.1,r*.045,.6,0,6.283);q.fill();q.stroke();
  }
  if(stg>=1)drawLeaves(q,S.leaf,r,Math.min(1,g*1.5),wilt?mix(C.a,"#8a6a48",.45):mix(C.a,"#2f8f5f",.35),line);
  if(stg>=2){
    const bq=stg>=3?7:Math.max(0,Math.min(6,Math.floor((g-.62)/.38*7)));
    const R=Math.max(8,Math.round(r/4)*4);
    const sp=headSprite(ci,bq,R,wilt),sc=r/R;
    q.save();q.translate(0,top+wilt*r*.05);q.rotate(tm*.12+wilt*.3);
    q.drawImage(sp.cv,-sp.W/2*sc,-sp.W/2*sc,sp.W*sc,sp.W*sc);q.restore();
  }else if(stg===1){
    /* 봉오리 */
    q.fillStyle=mix(C.a,"#2f8f5f",.3);q.strokeStyle=line;q.lineWidth=Math.max(1,r*.028);
    q.beginPath();q.ellipse(0,top,r*.07,r*.1,0,0,6.283);q.fill();q.stroke();
  }
  if(glow){
    const a=.45+.45*Math.sin(tm*7);
    q.globalAlpha=a;q.strokeStyle=C.b;q.lineWidth=Math.max(2,r*.05);
    q.beginPath();q.arc(0,top,r*.46,0,6.283);q.stroke();
    q.globalAlpha=a*.5;q.fillStyle=C.b;
    for(let k=0;k<4;k++){const a2=tm*2+k*1.57;q.beginPath();q.arc(Math.cos(a2)*r*.52,top+Math.sin(a2)*r*.52,r*.05,0,6.283);q.fill()}
    q.globalAlpha=1;
  }
  q.restore();
}
const drawCrop=(ci,g,cx,cy,r,tm,glow,wilt)=>drawCropOn(ctx,ci,g,cx,cy,r,tm,glow,wilt);
/* 익은 작물의 후광 — glow 층에 그린다(블룸이 «가장자리»를 태운다). 후광 스프라이트는 크기별 1회. */
const haloCache=new Map();
function haloSprite(col,R){
  const key=col+"|"+R;let sp=haloCache.get(key);if(sp)return sp;
  if(haloCache.size>40)haloCache.clear();
  const cv=document.createElement("canvas");cv.width=cv.height=R*2;
  const q=cv.getContext("2d"),g=q.createRadialGradient(R,R,R*.2,R,R,R);
  g.addColorStop(0,hexa(col,.34));g.addColorStop(.5,hexa(col,.14));g.addColorStop(1,hexa(col,0));
  q.fillStyle=g;q.fillRect(0,0,R*2,R*2);
  sp={cv,R};haloCache.set(key,sp);return sp;
}
function drawRipeGlow(q,ci,cx,cy,r,tm,fresh){
  const C=CROPS[ci],S=C.sh,top=cy-r*S.h;
  const a=(.62+.22*Math.sin(tm*7))*(.4+.6*fresh);
  const sp=haloSprite(C.b,Math.round(r*.8));
  q.globalAlpha=a;q.drawImage(sp.cv,cx-sp.R,top-sp.R,sp.R*2,sp.R*2);
  q.globalAlpha=a*.7;q.fillStyle=C.b;
  for(let k=0;k<4;k++){const a2=tm*2+k*1.57;q.beginPath();q.arc(cx+Math.cos(a2)*r*.52,top+Math.sin(a2)*r*.52,r*.045,0,6.283);q.fill()}
  q.globalAlpha=1;
}
/* crop icon cache -> data URLs, generated at runtime (no external assets) */
const iconCache={};
function cropIcon(i){
  if(iconCache[i])return iconCache[i];
  const c=document.createElement("canvas");c.width=c.height=96;
  const q=c.getContext("2d");
  const keep=view.dpr;view.dpr=2;
  drawCropOn(q,i,1,48,60,39,0,false);
  view.dpr=keep;
  const url=c.toDataURL();iconCache[i]=url;return url;
}

`);

/* ───────────────────────── E6. resize — DPR 상한을 블룸 품질 단계가 정한다(2 / 1.5). 기하는 무변경. ───────────────────────── */
patch('E6 dpr cap',
`  view.dpr=Math.min(devicePixelRatio||1,2);`,
`  view.dpr=Math.min(devicePixelRatio||1,POST?POST.dprCap():2);`);

/* ───────────────────────── E7. 보드 — 틀 판 캐시 + 흙 밭 스프라이트 + 시듦 표현 + 익음 후광(glow) ───────────────────────── */
replaceBlock('E7 drawBoard', 'function drawBoard(tm){', 'function rr(x,y,w,h,r){',
`/* 흙 밭 스프라이트: (크기, 변형 4, 심김 여부) 당 1회 — 라디얼 흙 + 이랑 + 위쪽 하이라이트 림 + 안쪽 그림자 */
const bedCache=new Map();
function bedSprite(s,vi,planted){
  const S=Math.round(s),key=S+"|"+vi+"|"+(planted?1:0)+"|"+view.dpr;
  let sp=bedCache.get(key);if(sp)return sp;
  if(bedCache.size>24)bedCache.clear();
  const d=view.dpr,vr0=vi/4,cv=document.createElement("canvas");cv.width=cv.height=Math.round(S*d);
  const q=cv.getContext("2d");q.setTransform(d,0,0,d,0,0);
  const rad=Math.max(11,S*.15);
  const P=()=>{q.beginPath();q.roundRect(0,0,S,S,rad)};
  const soil=q.createRadialGradient(S*(.4+vr0*.14),S*.32,2,S*.5,S*.55,S*.78);
  soil.addColorStop(0,planted?"#7b5a41":mix("#5c4029","#6d4c33",vr0));
  soil.addColorStop(1,mix("#262220","#332b24",vr0));
  q.fillStyle=soil;P();q.fill();
  q.save();P();q.clip();
  /* 이랑 */
  q.strokeStyle="rgba(255,235,190,.07)";q.lineWidth=Math.max(1,S*.018);
  const ang=vr0<.5?0:.5;
  for(let k=-2;k<=3;k++){q.beginPath();q.moveTo(-S*.1,S*(.18+k*.2)+ang*S*.1);q.lineTo(S*1.1,S*(.18+k*.2)-ang*S*.1);q.stroke()}
  /* 흙 알갱이 */
  q.fillStyle="rgba(0,0,0,.14)";for(let i=0;i<9;i++){const x=((i*53+vi*17)%97)/97*S,y=((i*29+vi*7)%89)/89*S;q.beginPath();q.arc(x,y,Math.max(1,S*.014),0,6.283);q.fill()}
  q.fillStyle="rgba(255,225,180,.08)";for(let i=0;i<6;i++){const x=((i*71+vi*13)%97)/97*S,y=((i*41+vi*5)%89)/89*S;q.beginPath();q.arc(x,y,Math.max(1,S*.012),0,6.283);q.fill()}
  /* 안쪽 그림자(위·왼쪽) + 아래 림 하이라이트 */
  const ig=q.createLinearGradient(0,0,0,S);ig.addColorStop(0,"rgba(0,0,0,.28)");ig.addColorStop(.25,"rgba(0,0,0,0)");ig.addColorStop(.9,"rgba(0,0,0,0)");ig.addColorStop(1,"rgba(255,220,170,.08)");
  q.fillStyle=ig;q.fillRect(0,0,S,S);
  q.restore();
  q.strokeStyle="rgba(199,255,229,.14)";q.lineWidth=1.5;P();q.stroke();
  sp={cv,S};bedCache.set(key,sp);return sp;
}
let plateCv=null,plateKey="";
function boardPlate(){
  const key=view.board.toFixed(1)+"|"+view.x.toFixed(1)+","+view.y.toFixed(1)+"|"+view.dpr;
  if(key===plateKey&&plateCv)return plateCv;
  plateKey=key;
  const d=view.dpr,W=view.board+22+40,H=view.board+22+40,ox=view.x-11-20,oy=view.y-11-20;
  plateCv=plateCv||document.createElement("canvas");plateCv.width=Math.round(W*d);plateCv.height=Math.round(H*d);
  const o=plateCv.getContext("2d");o.setTransform(d,0,0,d,-ox*d,-oy*d);o.clearRect(ox,oy,W,H);
  const R=(x,y,w,h,r)=>{o.beginPath();o.roundRect(x,y,w,h,Math.min(r,w/2,h/2))};
  /* 그림자 → 나무 틀(위 밝고 아래 어두운) → 안쪽 어두운 바닥 → 헤어라인 */
  o.shadowColor="rgba(0,0,0,.42)";o.shadowBlur=16;o.shadowOffsetY=8;
  const fg=o.createLinearGradient(0,view.y-11,0,view.y+view.board+11);
  fg.addColorStop(0,"#6b4a30");fg.addColorStop(.5,"#553a26");fg.addColorStop(1,"#3a281a");
  o.fillStyle=fg;R(view.x-11,view.y-11,view.board+22,view.board+22,26);o.fill();
  o.shadowBlur=0;o.shadowOffsetY=0;
  o.strokeStyle="rgba(255,220,170,.22)";o.lineWidth=1.5;R(view.x-10,view.y-10,view.board+20,view.board+20,25);o.stroke();
  /* 틀 나뭇결 */
  o.save();R(view.x-11,view.y-11,view.board+22,view.board+22,26);o.clip();
  o.strokeStyle="rgba(0,0,0,.12)";o.lineWidth=1;
  for(let k=0;k<6;k++){o.beginPath();o.moveTo(view.x-11,view.y-8+k*3.2);o.lineTo(view.x+view.board+11,view.y-8+k*3.2+1);o.stroke();
    o.beginPath();o.moveTo(view.x-11,view.y+view.board+8-k*3.2);o.lineTo(view.x+view.board+11,view.y+view.board+8-k*3.2-1);o.stroke()}
  o.restore();
  o.fillStyle="rgba(5,26,30,.55)";R(view.x-4,view.y-4,view.board+8,view.board+8,20);o.fill();
  o.strokeStyle="rgba(169,255,221,.16)";o.lineWidth=1.5;o.stroke();
  return plateCv;
}
function drawBoard(tm){
  const n=view.n,pad=Math.max(5,view.cell*.045);
  ctx.save();
  if(shake>0)ctx.translate((rnd()-.5)*shake,(rnd()-.5)*shake);
  /* frame(캐시) */
  const pc=boardPlate();ctx.drawImage(pc,view.x-31,view.y-31,pc.width/view.dpr,pc.height/view.dpr);
  const gq=postOn()?POST.gctx:null;
  for(let i=0;i<plots.length;i++){
    const p=plots[i],col=i%n,row=i/n|0;
    const x=view.x+col*view.cell+pad,y=view.y+row*view.cell+pad,s=view.cell-pad*2;
    const focused=i===focusPlot;
    if(p.stone){
      rr(x,y,s,s,Math.max(11,s*.15));
      ctx.fillStyle="#4a4740";ctx.fill();
      ctx.strokeStyle="rgba(220,214,200,.2)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.save();ctx.translate(x+s/2,y+s/2);
      ctx.fillStyle="#6d675c";
      ctx.beginPath();ctx.moveTo(-s*.26,s*.16);ctx.lineTo(-s*.14,-s*.2);ctx.lineTo(s*.1,-s*.24);
      ctx.lineTo(s*.27,s*.02);ctx.lineTo(s*.12,s*.2);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.14)";
      ctx.beginPath();ctx.moveTo(-s*.14,-s*.2);ctx.lineTo(s*.1,-s*.24);ctx.lineTo(s*.02,-s*.02);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(0,0,0,.2)";
      ctx.beginPath();ctx.moveTo(-s*.26,s*.16);ctx.lineTo(s*.12,s*.2);ctx.lineTo(s*.27,s*.02);ctx.lineTo(s*.02,-s*.02);ctx.closePath();ctx.fill();
      ctx.fillStyle="#efe6d2";ctx.font="700 "+Math.max(10,s*.15)+"px "+FONT;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(stoneCost(),0,s*.3);
      ctx.restore();
      continue;
    }
    const vi=((i*2654435761)>>>0)%4;
    const bs=bedSprite(s,vi,p.seed>=0);
    ctx.drawImage(bs.cv,x,y,s,s);
    if(focused){ctx.strokeStyle="#ffd166";ctx.lineWidth=3;rr(x,y,s,s,Math.max(11,s*.15));ctx.stroke()}
    if(p.pulse>0){ctx.globalAlpha=p.pulse*.35;ctx.fillStyle="#ffffff";rr(x,y,s,s,Math.max(11,s*.15));ctx.fill();ctx.globalAlpha=1}
    if(p.pest){
      const pw=Math.max(2,s*.05)*(1+Math.sin(tm*8)*.25);
      ctx.strokeStyle="#ff9d5c";ctx.lineWidth=pw;
      rr(x-2,y-2,s+4,s+4,Math.max(11,s*.15));ctx.stroke();
    }
    if(p.seed>=0){
      const C=CROPS[p.seed],rip=p.growth>=1;
      const wl=rip?(C.fx===11?1:Math.max(0,1-p.ripe/15)):1;
      const wilt=rip?(wl<.25?2:wl<.5?1:0):0;
      drawCrop(p.seed,p.growth,x+s/2,y+s*.54,s*.58,tm,rip&&!gq,wilt);
      if(rip&&gq)drawRipeGlow(gq,p.seed,x+s/2,y+s*.54,s*.58,tm,wl);
      const bw=s*.74,bx=x+s*.13,by=y+s*.855,bh=Math.max(4,s*.05);
      ctx.fillStyle="rgba(3,20,20,.72)";rr(bx,by,bw,bh,bh/2);ctx.fill();
      if(rip){
        ctx.fillStyle=wl>.5?"#ffd166":wl>.25?"#ff9d5c":"#ff6b6b";
        rr(bx,by,bw*wl,bh,bh/2);ctx.fill();
      }else{
        ctx.fillStyle=C.a;rr(bx,by,bw*p.growth,bh,bh/2);ctx.fill();
      }
      if(CROPS[p.seed].fx===14&&p.tends<2){
        ctx.fillStyle="#ffe9a8";ctx.font="700 "+Math.max(9,s*.11)+"px "+FONT;ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(p.tends+"/2",x+s*.5,y+s*.16);
      }
    }else{
      ctx.strokeStyle="rgba(211,255,234,.22)";ctx.lineWidth=Math.max(2,s*.03);ctx.lineCap="round";
      const cx=x+s*.5,cy=y+s*.5,L=Math.max(6,s*.09);
      ctx.beginPath();ctx.moveTo(cx-L,cy);ctx.lineTo(cx+L,cy);ctx.moveTo(cx,cy-L);ctx.lineTo(cx,cy+L);ctx.stroke();ctx.lineCap="butt";
    }
  }
  ctx.restore();
}
`);

/* ───────────────────────── E8. 신규 시각 효과 풀(런타임 할당 0) + 로직 «관찰» 훅 ───────────────────────── */
patch('E8 vfx pools',
`function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r)}`,
`function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
/* ── 신규 시각 효과 풀(typed array, 런타임 할당 0) ──
   PT 꽃잎(개화·수확·결과 축하) · SP 불꽃(수확·연쇄) · CN 코인(밭→HUD 코인 칩으로 이징 비행) · GR 빛 고리(개화·연쇄, glow 층)
   로직의 particles/floaters/rings(rnd 소비)는 무접촉. 여기는 vr() 만 쓴다. */
const PTN=160,PT={x:new Float32Array(PTN),y:new Float32Array(PTN),vx:new Float32Array(PTN),vy:new Float32Array(PTN),life:new Float32Array(PTN),max:new Float32Array(PTN),sz:new Float32Array(PTN),rot:new Float32Array(PTN),rs:new Float32Array(PTN),ph:new Float32Array(PTN),col:new Array(PTN).fill(""),emis:new Uint8Array(PTN)};let ptN=0;
const SPN=200,SP={x:new Float32Array(SPN),y:new Float32Array(SPN),vx:new Float32Array(SPN),vy:new Float32Array(SPN),life:new Float32Array(SPN),max:new Float32Array(SPN),sz:new Float32Array(SPN),col:new Array(SPN).fill("")};let spN=0;
const CNN=40,CN={x0:new Float32Array(CNN),y0:new Float32Array(CNN),cx:new Float32Array(CNN),cy:new Float32Array(CNN),t:new Float32Array(CNN),dur:new Float32Array(CNN),sz:new Float32Array(CNN)};let cnN=0;
const GRN=12,GR={x:new Float32Array(GRN),y:new Float32Array(GRN),r0:new Float32Array(GRN),life:new Float32Array(GRN),col:new Array(GRN).fill("")};let grN=0;
let coinTarget={x:0,y:0,at:0},chainPunchT=0,coinPunchFlip=0,resultBurstT=0,resultSeen=false;
const prevSeed=new Int8Array(64),prevGrowth=new Float32Array(64);let prevCoins=0,prevChain=0,prevWithered=0,prevScreen="",prevStageId=0;
function spawnPetal(x,y,vx,vy,col,sz,emis){if(ptN<PTN){const k=ptN++;PT.x[k]=x;PT.y[k]=y;PT.vx[k]=vx;PT.vy[k]=vy;PT.max[k]=.8+vr()*.7;PT.life[k]=PT.max[k];PT.sz[k]=sz;PT.rot[k]=vr()*6.283;PT.rs[k]=(vr()-.5)*8;PT.ph[k]=vr()*6.283;PT.col[k]=col;PT.emis[k]=emis?1:0}}
function spawnSpark(x,y,vx,vy,col){if(spN<SPN){const k=spN++;SP.x[k]=x;SP.y[k]=y;SP.vx[k]=vx;SP.vy[k]=vy;SP.max[k]=.28+vr()*.3;SP.life[k]=SP.max[k];SP.sz[k]=1.2+vr()*1.4;SP.col[k]=col}}
function spawnCoin(x,y){if(cnN<CNN){const k=cnN++;CN.x0[k]=x+(vr()-.5)*view.cell*.3;CN.y0[k]=y+(vr()-.5)*view.cell*.2;CN.cx[k]=x+(vr()-.5)*160;CN.cy[k]=y-120-vr()*120;CN.t[k]=-vr()*.12;CN.dur[k]=.62+vr()*.25;CN.sz[k]=Math.max(5,view.cell*.07)}}
function spawnGlowRing(x,y,r0,col){if(grN<GRN){const k=grN++;GR.x[k]=x;GR.y[k]=y;GR.r0[k]=r0;GR.life[k]=1;GR.col[k]=col}}
function coinTargetPos(){
  const now=performance.now();
  if(now-coinTarget.at>250){coinTarget.at=now;try{const r=$("vCoins").getBoundingClientRect();coinTarget.x=r.left+r.width/2;coinTarget.y=r.top+r.height/2}catch(_){}}
  return coinTarget;
}
function bloomBurst(i,ci){
  const c=plotCenter(i),C=CROPS[ci],r=view.cell*.58,top=c.y+view.cell*.04-r*C.sh.h;
  for(let k=0;k<8;k++){const a=vr()*6.283,s=40+vr()*90;spawnPetal(c.x,top,Math.cos(a)*s,Math.sin(a)*s-50,k%2?C.b:C.a,Math.max(2.2,r*.08),k<4?1:0)}
  spawnGlowRing(c.x,top,r*.2,C.b);
}
function harvestBurst(i,ci,chainN){
  const c=plotCenter(i),C=CROPS[ci];
  for(let k=0;k<12;k++){const a=vr()*6.283,s=120+vr()*220;spawnSpark(c.x,c.y,Math.cos(a)*s,Math.sin(a)*s-80,k%3?"#fff2c0":C.b)}
  for(let k=0;k<6;k++){const a=vr()*6.283,s=30+vr()*60;spawnPetal(c.x,c.y-view.cell*.2,Math.cos(a)*s,Math.sin(a)*s-30,k%2?C.b:C.a,Math.max(2,view.cell*.07),0)}
  const nCoin=Math.min(7,2+(chainN|0));for(let k=0;k<nCoin;k++)spawnCoin(c.x,c.y);
  if(chainN>1)spawnGlowRing(c.x,c.y,view.cell*.25,"#ffe08a");
}
function witherFall(i){
  const c=plotCenter(i);
  for(let k=0;k<7;k++)spawnPetal(c.x+(vr()-.5)*view.cell*.4,c.y-view.cell*.2,(vr()-.5)*30,10+vr()*30,k%2?"#9a7c68":"#7a5a3c",Math.max(2,view.cell*.06),0);
}
/* 로직이 만든 사건을 프레임마다 «관찰»해서 새 이펙트를 붙인다(act/harvest/update/endStage 는 무접촉). */
function observeEvents(){
  if(screen==="play"&&stage){
    if(stage.id!==prevStageId){prevStageId=stage.id;for(let i=0;i<64;i++){prevSeed[i]=-1;prevGrowth[i]=0}prevCoins=coins;prevChain=0;prevWithered=0;ptN=spN=cnN=grN=0}
    const coinsUp=coins>prevCoins,witherUp=prog&&prog.withered>prevWithered;
    for(let i=0;i<plots.length&&i<64;i++){const p=plots[i];
      if(p.seed>=0&&p.growth>=1&&prevGrowth[i]<1&&prevSeed[i]===p.seed)bloomBurst(i,p.seed);
      if(prevSeed[i]>=0&&p.seed<0){if(coinsUp&&(i===focusPlot||!witherUp))harvestBurst(i,prevSeed[i],chain);else if(witherUp)witherFall(i)}
      prevSeed[i]=p.seed;prevGrowth[i]=p.seed>=0?p.growth:0;
    }
    if(coinsUp){coinPunchFlip^=1;const el=$("vCoins");el.classList.remove("punch","punch2");el.classList.add(coinPunchFlip?"punch":"punch2")}
    if(chain>prevChain&&chain>1){chainPunchT=1;const ct=$("chainTag");ct.classList.remove("punch");void ct.offsetWidth;ct.classList.add("punch")}
    prevCoins=coins;prevChain=chain;if(prog)prevWithered=prog.withered;
  }
  if(screen==="result"&&prevScreen!=="result"&&lastResult&&lastResult.win){resultBurstT=1.2;
    const w=view.w,h=view.h;for(let k=0;k<40;k++){const x=w*(.2+vr()*.6),y=h*.35;const a=-Math.PI/2+(vr()-.5)*1.6,s=160+vr()*260;
      spawnPetal(x,y,Math.cos(a)*s,Math.sin(a)*s,["#ffd166","#79f2bd","#ff9ec4","#8ae6ff","#fff2c0"][k%5],3+vr()*3,k%2)}}
  prevScreen=screen;
}
function stepVfx(dt){
  for(let i=ptN-1;i>=0;i--){PT.life[i]-=dt;
    if(PT.life[i]<=0){const l=--ptN;if(i!==l){PT.x[i]=PT.x[l];PT.y[i]=PT.y[l];PT.vx[i]=PT.vx[l];PT.vy[i]=PT.vy[l];PT.life[i]=PT.life[l];PT.max[i]=PT.max[l];PT.sz[i]=PT.sz[l];PT.rot[i]=PT.rot[l];PT.rs[i]=PT.rs[l];PT.ph[i]=PT.ph[l];PT.col[i]=PT.col[l];PT.emis[i]=PT.emis[l]}continue}
    PT.ph[i]+=dt*5;PT.x[i]+=(PT.vx[i]+Math.sin(PT.ph[i])*28)*dt;PT.y[i]+=PT.vy[i]*dt;PT.vx[i]*=.96;PT.vy[i]=PT.vy[i]*.96+70*dt;PT.rot[i]+=PT.rs[i]*dt}
  for(let i=spN-1;i>=0;i--){SP.life[i]-=dt;
    if(SP.life[i]<=0){const l=--spN;if(i!==l){SP.x[i]=SP.x[l];SP.y[i]=SP.y[l];SP.vx[i]=SP.vx[l];SP.vy[i]=SP.vy[l];SP.life[i]=SP.life[l];SP.max[i]=SP.max[l];SP.sz[i]=SP.sz[l];SP.col[i]=SP.col[l]}continue}
    SP.x[i]+=SP.vx[i]*dt;SP.y[i]+=SP.vy[i]*dt;SP.vx[i]*=.97;SP.vy[i]=SP.vy[i]*.97+300*dt}
  for(let i=cnN-1;i>=0;i--){CN.t[i]+=dt;
    if(CN.t[i]>=CN.dur[i]){const l=--cnN;if(i!==l){CN.x0[i]=CN.x0[l];CN.y0[i]=CN.y0[l];CN.cx[i]=CN.cx[l];CN.cy[i]=CN.cy[l];CN.t[i]=CN.t[l];CN.dur[i]=CN.dur[l];CN.sz[i]=CN.sz[l]}}}
  for(let i=grN-1;i>=0;i--){GR.life[i]-=dt*1.4;if(GR.life[i]<=0){const l=--grN;if(i!==l){GR.x[i]=GR.x[l];GR.y[i]=GR.y[l];GR.r0[i]=GR.r0[l];GR.life[i]=GR.life[l];GR.col[i]=GR.col[l]}}}
  if(chainPunchT>0)chainPunchT=Math.max(0,chainPunchT-dt*3);
  if(resultBurstT>0)resultBurstT=Math.max(0,resultBurstT-dt);
}
/* 세계 위에 그리는 신규 이펙트(scene) */
function drawVfxWorld(){
  for(let i=0;i<ptN;i++){const a=Math.min(1,PT.life[i]/PT.max[i]*2);
    ctx.save();ctx.globalAlpha=a*.95;ctx.translate(PT.x[i],PT.y[i]);ctx.rotate(PT.rot[i]);ctx.fillStyle=PT.col[i];
    ctx.beginPath();ctx.ellipse(0,0,PT.sz[i],PT.sz[i]*.55,0,0,6.283);ctx.fill();ctx.restore()}
  for(let i=0;i<spN;i++){const a=Math.max(0,SP.life[i]/SP.max[i]);
    ctx.globalAlpha=a;ctx.strokeStyle=SP.col[i];ctx.lineWidth=SP.sz[i];ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(SP.x[i],SP.y[i]);ctx.lineTo(SP.x[i]-SP.vx[i]*.03,SP.y[i]-SP.vy[i]*.03);ctx.stroke()}
  ctx.globalAlpha=1;ctx.lineCap="butt";
  if(cnN){const tg=coinTargetPos();
    for(let i=0;i<cnN;i++){const t=Math.max(0,CN.t[i]/CN.dur[i]),u=1-t,e=t*t*(3-2*t);
      /* 2차 베지어: 밭 → 위로 튀어 → 코인 칩. 끝에서 작아진다 */
      const x=u*u*CN.x0[i]+2*u*e*CN.cx[i]+e*e*tg.x,y=u*u*CN.y0[i]+2*u*e*CN.cy[i]+e*e*tg.y;
      const sz=CN.sz[i]*(1-e*.45);
      ctx.fillStyle="#f2a93b";ctx.beginPath();ctx.arc(x,y,sz,0,6.283);ctx.fill();
      ctx.fillStyle="#ffe08a";ctx.beginPath();ctx.arc(x-sz*.15,y-sz*.15,sz*.62,0,6.283);ctx.fill();
      ctx.fillStyle="#f2a93b";ctx.beginPath();ctx.arc(x-sz*.1,y-sz*.1,sz*.22,0,6.283);ctx.fill()}}
}
/* glow 층에 그리는 신규 이펙트(있을 때만) — 개화 꽃잎·불꽃·빛 고리·코인 스파클 */
function drawVfxGlow(q){
  for(let i=0;i<ptN;i++){if(!PT.emis[i])continue;const a=Math.min(1,PT.life[i]/PT.max[i]*2)*.45;
    q.save();q.globalAlpha=a;q.translate(PT.x[i],PT.y[i]);q.rotate(PT.rot[i]);q.fillStyle=PT.col[i];
    q.beginPath();q.ellipse(0,0,PT.sz[i],PT.sz[i]*.55,0,0,6.283);q.fill();q.restore()}
  for(let i=0;i<spN;i++){const a=Math.pow(Math.max(0,SP.life[i]/SP.max[i]),.4);/* 글로우만 완만한 감쇠(깜빡임 6항: 8프레임 max/min ≤1.5) */
    q.globalAlpha=a;q.strokeStyle=SP.col[i];q.lineWidth=SP.sz[i]*1.2;q.lineCap="round";
    q.beginPath();q.moveTo(SP.x[i],SP.y[i]);q.lineTo(SP.x[i]-SP.vx[i]*.03,SP.y[i]-SP.vy[i]*.03);q.stroke()}
  for(let i=0;i<grN;i++){const l=GR.life[i],r=GR.r0[i]+(1-l)*view.cell*1.1;
    q.globalAlpha=l*l*.9;q.strokeStyle=GR.col[i];q.lineWidth=2+l*4;q.beginPath();q.arc(GR.x[i],GR.y[i],r,0,6.283);q.stroke()}
  if(cnN){const tg=coinTargetPos();
    for(let i=0;i<cnN;i++){const t=Math.max(0,CN.t[i]/CN.dur[i]),u=1-t,e=t*t*(3-2*t);
      const x=u*u*CN.x0[i]+2*u*e*CN.cx[i]+e*e*tg.x,y=u*u*CN.y0[i]+2*u*e*CN.cy[i]+e*e*tg.y;
      q.globalAlpha=.45*(1-e*e);/* HUD 도착 직전 글로우 페이드(도착 순간 계단식 소멸 방지) */q.fillStyle="#ffe6a0";q.beginPath();q.arc(x,y,CN.sz[i]*(1-e*.45)*.8,0,6.283);q.fill()}}
  q.globalAlpha=1;q.lineCap="butt";
}`);

/* ───────────────────────── E9. draw — 블룸 파이프라인(scene → glow → 합성 → 글자) ───────────────────────── */
replaceBlock('E9 draw', 'function draw(){', '/* ============================================================ HUD DOM == */',
`function draw(){
  const w=view.w,h=view.h,tm=performance.now()/1000;
  const sc=POST?POST.begin(w,h,view.dpr):null;
  ctx=sc||ctxMain;
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  const p=envPalette();
  drawSky(w,h,tm,p);
  if(sc){const sea=stage?stage.sea:ambientSeason,sx=w*(.14+p.dusk*.74),sy=h*(.26-Math.sin(p.dusk*Math.PI)*.11);drawSkyGlow(POST.gctx,w,h,tm,p,sea,sx,sy)}
  if(screen==="title"||screen==="tut"||screen==="result"){
    /* menu backdrop: a living showcase bed of the game's real crops, so the very
       first screen already shows what is being grown. Two staggered rows. */
    const scale=Math.min(w,h)*(view.compact?.075:.062);
    const count=view.compact?6:10;
    for(let row=0;row<2;row++){
      const band=h*(row?.945:.795),sc2=scale*(row?1.25:1);
      for(let i=0;i<count+row;i++){
        const idx=(i*5+row*3+((tm/11)|0)*2)%CROPS.length;
        const x=w*((i+.5+row*.4)/(count+row))+Math.sin(tm*.3+i+row)*7;
        const y=band+Math.sin(i*1.7+row)*h*.018;
        ctx.globalAlpha=row?.95:.7;
        drawCropOn(ctx,idx,1,x,y,sc2*(1+(i%3)*.12),tm,false);
      }
    }
    ctx.globalAlpha=1;
  }
  if(screen==="play"||screen==="pause"){
    drawBoard(tm);
    for(const r of rings){const a=Math.max(0,r.life/r.max);ctx.globalAlpha=a*a*.55;ctx.strokeStyle=r.color;
      ctx.lineWidth=2+2*a;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,6.283);ctx.stroke()}
    ctx.globalAlpha=1;
    for(const q of particles){ctx.globalAlpha=Math.max(0,q.life/q.max);ctx.fillStyle=q.color;
      ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,6.283);ctx.fill()}
    ctx.globalAlpha=1;
  }
  if(ptN||spN||cnN)drawVfxWorld();
  if(sc){if(ptN||spN||cnN||grN)drawVfxGlow(POST.gctx);POST.end()}
  /* 글자 층 — #game(블룸 뒤). 블룸이 꺼져 있으면 같은 캔버스에 이어 그린다. */
  ctx=ctxMain;ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  if(sc)ctx.clearRect(0,0,w,h);
  if((screen==="play"||screen==="pause")&&floaters.length){
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
    for(const f of floaters){
      const a=Math.max(0,f.life/f.max),k=1-a,pop=k<.25?1+Math.sin(k/.25*Math.PI)*.28:1;
      ctx.globalAlpha=Math.min(1,a*1.5);
      const fs=Math.max(13,view.cell*(f.big?.2:.14))*pop;
      ctx.font="700 "+fs+"px "+FONT;
      ctx.lineWidth=Math.max(3,view.cell*.045);
      ctx.strokeStyle="rgba(2,18,15,.8)";ctx.strokeText(f.text,f.x,f.y);
      ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);
    }
    ctx.globalAlpha=1;
  }
}

`);

/* ───────────────────────── E10. 출석 오버레이 표시 — 7칸 사이클 스트립(금액 표기) + 읽기 전용 뷰 훅 ───────────────────────── */
replaceBlock('E10 refreshAttend', 'function refreshAttend(st){', '/* ---- 출석 오버레이 열고/닫기',
`function refreshAttend(st){
  pendingAttend=st;
  $("aKicker").textContent=t("attendTitle");
  $("aDay").textContent=fmt(t("attendDay"),{n:st.day});
  $("aReward").textContent=fmt(t("attendReward"),{n:st.reward});
  $("aDesc").textContent=t("attendDesc");
  $("aClaim").textContent=t("attendClaim");
  /* 7칸 사이클 스트립: 받은 날 체크(민트), 오늘(받을 칸) 강조, 7일 칸 크게(골드) — 칸마다 보상 금액(ATN_CURVE 읽기만). */
  const row=$("aBadges");row.innerHTML="";
  for(let i=1;i<=ATN_CURVE.length;i++){
    const done=i<st.cappedDay,today=i===st.cappedDay;
    const b=document.createElement("span");b.className="aBadge"+(done?" on":"")+(today?" today":"")+(i===ATN_CURVE.length?" last":"");
    b.innerHTML='<i></i><em></em><b></b>';
    b.querySelector("em").textContent=String(i);b.querySelector("b").textContent="+"+ATN_CURVE[i-1];
    b.setAttribute("aria-hidden","true");row.appendChild(b);
  }
  row.setAttribute("aria-label",fmt(t("attendBadges"),{n:st.cappedDay,total:ATN_CURVE.length}));
}
/* 출석표 읽기 전용 뷰(public/game/attend-ui.js 가 홈 카드·정원 지도에 그린다). 판정은 attendanceStatus()(무접촉)가 한다.
   open() 은 부팅과 같은 경로(claimable 일 때만 기존 오버레이) — 지급은 여전히 #aClaim → claimAttendance() 뿐이다. */
function attendView(){
  const st=attendanceStatus();
  return {claimable:st.claimable,day:st.day,cappedDay:st.claimable?st.cappedDay:Math.min(st.day,ATN_CURVE.length),
    reward:st.claimable?st.reward:0,curve:ATN_CURVE.slice(),today:st.today,lastDate:save.atnDate,lang:curLang,open:attendOpen};
}
try{window.__bloomAttend={view:attendView,open(){const st=attendanceStatus();if(st.claimable&&!attendOpen){refreshAttend(st);openAttend()}}}}catch(_){}

`);

/* ───────────────────────── E11. 출석 지급 효과음(지급 로직은 무접촉 — 효과음 한 줄만) ───────────────────────── */
patch('E11 claim sfx',
`  if(got){SFX.goal();toast(fmt(t("attendReward"),{n:got.reward}))}`,
`  if(got){SFX.claim();toast(fmt(t("attendReward"),{n:got.reward}))}`);

/* ───────────────────────── E12. 튜토리얼 아트 — 서체만 디스플레이체로 ───────────────────────── */
patch('E12 tut font 1', `g.fillStyle="rgba(255,209,102,.85)";g.font="900 34px system-ui";`, `g.fillStyle="rgba(255,209,102,.85)";g.font="700 34px "+FONT;`);
patch('E12 tut font 2', `g.fillStyle="#8ae6ff";g.font="900 22px system-ui";`, `g.fillStyle="#8ae6ff";g.font="700 22px "+FONT;`);
patch('E12 tut font 3', `g.fillStyle="#ffd166";g.font="900 19px system-ui";g.fillText("x1   x2   x3",W/2,24);`, `g.fillStyle="#ffd166";g.font="700 19px "+FONT;g.fillText("x1   x2   x3",W/2,24);`);
patch('E12 tut font 4', `    g.font="900 17px system-ui";\n    for(let i=0;i<3;i++){`, `    g.font="700 17px "+FONT;\n    for(let i=0;i<3;i++){`);

/* ───────────────────────── E13. 루프 — vfx 스텝·관찰·품질 감시(업데이트 캐던스는 verbatim) ───────────────────────── */
patch('E13 loop',
`  if(layoutDirty){layoutDirty=false;resize()}
  /* the long scrolling menus don't need a 60fps canvas behind them */
  if(screen==="map"||screen==="lab"){if(now-menuDrawAt>50){menuDrawAt=now;draw()}}
  else draw();`,
`  if(layoutDirty){layoutDirty=false;resize()}
  stepVfx(delta);observeEvents();
  if(POST&&screen==="play"&&running)POST.sample(delta*1000);
  if(POST&&screen!=="play")syncDpr();
  /* the long scrolling menus don't need a 60fps canvas behind them — 일시정지(정적 보드)도 20Hz. 타이틀·결과는 살아 있는 정원 배경이라 60. */
  if(screen==="map"||screen==="lab"||screen==="pause"){if(now-menuDrawAt>50){menuDrawAt=now;draw()}}
  else draw();`);

/* 블룸 품질이 내려가면 DPR 상한이 바뀐다 → 캐시 무효화 + 리사이즈(기하 로직은 resize 그대로) */
patch('E13 quality hook',
`resize();

let last=performance.now(),acc=0,hudAt=0,menuDrawAt=0;`,
`resize();
/* 품질 강등 → DPR 상한 변경은 «플레이 밖»에서만 반영(플레이 중 DPR 고정, 네온 3차 규격). 스프라이트 캐시는 dpr 키라 그때 같이 비운다. */
function syncDpr(){if(!POST||!POST.refreshCap())return;skyKey=skyKey2="";plateKey="";bedCache.clear();headCache.clear();for(const k in fgCache)delete fgCache[k];for(const k in cloudCache)delete cloudCache[k];layoutDirty=true}
syncDpr();
draw(); /* 첫 프레임을 rAF 전에 동기로 그린다 — 빈 캔버스가 한 프레임도 보이지 않게 */

let last=performance.now(),acc=0,hudAt=0,menuDrawAt=0;`);

writeFileSync(OUT, crlf ? js.replace(/\n/g, '\r\n') : js);
console.log(`patched ${log.length} blocks → ${OUT}\n  ` + log.join('\n  '));
