
(function(){
const $=id=>document.getElementById(id);if(!$("addTournament"))return;
let data=[];try{data=JSON.parse(localStorage.getItem("serenity155Tournaments")||"[]")}catch(e){}
function save(){localStorage.setItem("serenity155Tournaments",JSON.stringify(data))}
function readFile(file){return new Promise((res,rej)=>{if(!file)return res("");const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function render(){$("tournamentAdminList").innerHTML=data.length?data.map((t,i)=>`<div class="edit-row"><div><b>${t.name}</b><br><small>${t.date||"TBA"} • ${String(t.status).toUpperCase()} • Slot ${t.registered||0}/${t.slots||0} • ${t.prize||"TBA"}</small></div><button class="small-btn danger" data-tour-remove="${i}" type="button">HAPUS</button></div>`).join(""):'<p class="hint">Belum ada tournament tersimpan.</p>'}
$("addTournament").onclick=async()=>{const name=$("tourName").value.trim();if(!name)return alert("Nama tournament wajib diisi.");const poster=await readFile($("tourPoster").files?.[0]);data.unshift({id:"tour-"+Date.now(),name,game:$("tourGame").value.trim()||"POINT BLANK",date:$("tourDate").value,status:$("tourStatus").value,slots:+$("tourSlots").value||0,registered:+$("tourRegistered").value||0,fee:$("tourFee").value.trim(),prize:$("tourPrize").value.trim(),format:$("tourFormat").value.trim(),poster});save();render();$("tourName").value="";$("tourPoster").value=""};
document.body.addEventListener("click",e=>{if(e.target.dataset.tourRemove!==undefined){data.splice(+e.target.dataset.tourRemove,1);save();render()}});
render();
})();
