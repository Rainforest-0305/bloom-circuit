/* Bloom Circuit — post-process layer (bloom). 2026-08-30 그래픽 고도화(네온 스레드 파일럿·프리즘 그리드 기법 재사용) / 3판(깜빡임 6항).
   게임 로직은 이 파일을 «모른다». 게임은 세계(하늘·밭·작물·파티클)를 2D 캔버스(scene)에 그리고,
   «빛나야 하는 것»(익은 작물의 후광·개화 꽃잎·수확 불꽃·노을 해)만 반해상도 glow 캔버스에 따로 그린다.
   이 레이어는 두 비트맵을 WebGL 텍스처로 받아  bright(scene, 문턱 매우 높음) + glow  → 1/4·1/8 블러 2겹 → 가산 합성한다.
   정원은 «밝은 낮 장면»이라 프리즘처럼 밝기 문턱만으로는 하늘이 통째로 번진다 — 그래서 glow «입력층»이 주역이고
   scene 밝기 문턱(.985)은 순백 코어만 잡는다. 글자(점수 팝·토스트)는 원래 #game 캔버스(투명)에 블룸 «뒤에» 그린다.
   세계는 scene 한 층에만 그려지고 #game 은 clearRect 뒤 글자만 — 같은 것을 두 층에 그리지 않는다(층 간 지연 0).
   네온 2차 교훈(실기기 iPhone DPR3 프레임 저하) 반영:
     · scene 캔버스 DPR 상한 2 (품질 1 단계에서는 1.5) — 단, «플레이 중에는 절대 안 바뀐다»(dprCap 잠금, 아래)
     · bright-pass 를 «1/2 해상도»에서 시작(품질 2) / 1/4 직행(품질 1)
     · 동적 품질 3단계: 2(풀) → 1(경량) → 0(꺼짐). 판정은 렌더에만 영향.
   깜빡임 방지 6항(네온 3차 규격, 이 파일이 지키는 것):
     1. 히스테리시스 — 전환 뒤 최소 체류 8s(480프레임, 세션 첫 전환만 즉시) · 회복은 15s(10창×90프레임) 조용해야 · 세션당 승격 ≤2회
     2. 크로스페이드 — 가중 k1/k2 는 400ms smoothstep 으로만 움직인다(즉시 점프 없음). 완전 off 도 k→0 페이드 뒤에 숨긴다
     3. 플레이 중 DPR 고정 — dprCap() 은 잠긴 값(P.cap)만 돌려주고, 게임이 플레이 밖에서 refreshCap() 을 불러야 바뀐다
     4. 두 층 금지 — 세계는 scene 한 층(위 설명), 합성은 scene 1:1 NEAREST 복사 + 블러 가산
     5. soft-knee — bright-pass 는 다운샘플 «전» 텍셀 «각각»에 soft-knee 문턱 → 평균(면적 비례·위상 무관), 프래그먼트 highp
     6. 폴백 불가역 — 컨텍스트 손실·자동 off 는 세션 끝까지 되돌리지 않는다(복구 이벤트 무시, 0→승격 없음)
   WebGL 이 없으면 init() 이 false 를 돌려주고 게임은 예전 경로(단일 캔버스)로 그린다. */
