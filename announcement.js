
(function(){
  const SITE_KEY="serenity155Data";
  const LEGACY_KEY="serenity_announcements_v1";
  const DISMISSED_KEY="serenity_announcement_dismissed_v3";

  function getSiteData(){
    try{return JSON.parse(localStorage.getItem(SITE_KEY)||"{}")}catch(e){return {}}
  }
  function read(){
    const site=getSiteData();
    if(Array.isArray(site.announcements)) return site.announcements;
    // Legacy migration fallback.
    try{
      const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||"[]");
      return Array.isArray(old)?old:[];
    }catch(e){return []}
  }
  function dismissed(){
    try{return JSON.parse(localStorage.getItem(DISMISSED_KEY)||"[]")}catch(e){return []}
  }
  function saveDismissed(ids){
    try{localStorage.setItem(DISMISSED_KEY,JSON.stringify(ids))}catch(e){}
  }
  function esc(s){
    return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }
  function render(){
    const host=document.getElementById("serenityAnnouncement");
    if(!host)return;

    const hidden=dismissed();
    const list=read().filter(a=>a && a.active!==false && !hidden.includes(a.id));
    if(!list.length){host.hidden=true;document.body.classList.remove("announcement-open");return}

    const a=list[0];
    host.hidden=false;
    host.className="serenity-popup-announcement serenity-popup--"+esc(a.type||"info");
    host.innerHTML=`
      <div class="serenity-popup-backdrop" data-close-announcement></div>
      <div class="serenity-popup-card" role="dialog" aria-modal="true" aria-label="${esc(a.title||"Announcement")}">
        <button class="serenity-popup-close" type="button" aria-label="Tutup announcement">×</button>
        <div class="serenity-popup-topline"><span class="serenity-popup-dot"></span><b>${esc((a.type||"INFO").toUpperCase())}</b></div>
        ${a.image
          ? `<div class="serenity-popup-image"><img src="${a.image}" alt="${esc(a.title||"Announcement")}"></div>`
          : `<div class="serenity-popup-icon">${a.type==="tournament"?"🏆":a.type==="store"?"🛒":a.type==="urgent"?"⚠":"📢"}</div>`}
        <h2>${esc(a.title||"ANNOUNCEMENT")}</h2>
        <p>${esc(a.message||"")}</p>
        <div class="serenity-popup-actions">
          ${a.buttonText?`<a href="${esc(a.buttonUrl||"#")}" class="serenity-popup-primary">${esc(a.buttonText)}</a>`:""}
          <button type="button" class="serenity-popup-secondary">SUDAH BACA</button>
        </div>
      </div>`;

    document.body.classList.add("announcement-open");

    function close(){
      const ids=dismissed();
      if(!ids.includes(a.id))ids.push(a.id);
      saveDismissed(ids);
      host.hidden=true;
      document.body.classList.remove("announcement-open");
    }
    host.querySelector(".serenity-popup-close")?.addEventListener("click",close);
    host.querySelector(".serenity-popup-secondary")?.addEventListener("click",close);
    host.querySelector("[data-close-announcement]")?.addEventListener("click",close);
  }

  window.SerenityAnnouncements={read,render};

  // Cloud boot may update local storage first; wait briefly then render.
  document.addEventListener("DOMContentLoaded",()=>setTimeout(render,900));
})();
