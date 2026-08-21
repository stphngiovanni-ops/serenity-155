document.addEventListener("DOMContentLoaded",async()=>{
  const grid=document.getElementById("familyGallery"),viewer=document.getElementById("familyViewer");
  const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  let items=[];
  try{
    const cloud=await serenityCloudLoad();
    items=Array.isArray(cloud?.familyGallery)?cloud.familyGallery:[];
  }catch(e){}
  if(!items.length){
    grid.innerHTML='<div class="empty">FAMILY GALLERY belum memiliki foto. Foto bisa ditambahkan melalui Admin SERENITY.</div>';
    return;
  }
  grid.innerHTML=items.map((x,i)=>`<article class="family-card" data-i="${i}">
    <div class="family-photo">${x.photo?`<img src="${esc(x.photo)}" alt="${esc(x.title||"Family Serenity")}">`:'<div class="empty">NO PHOTO</div>'}</div>
    <div class="family-info"><span>${esc(x.date||"FAMILY SERENITY")}</span><h3>${esc(x.title||"SERENITY FAMILY")}</h3><p>${esc(x.caption||"One squad. One family.")}</p></div>
  </article>`).join("");
  grid.querySelectorAll(".family-card").forEach(c=>c.onclick=()=>{const x=items[Number(c.dataset.i)];if(!x)return;document.getElementById("viewerImage").src=x.photo||"";document.getElementById("viewerDate").textContent=x.date||"";document.getElementById("viewerTitle").textContent=x.title||"FAMILY SERENITY";document.getElementById("viewerCaption").textContent=x.caption||"";viewer.classList.add("open")});
  document.getElementById("closeViewer").onclick=()=>viewer.classList.remove("open");
  viewer.onclick=e=>{if(e.target===viewer)viewer.classList.remove("open")};
});