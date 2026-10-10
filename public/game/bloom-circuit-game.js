(() => {
"use strict";
/* =========================================================================
   BLOOM CIRCUIT — single-file garden management game.
   No external resources: all art is Canvas/CSS, all audio is WebAudio synth.
   ========================================================================= */

/* ---------------------------------------------------------------- i18n -- */
const I18N={"ko":{"name":"KO","title":"피고지고","tagline":"사계절 내내 살아 숨 쉬는 정원을 가꾸세요. 수확을 쉼 없이 이어 연쇄를 쌓고, 날씨를 읽어 모든 밭을 뜻대로 다스리세요.","play":"플레이","cont":"이어하기","map":"정원 지도","retry":"다시 도전","next":"다음 스테이지","resume":"계속하기","restart":"스테이지 재시작","quitStage":"나가기","back":"뒤로","upgrades":"온실 연구소","howTo":"플레이 방법","ariaGame":"피고지고 정원 보드","ariaSound":"소리 켜기/끄기","ariaPause":"게임 일시정지","ariaBack":"뒤로 가기","stageSelect":"정원 지도","stageSub":"스테이지를 고르세요. 클리어하면 다음 스테이지와 새 씨앗이 열립니다.","stageWord":"스테이지","locked":"잠김","unlockAt":"스테이지 {n} 클리어 필요","totalStars":"별","essence":"정수","stagesLbl":"클리어","gCoin":"코인 {n}개 동시 보유","gEarn":"코인 {n}개 누적 획득","gHarv":"작물 {n}개 수확","gCrop":"{c} {n}개 수확","gChain":"{n}연쇄 달성","gPure":"작물이 하나도 시들지 않게 하기","gVary":"서로 다른 작물 {n}종 수확","gFull":"모든 밭을 동시에 채우기 {n}회","limTime":"{n}초","limMoves":"행동 {n}회","movesLeft":"행동","hCoins":"코인","hTime":"시간","hWeather":"날씨","hCombo":"연쇄","sGrow":"성장","sValue":"가치","noCoins":"코인이 부족합니다","withered":"작물이 시들었습니다","ripe":"수확!","tend":"돌보기","goalDone":"목표 달성!","allDone":"모든 목표 달성!","paused":"일시정지","pausedKick":"잠시 쉬어가기","resumeHint":"정원은 멈춘 그 자리에서 기다리고 있습니다.","hintPlant":"아래에서 씨앗을 고르고 빈 밭을 누르세요","hintTend":"자라는 작물을 눌러 성장을 앞당기세요","hintHarvest":"반짝이는 작물을 눌러 수확하세요","stoneMsg":"돌을 치웠습니다","stoneNeed":"이 돌을 치우려면 코인 {n}개가 필요합니다","rWin":"스테이지 클리어!","rLose":"스테이지 실패","rKicker":"시장 결산","rScore":"점수","rCoins":"획득 코인","rHarv":"수확 횟수","rCombo":"최대 연쇄","rTime":"남은 시간","rStars":"별","rEssence":"획득 정수","rNewBest":"최고 점수 경신!","rNewCrop":"새 씨앗 해금: {c}","rFailTime":"목표를 모두 달성하기 전에 시간이 끝났습니다.","rFailMoves":"행동 횟수를 모두 소진했습니다.","rFailPure":"작물이 시들어 버렸습니다.","labTitle":"온실 연구소","labSub":"정수를 써서 영구 연구를 완성하세요. 계열마다 정원을 다루는 방식이 달라집니다.","uBuy":"연구","uOwned":"적용 중","uLocked":"위 연구가 필요합니다","uNoEssence":"정수가 부족합니다","uDone":"연구 완료","branches":["성장","재화","기술"],"chapters":["새싹 테라스","황금 들판","안개 고원","오로라 온실","두 번째 봄","다시, 만개"],"chapterSub":["흙과 햇살의 리듬을 익히세요.","넓어진 밭, 더 큰 시장.","거친 날씨, 더 높은 목표.","마지막 겨울의 개화.","새 계절이 정원에 새 소란을 데려옵니다.","정원이 배운 모든 것을 한데 모읍니다."],"upg":["관개 수로","깊은 뿌리","유리 온실","자동 돌보미","선행 발아","시장 판로","종자 상인","황금손","종잣돈","횡재","빠른 손길","연쇄 장인","석공 도구","날씨 감각","해충 감시","화합 재배","단골 상인","정원의 리듬"],"upgD":["모든 작물이 14% 더 빠르게 자랍니다.","성장 속도가 16% 더 올라갑니다.","익은 작물이 55% 더 천천히 시듭니다.","7초마다 밭 하나를 자동으로 돌봐 줍니다.","심은 씨앗이 성장 18% 상태에서 시작합니다.","수확 판매가가 12% 오릅니다.","씨앗 값이 22% 싸집니다.","연쇄 1단계마다 판매가가 6% 오릅니다.","스테이지마다 코인 70개를 더 갖고 시작합니다.","한 판에서 8번째 수확마다 판매가가 두 배가 됩니다.","돌보기로 오르는 성장량이 55% 커집니다.","연쇄 유지 시간이 1.1초 늘어납니다.","돌 제거 비용이 60% 줄어듭니다.","날씨와 계절 보너스가 50% 강해집니다.","해충 반응 시간이 10초에서 14초로 늘어납니다.","인접 보너스가 40%에서 55%로 오릅니다.","주문서 등장 빈도와 보상이 각각 25% 늘어납니다.","인접 판정이 대각선 밭까지 확장됩니다."],"crops":["민트 새싹","이슬 고사리","불꽃 열매","산호 해초","빗물 난초","햇살 튤립","벨벳 이끼","별빛 꽃","황금 밀","달빛 백합","유령 양귀비","천둥 덩굴","서리 초롱꽃","황금 장미","프리즘 선인장","노바 해바라기","수정 담쟁이","하트 연꽃","서리 클로버","나비 난초","여름 딸기","월광 나비꽃"],"fx":["꾸준하고 믿음직합니다.","돌보면 성장이 두 배로 오릅니다.","황금 햇살이나 열기 아지랑이에서 가치가 30% 오릅니다.","연쇄 유지 시간을 1.6초 늘려 줍니다.","보슬비나 은빛 안개에서 60% 더 빠르게 자랍니다.","같은 가격대에서 가장 빨리 핍니다.","다음에 심는 씨앗 값이 40% 싸집니다.","목표 집계에서 수확 2회로 계산됩니다.","오로라 장막이나 은빛 안개에서 가치가 40% 오릅니다.","수익이 0.5배에서 2.2배까지 요동칩니다.","수확하면 이웃 밭의 성장이 25% 오릅니다.","아무리 오래 두어도 시들지 않습니다.","연쇄 1단계마다 가치가 12% 오릅니다.","모든 날씨 페널티를 무시합니다.","두 번 돌봐야 하지만 크게 벌어 줍니다.","이번 판 수확 1회마다 가치가 9씩 오릅니다.","수확하면 시간을 6초 돌려 줍니다.","해충을 타지 않습니다.","다른 종과 나란히 심으면 가치가 40% 오릅니다.","주문서가 즐겨 찾는 작물입니다.","해충을 타지 않고, 다른 종과 나란히 심으면 가치가 40% 오릅니다."],"wx":["황금 햇살","은빛 안개","산들바람","보슬비","열기 아지랑이","오로라 장막"],"sea":["봄","여름","가을","겨울"],"tutT":["씨앗 심기","밭 돌보기","수확 이어가기","목표 읽기"],"tutB":["아래 씨앗 목록에서 하나를 고르고 빈 밭을 누르면 심어집니다. 씨앗마다 값과 자라는 속도가 다릅니다.","아직 자라는 중인 작물을 누르면 성장이 즉시 앞당겨집니다. 돌보기에는 밭마다 짧은 재사용 대기시간이 있습니다.","반짝이는 작물은 다 익었다는 뜻입니다. 쉬지 않고 연달아 수확하면 연쇄 보너스가 쌓여 판매가가 배로 늘어납니다.","각 스테이지의 목표는 화면 위쪽에 표시됩니다. 시간이나 행동 제한 안에 모두 달성하면 최대 별 3개를 받습니다."],"tutSkip":"건너뛰기","tutNext":"다음","tutDone":"시작하기","cost":"비용","sec":"초","newTag":"NEW","soundOn":"소리: 켜짐","soundOff":"소리: 꺼짐","pestArrive":"밭에 해충이 나타났습니다!","pestGone":"해충을 쫓아냈습니다!","orderStart":"주문: {c} {n}개! 서둘러 수확하세요","orderDone":"주문 완료! 보너스 획득","orderMiss":"주문 시간이 끝났습니다","orderGoalLabel":"주문: {c}","attendTitle":"출석 보상","attendDesc":"매일 정원에 들르면 정수를 받아갈 수 있어요.","attendDay":"{n}일째","attendReward":"정수 +{n}","attendClaim":"받기","attendBadges":"연속 {total}일 중 {n}일째"},"en":{"name":"EN","title":"Bloom Circuit","tagline":"Grow a living garden across four seasons. Chain your harvests, read the weather, and make every bed count.","play":"Play","cont":"Continue","map":"Garden map","retry":"Retry","next":"Next stage","resume":"Resume","restart":"Restart stage","quitStage":"Leave stage","back":"Back","upgrades":"Greenhouse Lab","howTo":"How to play","ariaGame":"Bloom Circuit garden board","ariaSound":"Toggle sound","ariaPause":"Pause game","ariaBack":"Back","stageSelect":"Garden map","stageSub":"Pick a stage. Clear it to open the next one and unlock new seeds.","stageWord":"Stage","locked":"Locked","unlockAt":"Clear stage {n} first","totalStars":"Stars","essence":"Essence","stagesLbl":"Cleared","gCoin":"Hold {n} coins at once","gEarn":"Earn {n} coins in total","gHarv":"Harvest {n} crops","gCrop":"Harvest {n} of {c}","gChain":"Reach a chain of {n}","gPure":"Let no crop wither","gVary":"Harvest {n} different crop types","gFull":"Fill every bed at once, {n} times","limTime":"{n}s","limMoves":"{n} actions","movesLeft":"Actions","hCoins":"Coins","hTime":"Time","hWeather":"Weather","hCombo":"CHAIN","sGrow":"Growth","sValue":"Value","noCoins":"Not enough coins","withered":"A crop withered","ripe":"RIPE","tend":"TEND","goalDone":"Goal complete!","allDone":"All goals complete!","paused":"Paused","pausedKick":"Take a breath","resumeHint":"Your garden is waiting exactly where you left it.","hintPlant":"Pick a seed below, then tap an empty bed","hintTend":"Tap a growing crop to push its growth forward","hintHarvest":"Tap a sparkling crop to harvest it","stoneMsg":"Stone cleared","stoneNeed":"Clearing this stone costs {n} coins","rWin":"Stage clear!","rLose":"Stage failed","rKicker":"Market report","rScore":"Score","rCoins":"Coins earned","rHarv":"Harvests","rCombo":"Best chain","rTime":"Time left","rStars":"Stars","rEssence":"Essence gained","rNewBest":"New best score!","rNewCrop":"New seed unlocked: {c}","rFailTime":"The clock ran out before you completed every goal.","rFailMoves":"You ran out of actions.","rFailPure":"A crop withered away.","labTitle":"Greenhouse Lab","labSub":"Spend Essence on permanent research. Each branch changes how your garden plays.","uBuy":"Research","uOwned":"Active","uLocked":"Needs the previous node","uNoEssence":"Not enough Essence","uDone":"Research complete","branches":["Growth","Wealth","Skill"],"chapters":["Seedling Terrace","Amber Fields","Mist Highlands","Aurora Greenhouse","Second Spring","Full Bloom Again"],"chapterSub":["Learn the rhythm of soil and sun.","Wider beds, richer markets.","Harsh weather, harder targets.","One last winter bloom.","A new season brings new bustle to the garden.","The garden brings together everything it has learned."],"upg":["Irrigation","Deep Roots","Glass House","Auto-Tend","Head Start","Market Ties","Seed Trader","Golden Touch","Nest Egg","Windfall","Quick Hands","Chain Master","Stone Cutter","Weather Sense","Pest Watch","Companion Craft","Regular Client","Garden's Rhythm"],"upgD":["Every crop grows 14% faster.","Growth speed rises a further 16%.","Ripe crops wither 55% more slowly.","One growing bed is tended for you every 7 seconds.","Every seed you sow starts at 18% growth.","Every harvest sells for 12% more.","Seeds cost 22% less.","Each chain step adds 6% to the sale price.","Begin every stage with 70 extra coins.","Every 8th harvest of a run pays double.","Tending pushes growth 55% further.","The chain window stays open 1.1s longer.","Clearing a stone costs 60% less.","Weather and season bonuses are 50% stronger.","Pest reaction window extends from 10s to 14s.","Companion bonus rises from +40% to +55%.","Order tickets appear 25% more often and pay 25% more.","Companion bonus checks diagonal beds too."],"crops":["Mint Sprig","Dew Fern","Ember Berry","Coral Kelp","Rain Orchid","Sunlit Tulip","Velvet Moss","Star Bloom","Amber Wheat","Moon Lily","Ghost Poppy","Thunder Vine","Frost Bell","Gilded Rose","Prism Cactus","Nova Sunflower","Crystal Ivy","Heart Lotus","Frost Clover","Butterfly Orchid","Summer Berry","Moonwing Bloom"],"fx":["Steady and dependable.","Tending pushes it twice as far.","+30% value under Golden Sun or Heat Shimmer.","Holds the chain window open 1.6s longer.","Grows 60% faster in Soft Rain or Silver Mist.","The quickest bloom of its price class.","The next seed you sow costs 40% less.","Counts as two harvests towards goals.","+40% value under Aurora Veil or Silver Mist.","Payout swings from x0.5 to x2.2.","When harvested, it adds +25% growth to neighbouring beds.","Never withers, however long it waits.","+12% value for every step of the chain.","Ignores every weather penalty.","Needs tending twice, then pays out big.","Worth +9 more for each harvest this run.","Gives 6 seconds back to the clock.","Immune to pests.","+40% value when grown beside a different species.","The crop that order tickets favor most.","Immune to pests, and +40% value beside a different species."],"wx":["Golden Sun","Silver Mist","Gentle Breeze","Soft Rain","Heat Shimmer","Aurora Veil"],"sea":["Spring","Summer","Autumn","Winter"],"tutT":["Sow a seed","Tend the bed","Chain the harvest","Read the goals"],"tutB":["Pick a seed from the rail at the bottom, then tap an empty bed to sow it. Each seed costs coins and ripens at its own pace.","Tap a crop that is still growing to tend it, and its growth jumps forward at once. Tending has a short cooldown per bed.","Sparkling crops are ripe. Harvest them one after another without pausing to build a chain bonus that multiplies every sale.","Each stage lists its goals along the top. Finish them all inside the time or action limit to earn up to three stars."],"tutSkip":"Skip","tutNext":"Next","tutDone":"Start growing","cost":"Cost","sec":"s","newTag":"NEW","soundOn":"Sound: on","soundOff":"Sound: off","pestArrive":"A pest appeared on a bed!","pestGone":"Pest driven off!","orderStart":"Order: {n} {c}! Harvest them fast","orderDone":"Order complete! Bonus earned","orderMiss":"The order ran out of time","orderGoalLabel":"Order: {c}","attendTitle":"Daily reward","attendDesc":"Drop by the garden each day to collect Essence.","attendDay":"Day {n}","attendReward":"Essence +{n}","attendClaim":"Collect","attendBadges":"Day {n} of a {total}-day streak"}};
const LANG_ORDER=['ko','en'];
let curLang='ko';
function t(k){const L=I18N[curLang]||I18N.ko;const v=L[k];return v!==undefined?v:I18N.en[k]}
function fmt(s,o){return String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!==undefined?o[k]:m)}

/* ---------------------------------------------------------------- icons -- */
/* AI-tell fix B1/B7/B8 (2026-08-22): emoji glyphs (\u{1F512}) and bare
   punctuation-as-icon (▲ ◈) replaced with real inline SVG (stroke,
   currentColor, aria-hidden — meaning is always carried by adjacent text
   or the parent's aria-label, per icon a11y guidance: decorative icon ->
   aria-hidden, meaning already exposed elsewhere). One outline family,
   stroke-width 2, viewBox 0 0 24 24 throughout so nothing mixes styles. */
const ICONS={
  lock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
  grow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20c8 0 14-6 14-14 0 0-10-2-14 6-2 4-1 6 0 8Z"></path><path d="M4 20c2-6 5-10 9-13"></path></svg>',
  gem:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-6 9 6-9 12z"></path><path d="M3 9h18M9 9l3-6 3 6"></path></svg>',
  soundOn:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="10 5 5 9 2 9 2 15 5 15 10 19 10 5"></polygon><path d="M14.5 8.5a5 5 0 0 1 0 7"></path><path d="M17.5 5.5a9 9 0 0 1 0 13"></path></svg>',
  soundOff:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="10 5 5 9 2 9 2 15 5 15 10 19 10 5"></polygon><line x1="22" y1="9" x2="16" y2="15"></line><line x1="16" y1="9" x2="22" y2="15"></line></svg>'
};

/* ------------------------------------------------------------- storage -- */
/* 세이브 스키마 판단 (venture-frontend, 2026-08-22, Chief 요청 반영):
   `v`(현재 3)는 저장만 되고 «어디서도 읽거나 비교하지 않는다» — 실측 전수
   grep 확인. 즉 버전 게이트가 «있는 척»하는 죽은 필드다. 스테이지24→36·
   신규 씨앗/연구 확장을 이 v를 «올리지 않고» 진행하기로 결정한다 — 이유:
   stars/best/upg/seen 전부 id-키 sparse 객체라(고정길이 배열이 아님)
   Object.assign(defaultSave(),o) 머지가 이미 스키마-무관하게 안전하다
   (save_schema_test.js 로 forward/rollback 양방향 node 시뮬레이션 실증,
   _verify_260822/harness/ 참고). v를 안 쓰는 채로 «그대로 둔다» — 나중에
   이 필드가 있으니 뭔가 게이트하고 있겠거니 오판하지 말 것.
   ★리워드(광고) 카운터 예약: 향후 붙는다면 키 이름은 `rewardClaims`(같은
   sparse 객체 패턴, 예: {"31:order":1} 처럼 "스테이지:종류" 문자열 키) —
   지금은 프로퍼티 자체를 추가하지 않는다(쓰는 코드가 없는 채로 스키마만
   미리 넓히는 것은 죽은 필드를 하나 더 만드는 것과 같다). 실제로 그 기능이
   붙는 시점에 defaultSave()에 `rewardClaims:{}`를 추가한다. */
const SKEY="bloomCircuitSave3";
const defaultSave=()=>({v:3,lang:null,sound:true,essence:0,stars:{},best:{},upg:{},tut:false,seen:{},atnDate:null,atnStreak:0});
let save=defaultSave();
function loadSave(){
  try{const raw=localStorage.getItem(SKEY);if(raw){const o=JSON.parse(raw);if(o&&typeof o==="object")save=Object.assign(defaultSave(),o)}}catch(_){}
  if(!save.stars)save.stars={};if(!save.best)save.best={};if(!save.upg)save.upg={};if(!save.seen)save.seen={};
  if(typeof save.atnDate!=="string")save.atnDate=null;
  if(typeof save.atnStreak!=="number"||!isFinite(save.atnStreak)||save.atnStreak<0)save.atnStreak=0;
}
function writeSave(){try{localStorage.setItem(SKEY,JSON.stringify(save))}catch(_){}
  try{ if (typeof window!=='undefined' && window.__nativeStorageMirror) window.__nativeStorageMirror(SKEY,JSON.stringify(save)); }catch(_){} }

/* ------------------------------------------------------------ 출석 ---- */
/* 2026-08-22 President 승인 설계(Chief 확인 반영, essence 밸런스 재계산
   후 곡선 하향 조정 - 상세 근거는 상신 로그 참고: 원안 143/주는 전체 연구
   트리(1650 essence)를 11.5주만에 「플레이 없이 출석만으로」 완주시켜
   버려 하향했다. 아래 75/주 곡선은 22주(~5개월) - 출석은 «보조»지 «대체»가
   아니라는 지시를 수치로 만족한다. */
const ATN_CURVE=[5,6,8,10,12,14,20]; /* 1~7일차, 8일차부터 7일차값(20) 반복 - 무한상승 없음 */
/* KST 고정 오프셋, UTC getter만 사용(기기 로캘 무관 - Chief 제시 원문 그대로 채용).
   ⛔로컬 getFullYear/getMonth/getDate 금지(그건 기기 타임존을 그대로 읽어버린다). */
function kstDateKey(now){const k=new Date((typeof now==="number"?now:Date.now())+9*3600*1000);
  return k.getUTCFullYear()+"-"+String(k.getUTCMonth()+1).padStart(2,"0")+"-"+String(k.getUTCDate()).padStart(2,"0")}
/* 문자열 날짜키 두 개의 "일수 차이"만 필요하다 - UTC 정오로 맞춰 만든 Date 는
   DST 등의 영향을 받지 않는다(이 앱은 KST 고정오프셋이라 원래 DST 자체가
   없지만, 파싱 방식 자체를 방어적으로 짜 둔다). */
function dateKeyToUtcNoon(key){const[y,m,d]=key.split("-").map(Number);return Date.UTC(y,m-1,d,12)}
function attendanceStatus(){
  const today=kstDateKey();
  if(save.atnDate===today)return{claimable:false,today,day:save.atnStreak||0};
  let gapDays=Infinity;
  if(save.atnDate){
    /* ⛔"뒤로 가는 날짜"만 무시한다(시계 조작 방어는 이 이상 비례하지 않는다
       - Chief 지시 원문). 기기 시계가 atnDate 이전으로 돌아가 있으면 오늘
       것으로 취급하지 않고 그냥 재방문 취급(gap=1, streak 이어감)한다 -
       "고의로 돌려서 매일 두 번 받는" 공격만 막으면 충분하다는 판단. */
    const diffMs=dateKeyToUtcNoon(today)-dateKeyToUtcNoon(save.atnDate);
    gapDays=diffMs<=0?1:Math.round(diffMs/86400000);
  }
  let newStreak;
  if(!save.atnDate)newStreak=1;                                  /* 최초 클레임 */
  else if(gapDays===1)newStreak=(save.atnStreak||0)+1;           /* 연속 출석 */
  else if(gapDays===2)newStreak=Math.max(1,Math.floor((save.atnStreak||0)/2)); /* 결손 1일: 절반, 리셋 아님 */
  else newStreak=1;                                              /* 결손 2일+: 즉시 1일차 재시작 */
  const cappedDay=Math.min(newStreak,ATN_CURVE.length);
  return{claimable:true,today,day:newStreak,cappedDay,reward:ATN_CURVE[cappedDay-1]};
}
function claimAttendance(){
  const st=attendanceStatus();
  if(!st.claimable)return null;
  save.essence=(save.essence||0)+st.reward;
  save.atnStreak=st.day;save.atnDate=st.today;
  writeSave();
  track("attendance_claim",{streak_day:st.day});
  return st;
}

/* ---------------------------------------------------------------- data -- */
/* Crops: cost, grow seconds, base value, fx index, palette, shape params.
   sh = {p:petal count, ps:petal shape 0-3, pl:petal length, pw:petal width,
         leaf:0-3, ctr:0-3, stem:0-2, h:stem height, tilt} */
const CROPS=[
 {cost:8,  grow:3.4, val:20,  fx:0,  unlock:1,  a:"#7ef0b4",b:"#d8ffe9",c:"#ffe9a8", sh:{p:5, ps:0,pl:.30,pw:.13,leaf:0,ctr:0,stem:0,h:.36}},
 {cost:13, grow:4.4, val:32,  fx:1,  unlock:1,  a:"#5fd6b6",b:"#a9f6e2",c:"#e6fff4", sh:{p:0, ps:0,pl:.00,pw:.00,leaf:2,ctr:3,stem:1,h:.42}},
 {cost:19, grow:5.6, val:54,  fx:2,  unlock:2,  a:"#ff7a5c",b:"#ffb992",c:"#ff4d4d", sh:{p:6, ps:2,pl:.26,pw:.14,leaf:1,ctr:0,stem:0,h:.34}},
 {cost:22, grow:4.0, val:44,  fx:3,  unlock:3,  a:"#ff9ec4",b:"#ffd2e6",c:"#fff0a8", sh:{p:3, ps:1,pl:.34,pw:.11,leaf:2,ctr:1,stem:2,h:.40}},
 {cost:27, grow:6.4, val:68,  fx:4,  unlock:3,  a:"#8ab8ff",b:"#c8dcff",c:"#fff2c0", sh:{p:5, ps:1,pl:.32,pw:.15,leaf:1,ctr:2,stem:1,h:.38}},
 {cost:30, grow:4.8, val:60,  fx:5,  unlock:4,  a:"#ffc861",b:"#ffe6ae",c:"#ff8f3d", sh:{p:8, ps:0,pl:.28,pw:.10,leaf:0,ctr:0,stem:0,h:.42}},
 {cost:17, grow:5.2, val:36,  fx:6,  unlock:5,  a:"#a58bff",b:"#d6c9ff",c:"#7de6c0", sh:{p:4, ps:2,pl:.20,pw:.17,leaf:3,ctr:3,stem:2,h:.24}},
 {cost:36, grow:7.6, val:100, fx:0,  unlock:5,  a:"#caa7ff",b:"#f0e2ff",c:"#ffe58a", sh:{p:6, ps:3,pl:.36,pw:.12,leaf:1,ctr:2,stem:1,h:.40}},
 {cost:32, grow:6.8, val:70,  fx:7,  unlock:6,  a:"#e8c168",b:"#f7e0a4",c:"#c9903a", sh:{p:0, ps:0,pl:.00,pw:.00,leaf:1,ctr:3,stem:0,h:.50}},
 {cost:44, grow:8.6, val:118, fx:8,  unlock:7,  a:"#b7d6ff",b:"#eaf3ff",c:"#d9b6ff", sh:{p:7, ps:1,pl:.34,pw:.13,leaf:2,ctr:1,stem:1,h:.40}},
 {cost:40, grow:6.2, val:96,  fx:9,  unlock:8,  a:"#d3c8ff",b:"#f3efff",c:"#9de8ff", sh:{p:4, ps:1,pl:.34,pw:.18,leaf:0,ctr:1,stem:2,h:.36}},
 {cost:52, grow:7.4, val:128, fx:10, unlock:9,  a:"#ffe066",b:"#fff5c2",c:"#8ae6ff", sh:{p:5, ps:3,pl:.32,pw:.16,leaf:2,ctr:2,stem:2,h:.38}},
 {cost:48, grow:9.4, val:126, fx:11, unlock:10, a:"#a9e8ff",b:"#e2f8ff",c:"#ffffff", sh:{p:6, ps:1,pl:.30,pw:.14,leaf:1,ctr:0,stem:1,h:.36}},
 {cost:66, grow:10.6,val:186, fx:12, unlock:12, a:"#ffb84d",b:"#ffdf9e",c:"#ff6f91", sh:{p:12,ps:0,pl:.26,pw:.09,leaf:1,ctr:0,stem:0,h:.36}},
 {cost:74, grow:13.0,val:232, fx:13, unlock:13, a:"#6ee7c8",b:"#c4fff0",c:"#ff9ad5", sh:{p:4, ps:3,pl:.22,pw:.20,leaf:3,ctr:2,stem:2,h:.28}},
 {cost:86, grow:11.6,val:262, fx:14, unlock:15, a:"#ffcf3f",b:"#fff0a8",c:"#7a4b18", sh:{p:14,ps:2,pl:.30,pw:.09,leaf:1,ctr:0,stem:0,h:.46}},
 {cost:96, grow:13.6,val:308, fx:15, unlock:16, a:"#9df0ff",b:"#e6fdff",c:"#c9a7ff", sh:{p:6, ps:2,pl:.34,pw:.11,leaf:2,ctr:2,stem:1,h:.42}},
 {cost:118,grow:15.0,val:392, fx:16, unlock:18, a:"#ff8fb1",b:"#ffd3e0",c:"#ffe08a", sh:{p:10,ps:1,pl:.34,pw:.13,leaf:3,ctr:1,stem:1,h:.30}},
 /* ---- 5장/6장 신규 씨앗 4종(2026-08-22, President 승인 설계) ----
    각각 신규 정원규칙(해충ㆍ인접보너스)과 직결 - 숫자만 늘린 것 아님.
    Moonwing Bloom은 의도적으로 val/grow 비율을 기존 최고치(Heart Lotus 392/15.0=26.13/s)
    보다 낮게(340/17.5=19.43/s) 잡았다 - 해충면역+인접보너스를 다 가졌다고 경제적으로도
    최상위가 되지 않게 하는 트레이드오프(Chief 확인 2 반영). 주문서효과(fx19)는 의도적으로
    여름딸기에만 주어 월광나비꽃 해금 후에도 여름딸기가 쓸모가 사라지지 않게 두었다. */
 {cost:130,grow:13.0,val:300, fx:17, unlock:25, a:"#cfe8ff",b:"#eef8ff",c:"#8fc4ff", sh:{p:6, ps:1,pl:.30,pw:.12,leaf:2,ctr:1,stem:1,h:.38}},
 {cost:140,grow:12.5,val:290, fx:18, unlock:28, a:"#ffb3d9",b:"#ffe3f0",c:"#ffe066", sh:{p:5, ps:2,pl:.32,pw:.14,leaf:1,ctr:2,stem:1,h:.36}},
 {cost:110,grow:10.5,val:230, fx:19, unlock:31, a:"#ff6f91",b:"#ffb3c6",c:"#fff0a8", sh:{p:6, ps:0,pl:.26,pw:.13,leaf:0,ctr:0,stem:0,h:.32}},
 {cost:150,grow:17.5,val:340, fx:20, unlock:34, a:"#c9b3ff",b:"#e8dcff",c:"#fef8d8", sh:{p:8, ps:3,pl:.34,pw:.12,leaf:2,ctr:2,stem:1,h:.40}}
];
/* Weather: g growth mult, v value mult, w wither speed mult */
const WX=[
 {g:1.15,v:1.00,w:1.00},
 {g:0.92,v:1.22,w:0.78},
 {g:1.06,v:1.06,w:1.00},
 {g:1.28,v:0.92,w:0.52},
 {g:1.38,v:1.00,w:1.85},
 {g:0.88,v:1.45,w:0.90}
];
/* Season: g growth mult, v value mult */
const SEA=[{g:1.05,v:1.00},{g:1.12,v:0.96},{g:0.96,v:1.12},{g:0.88,v:1.26}];

/* Upgrade nodes: br branch, req prerequisite index, cost essence, order in column */
const UPG=[
 {br:0,req:-1,cost:25},{br:0,req:0,cost:60},{br:0,req:1,cost:100},{br:0,req:0,cost:55},{br:0,req:3,cost:110},
 {br:1,req:-1,cost:25},{br:1,req:5,cost:60},{br:1,req:6,cost:105},{br:1,req:5,cost:70},{br:1,req:8,cost:120},
 {br:2,req:-1,cost:30},{br:2,req:10,cost:70},{br:2,req:10,cost:55},{br:2,req:11,cost:125},
 /* ---- 5장/6장 신규 연구 4종 - 기존 3계열에 편입(4번째 계열 신설 안 함,
    레이아웃 리스크 회피) - 새 메커니즘에 투자가 하는 연구로 명상을 준다. */
 {br:2,req:-1,cost:140},{br:0,req:-1,cost:140},{br:1,req:-1,cost:140},{br:0,req:15,cost:220}
];
const BRANCH_ORDER=[[0,1,2,3,4,15,17],[5,6,7,8,9,16],[10,11,12,13,14]];
const U=i=>!!save.upg[i];

/* Goal types: coin earn harv crop chain pure vary full  (8 kinds) */
const STAGES=[
 {id:1, ch:0,grid:3,sea:0,wx:[0,2],      time:95, coin:120,goals:[["harv",5]],                 s2:390,s3:630},
 {id:2, ch:0,grid:3,sea:0,wx:[0,2,3],    time:95, coin:120,goals:[["coin",240]],               s2:460,s3:735},
 {id:3, ch:0,grid:3,sea:0,wx:[2,3,1],    time:100,coin:130,goals:[["harv",12],["earn",320]],   s2:930,s3:1500},
 {id:4, ch:0,grid:3,sea:0,wx:[0,2],      time:100,coin:150,goals:[["chain",4]],                s2:440,s3:700},
 {id:5, ch:0,grid:3,sea:0,wx:[0,4],      time:92, coin:160,goals:[["crop",4,2]],               s2:450,s3:725},
 {id:6, ch:0,grid:3,sea:0,wx:[1,3,2],    time:110,coin:170,goals:[["earn",540],["pure"]],      s2:700,s3:1130},
 {id:7, ch:1,grid:4,sea:1,wx:[0,2,4],    time:110,coin:190,goals:[["earn",720]],               s2:820,s3:1320},
 {id:8, ch:1,grid:4,sea:1,wx:[0,3,2],    time:110,coin:210,goals:[["vary",4]],                 s2:400,s3:650},
 {id:9, ch:1,grid:4,sea:1,wx:[4,0],      moves:32,coin:230,goals:[["earn",640]],               s2:620,s3:990},
 {id:10,ch:1,grid:4,sea:1,wx:[0,1,3],    time:115,coin:230,goals:[["crop",6,8],["harv",20]],   s2:1480,s3:2070},
 {id:11,ch:1,grid:4,sea:1,wx:[2,3],      time:115,coin:280,goals:[["full",3]],                 s2:350,s3:520},
 {id:12,ch:1,grid:4,sea:1,wx:[4,0,2],    time:120,coin:280,goals:[["earn",1250],["chain",7]],  s2:2450,s3:3430},
 {id:13,ch:2,grid:5,sea:2,wx:[1,3,5],    time:120,coin:300,goals:[["harv",30]],                s2:6120,s3:8550},
 {id:14,ch:2,grid:5,sea:2,wx:[1,2],      moves:44,coin:340,goals:[["earn",1300]],              s2:1030,s3:1440},
 {id:15,ch:2,grid:5,sea:2,wx:[5,1],      time:125,coin:340,goals:[["crop",5,12],["pure"]],     s2:1050,s3:1470},
 {id:16,ch:2,grid:5,sea:2,wx:[4,1,3],    time:125,coin:360,stones:4,goals:[["earn",1850]],     s2:1740,s3:2440},
 {id:17,ch:2,grid:5,sea:2,wx:[2,0,1],    time:125,coin:360,goals:[["chain",10]],               s2:5440,s3:7600},
 {id:18,ch:2,grid:5,sea:2,wx:[1,5,3],    time:130,coin:380,goals:[["vary",6],["earn",1950]],   s2:1940,s3:2710},
 {id:19,ch:3,grid:5,sea:3,wx:[5,1,4],    time:130,coin:420,stones:5,goals:[["earn",2450]],     s2:2140,s3:2990},
 {id:20,ch:3,grid:5,sea:3,wx:[5,3],      moves:42,coin:440,goals:[["crop",4,16]],              s2:1660,s3:2320},
 {id:21,ch:3,grid:5,sea:3,wx:[1,5,2],    time:135,coin:460,goals:[["full",3],["earn",2250]],   s2:2590,s3:3610},
 {id:22,ch:3,grid:5,sea:3,wx:[4,5,1],    time:135,coin:480,stones:6,goals:[["harv",45],["pure"]],s2:23350,s3:32630},
 {id:23,ch:3,grid:5,sea:3,wx:[5,0,1],    time:140,coin:500,goals:[["chain",13],["earn",2850]], s2:9080,s3:12690},
 {id:24,ch:3,grid:5,sea:3,wx:[4,5,1,3],  moves:58,coin:580,stones:4,goals:[["earn",3100],["vary",8]],s2:2620,s3:3650},
 /* ---- 5장 두 번째 봄 (25~30) - 해충(pest) 스테이지25 도입, 인접보너스
    씨앗(Butterfly Orchid)은 스테이지28에 해금되어 자연스럽게 가능해진다(스테이지
    플래그 자체는 없음 - 인접보너스는 씨앗 fx 기반이라 해당 씨앗 보유만으로 자동 적용).
    25는 해충 학습용으로 단일 goal(harv20)로 쉽게, 이후 점진적으로 기존 24의 값(earn3100)을
    향해 이어진다. */
 {id:25,ch:4,grid:5,sea:0,wx:[0,2,4],    time:120,coin:420,pest:true, goals:[["harv",20]],                s2:2900,s3:4050},
 {id:26,ch:4,grid:5,sea:1,wx:[1,3,2],    time:125,coin:440,pest:true,stones:3,goals:[["earn",2900]],       s2:3100,s3:4350},
 {id:27,ch:4,grid:5,sea:1,wx:[0,3,2],    time:125,coin:460,pest:true, goals:[["chain",14]],                s2:3300,s3:4600},
 {id:28,ch:4,grid:5,sea:2,wx:[2,0,1],    time:130,coin:480,pest:true, goals:[["vary",9]],                  s2:3500,s3:4900},
 {id:29,ch:4,grid:5,sea:2,wx:[4,1,3],    time:130,coin:500,pest:true,stones:5,goals:[["earn",3400],["harv",30]],s2:5200,s3:7300},
 {id:30,ch:4,grid:5,sea:3,wx:[5,1,4],    moves:60,coin:520,pest:true, goals:[["full",4]],                  s2:3800,s3:5300},
 /* ---- 6장 다시, 만개 (31~36) - 주문서(orders) 스테이지31 도입(여름딸기 해금),
    34부터 해충ㆍ주문서ㆍ인접보너스(월광나비꽃 해금)가 동시에 있는 캡스톤 구간.
    36은 기존 마지막(24)과 같은 구조(moves제한+earn/vary조합+stones)를 쓰되 숫자만
    키우지 않고 pest/orders가 겹친다 - 기존 스테이지를 복붙한 것이 아니라 같은 형식을
    새 요소로 재구성한 것이다(지시서 "숫자만 키우지 마라" 준수). */
 {id:31,ch:5,grid:5,sea:3,wx:[5,3],      time:135,coin:540,orders:true, goals:[["harv",22]],               s2:3900,s3:5450},
 {id:32,ch:5,grid:5,sea:0,wx:[0,2,4],    time:135,coin:560,orders:true,pest:true,goals:[["earn",3700]],    s2:4700,s3:6600},
 {id:33,ch:5,grid:5,sea:0,wx:[1,3,2],    time:140,coin:580,orders:true,stones:4,goals:[["chain",15],["earn",3200]],s2:9500,s3:13300},
 {id:34,ch:5,grid:5,sea:1,wx:[2,0,1],    time:140,coin:600,orders:true,pest:true,goals:[["vary",10]],      s2:4200,s3:5900},
 {id:35,ch:5,grid:5,sea:2,wx:[4,1,3],    time:145,coin:620,orders:true,pest:true,stones:6,goals:[["earn",4300],["harv",40]],s2:24000,s3:33500},
 {id:36,ch:5,grid:5,sea:3,wx:[5,0,1,3],  moves:64,coin:650,orders:true,pest:true,stones:5,goals:[["earn",4600],["vary",11]],s2:5600,s3:7850}
];
const stageById=id=>STAGES[id-1];
const maxUnlocked=()=>{let n=1;for(let i=1;i<=STAGES.length;i++){if(save.stars[i]>0)n=Math.min(STAGES.length,i+1)}return n};
const totalStars=()=>{let s=0;for(const k in save.stars)s+=save.stars[k]||0;return s};
const clearedCount=()=>{let s=0;for(const k in save.stars)if(save.stars[k]>0)s++;return s};

/* --------------------------------------------------------------- audio -- */
let actx=null;
function ac(){ if(!save.sound) return null;
  try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
       if(actx.state==="suspended") actx.resume(); return actx; }catch(_){ return null } }
