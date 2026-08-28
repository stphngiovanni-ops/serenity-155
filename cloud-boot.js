
(async function(){
  try{
    const before=localStorage.getItem("serenity155Data")||"";
    const cloud=await serenityCloudLoad();
    if(!cloud)return;
    const after=JSON.stringify(cloud);
    if(before!==after){
      localStorage.setItem("serenity155Data",after);
      if(sessionStorage.getItem("serenityCloudReloaded")!=="1"){
        sessionStorage.setItem("serenityCloudReloaded","1");
        location.reload();
      }
    }
  }catch(e){console.warn("Cloud sync unavailable",e)}
})();
