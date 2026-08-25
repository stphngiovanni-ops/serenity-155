
(function(){
  const input=document.getElementById("nkjLogoInput");
  const preview=document.getElementById("nkjLogoPreview");
  const saveBtn=document.getElementById("saveNKJLogo");
  const resetBtn=document.getElementById("resetNKJLogo");
  if(!input||!preview||!saveBtn||!resetBtn)return;

  let pending="";
  preview.src=getNKJLogo();

  function compress(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          let w=img.width,h=img.height;
          const max=1200, scale=Math.min(1,max/w,max/h);
          w=Math.max(1,Math.round(w*scale));
          h=Math.max(1,Math.round(h*scale));
          const canvas=document.createElement("canvas");
          canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext("2d");
          ctx.clearRect(0,0,w,h);
          ctx.drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror=reject;
        img.src=reader.result;
      };
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  }

  input.addEventListener("change",async e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    pending=await compress(file);
    preview.src=pending;
  });

  saveBtn.addEventListener("click",()=>{
    if(!pending) pending=preview.src;
    try{
      localStorage.setItem("nkjStoreCustomLogo",pending);
      preview.src=pending;
      if(typeof applyNKJLogo==="function")applyNKJLogo();
      const status=document.getElementById("saveStatus");
      if(status){status.textContent="Logo NKJ berhasil disimpan ✓";setTimeout(()=>status.textContent="",2200);}
    }catch(e){}
  });

  resetBtn.addEventListener("click",()=>{
    try{localStorage.removeItem("nkjStoreCustomLogo");}catch(e){}
    pending="";
    preview.src=NKJ_DEFAULT_LOGO;
    input.value="";
    if(typeof applyNKJLogo==="function")applyNKJLogo();
    const status=document.getElementById("saveStatus");
    if(status){status.textContent="Logo NKJ dikembalikan ke default.";setTimeout(()=>status.textContent="",2200);}
  });
})();
