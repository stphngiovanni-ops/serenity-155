
(function(){
const KEY="nkjStoreData", $=id=>document.getElementById(id);
const DEFAULT={products:[]};
let d, pendingImage="";
try{d=JSON.parse(localStorage.getItem(KEY))||DEFAULT}catch(e){d=DEFAULT}
d.products=Array.isArray(d.products)?d.products:[];
d.products=d.products.map((p,i)=>({...p,id:p.id||("p"+Date.now()+i),type:p.type||"voucher",game:p.game||"POINT BLANK",variant:p.variant||p.cash||"",image:p.image||"",active:p.active!==false}));

const save=()=>localStorage.setItem(KEY,JSON.stringify(d));
const rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function compress(file){
 return new Promise((resolve,reject)=>{
  const r=new FileReader();
  r.onload=()=>{const img=new Image();img.onload=()=>{
    const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    resolve(c.toDataURL("image/webp",.86));
  };img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)
 })
}
function render(){
 if(!$("storeProductList"))return;
 $("storeProductList").innerHTML=d.products.length?d.products.map((p,i)=>`
 <div class="edit-row">
   ${p.image?`<img class="admin-thumb" style="object-fit:contain;background:#111" src="${p.image}" alt="">`:''}
   <div><b>${esc(p.type==="jersey"?"JERSEY":p.game||"VOUCHER")} • ${esc(p.name)}</b><br>
   <small>${esc(p.variant||"")} • ${rp(p.price)} • Stok ${p.stock}</small></div>
   <button class="small-btn danger" data-sr="${i}">HAPUS</button>
 </div>`).join(""):'<p class="hint">Belum ada produk.</p>';
 let o=[];try{o=JSON.parse(localStorage.getItem("nkjStoreOrders")||"[]")}catch(e){}
 $("storeOrderList").innerHTML=o.length?o.map(x=>`<div class="edit-row"><div><b>${x.id} • ${esc(x.name)}</b><br><small>${rp(x.total)} • ${x.status} • ${esc(x.wa)}</small></div></div>`).join(""):'<p class="hint">Belum ada order.</p>'
}
function resetForm(){
 ["storeProductName","storeProductGame","storeProductVariant","storeProductPrice","storeProductStock"].forEach(id=>{if($(id))$(id).value=""});
 if($("storeProductType"))$("storeProductType").value="voucher";
 if($("storeProductImage"))$("storeProductImage").value="";
 if($("storeProductImagePreview"))$("storeProductImagePreview").hidden=true;
 pendingImage="";
}
if(!$("addStoreProduct"))return;
$("storeProductImage")?.addEventListener("change",async e=>{
 const f=e.target.files?.[0];if(!f)return;
 pendingImage=await compress(f);
 $("storeProductImagePreview").src=pendingImage;$("storeProductImagePreview").hidden=false;
});
$("addStoreProduct").onclick=()=>{
 const type=$("storeProductType")?.value||"voucher";
 const name=$("storeProductName").value.trim();
 const game=$("storeProductGame")?.value.trim()||"";
 const variant=$("storeProductVariant")?.value.trim()||"";
 const price=+$("storeProductPrice").value,stock=+$("storeProductStock").value;
 if(!name||!price){alert("Nama produk dan harga wajib diisi.");return}
 d.products.push({id:(type==="jersey"?"jersey-":"voucher-")+Date.now(),type,name,game:type==="voucher"?(game||"POINT BLANK"):"",variant,price,stock:Math.max(0,stock||0),active:true,image:pendingImage});
 save();resetForm();render()
};
document.body.addEventListener("click",e=>{
 if(e.target.dataset.sr!==undefined){
  const i=+e.target.dataset.sr;if(confirm("Hapus produk ini?")){d.products.splice(i,1);save();render()}
 }
});
render();
})();