function tone(f=440,dur=.09,type="sine",vol=.04,slide=0){
  const a=ac();if(!a)return;
  try{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,a.currentTime);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),a.currentTime+dur);
    g.gain.setValueAtTime(0.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(vol,a.currentTime+.008);
    g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);
    o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur+.02)}catch(_){}
}
function noise(dur=.16,vol=.03,hp=900){
  const a=ac();if(!a)return;
  try{const n=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type="highpass";f.frequency.value=hp;
    const g=a.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(a.destination);s.start()}catch(_){}
}
/* ZzFX — Zuper Zmall Zound Zynth (Micro Edition). MIT License, Copyright 2019 Frank Force
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

/* ----------------------------------------------------------- music (BGM) --
   A slow synthesised garden bed: sustained pad + soft pluck + low root, run
   through one lowpass and a single feedback delay. Everything is generated
   here — there is no audio file anywhere in this build.
   The key, timbre, tempo and colour follow the season, and the melody is
   driven by a deterministic 1024-step sequence (~6 minutes at the slowest
   tempo) so the bed never announces a loop point. Its bus gain (0.16) sits
   well under the SFX peaks (0.026-0.045 each, straight to destination), so
   the music stays a background. The same `save.sound` flag mutes both.      */
const BGM_SEA=[
  /* spring — bright D, major pentatonic, gentle plucks */
  {root:146.83,lead:"triangle",cut:2600,step:.34,padV:.040,leadV:.150,bassV:.072,
   scale:[0,2,4,7,9,12,14,16,19,21],prog:[[0,7,16],[9,16,21],[5,12,19],[7,14,23]]},
  /* summer — open E mixolydian, warmer and a touch quicker */
  {root:164.81,lead:"sine",cut:3200,step:.30,padV:.038,leadV:.158,bassV:.068,
   scale:[0,2,4,7,9,12,14,16,19,21],prog:[[0,7,16],[5,12,21],[10,17,26],[7,14,23]]},
  /* autumn — A minor pentatonic, darker filter, slower */
  {root:110.00,lead:"triangle",cut:1900,step:.38,padV:.042,leadV:.145,bassV:.076,
   scale:[0,3,5,7,10,12,15,17,19,22],prog:[[0,7,15],[10,17,24],[5,12,20],[7,14,22]]},
  /* winter — D minor, very soft, slowest, sparse */
  {root:146.83,lead:"sine",cut:1500,step:.44,padV:.043,leadV:.136,bassV:.072,
   scale:[0,3,5,7,10,12,15,17,19,22],prog:[[0,7,15],[8,15,22],[3,10,19],[10,17,24]]}
];
const BGM_VOL=.047;
let bgmOn=false,bgmTimer=0,bgmNext=0,bgmStep=0,bgmSea=-1,bgmKicked=false;
let bgmMaster=null,bgmFilt=null,bgmDelay=null,bgmFb=null,bgmWet=null,bgmComp=null;
function bgmHash(n,s){
  let x=(Math.imul(n,2654435761)+Math.imul(s,40503))>>>0;
  x^=x>>>15;x=Math.imul(x,2246822519);x^=x>>>13;return (x>>>0)/4294967296;
}
function bgmBuild(a){
  if(bgmMaster)return true;
  try{
    bgmMaster=a.createGain();bgmMaster.gain.value=.0001;
    bgmFilt=a.createBiquadFilter();bgmFilt.type="lowpass";bgmFilt.frequency.value=2400;bgmFilt.Q.value=.4;
    bgmDelay=a.createDelay(1);bgmDelay.delayTime.value=.38;
    bgmFb=a.createGain();bgmFb.gain.value=.26;
    bgmWet=a.createGain();bgmWet.gain.value=.28;
    /* pad + pluck + delay tail can line up and spike as loud as a UI blip;
       this caps the crest so the bed stays audible without ever poking
       through the effects bus */
    bgmComp=a.createDynamicsCompressor();
    try{
      bgmComp.threshold.value=-27;bgmComp.knee.value=10;bgmComp.ratio.value=10;
      bgmComp.attack.value=.002;bgmComp.release.value=.32;
    }catch(_){}
    bgmFilt.connect(bgmComp);
    bgmFilt.connect(bgmDelay);bgmDelay.connect(bgmFb);bgmFb.connect(bgmDelay);
    bgmDelay.connect(bgmWet);bgmWet.connect(bgmComp);
    bgmComp.connect(bgmMaster);
    bgmMaster.connect(a.destination);
    return true;
  }catch(_){bgmMaster=null;return false}
}
function bgmVoice(a,f,t0,dur,type,vol,atk){
  try{
    const o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol,t0+atk);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g).connect(bgmFilt);o.start(t0);o.stop(t0+dur+.05);
  }catch(_){}
}
function bgmTick(a,C,t,st){
  const sl=st&15,ch=C.prog[(st>>4)%C.prog.length],f=s=>C.root*Math.pow(2,s/12);
  if(sl===0){
    const d=C.step*16*1.02;
    /* the pad voices enter one after another: three coherent attacks on the
       same instant made the bed peak as loud as an SFX click */
    for(let k=0;k<ch.length;k++)bgmVoice(a,f(ch[k]),t+k*.11,d-k*.11,"sine",C.padV,.9+k*.12);
    bgmVoice(a,f(ch[0]-12),t,d*.55,"sine",C.bassV,.25);
  }
  /* one breathing bar in every eight keeps the bed from nagging */
  const sparse=((st>>4)&7)===7;
  if(sl%2===0&&bgmHash(st,1)<(sparse?.15:.44)){
    const sc=C.scale,idx=(bgmHash(st,2)*sc.length)|0;
    bgmVoice(a,f(sc[idx]+(bgmHash(st,3)<.34?24:12)),t,C.step*(2.2+bgmHash(st,4)*1.7),C.lead,C.leadV,.055);
  }
  if(sl===8&&bgmHash(st,5)<.12){
    const sc=C.scale;
    bgmVoice(a,f(sc[(bgmHash(st,6)*sc.length)|0]+36),t,C.step*3,"sine",C.leadV*.42,.09);
  }
}
function bgmSchedule(){
  const a=actx;
  if(!a||!bgmOn||!bgmMaster||!save.sound||a.state!=="running")return;
  const sea=stage?stage.sea:ambientSeason;
  if(sea!==bgmSea){
    bgmSea=sea;
    try{bgmFilt.frequency.setTargetAtTime(BGM_SEA[sea].cut,a.currentTime,.7)}catch(_){}
  }
  const C=BGM_SEA[bgmSea];
  if(bgmNext<a.currentTime)bgmNext=a.currentTime+.08;
  let guard=0;
  while(bgmNext<a.currentTime+.7&&guard++<24){
    bgmTick(a,C,bgmNext,bgmStep);
    bgmNext+=C.step;bgmStep=(bgmStep+1)&1023;
  }
}
function bgmStart(){
  if(!save.sound||bgmOn)return;
  const a=ac();if(!a||!bgmBuild(a))return;
  bgmOn=true;bgmNext=0;
  try{
    const now=a.currentTime;
    bgmMaster.gain.cancelScheduledValues(now);
    bgmMaster.gain.setValueAtTime(Math.max(.0001,bgmMaster.gain.value),now);
    bgmMaster.gain.linearRampToValueAtTime(BGM_VOL,now+2.2);
  }catch(_){}
  if(!bgmTimer)bgmTimer=setInterval(bgmSchedule,140);
  bgmSchedule();
}
function bgmStop(fade){
  bgmOn=false;
  if(bgmTimer){clearInterval(bgmTimer);bgmTimer=0}
  if(bgmMaster&&actx){try{
    const now=actx.currentTime;
    bgmMaster.gain.cancelScheduledValues(now);
    bgmMaster.gain.setValueAtTime(Math.max(.0001,bgmMaster.gain.value),now);
    bgmMaster.gain.linearRampToValueAtTime(.0001,now+(fade||.35));
  }catch(_){}}
}
/* autoplay policy: the bed only starts after the first real user input */
function bgmKick(){
  if(bgmKicked)return;bgmKicked=true;
  removeEventListener("pointerdown",bgmKick,true);
  removeEventListener("keydown",bgmKick,true);
  removeEventListener("touchstart",bgmKick,true);
  bgmStart();
}
addEventListener("pointerdown",bgmKick,true);
addEventListener("keydown",bgmKick,true);
addEventListener("touchstart",bgmKick,true);

