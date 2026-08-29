
document.addEventListener("DOMContentLoaded", async()=>{
  let d={};
  try{ d=(typeof serenityCloudLoad==="function" ? await serenityCloudLoad() : {}) || {}; }catch(e){}
  const first=(arr)=>Array.isArray(arr)?arr.find(Boolean):null;
  const player=first(d.competitiveRoster||[]);
  const match=first(d.matches||[]);
  const family=first(d.familyGallery||[]);
  const tv=first(d.serenityTV||[]);
  const tour=first(d.tournaments||d.tournamentList||[]);
  const map={
    match: match?.logo || player?.photo || "serenity155-logo.png",
    tournament: tour?.poster || tour?.banner || "serenity155-logo.png",
    family: family?.photo || "serenity155-logo.png",
    tv: tv?.thumbnail || "serenity155-logo.png",
    store: "nkj-store-background.png"
  };
  document.querySelectorAll("[data-command-media]").forEach(card=>{
    const type=card.dataset.commandMedia;
    const img=card.querySelector(".v12-command-media img");
    if(img && map[type]) img.src=map[type];
    img?.addEventListener("error",()=>{img.src=type==="store"?"nkj-store-background.png":"serenity155-logo.png"},{once:true});
  });
});
