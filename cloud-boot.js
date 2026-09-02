(async function(){
  try{
    const before=localStorage.getItem("serenity155Data")||"";
    const cloud=await serenityCloudLoad();
    if(!cloud)return;

    const after=JSON.stringify(cloud);

    // Always refresh local data whenever online data changes.
    // This fixes different match data appearing on HP and laptop.
    if(before!==after){
      localStorage.setItem("serenity155Data",after);

      // Mark only this exact cloud version to avoid unnecessary loops.
      const fingerprint=String(cloud.updated_at||after.length)+"|"+after.length;
      const last=sessionStorage.getItem("serenityCloudFingerprint")||"";

      if(last!==fingerprint){
        sessionStorage.setItem("serenityCloudFingerprint",fingerprint);
        location.reload();
      }
    }
  }catch(e){
    console.warn("Cloud sync unavailable",e);
  }
})();