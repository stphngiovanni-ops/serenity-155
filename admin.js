
const DEFAULT_DATA={
  about1:"SERENITY 155 adalah squad esports yang dibangun dari kekompakan, disiplin, komunikasi, dan mental kompetitif. Kami bertanding bukan hanya untuk menang, tetapi untuk membangun nama, keluarga, dan perjalanan yang layak dikenang.",
  about2:"Website ini menampilkan profil resmi squad, perjalanan turnamen, roster aktif, sponsor, jadwal pertandingan, serta pencapaian SERENITY.",
  competitiveRoster:[
    {name:"ZEED",role:"RIFLER",detail:"ENTRY • AGGRESSIVE",photo:""},
    {name:"MDFK",role:"RIFLER",detail:"AIM • CONTROL",photo:""},
    {name:"IRVING",role:"CAPTAIN / IGL",detail:"TACTICAL • LEADER",photo:""},
    {name:"SUPERNDUT",role:"DUAL / SUPPORT",detail:"UTILITY • CLUTCH",photo:""},
    {name:"DEMON",role:"DUAL / FLEX",detail:"PRESSURE • FLEX",photo:""}
  ],
  warRoster:[],
  achievements:[
    {year:"2026",badge:"CHAMPION",title:"PBRS SEMARANG",desc:"Menjadi juara dan melanjutkan perjalanan kompetitif SERENITY ke level berikutnya.",photo:""},
    {year:"2026",badge:"QUALIFIED",title:"PBSB DIVISI 1",desc:"Lolos ke PBSB Divisi 1 dengan target berikutnya: melangkah menuju PBNC.",photo:""},
    {year:"NEXT",badge:"MISSION",title:"PBNC",desc:"Target besar berikutnya. Keep grinding. Keep fighting.",photo:""}
  ],
  matches:[{date:"2026-09-12T20:00",opponent:"OPPONENT",game:"POINT BLANK",format:"BO3 / BO5",stream:"LIVE STREAM",status:"UPCOMING",logo:"",featured:true}],
  matchHistory:[],
  announcements:[{id:"welcome-v112",title:"WELCOME TO SERENITY 155",category:"TEAM",date:"2026-08-21",message:"Selamat datang di official website SQUAD SERENITY 155.",pinned:true,active:true,image:""}],
  sponsors:[{name:"NKJ",logo:""},{name:"AJ1",logo:""},{name:"2K",logo:""},{name:"PARTNER",logo:""}],
  contact:{email:"serenity155@example.com",instagram:"https://instagram.com/",youtube:"https://youtube.com/"}
};
const $=id=>document.getElementById(id),cloneDefault=()=>JSON.parse(JSON.stringify(DEFAULT_DATA));
const SERENITY_MEDIA_ENDPOINT="https://vcmbthekmltociajzsdx.supabase.co/functions/v1/serenity-media";
async function uploadImageToCloud(dataUrl,folder="uploads"){
  if(!dataUrl || !String(dataUrl).startsWith("data:image/")) return dataUrl||"";
  const r=await fetch(SERENITY_MEDIA_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dataUrl,folder})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok || !j.url) throw new Error(j.error||"Upload foto ke cloud gagal");
  return j.url;
}

let data=cloneDefault(),pendingPlayerPhoto="",pendingAchPhoto="",pendingOpponentLogo="",editingMatchIndex=-1,editingPlayerGroup="",editingPlayerIndex=-1,pendingSponsorLogo="",pendingHistoryLogo="",editingHistoryIndex=-1;

