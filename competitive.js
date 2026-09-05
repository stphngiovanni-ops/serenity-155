
document.addEventListener("DOMContentLoaded",async()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  $("rosterMenu")?.addEventListener("click",()=>$("rosterNav")?.classList.toggle("open"));

  let data={};
  try{
    data=typeof serenityCloudLoad==="function"?(await serenityCloudLoad()||{}):{};
  }catch(e){}
  if(!data || !Object.keys(data).length){
    try{data=JSON.parse(localStorage.getItem("serenity155Data")||"{}")}catch(e){data={}}
  }

  function normalize(list,count,prefix){
    const arr=Array.isArray(list)?list.slice(0,count):[];
    while(arr.length<count){
      arr.push({name:`${prefix} ${String(arr.length+1).padStart(2,"0")}`,role:"PLAYER",detail:"NKJ SERENITY",photo:""});
    }
    return arr;
  }

  const competitive=normalize(data.competitiveRoster,5,"COMP");
  const war=normalize(data.warRoster,12,"WAR");

  function card(p,i,compact=false){
    const hasPhoto=!!p.photo;
    return `<article class="player-card">
      <span class="player-number">${String(i+1).padStart(2,"0")}</span>
      <div class="player-photo">
        ${hasPhoto?`<img class="photo" src="${esc(p.photo)}" alt="${esc(p.name)}">`:`<img class="placeholder" src="nkj-serenity-logo-transparent.png" alt="">`}
        <span class="player-role">${esc(p.role||"PLAYER")}</span>
      </div>
      <div class="player-info">
        <h4>${esc(p.name||"PLAYER")}</h4>
        <p>${esc(p.detail||"NKJ SERENITY")}</p>
        <small>${compact?"WAR SQUAD":"COMPETITIVE"}</small>
      </div>
    </article>`;
  }

  $("competitiveRosterGrid").innerHTML=competitive.map((p,i)=>card(p,i,false)).join("");
  $("warRosterGrid").innerHTML=war.map((p,i)=>card(p,i,true)).join("");

  document.querySelectorAll("[data-roster-tab]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("[data-roster-tab]").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      const tab=btn.dataset.rosterTab;
      $("competitivePanel").classList.toggle("active",tab==="competitive");
      $("warPanel").classList.toggle("active",tab==="war");
    });
  });

  const sponsors=Array.isArray(data.sponsors)?data.sponsors:[];
  $("rosterSponsorGrid").innerHTML=sponsors.length?sponsors.map(s=>`<div class="sponsor-item">${s.logo?`<img src="${esc(s.logo)}" alt="${esc(s.name||"Sponsor")}">`:`<b>${esc(s.name||"SPONSOR")}</b>`}</div>`).join(""):'<div class="sponsor-item"><b>AJ1</b></div><div class="sponsor-item"><b>2K</b></div><div class="sponsor-item"><b>HT557</b></div>';
});