/* ------------------------------------------------------------ elements -- */
const $=id=>document.getElementById(id);
const canvas=$("game");
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
const FONT='"Fredoka",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';
const view={w:0,h:0,dpr:1,board:0,x:0,y:0,cell:0,n:3,compact:false};

/* ---------------------------------------------------------------- rng --- */
let rngState=1;
function srand(s){rngState=(s|0)||1}
function rnd(){rngState|=0;rngState=(rngState+0x6d2b79f5)|0;let x=rngState;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296}

/* ------------------------------------------------------------- runtime -- */
let screen="title";            /* title | map | lab | play | result | pause | tut */
let stage=null;                /* current stage def */
let plots=[];                  /* {seed,growth,ripe,tend,pulse,stone,tends} */
let particles=[],floaters=[],rings=[];
let coins=0,timeLeft=0,movesLeft=0,chain=0,chainClock=0,bestChain=0;
let wxIdx=0,wxClock=0,wxOrder=[];
let selected=0,focusPlot=0,running=false,finished=false,seedPickedByPlayer=false;
let prog=null,newCropThisStage=-1,shake=0,dayT=0,autoTendClock=0,discountNext=false;
/* 신규 정원규칙 상태(2026-08-22, President 승인 설계) - 전부 "판당 임시 상태",
   save 객체에 새 키를 추가하지 않는다(순서2에서 증명한 sparse-dict 세이브 안전성 유지). */
