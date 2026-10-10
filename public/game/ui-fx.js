/* 피고지고 — 결과 카드 숫자 카운트업 (2026-08-30). «읽기 전용», 의존성 0.
   게임의 showResult()(무접촉)가 #rStats 에 행을 채우면 그 «다음 프레임»에 숫자만 0 → 값으로 400ms 이징한다.
   값은 DOM 에 이미 최종값으로 «먼저» 쓰여 있다 — 스크립트가 죽어도, 감속 모드여도 최종값이 보인다(깜빡임·빈 칸 없음). */
(function(){
"use strict";
var reduce=false;try{reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches}catch(_){}
function ease(t){return 1-Math.pow(1-t,3)}
function countUp(el){
  var txt=el.textContent||"",m=/^([^\d-]*)(-?\d[\d,]*)(.*)$/.exec(txt);
  if(!m)return;
  var pre=m[1],num=parseInt(m[2].replace(/,/g,""),10),post=m[3];
  if(!isFinite(num)||num===0||Math.abs(num)<10)return;
  var t0=performance.now(),dur=400+Math.min(400,Math.log10(Math.abs(num))*90);
  function step(now){
    if(el.textContent!==txt&&el.__cu!==txt)return; /* 다른 값으로 바뀌었으면 중단 */
    var k=Math.min(1,(now-t0)/dur),v=Math.round(num*ease(k));
    el.__cu=txt;el.textContent=pre+v+post;
    if(k<1)requestAnimationFrame(step);else{el.textContent=txt;el.__cu=undefined}
  }
  requestAnimationFrame(step);
}
function boot(){
  var host=document.getElementById("rStats");
  if(!host||typeof MutationObserver!=="function"||reduce)return;
  new MutationObserver(function(){
    var sc=document.getElementById("scResult");if(!sc||sc.classList.contains("hidden"))return;
    var bs=host.querySelectorAll("b");
    for(var i=0;i<bs.length;i++)(function(el,i){setTimeout(function(){countUp(el)},60+i*50)})(bs[i],i);
  }).observe(host,{childList:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