function migrate(x){
  if(!x)return cloneDefault();
  if(!x.competitiveRoster&&x.roster)x.competitiveRoster=x.roster.slice(0,5);
  if(!x.warRoster)x.warRoster=[];
  if(!x.matches&&x.match)x.matches=[{...x.match,status:"UPCOMING",logo:"",featured:true}];
  x.competitiveRoster=(x.competitiveRoster||[]).slice(0,5).map(p=>({...p,photo:p.photo||""}));
  x.warRoster=(x.warRoster||[]).slice(0,12).map(p=>({...p,photo:p.photo||""}));
  x.matches=(x.matches||[]).map(m=>({...m,logo:m.logo||"",status:m.status||"UPCOMING",featured:!!m.featured}));
  x.matchHistory=(x.matchHistory||[]).map(h=>({...h,logo:h.logo||"",result:h.result||"WIN",ourScore:Number(h.ourScore||0),opponentScore:Number(h.opponentScore||0)}));
  x.announcements=(x.announcements||[]).map(a=>({...a,image:a.image||"",active:a.active!==false,pinned:!!a.pinned}));
  x.achievements=(x.achievements||[]).map(a=>({...a,photo:a.photo||""}));
  x.sponsors=(x.sponsors||[]).map(v=>typeof v==="string"?{name:v,logo:""}:{name:v.name||"SPONSOR",logo:v.logo||""});
  return x;
}
function loadData(){try{data=migrate(JSON.parse(localStorage.getItem("serenity155Data"))||cloneDefault())}catch(e){data=cloneDefault()}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
let cropState={
  file:null,img:null,mode:"player",resolve:null,
  outputW:720,outputH:900,quality:.88,
  zoom:1,x:0,y:0,rotate:0
};

function openCropEditor(file,mode="player"){
  return new Promise((resolve,reject)=>{
    if(!file){resolve("");return}
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        cropState={
          file,img,mode,resolve,
          outputW: mode==="achievement" ? 1200 : mode==="logo" ? 700 : mode==="announcement" ? 1280 : 720,
          outputH: mode==="achievement" ? 800 : mode==="logo" ? 700 : mode==="announcement" ? 720 : 900,
          quality: mode==="logo" ? .92 : .88,
          zoom:1,x:0,y:0,rotate:0
        };
        $("cropTitle").textContent = mode==="achievement" ? "CROP FOTO ACHIEVEMENT" : mode==="logo" ? "CROP LOGO" : mode==="announcement" ? "CROP FOTO ANNOUNCEMENT" : "CROP FOTO PEMAIN";
        $("cropRatioLabel").textContent = mode==="achievement" ? "Rasio: 3:2" : mode==="logo" ? "Rasio: 1:1" : mode==="announcement" ? "Rasio: 16:9" : "Rasio: 4:5";
        $("cropZoom").value="1";$("cropX").value="0";$("cropY").value="0";$("cropRotate").value="0";
        const canvas=$("cropCanvas");
        canvas.width=cropState.outputW;
        canvas.height=cropState.outputH;
        $("cropModal").hidden=false;
        document.body.style.overflow="hidden";
        drawCrop();
      };
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function drawCrop(){
  const st=cropState,canvas=$("cropCanvas"),ctx=canvas.getContext("2d"),img=st.img;
  if(!img)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#05070b";ctx.fillRect(0,0,canvas.width,canvas.height);

  const cover=Math.max(canvas.width/img.width,canvas.height/img.height);
  const scale=cover*st.zoom;
  const drawW=img.width*scale,drawH=img.height*scale;
  const maxX=Math.max(0,(drawW-canvas.width)/2),maxY=Math.max(0,(drawH-canvas.height)/2);
  const cx=canvas.width/2 + st.x*maxX;
  const cy=canvas.height/2 + st.y*maxY;

  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(st.rotate*Math.PI/180);
  ctx.drawImage(img,-drawW/2,-drawH/2,drawW,drawH);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle="rgba(40,231,240,.55)";
  ctx.lineWidth=Math.max(2,canvas.width/360);
  ctx.strokeRect(2,2,canvas.width-4,canvas.height-4);
  ctx.restore();
}

function closeCropEditor(result=""){
  const resolver=cropState.resolve;
  $("cropModal").hidden=true;
  document.body.style.overflow="";
  cropState.resolve=null;
  if(resolver)resolver(result);
}

function applyCrop(){
  const canvas=$("cropCanvas");
  const result=canvas.toDataURL("image/jpeg",cropState.quality);
  closeCropEditor(result);
}

function resetCrop(){
  cropState.zoom=1;cropState.x=0;cropState.y=0;cropState.rotate=0;
  $("cropZoom").value="1";$("cropX").value="0";$("cropY").value="0";$("cropRotate").value="0";
  drawCrop();
}

function imageToDataURL(file,maxW=900,maxH=900,quality=.82){
  const mode=(maxW===1200&&maxH===850)?"achievement":(maxW===700&&maxH===700)?"logo":(maxW===1280&&maxH===720)?"announcement":"player";
  return openCropEditor(file,mode);
}
function login(){if(($("loginUser").value||"").trim()==="admin"&&($("loginPass").value||"")==="serenitymei2025"){try{sessionStorage.setItem("serenity155Admin","1")}catch(e){}showAdmin()}else $("loginStatus").textContent="Username atau password salah."}

async function mergeLegacyAnnouncementsIntoCloud(){
  try{
    const legacy=JSON.parse(localStorage.getItem("serenity_announcements_v109")||"null");
    if(!Array.isArray(legacy) || !legacy.length) return false;
    if(!Array.isArray(data.announcements)) data.announcements=[];

    const byId=new Map(data.announcements.map(a=>[String(a.id||""),a]));
    let changed=false;
    for(const raw of legacy){
      const a={...raw,image:raw?.image||"",active:raw?.active!==false,pinned:!!raw?.pinned};
      const id=String(a.id||"ann-"+Date.now()+"-"+Math.random().toString(36).slice(2));
      a.id=id;
      const existing=byId.get(id);
      if(!existing){
        data.announcements.push(a);
        byId.set(id,a);
        changed=true;
      }else{
        // Prefer legacy values when cloud copy is only empty/default.
        const merged={...existing,...a};
        const idx=data.announcements.findIndex(x=>String(x.id||"")===id);
        if(idx>=0 && JSON.stringify(data.announcements[idx])!==JSON.stringify(merged)){
          data.announcements[idx]=merged;
          changed=true;
        }
      }
    }
    if(changed){
      await serenityAdminCloudSave(data,"serenity155");
      try{localStorage.setItem("serenity155Data",JSON.stringify(data))}catch(e){}
    }
    return changed;
  }catch(e){
    console.warn("Legacy announcement migration failed",e);
    return false;
  }
}

async function showAdmin(){
  $("loginView").hidden=true;$("loginView").style.display="none";$("adminView").hidden=false;$("adminView").style.display="block";
  const cloud=await serenityCloudLoad();
  if(cloud){
    data=migrate(cloud);
    try{localStorage.setItem("serenity155Data",JSON.stringify(cloud))}catch(e){
      try{localStorage.setItem("serenity155Data",JSON.stringify(makeLightLocalCopy(cloud)))}catch(_){}
    }
  }else{
    loadData();
  }
  const migratedAnnouncements=await mergeLegacyAnnouncementsIntoCloud();
  fillForm();renderLists();
  if(window.refreshSerenityAnnouncementAdmin) window.refreshSerenityAnnouncementAdmin();
  if(migratedAnnouncements){
    const s=document.getElementById("saveStatus");
    if(s)s.textContent="Announcement lama berhasil dipindahkan ke ONLINE ✓";
  }
  const hasAnyPhoto=[...(data.competitiveRoster||[]).map(x=>x.photo),...(data.warRoster||[]).map(x=>x.photo),...(data.achievements||[]).map(x=>x.photo),...(data.sponsors||[]).map(x=>x.logo),...(data.matches||[]).map(x=>x.logo),...(data.matchHistory||[]).map(x=>x.logo)].some(Boolean);
  const warn=document.getElementById("cloudPhotoWarning"); if(warn)warn.hidden=hasAnyPhoto;
}
function fillForm(){
  $("about1").value=data.about1||"";$("about2").value=data.about2||"";
  data.contact=data.contact||{};$("email").value=data.contact.email||"";$("instagram").value=data.contact.instagram||"";$("youtube").value=data.contact.youtube||"";
}
function thumb(photo,initial){return photo?`<img class="admin-thumb" src="${photo}" alt="">`:`<div class="admin-thumb placeholder">${esc(initial||"?")}</div>`}
function matchLogo(logo){return logo?`<div class="match-admin-logo"><img src="${logo}" alt=""></div>`:`<div class="match-admin-logo">?</div>`}
function playerRow(p,i,group){
  return `<div class="edit-row with-thumb">${thumb(p.photo,(p.name||"?").charAt(0))}
  <div><b>${esc(p.name)}</b><br><small>${esc(p.role)} • ${esc(p.detail)}</small>
    <div class="image-tools">
      <button class="small-btn" type="button" data-edit-player="${group}:${i}">EDIT DATA</button>
      <label class="small-btn" style="cursor:pointer">GANTI FOTO<input type="file" accept="image/*" data-change-player-photo="${group}:${i}" hidden></label>
      ${p.photo?`<button class="small-btn danger" type="button" data-delete-player-photo="${group}:${i}">HAPUS FOTO</button>`:""}
    </div>
  </div>
  <button class="small-btn danger" type="button" data-remove-player="${group}:${i}">HAPUS</button></div>`;
}
function renderLists(){
  $("competitiveCounter").textContent=`${data.competitiveRoster.length} / 5`;
  $("warCounter").textContent=`${data.warRoster.length} / 12`;
  $("competitiveRosterList").innerHTML=data.competitiveRoster.map((p,i)=>playerRow(p,i,"competitive")).join("");
  $("warRosterList").innerHTML=data.warRoster.map((p,i)=>playerRow(p,i,"war")).join("");

  $("achievementAdminList").innerHTML=(data.achievements||[]).map((a,i)=>`<div class="edit-row with-thumb">${thumb(a.photo,"★")}<div><b>${esc(a.title)}</b><br><small>${esc(a.year)} • ${esc(a.badge)}</small><div class="image-tools"><label class="small-btn" style="cursor:pointer">GANTI FOTO<input type="file" accept="image/*" data-change-ach-photo="${i}" hidden></label>${a.photo?`<button class="small-btn danger" type="button" data-delete-ach-photo="${i}">HAPUS FOTO</button>`:""}</div></div><button class="small-btn danger" type="button" data-remove-achievement="${i}">HAPUS</button></div>`).join("");
  $("sponsorList").innerHTML=(data.sponsors||[]).map((sp,i)=>{
    const item=typeof sp==="string"?{name:sp,logo:""}:sp;
    return `<div class="edit-row with-thumb">
      <div class="sponsor-admin-logo">${item.logo?`<img src="${item.logo}" alt="">`:"S"}</div>
      <div><b>${esc(item.name)}</b>
        <div class="image-tools">
          <label class="small-btn" style="cursor:pointer">GANTI LOGO<input type="file" accept="image/*" data-change-sponsor-logo="${i}" hidden></label>
          ${item.logo?`<button class="small-btn danger" type="button" data-delete-sponsor-logo="${i}">HAPUS LOGO</button>`:""}
        </div>
      </div>
      <button class="small-btn danger" type="button" data-remove-sponsor="${i}">HAPUS</button>
    </div>`;
  }).join("");

  $("matchAdminList").innerHTML=(data.matches||[]).map((m,i)=>`
    <div class="edit-row with-thumb">
      ${matchLogo(m.logo)}
      <div><b>SERENITY 155 VS ${esc(m.opponent)}</b><br><small>${esc(m.date||"DATE TBA")} • ${esc(m.game)} • ${esc(m.format)} • ${esc(m.status)} ${m.featured?"• NEXT MATCH":""}</small>
        <div class="match-actions">
          <button class="small-btn" type="button" data-edit-match="${i}">EDIT</button>
          <button class="small-btn" type="button" data-feature-match="${i}">JADIKAN NEXT</button>
          <label class="small-btn" style="cursor:pointer">GANTI LOGO<input type="file" accept="image/*" data-change-match-logo="${i}" hidden></label>
          ${m.logo?`<button class="small-btn danger" type="button" data-delete-match-logo="${i}">HAPUS LOGO</button>`:""}
        </div>
      </div>
      <button class="small-btn danger" type="button" data-remove-match="${i}">HAPUS</button>
    </div>`).join("");

  $("historyAdminList").innerHTML=(data.matchHistory||[]).map((h,i)=>`<div class="edit-row with-thumb">${matchLogo(h.logo)}<div><b>SERENITY 155 ${esc(h.ourScore)} - ${esc(h.opponentScore)} ${esc(h.opponent)}</b><br><small>${esc(h.date||"DATE TBA")} • ${esc(h.event||"MATCH")} • ${esc(h.result)}</small><div class="match-actions"><button class="small-btn" type="button" data-edit-history="${i}">EDIT</button><label class="small-btn" style="cursor:pointer">GANTI LOGO<input type="file" accept="image/*" data-change-history-logo="${i}" hidden></label>${h.logo?`<button class="small-btn danger" type="button" data-delete-history-logo="${i}">HAPUS LOGO</button>`:""}</div></div><button class="small-btn danger" type="button" data-remove-history="${i}">HAPUS</button></div>`).join("");
}
function parseGroupIndex(value){
  const [group,index]=String(value).split(":");
  return {group,index:Number(index)};
}
function getRoster(group){
  if(!Array.isArray(data.competitiveRoster)) data.competitiveRoster=[];
  if(!Array.isArray(data.warRoster)) data.warRoster=[];
  return group==="war"?data.warRoster:data.competitiveRoster;
}

async function migrateBase64ImagesToCloud(obj,path="data"){
  if(!obj || typeof obj!=="object") return;
  for(const k of Object.keys(obj)){
    const v=obj[k];
    if(typeof v==="string" && v.startsWith("data:image/")){
      obj[k]=await uploadImageToCloud(v,path.replace(/[^a-zA-Z0-9_-]/g,"-"));
    }else if(v && typeof v==="object"){
      await migrateBase64ImagesToCloud(v,path+"-"+k);
    }
  }
}

let cloudSaveTimer=null;
function makeLightLocalCopy(obj){
  const copy=JSON.parse(JSON.stringify(obj));
  const strip=v=>{
    if(!v||typeof v!=="object")return;
    for(const k of Object.keys(v)){
      const x=v[k];
      if(typeof x==="string" && x.startsWith("data:image/")) v[k]="";
      else if(x&&typeof x==="object") strip(x);
    }
  };
  strip(copy);
  return copy;
}
function scheduleCloudSave(){
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(async()=>{
    try{
      await migrateBase64ImagesToCloud(data,"serenity155");
      await serenityAdminCloudSave(data,"serenity155");
      const s=document.getElementById("saveStatus");
      if(s)s.textContent="Tersimpan ONLINE ✓";
    }catch(e){
      const s=document.getElementById("saveStatus");
      if(s)s.textContent="Cloud gagal: "+e.message;
    }
  },500);
}
function saveSilent(){
  try{
    localStorage.setItem("serenity155Data",JSON.stringify(data));
  }catch(e){
    if(e && (e.name==="QuotaExceededError" || String(e.message).includes("quota"))){
      try{
        localStorage.setItem("serenity155Data",JSON.stringify(makeLightLocalCopy(data)));
      }catch(_){}
    }else{throw e}
  }
  scheduleCloudSave();
}
async function addPlayer(){
  const name=$("playerName").value.trim();
  if(!name){
    $("saveStatus").textContent="Nickname pemain wajib diisi.";
    setTimeout(()=>$("saveStatus").textContent="",2200);
    return;
  }

  const group=$("playerSquad").value;
  const roster=getRoster(group);
  const limit=group==="war"?12:5;

  if(editingPlayerIndex<0 && roster.length>=limit){
    $("saveStatus").textContent=group==="war"
      ? "Squad War sudah penuh (maksimal 12 pemain)."
      : "Squad Competitive sudah penuh (maksimal 5 pemain).";
    setTimeout(()=>$("saveStatus").textContent="",2600);
    return;
  }

  const existing = editingPlayerIndex>=0 ? getRoster(editingPlayerGroup)[editingPlayerIndex] : null;
  const player={
    name,
    role:$("playerRole").value.trim(),
    detail:$("playerDetail").value.trim(),
    photo:pendingPlayerPhoto || (existing?.photo||"")
  };

  if(editingPlayerIndex>=0){
    const oldRoster=getRoster(editingPlayerGroup);
    oldRoster.splice(editingPlayerIndex,1);

    const target=getRoster(group);
    if(target.length>=limit && group!==editingPlayerGroup){
      oldRoster.splice(editingPlayerIndex,0,existing);
      $("saveStatus").textContent="Squad tujuan sudah penuh.";
      setTimeout(()=>$("saveStatus").textContent="",2200);
      return;
    }
    target.push(player);
  }else{
    roster.push(player);
  }

  try{saveSilent()}catch(e){}
  pendingPlayerPhoto="";
  editingPlayerGroup="";
  editingPlayerIndex=-1;
  $("playerName").value="";
  $("playerRole").value="";
  $("playerDetail").value="";
  $("playerPhoto").value="";
  $("playerPhotoPreview").hidden=true;
  $("addPlayer").textContent="+ TAMBAH PEMAIN";
  renderLists();

  $("saveStatus").textContent="Pemain berhasil disimpan ✓";
  setTimeout(()=>$("saveStatus").textContent="",2200);
}

function editPlayer(group,index){
  const roster=getRoster(group);
  const p=roster[index];
  if(!p)return;

  editingPlayerGroup=group;
  editingPlayerIndex=index;
  pendingPlayerPhoto="";

  $("playerSquad").value=group;
  $("playerName").value=p.name||"";
  $("playerRole").value=p.role||"";
  $("playerDetail").value=p.detail||"";

  if(p.photo){
    $("playerPhotoPreview").src=p.photo;
    $("playerPhotoPreview").hidden=false;
  }else{
    $("playerPhotoPreview").hidden=true;
  }
  $("playerPhoto").value="";
  $("addPlayer").textContent="SIMPAN PERUBAHAN PEMAIN";
  window.scrollTo({top:$("playerSquad").getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});
}

async function addAchievement(){
  const title=$("achTitle").value.trim();if(!title)return;
  data.achievements.push({year:$("achYear").value.trim(),badge:$("achBadge").value.trim(),title,desc:$("achDesc").value.trim(),photo:pendingAchPhoto});
  pendingAchPhoto="";["achYear","achBadge","achTitle","achDesc"].forEach(id=>$(id).value="");$("achPhoto").value="";$("achPhotoPreview").hidden=true;renderLists();
}
function addSponsor(){
  const name=$("sponsorName").value.trim();
  if(!name)return;
  data.sponsors.push({name,logo:pendingSponsorLogo});
  pendingSponsorLogo="";
  $("sponsorName").value="";
  $("sponsorLogo").value="";
  $("sponsorLogoPreview").hidden=true;
  try{saveSilent()}catch(e){}
  renderLists();
  $("saveStatus").textContent="Sponsor berhasil ditambahkan ✓";
  setTimeout(()=>$("saveStatus").textContent="",2200);
}

function resetMatchForm(){
  editingMatchIndex=-1;pendingOpponentLogo="";
  $("matchDate").value="";$("opponent").value="";$("game").value="POINT BLANK";$("format").value="";$("stream").value="";$("matchStatus").value="UPCOMING";
  $("opponentLogo").value="";$("opponentLogoPreview").hidden=true;
  $("saveMatch").textContent="+ TAMBAH MATCH";$("cancelMatchEdit").hidden=true;
}
function saveMatch(){
  const opponent=$("opponent").value.trim();if(!opponent){$("saveStatus").textContent="Nama lawan wajib diisi.";return}
  const existing=editingMatchIndex>=0?data.matches[editingMatchIndex]:null;
  const item={
    date:$("matchDate").value,opponent,game:$("game").value.trim()||"POINT BLANK",format:$("format").value.trim(),
    stream:$("stream").value.trim(),status:$("matchStatus").value,
    logo:pendingOpponentLogo || (existing?.logo||""),featured:existing?.featured||false
  };
  if(editingMatchIndex>=0)data.matches[editingMatchIndex]=item;else data.matches.push(item);
  resetMatchForm();renderLists();
}
function editMatch(i){
  const m=data.matches[i];editingMatchIndex=i;pendingOpponentLogo="";
  $("matchDate").value=m.date||"";$("opponent").value=m.opponent||"";$("game").value=m.game||"POINT BLANK";$("format").value=m.format||"";$("stream").value=m.stream||"";$("matchStatus").value=m.status||"UPCOMING";
  if(m.logo){$("opponentLogoPreview").src=m.logo;$("opponentLogoPreview").hidden=false}else $("opponentLogoPreview").hidden=true;
  $("saveMatch").textContent="SIMPAN PERUBAHAN MATCH";$("cancelMatchEdit").hidden=false;
  window.scrollTo({top:$("matchDate").getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});
}
function featureMatch(i){data.matches.forEach((m,idx)=>m.featured=idx===i);renderLists()}
function resetHistoryForm(){editingHistoryIndex=-1;pendingHistoryLogo="";$("historyDate").value="";$("historyOpponent").value="";$("historyEvent").value="";$("historyFormat").value="";$("historyOurScore").value="0";$("historyOpponentScore").value="0";$("historyResult").value="WIN";$("historyGame").value="POINT BLANK";$("historyNote").value="";$("historyLogo").value="";$("historyLogoPreview").hidden=true;$("saveHistory").textContent="+ TAMBAH RIWAYAT";$("cancelHistoryEdit").hidden=true}
function saveHistory(){const opponent=$("historyOpponent").value.trim();if(!opponent){$("saveStatus").textContent="Nama lawan riwayat wajib diisi.";return}const existing=editingHistoryIndex>=0?data.matchHistory[editingHistoryIndex]:null;const item={date:$("historyDate").value,opponent,event:$("historyEvent").value.trim(),format:$("historyFormat").value.trim(),ourScore:Number($("historyOurScore").value||0),opponentScore:Number($("historyOpponentScore").value||0),result:$("historyResult").value,game:$("historyGame").value.trim()||"POINT BLANK",note:$("historyNote").value.trim(),logo:pendingHistoryLogo||(existing?.logo||"")};if(editingHistoryIndex>=0)data.matchHistory[editingHistoryIndex]=item;else data.matchHistory.push(item);try{saveSilent()}catch(e){}resetHistoryForm();renderLists()}
function editHistory(i){const h=data.matchHistory[i];editingHistoryIndex=i;pendingHistoryLogo="";$("historyDate").value=h.date||"";$("historyOpponent").value=h.opponent||"";$("historyEvent").value=h.event||"";$("historyFormat").value=h.format||"";$("historyOurScore").value=h.ourScore??0;$("historyOpponentScore").value=h.opponentScore??0;$("historyResult").value=h.result||"WIN";$("historyGame").value=h.game||"POINT BLANK";$("historyNote").value=h.note||"";if(h.logo){$("historyLogoPreview").src=h.logo;$("historyLogoPreview").hidden=false}else $("historyLogoPreview").hidden=true;$("saveHistory").textContent="SIMPAN PERUBAHAN RIWAYAT";$("cancelHistoryEdit").hidden=false;window.scrollTo({top:$("historyDate").getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"})}

async function saveAll(){
  data.about1=$("about1").value;data.about2=$("about2").value;
  data.contact={email:$("email").value,instagram:$("instagram").value,youtube:$("youtube").value};
  try{
    await migrateBase64ImagesToCloud(data,"serenity155");
      await serenityAdminCloudSave(data,"serenity155");
    try{localStorage.setItem("serenity155Data",JSON.stringify(data))}catch(e){
      try{localStorage.setItem("serenity155Data",JSON.stringify(makeLightLocalCopy(data)))}catch(_){}
    }
    $("saveStatus").textContent="Tersimpan ONLINE ✓";
  }catch(e){
    $("saveStatus").textContent="Cloud gagal: "+e.message;
  }
  setTimeout(()=>$("saveStatus").textContent="",3500);
}

function resetAll(){if(confirm("Reset seluruh data ke default?")){data=cloneDefault();saveSilent();fillForm();renderLists();resetMatchForm();$("saveStatus").textContent="Data direset."}}

async function migrateLocalToCloud(){
  const status=$("cloudStatus");
  try{
    const raw=localStorage.getItem("serenity155Data");
    if(!raw){status.textContent="Tidak ditemukan data lama di browser ini.";return}
    const local=migrate(JSON.parse(raw));
    status.textContent="Mengirim data lama ke online...";
    await migrateBase64ImagesToCloud(local,"serenity155-migrate");
    await serenityAdminCloudSave(local,"serenity155");
    data=local;fillForm();renderLists();
    status.textContent="BERHASIL ✓ Data lama sudah online.";
  }catch(e){status.textContent="Migrasi gagal: "+e.message}
}
async function loadCloudToAdmin(){
  const status=$("cloudStatus");
  try{
    status.textContent="Mengambil data online...";
    const cloud=await serenityCloudLoad();
    if(!cloud){status.textContent="Database online masih kosong.";return}
    data=migrate(cloud);
    try{localStorage.setItem("serenity155Data",JSON.stringify(cloud))}catch(e){
      try{localStorage.setItem("serenity155Data",JSON.stringify(makeLightLocalCopy(cloud)))}catch(_){}
    }
    fillForm();renderLists();
    status.textContent="Data online berhasil dimuat ✓";
  }catch(e){status.textContent="Gagal: "+e.message}
}
document.addEventListener("DOMContentLoaded",()=>{
  $("cropZoom").addEventListener("input",e=>{cropState.zoom=Number(e.target.value);drawCrop()});
  $("cropX").addEventListener("input",e=>{cropState.x=Number(e.target.value);drawCrop()});
  $("cropY").addEventListener("input",e=>{cropState.y=Number(e.target.value);drawCrop()});
  $("cropRotate").addEventListener("input",e=>{cropState.rotate=Number(e.target.value);drawCrop()});
  $("cropReset").addEventListener("click",resetCrop);
  $("cropApply").addEventListener("click",applyCrop);
  $("cropClose").addEventListener("click",()=>closeCropEditor(""));
  $("cropModal").querySelector(".crop-backdrop").addEventListener("click",()=>closeCropEditor(""));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("cropModal").hidden)closeCropEditor("")});

  $("migrateLocalToCloud").addEventListener("click",migrateLocalToCloud);$("loadCloudToAdmin").addEventListener("click",loadCloudToAdmin);
  $("loginBtn").addEventListener("click",login);$("loginPass").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
  $("logoutBtn").addEventListener("click",()=>{try{sessionStorage.removeItem("serenity155Admin")}catch(e){}location.reload()});
  $("addPlayer").addEventListener("click",addPlayer);$("addAchievement").addEventListener("click",addAchievement);$("addSponsor").addEventListener("click",addSponsor);
  $("saveMatch").addEventListener("click",saveMatch);$("cancelMatchEdit").addEventListener("click",resetMatchForm);$("saveHistory").addEventListener("click",saveHistory);$("cancelHistoryEdit").addEventListener("click",resetHistoryForm);
  $("saveAll").addEventListener("click",saveAll);$("resetAll").addEventListener("click",resetAll);

  $("playerPhoto").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,900,900,.82);if(cropped){pendingPlayerPhoto=cropped;$("playerPhotoPreview").src=pendingPlayerPhoto;$("playerPhotoPreview").hidden=false}else{$("playerPhoto").value=""}});
  $("achPhoto").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,1200,850,.82);if(cropped){pendingAchPhoto=cropped;$("achPhotoPreview").src=pendingAchPhoto;$("achPhotoPreview").hidden=false}else{$("achPhoto").value=""}});
  $("opponentLogo").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,700,700,.88);if(cropped){pendingOpponentLogo=cropped;$("opponentLogoPreview").src=pendingOpponentLogo;$("opponentLogoPreview").hidden=false}else{$("opponentLogo").value=""}});
  $("historyLogo").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,700,700,.88);if(cropped){pendingHistoryLogo=cropped;$("historyLogoPreview").src=cropped;$("historyLogoPreview").hidden=false}else $("historyLogo").value=""});
  $("sponsorLogo").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,700,700,.88);if(cropped){pendingSponsorLogo=cropped;$("sponsorLogoPreview").src=pendingSponsorLogo;$("sponsorLogoPreview").hidden=false}else{$("sponsorLogo").value=""}});
  $("clearPlayerPhoto").addEventListener("click",()=>{pendingPlayerPhoto="";$("playerPhoto").value="";$("playerPhotoPreview").hidden=true});
  $("clearAchPhoto").addEventListener("click",()=>{pendingAchPhoto="";$("achPhoto").value="";$("achPhotoPreview").hidden=true});
  $("clearOpponentLogo").addEventListener("click",()=>{pendingOpponentLogo="";$("opponentLogo").value="";$("opponentLogoPreview").hidden=true});
  $("clearHistoryLogo").addEventListener("click",()=>{pendingHistoryLogo="";$("historyLogo").value="";$("historyLogoPreview").hidden=true});
  $("clearSponsorLogo").addEventListener("click",()=>{pendingSponsorLogo="";$("sponsorLogo").value="";$("sponsorLogoPreview").hidden=true});

  document.body.addEventListener("click",e=>{
    const t=e.target;
    if(t.matches("[data-edit-player]")){
      const {group,index}=parseGroupIndex(t.dataset.editPlayer);editPlayer(group,index)
    } else if(t.matches("[data-remove-player]")){
      const {group,index}=parseGroupIndex(t.dataset.removePlayer);getRoster(group).splice(index,1);try{saveSilent()}catch(e){};renderLists()
    } else if(t.matches("[data-delete-player-photo]")){
      const {group,index}=parseGroupIndex(t.dataset.deletePlayerPhoto);getRoster(group)[index].photo="";try{saveSilent()}catch(e){};renderLists()
    } else if(t.matches("[data-remove-achievement]")){data.achievements.splice(Number(t.dataset.removeAchievement),1);renderLists()}
    else if(t.matches("[data-delete-ach-photo]")){data.achievements[Number(t.dataset.deleteAchPhoto)].photo="";renderLists()}
    else if(t.matches("[data-delete-sponsor-logo]")){data.sponsors[Number(t.dataset.deleteSponsorLogo)].logo="";try{saveSilent()}catch(e){};renderLists()}
    else if(t.matches("[data-remove-sponsor]")){data.sponsors.splice(Number(t.dataset.removeSponsor),1);try{saveSilent()}catch(e){};renderLists()}
    else if(t.matches("[data-edit-history]"))editHistory(Number(t.dataset.editHistory))
    else if(t.matches("[data-delete-history-logo]")){data.matchHistory[Number(t.dataset.deleteHistoryLogo)].logo="";try{saveSilent()}catch(e){};renderLists()}
    else if(t.matches("[data-remove-history]")){const i=Number(t.dataset.removeHistory);data.matchHistory.splice(i,1);if(editingHistoryIndex===i)resetHistoryForm();try{saveSilent()}catch(e){};renderLists()}
    else if(t.matches("[data-edit-match]"))editMatch(Number(t.dataset.editMatch))
    else if(t.matches("[data-feature-match]"))featureMatch(Number(t.dataset.featureMatch))
    else if(t.matches("[data-delete-match-logo]")){data.matches[Number(t.dataset.deleteMatchLogo)].logo="";renderLists()}
    else if(t.matches("[data-remove-match]")){
      const i=Number(t.dataset.removeMatch);data.matches.splice(i,1);
      if(data.matches.length&&!data.matches.some(m=>m.featured))data.matches[0].featured=true;
      if(editingMatchIndex===i)resetMatchForm();renderLists()
    }
  });

  document.body.addEventListener("change",async e=>{
    const t=e.target,f=t.files?.[0];if(!f)return;
    if(t.matches("[data-change-player-photo]")){
      const {group,index}=parseGroupIndex(t.dataset.changePlayerPhoto);
      const cropped=await imageToDataURL(f,900,900,.82);if(cropped){getRoster(group)[index].photo=cropped;try{saveSilent()}catch(e){};renderLists()}
    } else if(t.matches("[data-change-ach-photo]")){const cropped=await imageToDataURL(f,1200,850,.82);if(cropped){data.achievements[Number(t.dataset.changeAchPhoto)].photo=cropped;try{saveSilent()}catch(e){};renderLists()}}
    else if(t.matches("[data-change-history-logo]")){const cropped=await imageToDataURL(f,700,700,.88);if(cropped){data.matchHistory[Number(t.dataset.changeHistoryLogo)].logo=cropped;try{saveSilent()}catch(e){};renderLists()}}
    else if(t.matches("[data-change-match-logo]")){const cropped=await imageToDataURL(f,700,700,.88);if(cropped){data.matches[Number(t.dataset.changeMatchLogo)].logo=cropped;try{saveSilent()}catch(e){};renderLists()}}
    else if(t.matches("[data-change-sponsor-logo]")){const cropped=await imageToDataURL(f,700,700,.88);if(cropped){data.sponsors[Number(t.dataset.changeSponsorLogo)].logo=cropped;try{saveSilent()}catch(e){};renderLists()}}
  });

  try{if(sessionStorage.getItem("serenity155Admin")==="1")showAdmin()}catch(e){}
});