let pestClock=0,orderActive=false,orderCrop=-1,orderN=0,orderProg=0,orderClock=0,orderTimer=0;
const PEST_BASE_WINDOW=10,PEST_RESEARCH_WINDOW=14;
const PEST_IMMUNE_FX=[17,20]; /* 서리 클로버, 월광 나비꽃 */
const COMPANION_FX=[18,20]; /* 나비 난초, 월광 나비꽃 */
/* 계측 배선(2026-08-22, Chief 지시) - window.__gcTrack 훅은 sdk-boot.ts 가
   src/toss/analytics.ts 의 trackEvent 로 연결한다(__nativeStorageMirror 와
   동일한 패턴). 훅이 없어도(브라우저 단독 실행 등) 절대 던지지 않는다.
   ★전송 방식은 analytics.ts 쪽에서 아직 비워둠 - 여기는 "무엇을·언제" 만
   결정한다. 개인정보(유저ID·기기ID) 전무, 매프레임 호출 없음(전부 이산 이벤트). */
function track(name,params){try{if(typeof window!=="undefined"&&window.__gcTrack)window.__gcTrack(name,params||{})}catch(_){}}
let sessionStageOrdinal=0,stageStartAt=0;
let lastResult=null,tutStep=0,hintTimer=0;

/* --------------------------------------------------------- upgrade fx --- */
const growMul =()=> (U(0)?1.14:1)*(U(1)?1.16:1);
const valMul  =()=> (U(5)?1.12:1);
const seedCost=i=> Math.max(1,Math.round(CROPS[i].cost*(U(6)?0.78:1)*(discountNext?0.6:1)));
const chainWin=()=> 2.3+(U(11)?1.1:0);
const tendPow =()=> 0.145*(U(10)?1.55:1);
const witherMul=()=>(U(2)?0.45:1);
const stoneCost=()=> Math.round((70+view.n*22)*(U(12)?0.4:1));
function wxAmp(v){ return U(13)? 1+(v-1)*1.5 : v }

/* =========================================================== rendering == */
function mix(a,b,n){
  n=Math.max(0,Math.min(1,n));
  const av=parseInt(a.slice(1),16),bv=parseInt(b.slice(1),16);
  const r=Math.round((av>>16)*(1-n)+(bv>>16)*n),g=Math.round((av>>8&255)*(1-n)+(bv>>8&255)*n),c=Math.round((av&255)*(1-n)+(bv&255)*n);
  return "#"+(1<<24|r<<16|g<<8|c).toString(16).slice(1);
}
/* season palettes: [midday, dusk] — index matches SEA / t("sea") */
/* season palettes: [midday, dusk] — index matches SEA / t("sea"). DESIGN.md §2.
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

let ambientSeason=0;
function envPalette(){
  const s=SEASON_SKY[stage?stage.sea:ambientSeason];
  const k=Math.max(0,Math.min(1,dayT));
  const p={};for(const key in s[0])p[key]=mix(s[0][key],s[1][key],k);
  p.dusk=k;return p;
}
/* 배경 깊이 4층 (DESIGN.md §4) — 모두 절차적, 매 프레임 그라데이션 생성 0.
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

/* ------------------------------------------------------- crop drawing --
   Every routine takes an explicit 2D context so the same code paints the
   board, the seed-rail icons and the tutorial art. No external assets.   */
function petalPath(q,ps,len,wid){
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

/* ------------------------------------------------------------- layout -- */
function resize(){
  view.w=Math.max(1,innerWidth);view.h=Math.max(1,innerHeight);
  view.dpr=Math.min(devicePixelRatio||1,POST?POST.dprCap():2);
  canvas.width=Math.round(view.w*view.dpr);canvas.height=Math.round(view.h*view.dpr);
  canvas.style.width=view.w+"px";canvas.style.height=view.h+"px";
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  view.compact=view.w<620;
  const n=stage?stage.grid:3;view.n=n;
  const hudH=$("hud").getBoundingClientRect().height||110;
  const railH=$("rail").getBoundingClientRect().height||104;
  document.documentElement.style.setProperty("--toastB",(railH+10)+"px");
  /* reserve a lane between board and rail so the snackbar never covers a plot */
  const availH=view.h-hudH-railH-58;
  const availW=view.w-20;
  view.board=Math.max(150,Math.min(availW,availH,n===3?540:n===4?620:700));
  view.cell=view.board/n;
  view.x=(view.w-view.board)/2;
  view.y=hudH+6+Math.max(0,(availH-view.board)/2);
}
addEventListener("resize",()=>{resize();layoutDirty=true;if(screen==="map")fitGoalsSoon()});
addEventListener("orientationchange",()=>setTimeout(()=>{resize();layoutDirty=true;if(screen==="map")fitGoalsSoon()},120));
let layoutDirty=false;

/* -------------------------------------------------------- effects fx --- */
function plotCenter(i){const n=view.n;return{x:view.x+(i%n+.5)*view.cell,y:view.y+((i/n|0)+.5)*view.cell}}
function burst(i,color,n,spd){
  const c=plotCenter(i);spd=spd||1;
  for(let k=0;k<n;k++){const a=rnd()*6.283,s=(26+rnd()*92)*spd;
    particles.push({x:c.x,y:c.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-26,life:.45+rnd()*.5,max:.95,size:1.8+rnd()*4.6,color})}
}
function floater(i,text,color,big){
  const c=plotCenter(i);
  /* sit above the plot so the crop art stays readable */
  floaters.push({x:c.x,y:c.y-view.cell*.34,text,color,life:1.0,max:1.0,big:!!big});
  if(floaters.length>14)floaters.splice(0,floaters.length-14);
}
function ring(i,color){
  if(rings.length>5)return;
  const c=plotCenter(i);rings.push({x:c.x,y:c.y,r:view.cell*.10,life:.34,max:.34,color});
}
function flash(){const f=$("flash");f.classList.add("on");setTimeout(()=>f.classList.remove("on"),90)}

let toastT=0;
function toast(msg){const e=$("toast");e.textContent=msg;e.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove("show"),1500)}

/* ======================================================= stage control == */
function buildPlots(){
  const n=stage.grid,total=n*n;
  plots=Array.from({length:total},()=>({seed:-1,growth:0,ripe:0,tend:0,pulse:0,stone:false,tends:0,pest:false,pestT:0}));
  if(stage.stones){
    srand(stage.id*7919+13);
    let placed=0,guard=0;
    while(placed<stage.stones&&guard++<400){
      const i=Math.floor(rnd()*total);
      const c=i%n,r=i/n|0;
      if(plots[i].stone)continue;
      if(c===0&&r===0)continue;
      plots[i].stone=true;placed++;
    }
  }
}
function availableSeeds(){
  const out=[];for(let i=0;i<CROPS.length;i++)if(CROPS[i].unlock<=stage.id)out.push(i);return out;
}
function startStage(id){
  stage=stageById(id);if(!stage)return;
  clearEnd();
  srand(id*2654435761);
  buildPlots();
  coins=stage.coin+(U(8)?70:0);
  timeLeft=stage.time||0;movesLeft=stage.moves||0;
  chain=0;chainClock=0;bestChain=0;dayT=0;autoTendClock=0;discountNext=false;
  wxOrder=stage.wx.slice();wxIdx=wxOrder[0];wxClock=stage.time?Math.max(14,stage.time/(wxOrder.length+1)):18;
  particles.length=floaters.length=rings.length=0;
  pestClock=stage.pest?(16+rnd()*14):1e9;
  orderActive=false;orderCrop=-1;orderN=0;orderProg=0;orderClock=0;
  orderTimer=stage.orders?(14+rnd()*10):1e9;
  stageStartAt=performance.now();sessionStageOrdinal++;
  /* 5개 게임 공통 이벤트 표준(2026-08-22, Chief 확정) - 이름을 바꾸지 말 것.
     한 순간이 run_start(세션내 몇 번째 판)와 stage_enter(어느 스테이지)를 둘 다
     의미하므로 둘 다 보낸다(스키마 자체가 별개 이벤트로 받는다 - params 통합 안 함). */
  track("run_start",{run_no:sessionStageOrdinal});
  track("stage_enter",{id:id});
  const av=availableSeeds();selected=av[0];focusPlot=0;seedPickedByPlayer=false;
  prog={earned:0,harv:0,cropN:{},species:{},speciesN:0,fills:0,wasFull:false,withered:0,bestChain:0,harvCount:0};
  newCropThisStage=-1;
  if(id>1)for(let i=0;i<CROPS.length;i++)if(CROPS[i].unlock===id)newCropThisStage=i;
  running=true;finished=false;hintTimer=stage.id<=3?3.5:0;
  setScreen("play");
  buildRail();resize();layoutDirty=true;refreshGoals(true);refreshHud(true);
  if(newCropThisStage>=0&&!save.seen[newCropThisStage]){
    save.seen[newCropThisStage]=1;writeSave();
    /* Announce the new seed, but never steal the player's choice: a stage that
       asks for a specific crop, or a player who already picked by hand, keeps
       the current selection. The rail still flags the new seed as NEW. */
    const keepChoice=stage.goals.some(g=>g[0]==="crop");
    setTimeout(()=>{
      if(finished||!running||!stage||stage.id!==id)return;
      if(!keepChoice&&!seedPickedByPlayer)selectSeed(newCropThisStage,true);
      toast(fmt(t("rNewCrop"),{c:t("crops")[newCropThisStage]}));
    },700);
  }
  SFX.click();
}
function goalText(g){
  if(g[0]==="coin")return fmt(t("gCoin"),{n:g[1]});
  if(g[0]==="earn")return fmt(t("gEarn"),{n:g[1]});
  if(g[0]==="harv")return fmt(t("gHarv"),{n:g[1]});
  if(g[0]==="crop")return fmt(t("gCrop"),{n:g[1],c:t("crops")[g[2]]});
  if(g[0]==="chain")return fmt(t("gChain"),{n:g[1]});
  if(g[0]==="pure")return t("gPure");
  if(g[0]==="vary")return fmt(t("gVary"),{n:g[1]});
  if(g[0]==="full")return fmt(t("gFull"),{n:g[1]});
  return "";
}
function goalCur(g){
  if(!prog)return 0;
  switch(g[0]){
    case "coin":return Math.min(g[1],coins);
    case "earn":return Math.min(g[1],prog.earned);
    case "harv":return Math.min(g[1],prog.harv);
    case "crop":return Math.min(g[1],prog.cropN[g[2]]||0);
    case "chain":return Math.min(g[1],prog.bestChain);
    case "pure":return prog.withered?0:1;
    case "vary":return Math.min(g[1],prog.speciesN);
    case "full":return Math.min(g[1],prog.fills);
  }
  return 0;
}
const goalMax=g=>g[0]==="pure"?1:g[1];
const goalOk=g=>goalCur(g)>=goalMax(g);
function allGoalsOk(){return stage.goals.every(goalOk)}

