
(function(){
const $=id=>document.getElementById(id);if(!$("addTournament"))return;
let data=[];let editIndex=-1;
try{data=JSON.parse(localStorage.getItem("serenity155Tournaments")||"[]")}catch(e){}

function save(){localStorage.setItem("serenity155Tournaments",JSON.stringify(data))}
function readFile(file){return new Promise((res,rej)=>{if(!file)return res("");const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function clearForm(){
  editIndex=-1;
  $("tourName").value="";
  $("tourGame").value="POINT BLANK";
  $("tourDate").value="";
  $("tourStatus").value="open";
  $("tourSlots").value=32;
  $("tourRegistered").value=0;
  $("tourFee").value="";
  $("tourPrize").value="";
  $("tourFormat").value="";
  $("tourPoster").value="";
  $("addTournament").textContent="+ TAMBAH TOURNAMENT";
  const cancel=$("cancelTournamentEdit"); if(cancel) cancel.remove();
}

function render(){
  $("tournamentAdminList").innerHTML=data.length?data.map((t,i)=>`
    <div class="edit-row">
      <div>
        <b>${esc(t.name)}</b><br>
        <small>${esc(t.date||"TBA")} • ${esc(String(t.status||"").toUpperCase())} • Slot ${t.registered||0}/${t.slots||0} • ${esc(t.prize||"TBA")}</small>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
        <button class="small-btn" data-tour-edit="${i}" type="button">EDIT</button>
        <button class="small-btn danger" data-tour-remove="${i}" type="button">HAPUS</button>
      </div>
    </div>`).join(""):'<p class="hint">Belum ada tournament tersimpan.</p>'
}

async function collect(existingPoster=""){
  const file=$("tourPoster").files?.[0];
  const poster=file?await readFile(file):existingPoster;
  return {
    id: editIndex>=0 && data[editIndex]?.id ? data[editIndex].id : "tour-"+Date.now(),
    name:$("tourName").value.trim(),
    game:$("tourGame").value.trim()||"POINT BLANK",
    date:$("tourDate").value,
    status:$("tourStatus").value,
    slots:+$("tourSlots").value||0,
    registered:+$("tourRegistered").value||0,
    fee:$("tourFee").value.trim(),
    prize:$("tourPrize").value.trim(),
    format:$("tourFormat").value.trim(),
    poster
  };
}

$("addTournament").onclick=async()=>{
  const name=$("tourName").value.trim();
  if(!name)return alert("Nama tournament wajib diisi.");
  if(editIndex>=0){
    const item=await collect(data[editIndex]?.poster||"");
    data[editIndex]=item;
    save(); render(); clearForm();
    alert("Tournament berhasil diperbarui.");
  }else{
    const item=await collect("");
    data.unshift(item);
    save(); render(); clearForm();
  }
};

function startEdit(i){
  const t=data[i]; if(!t)return;
  editIndex=i;
  $("tourName").value=t.name||"";
  $("tourGame").value=t.game||"POINT BLANK";
  $("tourDate").value=t.date||"";
  $("tourStatus").value=t.status||"open";
  $("tourSlots").value=t.slots||0;
  $("tourRegistered").value=t.registered||0;
  $("tourFee").value=t.fee||"";
  $("tourPrize").value=t.prize||"";
  $("tourFormat").value=t.format||"";
  $("tourPoster").value="";
  $("addTournament").textContent="SIMPAN PERUBAHAN";

  if(!$("cancelTournamentEdit")){
    const btn=document.createElement("button");
    btn.id="cancelTournamentEdit";
    btn.type="button";
    btn.className="small-btn";
    btn.textContent="BATAL EDIT";
    btn.style.marginLeft="8px";
    $("addTournament").insertAdjacentElement("afterend",btn);
    btn.onclick=clearForm;
  }
  $("tourName").scrollIntoView({behavior:"smooth",block:"center"});
  $("tourName").focus();
}

document.body.addEventListener("click",e=>{
  const edit=e.target.dataset.tourEdit;
  const remove=e.target.dataset.tourRemove;
  if(edit!==undefined){startEdit(+edit);return}
  if(remove!==undefined){
    const i=+remove, name=data[i]?.name||"tournament";
    if(!confirm(`Hapus tournament "${name}"?`))return;
    data.splice(i,1);
    save();render();
    if(editIndex===i)clearForm();
  }
});
render();
})();
