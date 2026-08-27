
(function(){
const FALLBACK=[
 {id:"t1",name:"SERENITY COMMUNITY CUP",game:"POINT BLANK",date:"2026-09-05",status:"open",slots:32,registered:18,fee:"Rp25.000",prize:"Rp2.500.000",format:"5 VS 5 • SINGLE ELIMINATION",poster:""},
 {id:"t2",name:"PBSB DIVISI 1",game:"POINT BLANK",date:"2026-09-12",status:"upcoming",slots:16,registered:16,fee:"INVITATIONAL",prize:"TBA",format:"5 VS 5 • COMPETITIVE",poster:""}
];
function load(){try{const x=JSON.parse(localStorage.getItem("serenity155Tournaments")||"null");return Array.isArray(x)&&x.length?x:FALLBACK}catch(e){return FALLBACK}}
function fmt(d){if(!d)return"TBA";const x=new Date(d);return isNaN(x)?d:x.toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})}
let data=load(),filter="all";
function render(){
 const g=document.getElementById("tournamentGrid"),e=document.getElementById("tournamentEmpty");
 const list=data.filter(t=>filter==="all"||String(t.status).toLowerCase()===filter);
 g.innerHTML=list.map(t=>{const pct=Math.min(100,Math.round((Number(t.registered||0)/Math.max(1,Number(t.slots||1)))*100));return `
 <article class="tour-modern-card">
  <div class="tour-cover">${t.poster?`<img src="${t.poster}">`:`<div class="tour-cover-mark">S155</div>`}<span class="tour-status ${t.status}">${String(t.status).toUpperCase()}</span></div>
  <div class="tour-body"><small>${t.game||"POINT BLANK"}</small><h3>${t.name}</h3>
   <div class="tour-meta"><div><span>DATE</span><b>${fmt(t.date)}</b></div><div><span>PRIZE POOL</span><b>${t.prize||"TBA"}</b></div><div><span>ENTRY</span><b>${t.fee||"FREE"}</b></div><div><span>FORMAT</span><b>${t.format||"TBA"}</b></div></div>
   <div class="slot-line"><span>SLOT ${t.registered||0}/${t.slots||0}</span><b>${pct}%</b></div><div class="slot-bar"><i style="width:${pct}%"></i></div>
   <button class="tour-action" type="button" ${t.status!=="open"?"disabled":""}>${t.status==="open"?"REGISTRATION OPEN":"DETAIL TOURNAMENT"}</button>
  </div>
 </article>`}).join("");
 e.style.display=list.length?"none":"block";
}
document.querySelectorAll("[data-tour-filter]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tour-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.tourFilter;render()});
render();
})();