function endStage(win,reason){
  if(finished)return;finished=true;running=false;
  const timeBonus=Math.round(Math.max(0,timeLeft)*3);
  const moveBonus=stage.moves?Math.max(0,movesLeft)*4:0;
  const score=win?Math.round(prog.earned+timeBonus+moveBonus+prog.bestChain*25):0;
  let stars=0;
  if(win){stars=1;if(score>=stage.s2)stars=2;if(score>=stage.s3)stars=3}
  const prevStars=save.stars[stage.id]||0,prevBest=save.best[stage.id]||0;
  let gained=0;
  if(win){
    if(stars>prevStars){gained+=(stars-prevStars)*10;save.stars[stage.id]=stars}
    if(prevStars===0)gained+=15;
    save.essence=(save.essence||0)+gained;
    if(score>prevBest)save.best[stage.id]=score;
    writeSave();
  }
  track("run_end",{result:win?"success":"fail",stage_or_course:stage.id,duration_ms:Math.round(performance.now()-stageStartAt)});
  if(!win)track("stage_exit",{id:stage.id,reason:"fail"});
  lastResult={win,reason,score,stars,gained,newBest:win&&score>prevBest&&prevBest>0,
              earned:prog.earned,harv:prog.harv,chain:prog.bestChain,timeLeft:Math.max(0,Math.ceil(timeLeft))};
  showResult();
  win?SFX.win():SFX.lose();
}

/* ------------------------------------------------------------ actions -- */
function spend(n){if(coins<n)return false;coins-=n;return true}
function useMove(){
  if(!stage.moves)return;
  movesLeft--;
  if(movesLeft<=0&&!allGoalsOk())scheduleEnd(false,"rFailMoves",320);
}
function act(i){
  if(!running||finished||i<0||i>=plots.length)return;
  focusPlot=i;const p=plots[i];
  /* 해충(pest) 반응형 방어 - 새 행동 종류: 지금까지 능동(심기/돌보기/수확)뿐이던
     입력에 처음 생기는 "제때 안 하면 손해" 리액션. 이동 소모 없음(무브 제한
     스테이지에서 불리해지지 않게). */
  if(p.pest){p.pest=false;p.pestT=0;burst(i,"#ffd166",10);ring(i,"#fff2c0");toast(t("pestGone"));SFX.stone();shake=4;return}
  if(p.stone){
    const c=stoneCost();
    if(!spend(c)){toast(fmt(t("stoneNeed"),{n:c}));SFX.bad();return}
    p.stone=false;burst(i,"#a9a08f",18);ring(i,"#cbbfa8");toast(t("stoneMsg"));SFX.stone();shake=6;useMove();return;
  }
  if(p.seed<0){
    const ci=selected,c=seedCost(ci);
    if(!spend(c)){toast(t("noCoins"));SFX.bad();return}
    if(discountNext)discountNext=false;
    p.seed=ci;p.growth=U(4)?0.18:0.01;p.ripe=0;p.tend=.5;p.pulse=1;p.tends=0;
    burst(i,CROPS[ci].a,9);ring(i,CROPS[ci].b);SFX.plant();useMove();return;
  }
  if(p.growth>=1){harvest(i);return}
  if(p.tend<=0){
    let push=tendPow();
    if(CROPS[p.seed].fx===1)push*=2;
    p.tends++;p.growth=Math.min(1,p.growth+push);p.tend=.72;p.pulse=1;
    floater(i,t("tend"),"#b7f8df");burst(i,"#8ae6ff",6);SFX.tend();
    if(p.growth>=1)ripen(i);
    useMove();
  }
}
let ripeBurst=0,ripeBurstAt=0;
function ripen(i){
  const p=plots[i];p.ripe=0;
  const now=performance.now();
  if(now-ripeBurstAt>900){ripeBurst=0;ripeBurstAt=now}
  ripeBurst++;
  /* only label the first couple in a wave — the glow halo already reads as RIPE */
  if(ripeBurst<=2)floater(i,t("ripe"),"#ffe9a8",false);
  burst(i,CROPS[p.seed].b,4,.45);
  if(ripeBurst<=3)SFX.ripe(p.seed);
}
function harvest(i){
  const p=plots[i],C=CROPS[p.seed];
  if(C.fx===14&&p.tends<2){ /* Nova Sunflower needs two tends */
    if(p.tend<=0){p.tends++;p.tend=.6;p.pulse=1;floater(i,t("tend"),"#ffe9a8");SFX.tend();
      if(p.tends>=2)ring(i,C.b);useMove()}
    return;
  }
  chain=chainClock>0?chain+1:1;
  let win2=chainWin();
  if(C.fx===3)win2+=1.6;
  chainClock=win2;bestChain=Math.max(bestChain,chain);prog.bestChain=bestChain;
  let v=C.val*valMul();
  const wm=wxAmp(WX[wxIdx].v),sm=wxAmp(SEA[stage.sea].v);
  if(C.fx!==13)v*=wm*sm;
  if(C.fx===2&&(wxIdx===0||wxIdx===4))v*=1.30;
  if(C.fx===8&&(wxIdx===5||wxIdx===1))v*=1.40;
  if(C.fx===9)v*=0.5+rnd()*1.7;
  /* 인접 보너스(companion) - 새 행동 종류: 지금까지 "아무 데나 심으면 그만"이던
     것에 처음 생기는 공간배치 결정. 4방(정원의 리듬 연구 시 대각선까지 8방) 중
     하나라도 다른 종이면 보너스. */
  if(COMPANION_FX.indexOf(C.fx)>=0){
    const n=view.n,c0=i%n,r0=i/n|0;
    const nb=[[1,0],[-1,0],[0,1],[0,-1]];
    if(U(17))nb.push([1,1],[1,-1],[-1,1],[-1,-1]);
    let hasDiff=false;
    for(const d of nb){const c2=c0+d[0],r2=r0+d[1];if(c2<0||c2>=n||r2<0||r2>=n)continue;
      const q=plots[r2*n+c2];if(q.seed>=0&&q.seed!==p.seed){hasDiff=true;break}}
    if(hasDiff)v*=U(15)?1.55:1.40;
  }
  if(C.fx===12)v*=1+0.12*(chain-1);
  if(C.fx===15)v+=9*prog.harvCount;
  v*=1+Math.min(chain-1,9)*(0.08+(U(7)?0.06:0));
  prog.harvCount++;
  if(U(9)&&prog.harvCount%8===0)v*=2;
  const gain=Math.max(1,Math.round(v));
  coins+=gain;prog.earned+=gain;
  /* 주문서(orders) - 새 행동 종류: 스테이지 시작 시 고정된 목표만 있던 것에
     처음 생기는 "플레이 도중 끼어드는" 임시 목표 = 우선순위 재조정. 순수
     upside(미완수 페널티 없음)이므로 리워드 자리로도 적합(설계만, 배선 안 함
     - Chief 지시). ★리워드 훅 자리: 아래 주문 완료 처리 직후, "보상 2배
     보기" 버튼을 완료 토스트/배너에 붙일 수 있다 - 지금은 구현하지 않는다. */
  if(orderActive&&p.seed===orderCrop){
    orderProg++;
    if(orderProg>=orderN){
      const bonus=Math.round(gain*(U(16)?3.0:2.2));
      coins+=bonus;prog.earned+=bonus;
      floater(i,"+"+bonus,"#ffd166",true);toast(t("orderDone"));SFX.goal();
      orderActive=false;orderTimer=(14+rnd()*10)*(U(16)?0.75:1);
    }
  }
  prog.harv+=(C.fx===7?2:1);
  prog.cropN[p.seed]=(prog.cropN[p.seed]||0)+1;
  if(!prog.species[p.seed]){prog.species[p.seed]=1;prog.speciesN++}
  /* Heart Lotus refunds time but can never push past the stage's own limit,
     otherwise a lotus farm makes timed stages endless. */
  if(C.fx===16&&stage.time&&timeLeft<stage.time){
    const add=Math.min(6,stage.time-timeLeft);timeLeft+=add;floater(i,"+"+Math.round(add)+t("sec"),"#8ae6ff");
  }
  if(C.fx===6)discountNext=true;
  if(C.fx===10){ /* Thunder Vine pushes neighbours */
    const n=view.n,c0=i%n,r0=i/n|0;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{
      const c2=c0+d[0],r2=r0+d[1];if(c2<0||c2>=n||r2<0||r2>=n)return;
      const q=plots[r2*n+c2];if(q.seed>=0&&q.growth<1){q.growth=Math.min(1,q.growth+.25);q.pulse=1;
        if(q.growth>=1)ripen(r2*n+c2);burst(r2*n+c2,"#ffe066",6)}
    });
    burst(i,"#ffe066",14);
  }
  floater(i,"+"+gain,C.c,true);burst(i,C.a,24,1.15);ring(i,C.b);
  SFX.harvest(chain);shake=Math.min(9,3+chain*.6);
  p.seed=-1;p.growth=0;p.ripe=0;p.tend=0;p.pulse=0;p.tends=0;
  useMove();
  checkWin();
}
/* A single pending end-of-stage timer. Without this guard checkWin() queued one
   timeout per frame, and leftovers instantly ended the *next* stage. */
let endTimer=0;
function scheduleEnd(win,reason,delay){
  if(finished||endTimer)return;
  running=false;
  endTimer=setTimeout(()=>{endTimer=0;endStage(win,reason)},delay);
}
function clearEnd(){if(endTimer){clearTimeout(endTimer);endTimer=0}}
function checkWin(){
  if(finished||endTimer)return;
  if(allGoalsOk()){flash();SFX.goal();toast(t("allDone"));scheduleEnd(true,null,750)}
}

/* --------------------------------------------------------------- loop -- */
function update(dt){
  if(screen!=="play"||!running||finished)return;
  const n=view.n;
  if(stage.time){
    timeLeft-=dt;dayT=1-Math.max(0,timeLeft)/stage.time;
    if(timeLeft<=0){timeLeft=0;endStage(allGoalsOk(),"rFailTime");return}
  }else{
    dayT=Math.min(1,dayT+dt/160);
  }
  if(chainClock>0){chainClock-=dt;if(chainClock<=0)chain=0}
  /* weather cycling */
  wxClock-=dt;
  if(wxClock<=0){
    const k=wxOrder.indexOf(wxIdx);wxIdx=wxOrder[(k+1)%wxOrder.length];
    wxClock=stage.time?Math.max(14,stage.time/(wxOrder.length+1)):20;
    toast(t("wx")[wxIdx]);SFX.click();
  }
  const gRate=wxAmp(WX[wxIdx].g)*wxAmp(SEA[stage.sea].g)*growMul();
  const wRate=WX[wxIdx].w*witherMul();
  if(U(3)){
    autoTendClock+=dt;
    if(autoTendClock>=7){
      autoTendClock=0;
      for(let i=0;i<plots.length;i++){const p=plots[i];
        if(p.seed>=0&&p.growth<1){p.growth=Math.min(1,p.growth+tendPow());p.pulse=1;burst(i,"#8ae6ff",4);
          if(p.growth>=1)ripen(i);break}}
    }
  }
  /* 해충(pest) 발생 스케줄러 - 스테이지 전체에서 한 번에 최대 1마리만 활성화
     (동시다발 두더지잡기 방지, Chief 확인①에 따라 완화한 설계). 면역 씨앗
     (PEST_IMMUNE_FX)은 후보에서 제외 - 그 씨앗을 심는 선택 자체가 안전판이 된다. */
  if(stage.pest){
    pestClock-=dt;
    if(pestClock<=0){
      const cand=[];
      for(let i=0;i<plots.length;i++){const q=plots[i];
        if(q.stone||q.pest||q.seed<0)continue;
        if(PEST_IMMUNE_FX.indexOf(CROPS[q.seed].fx)>=0)continue;
        cand.push(i);
      }
      if(cand.length){
        const pick=cand[Math.floor(rnd()*cand.length)];
        plots[pick].pest=true;plots[pick].pestT=U(14)?PEST_RESEARCH_WINDOW:PEST_BASE_WINDOW;
        burst(pick,"#ff9d5c",10);toast(t("pestArrive"));SFX.bad();
      }
      pestClock=16+rnd()*14;
    }
  }
  /* 주문서(orders) 타이머 - 완수 처리는 harvest() 안(해당 작물 수확 시)에서.
     미완수는 페널티 없음(순수 upside 설계, Chief 확인 반영). */
  if(stage.orders){
    if(orderActive){
      orderClock-=dt;
      if(orderClock<=0){orderActive=false;toast(t("orderMiss"));orderTimer=14+rnd()*10}
    }else{
      orderTimer-=dt;
      if(orderTimer<=0){
        const av=availableSeeds();
        orderCrop=av[Math.floor(rnd()*av.length)];
        orderN=2+Math.floor(rnd()*2);orderProg=0;orderClock=22;
        toast(fmt(t("orderStart"),{c:t("crops")[orderCrop],n:orderN}));SFX.click();
      }
    }
  }
  let filled=0,usable=0;
  for(let i=0;i<plots.length;i++){
    const p=plots[i];
    p.pulse=Math.max(0,p.pulse-dt*2.6);p.tend=Math.max(0,p.tend-dt);
    if(p.stone)continue;
    usable++;
    /* 해충이 붙은 밭은 "성장 정지"만 한다(즉시 시듦이 아니다 - Chief 확인①
       반영, 완화된 설계). 6초가 아니라 10초(연구시 14초) 반응 창을 준다.
       filled 카운트에서 빠지므로 "full N" 목표에는 그 시간만큼 불리해지는
       조용한 상호작용이 있다(의도적 - 해충의 새 부담, 별도 UI 불요). */
    if(p.pest){
      p.pestT-=dt;
      if(p.pestT<=0){
        p.pest=false;
        if(p.growth>=1){p.ripe=Math.max(p.ripe,12)} /* 기존 시듦 경로로 넘긴다 - 즉사 아님 */
        else{p.growth=Math.max(0,p.growth-0.15)} /* 성장 setback, 전량손실 아님 */
        if(rnd()<0.5){
          const c0=i%n,r0=i/n|0;
          const nbr=[[1,0],[-1,0],[0,1],[0,-1]].map(d=>[c0+d[0],r0+d[1]])
            .filter(([c2,r2])=>c2>=0&&c2<n&&r2>=0&&r2<n)
            .map(([c2,r2])=>r2*n+c2)
            .filter(j=>{const q=plots[j];return q.seed>=0&&!q.pest&&!q.stone&&PEST_IMMUNE_FX.indexOf(CROPS[q.seed].fx)<0});
          if(nbr.length){const j=nbr[Math.floor(rnd()*nbr.length)];plots[j].pest=true;plots[j].pestT=U(14)?PEST_RESEARCH_WINDOW:PEST_BASE_WINDOW}
        }
      }
      continue;
    }
    if(p.seed>=0){
      filled++;
      const C=CROPS[p.seed];
      if(p.growth<1){
        let r=gRate;
        if(C.fx===4&&(wxIdx===3||wxIdx===1))r*=1.6;
        if(C.fx===13)r=growMul()*1.02;
        p.growth=Math.min(1,p.growth+dt/C.grow*r);
        if(p.growth>=1)ripen(i);
      }else{
        if(C.fx!==11){
          p.ripe+=dt*wRate;
          if(p.ripe>15){
            burst(i,"#9a7c68",12);floater(i,t("withered"),"#c9a48c");
            p.seed=-1;p.growth=0;p.ripe=0;p.tends=0;chain=0;chainClock=0;
            prog.withered++;SFX.wither();toast(t("withered"));
            if(stage.goals.some(g=>g[0]==="pure")){scheduleEnd(false,"rFailPure",450);return}
          }
        }
      }
    }
  }
  if(usable>0&&filled>=usable){if(!prog.wasFull){prog.wasFull=true;prog.fills++;flash();SFX.goal()}}
  else prog.wasFull=false;
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;if(p.life<=0)particles.splice(i,1)}
  for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.life-=dt;f.y-=30*dt;if(f.life<=0)floaters.splice(i,1)}
  for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.life-=dt;r.r+=view.cell*1.5*dt;if(r.life<=0)rings.splice(i,1)}
  shake=Math.max(0,shake-dt*26);
  if(hintTimer>0){hintTimer-=dt;if(hintTimer<=0){
    const empty=plots.some(p=>!p.stone&&p.seed<0),ripeAny=plots.some(p=>p.seed>=0&&p.growth>=1);
    toast(ripeAny?t("hintHarvest"):empty?t("hintPlant"):t("hintTend"));
    hintTimer=stage.id<=3?14:0;
  }}
  checkWin();
}
/* 흙 밭 스프라이트: (크기, 변형 4, 심김 여부) 당 1회 — 라디얼 흙 + 이랑 + 위쪽 하이라이트 림 + 안쪽 그림자 */
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
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
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
}

