
(function(){
  let deferredPrompt=null;
  const installBtn=()=>document.getElementById("pwaInstallBtn");

  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("/service-worker.js").catch(console.warn));
  }

  window.addEventListener("beforeinstallprompt",(e)=>{
    e.preventDefault();
    deferredPrompt=e;
    const btn=installBtn();
    if(btn) btn.hidden=false;
  });

  window.addEventListener("appinstalled",()=>{
    deferredPrompt=null;
    const btn=installBtn();
    if(btn) btn.hidden=true;
  });

  document.addEventListener("click",async e=>{
    const btn=e.target.closest("#pwaInstallBtn");
    if(!btn)return;
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      btn.hidden=true;
      return;
    }
    const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isiOS
      ? "Di iPhone/iPad: buka Share di Safari lalu pilih Add to Home Screen."
      : "Jika tombol Install belum muncul, buka menu browser lalu pilih Install app / Tambahkan ke layar utama.");
  });
})();
