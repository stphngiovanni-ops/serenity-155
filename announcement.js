
(function(){
  const STORAGE_KEY="serenity_announcements_v1";
  const DISMISSED_KEY="serenity_announcement_dismissed_v2";

  const defaults=[{
    id:"welcome-serenity",
    title:"WELCOME TO SERENITY 155",
    message:"Official esports network • Match • Tournament • Family • NKJ Store",
    type:"info",
    buttonText:"EXPLORE WEBSITE",
    buttonUrl:"index.html",
    active:true
  }];

  function read(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      const data=raw?JSON.parse(raw):defaults;
      return Array.isArray(data)?data:defaults;
    }catch(e){return defaults}
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
    if(!list.length){host.hidden=true;return;}

    const a=list[0];
    host.hidden=false;
    host.className="serenity-popup-announcement serenity-popup--"+esc(a.type||"info");
    host.innerHTML=`
      <div class="serenity-popup-backdrop" data-close-announcement></div>
      <div class="serenity-popup-card" role="dialog" aria-modal="true" aria-label="${esc(a.title||"Announcement")}">
        <button class="serenity-popup-close" type="button" aria-label="Tutup announcement">×</button>
        <div class="serenity-popup-topline">
          <span class="serenity-popup-dot"></span>
          <b>${esc((a.type||"INFO").toUpperCase())}</b>
        </div>
        <div class="serenity-popup-icon">${a.type==="tournament"?"🏆":a.type==="store"?"🛒":a.type==="urgent"?"⚠":"📢"}</div>
        <h2>${esc(a.title||"ANNOUNCEMENT")}</h2>
        <p>${esc(a.message||"")}</p>
        <div class="serenity-popup-actions">
          ${a.buttonText?`<a href="${esc(a.buttonUrl||"#")}" class="serenity-popup-primary">${esc(a.buttonText)}</a>`:""}
          <button type="button" class="serenity-popup-secondary">SUDAH BACA</button>
        </div>
      </div>
    `;

    document.body.classList.add("announcement-open");

    function close(){
      const ids=dismissed();
      if(!ids.includes(a.id))ids.push(a.id);
      saveDismissed(ids);
      host.hidden=true;
      document.body.classList.remove("announcement-open");
    }

    host.querySelector(".serenity-popup-close").addEventListener("click",close);
    host.querySelector(".serenity-popup-secondary").addEventListener("click",close);
    host.querySelector("[data-close-announcement]").addEventListener("click",close);

    document.addEventListener("keydown",function escClose(e){
      if(e.key==="Escape"&&!host.hidden){
        close();
        document.removeEventListener("keydown",escClose);
      }
    });
  }

  window.SerenityAnnouncements={read,render,defaults,STORAGE_KEY,DISMISSED_KEY};
  document.addEventListener("DOMContentLoaded",()=>setTimeout(render,450));
})();