function draw(){
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

/* ============================================================ HUD DOM == */
const hudCache={};
function setTxt(id,v){if(hudCache[id]!==v){hudCache[id]=v;$(id).textContent=v}}
function refreshHud(force){
  if(force)Object.keys(hudCache).forEach(k=>delete hudCache[k]);
  if(!stage)return;
  setTxt("lCoins",t("hCoins"));setTxt("vCoins",String(coins));
  if(stage.moves){setTxt("lTime",t("movesLeft"));setTxt("vTime",String(Math.max(0,movesLeft)))}
  else{setTxt("lTime",t("hTime"));setTxt("vTime",Math.ceil(Math.max(0,timeLeft))+t("sec"))}
  const warn=stage.time?timeLeft<=15:movesLeft<=6;
  $("timeStat").classList.toggle("warn",!!warn);
  setTxt("lWx",t("sea")[stage.sea]);
  setTxt("vWx",t("wx")[wxIdx]);
  const g=(wxAmp(WX[wxIdx].g)*wxAmp(SEA[stage.sea].g)*growMul()).toFixed(2);
  const v=(wxAmp(WX[wxIdx].v)*wxAmp(SEA[stage.sea].v)*valMul()).toFixed(2);
  /* B7 (2026-08-22): ▲/◈ were bare punctuation standing in for "growth
     multiplier" / "value multiplier" with no legend anywhere on screen —
     only the full sentence in aria-label/title (below) ever spelled it
     out, so a sighted user had no way to learn what the glyphs meant.
     Real icons (sprout = growth, gem = value) now carry a per-icon title
     tooltip in addition to the existing full aria-label on the parent
     stat, so the legend is discoverable at the glyph itself, not just via
     screen reader. Still compact enough for a 360px HUD. */
  const wxfxKey=g+"|"+v;
  if(hudCache._wxfx!==wxfxKey){
    hudCache._wxfx=wxfxKey;
    const gTitle=t("sGrow")+" x"+g,vTitle=t("sValue")+" x"+v;
    $("vWxFx").innerHTML=
      '<span class="wxFxItem wxFxGrow" title="'+gTitle+'">'+ICONS.grow+g+'</span>'+
      '<span class="wxFxItem wxFxValue" title="'+vTitle+'">'+ICONS.gem+v+'</span>';
  }
  const aria=t("hWeather")+": "+t("wx")[wxIdx]+", "+t("sea")[stage.sea]+", "+t("sGrow")+" x"+g+", "+t("sValue")+" x"+v;
  if(hudCache._wa!==aria){hudCache._wa=aria;$("wxStat").setAttribute("aria-label",aria);$("wxStat").title=aria}
  const ct=$("chainTag");
  if(chain>1){ct.textContent="x"+chain+" "+t("hCombo");ct.classList.add("on")}else ct.classList.remove("on");
  /* rail affordability — only touch the DOM when a value actually changes */
  for(const el of railEls){
    const ci=+el.dataset.crop,c=seedCost(ci),poor=coins<c?"1":"0";
    if(el._poor!==poor){el._poor=poor;el.dataset.poor=poor}
    if(el._c!==c){el._c=c;el.querySelector(".sc").textContent=c}
  }
}
let goalEls=[];
function refreshGoals(rebuild){
  const row=$("goalRow");
  if(rebuild){
    row.innerHTML="";goalEls=[];
    for(const g of stage.goals){
      const d=document.createElement("div");d.className="goal";
      d.innerHTML='<span class="gt"></span><span class="gn"></span>';
      row.appendChild(d);goalEls.push(d);
    }
  }
  stage.goals.forEach((g,i)=>{
    const el=goalEls[i];if(!el)return;
    const txt=goalText(g);
    if(el._t!==txt){el._t=txt;el.querySelector(".gt").textContent=txt}
    const cur=goalCur(g),mx=goalMax(g);
    const nt=g[0]==="pure"?(prog&&prog.withered?"0":"OK"):cur+"/"+mx;
    if(el._n!==nt){el._n=nt;el.querySelector(".gn").textContent=nt}
    const ok=cur>=mx;
    if(el._ok!==ok){
      const first=el._ok===undefined;      /* goals that start satisfied (e.g. "no wither") must not celebrate */
      el._ok=ok;el.classList.toggle("done",ok);
      if(ok&&running&&!first){SFX.goal();toast(t("goalDone"))}
    }
  });
}
/* 주문서(orders) HUD - 기존 #goalRow 에 «임시 목표칩»을 하나 더 넣는 방식으로
   재사용한다. 새 backdrop-filter 패널·새 반복렌더 컨테이너를 만들지 않았다
   (성능 레인 실측: 피고지고 draw비용이 4종 중 최악, .goal 반복렌더가 원인
   중 하나 - 여기 새 요소를 더 «만들지 않고» 기존 .goal 칩 «패턴 하나»만
   재사용해 인스턴스를 최소로 늘렸다). 15Hz HUD 갱신 주기에 맞춰서만 부른다
   (매 프레임 아님). */
function refreshOrderChip(){
  const row=$("goalRow");
  let el=document.getElementById("orderGoal");
  if(orderActive){
    if(!el){el=document.createElement("div");el.id="orderGoal";el.className="goal";
      el.innerHTML='<span class="gt"></span><span class="gn"></span>';row.appendChild(el);}
    const txt=fmt(t("orderGoalLabel"),{c:t("crops")[orderCrop]});
    if(el._t!==txt){el._t=txt;el.querySelector(".gt").textContent=txt}
    const nt=orderProg+"/"+orderN+" · "+Math.ceil(Math.max(0,orderClock))+t("sec");
    if(el._n!==nt){el._n=nt;el.querySelector(".gn").textContent=nt}
  }else if(el){el.remove();}
}
let railEls=[];
function buildRail(){
  const inner=$("railInner");inner.innerHTML="";railEls=[];
  const av=availableSeeds();
  const names=t("crops"),fxs=t("fx");
  for(const ci of av){
    const b=document.createElement("button");
    b.className="seed";b.type="button";b.dataset.crop=ci;
    b.dataset.on=ci===selected?"1":"0";
    b.title=names[ci]+" · "+fxs[CROPS[ci].fx];
    b.setAttribute("aria-label",names[ci]+", "+t("cost")+" "+seedCost(ci)+". "+fxs[CROPS[ci].fx]);
    const ic=document.createElement("div");ic.className="ico";ic.style.backgroundImage="url("+cropIcon(ci)+")";
    const nm=document.createElement("div");nm.className="sn2";nm.textContent=names[ci];
    const cs=document.createElement("div");cs.className="sc";cs.textContent=seedCost(ci);
    b.appendChild(ic);b.appendChild(nm);b.appendChild(cs);
    b.addEventListener("click",e=>{e.stopPropagation();selectSeed(ci)});
    inner.appendChild(b);railEls.push(b);
  }
  requestAnimationFrame(()=>{$("rail").dataset.scroll=inner.scrollWidth>inner.clientWidth+4?"1":"0"});
}
function selectSeed(ci,quiet){
  selected=ci;
  if(!quiet)seedPickedByPlayer=true;
  railEls.forEach(el=>el.dataset.on=(+el.dataset.crop===ci)?"1":"0");
  const el=railEls.find(e=>+e.dataset.crop===ci);
  if(el&&el.scrollIntoView)try{el.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}catch(_){}
  if(quiet)return;
  SFX.click();
  toast(t("crops")[ci]+" · "+t("fx")[CROPS[ci].fx]);
}

/* ========================================================= screen mgmt = */
/* ★2026-08-23 President 지적 반영 — attend 를 SCREENS 에서 «뺐다».
   setScreen() 은 SCREENS 전체를 `toggle("hidden", k!==s)` 하므로 여기 들어
   있으면 출석 화면이 홈(#scTitle)을 «대체»한다. 출석은 이제 화면이 아니라
   홈 «위»의 오버레이다 — openAttend()/closeAttend() 가 따로 소유한다. */
const SCREENS={title:"scTitle",map:"scMap",lab:"scLab",result:"scResult",pause:"scPause",tut:"scTut"};
function setScreen(s){
  screen=s;
  if(s!=="play")track("screen_view",{screen:s}); /* play 는 run_start/stage_enter 가 이미 더 풍부하게 잡는다 */
  for(const k in SCREENS)$(SCREENS[k]).classList.toggle("hidden",k!==s);
  const playing=(s==="play");
  $("hud").classList.toggle("hidden",!playing);
  $("rail").classList.toggle("hidden",!playing);
  if(s==="pause"){$("hud").classList.remove("hidden");$("rail").classList.remove("hidden")}
  if(s==="title"||s==="map"||s==="lab"){
    /* the menu garden follows how far the player has come through the chapters */
    ambientSeason=stageById(maxUnlocked()).sea;wxIdx=[0,0,2,1][ambientSeason];dayT=.16;
  }
  setTimeout(()=>{resize()},30);
}
/* ---- title ---- */
/**
 * 트랙K 긴급수정(2026-08-03): 버튼별 실패 격리. President 실기기에서 "플레이"는
 * 글자가 있고(잘렸지만) 그 아래 4개 버튼은 텍스트가 아예 없는 사고가 났다 — 코드
 * 추적 결과 이 함수가 위에서 아래로 동기 실행되다 하나가 던지면 그 아래 전부
 * 멈추는 구조였다(정적 HTML도 전부 빈 태그라 JS 실패 시 영구 공백). 각 줄을
 * 개별 try/catch로 감싸 하나가 실패해도 나머지는 채워지게 한다. [가설 수정 —
 * 정확한 예외 지점은 실기기 콘솔 없이 특정 못 함, "해결"로 표기하지 않는다]
 */
function safeSet(id,fn){
  try{const v=fn();const el=$(id);if(el)el.textContent=v}
  catch(e){console.error("[refreshTitle] failed to set #"+id,e)}
}
/* B8 (2026-08-22): sound toggle needs an icon *and* its on/off text (icon
   alone would be an icon-only toggle with no visible state label; text
   alone was the inconsistency the audit flagged against the rest of the
   icon vocabulary). safeSetHtml mirrors safeSet's per-call try/catch. */
function safeSetHtml(id,fn){
  try{const v=fn();const el=$(id);if(el)el.innerHTML=v}
  catch(e){console.error("[refreshTitle] failed to set #"+id,e)}
}
function soundBtnHtml(){return (save.sound?ICONS.soundOn:ICONS.soundOff)+"<span>"+(save.sound?t("soundOn"):t("soundOff"))+"</span>"}
/* 출석 오버레이 - 단일 컨테이너(#scAttend) 안에 배지 7개(간단한 span, 새
   backdrop-filter/반복 이펙트 없음)만 그린다.
   ★2026-08-23 — 「화면」이 아니라 홈 «위»에 뜨는 오버레이로 바뀌었다. 설계
     근거는 index.html 의 #scAttend CSS 블록 주석 참고. 여기는 그 배선이다.
   ⛔출석 «판정·지급» 로직(attendanceStatus/claimAttendance/ATN_CURVE/저장키
     atnDate·atnStreak)은 1바이트도 안 건드렸다. 바꾼 건 «어떻게 띄우고 닫는가»
     뿐이다. */
let pendingAttend=null;
function refreshAttend(st){
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

/* ---- 출석 오버레이 열고/닫기 ------------------------------------------- */
let attendOpen=false,atnInsetTimer=0;
/* 시작화면 상·하단 배너(src/startBanner.ts, #wrap 의 z-index:11)는 오버레이가
   뜬 «뒤»에 비동기로 붙는다(SDK init -> 250ms 폴링 -> attachBanner). 즉 열릴
   때 높이를 한 번 재는 것으로는 부족하다. 열려 있는 «동안만» 실측 높이를 읽어
   오버레이 패딩(--atnTop/--atnBot)에 반영해 카드가 배너 위로 올라타지 않게 한다.
   ⛔닫으면 즉시 clearInterval — 상시 타이머를 남기지 않는다(성능 레인 지침). */
function syncAttendInsets(){
  const ov=$("scAttend");if(!ov)return;
  const GAP=8;
  const t0=document.getElementById("start-ad-top");
  const b0=document.getElementById("start-ad-bottom");
  const th=t0?Math.round(t0.getBoundingClientRect().height):0;
  const bh=b0?Math.round(b0.getBoundingClientRect().height):0;
  ov.style.setProperty("--atnTop",(th>0?th+GAP:0)+"px");
  ov.style.setProperty("--atnBot",(bh>0?bh+GAP:0)+"px");
}
function openAttend(){
  const ov=$("scAttend");if(!ov)return;
  attendOpen=true;
  ov.classList.remove("hidden");
  ov.setAttribute("aria-hidden","false");
  /* 뒤의 홈을 «비활성»으로. inert 는 포커스·클릭·스크린리더를 한 번에 끊는다.
     미지원 브라우저에서는 단순 프로퍼티 대입이 되고 말 뿐이라 해가 없다
     (그 경우에도 오버레이 스크림이 클릭을 막는다). */
  const home=$("scTitle");
  if(home){home.setAttribute("aria-hidden","true");try{home.inert=true}catch(_){}}
  syncAttendInsets();
  clearInterval(atnInsetTimer);atnInsetTimer=setInterval(syncAttendInsets,250);
  track("screen_view",{screen:"attend"}); /* SCREENS 에서 뺐으므로 계측을 여기서 유지 */
  /* 포커스는 «다이얼로그 컨테이너»가 받는다 — 버튼에 주면 터치로 열었는데도
     :focus-visible 금색 링이 그려진다(헤드리스 실측). 근거는 index.html 의
     #scAttend:focus 주석 참고. */
  try{ov.focus({preventScroll:true})}catch(_){}
}
function closeAttend(){
  const ov=$("scAttend");if(!ov)return;
  attendOpen=false;
  ov.classList.add("hidden");
  ov.setAttribute("aria-hidden","true");
  const card=$("aCard");if(card)card.classList.remove("nudge");
  const home=$("scTitle");
  if(home){home.removeAttribute("aria-hidden");try{home.inert=false}catch(_){}}
  clearInterval(atnInsetTimer);atnInsetTimer=0;
  pendingAttend=null;
}
/* 스크림(카드 «바깥») 탭 = 닫기가 «아니다». 근거: 이 오버레이의 행동은
   「받기」 하나뿐이고 그건 «공짜 보상»이다. 스치듯 누른 스크림 탭 하나로
   오늘치 보상이 조용히 날아가는 쪽이, 닫는 수단이 하나 적은 것보다 훨씬 나쁜
   실패다. 대신 «아무 반응도 없으면 갇힌 느낌»이 되므로 iOS 시스템 얼럿과 같은
   관용구로 응답한다 — 해야 할 버튼으로 포커스를 옮기고(감속모드에서도 유효)
   짧게 흔든다(감속모드에서는 흔들지 않는다). 의도적인 이탈 수단은 «뒤로가기»다. */
function nudgeAttend(){
  const card=$("aCard");if(!card)return;
  try{$("aClaim").focus({preventScroll:true})}catch(_){}
  card.classList.remove("nudge");
  void card.offsetWidth; /* 리플로우 강제 - 연속 탭에서도 매번 다시 재생된다 */
  card.classList.add("nudge");
}
function refreshTitle(){
  /* B5 (2026-08-22, Chief-approved): the eyebrow used to repeat catalog
     counts ("24 stages · 18 seeds · 14 research nodes") directly above
     .titleStats, which already shows the player's own numbers in the same
     dot-separated layout right below it — two back-to-back "N · N · N"
     lines is the flagged AI tell. Eyebrow content removed; #tKicker stays
     in the markup (unused) rather than deleted, so nothing else that
     references the id needs to change. */
  safeSet("tTitle",()=>t("title"));
  safeSet("tTagline",()=>t("tagline"));
  safeSet("tStarLbl",()=>t("totalStars"));
  safeSet("tStarVal",()=>totalStars()+"/"+(STAGES.length*3));
  safeSet("tStageLbl",()=>t("stagesLbl"));
  safeSet("tStageVal",()=>clearedCount()+"/"+STAGES.length);
  safeSet("tEssLbl",()=>t("essence"));
  safeSet("tEssVal",()=>save.essence||0);
  safeSet("btnPlay",()=>{const started=clearedCount()>0;return started?(t("cont")+" · "+t("stageWord")+" "+maxUnlocked()):t("play")});
  safeSet("btnMap",()=>t("map"));
  safeSet("btnLab",()=>t("upgrades"));
  safeSet("btnHow",()=>t("howTo"));
  safeSetHtml("btnSound",soundBtnHtml);
  try{$("btnSound").setAttribute("aria-label",t("ariaSound"))}catch(e){console.error("[refreshTitle] btnSound aria-label",e)}
  safeSet("tVer",()=>{const nextChap=t("chapters")[stageById(maxUnlocked()).ch];return nextChap+" · "+t("stageWord")+" "+maxUnlocked()+"/"+STAGES.length});
}
/* ---- map ---- */
/* Wordy locales (de/ru) used to lose a whole second goal to an ellipsis.
   Nothing is clipped any more: the type shrinks a few tenths at a time and,
   if even the smallest legible size still needs more room, the card grows. */
const SGOAL_BASE=10.5,SGOAL_MIN=8,SGOAL_MAXH=Math.round(SGOAL_BASE*1.34*5);
function fitGoals(){
  const els=$("mapList").querySelectorAll(".sgoal");
  for(const el of els){
    el.style.removeProperty("--sgf");
    if(el.scrollHeight<=SGOAL_MAXH)continue;
    let fs=SGOAL_BASE;
    for(let i=0;i<6&&fs>SGOAL_MIN;i++){
      fs=Math.max(SGOAL_MIN,fs-.5);
      el.style.setProperty("--sgf",fs+"px");
      if(el.scrollHeight<=SGOAL_MAXH)break;
    }
  }
}
let fitPending=false;
function fitGoalsSoon(){
  if(fitPending)return;fitPending=true;
  requestAnimationFrame(()=>{fitPending=false;if($("mapList").firstChild)fitGoals()});
}
function buildMap(){
  const host=$("mapList");host.innerHTML="";
  $("mapTitle").textContent=t("stageSelect");
  $("mapSub").textContent=t("stageSub");
  $("mapStarLbl").textContent=t("totalStars");
  $("mapStarVal").textContent=totalStars()+"/"+(STAGES.length*3);
  $("mapLab").textContent=t("upgrades");
  $("mapLab").setAttribute("aria-label",t("labTitle"));
  const unlocked=maxUnlocked();
  const chapters=t("chapters"),csub=t("chapterSub");
  /* 하드코딩 4 -> chapters.length(2026-08-22). 5장/6장 신규요소 확장 전에는
     STAGES 의 ch 값이 0~3 뿐이라 안 드러났던 하드코딩이다 - buildMap 이 맵
     화면에 4챕터까지만 그리고 있었다(실측: 5/6장 카드 0개 렌더). 다른 곳은
     전부 STAGES.length·t("chapters") 처럼 이미 동적이라 이 한 곳만 고쳤다. */
  for(let ch=0;ch<chapters.length;ch++){
    const list=STAGES.filter(s=>s.ch===ch);
    const sec=document.createElement("div");sec.className="chapter";
    let got=0,tot=list.length*3;list.forEach(s=>got+=save.stars[s.id]||0);
    const hd=document.createElement("div");hd.className="chapHead";
    hd.innerHTML='<h3></h3><div class="cs"></div><div class="cstar"></div>';
    hd.querySelector("h3").textContent=chapters[ch];
    hd.querySelector(".cs").textContent=csub[ch];
    hd.querySelector(".cstar").textContent="★ "+got+"/"+tot;
    sec.appendChild(hd);
    const grid=document.createElement("div");grid.className="stageGrid";
    for(const s of list){
      const b=document.createElement("button");b.className="stageCard";b.type="button";
      const locked=s.id>unlocked,stars=save.stars[s.id]||0;
      if(locked)b.classList.add("locked");
      if(stars>0)b.classList.add("cleared");
      if(s.id===unlocked&&!locked)b.classList.add("next");
      const goalStr=s.goals.map(goalText).join(" · ");
      b.innerHTML='<span class="sn"></span><span class="sg"></span><span class="sgoal"></span><span class="stars"></span>';
      b.querySelector(".sn").textContent=s.id;
      b.querySelector(".sg").textContent=s.grid+"x"+s.grid+" · "+(s.moves?fmt(t("limMoves"),{n:s.moves}):fmt(t("limTime"),{n:s.time}))+(s.stones?" · ◆"+s.stones:"");
      b.querySelector(".sgoal").textContent=goalStr;
      if(locked)b.setAttribute("aria-label",t("stageWord")+" "+s.id+": "+fmt(t("unlockAt"),{n:s.id-1}));
      const sw=b.querySelector(".stars");
      for(let k=0;k<3;k++){const i2=document.createElement("i");i2.className="st"+(k<stars?" on":"");sw.appendChild(i2)}
      /* NEW only where a fresh seed is actually waiting to be discovered */
      const nc=s.id>1?CROPS.findIndex(c=>c.unlock===s.id):-1;
      if(nc>=0&&!locked&&stars===0&&!save.seen[nc]){
        const nb=document.createElement("span");nb.className="newBadge";nb.textContent=t("newTag");b.appendChild(nb);
      }
      if(locked){b.disabled=true;const l=document.createElement("span");l.className="lock";l.innerHTML=ICONS.lock;b.appendChild(l)}
      else b.addEventListener("click",()=>{if(!save.tut){pendingStage=s.id;openTut()}else startStage(s.id)});
      grid.appendChild(b);
    }
    sec.appendChild(grid);host.appendChild(sec);
  }
  fitGoalsSoon();
}
/* ---- lab ---- */
function buildLab(){
  $("labTitle").textContent=t("labTitle");
  $("labSub").textContent=t("labSub");
  $("labEssLbl").textContent=t("essence");
  $("labEssVal").textContent=save.essence||0;
  const host=$("labTree");host.innerHTML="";
  const names=t("upg"),descs=t("upgD"),brs=t("branches");
  for(let b=0;b<3;b++){
    const col=document.createElement("div");col.className="branch b"+b;
    const h=document.createElement("h4");h.textContent=brs[b];col.appendChild(h);
    for(const idx of BRANCH_ORDER[b]){
      const u=UPG[idx],owned=U(idx),reqOk=u.req<0||U(u.req);
      const afford=!owned&&reqOk&&(save.essence||0)>=u.cost;
      const btn=document.createElement("button");btn.className="node"+(owned?" owned":"")+(!reqOk?" blocked":"")+(afford?" afford":"");
      btn.type="button";
      btn.innerHTML='<div class="nh"><span class="dot"></span><span class="nn"></span><span class="nc"></span></div><div class="nd"></div><div class="ns"></div>';
      btn.querySelector(".nn").textContent=names[idx];
      btn.querySelector(".nc").textContent=u.cost+" ◇";
      btn.querySelector(".nd").textContent=descs[idx];
      btn.querySelector(".ns").textContent=owned?t("uOwned"):(!reqOk?t("uLocked"):(afford?t("uBuy"):t("uNoEssence")));
      if(!owned&&reqOk)btn.addEventListener("click",()=>buyNode(idx));
      else btn.disabled=true;
      col.appendChild(btn);
    }
    host.appendChild(col);
  }
}
function buyNode(i){
  const u=UPG[i];
  if(U(i))return;
  if(u.req>=0&&!U(u.req)){toast(t("uLocked"));SFX.bad();return}
  if((save.essence||0)<u.cost){toast(t("uNoEssence"));SFX.bad();return}
  save.essence-=u.cost;save.upg[i]=1;writeSave();
  toast(t("uDone")+" · "+t("upg")[i]);SFX.buy();buildLab();
}
/* ---- result ---- */
function showResult(){
  const R=lastResult;
  $("rKicker").textContent=t("rKicker");
  $("rTitle").textContent=R.win?t("rWin"):t("rLose");
  const sw=$("resStars").children;
  for(let i=0;i<3;i++){sw[i].className="st big";}
  setTimeout(()=>{
    for(let i=0;i<R.stars;i++)setTimeout(()=>{sw[i].className="st big on pop";SFX.star(i)},i*260);
    for(let i=R.stars;i<3;i++)sw[i].className="st big pop";
  },200);
  const rows=[[t("rScore"),R.score],[t("rCoins"),R.earned],[t("rHarv"),R.harv],[t("rCombo"),"x"+R.chain]];
  if(stage.time)rows.push([t("rTime"),R.timeLeft+t("sec")]);
  if(R.win)rows.push([t("rEssence"),"+"+R.gained+" ◇"]);
  if(!R.win&&R.reason)rows.push(["",t(R.reason)]);
  const host=$("rStats");host.innerHTML="";
  for(const [k,v] of rows){const d=document.createElement("div");
    d.innerHTML='<span></span><b></b>';d.children[0].textContent=k;d.children[1].textContent=v;host.appendChild(d)}
  const ban=$("rBanner");
  let bt="";
  if(R.win&&R.newBest)bt=t("rNewBest");
  const nxt=stage.id+1;
  if(R.win&&nxt<=STAGES.length){
    const nc=CROPS.findIndex(c=>c.unlock===nxt);
    if(nc>=0)bt=(bt?bt+"  ·  ":"")+fmt(t("rNewCrop"),{c:t("crops")[nc]});
  }
  ban.textContent=bt;ban.classList.toggle("hidden",!bt);
  $("rMap").textContent=t("map");$("rRetry").textContent=t("retry");
  const canNext=R.win&&stage.id<STAGES.length;
  $("rNext").textContent=canNext?t("next"):t("retry");
  $("rNext").style.display=canNext?"":"none";
  $("rRetry").style.display=canNext?"":"none";
  if(!canNext){$("rNext").style.display="";$("rNext").textContent=t("retry")}
  setScreen("result");
}
/* ---- tutorial ---- */
let pendingStage=1;
function openTut(){tutStep=0;renderTut();setScreen("tut")}
function renderTut(){
  $("uKicker").textContent=t("howTo")+" · "+(tutStep+1)+"/4";
  $("uTitle").textContent=t("tutT")[tutStep];
  $("uBody").textContent=t("tutB")[tutStep];
  const d=$("uDots").children;for(let i=0;i<4;i++)d[i].className=i===tutStep?"on":"";
  $("uSkip").textContent=t("tutSkip");
  $("uNext").textContent=tutStep<3?t("tutNext"):t("tutDone");
  drawTutArt(tutStep);
}
function drawTutArt(step){
  const c=$("tutCanvas"),g=c.getContext("2d");
  const W=c.width,H=c.height;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#12464a");gr.addColorStop(1,"#07272e");
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  const cellW=W/3;
  for(let i=0;i<3;i++){
    const x=i*cellW+14,y=44,s=cellW-28;
    g.beginPath();g.roundRect(x,y,s,s,14);
    const soil=g.createRadialGradient(x+s*.45,y+s*.3,2,x+s*.5,y+s*.55,s*.8);
    soil.addColorStop(0,"#7b5a41");soil.addColorStop(1,"#2b2620");
    g.fillStyle=soil;g.fill();
    g.strokeStyle=(step===0&&i===1)||(step===1&&i===1)||(step===2)?"#ffd166":"rgba(199,255,229,.16)";
    g.lineWidth=(step<3&&i===1)||step===2?3:1.5;g.stroke();
  }
  const cy=44+(cellW-28)*.5+cellW*.04,cr=cellW*.30;
  g.textAlign="center";g.textBaseline="middle";
  if(step===0){
    /* a seed card, an empty bed to aim at, and the sprout that results */
    drawCropOn(g,5,1,cellW*.5,cy,cr,0,false);
    g.fillStyle="rgba(255,209,102,.85)";g.font="700 34px "+FONT;
    g.fillText("+",cellW*1.5,cy);
    drawCropOn(g,5,.34,cellW*2.5,cy,cr,0,false);
    g.strokeStyle="rgba(255,209,102,.9)";g.lineWidth=2.5;g.setLineDash([5,5]);
    g.beginPath();g.moveTo(cellW*.5+cr*.7,cy-cr*.2);g.lineTo(cellW*1.5-cr*.5,cy-cr*.2);g.stroke();
    g.setLineDash([]);
  }else if(step===1){
    drawCropOn(g,0,.3,cellW*.5,cy,cr,0,false);
    drawCropOn(g,0,.72,cellW*1.5,cy,cr,0,false);
    drawCropOn(g,0,1,cellW*2.5,cy,cr,0,true);
    g.fillStyle="#8ae6ff";g.font="700 22px "+FONT;
    g.fillText("›",cellW,cy-cr*.1);g.fillText("›",cellW*2,cy-cr*.1);
  }else if(step===2){
    drawCropOn(g,2,1,cellW*.5,cy,cr,0,true);
    drawCropOn(g,5,1,cellW*1.5,cy,cr,0,true);
    drawCropOn(g,7,1,cellW*2.5,cy,cr,0,true);
    g.fillStyle="#ffd166";g.font="700 19px "+FONT;g.fillText("x1   x2   x3",W/2,24);
  }else{
    drawCropOn(g,7,1,cellW*.5,cy,cr,0,false);
    drawCropOn(g,13,1,cellW*1.5,cy,cr,0,false);
    drawCropOn(g,17,1,cellW*2.5,cy,cr,0,false);
    g.font="700 17px "+FONT;
    for(let i=0;i<3;i++){
      g.fillStyle="#ffd166";
      g.fillText("★",W/2-24+i*24,24);
    }
  }
}
/* ---- pause ---- */
function refreshPause(){
  $("pKicker").textContent=t("pausedKick");
  $("pTitle").textContent=t("paused");
  $("pHint").textContent=t("resumeHint");
  $("pResume").textContent=t("resume");
  $("pRestart").textContent=t("restart");
  $("pQuit").textContent=t("quitStage");
  $("pSound").innerHTML=soundBtnHtml();
}
function togglePause(){
  if(screen==="play"){running=false;refreshPause();setScreen("pause")}
  else if(screen==="pause"){running=true;setScreen("play");last=performance.now()}
}

/* ============================================================== input == */
function pointerPos(e){
  const r=canvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)*view.w/r.width,y:(e.clientY-r.top)*view.h/r.height};
}
canvas.addEventListener("pointerdown",e=>{
  if(screen!=="play")return;
  e.preventDefault();
  const p=pointerPos(e),n=view.n;
  if(p.x>=view.x&&p.x<view.x+view.board&&p.y>=view.y&&p.y<view.y+view.board){
    const c=Math.floor((p.x-view.x)/view.cell),r=Math.floor((p.y-view.y)/view.cell);
    if(c>=0&&c<n&&r>=0&&r<n)act(r*n+c);
  }
},{passive:false});
canvas.addEventListener("contextmenu",e=>e.preventDefault());

