(function(){
  const KEY='serenity155Data';
  function getData(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function setData(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  function apply(){
    const d=getData();
    const t=document.getElementById('t4bHeroTitle');
    if(!t)return;
    const raw=(d.homepageHeroText||'T4BEPUANG UNITY').trim();
    const parts=raw.split(/\s+/);
    if(parts.length>1){
      const last=parts.pop();
      t.innerHTML=parts.join(' ')+' <span>'+last+'</span>';
    }else{
      t.textContent=raw;
    }
  }
  apply();
  window.addEventListener('storage',apply);
  document.addEventListener('DOMContentLoaded',apply);
  setTimeout(apply,700);
})();