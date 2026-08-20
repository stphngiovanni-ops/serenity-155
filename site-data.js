
const DEFAULT_DATA = {
  about1: "SERENITY 155 adalah squad esports yang dibangun dari kekompakan, disiplin, komunikasi, dan mental kompetitif. Kami bertanding bukan hanya untuk menang, tetapi untuk membangun nama, keluarga, dan perjalanan yang layak dikenang.",
  about2: "Website ini menampilkan profil resmi squad, perjalanan turnamen, roster aktif, sponsor, jadwal pertandingan, serta pencapaian SERENITY.",
  competitiveRoster: [
    {name:"ZEED", role:"RIFLER", detail:"ENTRY • AGGRESSIVE", photo:""},
    {name:"MDFK", role:"RIFLER", detail:"AIM • CONTROL", photo:""},
    {name:"IRVING", role:"CAPTAIN / IGL", detail:"TACTICAL • LEADER", photo:""},
    {name:"SUPERNDUT", role:"DUAL / SUPPORT", detail:"UTILITY • CLUTCH", photo:""},
    {name:"DEMON", role:"DUAL / FLEX", detail:"PRESSURE • FLEX", photo:""}
  ],
  warRoster: [
    {name:"WAR 01",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 02",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 03",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 04",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 05",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 06",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 07",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 08",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 09",role:"PLAYER",detail:"WAR TEAM",photo:""},
    {name:"WAR 10",role:"PLAYER",detail:"WAR TEAM",photo:""}
  ],
  achievements: [
    {year:"2026", badge:"CHAMPION", title:"PBRS SEMARANG", desc:"Menjadi juara dan melanjutkan perjalanan kompetitif SERENITY ke level berikutnya.", photo:""},
    {year:"2026", badge:"QUALIFIED", title:"PBSB DIVISI 1", desc:"Lolos ke PBSB Divisi 1 dengan target berikutnya: melangkah menuju PBNC.", photo:""},
    {year:"NEXT", badge:"MISSION", title:"PBNC", desc:"Target besar berikutnya. Keep grinding. Keep fighting.", photo:""}
  ],
  matches: [
    {date:"2026-09-12T20:00", opponent:"OPPONENT", game:"POINT BLANK", format:"BO3 / BO5", stream:"LIVE STREAM", status:"UPCOMING", logo:"", featured:true}
  ],
  matchHistory: [],
  sponsors:[{name:"NKJ",logo:""},{name:"AJ1",logo:""},{name:"2K",logo:""},{name:"PARTNER",logo:""}],
  contact:{email:"serenity155@example.com", instagram:"https://instagram.com/", youtube:"https://youtube.com/"}
};

function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function migrateData(x){
  if(!x) return DEFAULT_DATA;

  // migrate older one-roster versions into Competitive
  if(!x.competitiveRoster && x.roster){
    x.competitiveRoster = x.roster.slice(0,5);
  }
  if(!x.warRoster){
    x.warRoster = [];
  }
  if(!x.matches && x.match){
    x.matches=[{
      date:x.match.date||"",opponent:x.match.opponent||"OPPONENT",game:x.match.game||"POINT BLANK",
      format:x.match.format||"BO3 / BO5",stream:x.match.stream||"LIVE STREAM",status:"UPCOMING",logo:"",featured:true
    }];
  }
  return {
    ...DEFAULT_DATA,...x,
    contact:{...DEFAULT_DATA.contact,...(x.contact||{})},
    competitiveRoster:(x.competitiveRoster||DEFAULT_DATA.competitiveRoster).slice(0,5).map(p=>({...p,photo:p.photo||""})),
    warRoster:(x.warRoster||DEFAULT_DATA.warRoster).slice(0,12).map(p=>({...p,photo:p.photo||""})),
    achievements:(x.achievements||DEFAULT_DATA.achievements).map(a=>({...a,photo:a.photo||""})),
    sponsors:(x.sponsors||DEFAULT_DATA.sponsors).map(s=>typeof s==="string"?{name:s,logo:""}:{name:s.name||"SPONSOR",logo:s.logo||""}),
    matches:(x.matches||DEFAULT_DATA.matches).map(m=>({...m,logo:m.logo||"",featured:!!m.featured,status:m.status||"UPCOMING"})),
    matchHistory:(x.matchHistory||[]).map(h=>({...h,logo:h.logo||"",result:h.result||"WIN",ourScore:Number(h.ourScore||0),opponentScore:Number(h.opponentScore||0)}))
  };
}
function getSiteData(){
  try{
    if(window.__SERENITY_CLOUD_DATA__) return migrateData(window.__SERENITY_CLOUD_DATA__);
    return migrateData(JSON.parse(localStorage.getItem("serenity155Data")));
  }catch(e){return DEFAULT_DATA}
}
const SITE_DATA=getSiteData();