(function(){
"use strict";
/* 네온 3차 교훈(깜빡임 원인 실측): 다운샘플 «평균 뒤» 하드 문턱은 얇은 선이 블록 경계에 걸리는 위상마다 블록 휘도가
   문턱을 넘나들어 이동 시 블룸이 켜졌다 꺼졌다 한다. → 문턱은 다운샘플 «전» 텍셀 «각각»에 soft-knee 로 걸고 평균한다
   (에너지가 덮는 면적에 비례, 위상 무관). 프래그먼트 highp(지원 시) — iOS mediump=fp16 은 1/1400 텍셀 좌표가 양자화된다.
   전해상도 샘플 좌표는 varying 대신 gl_FragCoord(항상 highp), scene 텍스처는 NEAREST(1:1 정확 복사). */
var PREC="#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";
var VS="attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";
/* bright pass + N×N 다운샘플(N=2: 1/2 해상도, N=4: 1/4 직행). 출력 텍셀 하나 = 원본 N×N 블록. 텍셀마다 soft-knee 문턱 → 평균.
   원본은 위가 0행(캔버스 업로드), FBO 는 아래가 0행이라 y 를 여기서 뒤집는다. glow 입력층(반해상도 투명 캔버스, 문턱 없음)은
   블록 중심에서 bilinear 1회 — 그 자체가 면적 평균이라 위상 무관. rgb*a 로 읽는다(비프리멀티플라이 업로드). */
function fsBright(N){return PREC+"uniform sampler2D s;uniform sampler2D g;uniform vec2 res;uniform float thr;uniform float knee;uniform float gk;"+
"vec3 br(vec2 t){vec3 c=texture2D(s,t).rgb;float l=dot(c,vec3(.2126,.7152,.0722));float k=clamp((l-thr)/knee,0.,1.);k=k*k*(3.-2.*k);return c*k;}"+
"void main(){vec2 b=floor(gl_FragCoord.xy)*"+N+".;float y0=res.y-b.y-"+N+".;vec3 a=vec3(0.);"+
"for(int j=0;j<"+N+";j++){for(int i=0;i<"+N+";i++){a+=br((vec2(b.x+float(i),y0+float(j))+.5)/res);}}"+
"vec2 uc=vec2(b.x+"+(N/2)+".,y0+"+(N/2)+".)/res;vec4 e=texture2D(g,vec2(uc.x,1.-uc.y));gl_FragColor=vec4(a*"+(1/(N*N))+"+e.rgb*e.a*gk,1.);}"}
var FS_DOWN=PREC+"varying vec2 v;uniform sampler2D s;uniform vec2 px;"+
"void main(){vec3 c=(texture2D(s,v+px*vec2(-.5,-.5)).rgb+texture2D(s,v+px*vec2(.5,-.5)).rgb+texture2D(s,v+px*vec2(-.5,.5)).rgb+texture2D(s,v+px*vec2(.5,.5)).rgb)*.25;gl_FragColor=vec4(c,1.);}";
var FS_BLUR=PREC+"varying vec2 v;uniform sampler2D s;uniform vec2 d;"+
"void main(){vec3 c=texture2D(s,v).rgb*.2270270270;"+
"c+=(texture2D(s,v+d*1.3846153846).rgb+texture2D(s,v-d*1.3846153846).rgb)*.3162162162;"+
"c+=(texture2D(s,v+d*3.2307692308).rgb+texture2D(s,v-d*3.2307692308).rgb)*.0702702703;gl_FragColor=vec4(c,1.);}";
var FS_COMP=PREC+"varying vec2 v;uniform sampler2D s;uniform sampler2D b1;uniform sampler2D b2;uniform vec2 res;uniform float k1;uniform float k2;"+
"void main(){vec2 u=gl_FragCoord.xy/res;vec3 c=texture2D(s,vec2(u.x,1.-u.y)).rgb+texture2D(b1,v).rgb*k1+texture2D(b2,v).rgb*k2;gl_FragColor=vec4(min(c,1.),1.);}";

var P={supported:false,on:false,auto:true,quality:2,threshold:.985,knee:.015,glowGain:.85,tight:.5,wide:.42,
  scene:null,sctx:null,glow:null,gctx:null,glc:null,gl:null,W:0,H:0,GW:0,GH:0,lost:false,frames:0,uploadMode:"",onQuality:null,
  downgrades:0,promos:0,qChanges:0,qlog:[],autoOff:false,fading:false,k1:.5,k2:.42,cap:2};
var prog={},fbo={},quad=null,sceneTex=null,glowTex=null,gl=null;
var FADE_MS=400;

function compile(type,src){
  var sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){throw new Error("shader: "+gl.getShaderInfoLog(sh))}
  return sh;
}
function link(fs){
  var p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,VS));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));
  gl.bindAttribLocation(p,0,"a");gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){throw new Error("link: "+gl.getProgramInfoLog(p))}
  var u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(var i=0;i<n;i++){var inf=gl.getActiveUniform(p,i);u[inf.name]=gl.getUniformLocation(p,inf.name)}
  return{p:p,u:u};
}
function makeTex(w,h,nearest){
  var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  var f=nearest?gl.NEAREST:gl.LINEAR;
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(w)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  return t;
}
function makeFbo(w,h){
  var t=makeTex(w,h),f=gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
  var ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  if(!ok)throw new Error("fbo incomplete");
  return{f:f,t:t,w:w,h:h};
}
function delFbo(o){if(!o)return;gl.deleteFramebuffer(o.f);gl.deleteTexture(o.t)}
/* 크기 변경 시에만 전체 재할당. 1/2 해상도 버퍼(h)는 품질에 따라 syncH() 가 따로 붙였다 뗀다 — 단계 전환이 scene/glow 텍스처를 건드리지 않게. */
function alloc(W,H){
  var w1=Math.max(1,Math.ceil(W/4)),h1=Math.max(1,Math.ceil(H/4)),w2=Math.max(1,Math.ceil(W/8)),h2=Math.max(1,Math.ceil(H/8));
  delFbo(fbo.h);fbo.h=null;delFbo(fbo.a1);delFbo(fbo.b1);delFbo(fbo.a2);delFbo(fbo.b2);
  fbo.a1=makeFbo(w1,h1);fbo.b1=makeFbo(w1,h1);fbo.a2=makeFbo(w2,h2);fbo.b2=makeFbo(w2,h2);
  if(sceneTex)gl.deleteTexture(sceneTex);
  if(glowTex)gl.deleteTexture(glowTex);
  sceneTex=makeTex(0,0,true);glowTex=makeTex(0,0);
  P.uploadMode="";
  P.W=W;P.H=H;
}
function syncH(){
  var want=P.quality>=2;
  if(want&&!fbo.h)fbo.h=makeFbo(Math.max(1,Math.ceil(P.W/2)),Math.max(1,Math.ceil(P.H/2)));
  else if(!want&&fbo.h){delFbo(fbo.h);fbo.h=null}
}
function pass(pr,target,bind){
  gl.useProgram(pr.p);
  gl.bindFramebuffer(gl.FRAMEBUFFER,target?target.f:null);
  gl.viewport(0,0,target?target.w:P.W,target?target.h:P.H);
  bind(pr.u);
  gl.drawArrays(gl.TRIANGLES,0,3);
}
function tex(unit,t){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t)}
function setupGL(){
  prog={};fbo={};sceneTex=null;glowTex=null;
  prog.bright2=link(fsBright(2));prog.bright4=link(fsBright(4));prog.down=link(FS_DOWN);prog.blur=link(FS_BLUR);prog.comp=link(FS_COMP);
  quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
  P.W=0;
}
function nowMs(){return(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now()}
function logQ(code,why){if(P.qlog.length<64)P.qlog.push([P.frames,code,why,Math.round(nowMs())])}
/* 6. 폴백은 한 번 결정·불가역: 컨텍스트를 잃으면 이 세션은 끝까지 단일 캔버스 경로. 복구 이벤트는 «듣지 않는다»(프레임 단위 왕복 금지). */
function drop(why){
  P.lost=true;P.on=false;P.fading=false;offPending=false;
  if(P.glc)P.glc.style.visibility="hidden";
  logQ(4,why);
  try{console.info("[bloom-post] bloom dropped for this session ("+why+")")}catch(_){}
  if(typeof P.onQuality==="function"){try{P.onQuality(0)}catch(_){}}
}

P.init=function(gameCanvas){
  try{
    if(typeof window==="undefined"||!window.WebGLRenderingContext)return false;
    if(/[?&]bloom=off\b/.test(location.search))return false;
    var q=/[?&]bloom=(\d)/.exec(location.search);if(q)P.quality=Math.max(1,Math.min(2,+q[1]));
    var glc=document.createElement("canvas");
    glc.id="bloomGL";glc.setAttribute("aria-hidden","true");
    glc.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0";
    var attrs={alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:"high-performance",failIfMajorPerformanceCaveat:false};
    gl=glc.getContext("webgl",attrs)||glc.getContext("experimental-webgl",attrs);
    if(!gl)return false;
    P.gl=gl;P.glc=glc;
    setupGL();
    P.scene=document.createElement("canvas");
    P.sctx=P.scene.getContext("2d",{alpha:false});
    P.glow=document.createElement("canvas");
    P.gctx=P.glow.getContext("2d");
    if(!P.sctx||!P.gctx)return false;
    gameCanvas.parentNode.insertBefore(glc,gameCanvas);
    glc.addEventListener("webglcontextlost",function(e){e.preventDefault();drop("context lost")},false);
    P.k1=P.tight;P.k2=P.wide;kFrom=[P.k1,P.k2];kTo=[P.k1,P.k2];
    P.supported=true;P.on=true;
    return true;
  }catch(e){try{console.warn("[bloom-post] disabled:",e&&e.message)}catch(_){}P.supported=false;P.on=false;return false}
};
/* 3. scene 캔버스 DPR 상한: 품질 2 → 2, 품질 1 → 1.5, 꺼짐 → 2(게임 기본).
   ★플레이 중 DPR 고정: dprCap() 은 «잠긴 값»(P.cap)을 돌려주고, 게임이 플레이 밖에서 refreshCap() 을 불러야 바뀐다
   (품질 강등이 판 한가운데서 해상도를 바꾸면 그 프레임에 스프라이트 캐시가 전부 재래스터되고 그림이 «튄다»). */
P.capNow=function(){return(P.supported&&P.on&&P.quality===1)?1.5:2};
P.dprCap=function(){return P.cap};
P.refreshCap=function(){var c=P.capNow();if(c===P.cap)return false;P.cap=c;return true};
/* 프레임 시작: 세계를 그릴 2D 컨텍스트(블룸 켜짐) 또는 null(꺼짐 → 게임이 #game 에 직접).
   glow 캔버스는 반해상도(품질 1 은 1/4). 게임은 P.gctx 에 «빛나는 것»만 그린다(좌표계 = CSS px, 변환은 여기서). */
P.begin=function(w,h,dpr){
  if(!P.supported||!P.on||P.lost)return null;
  var W=Math.max(1,Math.round(w*dpr)),H=Math.max(1,Math.round(h*dpr));
  var gs=P.quality>=2?.5:.25,GW=Math.max(1,Math.round(W*gs)),GH=Math.max(1,Math.round(H*gs));
  if(P.scene.width!==W||P.scene.height!==H){P.scene.width=W;P.scene.height=H}
  if(P.glow.width!==GW||P.glow.height!==GH){P.glow.width=GW;P.glow.height=GH;P.uploadMode=""}
  if(P.glc.width!==W||P.glc.height!==H){P.glc.width=W;P.glc.height=H}
  if(P.W!==W||P.H!==H)alloc(W,H);
  syncH();
  P.GW=GW;P.GH=GH;
  P.sctx.setTransform(dpr,0,0,dpr,0,0);
  P.gctx.setTransform(1,0,0,1,0,0);P.gctx.clearRect(0,0,GW,GH);
  P.gctx.setTransform(dpr*gs,0,0,dpr*gs,0,0);
  return P.sctx;
};
/* 2. 가중 크로스페이드: 전환은 k1/k2 400ms smoothstep. 완전 off 는 k→0 이 끝난 «다음»에야 GL 을 숨긴다. */
var kFrom=[.5,.42],kTo=[.5,.42],fadeT0=0,offPending=false;
function retarget(k){kFrom=[P.k1,P.k2];kTo=k;fadeT0=nowMs();P.fading=true}
function stepFade(){
  if(!P.fading)return;
  var a=(nowMs()-fadeT0)/FADE_MS;if(a>=1){a=1;P.fading=false}
  a=a*a*(3-2*a);
  P.k1=kFrom[0]+(kTo[0]-kFrom[0])*a;P.k2=kFrom[1]+(kTo[1]-kFrom[1])*a;
  if(!P.fading&&offPending){offPending=false;P.autoOff=true;P.on=false;if(P.glc)P.glc.style.visibility="hidden";
    try{console.info("[bloom-post] bloom off for this session")}catch(_){}}
}
/* 프레임 끝: 업로드 2장 → bright+glow(1/2 또는 1/4) → 블러 2겹 → 합성. */
P.end=function(){
  if(!P.supported||!P.on||P.lost)return;
  stepFade();
  var W=P.W,H=P.H;
  tex(0,sceneTex);
  if(P.uploadMode!=="sub"){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,P.scene)}
  else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,P.scene);
  tex(1,glowTex);
  if(P.uploadMode!=="sub"){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,P.glow);P.uploadMode="sub"}
  else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,P.glow);
  var h=fbo.h,a1=fbo.a1,b1=fbo.b1,a2=fbo.a2,b2=fbo.b2;
  var bindBright=function(u){tex(0,sceneTex);tex(1,glowTex);gl.uniform1i(u.s,0);gl.uniform1i(u.g,1);gl.uniform2f(u.res,W,H);gl.uniform1f(u.thr,P.threshold);gl.uniform1f(u.knee,P.knee);gl.uniform1f(u.gk,P.glowGain)};
  if(h){
    pass(prog.bright2,h,bindBright);
    pass(prog.down,a1,function(u){tex(0,h.t);gl.uniform1i(u.s,0);gl.uniform2f(u.px,1/h.w,1/h.h)});
  }else{
    pass(prog.bright4,a1,bindBright);
  }
  pass(prog.blur,b1,function(u){tex(0,a1.t);gl.uniform1i(u.s,0);gl.uniform2f(u.d,1/a1.w,0)});
  pass(prog.blur,a1,function(u){tex(0,b1.t);gl.uniform1i(u.s,0);gl.uniform2f(u.d,0,1/a1.h)});
  pass(prog.down,a2,function(u){tex(0,a1.t);gl.uniform1i(u.s,0);gl.uniform2f(u.px,1/a1.w,1/a1.h)});
  pass(prog.blur,b2,function(u){tex(0,a2.t);gl.uniform1i(u.s,0);gl.uniform2f(u.d,1/a2.w,0)});
  pass(prog.blur,a2,function(u){tex(0,b2.t);gl.uniform1i(u.s,0);gl.uniform2f(u.d,0,1/a2.h)});
  pass(prog.comp,null,function(u){tex(0,sceneTex);tex(1,a1.t);tex(2,a2.t);gl.uniform1i(u.s,0);gl.uniform1i(u.b1,1);gl.uniform1i(u.b2,2);gl.uniform2f(u.res,W,H);gl.uniform1f(u.k1,P.k1);gl.uniform1f(u.k2,P.k2)});
  P.frames++;
};
/* 단계 전환(내부). 0 은 «페이드 뒤 off, 불가역». 0 에서 위로는 절대 못 간다. */
function setQ(nq,why){
  nq=Math.max(0,Math.min(2,nq|0));
  if(!P.supported||P.lost||P.autoOff||offPending)return;
  if(nq===P.quality)return;
  P.quality=nq;P.qChanges++;dwell=0;good=0;
  logQ(nq,why);
  if(nq===0){offPending=true;retarget([0,0])}
  else retarget([P.tight,P.wide]);
  try{console.info("[bloom-post] quality -> "+nq+" ("+why+")")}catch(_){}
  if(typeof P.onQuality==="function"){try{P.onQuality(nq)}catch(_){}}
}
P.setQuality=function(q){setQ(q,"manual")};
P.setEnabled=function(v){P.setQuality(v?2:0)};
/* 1. 60fps 감시(히스테리시스). 게임이 플레이 중 프레임 간격(ms)을 매 프레임 넣어준다. 90프레임(1.5s) 비중첩 창마다 22ms 초과 수를 센다:
     > 22/90(25%) → 한 단계 강등(2→1→0). 단, 직전 전환 뒤 «최소 체류 480프레임(8s)»(세션 첫 전환만 즉시).
     ≤ 2/90 인 창이 10개 연속(900프레임 = 15s) → 1→2 회복. 체류 8s 충족 + 세션당 승격 ≤2회. 0(off) 에서는 회복 없음(불가역).
     새 런(표본 공백 500ms 초과) 뒤 첫 60프레임은 버린다 — 스테이지 진입 시 스프라이트 캐시 래스터·JIT 스파이크로 강등되지 않게.
   판정은 렌더에만 영향 — 게임 로직·판정과 무관. */
