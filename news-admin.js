
(function(){
const KEY='serenity155Data', $=id=>document.getElementById(id); let imageData='';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function write(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){alert("Data browser penuh. Coba gunakan foto berita lebih kecil.");return false}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function list(){let d=read();return Array.isArray(d.news)?d.news:[]}
function render(){
 let d=read(), n=Array.isArray(d.news)?d.news:[];
 const el=$('newsAdminList'); if(!el)return;
 el.innerHTML=n.length?n.map((x,i)=>`<div class="edit-row with-thumb">${x.image?`<img class="admin-thumb" src="${x.image}" alt="">`:`<div class="admin-thumb placeholder">N</div>`}<div><b>${esc(x.title||'UNTITLED')}</b><br><small>${esc(x.category||'TEAM')} • ${esc(x.date||'NO DATE')} ${x.featured?'• FEATURED':''} ${x.published===false?'• DRAFT':'• PUBLISHED'}</small></div><div class="image-tools"><button class="small-btn" type="button" data-news-edit="${i}">EDIT</button><button class="small-btn danger" type="button" data-news-delete="${i}">HAPUS</button></div></div>`).join(''):'<div class="status">Belum ada berita.</div>';
 el.querySelectorAll('[data-news-edit]').forEach(b=>b.onclick=()=>edit(Number(b.dataset.newsEdit)));
 el.querySelectorAll('[data-news-delete]').forEach(b=>b.onclick=()=>del(Number(b.dataset.newsDelete)));
}
function reset(){
 $('newsEditIndex').value='-1'; $('newsCategory').value='TEAM'; $('newsDate').value=''; $('newsTitle').value=''; $('newsExcerpt').value=''; $('newsBody').value=''; $('newsFeatured').checked=false; $('newsPublished').checked=true; $('newsImage').value=''; imageData=''; $('newsImagePreview').hidden=true; $('saveNews').textContent='TAMBAH BERITA'; $('cancelNewsEdit').hidden=true;
}
function compress(file){
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1400,scale=Math.min(1,max/img.width),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.78))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})
}
async function save(){
 let title=$('newsTitle').value.trim(); if(!title){alert('Judul berita wajib diisi.');return}
 let d=read(); d.news=Array.isArray(d.news)?d.news:[];
 let i=Number($('newsEditIndex').value), old=i>=0?d.news[i]:{};
 if($('newsFeatured').checked)d.news.forEach(n=>n.featured=false);
 let item={...old,category:$('newsCategory').value,date:$('newsDate').value||new Date().toISOString(),title,excerpt:$('newsExcerpt').value.trim(),body:$('newsBody').value.trim(),featured:$('newsFeatured').checked,published:$('newsPublished').checked,image:imageData||old.image||''};
 if(i>=0)d.news[i]=item;else d.news.unshift(item);
 if(!write(d))return;
 try{if(typeof serenityAdminCloudSave==='function'){const pass=sessionStorage.getItem('serenity155AdminPass')||'NKJSerenity2026!';await serenityAdminCloudSave(d,pass)}}catch(e){console.warn(e)}
 reset();render();
}
function edit(i){
 let x=list()[i];if(!x)return;$('newsEditIndex').value=i;$('newsCategory').value=x.category||'TEAM';$('newsDate').value=(x.date||'').slice(0,16);$('newsTitle').value=x.title||'';$('newsExcerpt').value=x.excerpt||'';$('newsBody').value=x.body||'';$('newsFeatured').checked=!!x.featured;$('newsPublished').checked=x.published!==false;imageData=x.image||'';if(imageData){$('newsImagePreview').src=imageData;$('newsImagePreview').hidden=false}$('saveNews').textContent='SIMPAN PERUBAHAN BERITA';$('cancelNewsEdit').hidden=false;document.getElementById('newsroomManagement').scrollIntoView({behavior:'smooth'});
}
async function del(i){if(!confirm('Hapus berita ini?'))return;let d=read();d.news=Array.isArray(d.news)?d.news:[];d.news.splice(i,1);if(!write(d))return;try{if(typeof serenityAdminCloudSave==='function'){const pass=sessionStorage.getItem('serenity155AdminPass')||'NKJSerenity2026!';await serenityAdminCloudSave(d,pass)}}catch(e){}render()}
document.addEventListener('DOMContentLoaded',()=>{
 if(!$('newsroomManagement'))return;
 $('saveNews').onclick=save;$('cancelNewsEdit').onclick=reset;
 $('newsImage').onchange=async e=>{let f=e.target.files?.[0];if(!f)return;imageData=await compress(f);$('newsImagePreview').src=imageData;$('newsImagePreview').hidden=false};
 render();
});
})();
