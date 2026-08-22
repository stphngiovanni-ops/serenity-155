document.addEventListener("DOMContentLoaded",()=>{
  const opening=document.getElementById("v15Opening");
  const hudOpp=document.getElementById("v15HudOpponent");
  const hudCountdown=document.getElementById("v15HudCountdown");

  // Show cinematic intro only once per browser session
  const seen=sessionStorage.getItem("serenityV15OpeningSeen");
  if(seen && opening){
    opening.remove();
  }else if(opening){
    setTimeout(()=>opening.classList.add("is-done"),1700);
    setTimeout(()=>opening.remove(),2500);
    sessionStorage.setItem("serenityV15OpeningSeen","1");
  }

  async function loadCloud(){
    try{
      if(typeof serenityCloudLoad==="function") return await serenityCloudLoad();
      return window.SITE_DATA||{};
    }catch(e){return window.SITE_DATA||{}}
  }

  let timer=null;
  loadCloud().then(data=>{
    const matches=Array.isArray(data?.matches)?data.matches:[];
    const next=matches
      .filter(m=>m?.date)
      .sort((a,b)=>new Date(a.date)-new Date(b.date))
      .find(m=>new Date(m.date).getTime()>Date.now()) || matches.find(m=>m?.featured) || matches[0];

    if(!next)return;
    if(hudOpp)hudOpp.textContent=next.opponent||"TBA";

    const target=next.date?new Date(next.date).getTime():0;
    if(!target)return;

    const tick=()=>{
      const diff=target-Date.now();
      if(diff<=0){
        if(hudCountdown)hudCountdown.textContent="LIVE / SOON";
        if(timer)clearInterval(timer);
        return;
      }
      const d=Math.floor(diff/86400000);
      const h=Math.floor(diff%86400000/3600000);
      const m=Math.floor(diff%3600000/60000);
      const s=Math.floor(diff%60000/1000);
      if(hudCountdown)hudCountdown.textContent=(d?d+"D ":"")+String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    };
    tick(); timer=setInterval(tick,1000);
  });

  // premium parallax on pointer devices
  if(matchMedia("(pointer:fine)").matches){
    const hero=document.querySelector(".esports-hero");
    const logo=document.querySelector(".hero-logo-wrap");
    const copy=document.querySelector(".hero-copy");
    if(hero&&logo&&copy){
      hero.addEventListener("pointermove",e=>{
        const r=hero.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        logo.style.transform=`translate3d(${x*18}px,${y*12}px,0) rotateY(${x*4}deg) rotateX(${-y*3}deg)`;
        copy.style.transform=`translate3d(${x*-7}px,${y*-5}px,45px)`;
      });
      hero.addEventListener("pointerleave",()=>{
        logo.style.transform="";
        copy.style.transform="translateZ(45px)";
      });
    }
  }
});