var win=new Float32Array(90),wi=0,wn=0,dwell=1e9,good=0,warm=0,lastT=0;
var DWELL=480,GOOD_WIN=10,PROMO_MAX=2,WARM=60,BAD_MAX=22,GOOD_MAX=2;
P.sample=function(ms){
  if(!P.auto||!P.on||offPending||P.lost)return;
  var t=nowMs();if(t-lastT>500){warm=WARM;wn=0;wi=0;good=0}lastT=t;
  if(warm>0){warm--;return}
  dwell++;
  win[wi]=ms;wi=(wi+1)%90;if(wn<90)wn++;
  if(wn<90)return;
  var bad=0;for(var i=0;i<90;i++)if(win[i]>22)bad++;
  wn=0;wi=0;
  if(bad>BAD_MAX){good=0;if(P.quality>0&&dwell>=DWELL){P.downgrades++;setQ(P.quality-1,"bad "+bad+"/90")}}
  else if(bad<=GOOD_MAX){if(++good>=GOOD_WIN){good=0;if(P.quality===1&&dwell>=DWELL&&P.promos<PROMO_MAX){P.promos++;setQ(2,"good "+GOOD_WIN+"x90 #"+P.promos)}}}
  else good=0;
};
P.resetWindow=function(){wn=0;wi=0;good=0;warm=WARM};
window.BloomPost=P;
})();
