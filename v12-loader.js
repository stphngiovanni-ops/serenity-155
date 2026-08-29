
(function(){
  const done=()=>document.getElementById("serenityLoader")?.classList.add("hide");
  if(document.readyState==="complete") setTimeout(done,450);
  else window.addEventListener("load",()=>setTimeout(done,450),{once:true});
  setTimeout(done,2600);
})();
