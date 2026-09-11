
const DEFAULT_STORE = {
  products: [
    {id:"pb-01",type:"voucher",game:"POINT BLANK",name:"PB Voucher Basic",variant:"1.200 Cash",price:10000,stock:20,active:true,image:""},
    {id:"pb-02",type:"voucher",game:"POINT BLANK",name:"PB Voucher Silver",variant:"2.400 Cash",price:20000,stock:20,active:true,image:""},
    {id:"pb-03",type:"voucher",game:"POINT BLANK",name:"PB Voucher Gold",variant:"6.000 Cash",price:50000,stock:10,active:true,image:""},
    {id:"jersey-01",type:"jersey",game:"",name:"Official NKJ SERENITY Jersey",variant:"S / M / L / XL / XXL",price:185000,stock:20,active:true,image:""}
  ]
};
let storeData = DEFAULT_STORE;
let cart = [];
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function migrateStore(d){
  d=d&&typeof d==="object"?d:{};
  d.products=Array.isArray(d.products)?d.products:[];
  d.products=d.products.map((p,i)=>({
    ...p,
    id:p.id||("product-"+Date.now()+"-"+i),
    type:p.type||"voucher",
    game:p.game||(p.type==="jersey"?"":"POINT BLANK"),
    variant:p.variant||p.cash||p.size||"",
    image:p.image||"",
    active:p.active!==false,
    stock:Number(p.stock||0),
    price:Number(p.price||0)
  }));
  if(!d.products.length)d=JSON.parse(JSON.stringify(DEFAULT_STORE));
  return d;
}
function loadStore(){
  try{storeData=migrateStore(JSON.parse(localStorage.getItem("nkjStoreData"))||DEFAULT_STORE)}
  catch(e){storeData=migrateStore(DEFAULT_STORE)}
}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0)}
function productCard(p){
  const isJersey=p.type==="jersey";
  const label=isJersey?"OFFICIAL JERSEY":(p.game||"GAME VOUCHER");
  const thumb=p.image?`<img class="v265-product-image" src="${esc(p.image)}" alt="${esc(p.name)}">`:
    `<div class="v265-product-fallback">${isJersey?"JERSEY":"VOUCHER"}</div>`;
  return `<article class="v265-product-card">
    <div class="v265-product-media">${thumb}<span class="v265-stock ${p.stock>0?"ready":"sold"}">${p.stock>0?"READY":"HABIS"}</span></div>
    <div class="v265-product-copy">
      <small>${esc(label)}</small>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.variant||"")}</p>
      <div class="v265-product-bottom">
        <div><b>${rupiah(p.price)}</b><span>Stok ${p.stock}</span></div>
        <button type="button" data-add="${esc(p.id)}" ${p.stock<=0?"disabled":""}>${p.stock>0?"BELI":"HABIS"}</button>
      </div>
    </div>
  </article>`
}
function renderProducts(){
  const vouchers=$("voucherProducts"), jerseys=$("jerseyProducts");
  if(vouchers){
    const list=storeData.products.filter(p=>p.active!==false&&p.type!=="jersey");
    vouchers.innerHTML=list.length?list.map(productCard).join(""):'<div class="v265-empty">Belum ada voucher game.</div>';
  }
  if(jerseys){
    const list=storeData.products.filter(p=>p.active!==false&&p.type==="jersey");
    jerseys.innerHTML=list.length?list.map(productCard).join(""):'<div class="v265-empty">Belum ada produk jersey.</div>';
  }
}
function updateCartCount(){
  const qty=cart.reduce((s,c)=>s+c.qty,0);
  ["storeCartCount","headerCartCount"].forEach(id=>{const e=$(id);if(e)e.textContent=id==="storeCartCount"?qty+" ITEM":qty})
}
function renderCart(){
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const rows=cart.map((c,i)=>`<div class="nkj-cart-row">
    <div><b>${esc(c.name)}</b><small>${esc(c.variant||c.game||"")} • ${rupiah(c.price)} × ${c.qty}</small></div>
    <div class="nkj-cart-actions"><button data-minus="${i}">−</button><span>${c.qty}</span><button data-plus="${i}">+</button><button data-remove="${i}">×</button></div>
  </div>`).join("");
  ["cartItems","cartItemsCheckout"].forEach(id=>{const w=$(id);if(w)w.innerHTML=cart.length?rows:'<div class="nkj-empty-cart"><strong>Keranjang masih kosong</strong><span>Pilih jersey atau voucher game.</span></div>'});
  if($("cartTotal"))$("cartTotal").textContent=rupiah(total);
  if($("cartTotalCheckout"))$("cartTotalCheckout").textContent=rupiah(total);
  updateCartCount();
}
function addToCart(id){
  const p=storeData.products.find(x=>x.id===id);if(!p||p.stock<=0)return;
  const found=cart.find(x=>x.id===id);
  if(found){if(found.qty<p.stock)found.qty++}else cart.push({...p,qty:1});
  renderCart()
}
function createOrder(){
  const status=$("orderStatus"), name=$("buyerName")?.value.trim(), wa=$("buyerWhatsapp")?.value.trim();
  if(!status)return;
  if(!cart.length){status.textContent="Keranjang masih kosong.";return}
  if(!name||!wa){status.textContent="Nama dan WhatsApp wajib diisi.";return}
  const id="NKJ-"+Date.now().toString().slice(-8), total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  let orders=[];try{orders=JSON.parse(localStorage.getItem("nkjStoreOrders")||"[]")}catch(e){}
  orders.unshift({id,name,wa,note:$("buyerNote")?.value.trim()||"",items:cart,total,status:"UNPAID",createdAt:new Date().toISOString()});
  localStorage.setItem("nkjStoreOrders",JSON.stringify(orders));
  status.textContent=`Order ${id} berhasil dibuat • Total ${rupiah(total)}`;
  cart=[];renderCart()
}
document.addEventListener("click",e=>{
  const t=e.target;
  if(t.matches("[data-add]"))addToCart(t.dataset.add);
  if(t.matches("[data-minus]")){const i=+t.dataset.minus;if(cart[i]?.qty>1)cart[i].qty--;else if(cart[i])cart.splice(i,1);renderCart()}
  if(t.matches("[data-plus]")){const i=+t.dataset.plus,p=storeData.products.find(x=>x.id===cart[i]?.id);if(cart[i]&&p&&cart[i].qty<p.stock)cart[i].qty++;renderCart()}
  if(t.matches("[data-remove]")){cart.splice(+t.dataset.remove,1);renderCart()}
});
document.addEventListener("DOMContentLoaded",()=>{
  loadStore();renderProducts();renderCart();
  $("createOrder")?.addEventListener("click",createOrder);
});
