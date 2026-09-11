
(function(){
  function init(){
    const btn=document.querySelector(".v264-menu-btn");
    const mega=document.querySelector(".v264-mega");
    if(!btn||!mega)return;
    const close=()=>{mega.classList.remove("open");btn.setAttribute("aria-expanded","false")};
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const open=mega.classList.toggle("open");
      btn.setAttribute("aria-expanded",open?"true":"false");
    });
    document.addEventListener("click",e=>{
      if(!mega.contains(e.target)&&!btn.contains(e.target))close();
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
