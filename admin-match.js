
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
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
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
function render(){
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
 save();render();reset();$("matchSaveStatus").textContent="Match berhasil disimpan ✓";setTimeout(()=>$("matchSaveStatus").textContent="",2000);
}
function edit(i){const m=data.matches[i];if(!m)return;editing=i;$("matchDate").value=m.date||"";$("opponent").value=m.opponent||"";$("matchEvent").value=m.event||"MATCH";$("game").value=m.game||"POINT BLANK";$("format").value=m.format||"";$("stream").value=m.stream||"";$("matchStatus").value=m.status||"UPCOMING";$("ourScore").value=m.ourScore??"";$("oppScore").value=m.oppScore??"";pendingLogo="";if(m.logo){$("opponentLogoPreview").src=m.logo;$("opponentLogoPreview").hidden=false}else $("opponentLogoPreview").hidden=true;$("addMatch").textContent="SIMPAN PERUBAHAN";$("cancelMatchEdit").hidden=false;window.scrollTo({top:0,behavior:"smooth"})}

$("matchAdminLoginBtn").onclick=()=>{if($("matchAdminUser").value==="admin"&&$("matchAdminPass").value===PASSWORD){sessionStorage.setItem("serenityMatchAdmin","1");$("matchAdminLogin").hidden=true;$("matchAdminView").hidden=false;load();render()}else $("matchAdminLoginStatus").textContent="Username atau password salah."};
$("matchAdminPass").addEventListener("keydown",e=>{if(e.key==="Enter")$("matchAdminLoginBtn").click()});
$("matchAdminLogout").onclick=()=>{sessionStorage.removeItem("serenityMatchAdmin");location.reload()};
$("opponentLogo").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;pendingLogo=await imageFile(f);$("opponentLogoPreview").src=pendingLogo;$("opponentLogoPreview").hidden=false};
$("clearOpponentLogo").onclick=()=>{pendingLogo="";$("opponentLogo").value="";$("opponentLogoPreview").hidden=true};
$("addMatch").onclick=submit;$("saveMatchData").onclick=()=>{save();$("matchSaveStatus").textContent="Data Match tersimpan ✓"};$("cancelMatchEdit").onclick=reset;
document.body.addEventListener("click",async e=>{
 const t=e.target;
 if(t.dataset.editMatch!==undefined)edit(+t.dataset.editMatch);
 if(t.dataset.removeMatch!==undefined&&confirm("Hapus match ini?")){data.matches.splice(+t.dataset.removeMatch,1);save();render()}
 if(t.dataset.featureMatch!==undefined){data.matches.forEach((m,i)=>m.featured=i===+t.dataset.featureMatch);save();render()}
 if(t.dataset.deleteMatchLogo!==undefined){data.matches[+t.dataset.deleteMatchLogo].logo="";save();render()}
});
document.body.addEventListener("change",async e=>{if(e.target.dataset.changeMatchLogo!==undefined){const f=e.target.files?.[0];if(!f)return;data.matches[+e.target.dataset.changeMatchLogo].logo=await imageFile(f);save();render()}});
if(sessionStorage.getItem("serenityMatchAdmin")==="1"){$("matchAdminLogin").hidden=true;$("matchAdminView").hidden=false;load();render()}
})();
