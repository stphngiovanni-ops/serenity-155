document.addEventListener("DOMContentLoaded",()=>{
const URL="https://vcmbthekmltociajzsdx.supabase.co";
const KEY="sb_publishable_MjSTXwI71RW99XaYTP4fCA_U9uDj5pA";
const AUTH_CREATE=URL+"/functions/v1/serenity-tournament-auth";
let authMode="login",session=null,currentTeam=null,currentTournament=null;
const $=id=>document.getElementById(id);
const open=id=>$(id)?.classList.add("open");
const closeAll=()=>document.querySelectorAll(".modal").forEach(x=>x.classList.remove("open"));
const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const fmtDate=v=>v?new Date(v).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}):"TBA";
const money=n=>Number(n||0)?new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n):"FREE";

function saveSession(s){session=s;if(s)localStorage.setItem("serenityTournamentSession",JSON.stringify(s));else localStorage.removeItem("serenityTournamentSession")}
function loadSession(){try{const s=JSON.parse(localStorage.getItem("serenityTournamentSession")||"null");if(s?.access_token&&s?.user)return s}catch(e){}return null}
async function authFetch(path,opts={}){
  const headers={"apikey":KEY,"Content-Type":"application/json",...(opts.headers||{})};
  const r=await fetch(URL+path,{...opts,headers});
  const d=await r.json().catch(()=>null);
  if(!r.ok)throw new Error(d?.msg||d?.message||d?.error_description||d?.error||("HTTP "+r.status));
  return d;
}
async function rest(table,{method="GET",query="",body=null,auth=false,prefer=""}={}){
  const headers={"apikey":KEY,"Content-Type":"application/json"};
  if(auth&&session?.access_token)headers["Authorization"]="Bearer "+session.access_token;
  if(prefer)headers["Prefer"]=prefer;
  const r=await fetch(`${URL}/rest/v1/${table}${query?("?"+query):""}`,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.hint||d.details||("HTTP "+r.status))}
  if(r.status===204)return null;
  return await r.json().catch(()=>null);
}

document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeAll));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeAll()}));

async function loginUser(email,password){
  return await authFetch("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email,password})});
}
async function registerUser(email,password){
  const r=await fetch(AUTH_CREATE,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"Gagal membuat akun");
  return d;
}

async function loadTournaments(){
  try{
    const data=await rest("tournaments",{query:"select=*&status=neq.DRAFT&order=created_at.desc"});
    $("tournamentGrid").innerHTML=data?.length?data.map(t=>`<article class="tour-card">
      <span class="status">${esc(t.status)} // ${esc(t.game)}</span><h3>${esc(t.name)}</h3><p>${esc(t.description||"")}</p>
      <div class="tour-meta"><div><small>EVENT DATE</small><b>${fmtDate(t.event_date)}</b></div><div><small>MAX TEAM</small><b>${t.max_teams} SLOTS</b></div><div><small>ENTRY</small><b>${money(t.fee)}</b></div><div><small>PRIZE</small><b>${esc(t.prize||"TBA")}</b></div></div>
      <button class="primary join-card" data-id="${t.id}">VIEW / JOIN</button></article>`).join(""):'<div class="empty">Belum ada tournament aktif.</div>';
    $("joinTournament").innerHTML='<option value="">PILIH TOURNAMENT</option>' + (data||[]).filter(x=>x.status==="OPEN").map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
    document.querySelectorAll(".join-card").forEach(b=>b.onclick=()=>selectTournament(b.dataset.id));
  }catch(e){$("tournamentGrid").innerHTML='<div class="empty">Gagal memuat tournament: '+esc(e.message)+'</div>'}
}
async function loadParticipants(id){
  try{
    const regs=await rest("tournament_registrations",{query:`select=id,status,team_id,tournament_teams(name,logo_url,city,captain_name)&tournament_id=eq.${encodeURIComponent(id)}&status=eq.APPROVED`});
    $("participantGrid").innerHTML=regs?.length?regs.map(r=>{const t=r.tournament_teams||{};return `<article class="team-card"><div class="team-logo">${t.logo_url?`<img src="${esc(t.logo_url)}">`:esc((t.name||"T").slice(0,2))}</div><div><h4>${esc(t.name)}</h4><p>CAPTAIN: ${esc(t.captain_name||"-")} • ${esc(t.city||"-")}</p></div></article>`}).join(""):'<div class="empty">Belum ada team yang APPROVED.</div>';
  }catch(e){$("participantGrid").innerHTML='<div class="empty">Gagal memuat peserta.</div>'}
}
async function selectTournament(id){currentTournament=id;await loadParticipants(id);if(session){$("joinTournament").value=id;showDashboard()}else open("authModal")}

$("accountBtn").addEventListener("click",()=>session?showDashboard():open("authModal"));
$("joinHero").addEventListener("click",()=>{if(session)showDashboard();else{authMode="register";syncAuthUi();open("authModal")}});

function syncAuthUi(){
  $("authTitle").textContent=authMode==="login"?"LOGIN":"REGISTER";
  $("authSubmit").textContent=authMode==="login"?"LOGIN":"CREATE ACCOUNT";
  $("switchAuth").textContent=authMode==="login"?"Belum punya akun? REGISTER":"Sudah punya akun? LOGIN";
  $("authMsg").textContent="";
}
$("switchAuth").addEventListener("click",()=>{authMode=authMode==="login"?"register":"login";syncAuthUi()});
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault(); $("authMsg").textContent="PROCESSING...";
  const email=$("authEmail").value.trim(),password=$("authPassword").value;
  try{
    if(authMode==="register"){
      await registerUser(email,password);
      $("authMsg").textContent="AKUN BERHASIL DIBUAT ✓ Sedang login...";
    }
    const s=await loginUser(email,password);saveSession(s);closeAll();await showDashboard();
  }catch(err){$("authMsg").textContent=(authMode==="login"?"LOGIN GAGAL: ":"REGISTER GAGAL: ")+err.message}
});
$("logoutBtn").addEventListener("click",()=>{saveSession(null);currentTeam=null;closeAll();$("accountBtn").textContent="LOGIN / REGISTER"});

