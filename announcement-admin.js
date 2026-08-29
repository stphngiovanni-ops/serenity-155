
(function(){
 const KEY="serenity_announcements_v1", $=id=>document.getElementById(id);
 let pendingImage="";
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return []}};
 const save=v=>{localStorage.setItem(KEY,JSON.stringify(v));render()};
 const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
 function preview(src){pendingImage=src||""; const im=$("announcementImagePreview"); if(im){im.src=pendingImage;im.hidden=!pendingImage} const rm=$("announcementRemoveImage");if(rm)rm.hidden=!pendingImage}
 function render(){
  const list=$("announcementAdminList");if(!list)return;const d=read();
  list.innerHTML=d.length?d.map((a,i)=>`<div class="announcement-admin-row">
   ${a.image?`<img class="announcement-admin-thumb" src="${a.image}" alt="">`:""}
   <div><b>${esc(a.title)}</b><small>${esc((a.type||"info").toUpperCase())} • ${a.active!==false?"PUBLISHED":"DRAFT"}</small></div>
   <div class="announcement-admin-actions"><button type="button" data-toggle="${i}">${a.active!==false?"UNPUBLISH":"PUBLISH"}</button><button type="button" data-edit="${i}">EDIT</button><button type="button" class="danger" data-delete="${i}">HAPUS</button></div>
  </div>`).join(""):`<p class="hint">Belum ada announcement.</p>`;
  list.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{let x=read(),i=+b.dataset.toggle;x[i].active=x[i].active===false;save(x)});
  list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{let x=read();x.splice(+b.dataset.delete,1);save(x)});
  list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>fill(+b.dataset.edit));
 }
 function fill(i){const a=read()[i];if(!a)return;$("announcementEditIndex").value=i;$("announcementTitle").value=a.title||"";$("announcementMessage").value=a.message||"";$("announcementType").value=a.type||"info";$("announcementButtonText").value=a.buttonText||"";$("announcementButtonUrl").value=a.buttonUrl||"";$("announcementActive").checked=a.active!==false;preview(a.image||"");$("announcementTitle").scrollIntoView({behavior:"smooth",block:"center"})}
 document.addEventListener("DOMContentLoaded",()=>{
  const form=$("announcementForm");if(!form)return;
  const fi=$("announcementImage");
  if(fi)fi.addEventListener("change",()=>{const f=fi.files&&fi.files[0];if(!f)return;if(!f.type.startsWith("image/"))return;const r=new FileReader();r.onload=()=>preview(r.result);r.readAsDataURL(f)});
  if($("announcementRemoveImage"))$("announcementRemoveImage").onclick=()=>{preview("");if(fi)fi.value=""};
  form.addEventListener("submit",e=>{e.preventDefault();const d=read(),idx=$("announcementEditIndex").value;
   const obj={id:idx!==""&&d[+idx]?d[+idx].id:"ann-"+Date.now(),title:$("announcementTitle").value.trim(),message:$("announcementMessage").value.trim(),type:$("announcementType").value,buttonText:$("announcementButtonText").value.trim(),buttonUrl:$("announcementButtonUrl").value.trim(),image:pendingImage,active:$("announcementActive").checked};
   if(idx!==""&&d[+idx])d[+idx]=obj;else d.unshift(obj);save(d);form.reset();$("announcementEditIndex").value="";$("announcementActive").checked=true;preview("");const st=$("announcementAdminStatus");if(st){st.textContent="Announcement berhasil disimpan ✓";setTimeout(()=>st.textContent="",2200)}
  });
  $("announcementResetForm").onclick=()=>{form.reset();$("announcementEditIndex").value="";$("announcementActive").checked=true;preview("")};
  $("announcementResetDismissed").onclick=()=>{localStorage.removeItem("serenity_announcement_dismissed_v2");$("announcementAdminStatus").textContent="Status tutup announcement direset."};
  render();
 });
})();
