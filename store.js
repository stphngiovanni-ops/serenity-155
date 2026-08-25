
const DEFAULT_STORE = {
  products: [
    {id:"pb-01", name:"PB Voucher Basic", cash:"1.200 Cash", price:10000, stock:20, active:true},
    {id:"pb-02", name:"PB Voucher Silver", cash:"2.400 Cash", price:20000, stock:20, active:true},
    {id:"pb-03", name:"PB Voucher Gold", cash:"6.000 Cash", price:50000, stock:10, active:true},
    {id:"pb-04", name:"PB Voucher Platinum", cash:"12.000 Cash", price:100000, stock:10, active:true}
  ]
};
let storeData = DEFAULT_STORE;
let cart = [];

function loadStore(){
  try{
    storeData = JSON.parse(localStorage.getItem("nkjStoreData")) || DEFAULT_STORE;
  }catch(e){ storeData = DEFAULT_STORE; }
}
function rupiah(n){
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
}
function renderProducts(){
  const wrap=document.getElementById("storeProducts");
  if(!wrap) return;
  wrap.innerHTML="";
  storeData.products.filter(p=>p.active!==false).forEach(p=>{
    const card=document.createElement("article");
    card.className="nkj-product-card";
    card.innerHTML=`
      <div class="nkj-product-top"><span>POINT BLANK</span><span>${p.stock>0?"READY":"HABIS"}</span></div>
      <div class="nkj-pb-mark">PB</div>
      <h3>${p.cash}</h3>
      <p>${p.name}</p>
      <div class="nkj-price">${rupiah(p.price)}</div>
      <small>Stok: ${p.stock}</small>
      <button class="nkj-buy-btn" type="button" data-add="${p.id}" ${p.stock<=0?"disabled":""}>
        ${p.stock>0?"BELI SEKARANG":"STOK HABIS"}
      </button>`;
    wrap.appendChild(card);
  });
}
function updateCartCount(){
  const qty=cart.reduce((s,c)=>s+c.qty,0);
  const el=document.getElementById("storeCartCount");
  if(el) el.textContent=qty+" ITEM";
  const head=document.getElementById("headerCartCount");
  if(head) head.textContent=qty;
}
function renderCart(){
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const makeRows=()=>cart.map((c,i)=>`
    <div class="nkj-cart-row">
      <div><b>${c.cash}</b><small>${rupiah(c.price)} × ${c.qty}</small></div>
      <div class="nkj-cart-actions">
        <button type="button" data-minus="${i}">−</button>
        <span>${c.qty}</span>
        <button type="button" data-plus="${i}">+</button>
        <button type="button" data-remove="${i}">×</button>
      </div>
    </div>`).join("");

  ["cartItems","cartItemsCheckout"].forEach(id=>{
    const wrap=document.getElementById(id);
    if(!wrap)return;
    wrap.innerHTML=cart.length?makeRows():'<div class="nkj-empty-cart"><strong>Keranjang masih kosong</strong><span>Yuk pilih voucher favoritmu.</span></div>';
  });
  const t1=document.getElementById("cartTotal"); if(t1)t1.textContent=rupiah(total);
  const t2=document.getElementById("cartTotalCheckout"); if(t2)t2.textContent=rupiah(total);
  updateCartCount();
}
function addToCart(id){
  const p=storeData.products.find(x=>x.id===id);
  if(!p||p.stock<=0)return;
  const found=cart.find(x=>x.id===id);
  if(found){
    if(found.qty<p.stock)found.qty++;
  }else cart.push({...p,qty:1});
  renderCart();
}
function createOrder(){
  const status=document.getElementById("orderStatus");
  const name=document.getElementById("buyerName")?.value.trim();
  const wa=document.getElementById("buyerWhatsapp")?.value.trim();
  if(!status)return;
  if(!cart.length){status.textContent="Keranjang masih kosong.";return;}
  if(!name||!wa){status.textContent="Nama dan WhatsApp wajib diisi.";return;}
  const id="NKJ-"+Date.now().toString().slice(-8);
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  let orders=[];
  try{orders=JSON.parse(localStorage.getItem("nkjStoreOrders")||"[]")}catch(e){}
  orders.unshift({
    id,name,wa,note:document.getElementById("buyerNote")?.value.trim()||"",
    items:cart,total,status:"UNPAID",createdAt:new Date().toISOString()
  });
  localStorage.setItem("nkjStoreOrders",JSON.stringify(orders));
  status.textContent=`Order ${id} berhasil dibuat • Total ${rupiah(total)}`;
  cart=[];renderCart();
}
document.addEventListener("click",e=>{
  const t=e.target;
  if(t.matches("[data-add]"))addToCart(t.dataset.add);
  if(t.matches("[data-minus]")){
    const i=Number(t.dataset.minus);
    if(cart[i]?.qty>1)cart[i].qty--;else if(cart[i])cart.splice(i,1);
    renderCart();
  }
  if(t.matches("[data-plus]")){
    const i=Number(t.dataset.plus), p=storeData.products.find(x=>x.id===cart[i]?.id);
    if(cart[i]&&p&&cart[i].qty<p.stock)cart[i].qty++;
    renderCart();
  }
  if(t.matches("[data-remove]")){cart.splice(Number(t.dataset.remove),1);renderCart();}
});
document.addEventListener("DOMContentLoaded",()=>{
  if(!document.getElementById("storeProducts"))return;
  loadStore();renderProducts();renderCart();
  document.getElementById("createOrder")?.addEventListener("click",createOrder);
});

document.addEventListener("DOMContentLoaded",()=>{
  const btn=document.getElementById("nkjMenuBtn");
  const nav=document.getElementById("nkjStoreNav");
  if(btn&&nav){
    btn.addEventListener("click",()=>nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
  }
});