addEventListener("keydown",e=>{
  if(e.code==="Escape"){
    if(screen==="play"||screen==="pause")togglePause();
    else if(screen==="map"||screen==="lab"){setScreen("title");refreshTitle()}
    e.preventDefault();return;
  }
  if(screen==="tut"){if(e.code==="Enter"||e.code==="Space"){tutNext();e.preventDefault()}return}
  if(screen==="title"){if(e.code==="Enter"||e.code==="Space"){goPlay();e.preventDefault()}return}
  if(screen==="result"){if(e.code==="Enter"||e.code==="Space"){$("rNext").click();e.preventDefault()}return}
  if(screen!=="play")return;
  if(e.code==="KeyP"){togglePause();e.preventDefault();return}
  const av=availableSeeds();
  const dm=/^(Digit|Numpad)([1-9])$/.exec(e.code);
  if(dm){const k=+dm[2]-1;if(av[k]!==undefined)selectSeed(av[k]);e.preventDefault();return}
  if(e.code==="KeyQ"||e.code==="BracketLeft"){const k=av.indexOf(selected);selectSeed(av[(k-1+av.length)%av.length]);e.preventDefault();return}
  if(e.code==="KeyE"||e.code==="BracketRight"){const k=av.indexOf(selected);selectSeed(av[(k+1)%av.length]);e.preventDefault();return}
  const n=view.n;let c=focusPlot%n,r=focusPlot/n|0;
  if(e.code==="ArrowLeft"||e.code==="KeyA")c=(c+n-1)%n;
  else if(e.code==="ArrowRight"||e.code==="KeyD")c=(c+1)%n;
  else if(e.code==="ArrowUp"||e.code==="KeyW")r=(r+n-1)%n;
  else if(e.code==="ArrowDown"||e.code==="KeyS")r=(r+1)%n;
  else if(e.code==="Enter"||e.code==="Space"){act(focusPlot);e.preventDefault();return}
  else return;
  focusPlot=r*n+c;e.preventDefault();
});
/* store review requires audio to stop while backgrounded: the scheduler is
   torn down as well as the context, and both come back on return */
