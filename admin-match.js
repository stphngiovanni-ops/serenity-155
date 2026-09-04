
(function(){
const $=id=>document.getElementById(id);
const KEY="serenity155Data";
const PASSWORD="serenity_mei25";
let data={matches:[]},editing=-1,pendingLogo="";

function load(){
  try{data=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){data={}}
  if(!Array.isArray(data.matches))data.matches=[];
  data.matches=data.matches.map(m=>({...m,event:m.event||m.title||"MATCH",ourScore:m.ourScore??"",oppScore:m.oppScore??"",logo:m.logo||"",status:m.status||"UPCOMING",featured:!!m.featured}));
}
async function loadOnline(){
  try{
    if(typeof serenityCloudLoad==="function"){
      const cloud=await serenityCloudLoad();
      if(cloud&&typeof cloud==="object"){
        data=cloud;
        if(!Array.isArray(data.matches))data.matches=[];
        data.matches=data.matches.map(m=>({...m,event:m.event||m.title||"MATCH",ourScore:m.ourScore??"",oppScore:m.oppScore??"",logo:m.logo||"",status:m.status||"UPCOMING",featured:!!m.featured}));
        try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){}
        return true;
      }
    }
  }catch(e){console.warn("Gagal mengambil Match online",e)}
  load();
  return false;
}
async function save(){
  localStorage.setItem(KEY,JSON.stringify(data));
  const pass=sessionStorage.getItem("serenity155AdminPass")||sessionStorage.getItem("serenityMatchAdminPass")||PASSWORD;
  if(typeof serenityAdminCloudSave==="function"){
    await serenityAdminCloudSave(data,pass);
  }
  return true;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function imageFile(file){
 return new Promise((res,rej)=>{if(!file)return res("");const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})
}
function reset(){
 editing=-1;pendingLogo="";
 $("matchDate").value="";$("opponent").value="";$("matchEvent").value="";$("game").value="POINT BLANK";
 $("format").value="";$("stream").value="";$("matchStatus").value="UPCOMING";$("ourScore").value="";$("oppScore").value="";
 $("opponentLogo").value="";$("opponentLogoPreview").hidden=true;$("addMatch").textContent="+ TAMBAH MATCH";$("cancelMatchEdit").hidden=true;
}

function getCurrentNextIndex(){
  let idx=data.matches.findIndex(m=>m.featured);
  if(idx>=0)return idx;
  const candidates=data.matches
    .map((m,i)=>({m,i}))
    .filter(x=>!["COMPLETED","FINISHED"].includes(String(x.m.status||"").toUpperCase()))
    .sort((a,b)=>new Date(a.m.date||0)-new Date(b.m.date||0));
  return candidates.length?candidates[0].i:-1;
}
function renderCurrentNext(){
  const box=$("currentNextMatchBox");
  if(!box)return;
  const i=getCurrentNextIndex();
  if(i<0){box.innerHTML="<b>Belum ada Next Match.</b><br><small>Tambahkan pertandingan lalu klik JADIKAN NEXT.</small>";return}
  const m=data.matches[i];
  box.innerHTML=`<div class="current-next-row">
    <div class="match-admin-logo">${m.logo?`<img src="${m.logo}" alt="">`:"VS"}</div>
    <div><b>SERENITY 155 VS ${esc(m.opponent)}</b><br><small>${esc(m.date||"DATE TBA")} • ${esc(m.game||"POINT BLANK")} • ${esc(m.format||m.event||"MATCH")}</small><br><strong style="color:#2de7f0">AKTIF DI HOMEPAGE</strong></div>
  </div>`;
}
function render(){
 renderCurrentNext();
 $("matchAdminList").innerHTML=data.matches.length?data.matches.map((m,i)=>`
 <div class="edit-row with-thumb match-admin-pro-row">
  <div class="match-admin-logo">${m.logo?`<img src="${m.logo}" alt="">`:"VS"}</div>
  <div class="match-admin-main">
   <b>SERENITY 155 VS ${esc(m.opponent)}</b><br>
   <small>${esc(m.date||"DATE TBA")} • ${esc(m.event||"MATCH")} • ${esc(m.status)} ${String(m.status).toUpperCase()==="COMPLETED"?`• SCORE ${esc(m.ourScore||0)} - ${esc(m.oppScore||0)}`:""} ${m.featured?"• NEXT MATCH":""}</small>
   <div class="match-actions">
    <button class="small-btn" data-edit-match="${i}" type="button">EDIT</button>
    <button class="small-btn" data-feature-match="${i}" type="button">JADIKAN NEXT</button>
    <label class="small-btn" style="cursor:pointer">GANTI LOGO<input type="file" accept="image/*" data-change-match-logo="${i}" hidden></label>
    ${m.logo?`<button class="small-btn danger" data-delete-match-logo="${i}" type="button">HAPUS LOGO</button>`:""}
   </div>
  </div>
  <button class="small-btn danger" data-remove-match="${i}" type="button">HAPUS</button>
 </div>`).join(""):'<p class="hint">Belum ada match tersimpan.</p>';
}
async function submit(){
 const opponent=$("opponent").value.trim();if(!opponent){$("matchSaveStatus").textContent="Nama lawan wajib diisi.";return}
 const old=editing>=0?data.matches[editing]:null;
 const item={date:$("matchDate").value,opponent,event:$("matchEvent").value.trim()||"MATCH",game:$("game").value.trim()||"POINT BLANK",format:$("format").value.trim(),stream:$("stream").value.trim(),status:$("matchStatus").value,ourScore:$("ourScore").value,oppScore:$("oppScore").value,logo:pendingLogo||(old?.logo||""),featured:old?.featured||false};
 if(editing>=0)data.matches[editing]=item;else data.matches.unshift(item);
 try{
   $("matchSaveStatus").textContent="Menyimpan match online...";
   await save();render();reset();
   $("matchSaveStatus").textContent="Match & skor tersimpan ONLINE ✓";
 }catch(e){
   console.error(e);
   $("matchSaveStatus").textContent="Gagal simpan online. Coba lagi.";
 }
 setTimeout(()=>$("matchSaveStatus").textContent="",3200);
}
function edit(i){const m=data.matches[i];if(!m)return;editing=i;$("matchDate").value=m.date||"";$("opponent").value=m.opponent||"";$("matchEvent").value=m.event||"MATCH";$("game").value=m.game||"POINT BLANK";$("format").value=m.format||"";$("stream").value=m.stream||"";$("matchStatus").value=m.status||"UPCOMING";$("ourScore").value=m.ourScore??"";$("oppScore").value=m.oppScore??"";pendingLogo="";if(m.logo){$("opponentLogoPreview").src=m.logo;$("opponentLogoPreview").hidden=false}else $("opponentLogoPreview").hidden=true;$("addMatch").textContent="SIMPAN PERUBAHAN";$("cancelMatchEdit").hidden=false;window.scrollTo({top:0,behavior:"smooth"})}

async function doLogin(){
  const user=($("matchAdminUser").value||"").trim().toLowerCase();
  const pass=($("matchAdminPass").value||"");
  const validUser=(user==="admin" || user==="rudiahmad111020@gmail.com");
  if(validUser && pass===PASSWORD){
    try{
      sessionStorage.setItem("serenityMatchAdmin","1");
      sessionStorage.setItem("serenityMatchAdminPass",pass);
      sessionStorage.setItem("serenity155AdminPass",pass);
    }catch(e){}
    $("matchAdminLoginStatus").textContent="Login berhasil ✓";
    $("matchAdminLogin").hidden=true;
    $("matchAdminView").hidden=false;
    $("matchAdminLoginStatus").textContent="Mengambil data Match online...";
    await loadOnline();
    render();
    $("matchAdminLoginStatus").textContent="Login berhasil • Data ONLINE ✓";
  }else{
    $("matchAdminLoginStatus").textContent="Username/email atau password salah.";
  }
}
$("matchAdminLoginBtn").onclick=(e)=>{e.preventDefault();doLogin();};
["matchAdminUser","matchAdminPass"].forEach(id=>{
  $(id).addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();doLogin();}
  });
});
$("matchAdminLogout").onclick=()=>{sessionStorage.removeItem("serenityMatchAdmin");location.reload()};
$("opponentLogo").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;pendingLogo=await imageFile(f);$("opponentLogoPreview").src=pendingLogo;$("opponentLogoPreview").hidden=false};
$("clearOpponentLogo").onclick=()=>{pendingLogo="";$("opponentLogo").value="";$("opponentLogoPreview").hidden=true};
$("addMatch").onclick=submit;$("saveMatchData").onclick=async()=>{
 try{
   $("matchSaveStatus").textContent="Menyimpan data match online...";
   await save();
   $("matchSaveStatus").textContent="Data Match tersimpan ONLINE ✓";
 }catch(e){
   console.error(e);
   $("matchSaveStatus").textContent="Gagal simpan online. Coba lagi.";
 }
 setTimeout(()=>$("matchSaveStatus").textContent="",3200);
};$("cancelMatchEdit").onclick=reset;
document.body.addEventListener("click",async e=>{
 const t=e.target;
 if(t.dataset.editMatch!==undefined)edit(+t.dataset.editMatch);
 if(t.dataset.removeMatch!==undefined&&confirm("Hapus match ini?")){data.matches.splice(+t.dataset.removeMatch,1);save().catch(console.error);render()}
 if(t.dataset.featureMatch!==undefined){
   const idx=+t.dataset.featureMatch;
   data.matches.forEach((m,i)=>m.featured=i===idx);
   try{
     $("matchSaveStatus").textContent="Mengubah NEXT MATCH homepage...";
     await save();
     render();
     $("matchSaveStatus").textContent="NEXT MATCH homepage berhasil diubah ONLINE ✓";
   }catch(err){
     console.error(err);
     $("matchSaveStatus").textContent="Gagal mengubah NEXT MATCH.";
   }
   setTimeout(()=>$("matchSaveStatus").textContent="",3200);
 }
 if(t.dataset.deleteMatchLogo!==undefined){data.matches[+t.dataset.deleteMatchLogo].logo="";save().catch(console.error);render()}
});
document.body.addEventListener("change",async e=>{if(e.target.dataset.changeMatchLogo!==undefined){const f=e.target.files?.[0];if(!f)return;data.matches[+e.target.dataset.changeMatchLogo].logo=await imageFile(f);save().catch(console.error);render()}});
if($("editCurrentNextMatch"))$("editCurrentNextMatch").onclick=()=>{
 const i=getCurrentNextIndex();
 if(i<0){$("matchSaveStatus").textContent="Belum ada Next Match untuk diedit.";return}
 edit(i);
};
if($("refreshMatchOnline"))$("refreshMatchOnline").onclick=async()=>{
 $("matchSaveStatus").textContent="Mengambil data terbaru...";
 await loadOnline();render();
 $("matchSaveStatus").textContent="Data online diperbarui ✓";
 setTimeout(()=>$("matchSaveStatus").textContent="",2200);
};

if(sessionStorage.getItem("serenityMatchAdmin")==="1"){
  $("matchAdminLogin").hidden=true;
  $("matchAdminView").hidden=false;
  loadOnline().then(render);
}
})();

