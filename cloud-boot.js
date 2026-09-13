(async function(){
  const DATA_KEY="serenity155Data";
  const BACKUP_KEY="serenity155Data:lastGood";
  const knownKeys=["competitiveRoster","warRoster","matches","sponsors","achievements","news","contact","homeText","about1","about2"];
  const isUseful=o=>!!(o&&typeof o==="object"&&!Array.isArray(o)&&knownKeys.some(k=>Object.prototype.hasOwnProperty.call(o,k)));
  const score=o=>knownKeys.reduce((n,k)=>n+(Object.prototype.hasOwnProperty.call(o||{},k)?1:0),0);
  try{
    const rawLocal=localStorage.getItem(DATA_KEY)||"";
    let localData=null;
    try{localData=rawLocal?JSON.parse(rawLocal):null}catch(e){}
    if(isUseful(localData)){
      try{localStorage.setItem(BACKUP_KEY,JSON.stringify(localData))}catch(e){}
    }

    const cloud=await serenityCloudLoad();
    if(!isUseful(cloud)){
      console.warn("SERENITY recovery guard: cloud payload diabaikan karena tidak berisi struktur data website.",cloud);
      if(!isUseful(localData)){
        try{
          const backup=JSON.parse(localStorage.getItem(BACKUP_KEY)||"null");
          if(isUseful(backup)) localStorage.setItem(DATA_KEY,JSON.stringify(backup));
        }catch(e){}
      }
      return;
    }

    // Jangan menimpa salinan lokal yang jelas lebih lengkap dengan cloud yang lebih tipis.
    if(isUseful(localData) && score(localData)>score(cloud)){
      console.warn("SERENITY recovery guard: data lokal lebih lengkap, cloud tidak menimpa lokal.");
      return;
    }

    const localNews=Array.isArray(localData?.news)?localData.news:[];
    const cloudNews=Array.isArray(cloud.news)?cloud.news:[];
    const newest=a=>Math.max(0,...a.map(x=>new Date(x?.date||0).getTime()||0));
    const merged={...cloud};
    if(localNews.length>cloudNews.length || newest(localNews)>newest(cloudNews)) merged.news=localNews;

    const after=JSON.stringify(merged);
    if(rawLocal!==after){
      if(isUseful(localData)){
        try{localStorage.setItem(BACKUP_KEY,JSON.stringify(localData))}catch(e){}
      }
      localStorage.setItem(DATA_KEY,after);
      const fingerprint=after.length+"|"+score(merged);
      const last=sessionStorage.getItem("serenityCloudFingerprint")||"";
      if(last!==fingerprint){
        sessionStorage.setItem("serenityCloudFingerprint",fingerprint);
        if(!/admin\.html/i.test(location.pathname)) location.reload();
      }
    }
  }catch(e){console.warn("Cloud sync unavailable",e)}
})();
