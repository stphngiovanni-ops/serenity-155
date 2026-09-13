(function(){
  "use strict";
  const DATA_KEY="serenity155Data";
  const BACKUP_KEY="serenity155Data:lastGood";
  const defaults={
    competitiveRoster:[
      {name:"ZEED",role:"RIFLER",detail:"ENTRY • AGGRESSIVE",photo:""},
      {name:"MDFK",role:"RIFLER",detail:"AIM • CONTROL",photo:""},
      {name:"IRVING",role:"CAPTAIN / IGL",detail:"TACTICAL • LEADER",photo:""},
      {name:"SUPERNDUT",role:"DUAL / SUPPORT",detail:"UTILITY • CLUTCH",photo:""},
      {name:"DEMON",role:"DUAL / FLEX",detail:"PRESSURE • FLEX",photo:""}
    ],
    warRoster:Array.from({length:15},(_,i)=>({name:`WAR ${String(i+1).padStart(2,"0")}`,role:"PLAYER",detail:"WAR TEAM",photo:""}))
  };
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const useful=o=>o&&typeof o==="object"&&!Array.isArray(o)&&(Array.isArray(o.competitiveRoster)||Array.isArray(o.warRoster));
  function read(){
    let a=null,b=null;
    try{a=JSON.parse(localStorage.getItem(DATA_KEY)||"null")}catch(e){}
    try{b=JSON.parse(localStorage.getItem(BACKUP_KEY)||"null")}catch(e){}
    const src=useful(a)?a:(useful(b)?b:{});
    const comp=(Array.isArray(src.competitiveRoster)&&src.competitiveRoster.length?src.competitiveRoster:defaults.competitiveRoster).slice(0,5);
    const war=(Array.isArray(src.warRoster)&&src.warRoster.length?src.warRoster:defaults.warRoster).slice(0,15);
    return {competitiveRoster:comp,warRoster:war};
  }
  function card(p,i,group){
    const name=p?.name||`${group==="war"?"WAR":"PLAYER"} ${String(i+1).padStart(2,"0")}`;
    const role=p?.role||"PLAYER";
    const detail=p?.detail||"NKJ SERENITY";
    const photo=p?.photo||"";
    const initial=esc(name.trim().charAt(0)||"?");
    const media=photo
      ? `<div class="player-portrait has-photo"><img class="player-photo" src="${esc(photo)}" alt="${esc(name)}" loading="lazy"></div>`
      : `<div class="player-portrait"><span>${initial}</span></div>`;
    return `<article class="player-card${group==="competitive"&&i===2?" featured":""}">
      <div class="player-card-top"><div class="player-no">${String(i+1).padStart(2,"0")}</div><span class="player-status">ACTIVE</span></div>
      <div class="player-scan"></div>${media}
      <div class="player-nameplate"><span class="player-squad-code">NKJ SERENITY</span><h3>${esc(name)}</h3>
      <div class="player-role-row"><p>${esc(role)}</p><i>${group==="competitive"?"COMP":"WAR"}</i></div><small>${esc(detail)}</small></div>
      <div class="player-card-foot"><span>T4BEPUANG UNITY</span><b>///</b></div>
    </article>`;
  }
  function render(){
    const data=read();
    const cg=document.getElementById("competitiveRosterGrid");
    const wg=document.getElementById("warRosterGrid");
    if(cg) cg.innerHTML=data.competitiveRoster.map((p,i)=>card(p,i,"competitive")).join("");
    if(wg) wg.innerHTML=data.warRoster.map((p,i)=>card(p,i,"war")).join("");

    const tabs=document.querySelectorAll("[data-roster-tab]");
    const cp=document.getElementById("competitivePanel"),wp=document.getElementById("warPanel");
    tabs.forEach(btn=>btn.addEventListener("click",()=>{
      tabs.forEach(x=>x.classList.remove("active"));btn.classList.add("active");
      const war=btn.dataset.rosterTab==="war";
      if(cp) cp.classList.toggle("active",!war);
      if(wp) wp.classList.toggle("active",war);
    }));
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",render); else render();
  window.addEventListener("storage",e=>{if(e.key===DATA_KEY||e.key===BACKUP_KEY) render();});
})();