async function showDashboard(){
  if(!session){open("authModal");return}
  $("accountBtn").textContent="MY TEAM";$("userEmail").textContent=session.user?.email||"";open("dashboardModal");
  await loadMyTeam();await loadTournaments();
}
function addPlayer(v={}){
  const d=document.createElement("div");d.className="player-row";
  d.innerHTML=`<input class="pn" required placeholder="Nickname" value="${esc(v.nickname||"")}"><input class="pid" placeholder="Player ID" value="${esc(v.player_id||"")}"><input class="prole" placeholder="Role" value="${esc(v.role||"")}"><button type="button" class="remove">×</button>`;
  d.querySelector(".remove").onclick=()=>d.remove();$("playerRows").appendChild(d)
}
$("addPlayer").addEventListener("click",()=>addPlayer());

async function loadMyTeam(){
  try{
    const data=await rest("tournament_teams",{auth:true,query:`select=*&owner_id=eq.${session.user.id}&order=created_at.asc&limit=1`});
    currentTeam=data?.[0]||null;$("playerRows").innerHTML="";
    if(currentTeam){
      $("teamId").value=currentTeam.id;$("teamName").value=currentTeam.name;$("captainName").value=currentTeam.captain_name;$("teamWhatsapp").value=currentTeam.whatsapp;$("teamCity").value=currentTeam.city||"";$("teamLogo").value=currentTeam.logo_url||"";
      const m=await rest("tournament_team_members",{auth:true,query:`select=*&team_id=eq.${currentTeam.id}&order=created_at.asc`});(m||[]).forEach(addPlayer);
    }else{
      ["teamId","teamName","captainName","teamWhatsapp","teamCity","teamLogo"].forEach(x=>$(x).value="");
    }
    if(!$("playerRows").children.length)for(let i=0;i<5;i++)addPlayer();
  }catch(e){$("dashMsg").textContent="Gagal memuat team: "+e.message}
}

$("teamForm").addEventListener("submit",async e=>{
  e.preventDefault();$("dashMsg").textContent="MENYIMPAN...";
  try{
    const payload={owner_id:session.user.id,name:$("teamName").value.trim(),captain_name:$("captainName").value.trim(),whatsapp:$("teamWhatsapp").value.trim(),city:$("teamCity").value.trim(),logo_url:$("teamLogo").value.trim(),updated_at:new Date().toISOString()};
    let result;
    if(currentTeam){
      result=await rest("tournament_teams",{method:"PATCH",auth:true,prefer:"return=representation",query:`id=eq.${currentTeam.id}`,body:payload});
    }else{
      result=await rest("tournament_teams",{method:"POST",auth:true,prefer:"return=representation",body:payload});
    }
    currentTeam=result?.[0]||currentTeam;
    await rest("tournament_team_members",{method:"DELETE",auth:true,query:`team_id=eq.${currentTeam.id}`});
    const members=[...document.querySelectorAll(".player-row")].map((r,i)=>({team_id:currentTeam.id,nickname:r.querySelector(".pn").value.trim(),player_id:r.querySelector(".pid").value.trim(),role:r.querySelector(".prole").value.trim(),is_captain:i===0})).filter(x=>x.nickname);
    if(members.length)await rest("tournament_team_members",{method:"POST",auth:true,body:members});
    $("dashMsg").textContent="DATA TEAM BERHASIL DISIMPAN ✓";
  }catch(e){$("dashMsg").textContent="GAGAL SIMPAN: "+e.message}
});

$("joinTournamentBtn").addEventListener("click",async()=>{
  if(!currentTeam){$("dashMsg").textContent="Simpan data team terlebih dahulu.";return}
  const tid=$("joinTournament").value;if(!tid){$("dashMsg").textContent="Pilih tournament.";return}
  try{
    await rest("tournament_registrations",{method:"POST",auth:true,body:{tournament_id:tid,team_id:currentTeam.id,owner_id:session.user.id,status:"PENDING"}});
    $("dashMsg").textContent="PENDAFTARAN TERKIRIM ✓ Menunggu approval admin.";
  }catch(e){$("dashMsg").textContent=e.message.includes("duplicate")?"Team sudah terdaftar di tournament ini.":"GAGAL DAFTAR: "+e.message}
});

session=loadSession();if(session)$("accountBtn").textContent="MY TEAM";loadTournaments();
});