function audioSuspend(){
  if(bgmTimer){clearInterval(bgmTimer);bgmTimer=0}
  if(actx){try{actx.suspend()}catch(_){}}
}
function audioResume(){
  if(actx&&save.sound){try{actx.resume()}catch(_){}}
  if(bgmOn&&save.sound&&!bgmTimer){bgmNext=0;bgmTimer=setInterval(bgmSchedule,140)}
}
addEventListener("blur",()=>{audioSuspend();if(screen==="play"){running=false;refreshPause();setScreen("pause")}});
addEventListener("focus",()=>{if(!document.hidden)audioResume()});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){audioSuspend();if(screen==="play"){running=false;refreshPause();setScreen("pause")}}
  else audioResume();
});

/* ------------------------------------------------------------ buttons -- */
function goPlay(){
  if(!save.tut){pendingStage=maxUnlocked();openTut();return}
  startStage(maxUnlocked());
}
function tutNext(){
  if(tutStep<3){tutStep++;renderTut();SFX.click()}
  else{save.tut=true;writeSave();startStage(pendingStage||1)}
}
$("btnPlay").addEventListener("click",()=>{pendingStage=maxUnlocked();goPlay()});
$("aClaim").addEventListener("click",()=>{
  const got=claimAttendance();
  if(got){SFX.claim();toast(fmt(t("attendReward"),{n:got.reward}))}
  closeAttend();
  refreshTitle();  /* 정수 칩에 방금 받은 보상이 반영돼야 한다 */
});
/* 스크림 탭 = 닫기 아님(위 nudgeAttend 주석의 근거). 카드 «자신»을 눌렀을 때는
   아무 일도 없어야 하므로 target 이 오버레이 «본체»일 때만 반응한다. */
$("scAttend").addEventListener("click",e=>{if(e.target===e.currentTarget)nudgeAttend()});
/* ---- 출석 오버레이와 «뒤로가기» ---------------------------------------
   ⛔사고 방지: 오버레이가 떠 있는 동안 뒤로가기가 「앱 종료 확인」까지 내려가면
     안 된다. src/toss/navigationBar.ts 의 handleBack 은 «LIFO»(나중에 등록된
     핸들러가 먼저)로 돌고, 등록 순서는
       ① installExitConfirm()  ② 광고 계수 핸들러  ③ «여기»(game.js 주입이 마지막)
     이므로 이 핸들러가 «가장 먼저» 실행된다. 오버레이가 열려 있으면 true 를
     반환해 «소비»한다 = 종료확인 모달도, 광고 이탈 계수도 타지 않는다
     (사용자는 앱을 나가는 게 아니라 팝업을 닫는 것이다).
     닫혀 있으면 false 를 반환해 원래 동작(광고 계수 -> 종료확인)을 그대로 둔다.
   ★뒤로가기는 «의도적인» 이탈 제스처라 여기서는 닫기를 허용한다. 저장은
     건드리지 않으므로 오늘치 보상은 «소멸이 아니라 미수령» 상태로 남는다. */
try{
  if(typeof window.__gcPushBack==="function"){
    window.__gcPushBack(()=>{ if(attendOpen){closeAttend();return true} return false });
  }else{
    console.warn("[attend] __gcPushBack 미노출 - 뒤로가기 우선순위 배선 안 됨");
  }
}catch(e){console.error("[attend] back handler 등록 실패",e)}
/* 데스크톱·외부 키보드 대응. 뒤로가기와 같은 «의도적 이탈» 취급. */
addEventListener("keydown",e=>{if(attendOpen&&e.key==="Escape"){e.preventDefault();closeAttend()}});
$("btnMap").addEventListener("click",()=>{buildMap();setScreen("map");SFX.click()});
$("btnLab").addEventListener("click",()=>{buildLab();setScreen("lab");SFX.click()});
$("btnHow").addEventListener("click",()=>{pendingStage=maxUnlocked();openTut();SFX.click()});
$("btnSound").addEventListener("click",()=>{
  save.sound=!save.sound;writeSave();
  /* one switch drives both buses: music and effects */
  if(!save.sound){bgmStop(.25);if(actx){try{actx.suspend()}catch(_){}}}
  else{bgmKicked=true;SFX.click();bgmStart()}
  refreshTitle();
});
$("mapBack").addEventListener("click",()=>{setScreen("title");refreshTitle();SFX.click()});
$("mapLab").addEventListener("click",()=>{buildLab();setScreen("lab");SFX.click()});
$("labBack").addEventListener("click",()=>{buildMap();setScreen("map");SFX.click()});
$("pauseBtn").addEventListener("click",e=>{e.stopPropagation();togglePause()});
$("pResume").addEventListener("click",()=>togglePause());
$("pRestart").addEventListener("click",()=>startStage(stage.id));
$("pQuit").addEventListener("click",()=>{
  /* "이탈" 계측 지점 - 배경전환(blur/visibilitychange)은 이미 자동 일시정지라
     "이탈"로 보지 않는다(모호함). 명시적 나가기 버튼만 깨끗한 신호다. */
  if(stage&&!finished)track("stage_exit",{id:stage.id,reason:"quit"});
  buildMap();setScreen("map");refreshTitle();
});
$("pSound").addEventListener("click",()=>{
  save.sound=!save.sound;writeSave();
  if(!save.sound){bgmStop(.25);audioSuspend()}
  else{bgmKicked=true;SFX.click();bgmStart()}
  refreshPause();
});
$("uSkip").addEventListener("click",()=>{save.tut=true;writeSave();startStage(pendingStage||1)});
$("uNext").addEventListener("click",tutNext);
$("rMap").addEventListener("click",()=>{buildMap();setScreen("map");SFX.click()});
$("rRetry").addEventListener("click",()=>startStage(stage.id));
$("rNext").addEventListener("click",()=>{
  const R=lastResult;
  if(R&&R.win&&stage.id<STAGES.length)startStage(stage.id+1);
  else startStage(stage.id);
});

/* ------------------------------------------------------------- i18n UI - */
function applyLang(){
  document.documentElement.lang=curLang;
  document.title=t("title");
  canvas.setAttribute("aria-label",t("ariaGame"));
  $("pauseBtn").setAttribute("aria-label",t("ariaPause"));
  $("mapBack").setAttribute("aria-label",t("ariaBack"));
  $("labBack").setAttribute("aria-label",t("ariaBack"));
  document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===curLang));
  refreshTitle();
  /* 출석 오버레이는 이제 «화면»이 아니라서 screen 변수로 잡히지 않는다.
     열려 있으면 같은 데이터로 다시 그린다(로케일 전환 대응). */
  if(attendOpen&&pendingAttend)refreshAttend(pendingAttend);
  if(screen==="map")buildMap();
  if(screen==="lab")buildLab();
  if(screen==="tut")renderTut();
  if(screen==="pause")refreshPause();
  if(stage&&(screen==="play"||screen==="pause")){buildRail();refreshGoals(true);refreshHud(true)}
  if(screen==="result"&&lastResult)showResult();
}
function setLang(code){
  if(!I18N[code])return;
  curLang=code;save.lang=code;writeSave();applyLang();
}
function initLang(){
  const nav=(navigator.language||'ko').slice(0,2).toLowerCase();
  curLang=(save.lang&&I18N[save.lang])?save.lang:(I18N[nav]?nav:'ko');
  const row=$("langRow");row.innerHTML="";
  for(const code of LANG_ORDER){
    const b=document.createElement("button");b.type="button";b.className="lang-btn";
    b.textContent=I18N[code].name;b.dataset.lang=code;
    b.addEventListener("click",e=>{e.stopPropagation();setLang(code)});
    row.appendChild(b);
  }
  applyLang();
}

/* ================================================================ boot = */
/**
 * 트랙K 긴급수정(2026-08-03): 부트 시퀀스 자체가 try/catch로 감싸여 있지 않아
 * initLang()(-> applyLang() -> refreshTitle()) 안에서 무엇이든 던지면 그 아래
 * setScreen/resize와, 특히 이 파일 맨 끝의 requestAnimationFrame(loop) 호출까지
 * 통째로 실행되지 않는다 — 즉 텍스트 하나가 실패하면 **게임 렌더 루프 자체가
 * 시작되지 않는** 구조였다(라벨 문제보다 훨씬 심각, Partner 지적). loadSave/
 * initLang을 개별적으로 감싸 하나가 실패해도 화면 전환·리사이즈·렌더 루프
 * 시작은 반드시 실행되게 한다. [가설 수정 — 실기기 확인 필요]
 */
try{loadSave()}catch(e){console.error("[boot] loadSave failed",e)}
try{initLang()}catch(e){console.error("[boot] initLang failed",e)}
track("app_enter",{});
/* 출석(2026-08-22, 2026-08-23 오버레이로 전환) - 클레임 가능할 때만 홈 «위»에
   #scAttend 오버레이를 띄운다.
   ★핵심: 홈(setScreen("title"))을 «먼저·항상» 세운다. 이전 구현은 출석이 뜨는
     날엔 setScreen("attend") 만 해서 홈이 통째로 hidden 이었다(President 지적).
     이제 홈이 뒤에 그대로 있고, 시작화면 배너도 정상적으로 붙는다.
   ★클레임 조건은 «그대로»다 — attendanceStatus().claimable 하나뿐이고, 이미
     오늘 받았으면 false 라 오버레이 자체가 안 뜬다. */
setScreen("title");
try{
  const st=attendanceStatus();
  if(st.claimable){refreshAttend(st);openAttend()}
}catch(e){console.error("[boot] attendance check failed",e)}
resize();
/* 품질 강등 → DPR 상한 변경은 «플레이 밖»에서만 반영(플레이 중 DPR 고정, 네온 3차 규격). 스프라이트 캐시는 dpr 키라 그때 같이 비운다. */
function syncDpr(){if(!POST||!POST.refreshCap())return;skyKey=skyKey2="";plateKey="";bedCache.clear();headCache.clear();for(const k in fgCache)delete fgCache[k];for(const k in cloudCache)delete cloudCache[k];layoutDirty=true}
syncDpr();
draw(); /* 첫 프레임을 rAF 전에 동기로 그린다 — 빈 캔버스가 한 프레임도 보이지 않게 */

let last=performance.now(),acc=0,hudAt=0,menuDrawAt=0;
const STEP=1/60;
function loop(now){
  requestAnimationFrame(loop);
  const delta=Math.min(.1,(now-last)/1000);last=now;
  acc+=delta;let guard=0;
  while(acc>=STEP&&guard++<6){update(STEP);acc-=STEP}
  if(acc>STEP*6)acc=0;
  if(layoutDirty){layoutDirty=false;resize()}
  stepVfx(delta);observeEvents();
  if(POST&&screen==="play"&&running)POST.sample(delta*1000);
  if(POST&&screen!=="play")syncDpr();
  /* the long scrolling menus don't need a 60fps canvas behind them — 일시정지(정적 보드)도 20Hz. 타이틀·결과는 살아 있는 정원 배경이라 60. */
  if(screen==="map"||screen==="lab"||screen==="pause"){if(now-menuDrawAt>50){menuDrawAt=now;draw()}}
  else draw();
  /* HUD is DOM: refresh at ~15Hz, not every frame, to keep the canvas at 60 */
  if(screen==="play"&&now-hudAt>66){hudAt=now;refreshHud(false);refreshGoals(false);refreshOrderChip()}
}
requestAnimationFrame(loop);
})();
