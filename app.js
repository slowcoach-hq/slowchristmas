
// ===== 설정 =====
const store={get:(s,k)=>{try{return window[s].getItem(k)}catch(e){return null}},set:(s,k,v)=>{try{window[s].setItem(k,v)}catch(e){}}};
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwS7dwSfSJ-BpRTm6Ud2bkv1hfwbuPlDJlyzhqsNDm247QHKpyj3dcRNsqaJdQxVlE4zQ/exec"; // 신청 → 회사 구글시트
const EVENT = new Date("2026-12-24T18:00:00+09:00");

// D-day
(function(){
  const now = new Date();
  const kst = d => new Date(d.toLocaleString("en-US",{timeZone:"Asia/Seoul"}));
  const a = kst(now); a.setHours(0,0,0,0);
  const b = kst(EVENT); b.setHours(0,0,0,0);
  const d = Math.round((b-a)/86400000);
  document.getElementById("dday").textContent = d>0 ? "D-"+d : d===0 ? "D-DAY" : "끝!";
})();

// 눈
(function(){
  const s=document.getElementById("snow");
  for(let i=0;i<22;i++){const e=document.createElement("i");const z=6+Math.random()*10;
    e.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${7+Math.random()*9}s;animation-delay:${-Math.random()*12}s;background:${["#fff","#fff","#FFD23F","#FF4B3E","#2FBF71"][i%5]}`;s.appendChild(e);}
})();

// 색종이
const cv=document.getElementById("confetti"),cx=cv.getContext("2d");let parts=[];
function confetti(n=140){cv.width=innerWidth;cv.height=innerHeight;
  const cols=["#FF4B3E","#FFD23F","#3FA7FF","#2FBF71","#FFB3C7"];
  for(let i=0;i<n;i++)parts.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:6+Math.random()*7,c:cols[i%5],a:Math.random()*6,t:0});
  if(parts.length===n)requestAnimationFrame(tick);}
function tick(){cx.clearRect(0,0,cv.width,cv.height);
  parts.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.a+=.15;p.t++;cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.strokeStyle="#1B1B1B";cx.lineWidth=2;cx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.4);cx.strokeRect(-p.r/2,-p.r/2,p.r,p.r*1.4);cx.restore();});
  parts=parts.filter(p=>p.y<cv.height+40&&p.t<220); if(parts.length)requestAnimationFrame(tick); else cx.clearRect(0,0,cv.width,cv.height);}


// ===== 배경 음악 (Pixabay 무료 음원: Jingle Bells by HitsLab, 상업 사용 무료) =====
const Music=(()=>{const a=new Audio("music.mp3");a.loop=true;a.preload="auto";a.volume=0;let on=false,fadeT;
  function fade(to){clearInterval(fadeT);fadeT=setInterval(()=>{const v=a.volume+(to>a.volume?.05:-.05);a.volume=Math.max(0,Math.min(.6,v));if(Math.abs(a.volume-to)<.06){a.volume=to;clearInterval(fadeT);if(to===0)a.pause();}},60);}
  function start(){const p=a.play();on=true;ui();fade(.55);if(p&&p.catch)p.catch(()=>{on=false;ui();});}
  function stop(){on=false;ui();fade(0);}
  function ui(){const b=document.getElementById("musicBtn");if(!b)return;b.textContent=on?"🎵":"🔇";b.setAttribute("aria-label",on?"음악 끄기":"음악 켜기");b.classList.toggle("off",!on);}
  return{start,stop,toggle(){on?stop():start();},get on(){return on}};})();
const wantMusic=()=>store.get("localStorage","sc_music")!=="0";
document.getElementById("musicBtn").onclick=(e)=>{e.stopPropagation();Music.toggle();store.set("localStorage","sc_music",Music.on?"1":"0");};
// 처음부터: 열리자마자 재생 시도 → 막히면 첫 터치·클릭·스크롤 때 바로 재생
if(wantMusic()) Music.start();
const kick=()=>{ if(!wantMusic()){ ["pointerdown","touchstart","keydown","scroll"].forEach(ev=>removeEventListener(ev,kick,true)); return; } if(!Music.on) Music.start(); setTimeout(()=>{ if(Music.on) ["pointerdown","touchstart","keydown","scroll"].forEach(ev=>removeEventListener(ev,kick,true)); },400); };
["pointerdown","touchstart","keydown","scroll"].forEach(ev=>addEventListener(ev,kick,{capture:true,passive:true}));

// 초대장 열기
const intro=document.getElementById("intro");
function openIntro(fx){ if(wantMusic() && !Music.on) Music.start(); if(fx){document.querySelector(".env .flap").style.transform="rotateX(180deg)";confetti(110);} setTimeout(()=>intro.classList.add("gone"),fx?550:0); store.set("sessionStorage","opened","1"); }
document.getElementById("openBtn").onclick=()=>openIntro(true);
document.getElementById("env").onclick=()=>openIntro(true);
document.getElementById("skipBtn").onclick=()=>openIntro(false);
if(store.get("sessionStorage","opened")||location.hash==="#apply") intro.classList.add("gone");

// 떠 있는 신청 버튼
const fab=document.getElementById("fab"),applyEl=document.getElementById("apply");
addEventListener("scroll",()=>{const r=applyEl.getBoundingClientRect();fab.classList.toggle("hide",scrollY<420||r.top<innerHeight*.9);},{passive:true});

// ===== 신청서 =====
const steps=[...document.querySelectorAll(".step")],form=document.getElementById("form"),err=document.getElementById("err");
const prog=document.getElementById("prog");steps.forEach(()=>prog.appendChild(document.createElement("i")));
let cur=0;const data={};
function show(i){steps.forEach((s,j)=>s.classList.toggle("on",j===i));[...prog.children].forEach((p,j)=>p.classList.toggle("on",j<=i));
  document.getElementById("back").style.visibility=i?"visible":"hidden";
  document.getElementById("next").textContent=i===steps.length-1?"🎁 신청하기":"다음 →"; err.textContent="";
  if(steps[i].dataset.k==="agree")renderSummary();
  const f=steps[i].querySelector("input.inp,textarea.inp"); }
let advT=null, submitting=false;
document.querySelectorAll(".step[data-type]").forEach(st=>{const many=st.dataset.type==="many";
  st.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{ if(!many)st.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.toggle("sel");
    if(st.dataset.k==="food"){const t=form.foodText;t.style.display=b.dataset.v==="있어요"&&b.classList.contains("sel")?"block":"none";}
    if(!many && st.dataset.k!=="food"){ clearTimeout(advT); const at=cur; advT=setTimeout(()=>{ if(cur===at && !submitting) go(1); },220);} });});
const sel=k=>[...document.querySelectorAll(`.step[data-k="${k}"] .opt.sel`)].map(b=>b.dataset.v);
form.phone.addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,11);e.target.value=v.length>7?v.replace(/(\d{3})(\d{4})(\d+)/,"$1-$2-$3"):v.length>3?v.replace(/(\d{3})(\d+)/,"$1-$2"):v;});
function check(k){
  if(k==="name"&&form.uname.value.trim().length<2)return"이름을 써 주세요 🙂";
  if(k==="birth"){const y=+form.birth.value;if(!/^\d{4}$/.test(form.birth.value))return"태어난 해를 숫자 4개로 써 주세요 (예: 2001)";if(y<1950||y>2007)return"태어난 해를 다시 확인해 주세요 🙏";}
  if(k==="phone"&&!/^010-?\d{4}-?\d{4}$/.test(form.phone.value))return"010으로 시작하는 휴대폰 번호를 써 주세요";
  if(["from","with","food","photo"].includes(k)&&!sel(k).length)return"하나를 골라 주세요 👆";
  if(k==="food"&&sel(k)[0]==="있어요"&&!form.foodText.value.trim())return"못 먹는 음식을 써 주세요";
  if(k==="wish"&&!sel(k).length&&!form.wishText.value.trim())return"하고 싶은 걸 하나 이상 골라 주세요 ✨";
  if(k==="agree"&&!form.agree.checked)return"개인정보 동의에 체크해 주세요 ✅";
  if(k==="agree"&&!form.share.checked)return"유센터 명단 동의에 체크해 주세요 ✅";
  if(k==="pay"&&!sel("pay").length)return"하나를 골라 주세요";
  if(k==="agree"&&needHealth()&&!form.healthOk.checked)return"건강 관련 내용 동의에 체크해 주세요 (싫으면 이전 단계에서 그 칸을 비워 주세요)";
  return"";}
const foodVal=()=>sel("food")[0]==="있어요"?form.foodText.value.trim():"";
const needHealth=()=>!!(foodVal()||form.help.value.trim());
const t0=Date.now();
const rid=(()=>{let r=store.get("sessionStorage","sc_rid");if(!r){const a=new Uint8Array(16);crypto.getRandomValues(a);r=[...a].map(x=>x.toString(16).padStart(2,"0")).join("");store.set("sessionStorage","sc_rid",r);}return r;})();
function collect(){return{rid,ms:Date.now()-t0,tp:form.tp.value,name:form.uname.value.trim(),birth:form.birth.value.trim(),phone:form.phone.value.trim(),from:sel("from")[0]||"",with:sel("with")[0]||"",
  wish:sel("wish"),wishText:form.wishText.value.trim(),likes:form.likes.value.trim(),food:foodVal(),
  help:form.help.value.trim(),photo:sel("photo")[0]==="yes",agree:form.agree.checked===true,health:needHealth()?form.healthOk.checked===true:false,pay:sel("pay")[0]||"",share:form.share.checked===true};}
function renderSummary(){const d=collect();const box=document.getElementById("summary");box.textContent="";
  [["이름",d.name],["태어난 해",d.birth],["휴대폰",d.phone],["하고 싶은 것",[d.wish.join(", "),d.wishText].filter(Boolean).join(" / ")],["참가비",{self:"내가 계좌로",proxy:"가족·선생님이 대신 계좌로",cash:"파티 날 현금"}[d.pay]],["사진·홍보",d.photo?"동의":"사진에서 빼 주세요"]].forEach(([a,b])=>{const div=document.createElement("div");div.append("✔ "+a+": ");const bb=document.createElement("b");bb.textContent=b||"-";div.append(bb);box.append(div);});
  document.getElementById("healthBox").style.display=needHealth()?"block":"none";}
const ERR={INVALID_BIRTH:"태어난 해를 다시 확인해 주세요.",INVALID_PHONE:"휴대폰 번호를 다시 확인해 주세요.",INVALID_CONSENT:"동의 칸을 다시 확인해 주세요.",BUSY:"지금 신청이 몰렸어요. 1분 뒤에 다시 눌러 주세요.",CLOSED:"신청이 마감됐어요. 고마워요!",BOT:"조금 천천히 다시 눌러 주세요.",TOO_LARGE:"글이 너무 길어요. 조금 줄여 주세요."};
function lockForm(on){ form.querySelectorAll("button,input,textarea").forEach(x=>{ if(x.id!=="next") x.disabled=on; }); }
async function submit(){ if(submitting)return; submitting=true; clearTimeout(advT);
  const d=collect();const btn=document.getElementById("next");btn.disabled=true;btn.textContent="보내는 중… 🎁";lockForm(true);
  let j=null, timedOut=false; const ac=new AbortController(); const to=setTimeout(()=>{timedOut=true;ac.abort();},25000);
  try{const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(d),signal:ac.signal});j=await r.json();}catch(e){j=null;}
  clearTimeout(to);
  if(j&&j.ok){
    err.textContent="";
    document.getElementById("payName").textContent=d.name+d.phone.replace(/\D/g,"").slice(-4);
    if(j.wait){ document.getElementById("payBox").style.display="none"; document.getElementById("cashBox").style.display="none"; document.getElementById("waitBox").style.display="block"; document.getElementById("doneTitle").textContent="대기 신청 끝!"; document.getElementById("doneSub").textContent="자리가 나면 연락드릴게요."; document.getElementById("doneMsg").textContent="고마워요! 🎄"; }
    else if(d.pay==="proxy"){ const p=document.createElement("p"); p.style.cssText="margin-top:6px;font-size:14px"; p.textContent="대신 보내 주는 분께 이 계좌와 보내는 사람 이름을 꼭 알려 주세요."; document.getElementById("payBox").appendChild(p); }
    if(!j.wait&&d.pay==="cash"){ document.getElementById("payBox").style.display="none"; document.getElementById("doneTitle").textContent="신청 끝!"; document.getElementById("doneSub").textContent="참가비는 파티 날 현금으로 내면 돼요."; document.getElementById("cashBox").style.display="block"; document.getElementById("doneMsg").textContent="신청이 끝났어요! 12월 초에 문자로 다시 알려 드릴게요. 12월 24일에 만나요! 🎄"; }
    form.style.display="none";document.getElementById("done").style.display="block";
    document.getElementById("apply").scrollIntoView({behavior:"smooth"});confetti(170);
    store.set("sessionStorage","sc_rid","");
  }else{
    err.textContent=(j&&ERR[j.error])||(timedOut?"응답이 늦어요. 돈은 아직 보내지 말고, 1분 뒤에 \"신청하기\"를 다시 눌러 주세요. (같은 신청은 두 번 들어가지 않아요)":"앗, 신청이 아직 안 됐어요. 돈은 보내지 말고, 인터넷을 확인한 뒤 다시 눌러 주세요.");
    lockForm(false);btn.disabled=false;btn.textContent="🎁 신청하기";submitting=false;
  }}
function go(dir){ if(submitting)return; if(dir>0){const m=check(steps[cur].dataset.k);if(m){err.textContent=m;return;} if(cur===steps.length-1)return submit();}
  cur=Math.max(0,Math.min(steps.length-1,cur+dir));show(cur);
  const r=form.getBoundingClientRect(); if(r.top<-40) form.scrollIntoView({block:"start"});}
document.getElementById("next").onclick=()=>go(1);document.getElementById("back").onclick=()=>go(-1);
form.addEventListener("submit",e=>e.preventDefault());
form.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.tagName==="INPUT"){e.preventDefault();go(1);}});
document.getElementById("copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText("우리은행 1005704966197");document.getElementById("copyBtn").textContent="✅ 복사됐어요!";}catch(e){document.getElementById("copyBtn").textContent="1005-704-966197";}};
try{localStorage.removeItem("sc2026_applied");}catch(e){}
if(Date.now()>new Date("2026-12-21T23:59:59+09:00").getTime()){ form.style.display="none"; const c=document.createElement("p"); c.className="q"; c.style.cssText="padding:24px;text-align:center"; c.textContent="신청이 마감됐어요. 고마워요! 🎄"; form.parentNode.insertBefore(c,form); }
show(0);

// ===== 친구한테 알리기 =====
const SHARE_URL="https://slowchristmas.vercel.app";
const SHARE_TEXT="12월 24일 크리스마스이브에 같이 놀자! 🎄 경계선지능 청년 크리스마스 파티 (역삼 MARU180, 저녁 6시~9시). 혼자 와도 괜찮아요. 신청은 여기서:";
document.querySelectorAll(".share-btn").forEach(b=>b.addEventListener("click",async()=>{
  const old=b.textContent;
  try{ if(navigator.share){ await navigator.share({title:"Slow Christmas 2026",text:SHARE_TEXT,url:SHARE_URL}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(SHARE_TEXT+" "+SHARE_URL); b.textContent="✅ 복사됐어요! 카톡에 붙여 넣어 보내요"; }
  catch(e){ b.textContent="링크: slowchristmas.vercel.app"; }
  setTimeout(()=>{b.textContent=old;},3500);
}));

// ===== 곧 마감 =====
(function(){
  const kst=d=>new Date(d.toLocaleString("en-US",{timeZone:"Asia/Seoul"}));
  const a=kst(new Date()); a.setHours(0,0,0,0);
  const c=kst(new Date("2026-12-21T12:00:00+09:00")); c.setHours(0,0,0,0);
  const d=Math.round((c-a)/86400000);
  if(d>=0&&d<=7){ const el=document.getElementById("closeSoon"); el.textContent= d===0 ? "⏰ 오늘 신청 마감이에요!" : "⏰ 신청 마감까지 "+d+"일!"; el.hidden=false; }
})();

// ===== 친구들이 고른 것 · 자리 현황 =====
(async function(){
  const EMO={"새 친구 사귀기":"🤝","맛있는 거 먹기":"🍕","게임":"🎲","선물 교환":"🎁","노래·춤":"🎤","사진 찍기":"📸","공연 보기":"🎭","이야기 나누기":"💬"};
  try{
    const r=await fetch(ENDPOINT+"?a=wish"); const j=await r.json();
    if(!j||!j.ok) return;
    const $=id=>document.getElementById(id);
    if(Array.isArray(j.top)&&j.top.length){
      const ol=$("wishList");
      j.top.slice(0,3).forEach((w,i)=>{ if(!EMO[w]) return; const li=document.createElement("li"); const s=document.createElement("span"); s.className="rk"; s.textContent=(i+1)+"위"; li.append(s, " "+EMO[w]+" "+w); ol.append(li); });
      if(ol.children.length) $("wishLive").hidden=false;
    }
    if(j.n10){
      $("wishCount").textContent="벌써 "+j.n10+"명 넘게 신청했어요!";
      $("socialLine").textContent="🙌 벌써 "+j.n10+"명 넘게 같이 가요"+(typeof j.alonePct==="number"&&j.alonePct>=20?" · 혼자 오는 친구가 "+j.alonePct+"%예요":"");
      $("socialLine").hidden=false;
    }
    if(j.round===1&&j.left>0){ $("kitLeft").textContent="트리 장식 키트 "+j.left+"개 남았어요"; $("kitLeft").hidden=false; }
    if(j.round===2&&!j.full){ $("kitTitle").textContent="🎉 1차 50자리가 다 찼어요! 2차 50자리를 열었어요"; $("kitSub").textContent="지금 신청해도 같이 놀 수 있어요."; if(j.left>0){ $("kitLeft").textContent="남은 자리 "+j.left+"개"; $("kitLeft").hidden=false; } }
    if(j.full){ $("kitTitle").textContent="🙏 자리가 다 찼어요"; $("kitSub").textContent="지금은 대기 신청을 받아요. 자리가 나면 먼저 연락드릴게요."; const nb=document.getElementById("next"); if(nb) nb.dataset.wait="1"; }
  }catch(e){}
})();

// ===== 달력에 넣기 =====
(function(){
  const g="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Slow Christmas 2026 🎄")+"&dates=20261224T090000Z/20261224T120000Z&ctz=Asia/Seoul&location="+encodeURIComponent("MARU180 지하 1층 (서울 강남구 역삼로 180, 역삼역 2번 출구 도보 7분)")+"&details="+encodeURIComponent("경계선지능 청년 크리스마스 파티 · 저녁 6시~9시 · https://slowchristmas.vercel.app");
  const gb=document.getElementById("gcalBtn"); if(gb) gb.href=g;
  const ib=document.getElementById("icsBtn"); if(ib) ib.addEventListener("click",()=>{
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//slowcoach//slowchristmas//KO","BEGIN:VEVENT","UID:slowchristmas-2026@slowcoach.kr","DTSTAMP:20261113T000000Z","DTSTART:20261224T090000Z","DTEND:20261224T120000Z","SUMMARY:Slow Christmas 2026 🎄","LOCATION:MARU180 지하 1층 (역삼역 2번 출구 도보 7분)","DESCRIPTION:경계선지능 청년 크리스마스 파티 · 저녁 6시~9시 · https://slowchristmas.vercel.app","BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:내일은 슬로 크리스마스!","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"})); a.download="slowchristmas.ics"; document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);
  });
})();
