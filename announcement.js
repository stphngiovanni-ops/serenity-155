
(function(){
  const STORAGE_KEY = "serenity_announcements_v1";
  const DISMISSED_KEY = "serenity_announcement_dismissed_v1";

  const defaults = [{
    id:"welcome-serenity",
    title:"WELCOME TO SERENITY 155",
    message:"Official esports network • Match • Tournament • Family • NKJ Store",
    type:"info",
    buttonText:"EXPLORE",
    buttonUrl:"index.html",
    active:true,
    ticker:true
  }];

  function read(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      const data=raw?JSON.parse(raw):defaults;
      return Array.isArray(data)?data:defaults;
    }catch(e){return defaults;}
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
    host.className="serenity-announcement serenity-announcement--"+esc(a.type||"info");
    host.innerHTML=`
      <div class="serenity-announcement-glow"></div>
      <div class="serenity-announcement-inner">
        <div class="serenity-announcement-badge"><i></i>${esc((a.type||"INFO").toUpperCase())}</div>
        <div class="serenity-announcement-copy">
          <strong>${esc(a.title||"ANNOUNCEMENT")}</strong>
          <span>${esc(a.message||"")}</span>
        </div>
        ${a.buttonText?`<a class="serenity-announcement-action" href="${esc(a.buttonUrl||"#")}">${esc(a.buttonText)} →</a>`:""}
        <button class="serenity-announcement-close" type="button" aria-label="Tutup announcement">×</button>
      </div>
      ${a.ticker?`<div class="serenity-announcement-ticker"><div>${esc(a.title)} ◆ ${esc(a.message)} ◆ ${esc(a.title)} ◆ ${esc(a.message)} ◆</div></div>`:""}
    `;
    host.querySelector(".serenity-announcement-close").addEventListener("click",()=>{
      const ids=dismissed(); if(!ids.includes(a.id))ids.push(a.id); saveDismissed(ids);
      host.hidden=true;
    });
  }
  window.SerenityAnnouncements={read,render,defaults,STORAGE_KEY,DISMISSED_KEY};
  document.addEventListener("DOMContentLoaded",render);
})();
