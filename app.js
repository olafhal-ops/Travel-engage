const $=id=>document.getElementById(id);
const DEF={appId:"",redirectUri:"",authStart:"",discoveryWebhook:"",analysisWebhook:"",profile:"",focus:"family travel, travel with kids, Thailand, Bali, Lombok, Southeast Asia",tone:"natural"};
const topics=["family travel","travel with kids","Thailand","Bali","Lombok","Southeast Asia"];let candidates=[];
function cfg(){return {...DEF,...JSON.parse(localStorage.getItem("teMetaSettings")||"{}")}}
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function load(){const c=cfg();Object.keys(c).forEach(k=>{if($(k))$(k).value=c[k]});if(location.hash==="#connected"){setConnected("Meta/Instagram connected");history.replaceState({},document.title,location.pathname)}}
function save(){const c={};Object.keys(DEF).forEach(k=>c[k]=$(k).value.trim());localStorage.setItem("teMetaSettings",JSON.stringify(c));$("settingsStatus").textContent="Lagret.";toast("Innstillinger lagret")}
function setConnected(name){$("accountText").textContent=name;$("statusPill").textContent="CONNECTED";$("statusPill").className="pill on"}
function oauth(){
 const c=cfg();
 if(c.authStart){location.href=c.authStart;return}
 if(!c.appId||!c.redirectUri){toast("Legg inn Meta App ID og OAuth callback først");document.querySelector('[data-page="settings"]').click();return}
 const state=crypto.randomUUID();
 sessionStorage.setItem("metaOAuthState",state);
 const scope=["pages_show_list","instagram_basic","pages_read_engagement","instagram_manage_comments"].join(",");
 const url="https://www.facebook.com/v23.0/dialog/oauth?client_id="+encodeURIComponent(c.appId)+"&redirect_uri="+encodeURIComponent(c.redirectUri)+"&state="+encodeURIComponent(state)+"&scope="+encodeURIComponent(scope)+"&response_type=code";
 location.href=url;
}
async function find(){
 const c=cfg();$("findBtn").disabled=true;$("runStatus").textContent="Søker…";
 try{
  if(!c.discoveryWebhook)throw new Error("NO");
  const r=await fetch(c.discoveryWebhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({limit:Number($("limit").value),topics,profile:c.profile,focus:c.focus})});
  if(!r.ok)throw new Error("Discovery "+r.status);
  const d=await r.json();candidates=Array.isArray(d)?d:(d.results||d.posts||[]);
  if(c.analysisWebhook)candidates=await analyze(candidates,c.analysisWebhook,c);
  $("runStatus").textContent="Ferdig";$("findStatus").textContent=candidates.length+" kandidater funnet.";
 }catch(e){candidates=demo();$("runStatus").textContent="Demo";$("findStatus").textContent="Discovery er ikke koblet ennå – viser demo."; $("findStatus").className="status error"}
 render();$("findBtn").disabled=false;
}
async function analyze(items,url,c){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({posts:items,profile:{name:c.profile,focus:c.focus,tone:c.tone}})});if(!r.ok)throw new Error("AI "+r.status);const d=await r.json();return Array.isArray(d)?d:(d.results||items)}
function demo(){return[
{username:"familytravels",url:"https://instagram.com/",score:96,caption:"A quiet morning with the kids on a little island in Thailand 🌴",comment:"Dette ser ut som en helt nydelig morgen sammen med barna! 🌴"},
{username:"travelwithkids",url:"https://instagram.com/",score:92,caption:"Our first family adventure in Lombok. The kids loved every second.",comment:"For et herlig familieeventyr – Lombok ser virkelig ut til å levere!"},
{username:"asiafamilytrip",url:"https://instagram.com/",score:89,caption:"Beach days, sandy feet and no plans.",comment:"Sandy feet og ingen planer høres egentlig helt perfekt ut 😍"},
{username:"familyexplorers",url:"https://instagram.com/",score:84,caption:"Exploring Thailand with two little ones.",comment:"Så kult å oppleve Thailand sammen med de små!"}
]}
function render(){const s=$("stats");s.classList.remove("hidden");s.innerHTML=`<div class="stat"><b>${candidates.length}</b><small>funnet</small></div><div class="stat"><b>${candidates.filter(x=>x.score>=80).length}</b><small>sterke</small></div><div class="stat"><b>${candidates.filter(x=>x.score>=90).length}</b><small>topp</small></div>`;$("queue").innerHTML=`<div class="queue-head"><h2>Kommentarkø</h2><span class="muted">best først</span></div>`+candidates.sort((a,b)=>(b.score||0)-(a.score||0)).map((x,i)=>`<article class="candidate" id="c${i}"><div class="candidate-top"><b>@${esc(x.username||"ukjent")}</b><span class="score">${Math.round(x.score||0)}/100</span></div><div class="meta">${esc(x.reason||"Relevant for profilen din")}</div><div class="caption">${esc(x.caption||"")}</div><div class="comment">${esc(x.comment||(x.comments||[""])[0])}</div><div class="actions"><button class="copy" onclick="copyC(${i})">Kopier</button><button class="open" onclick="openC(${i})">Åpne</button><button class="skip" onclick="skipC(${i})">Hopp over</button></div></article>`).join("")}
window.copyC=async i=>{const x=candidates[i],t=x.comment||(x.comments||[""])[0];await navigator.clipboard.writeText(t);$("c"+i).classList.add("approved");toast("Kommentar kopiert")};window.openC=i=>window.open(candidates[i].url||"https://instagram.com/","_blank","noopener");window.skipC=i=>{$("c"+i).remove();toast("Hoppet over")};function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(b.dataset.page).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n===b))});
$("settingsBtn").onclick=()=>document.querySelector('[data-page="settings"]').click();$("saveSettings").onclick=save;$("connectBtn").onclick=oauth;$("findBtn").onclick=find;document.getElementById("topics").innerHTML=topics.map(x=>`<span class="chip">${x}</span>`).join("");load();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
