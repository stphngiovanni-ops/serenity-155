(async function(){
  try{
    const rawLocal=localStorage.getItem("serenity155Data")||"";
    let localData={};
    try{localData=rawLocal?JSON.parse(rawLocal):{}}catch(e){}
    const cloud=await serenityCloudLoad();
    if(!cloud)return;

    const localNews=Array.isArray(localData.news)?localData.news:[];
    const cloudNews=Array.isArray(cloud.news)?cloud.news:[];
    const newest=a=>Math.max(0,...a.map(x=>new Date(x?.date||0).getTime()||0));
    const merged={...cloud};

    if(localNews.length>cloudNews.length || newest(localNews)>newest(cloudNews)){
      merged.news=localNews;
    }

    const after=JSON.stringify(merged);
    if(rawLocal!==after){
      localStorage.setItem("serenity155Data",after);
      const fingerprint=String(cloud.updated_at||after.length)+"|"+after.length;
      const last=sessionStorage.getItem("serenityCloudFingerprint")||"";
      if(last!==fingerprint){
        sessionStorage.setItem("serenityCloudFingerprint",fingerprint);
        if(!/admin\.html/i.test(location.pathname)) location.reload();
      }
    }
  }catch(e){console.warn("Cloud sync unavailable",e)}
})();