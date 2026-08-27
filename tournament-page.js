
(function(){
const FALLBACK=[
 {id:"t1",name:"SERENITY COMMUNITY CUP",game:"POINT BLANK",date:"2026-09-05",status:"open",slots:32,registered:18,fee:"Rp25.000",prize:"Rp2.500.000",format:"5 VS 5 • SINGLE ELIMINATION",poster:""},
 {id:"t2",name:"PBSB DIVISI 1",game:"POINT BLANK",date:"2026-09-12",status:"upcoming",slots:16,registered:16,fee:"INVITATIONAL",prize:"TBA",format:"5 VS 5 • COMPETITIVE",poster:""}
];
function load(){try{const x=JSON.parse(localStorage.getItem("serenity155Tournaments")||"null");return Array.isArray(x)&&x.length?x:FALLBACK}catch(e){return FALLBACK}}
function fmt(d){if(!d)return"TBA";const x=new Date(d);return isNaN(x)?d:x.toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})}
let data=load(),filter="all",selected=null,currentUser=null,authMode="login";
const cfg=window.SERENITY_SUPABASE||{}, sb=(window.supabase&&cfg.url&&cfg.key)?window.supabase.createClient(cfg.url,cfg.key):null;
const $=id=>document.getElementById(id);
function render(){
 const g=$("tournamentGrid"),e=$("tournamentEmpty"),list=data.filter(t=>filter==="all"||String(t.status).toLowerCase()===filter);
 g.innerHTML=list.map(t=>{const pct=Math.min(100,Math.round((Number(t.registered||0)/Math.max(1,Number(t.slots||1)))*100));return `
 <article class="tour-modern-card">
  <div class="tour-cover">${t.poster?`<img src="${t.poster}">`:`<div class="tour-cover-mark">S155</div>`}<span class="tour-status ${t.status}">${String(t.status).toUpperCase()}</span></div>
  <div class="tour-body"><small>${t.game||"POINT BLANK"}</small><h3>${t.name}</h3>
   <div class="tour-meta"><div><span>DATE</span><b>${fmt(t.date)}</b></div><div><span>PRIZE POOL</span><b>${t.prize||"TBA"}</b></div><div><span>ENTRY</span><b>${t.fee||"FREE"}</b></div><div><span>FORMAT</span><b>${t.format||"TBA"}</b></div></div>
   <div class="slot-line"><span>SLOT ${t.registered||0}/${t.slots||0}</span><b>${pct}%</b></div><div class="slot-bar"><i style="width:${pct}%"></i></div>
   <button class="tour-action" data-register="${t.id}" type="button" ${t.status!=="open"?"disabled":""}>${t.status==="open"?"REGISTRATION OPEN":"REGISTRATION CLOSED"}</button>
  </div></article>`}).join("");e.style.display=list.length?"none":"block";
}
function modal(show){$("regModal").classList.toggle("open",show);$("regModal").setAttribute("aria-hidden",String(!show))}
function validGmail(email){return /^[A-Z0-9._%+-]+@gmail\.com$/i.test(email)}
function setAuthMode(mode){authMode=mode;document.querySelectorAll("[data-auth-mode]").forEach(b=>b.classList.toggle("active",b.dataset.authMode===mode));$("participantAuthSubmit").textContent=mode==="login"?"LOGIN":"BUAT AKUN";$("participantPassword").autocomplete=mode==="login"?"current-password":"new-password"}
function showCorrectPanel(){const logged=!!currentUser;$("authPanel").hidden=logged;$("registrationPanel").hidden=!logged;if(logged){$("regUserEmail").textContent="Login sebagai "+currentUser.email;$("regTournamentName").textContent=selected?.name||"DAFTAR TOURNAMENT"}}
async function refreshUser(){if(!sb)return;const {data:{user}}=await sb.auth.getUser();currentUser=user||null;const pill=$("participantAuthPill");if(currentUser)pill.innerHTML=`<span>${currentUser.email}</span><button id="participantLogout" type="button">LOGOUT</button>`;else pill.innerHTML='<button id="participantLoginOpen" type="button">LOGIN PESERTA</button>';showCorrectPanel()}
async function openRegistration(id){selected=data.find(t=>String(t.id)===String(id));if(!selected)return;await refreshUser();showCorrectPanel();modal(true)}
async function doAuth(){
 if(!sb){$("authStatus").textContent="Sistem login belum terhubung.";return}
 const email=$("participantEmail").value.trim().toLowerCase(),password=$("participantPassword").value;
 if(!validGmail(email)){ $("authStatus").textContent="Gunakan alamat Gmail yang berakhiran @gmail.com.";return}
 if(password.length<6){$("authStatus").textContent="Password minimal 6 karakter.";return}
 $("authStatus").textContent="Memproses...";
 let result=authMode==="signup"?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});
 if(result.error){$("authStatus").textContent=result.error.message;return}
 if(authMode==="signup"&&!result.data.session){$("authStatus").textContent="Akun dibuat. Cek email Gmail untuk verifikasi, lalu login.";return}
 currentUser=result.data.user; $("authStatus").textContent="Login berhasil.";await refreshUser();showCorrectPanel()
}
async function submitReg(){
 if(!sb||!currentUser||!selected)return;
 const team=$("regTeam").value.trim(),captain=$("regCaptain").value.trim(),wa=$("regWhatsapp").value.trim(),roster=$("regRoster").value.trim();
 if(!team||!captain||!wa||!roster){$("regStatus").textContent="Semua data pendaftaran wajib diisi.";return}
 $("regStatus").textContent="Mengirim pendaftaran...";
 const {error}=await sb.from("tournament_signups").insert({tournament_key:String(selected.id),tournament_name:selected.name,owner_id:currentUser.id,email:currentUser.email,team_name:team,captain_name:captain,whatsapp:wa,roster});
 if(error){$("regStatus").textContent=error.code==="23505"?"Akun Gmail ini sudah mendaftar di tournament tersebut.":error.message;return}
 $("regStatus").textContent="✓ Pendaftaran berhasil dikirim. Status: PENDING";
}
document.addEventListener("click",async e=>{
 const r=e.target.closest("[data-register]");if(r&&!r.disabled)openRegistration(r.dataset.register);
 if(e.target.id==="regClose"||e.target.id==="regModal")modal(false);
 if(e.target.id==="participantLoginOpen"){selected=null;await refreshUser();modal(true)}
 if(e.target.id==="participantLogout"&&sb){await sb.auth.signOut();currentUser=null;await refreshUser()}
});
document.querySelectorAll("[data-tour-filter]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tour-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.tourFilter;render()});
document.querySelectorAll("[data-auth-mode]").forEach(b=>b.onclick=()=>setAuthMode(b.dataset.authMode));
$("participantAuthSubmit").onclick=doAuth;$("submitTournamentRegistration").onclick=submitReg;$("regClose").onclick=()=>modal(false);
render();refreshUser();
})();
