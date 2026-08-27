
(function(){
const $=id=>document.getElementById(id);if(!$("bracketAdminTournament"))return;
let all={};try{all=JSON.parse(localStorage.getItem("serenity155Brackets")||"{}")}catch(e){}
function tours(){try{return JSON.parse(localStorage.getItem("serenity155Tournaments")||"[]")}catch(e){return[]}}
function saveAll(){localStorage.setItem("serenity155Brackets",JSON.stringify(all))}
function blankMatch(a="",b=""){return {a,b,sa:"",sb:"",winner:0}}
function make(size){
 let names=Array.from({length:size},(_,i)=>"TEAM "+(i+1)), rounds=[], n=size, first=true;
 while(n>=2){let matches=[];for(let i=0;i<n;i+=2)matches.push(blankMatch(first?names[i]:"TBA",first?names[i+1]:"TBA"));rounds.push({name:n===2?"GRAND FINAL":n===4?"SEMIFINAL":n===8?"QUARTERFINAL":"ROUND OF 16",matches});n/=2;first=false}
 return {size,rounds,champion:""};
}
function current(){return $("bracketAdminTournament").value}
function render(){
 const b=all[current()];const wrap=$("bracketAdminEditor");if(!b){wrap.innerHTML='<p class="hint">Klik BUAT / RESET BAGAN untuk memulai.</p>';return}
 wrap.innerHTML=b.rounds.map((r,ri)=>`<div class="bracket-admin-round"><h3>${r.name}</h3>${r.matches.map((m,mi)=>`<div class="bracket-admin-match">
 <div><input data-f="${ri},${mi},a" value="${m.a||""}" placeholder="Team A"><input type="number" data-f="${ri},${mi},sa" value="${m.sa??""}" placeholder="Score"></div>
 <div><input data-f="${ri},${mi},b" value="${m.b||""}" placeholder="Team B"><input type="number" data-f="${ri},${mi},sb" value="${m.sb??""}" placeholder="Score"></div>
 <select data-w="${ri},${mi}"><option value="0">Pemenang...</option><option value="1" ${m.winner==1?"selected":""}>Team A</option><option value="2" ${m.winner==2?"selected":""}>Team B</option></select>
 </div>`).join("")}</div>`).join("");
}
function propagate(b){
 for(let ri=0;ri<b.rounds.length-1;ri++){
  const cur=b.rounds[ri],next=b.rounds[ri+1];
  cur.matches.forEach((m,mi)=>{const winner=m.winner==1?m.a:m.winner==2?m.b:"TBA";const nm=next.matches[Math.floor(mi/2)];if(mi%2===0)nm.a=winner;else nm.b=winner})
 }
 const f=b.rounds[b.rounds.length-1]?.matches[0];b.champion=f?(f.winner==1?f.a:f.winner==2?f.b:""):"";
}
const ts=tours();$("bracketAdminTournament").innerHTML=ts.length?ts.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""):'<option value="demo">SERENITY COMMUNITY CUP</option>';
$("generateBracket").onclick=()=>{if(!confirm("Buat/reset bagan tournament ini?"))return;all[current()]=make(+$("bracketSize").value);saveAll();render()};
$("bracketAdminTournament").onchange=render;
$("bracketAdminEditor").addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;const [r,m,k]=f.split(",");all[current()].rounds[r].matches[m][k]=e.target.value});
$("bracketAdminEditor").addEventListener("change",e=>{const w=e.target.dataset.w;if(!w)return;const [r,m]=w.split(",");all[current()].rounds[r].matches[m].winner=+e.target.value;propagate(all[current()]);render()});
$("saveBracket").onclick=()=>{const b=all[current()];if(!b)return alert("Buat bagan terlebih dahulu.");propagate(b);saveAll();render();alert("Bagan tournament berhasil disimpan.")};
render();
})();
