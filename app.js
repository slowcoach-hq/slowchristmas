
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
const kick=()=>{ if(wantMusic() && !Music.on) Music.start(); ["pointerdown","touchstart","keydown","scroll"].forEach(ev=>removeEventListener(ev,kick,true)); };
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
document.querySelectorAll(".step[data-type]").forEach(st=>{const many=st.dataset.type==="many";
  st.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{ if(!many)st.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel")); b.classList.toggle("sel");
    if(st.dataset.k==="food"){const t=form.foodText;t.style.display=b.dataset.v==="있어요"&&b.classList.contains("sel")?"block":"none";}
    if(!many && st.dataset.k!=="food") setTimeout(()=>go(1),220); });});
const sel=k=>[...document.querySelectorAll(`.step[data-k="${k}"] .opt.sel`)].map(b=>b.dataset.v);
form.phone.addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,11);e.target.value=v.length>7?v.replace(/(\d{3})(\d{4})(\d+)/,"$1-$2-$3"):v.length>3?v.replace(/(\d{3})(\d+)/,"$1-$2"):v;});
function check(k){
  if(k==="name"&&form.uname.value.trim().length<2)return"이름을 써 주세요 🙂";
  if(k==="birth"){const y=+form.birth.value;if(!/^\d{4}$/.test(form.birth.value))return"태어난 해를 숫자 4개로 써 주세요 (예: 2001)";if(y<1986||y>2007)return"1986~2007년생 청년만 신청할 수 있어요 🙏";}
  if(k==="phone"&&!/^010-?\d{4}-?\d{4}$/.test(form.phone.value))return"010으로 시작하는 휴대폰 번호를 써 주세요";
  if(["from","with","food","photo"].includes(k)&&!sel(k).length)return"하나를 골라 주세요 👆";
  if(k==="food"&&sel(k)[0]==="있어요"&&!form.foodText.value.trim())return"못 먹는 음식을 써 주세요";
  if(k==="wish"&&!sel(k).length&&!form.wishText.value.trim())return"하고 싶은 걸 하나 이상 골라 주세요 ✨";
  if(k==="agree"&&!form.agree.checked)return"개인정보 동의에 체크해 주세요 ✅";
  if(k==="agree"&&needHealth()&&!form.healthOk.checked)return"건강 관련 내용 동의에 체크해 주세요 (싫으면 이전 단계에서 그 칸을 비워 주세요)";
  return"";}
const foodVal=()=>sel("food")[0]==="있어요"?form.foodText.value.trim():"";
const needHealth=()=>!!(foodVal()||form.help.value.trim());
const t0=Date.now();
const rid=(()=>{let r=store.get("sessionStorage","sc_rid");if(!r){const a=new Uint8Array(16);crypto.getRandomValues(a);r=[...a].map(x=>x.toString(16).padStart(2,"0")).join("");store.set("sessionStorage","sc_rid",r);}return r;})();
function collect(){return{rid,ms:Date.now()-t0,hp:form.hp.value,name:form.uname.value.trim(),birth:form.birth.value.trim(),phone:form.phone.value.trim(),from:sel("from")[0]||"",with:sel("with")[0]||"",
  wish:sel("wish"),wishText:form.wishText.value.trim(),likes:form.likes.value.trim(),food:foodVal(),
  help:form.help.value.trim(),photo:sel("photo")[0]==="yes",agree:form.agree.checked===true,health:needHealth()&&form.healthOk.checked===true};}
function renderSummary(){const d=collect();const box=document.getElementById("summary");box.textContent="";
  [["이름",d.name],["태어난 해",d.birth],["휴대폰",d.phone],["하고 싶은 것",[d.wish.join(", "),d.wishText].filter(Boolean).join(" / ")],["사진·홍보",d.photo?"동의":"사진에서 빼 주세요"]].forEach(([a,b])=>{const div=document.createElement("div");div.append("✔ "+a+": ");const bb=document.createElement("b");bb.textContent=b||"-";div.append(bb);box.append(div);});
  document.getElementById("healthBox").style.display=needHealth()?"block":"none";}
let submitting=false;
const ERR={INVALID_BIRTH:"1986~2007년생 청년만 신청할 수 있어요.",INVALID_PHONE:"휴대폰 번호를 다시 확인해 주세요.",INVALID_CONSENT:"동의 칸을 다시 확인해 주세요.",BUSY:"지금 신청이 몰렸어요. 1분 뒤에 다시 눌러 주세요.",CLOSED:"신청이 마감됐어요. 고마워요!",BOT:"조금 천천히 다시 눌러 주세요.",TOO_LARGE:"글이 너무 길어요. 조금 줄여 주세요."};
async function submit(){ if(submitting)return; submitting=true;
  const d=collect();const btn=document.getElementById("next");btn.disabled=true;btn.textContent="보내는 중… 🎁";
  let j=null;
  try{const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(d)});j=await r.json();}catch(e){j=null;}
  if(j&&j.ok){
    document.getElementById("payName").textContent=d.name+d.phone.replace(/\D/g,"").slice(-4);
    form.style.display="none";document.getElementById("done").style.display="block";
    document.getElementById("apply").scrollIntoView({behavior:"smooth"});confetti(170);
    store.set("sessionStorage","sc_rid","");
  }else{
    err.textContent=(j&&ERR[j.error])||"앗, 신청이 아직 안 됐어요. 돈은 보내지 말고, 인터넷을 확인한 뒤 다시 눌러 주세요.";
    btn.disabled=false;btn.textContent="🎁 신청하기";submitting=false;
  }}
function go(dir){ if(dir>0){const m=check(steps[cur].dataset.k);if(m){err.textContent=m;return;} if(cur===steps.length-1)return submit();}
  cur=Math.max(0,Math.min(steps.length-1,cur+dir));show(cur);
  const r=form.getBoundingClientRect(); if(r.top<-40) form.scrollIntoView({block:"start"});}
document.getElementById("next").onclick=()=>go(1);document.getElementById("back").onclick=()=>go(-1);
form.addEventListener("submit",e=>e.preventDefault());
form.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.tagName==="INPUT"){e.preventDefault();go(1);}});
document.getElementById("copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText("우리은행 1005704966197");document.getElementById("copyBtn").textContent="✅ 복사됐어요!";}catch(e){document.getElementById("copyBtn").textContent="1005-704-966197";}};
show(0);
