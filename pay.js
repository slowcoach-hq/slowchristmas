const ENDPOINT = "https://script.google.com/macros/s/AKfycbwS7dwSfSJ-BpRTm6Ud2bkv1hfwbuPlDJlyzhqsNDm247QHKpyj3dcRNsqaJdQxVlE4zQ/exec";
const t = (new URLSearchParams(location.search).get("t") || "").toLowerCase();
const $ = id => document.getElementById(id);
const msg = $("msg");
if (!/^[a-f0-9]{16}$/.test(t)) { msg.textContent = "링크가 잘못됐어요. 알림톡의 버튼을 다시 눌러 주세요."; $("cash").disabled = true; $("sent").disabled = true; }
let busy = false;
async function answer(c) {
  if (busy) return; busy = true;
  $("cash").disabled = true; $("sent").disabled = true; msg.textContent = "보내는 중…";
  let j = null;
  try {
    const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 20000);
    const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ act: "pay", t: t, c: c }), signal: ac.signal });
    clearTimeout(to); j = await r.json();
  } catch (e) { j = null; }
  if (j && j.ok) {
    $("ask").style.display = "none"; $("done").style.display = "block";
    if (j.paid) { $("doneIcon").textContent = "✅"; $("doneTitle").textContent = "참가비가 이미 확인됐어요!"; $("doneText").textContent = "신청이 확정됐어요. 12월 24일에 만나요!"; }
    else if (c === "cash") { $("doneIcon").textContent = "🙋"; $("doneTitle").textContent = "좋아요! 현장에서 내 주세요"; $("doneText").textContent = "12월 24일 파티 날 입구에서 현금 5,000원을 내면 돼요. 그날 만나요!"; }
    else { $("doneIcon").textContent = "🙏"; $("doneTitle").textContent = "고마워요! 확인해 볼게요"; $("doneText").textContent = "통장에서 확인되면 확정 알림을 보내 드려요. 다른 이름으로 보냈다면 문자로 알려 주세요."; }
  } else {
    msg.textContent = (j && j.error === "NOT_FOUND") ? "신청 정보를 못 찾았어요. 알림톡의 버튼을 다시 눌러 주세요." : "앗, 전달이 안 됐어요. 잠시 뒤 다시 눌러 주세요.";
    $("cash").disabled = false; $("sent").disabled = false; busy = false;
  }
}
$("cash").onclick = () => answer("cash");
$("sent").onclick = () => answer("sent");
$("copy").onclick = async () => { try { await navigator.clipboard.writeText("우리은행 1005704966197"); $("copy").textContent = "✅ 복사됐어요!"; } catch (e) { $("copy").textContent = "1005-704-966197"; } };
