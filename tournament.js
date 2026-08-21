const URL="https://vcmbthekmltociajzsdx.supabase.co";
const KEY="sb_publishable_MjSTXwI71RW99XaYTP4fCA_U9uDj5pA";
const sb=supabase.createClient(URL,KEY);
let authMode="login",session=null,currentTeam=null,currentTournament=null;
const $=id=>document.getElementById(id);
const open=id=>$(id).classList.add("open"), closeAll=()=>document.querySelectorAll(".modal").forEach(x=>x.classList.remove("open"));
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeAll);
document.querySelectorAll(".modal").forEach(m=>m.onclick=e=>{if(e.target===m)closeAll()});
$("accountBtn").onclick=()=>session?showDashboard():open("authModal");
$("joinHero").onclick=()=>session?showDashboard():open("authModal");

function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function fmtDate(v){if(!v)return"TBA";return new Date(v).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function money(n){return Number(n||0)?new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n):"FREE"}

async function loadTournaments(){
 const {data,error}=await sb.from("tournaments").select("*").neq("status","DRAFT").order("created_at",{ascending:false});
 if(error){$("tournamentGrid").innerHTML='<div class="empty">Gagal memuat tournament.</div>';return}
 $("tournamentGrid").innerHTML=data.length?data.map(t=>`<article class="tour-card">
 <span class="status">${esc(t.status)} // ${esc(t.game)}</span><h3>${esc(t.name)}</h3><p>${esc(t.description||"")}</p>
 <div class="tour-meta"><div><small>EVENT DATE</small><b>${fmtDate(t.event_date)}</b></div><div><small>MAX TEAM</small><b>${t.max_teams} SLOTS</b></div><div><small>ENTRY</small><b>${money(t.fee)}</b></div><div><small>PRIZE</small><b>${esc(t.prize||"TBA")}</b></div></div>
 <button class="primary" onclick="selectTournament('${t.id}')">VIEW / JOIN</button></article>`).join(""):'<div class="empty">Belum ada tournament aktif.</div>';
 $("joinTournament").innerHTML='<option value="">PILIH TOURNAMENT</option>'+data.filter(x=>x.status==="OPEN").map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
}
window.selectTournament=async id=>{currentTournament=id;await loadParticipants(id);if(session){$("joinTournament").value=id;showDashboard()}else open("authModal")};
async function loadParticipants(id){
 const {data,error}=await sb.from("tournament_registrations").select("id,status,team_id,tournament_teams(name,logo_url,city,captain_name)").eq("tournament_id",id).eq("status","APPROVED");
 if(error||!data?.length){$("participantGrid").innerHTML='<div class="empty">Belum ada team yang APPROVED.</div>';return}
 $("participantGrid").innerHTML=data.map(r=>{const t=r.tournament_teams||{};return `<article class="team-card"><div class="team-logo">${t.logo_url?`<img src="${esc(t.logo_url)}">`:esc((t.name||"T").slice(0,2))}</div><div><h4>${esc(t.name)}</h4><p>CAPTAIN: ${esc(t.captain_name||"-")} • ${esc(t.city||"-")}</p></div></article>`}).join("");
}

$("switchAuth").onclick=()=>{authMode=authMode==="login"?"register":"login";$("authTitle").textContent=authMode==="login"?"LOGIN":"REGISTER";$("authSubmit").textContent=authMode==="login"?"LOGIN":"CREATE ACCOUNT";$("switchAuth").textContent=authMode==="login"?"Belum punya akun? REGISTER":"Sudah punya akun? LOGIN";$("authMsg").textContent=""};
$("authForm").onsubmit=async e=>{e.preventDefault();$("authMsg").textContent="PROCESSING...";
 const email=$("authEmail").value.trim(),password=$("authPassword").value;
 let res=authMode==="login"?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+"/tournament.html"}});
 if(res.error){$("authMsg").textContent=res.error.message;return}
 if(authMode==="register"&&!res.data.session){$("authMsg").textContent="Akun dibuat. Cek email untuk konfirmasi, lalu LOGIN.";return}
 session=res.data.session;closeAll();await showDashboard();
};
$("logoutBtn").onclick=async()=>{await sb.auth.signOut();session=null;currentTeam=null;closeAll();$("accountBtn").textContent="LOGIN / REGISTER"};

