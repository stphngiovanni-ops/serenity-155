
(function(){
const FALLBACK=[
 {id:"m1",date:"2026-08-28T20:00",opponent:"WAYANG",event:"FRIENDLY MATCH",status:"upcoming",ourScore:"-",oppScore:"-",logo:""},
 {id:"m2",date:"2026-08-24T20:00",opponent:"REBORN",event:"MATCH DAY",status:"finished",ourScore:"4",oppScore:"0",logo:""},
 {id:"m3",date:"2026-08-22T20:00",opponent:"ETHERION",event:"FRIENDLY MATCH",status:"finished",ourScore:"3",oppScore:"0",logo:""}
];
function load(){
 let raw=null;
 for(const k of ["serenity155Matches","serenityMatches","matches"]){try{raw=JSON.parse(localStorage.getItem(k)||"null");if(Array.isArray(raw))break}catch(e){}}
 return Array.isArray(raw)&&raw.length?raw:FALLBACK;
}
function norm(m,i){
 const st=String(m.status||"upcoming").toLowerCase();
 return {id:m.id||i,date:m.date||m.datetime||m.matchDate||"",opponent:m.opponent||m.enemy||m.teamB||"TBA",
 event:m.event||m.title||m.competition||"MATCH",status:st,ourScore:m.ourScore??m.scoreA??m.score1??"-",oppScore:m.oppScore??m.scoreB??m.score2??"-",
 logo:m.logo||m.opponentLogo||m.logoB||""};
}
function fmt(d){if(!d)return["TBA",""];const x=new Date(d);if(isNaN(x))return[d,""];return [x.toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}),x.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+" WIB"]}
let data=load().map(norm),filter="all";
function render(){
 const grid=document.getElementById("matchPageGrid"),empty=document.getElementById("matchEmpty");
 const list=data.filter(m=>filter==="all"||m.status===filter);
 document.getElementById("matchTotal").textContent=data.length;
 grid.innerHTML=list.map(m=>{const [d,t]=fmt(m.date);const done=m.status==="finished";return `
 <article class="match-modern-card ${m.status}">
  <div class="match-card-top"><span>${m.event}</span><b>${m.status.toUpperCase()}</b></div>
  <div class="match-date">${d} <em>${t}</em></div>
  <div class="match-versus">
   <div class="match-team"><img src="${getSerenityLogo?getSerenityLogo():"assets/serenity155-logo.png"}"><strong>SERENITY</strong></div>
   <div class="score-core">${done?`<strong>${m.ourScore}</strong><i>:</i><strong>${m.oppScore}</strong>`:`<span>VS</span>`}</div>
   <div class="match-team">${m.logo?`<img src="${m.logo}">`:`<div class="team-placeholder">${m.opponent.slice(0,2).toUpperCase()}</div>`}<strong>${m.opponent}</strong></div>
  </div>
 </article>`}).join("");
 empty.style.display=list.length?"none":"block";
}
document.querySelectorAll("[data-match-filter]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-match-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.matchFilter;render()});
render();
})();
