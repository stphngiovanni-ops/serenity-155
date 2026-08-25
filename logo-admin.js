
(function(){
  const input=document.getElementById("serenityLogoInput");
  const preview=document.getElementById("serenityLogoPreview");
  const saveBtn=document.getElementById("saveSerenityLogo");
  const resetBtn=document.getElementById("resetSerenityLogo");
  if(!input||!preview||!saveBtn||!resetBtn)return;

  let pending="";
  preview.src=getSerenityLogo();

  function compressLogo(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          let w=img.width,h=img.height;
          const max=1200,scale=Math.min(1,max/w,max/h);
          w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
          const c=document.createElement("canvas");c.width=w;c.height=h;
          const ctx=c.getContext("2d");
          ctx.clearRect(0,0,w,h);
          ctx.drawImage(img,0,0,w,h);
          resolve(c.toDataURL("image/png"));
        };
        img.onerror=reject;img.src=r.result;
      };
      r.onerror=reject;r.readAsDataURL(file);
    });
  }

  input.addEventListener("change",async e=>{
    const f=e.target.files?.[0];if(!f)return;
    pending=await compressLogo(f);
    preview.src=pending;
  });

  saveBtn.addEventListener("click",()=>{
    if(!pending){pending=preview.src;}
    try{
      localStorage.setItem("serenity155CustomLogo",pending);
      preview.src=pending;
      if(typeof applySerenityLogo==="function")applySerenityLogo();
      const status=document.getElementById("saveStatus");
      if(status){status.textContent="Logo SERENITY berhasil disimpan ✓";setTimeout(()=>status.textContent="",2200);}
    }catch(e){}
  });

  resetBtn.addEventListener("click",()=>{
    try{localStorage.removeItem("serenity155CustomLogo");}catch(e){}
    pending="";
    preview.src=SERENITY_DEFAULT_LOGO;
    input.value="";
    if(typeof applySerenityLogo==="function")applySerenityLogo();
    const status=document.getElementById("saveStatus");
    if(status){status.textContent="Logo dikembalikan ke default.";setTimeout(()=>status.textContent="",2200);}
  });
})();
