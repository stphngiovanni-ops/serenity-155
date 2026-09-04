
(function(){
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  let timer=null;

  function chooseNext(matches){
    if(!Array.isArray(matches)||!matches.length)return null;
    const featured=matches.find(m=>m.featured);
    if(featured)return featured;
    const active=matches
      .filter(m=>!["COMPLETED","FINISHED"].includes(String(m.status||"").toUpperCase()))
      .sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
    return active[0]||matches[0];
  }

  function renderNext(m){
    const opponentName=document.getElementById("opponentName");
    const opponentLogoBox=document.getElementById("opponentLogoBox");
    const gameName=document.getElementById("gameName");
    const matchFormat=document.getElementById("matchFormat");
    const streamLabel=document.getElementById("streamLabel");
    const countdown=document.getElementById("countdown");
    const dateLabel=document.getElementById("matchDateLabel");
    if(!opponentName||!countdown)return;

    if(!m){
      opponentName.textContent="OPPONENT";
      if(opponentLogoBox)opponentLogoBox.textContent="?";
      if(gameName)gameName.textContent="POINT BLANK";
      if(matchFormat)matchFormat.textContent="MATCH";
      if(streamLabel)streamLabel.textContent="LIVE STREAM";
      countdown.textContent="NO UPCOMING MATCH";
      if(dateLabel)dateLabel.textContent="SET FROM MATCH ADMIN";
      return;
    }

    opponentName.textContent=m.opponent||"OPPONENT";
    if(opponentLogoBox){
      opponentLogoBox.innerHTML=m.logo?`<img src="${m.logo}" alt="${esc(m.opponent||"Opponent")}">`:"?";
    }
    if(gameName)gameName.textContent=m.game||"POINT BLANK";
    if(matchFormat)matchFormat.textContent=m.format||m.event||"MATCH";
    if(streamLabel)streamLabel.textContent=m.stream||"LIVE STREAM";

    const target=new Date(m.date);
    if(dateLabel){
      dateLabel.textContent=!isNaN(target)
        ? new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(target)+" WIB"
        : (m.date||"DATE TBA");
    }

    if(timer)clearInterval(timer);
    const tick=()=>{
      const status=String(m.status||"UPCOMING").toUpperCase();
      if(status==="LIVE"){countdown.textContent="LIVE NOW";return}
      if(["COMPLETED","FINISHED"].includes(status)){countdown.textContent="MATCH FINISHED";return}
      if(isNaN(target)){countdown.textContent="DATE TBA";return}
      const diff=target-new Date();
      if(diff<=0){countdown.textContent="MATCH TIME";return}
      const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,min=Math.floor(diff/60000)%60,sec=Math.floor(diff/1000)%60;
      countdown.textContent=`${String(d).padStart(2,"0")}D : ${String(h).padStart(2,"0")}H : ${String(min).padStart(2,"0")}M : ${String(sec).padStart(2,"0")}S`;
    };
    tick();timer=setInterval(tick,1000);
  }

  async function refresh(){
    try{
      let data=null;
      if(typeof serenityCloudLoad==="function") data=await serenityCloudLoad();
      if(!data){
        try{data=JSON.parse(localStorage.getItem("serenity155Data")||"null")}catch(e){}
      }
      if(data&&Array.isArray(data.matches)){
        try{localStorage.setItem("serenity155Data",JSON.stringify(data))}catch(e){}
        renderNext(chooseNext(data.matches));
      }else renderNext(null);
    }catch(e){
      console.warn("NEXT MATCH refresh failed",e);
    }
  }

  window.refreshSerenityNextMatch=refresh;
  document.addEventListener("DOMContentLoaded",refresh);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh()});
  window.addEventListener("focus",refresh);
})();