function getFeaturedMatch(matches){
  if(!matches?.length) return null;
  return matches.find(m=>m.featured) ||
    [...matches].filter(m=>m.status!=="COMPLETED").sort((a,b)=>new Date(a.date)-new Date(b.date))[0] ||
    matches[0];
}
function fmtDate(value){
  const d=new Date(value);
  if(isNaN(d)) return "DATE TBA";
  return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d)+" WIB";
}
function renderRoster(targetId, players, groupName){
  const roster=document.getElementById(targetId);
  if(!roster) return;
  roster.innerHTML="";
  players.forEach((p,i)=>{
    const article=document.createElement("article");
    article.className="player-card reveal show"+(groupName==="competitive"&&i===2?" featured":"");
    article.tabIndex=0;
    article.setAttribute("role","button");
    article.dataset.playerGroup=groupName;
    article.dataset.playerIndex=i;
    const initial=(p.name||"?").trim().charAt(0).toUpperCase();
    const media=p.photo
      ? `<div class="player-portrait has-photo"><img class="player-photo" src="${p.photo}" alt="${escapeHtml(p.name)}"></div>`
      : `<div class="player-portrait"><span>${initial}</span></div>`;
    article.innerHTML=`<div class="player-no">${String(i+1).padStart(2,"0")}</div>
      ${media}<h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.role)}</p><small>${escapeHtml(p.detail||"")}</small>`;
    roster.appendChild(article);
  });
}

