
(function(){
  const path=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  const map={
    "matches.html":["MATCH CENTER","BATTLE SCHEDULE","Jadwal, hasil pertandingan, statistik, dan perjalanan kompetitif NKJ SERENITY."],
    "competitive.html":["COMPETITIVE","MEET THE SQUAD","Roster Competitive dan Squad War NKJ SERENITY."],
    "tournament.html":["TOURNAMENT","BATTLE ARENA","Tournament, bracket, registrasi, peserta, dan hasil dalam satu arena."],
    "family.html":["FAMILY WALL","ONE FAMILY","Momen, perjalanan, dan keluarga besar NKJ SERENITY."],
    "tv.html":["SERENITY TV","WATCH THE STORY","Konten, video, dan dokumentasi perjalanan NKJ SERENITY."],
    "store.html":["NKJ STORE","OFFICIAL STORE","Voucher Point Blank dan kebutuhan digital NKJ Store."],
    "hub.html":["ESPORTS HUB","ONE NETWORK","Semua jalur NKJ SERENITY dalam satu command hub."],
    "admin.html":["MAIN ADMIN","CONTROL CENTER","Kelola identitas, roster, achievement, sponsor, announcement, dan konten website."],
    "admin-match.html":["MATCH ADMIN","BATTLE CONTROL","Kelola Next Match, Match Center, score, lawan, dan logo pertandingan."],
    "admin-tournament.html":["TOURNAMENT ADMIN","ARENA CONTROL","Kelola event, registrasi, bracket, peserta, dan hasil tournament."],
    "offline.html":["OFFLINE","CONNECTION LOST","Koneksi ke NKJ SERENITY sedang tidak tersedia."]
  };
  document.body.classList.add(path==="index.html"||path===""?"v13-home":"v13-page");
  document.body.classList.add("v13-"+path.replace(".html","").replace(/[^a-z0-9-]/g,""));
  if(path==="index.html"||path==="")return;
  const cfg=map[path]; if(!cfg)return;
  const banner=document.createElement("section");
  banner.className="v13-page-banner";
  banner.innerHTML=`<div class="v13-page-banner-inner"><small>NKJ SERENITY // ${cfg[0]}</small><h1>${cfg[1].split(" ").slice(0,-1).join(" ")} <span>${cfg[1].split(" ").slice(-1)}</span></h1><p>${cfg[2]}</p></div>`;
  const header=document.querySelector("header,.site-header,.arena-header,.admin-topbar");
  if(header&&header.parentNode)header.insertAdjacentElement("afterend",banner);
  else document.body.insertAdjacentElement("afterbegin",banner);
})();
