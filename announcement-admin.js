
(function(){
  const KEY="serenity_announcements_v1";
  const $=id=>document.getElementById(id);
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return []}}
  function save(v){localStorage.setItem(KEY,JSON.stringify(v));render();}
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
  function render(){
    const list=$("announcementAdminList"); if(!list)return;
    const data=read();
    list.innerHTML=data.length?data.map((a,i)=>`
      <div class="announcement-admin-row">
        <div><b>${esc(a.title)}</b><small>${esc((a.type||"info").toUpperCase())} • ${a.active!==false?"PUBLISHED":"DRAFT"}</small></div>
        <div class="announcement-admin-actions">
          <button type="button" data-toggle="${i}">${a.active!==false?"UNPUBLISH":"PUBLISH"}</button>
          <button type="button" data-edit="${i}">EDIT</button>
          <button type="button" class="danger" data-delete="${i}">HAPUS</button>
        </div>
      </div>`).join(""):`<p class="hint">Belum ada announcement.</p>`;
    list.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{const d=read();let i=+b.dataset.toggle;d[i].active=d[i].active===false;save(d)});
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{const d=read();d.splice(+b.dataset.delete,1);save(d)});
    list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>fill(+b.dataset.edit));
  }
  function fill(i){
    const a=read()[i]; if(!a)return;
    $("announcementEditIndex").value=i;
    $("announcementTitle").value=a.title||"";
    $("announcementMessage").value=a.message||"";
    $("announcementType").value=a.type||"info";
    $("announcementButtonText").value=a.buttonText||"";
    $("announcementButtonUrl").value=a.buttonUrl||"";
    $("announcementTicker").checked=!!a.ticker;
    $("announcementActive").checked=a.active!==false;
    $("announcementTitle").scrollIntoView({behavior:"smooth",block:"center"});
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const form=$("announcementForm"); if(!form)return;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const data=read(), idx=$("announcementEditIndex").value;
      const obj={
        id:idx!=="" && data[+idx]?data[+idx].id:"ann-"+Date.now(),
        title:$("announcementTitle").value.trim(),
        message:$("announcementMessage").value.trim(),
        type:$("announcementType").value,
        buttonText:$("announcementButtonText").value.trim(),
        buttonUrl:$("announcementButtonUrl").value.trim(),
        ticker:$("announcementTicker").checked,
        active:$("announcementActive").checked
      };
      if(idx!=="" && data[+idx])data[+idx]=obj;else data.unshift(obj);
      save(data); form.reset(); $("announcementEditIndex").value=""; $("announcementActive").checked=true;
      const st=$("announcementAdminStatus"); if(st){st.textContent="Announcement berhasil disimpan ✓";setTimeout(()=>st.textContent="",2200);}
    });
    $("announcementResetForm").onclick=()=>{form.reset();$("announcementEditIndex").value="";$("announcementActive").checked=true;};
    $("announcementResetDismissed").onclick=()=>{localStorage.removeItem("serenity_announcement_dismissed_v1");$("announcementAdminStatus").textContent="Status tutup announcement direset."};
    render();
  });
})();
