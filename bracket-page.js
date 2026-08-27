
(function(){
const $=id=>document.getElementById(id);
const select=$("bracketTournamentSelect"), board=$("bracketBoard"); if(!select||!board)return;
function tournaments(){try{return JSON.parse(localStorage.getItem("serenity155Tournaments")||"[]")}catch(e){return[]}}
function data(){try{return JSON.parse(localStorage.getItem("serenity155Brackets")||"{}")}catch(e){return{}}}
function esc(v){return String(v||"TBA").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function matchCard(m){return `<div class="bracket-match"><div class="${m.winner===1?"winner":""}"><span>${esc(m.a)}</span><b>${m.sa??"-"}</b></div><div class="${m.winner===2?"winner":""}"><span>${esc(m.b)}</span><b>${m.sb??"-"}</b></div></div>`}
function render(){
 const all=data(), id=select.value, b=all[id];
 if(!b){board.innerHTML='<div class="bracket-no-data">Bagan belum diatur oleh Admin untuk tournament ini.</div>';return}
 const rounds=b.rounds||[];
 board.innerHTML=rounds.map((r,i)=>`<section class="bracket-round"><h3>${esc(r.name||("ROUND "+(i+1)))}</h3><div class="round-matches">${(r.matches||[]).map(matchCard).join("")}</div></section>`).join("")+
 (b.champion?`<section class="bracket-round champion-round"><h3>CHAMPION</h3><div class="champion-card">🏆<strong>${esc(b.champion)}</strong></div></section>`:"");
}
function init(){
 const ts=tournaments();
 select.innerHTML=ts.length?ts.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join(""):'<option value="demo">SERENITY COMMUNITY CUP</option>';
 render();
}
select.onchange=render;init();
})();