async function showDashboard(){
 const {data:{session:s}}=await sb.auth.getSession();session=s;if(!session){open("authModal");return}
 $("accountBtn").textContent="MY TEAM";$("userEmail").textContent=session.user.email;open("dashboardModal");
 await loadMyTeam();await loadTournaments();
}
function addPlayer(v={}){
 const d=document.createElement("div");d.className="player-row";d.innerHTML=`<input class="pn" required placeholder="Nickname" value="${esc(v.nickname||"")}"><input class="pid" placeholder="Player ID" value="${esc(v.player_id||"")}"><input class="prole" placeholder="Role" value="${esc(v.role||"")}"><button type="button" class="remove">×</button>`;d.querySelector(".remove").onclick=()=>d.remove();$("playerRows").appendChild(d)
}
$("addPlayer").onclick=()=>addPlayer();
async function loadMyTeam(){
 const {data}=await sb.from("tournament_teams").select("*").eq("owner_id",session.user.id).order("created_at").limit(1);
 currentTeam=data?.[0]||null;$("playerRows").innerHTML="";
 if(currentTeam){$("teamId").value=currentTeam.id;$("teamName").value=currentTeam.name;$("captainName").value=currentTeam.captain_name;$("teamWhatsapp").value=currentTeam.whatsapp;$("teamCity").value=currentTeam.city||"";$("teamLogo").value=currentTeam.logo_url||"";
  const {data:m}=await sb.from("tournament_team_members").select("*").eq("team_id",currentTeam.id).order("created_at");(m||[]).forEach(addPlayer);
 }else{["teamId","teamName","captainName","teamWhatsapp","teamCity","teamLogo"].forEach(x=>$(x).value="");}
 if(!$("playerRows").children.length)for(let i=0;i<5;i++)addPlayer();
}
$("teamForm").onsubmit=async e=>{e.preventDefault();$("dashMsg").textContent="MENYIMPAN...";
 const payload={owner_id:session.user.id,name:$("teamName").value.trim(),captain_name:$("captainName").value.trim(),whatsapp:$("teamWhatsapp").value.trim(),city:$("teamCity").value.trim(),logo_url:$("teamLogo").value.trim(),updated_at:new Date().toISOString()};
 let result=currentTeam?await sb.from("tournament_teams").update(payload).eq("id",currentTeam.id).select().single():await sb.from("tournament_teams").insert(payload).select().single();
 if(result.error){$("dashMsg").textContent=result.error.message;return} currentTeam=result.data;
 await sb.from("tournament_team_members").delete().eq("team_id",currentTeam.id);
 const members=[...document.querySelectorAll(".player-row")].map((r,i)=>({team_id:currentTeam.id,nickname:r.querySelector(".pn").value.trim(),player_id:r.querySelector(".pid").value.trim(),role:r.querySelector(".prole").value.trim(),is_captain:i===0})).filter(x=>x.nickname);
 if(members.length){const mr=await sb.from("tournament_team_members").insert(members);if(mr.error){$("dashMsg").textContent=mr.error.message;return}}
 $("dashMsg").textContent="DATA TEAM BERHASIL DISIMPAN ✓";
};
$("joinTournamentBtn").onclick=async()=>{if(!currentTeam){$("dashMsg").textContent="Simpan data team terlebih dahulu.";return}const tid=$("joinTournament").value;if(!tid){$("dashMsg").textContent="Pilih tournament.";return}
 const {error}=await sb.from("tournament_registrations").insert({tournament_id:tid,team_id:currentTeam.id,owner_id:session.user.id,status:"PENDING"});
 $("dashMsg").textContent=error?(error.code==="23505"?"Team sudah terdaftar di tournament ini.":error.message):"PENDAFTARAN TERKIRIM ✓ Menunggu approval admin.";
};
(async()=>{const {data:{session:s}}=await sb.auth.getSession();session=s;if(session)$("accountBtn").textContent="MY TEAM";await loadTournaments()})();