// ===== V11.2 ANNOUNCEMENT CLOUD SYNC =====
document.addEventListener("DOMContentLoaded",function(){
  const LEGACY_KEY="serenity_announcements_v109";
  const q=id=>document.getElementById(id), list=q("announcementAdminList"), btn=q("announcementSave");
  if(!list||!btn)return;
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  let pendingImage="";

  if(!Array.isArray(data.announcements)) data.announcements=[];

  function rows(){ return data.announcements; }

  function reset(){
    q("announcementEditId").value="";
    q("announcementAdminTitle").value="";
    q("announcementAdminCategory").value="INFO";
    q("announcementAdminDate").value=new Date().toISOString().slice(0,10);
    q("announcementAdminMessage").value="";
    q("announcementAdminPinned").checked=false;
    q("announcementAdminActive").checked=true;
    pendingImage="";
    q("announcementAdminImage").value="";
    q("announcementAdminImagePreview").hidden=true;
  }

  function render(){
    list.innerHTML=rows().map(a=>`<div class="edit-row announcement-edit-row">
      ${a.image?`<img class="announcement-admin-thumb" src="${a.image}" alt="">`:`<div class="announcement-admin-thumb empty">NO IMG</div>`}
      <div><b>${esc(a.title||"")}</b><br><small>${esc(a.category||"INFO")} • ${esc(a.date||"")} ${a.pinned?"• PINNED":""} ${a.active===false?"• NONAKTIF":""}</small><p>${esc(a.message||"")}</p>
        <div class="image-tools">
          <label class="small-btn" style="cursor:pointer">GANTI FOTO<input type="file" accept="image/*" data-ann-change-image="${esc(a.id)}" hidden></label>
          ${a.image?`<button class="small-btn danger" type="button" data-ann-delete-image="${esc(a.id)}">HAPUS FOTO</button>`:""}
        </div>
      </div>
      <div><button class="small-btn" type="button" data-ann-edit="${esc(a.id)}">EDIT</button> <button class="small-btn danger" type="button" data-ann-delete="${esc(a.id)}">HAPUS</button></div>
    </div>`).join("") || '<p class="hint">Belum ada pengumuman.</p>';
  }

  q("announcementAdminImage").addEventListener("change",async e=>{
    const f=e.target.files?.[0]; if(!f)return;
    const cropped=await imageToDataURL(f,1280,720,.72);
    if(!cropped)return;
    try{
      pendingImage=await uploadImageToCloud(cropped,"announcement");
      q("announcementAdminImagePreview").src=pendingImage;
      q("announcementAdminImagePreview").hidden=false;
    }catch(err){ alert("Upload foto announcement gagal: "+err.message); }
  });

  q("announcementClearImage").addEventListener("click",()=>{
    pendingImage="";
    q("announcementAdminImage").value="";
    q("announcementAdminImagePreview").hidden=true;
  });

  btn.addEventListener("click",()=>{
    const id=q("announcementEditId").value||("ann-"+Date.now());
    const existing=rows().find(x=>x.id===id);
    const item={
      id,
      title:q("announcementAdminTitle").value.trim(),
      category:q("announcementAdminCategory").value,
      date:q("announcementAdminDate").value,
      message:q("announcementAdminMessage").value.trim(),
      pinned:q("announcementAdminPinned").checked,
      active:q("announcementAdminActive").checked,
      image:pendingImage || existing?.image || ""
    };
    if(!item.title)return;
    const i=rows().findIndex(x=>x.id===id);
    if(i>=0)rows()[i]=item; else rows().unshift(item);
    saveSilent();
    reset();render();
    $("saveStatus").textContent="Announcement tersimpan ONLINE ✓";
    setTimeout(()=>$("saveStatus").textContent="",2400);
  });

  list.addEventListener("click",e=>{
    const edit=e.target.closest("[data-ann-edit]");
    const del=e.target.closest("[data-ann-delete]");
    const delImg=e.target.closest("[data-ann-delete-image]");
    if(edit){
      const a=rows().find(x=>x.id===edit.dataset.annEdit); if(!a)return;
      q("announcementEditId").value=a.id;
      q("announcementAdminTitle").value=a.title||"";
      q("announcementAdminCategory").value=a.category||"INFO";
      q("announcementAdminDate").value=a.date||"";
      q("announcementAdminMessage").value=a.message||"";
      q("announcementAdminPinned").checked=!!a.pinned;
      q("announcementAdminActive").checked=a.active!==false;
      pendingImage=a.image||"";
      if(a.image){q("announcementAdminImagePreview").src=a.image;q("announcementAdminImagePreview").hidden=false}else q("announcementAdminImagePreview").hidden=true;
    }
    if(del && confirm("Hapus pengumuman ini?")){
      data.announcements=rows().filter(x=>x.id!==del.dataset.annDelete);
      saveSilent();render();
    }
    if(delImg){
      const a=rows().find(x=>x.id===delImg.dataset.annDeleteImage);
      if(a){a.image="";saveSilent();render();}
    }
  });

  list.addEventListener("change",async e=>{
    const input=e.target.closest("[data-ann-change-image]");
    if(!input)return;
    const f=input.files?.[0]; if(!f)return;
    const cropped=await imageToDataURL(f,1280,720,.72);
    if(!cropped)return;
    try{
      const url=await uploadImageToCloud(cropped,"announcement");
      const a=rows().find(x=>x.id===input.dataset.annChangeImage);
      if(a){a.image=url;saveSilent();render();}
    }catch(err){alert("Upload foto announcement gagal: "+err.message);}
  });

  q("announcementCancelEdit")?.addEventListener("click",reset);
  window.refreshSerenityAnnouncementAdmin=render;
  window.resetSerenityAnnouncementAdmin=reset;
  reset();render();
});


