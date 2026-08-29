
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
  matches:[{date:"2026-09-12T20:00",opponent:"OPPONENT",event:"FRIENDLY MATCH",game:"POINT BLANK",format:"BO3 / BO5",stream:"LIVE STREAM",status:"UPCOMING",ourScore:"",oppScore:"",logo:"",featured:true}],
  sponsors:[{name:"NKJ",logo:""},{name:"AJ1",logo:""},{name:"2K",logo:""},{name:"PARTNER",logo:""}],
  contact:{email:"serenity155@example.com",instagram:"https://instagram.com/",youtube:"https://youtube.com/"}
};
const $=id=>document.getElementById(id),cloneDefault=()=>JSON.parse(JSON.stringify(DEFAULT_DATA));
let data=cloneDefault(),pendingPlayerPhoto="",pendingAchPhoto="",pendingOpponentLogo="",editingMatchIndex=-1,editingPlayerGroup="",editingPlayerIndex=-1,pendingSponsorLogo="";

function migrate(x){
  if(!x)return cloneDefault();
  if(!x.competitiveRoster&&x.roster)x.competitiveRoster=x.roster.slice(0,5);
  if(!x.warRoster)x.warRoster=[];
  if(!x.matches&&x.match)x.matches=[{...x.match,status:"UPCOMING",logo:"",featured:true}];
  x.competitiveRoster=(x.competitiveRoster||[]).slice(0,5).map(p=>({...p,photo:p.photo||""}));
  x.warRoster=(x.warRoster||[]).slice(0,12).map(p=>({...p,photo:p.photo||""}));
  x.matches=(x.matches||[]).map(m=>({...m,event:m.event||m.title||"MATCH",ourScore:m.ourScore??m.scoreA??"",oppScore:m.oppScore??m.scoreB??"",logo:m.logo||"",status:m.status||"UPCOMING",featured:!!m.featured}));
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
          outputW: mode==="achievement" ? 1200 : mode==="logo" ? 700 : 720,
          outputH: mode==="achievement" ? 800 : mode==="logo" ? 700 : 900,
          quality: mode==="logo" ? .92 : .88,
          zoom:1,x:0,y:0,rotate:0
        };
        $("cropTitle").textContent = mode==="achievement" ? "CROP FOTO ACHIEVEMENT" : mode==="logo" ? "CROP LOGO" : "CROP FOTO PEMAIN";
        $("cropRatioLabel").textContent = mode==="achievement" ? "Rasio: 3:2" : mode==="logo" ? "Rasio: 1:1" : "Rasio: 4:5";
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
  const mode=(maxW===1200&&maxH===850)?"achievement":(maxW===700&&maxH===700)?"logo":"player";
  return openCropEditor(file,mode);
}
function login(){if(($("loginUser").value||"").trim()==="admin"&&($("loginPass").value||"")==="serenity_mei25"){try{sessionStorage.setItem("serenity155Admin","1");sessionStorage.setItem("serenity155AdminPass",$("loginPass").value)}catch(e){}showAdmin()}else $("loginStatus").textContent="Username atau password salah."}
function showAdmin(){$("loginView").hidden=true;$("loginView").style.display="none";$("adminView").hidden=false;$("adminView").style.display="block";loadData();fillForm();renderLists()}
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
    <div class="edit-row with-thumb match-admin-pro-row">
      ${matchLogo(m.logo)}
      <div class="match-admin-main">
        <b>SERENITY 155 VS ${esc(m.opponent)}</b><br>
        <small>${esc(m.date||"DATE TBA")} • ${esc(m.event||"MATCH")} • ${esc(m.status)} ${String(m.status).toUpperCase()==="COMPLETED"?`• SCORE ${esc(m.ourScore||0)} - ${esc(m.oppScore||0)}`:""} ${m.featured?"• NEXT MATCH":""}</small>
        <div class="match-actions">
          <button class="small-btn" type="button" data-edit-match="${i}">EDIT</button>
          <button class="small-btn" type="button" data-feature-match="${i}">JADIKAN NEXT</button>
          <label class="small-btn" style="cursor:pointer">GANTI LOGO<input type="file" accept="image/*" data-change-match-logo="${i}" hidden></label>
          ${m.logo?`<button class="small-btn danger" type="button" data-delete-match-logo="${i}">HAPUS LOGO</button>`:""}
        </div>
      </div>
      <button class="small-btn danger" type="button" data-remove-match="${i}">HAPUS</button>
    </div>`).join("");
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
function saveSilent(){localStorage.setItem("serenity155Data",JSON.stringify(data))}
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
  $("matchDate").value="";$("opponent").value="";$("matchEvent").value="";$("game").value="POINT BLANK";$("format").value="";$("stream").value="";$("matchStatus").value="UPCOMING";$("ourScore").value="";$("oppScore").value="";
  $("opponentLogo").value="";$("opponentLogoPreview").hidden=true;
  $("saveMatch").textContent="+ TAMBAH MATCH";$("cancelMatchEdit").hidden=true;
}
function saveMatch(){
  const opponent=$("opponent").value.trim();if(!opponent){$("saveStatus").textContent="Nama lawan wajib diisi.";return}
  const existing=editingMatchIndex>=0?data.matches[editingMatchIndex]:null;
  const item={
    date:$("matchDate").value,
    opponent,
    event:$("matchEvent").value.trim()||"MATCH",
    game:$("game").value.trim()||"POINT BLANK",
    format:$("format").value.trim(),
    stream:$("stream").value.trim(),
    status:$("matchStatus").value,
    ourScore:$("ourScore").value,
    oppScore:$("oppScore").value,
    logo:pendingOpponentLogo || (existing?.logo||""),
    featured:existing?.featured||false
  };
  if(editingMatchIndex>=0)data.matches[editingMatchIndex]=item;else data.matches.push(item);
  resetMatchForm();renderLists();
}
function editMatch(i){
  const m=data.matches[i];editingMatchIndex=i;pendingOpponentLogo="";
  $("matchDate").value=m.date||"";
  $("opponent").value=m.opponent||"";
  $("matchEvent").value=m.event||"MATCH";
  $("game").value=m.game||"POINT BLANK";
  $("format").value=m.format||"";
  $("stream").value=m.stream||"";
  $("matchStatus").value=m.status||"UPCOMING";
  $("ourScore").value=m.ourScore??"";
  $("oppScore").value=m.oppScore??"";
  if(m.logo){$("opponentLogoPreview").src=m.logo;$("opponentLogoPreview").hidden=false}else $("opponentLogoPreview").hidden=true;
  $("saveMatch").textContent="SIMPAN PERUBAHAN MATCH";$("cancelMatchEdit").hidden=false;
  window.scrollTo({top:$("matchDate").getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});
}
function featureMatch(i){data.matches.forEach((m,idx)=>m.featured=idx===i);renderLists()}
async function saveAll(){
  data.about1=$("about1").value;data.about2=$("about2").value;
  data.contact={email:$("email").value,instagram:$("instagram").value,youtube:$("youtube").value};
  try{
    saveSilent();
    $("saveStatus").textContent="Menyimpan online...";
    const pass=sessionStorage.getItem("serenity155AdminPass")||"serenity_mei25";
    if(typeof serenityAdminCloudSave==="function") await serenityAdminCloudSave(data,pass);
    $("saveStatus").textContent="Tersimpan ONLINE ✓";
  }catch(e){
    console.error(e);
    $("saveStatus").textContent="Gagal simpan online. Coba lagi.";
  }
  setTimeout(()=>$("saveStatus").textContent="",6000);
}
function resetAll(){if(confirm("Reset seluruh data ke default?")){data=cloneDefault();saveSilent();fillForm();renderLists();if($("matchDate"))resetMatchForm();$("saveStatus").textContent="Data direset."}}

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

  $("loginBtn").addEventListener("click",login);$("loginPass").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
  $("logoutBtn").addEventListener("click",()=>{try{sessionStorage.removeItem("serenity155Admin")}catch(e){}location.reload()});
  $("addPlayer").addEventListener("click",addPlayer);$("addAchievement").addEventListener("click",addAchievement);$("addSponsor").addEventListener("click",addSponsor);
  $("saveMatch")?.addEventListener("click",saveMatch);$("cancelMatchEdit")?.addEventListener("click",resetMatchForm);
  $("saveAll").addEventListener("click",saveAll);$("resetAll").addEventListener("click",resetAll);

  $("playerPhoto").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,900,900,.82);if(cropped){pendingPlayerPhoto=cropped;$("playerPhotoPreview").src=pendingPlayerPhoto;$("playerPhotoPreview").hidden=false}else{$("playerPhoto").value=""}});
  $("achPhoto").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,1200,850,.82);if(cropped){pendingAchPhoto=cropped;$("achPhotoPreview").src=pendingAchPhoto;$("achPhotoPreview").hidden=false}else{$("achPhoto").value=""}});
  $("opponentLogo")?.addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,700,700,.88);if(cropped){pendingOpponentLogo=cropped;$("opponentLogoPreview").src=pendingOpponentLogo;$("opponentLogoPreview").hidden=false}else{$("opponentLogo").value=""}});
  $("sponsorLogo").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;const cropped=await imageToDataURL(f,700,700,.88);if(cropped){pendingSponsorLogo=cropped;$("sponsorLogoPreview").src=pendingSponsorLogo;$("sponsorLogoPreview").hidden=false}else{$("sponsorLogo").value=""}});
  $("clearPlayerPhoto").addEventListener("click",()=>{pendingPlayerPhoto="";$("playerPhoto").value="";$("playerPhotoPreview").hidden=true});
  $("clearAchPhoto").addEventListener("click",()=>{pendingAchPhoto="";$("achPhoto").value="";$("achPhotoPreview").hidden=true});
  $("clearOpponentLogo")?.addEventListener("click",()=>{pendingOpponentLogo="";if($("opponentLogo"))$("opponentLogo").value="";if($("opponentLogoPreview"))$("opponentLogoPreview").hidden=true});
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
    else if(t.matches("[data-change-match-logo]")){const cropped=await imageToDataURL(f,700,700,.88);if(cropped){data.matches[Number(t.dataset.changeMatchLogo)].logo=cropped;try{saveSilent()}catch(e){};renderLists()}}
    else if(t.matches("[data-change-sponsor-logo]")){const cropped=await imageToDataURL(f,700,700,.88);if(cropped){data.sponsors[Number(t.dataset.changeSponsorLogo)].logo=cropped;try{saveSilent()}catch(e){};renderLists()}}
  });

  try{if(sessionStorage.getItem("serenity155Admin")==="1")showAdmin()}catch(e){}
});
