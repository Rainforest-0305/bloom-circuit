/* 피고지고 — 출석표 UI (2026-08-30). «읽기 전용».
   규칙·판정·지급은 게임(bloom-circuit-game.js: attendanceStatus/claimAttendance/ATN_CURVE, 무접촉)이 소유한다.
   게임이 노출하는 window.__bloomAttend.view() 만 읽어 홈 카드에 7칸 사이클 스트립을, 정원 지도에 한 줄 미니 칩을 그린다.
   받기는 __bloomAttend.open() → 게임의 기존 오버레이(#scAttend → #aClaim → claimAttendance) 경로 그대로다.
   훅이 없으면(옛 빌드·실패) 아무것도 그리지 않는다 — 옛 세이브 호환은 게임의 loadSave 가 이미 보장한다(atnDate/atnStreak 기본값). */
(function(){
"use strict";
var CYCLE=7;
var T={
  ko:{title:"출석 보상",titleN:function(n){return"출석 "+n+"일째"},sub:function(d){return d+"/"+CYCLE+"일"},
      claim:"받기",footClaim:function(r){return"오늘 <b>정수 +"+r+"</b> 받을 수 있어요"},
      foot:function(next){return"내일 오면 <b>정수 +"+next+"</b>"},footMax:function(r){return"매일 <b>정수 +"+r+"</b> · 연속 기록 유지 중"},
      footEmpty:"매일 들르면 정수를 받아요",mini:function(n,d){return"출석 <b>"+n+"일째</b> · "+d+"/"+CYCLE},miniClaim:function(r){return"오늘 출석 보상 <b>+"+r+"</b> 대기"},aria:"출석표"},
  en:{title:"Daily reward",titleN:function(n){return"Day "+n+" streak"},sub:function(d){return d+"/"+CYCLE},
      claim:"Collect",footClaim:function(r){return"<b>+"+r+" Essence</b> is waiting today"},
      foot:function(next){return"Come back tomorrow for <b>+"+next+" Essence</b>"},footMax:function(r){return"<b>+"+r+" Essence</b> every day · streak alive"},
      footEmpty:"Drop by every day to collect Essence",mini:function(n,d){return"Streak <b>day "+n+"</b> · "+d+"/"+CYCLE},miniClaim:function(r){return"Daily reward <b>+"+r+"</b> waiting"},aria:"Attendance"}
};
function lang(){return(document.documentElement.lang||"ko").slice(0,2)==="en"?"en":"ko"}
var strip=null,mini=null,lastSig="";
function build(){
  var card=document.getElementById("titleCard"),stats=card&&card.querySelector(".titleStats"),btns=card&&card.querySelector(".titleBtns");
  if(btns&&!strip){
    strip=document.createElement("section");strip.className="attend";strip.id="attendStrip";
    strip.innerHTML='<div class="attend-head"><b id="attendTitle"></b><span id="attendSub"></span></div><div class="attend-days" id="attendDays"></div><div class="attend-foot"><span id="attendFoot"></span></div>';
    btns.insertAdjacentElement("beforebegin",strip);
  }
  var sub=document.getElementById("mapSub");
  if(sub&&!mini){mini=document.createElement("div");mini.className="attend-mini";mini.id="attendMini";sub.insertAdjacentElement("afterend",mini)}
}
function render(){
  var api=window.__bloomAttend;if(!api||typeof api.view!=="function")return;
  var v;try{v=api.view()}catch(_){return}
  if(!v||!v.curve||!v.curve.length)return;
  build();if(!strip)return;
  var L=T[lang()],n=v.day|0,d=v.cappedDay|0,cl=!!v.claimable,curve=v.curve;
  var sig=lang()+"|"+n+"|"+d+"|"+cl+"|"+v.open;
  if(sig===lastSig)return;lastSig=sig;
  strip.setAttribute("aria-label",L.aria);
  var hasRec=!!v.lastDate;
  document.getElementById("attendTitle").textContent=(hasRec||cl)&&n>0?L.titleN(n):L.title;
  document.getElementById("attendSub").textContent=L.sub(Math.min(d,CYCLE));
  var days=document.getElementById("attendDays"),h="";
  for(var i=1;i<=CYCLE;i++){
    /* claimable: 오늘 칸(d) 강조, 그 전은 done. 이미 받았음: d 까지 done, d 가 오늘. */
    var done=cl?i<d:(hasRec&&i<=d),today=i===d&&(cl||hasRec);
    var cls="ad"+(done?" done":"")+(today?" today":"")+(i===CYCLE?" last":"");
    h+='<div class="'+cls+'"'+(today?' aria-current="date"':'')+'><i></i><em>'+i+'</em><b>+'+curve[i-1]+'</b></div>';
  }
  days.innerHTML=h;
  var foot=document.getElementById("attendFoot"),fw=foot.parentNode,btn=fw.querySelector("button");
  if(cl){foot.innerHTML=L.footClaim(v.reward);
    if(!btn){btn=document.createElement("button");btn.type="button";btn.className="gold";btn.id="attendOpen";btn.addEventListener("click",function(){try{api.open()}catch(_){}});fw.appendChild(btn)}
    btn.textContent=L.claim;btn.hidden=false;
  }else{
    if(btn)btn.hidden=true;
    if(!hasRec)foot.innerHTML=L.footEmpty;
    else if(n>=CYCLE)foot.innerHTML=L.footMax(curve[CYCLE-1]);
    else foot.innerHTML=L.foot(curve[Math.min(n,CYCLE-1)]);
  }
  if(mini)mini.innerHTML="<i></i><span>"+(cl?L.miniClaim(v.reward):(hasRec?L.mini(n,Math.min(d,CYCLE)):L.footEmpty))+"</span>";
}
function boot(){
  render();
  /* 게임은 sdk-boot 가 «나중에» 동적 로드한다 → 훅이 붙을 때까지 500ms 간격 재시도(최대 30초). 이후엔 상태 변화 지점에서만 다시 그린다. */
  var k=0,tm=setInterval(function(){render();if(window.__bloomAttend&&++k>=6)clearInterval(tm);if(k>=60)clearInterval(tm)},500);
  if(typeof MutationObserver==="function"){
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    var ov=document.getElementById("scAttend");if(ov)new MutationObserver(render).observe(ov,{attributes:true,attributeFilter:["class"]});
    var ess=document.getElementById("tEssVal");if(ess)new MutationObserver(render).observe(ess,{childList:true,characterData:true,subtree:true});
    var map=document.getElementById("scMap");if(map)new MutationObserver(render).observe(map,{attributes:true,attributeFilter:["class"]});
  }
  document.addEventListener("visibilitychange",function(){if(!document.hidden){lastSig="";render()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
