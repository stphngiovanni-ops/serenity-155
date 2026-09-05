
document.addEventListener("DOMContentLoaded",async()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  $("v14Menu")?.addEventListener("click",()=>$("v14Nav")?.classList.toggle("open"));

  let data={};
  try{
    data=typeof serenityCloudLoad==="function"?(await serenityCloudLoad()||{}):{};
  }catch(e){
    try{data=JSON.parse(localStorage.getItem("serenity155Data")||"{}")}catch(_){}
  }

  const matches=Array.isArray(data.matches)?data.matches:[];
  const current=matches.find(m=>m.featured) || matches.filter(m=>!["COMPLETED","FINISHED"].includes(String(m.status||"").toUpperCase())).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0))[0] || matches[0];

  if(current){
    const target=new Date(current.date);
    const opponentLogo=current.logo?`<img src="${esc(current.logo)}" alt="">`:`<div style="width:120px;height:120px;display:grid;place-items:center;border:1px solid #452025;margin:auto">?</div>`;
    $("v14NextMatch").innerHTML=`
      <div class="next-teams">
        <div class="next-team"><img src="nkj-serenity-logo.png" alt=""><strong>NKJ SERENITY</strong></div>
        <div class="next-vs">VS</div>
        <div class="next-team">${opponentLogo}<strong>${esc(current.opponent||"TBA")}</strong></div>
      </div>
      <div class="next-count">
        <div><b id="cdD">00</b><small>DAYS</small></div>
        <div><b id="cdH">00</b><small>HOURS</small></div>
        <div><b id="cdM">00</b><small>MINUTES</small></div>
        <div><b id="cdS">00</b><small>SECONDS</small></div>
      </div>
      <div class="next-meta">${esc(current.date||"DATE TBA")} &nbsp; | &nbsp; ${esc(current.game||"POINT BLANK")} &nbsp; | &nbsp; ${esc(current.format||current.event||"MATCH")}</div>
      <a class="next-live" href="matches.html">▶ WATCH MATCH</a>`;
    const tick=()=>{
      const diff=target-new Date();
      if(isNaN(target)||diff<=0)return;
      $("cdD").textContent=String(Math.floor(diff/86400000)).padStart(2,"0");
      $("cdH").textContent=String(Math.floor(diff/3600000)%24).padStart(2,"0");
      $("cdM").textContent=String(Math.floor(diff/60000)%60).padStart(2,"0");
      $("cdS").textContent=String(Math.floor(diff/1000)%60).padStart(2,"0");
    };tick();setInterval(tick,1000);
  }else{
    $("v14NextMatch").innerHTML='<div class="v14-loading">BELUM ADA NEXT MATCH</div>';
  }

  const finished=matches.filter(m=>["COMPLETED","FINISHED"].includes(String(m.status||"").toUpperCase())).slice(-4).reverse();
  $("v14RecentMatches").innerHTML=(finished.length?finished:matches.slice(0,4)).map(m=>{
    const a=m.ourScore??m.scoreA??"-", b=m.oppScore??m.opponentScore??m.scoreB??"-";
    return `<article class="v14-match-card">
      <div class="v14-match-score">
        <img src="nkj-serenity-logo.png" alt=""><b>${esc(a)} - ${esc(b)}</b>${m.logo?`<img src="${esc(m.logo)}" alt="">`:`<span></span>`}
      </div>
      <h4>NKJ SERENITY VS ${esc(m.opponent||"TBA")}</h4>
      <p>${esc(m.event||m.game||"MATCH")}</p><strong>${esc(m.date||"")}</strong>
    </article>`;
  }).join("");

  const anns=(data.announcements||[]).filter(a=>a.active!==false).slice(0,2);
  $("v14Announcements").innerHTML=anns.length?anns.map(a=>`<article class="v14-ann-row">
    ${a.image?`<img src="${esc(a.image)}" alt="">`:`<div style="width:88px;height:52px;background:#160508"></div>`}
    <div><b>${esc(a.title||"ANNOUNCEMENT")}</b><small>${esc((a.message||"").slice(0,70))}</small></div><span>›</span>
  </article>`).join(""):'<div class="v14-ann-row"><div></div><div><b>NO ANNOUNCEMENT</b><small>Belum ada pengumuman aktif.</small></div><span>›</span></div>';

  const sponsors=Array.isArray(data.sponsors)?data.sponsors:[];
  $("v14SponsorGrid").innerHTML=sponsors.length?sponsors.map(s=>`<div class="v14-sponsor">${s.logo?`<img src="${esc(s.logo)}" alt="${esc(s.name||"Sponsor")}">`:`<b>${esc(s.name||"SPONSOR")}</b>`}</div>`).join(""):'<div class="v14-sponsor"><b>AJ1</b></div><div class="v14-sponsor"><b>2K</b></div><div class="v14-sponsor"><b>HT557</b></div>';
});
