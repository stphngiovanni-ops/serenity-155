
(function(){
const FALLBACK=[
 {id:"default",date:"2026-09-12T20:00",opponent:"OPPONENT",event:"FRIENDLY MATCH",status:"UPCOMING",ourScore:"",oppScore:"",logo:""}
];
function load(){
  try{
    const site=JSON.parse(localStorage.getItem("serenity155Data")||"null");
    if(site&&Array.isArray(site.matches)&&site.matches.length)return site.matches;
  }catch(e){}
  try{
    const old=JSON.parse(localStorage.getItem("serenity155Matches")||"null");
    if(Array.isArray(old)&&old.length)return old;
  }catch(e){}
  return FALLBACK;
}
function norm(m,i){
  let raw=String(m.status||"UPCOMING").toUpperCase();
  let status=raw==="COMPLETED"||raw==="FINISHED"?"finished":raw==="LIVE"?"live":"upcoming";
  return {
    id:m.id||i,date:m.date||m.datetime||m.matchDate||"",
    opponent:m.opponent||m.enemy||m.teamB||"TBA",
    event:m.event||m.title||m.competition||"MATCH",
    status,
    ourScore:m.ourScore??m.scoreA??m.score1??"",
    oppScore:m.oppScore??m.scoreB??m.score2??"",
    logo:m.logo||m.opponentLogo||m.logoB||""
  };
}
function fmt(d){
  if(!d)return["TBA",""];
  const x=new Date(d);
  if(isNaN(x))return[d,""];
  return [
    x.toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}),
    x.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+" WIB"
  ];
}
let data=load().map(norm),filter="all";
function getLogo(){
  try{return typeof getSerenityLogo==="function"?getSerenityLogo():"assets/serenity155-logo.png"}
  catch(e){return "assets/serenity155-logo.png"}
}
function stats(){
  const finished=data.filter(m=>m.status==="finished");
  let wins=0,loss=0,draw=0,gf=0,ga=0;
  finished.forEach(m=>{
    const a=Number(m.ourScore),b=Number(m.oppScore);
    if(Number.isFinite(a)&&Number.isFinite(b)){
      gf+=a;ga+=b;
      if(a>b)wins++;else if(a<b)loss++;else draw++;
    }
  });
  return {total:data.length,wins,loss,draw,gf,ga,wr:finished.length?Math.round(wins/finished.length*100):0};
}
function renderStats(){
  const st=stats();
  document.getElementById("matchTotal").textContent=st.total;
  const wrap=document.getElementById("matchStats");
  if(wrap)wrap.innerHTML=[
    ["TOTAL MATCH",st.total],["MENANG",st.wins],["KALAH",st.loss],["DRAW",st.draw],
    ["TOTAL GOAL",st.gf],["GOAL KEMASUKAN",st.ga],["WIN RATE",st.wr+"%"]
  ].map(x=>`<div><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join("");
}
function render(){
  const grid=document.getElementById("matchPageGrid"),empty=document.getElementById("matchEmpty");
  const list=data.filter(m=>filter==="all"||m.status===filter);
  grid.innerHTML=list.map(m=>{
    const [d,t]=fmt(m.date),done=m.status==="finished";
    return `<article class="match-list-row ${m.status}">
      <div class="match-state"><b>${m.status==="finished"?"FINISHED":m.status==="live"?"LIVE":"UPCOMING"}</b><span>${m.event}</span></div>
      <div class="match-time"><strong>${d}</strong><span>${t}</span></div>
      <div class="match-side"><img src="${getLogo()}"><span>SERENITY</span></div>
      <div class="match-big-score">${done?`<strong>${m.ourScore||0}</strong><i>VS</i><strong>${m.oppScore||0}</strong>`:`<strong>-</strong><i>VS</i><strong>-</strong>`}${m.status==="live"?'<em>LIVE</em>':""}</div>
      <div class="match-side enemy">${m.logo?`<img src="${m.logo}">`:`<div class="enemy-mark">${m.opponent.slice(0,2).toUpperCase()}</div>`}<span>${m.opponent}</span></div>
    </article>`;
  }).join("");
  empty.style.display=list.length?"none":"block";
  renderStats();
}
document.querySelectorAll("[data-match-filter]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("[data-match-filter]").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");filter=b.dataset.matchFilter;render();
});
render();
})();
