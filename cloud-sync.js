
const SERENITY_SUPABASE_URL='https://vcmbthekmltociajzsdx.supabase.co';
const SERENITY_SUPABASE_KEY='sb_publishable_MjSTXwI71RW99XaYTP4fCA_U9uDj5pA';
async function serenityCloudLoad(){
  try{
    const r=await fetch(SERENITY_SUPABASE_URL+"/rest/v1/serenity_site_data?id=eq.main&select=data",{headers:{apikey:SERENITY_SUPABASE_KEY}});
    if(!r.ok)return null;
    const rows=await r.json();
    return rows?.[0]?.data && Object.keys(rows[0].data).length ? rows[0].data : null;
  }catch(e){return null}
}
async function serenityCloudSave(data,accessToken){
  const headers={apikey:SERENITY_SUPABASE_KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"};
  if(accessToken)headers.Authorization="Bearer "+accessToken;
  const r=await fetch(SERENITY_SUPABASE_URL+"/rest/v1/serenity_site_data?id=eq.main",{
    method:"PATCH",headers,body:JSON.stringify({data,updated_at:new Date().toISOString()})
  });
  if(!r.ok)throw new Error("Cloud save gagal: "+r.status);
  return true;
}

async function serenityAdminCloudSave(data,password){
  const r=await fetch(SERENITY_SUPABASE_URL+"/functions/v1/serenity-admin-save",{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":SERENITY_SUPABASE_KEY},
    body:JSON.stringify({password,data})
  });
  const out=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(out.error||("HTTP "+r.status));
  return out;
}

async function serenityHydrateLocal(){
  const cloud=await serenityCloudLoad();
  if(cloud){
    try{localStorage.setItem("serenity155Data",JSON.stringify(cloud));}catch(e){}
    return cloud;
  }
  return null;
}
