(function(){
  const $=id=>document.getElementById(id);
  const API=SERENITY_SUPABASE_URL+"/functions/v1/serenity-tournament-admin";
  let editingId=null;
  let tournaments=[];

  async function api(body){
    const token=await serenityAuthGetAccessToken();
    if(!token) throw new Error("Sesi admin habis. Silakan login ulang.");
    const r=await fetch(API,{method:"POST",headers:{"apikey":SERENITY_SUPABASE_KEY,"Authorization":"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify(body)});
    let out={}; try{out=await r.json()}catch(_){out={}}
    if(r.status===401||r.status===403) throw new Error("Akses Admin tidak valid. Silakan login ulang.");
    if(!r.ok) throw new Error(out.error||("Request gagal ("+r.status+")"));
    return out;
  }
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function statusText(v){return String(v||"OPEN").toUpperCase()}
  function formToTournament(){
    return {
      id:editingId||undefined,
      name:$("tourName")?.value.trim()||"",
      game:$("tourGame")?.value.trim()||"POINT BLANK",
      event_date:$("tourDate")?.value||null,
      max_teams:Number($("tourSlots")?.value||16),
      fee:0,
      prize:$("tourPrize")?.value.trim()||"",
      status:statusText($("tourStatus")?.value||"OPEN"),
      description:$("tourFormat")?.value.trim()||"",
      banner_url:""
    };
  }
  function resetForm(){
    editingId=null;
    if($("tourName")) $("tourName").value="";
    if($("tourGame")) $("tourGame").value="POINT BLANK";
    if($("tourDate")) $("tourDate").value="";
    if($("tourStatus")) $("tourStatus").value="open";
    if($("tourSlots")) $("tourSlots").value="32";
    if($("tourRegistered")) $("tourRegistered").value="0";
    if($("tourFee")) $("tourFee").value="";
    if($("tourPrize")) $("tourPrize").value="";
    if($("tourFormat")) $("tourFormat").value="";
    if($("addTournament")) $("addTournament").textContent="+ TAMBAH TOURNAMENT";
  }
  function render(){
    const box=$("tournamentAdminList"); if(!box) return;
    if(!tournaments.length){box.innerHTML='<p class="hint">Belum ada tournament.</p>';return}
    box.innerHTML=tournaments.map(t=>`<div class="edit-row"><div><b>${esc(t.name)}</b><br><small>${esc(t.game||"POINT BLANK")} • ${esc(t.event_date||"DATE TBA")} • ${esc(t.status||"OPEN")} • SLOT ${esc(t.max_teams||16)}</small></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="small-btn" type="button" data-tour-edit="${esc(t.id)}">EDIT</button><button class="small-btn danger" type="button" data-tour-delete="${esc(t.id)}">HAPUS</button></div></div>`).join("");
  }
  async function load(){
    const out=await api({op:"list"}); tournaments=Array.isArray(out.tournaments)?out.tournaments:[]; render();
  }
  async function save(){
    const t=formToTournament(); if(!t.name){alert("Nama tournament wajib diisi.");return}
    const btn=$("addTournament"); if(btn){btn.disabled=true;btn.textContent="MENYIMPAN..."}
    try{await api({op:"save_tournament",tournament:t}); resetForm(); await load()}
    catch(e){console.error(e);alert(e.message||e)}
    finally{if(btn){btn.disabled=false;if(!editingId)btn.textContent="+ TAMBAH TOURNAMENT"}}
  }
  function edit(id){
    const t=tournaments.find(x=>String(x.id)===String(id)); if(!t)return; editingId=t.id;
    if($("tourName")) $("tourName").value=t.name||"";
    if($("tourGame")) $("tourGame").value=t.game||"POINT BLANK";
    if($("tourDate")) $("tourDate").value=t.event_date?String(t.event_date).slice(0,10):"";
    if($("tourStatus")) {const v=String(t.status||"open").toLowerCase(); $("tourStatus").value=["open","upcoming","ongoing","finished"].includes(v)?v:"open"}
    if($("tourSlots")) $("tourSlots").value=t.max_teams||16;
    if($("tourPrize")) $("tourPrize").value=t.prize||"";
    if($("tourFormat")) $("tourFormat").value=t.description||"";
    if($("addTournament")) $("addTournament").textContent="SIMPAN PERUBAHAN";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  async function del(id){if(!confirm("Hapus tournament ini?"))return; try{await api({op:"delete_tournament",id}); if(String(editingId)===String(id))resetForm(); await load()}catch(e){alert(e.message||e)}}
  $("addTournament")?.addEventListener("click",save);
  document.body.addEventListener("click",e=>{const t=e.target;if(t?.dataset?.tourEdit)edit(t.dataset.tourEdit);if(t?.dataset?.tourDelete)del(t.dataset.tourDelete)});
  async function boot(){try{const user=await serenityAuthGetUser();if(user&&await serenityAuthIsAuthorized())await load()}catch(e){console.error("Tournament admin load",e)}}
  boot();
})();