(function renderSite(){
  const d=SITE_DATA;
  const a1=document.getElementById("aboutText1"),a2=document.getElementById("aboutText2");
  if(a1)a1.textContent=d.about1;if(a2)a2.textContent=d.about2;

  renderRoster("competitiveRosterGrid",d.competitiveRoster,"competitive");
  renderRoster("warRosterGrid",d.warRoster,"war");

  const preview=document.getElementById("achievementPreviewGrid");
  const count=document.getElementById("achievementCount");
  if(count) count.textContent=d.achievements.length;
  if(preview){
    preview.innerHTML="";
    d.achievements.slice(0,5).forEach((a,i)=>{
      const card=document.createElement("article");
      card.className="achievement-preview-card"+(!a.photo?" no-image":"");
      if(a.photo){
        card.innerHTML=`<img src="${a.photo}" alt="${escapeHtml(a.title)}"><div class="achievement-preview-overlay"><p>${escapeHtml(a.year)} • ${escapeHtml(a.badge)}</p><h4>${escapeHtml(a.title)}</h4></div>`;
      }else{
        card.innerHTML=`<div class="achievement-preview-overlay"><p>${escapeHtml(a.year)} • ${escapeHtml(a.badge)}</p><h4>${escapeHtml(a.title)}</h4></div>`;
      }
      preview.appendChild(card);
    });
    if(d.achievements.length>5){
      const more=document.createElement("div");
      more.className="achievement-more-card";
      more.innerHTML=`<div><strong>+${d.achievements.length-5}</strong><span>ACHIEVEMENT LAINNYA</span></div>`;
      preview.appendChild(more);
    }
  }

  const galleryGrid=document.getElementById("achievementGalleryGrid");
  if(galleryGrid){
    galleryGrid.innerHTML="";
    d.achievements.forEach(a=>{
      const card=document.createElement("article");
      card.className="achievement-gallery-card";
      const media=a.photo
        ? `<img src="${a.photo}" alt="${escapeHtml(a.title)}">`
        : `<div class="achievement-gallery-placeholder">★</div>`;
      card.innerHTML=`${media}<div class="achievement-gallery-body"><div class="achievement-gallery-meta"><span>${escapeHtml(a.year)}</span><span>${escapeHtml(a.badge)}</span></div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.desc)}</p></div>`;
      galleryGrid.appendChild(card);
    });
  }

  const sponsors=document.getElementById("sponsorGrid");
  if(sponsors){
    sponsors.innerHTML="";
    d.sponsors.forEach(s=>{
      const item=typeof s==="string"?{name:s,logo:""}:s;
      const el=document.createElement("div");
      el.innerHTML=(item.logo?`<img class="sponsor-logo" src="${item.logo}" alt="${escapeHtml(item.name)}">`:"")
        +`<span class="sponsor-name">${escapeHtml(item.name)}</span>`;
      sponsors.appendChild(el);
    })
  }

  const featured=getFeaturedMatch(d.matches);
  if(featured){
    const opp=document.getElementById("opponentName");if(opp)opp.textContent=featured.opponent;
    const game=document.getElementById("gameName");if(game)game.textContent=featured.game;
    const fmt=document.getElementById("matchFormat");if(fmt)fmt.textContent=featured.format;
    const stream=document.getElementById("streamLabel");if(stream)stream.textContent=featured.stream;
    const logoBox=document.getElementById("opponentLogoBox");
    if(logoBox){
      if(featured.logo){logoBox.classList.add("has-logo");logoBox.innerHTML=`<img src="${featured.logo}" alt="${escapeHtml(featured.opponent)}">`}
      else{logoBox.classList.remove("has-logo");logoBox.textContent="?"}
    }
    const cd=document.getElementById("countdown"),label=document.getElementById("matchDateLabel");
    if(cd&&featured.date){
      const dt=new Date(featured.date);
      if(!isNaN(dt)){
        label.textContent=fmtDate(featured.date);
        const tick=()=>{
          const diff=dt-new Date();
          if(featured.status==="COMPLETED"){cd.textContent="MATCH FINISHED";return}
          if(featured.status==="LIVE"){cd.textContent="LIVE NOW";return}
          if(diff<=0){cd.textContent="MATCH TIME";return}
          const day=Math.floor(diff/86400000),hr=Math.floor(diff/3600000)%24,min=Math.floor(diff/60000)%60,sec=Math.floor(diff/1000)%60;
          cd.textContent=`${String(day).padStart(2,"0")}D : ${String(hr).padStart(2,"0")}H : ${String(min).padStart(2,"0")}M : ${String(sec).padStart(2,"0")}S`;
        };
        tick();window.setInterval(tick,1000);
      }
    }
  }

  const matchList=document.getElementById("matchList");
  if(matchList){
    matchList.innerHTML="";
    [...d.matches].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(m=>{
      const card=document.createElement("article");
      card.className="match-mini-card"+(m.featured?" featured":"");
      const logo=m.logo?`<img src="${m.logo}" alt="${escapeHtml(m.opponent)}">`:"?";
      card.innerHTML=`<div class="match-mini-top"><span class="match-status ${escapeHtml(m.status)}">${escapeHtml(m.status)}</span>${m.featured?'<span class="featured-tag">NEXT MATCH</span>':""}</div>
      <div class="match-mini-main"><div class="match-mini-logo">${logo}</div><div><h3>SERENITY 155 <span style="color:#657080">VS</span> ${escapeHtml(m.opponent)}</h3><p>${escapeHtml(m.game)} • ${escapeHtml(m.format)}</p></div></div>
      <div class="match-mini-bottom"><span>${fmtDate(m.date)}</span><span>${escapeHtml(m.stream||"")}</span></div>`;
      matchList.appendChild(card);
    });
  }

  const historyGrid=document.getElementById("historyGrid"),historyEmpty=document.getElementById("historyEmpty"),historyStats=document.getElementById("historyStats");
  if(historyGrid){
    const history=[...(d.matchHistory||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
    historyGrid.innerHTML="";
    if(historyEmpty)historyEmpty.hidden=history.length>0;
    const wins=history.filter(h=>h.result==="WIN").length, losses=history.filter(h=>h.result==="LOSE").length, draws=history.filter(h=>h.result==="DRAW").length;
    if(historyStats)historyStats.innerHTML=`<div><strong>${history.length}</strong><span>TOTAL MATCH</span></div><div class="win"><strong>${wins}</strong><span>WIN</span></div><div class="lose"><strong>${losses}</strong><span>LOSE</span></div><div><strong>${draws}</strong><span>DRAW</span></div>`;
    history.forEach(h=>{
      const card=document.createElement("article");card.className="history-card reveal show";
      const oppLogo=h.logo?`<img src="${h.logo}" alt="${escapeHtml(h.opponent)}">`:`<span>${escapeHtml((h.opponent||"?").charAt(0))}</span>`;
      card.innerHTML=`<div class="history-card-top"><span>${escapeHtml(h.event||"MATCH")}</span><b class="history-result ${escapeHtml(h.result)}">${escapeHtml(h.result)}</b></div><div class="history-versus"><div class="history-team"><img src="./serenity155-logo.png" alt="SERENITY 155"><strong>SERENITY 155</strong></div><div class="history-score"><b>${Number(h.ourScore||0)} <i>:</i> ${Number(h.opponentScore||0)}</b><span>${fmtDate(h.date)}</span></div><div class="history-team"><div class="history-opponent-logo">${oppLogo}</div><strong>${escapeHtml(h.opponent)}</strong></div></div><div class="history-meta"><span>${escapeHtml(h.game||"POINT BLANK")}</span><span>${escapeHtml(h.format||"")}</span><span>${escapeHtml(h.note||"")}</span></div>`;
      historyGrid.appendChild(card);
    });
  }

  const email=document.getElementById("emailLink");if(email)email.href="mailto:"+d.contact.email;
  const ig=document.getElementById("instagramLink");if(ig)ig.href=d.contact.instagram;
  const yt=document.getElementById("youtubeLink");if(yt)yt.href=d.contact.youtube;
})();

(function enableClickReveal(){
  const modal=document.getElementById("detailModal");if(!modal)return;
  const media=document.getElementById("detailModalMedia"),title=document.getElementById("detailModalTitle"),text=document.getElementById("detailModalText"),eyebrow=document.getElementById("detailModalEyebrow");
  function openModal(photo,fallback,heading,subheading,body){
    media.innerHTML=photo?`<img src="${photo}" alt="${escapeHtml(heading)}">`:`<div class="modal-initial">${escapeHtml(fallback||"?")}</div>`;
    title.textContent=heading||"DETAIL";eyebrow.textContent=subheading||"SERENITY 155";text.textContent=body||"";
    modal.hidden=false;document.body.style.overflow="hidden";
  }
  function closeModal(){modal.hidden=true;document.body.style.overflow=""}
  document.addEventListener("click",e=>{
    const player=e.target.closest("[data-player-group][data-player-index]");
    if(player){
      const group=player.dataset.playerGroup;
      const list=group==="war"?SITE_DATA.warRoster:SITE_DATA.competitiveRoster;
      const p=list[Number(player.dataset.playerIndex)];
      const label=group==="war"?"SQUAD WAR":"SQUAD COMPETITIVE";
      openModal(p.photo,(p.name||"?").charAt(0),p.name,`${label} • ${p.role}`,p.detail);
      return;
    }
    if(e.target.matches("[data-close-modal]"))closeModal();
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&!modal.hidden)closeModal();
    if(e.key==="Enter"){
      const a=document.activeElement;
      if(a?.matches("[data-player-group][data-player-index],[data-achievement-index]"))a.click()
    }
  });
})();


(function enableAchievementGallery(){
  const modal=document.getElementById("achievementGalleryModal");
  const openBtn=document.getElementById("openAllAchievements");
  if(!modal||!openBtn)return;

  function openGallery(){
    modal.hidden=false;
    document.body.style.overflow="hidden";
  }
  function closeGallery(){
    modal.hidden=true;
    document.body.style.overflow="";
  }

  openBtn.addEventListener("click",openGallery);

  const preview=document.getElementById("achievementPreviewGrid");
  if(preview) preview.addEventListener("click",openGallery);

  modal.addEventListener("click",e=>{
    if(e.target.matches("[data-close-achievements]"))closeGallery();
  });

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&!modal.hidden)closeGallery();
  });
})();
