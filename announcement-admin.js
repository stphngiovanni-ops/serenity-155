
(function(){
  const SITE_KEY="serenity155Data";
  const LEGACY_KEY="serenity_announcements_v1";
  const $=id=>document.getElementById(id);
  let pendingImage="";

  function getSite(){
    try{return JSON.parse(localStorage.getItem(SITE_KEY)||"{}")}catch(e){return {}}
  }
  function getList(){
    const site=getSite();
    if(Array.isArray(site.announcements))return site.announcements;
    try{
      const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||"[]");
      return Array.isArray(legacy)?legacy:[];
    }catch(e){return []}
  }
  function setLocal(list){
    const site=getSite();
    site.announcements=list;
    localStorage.setItem(SITE_KEY,JSON.stringify(site));
    return site;
  }
  async function saveCloud(list){
    const site=setLocal(list);
    if(typeof serenityAdminCloudSave==="function"){
      const pass=sessionStorage.getItem("serenity155AdminPass")||"serenity_mei25";
      await serenityAdminCloudSave(site,pass);
    }
    return site;
  }
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
  function preview(src){
    pendingImage=src||"";
    const im=$("announcementImagePreview");
    if(im){im.src=pendingImage;im.hidden=!pendingImage}
    const rm=$("announcementRemoveImage");if(rm)rm.hidden=!pendingImage;
  }
  function compressImage(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const maxW=1200,maxH=800;
          const scale=Math.min(1,maxW/img.width,maxH/img.height);
          const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
          const c=document.createElement("canvas");c.width=w;c.height=h;
          c.getContext("2d").drawImage(img,0,0,w,h);
          resolve(c.toDataURL("image/jpeg",.76));
        };
        img.onerror=reject;img.src=r.result;
      };
      r.onerror=reject;r.readAsDataURL(file);
    });
  }
  function render(){
    const list=$("announcementAdminList");if(!list)return;
    const d=getList();
    list.innerHTML=d.length?d.map((a,i)=>`<div class="announcement-admin-row">
      ${a.image?`<img class="announcement-admin-thumb" src="${a.image}" alt="">`:""}
      <div><b>${esc(a.title)}</b><small>${esc((a.type||"info").toUpperCase())} • ${a.active!==false?"PUBLISHED":"DRAFT"}</small></div>
      <div class="announcement-admin-actions">
        <button type="button" data-toggle="${i}">${a.active!==false?"UNPUBLISH":"PUBLISH"}</button>
        <button type="button" data-edit="${i}">EDIT</button>
        <button type="button" class="danger" data-delete="${i}">HAPUS</button>
      </div></div>`).join(""):`<p class="hint">Belum ada announcement.</p>`;

    list.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=async()=>{
      const x=getList(),i=+b.dataset.toggle;x[i].active=x[i].active===false;
      await persist(x);
    });
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{
      const x=getList();x.splice(+b.dataset.delete,1);await persist(x);
    });
    list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>fill(+b.dataset.edit));
  }
  async function persist(list){
    const st=$("announcementAdminStatus");
    try{
      if(st)st.textContent="Menyimpan announcement online...";
      await saveCloud(list);
      if(st)st.textContent="Announcement tersimpan ONLINE ✓";
      render();
    }catch(e){
      console.error(e);
      if(st)st.textContent="Gagal simpan online. Coba lagi.";
    }
  }
  function fill(i){
    const a=getList()[i];if(!a)return;
    $("announcementEditIndex").value=i;
    $("announcementTitle").value=a.title||"";
    $("announcementMessage").value=a.message||"";
    $("announcementType").value=a.type||"info";
    $("announcementButtonText").value=a.buttonText||"";
    $("announcementButtonUrl").value=a.buttonUrl||"";
    $("announcementActive").checked=a.active!==false;
    preview(a.image||"");
    $("announcementTitle").scrollIntoView({behavior:"smooth",block:"center"});
  }

  document.addEventListener("DOMContentLoaded",()=>{
    const form=$("announcementForm");if(!form)return;
    const fi=$("announcementImage");

    fi?.addEventListener("change",async()=>{
      const f=fi.files?.[0];if(!f||!f.type.startsWith("image/"))return;
      const st=$("announcementAdminStatus");
      try{
        if(st)st.textContent="Memproses gambar...";
        preview(await compressImage(f));
        if(st)st.textContent="Gambar siap ✓";
      }catch(e){if(st)st.textContent="Gagal membaca gambar."}
    });
    $("announcementRemoveImage")?.addEventListener("click",()=>{preview("");if(fi)fi.value=""});

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const d=getList(),idx=$("announcementEditIndex").value;
      const obj={
        id:idx!==""&&d[+idx]?d[+idx].id:"ann-"+Date.now(),
        title:$("announcementTitle").value.trim(),
        message:$("announcementMessage").value.trim(),
        type:$("announcementType").value,
        buttonText:$("announcementButtonText").value.trim(),
        buttonUrl:$("announcementButtonUrl").value.trim(),
        image:pendingImage,
        active:$("announcementActive").checked
      };
      if(idx!==""&&d[+idx])d[+idx]=obj;else d.unshift(obj);
      await persist(d);
      form.reset();$("announcementEditIndex").value="";$("announcementActive").checked=true;preview("");
    });

    $("announcementResetForm")?.addEventListener("click",()=>{form.reset();$("announcementEditIndex").value="";$("announcementActive").checked=true;preview("")});
    $("announcementResetDismissed")?.addEventListener("click",()=>{
      localStorage.removeItem("serenity_announcement_dismissed_v3");
      const st=$("announcementAdminStatus");if(st)st.textContent="Status 'sudah baca' direset.";
    });

    render();
  });
})();