// ===== V11.2.3 FORCE LEGACY ANNOUNCEMENT MIGRATION =====
document.addEventListener("DOMContentLoaded",()=>{
  const btn=document.getElementById("forceMigrateLegacyAnnouncements");
  if(!btn)return;
  btn.addEventListener("click",async()=>{
    const status=document.getElementById("saveStatus");
    try{
      const raw=localStorage.getItem("serenity_announcements_v109");
      if(!raw){
        if(status)status.textContent="Tidak ditemukan announcement lama di browser ini.";
        return;
      }
      const legacy=JSON.parse(raw);
      if(!Array.isArray(legacy)||!legacy.length){
        if(status)status.textContent="Announcement lama kosong.";
        return;
      }
      if(!Array.isArray(data.announcements)) data.announcements=[];
      const byId=new Map(data.announcements.map(a=>[String(a.id||""),a]));
      for(const item of legacy){
        const a={...item,image:item?.image||"",active:item?.active!==false,pinned:!!item?.pinned};
        const id=String(a.id||("ann-"+Date.now()+"-"+Math.random().toString(36).slice(2)));
        a.id=id;
        byId.set(id,{...(byId.get(id)||{}),...a});
      }
      data.announcements=Array.from(byId.values());
      await migrateBase64ImagesToCloud(data,"announcement-legacy");
      await serenityAdminCloudSave(data,"serenity155");
      try{localStorage.setItem("serenity155Data",JSON.stringify(data))}catch(e){}
      if(window.refreshSerenityAnnouncementAdmin) window.refreshSerenityAnnouncementAdmin();
      if(status)status.textContent=`BERHASIL ✓ ${legacy.length} announcement lama sudah ONLINE`;
    }catch(e){
      if(status)status.textContent="Migrasi announcement gagal: "+e.message;
    }
  });
});
