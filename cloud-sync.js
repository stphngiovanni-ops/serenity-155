const SERENITY_SUPABASE_URL="https://vcmbthekmltociajzsdx.supabase.co";
const SERENITY_SUPABASE_KEY="sb_publishable_MjSTXwI71RW99XaYTP4fCA_U9uDj5pA";
const SERENITY_SESSION_KEY="serenitySecureAdminSessionV1";

function serenityAuthReadSession(){
  try{return JSON.parse(sessionStorage.getItem(SERENITY_SESSION_KEY)||"null")}catch(e){return null}
}
function serenityAuthStoreSession(s){
  if(!s){sessionStorage.removeItem(SERENITY_SESSION_KEY);return}
  const expiresAt=Date.now()+Math.max(60,Number(s.expires_in||3600))*1000;
  sessionStorage.setItem(SERENITY_SESSION_KEY,JSON.stringify({
    access_token:s.access_token||"",
    refresh_token:s.refresh_token||"",
    expires_at:expiresAt,
    token_type:s.token_type||"bearer",
    user:s.user||null
  }));
}
async function serenityAuthRequest(path,options={}){
  const r=await fetch(SERENITY_SUPABASE_URL+path,{
    ...options,
    headers:{
      "apikey":SERENITY_SUPABASE_KEY,
      "Content-Type":"application/json",
      ...(options.headers||{})
    }
  });
  const text=await r.text();
  let body={};try{body=text?JSON.parse(text):{}}catch(e){body={error:text||("HTTP "+r.status)}}
  if(!r.ok) throw new Error(body?.msg||body?.error_description||body?.error||("HTTP "+r.status));
  return body;
}
async function serenityAuthSignIn(email,password){
  const normalized=(email||"").trim().toLowerCase();
  const s=await serenityAuthRequest("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:normalized,password})});
  serenityAuthStoreSession(s);
  return s;
}
async function serenityAuthSignUp(email,password){
  const normalized=(email||"").trim().toLowerCase();
  if(!password || password.length<10) throw new Error("Gunakan password baru minimal 10 karakter.");
  const redirect=(location.origin+location.pathname);
  const s=await serenityAuthRequest("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:normalized,password,options:{emailRedirectTo:redirect}})});
  if(s?.access_token) serenityAuthStoreSession(s);
  return s;
}
async function serenityAuthSendMagicLink(email){
  const normalized=(email||"").trim().toLowerCase();
  const redirect=encodeURIComponent(location.origin+location.pathname);
  return serenityAuthRequest("/auth/v1/otp?redirect_to="+redirect,{method:"POST",body:JSON.stringify({email:normalized,create_user:true})});
}
async function serenityAuthSendEmailOtp(email){
  const normalized=(email||"").trim().toLowerCase();
  if(!normalized || !normalized.includes("@")) throw new Error("Masukkan alamat Gmail admin.");
  const r=await fetch(SERENITY_SUPABASE_URL+"/functions/v1/serenity-admin-otp",{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":SERENITY_SUPABASE_KEY},
    body:JSON.stringify({email:normalized})
  });
  let result={};
  try{ result=await r.json(); }catch(_){}
  if(r.status===429 || result.state==="limited") throw new Error("Layanan OTP sedang dibatasi. Tunggu beberapa saat lalu coba sekali lagi.");
  if(!r.ok || result.state==="unavailable") throw new Error("OTP belum berhasil dikirim. Coba lagi beberapa saat.");
  return result;
}
async function serenityAuthVerifyEmailOtp(email,token){
  const normalized=(email||"").trim().toLowerCase();
  const code=String(token||"").replace(/\D/g,"").slice(0,8);
  if(!normalized || !normalized.includes("@")) throw new Error("Masukkan alamat Gmail admin.");
  if(code.length!==8) throw new Error("Kode OTP harus 8 digit.");
  const session=await serenityAuthRequest("/auth/v1/verify",{
    method:"POST",
    body:JSON.stringify({email:normalized,token:code,type:"email"})
  });
  if(!session?.access_token) throw new Error("OTP tidak valid atau sudah kedaluwarsa.");
  serenityAuthStoreSession(session);
  const authorized=await serenityAuthIsAuthorized();
  if(!authorized){
    serenityAuthStoreSession(null);
    throw new Error("Akun ini tidak memiliki akses Admin.");
  }
  return session;
}
function serenityOtpCooldownStart(button,statusEl,seconds=60){
  let remaining=seconds;
  button.disabled=true;
  const original=button.dataset.originalText||button.textContent;
  button.dataset.originalText=original;
  button.textContent=`KIRIM ULANG (${remaining}s)`;
  const timer=setInterval(()=>{
    remaining--;
    if(remaining<=0){
      clearInterval(timer);button.disabled=false;button.textContent=original;
      if(statusEl) statusEl.textContent="Kode bisa dikirim ulang jika diperlukan.";
    }else button.textContent=`KIRIM ULANG (${remaining}s)`;
  },1000);
}

async function serenityAuthIsAuthorized(){
  const token=await serenityAuthGetAccessToken();
  if(!token) return false;
  try{
    const r=await fetch(SERENITY_SUPABASE_URL+"/functions/v1/serenity-admin-otp",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "apikey":SERENITY_SUPABASE_KEY,
        "Authorization":"Bearer "+token
      },
      body:JSON.stringify({action:"check"})
    });
    const body=await r.json().catch(()=>({}));
    return !!(r.ok && body?.authorized===true);
  }catch(e){
    console.error("Admin authorization check failed",e);
    return false;
  }
}

async function serenityAuthRefresh(){
  const s=serenityAuthReadSession();
  if(!s?.refresh_token) return null;
  try{
    const next=await serenityAuthRequest("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:s.refresh_token})});
    serenityAuthStoreSession(next);return serenityAuthReadSession();
  }catch(e){serenityAuthStoreSession(null);return null}
}
async function serenityAuthGetAccessToken(){
  let s=serenityAuthReadSession();
  if(!s?.access_token) return "";
  if((s.expires_at||0)<Date.now()+90000) s=await serenityAuthRefresh();
  return s?.access_token||"";
}
async function serenityAuthGetUser(){
  const token=await serenityAuthGetAccessToken();
  if(!token) return null;
  try{
    return await serenityAuthRequest("/auth/v1/user",{headers:{Authorization:"Bearer "+token}});
  }catch(e){return null}
}
async function serenityAuthLogout(){
  const token=await serenityAuthGetAccessToken();
  if(token){
    try{await serenityAuthRequest("/auth/v1/logout",{method:"POST",headers:{Authorization:"Bearer "+token}})}catch(e){}
  }
  serenityAuthStoreSession(null);
}
function serenityAuthCaptureRedirect(){
  try{
    const params=new URLSearchParams(location.hash.replace(/^#/,""));
    const access=params.get("access_token"), refresh=params.get("refresh_token");
    if(access){
      serenityAuthStoreSession({
        access_token:access,
        refresh_token:refresh||"",
        expires_in:Number(params.get("expires_in")||3600),
        token_type:params.get("token_type")||"bearer"
      });
      history.replaceState(null,"",location.pathname+location.search);
      return true;
    }
  }catch(e){}
  return false;
}
async function serenityCloudLoad(){
  const r=await fetch(SERENITY_SUPABASE_URL+"/rest/v1/serenity_site_data?id=eq.main&select=data,updated_at",{
    headers:{"apikey":SERENITY_SUPABASE_KEY,"Authorization":"Bearer "+SERENITY_SUPABASE_KEY},
    cache:"no-store"
  });
  if(!r.ok) throw new Error("Cloud load gagal ("+r.status+")");
  const rows=await r.json();
  return rows?.[0]?.data||null;
}
async function serenityAdminCloudSave(data){
  const token=await serenityAuthGetAccessToken();
  if(!token) throw new Error("Sesi admin habis. Silakan login ulang.");
  const r=await fetch(SERENITY_SUPABASE_URL+"/functions/v1/serenity-admin-save",{
    method:"POST",
    headers:{
      "apikey":SERENITY_SUPABASE_KEY,
      "Authorization":"Bearer "+token,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({data})
  });
  const text=await r.text();
  let body={};try{body=text?JSON.parse(text):{}}catch(e){body={error:text}}
  if(!r.ok) throw new Error(body?.error||("Cloud save gagal ("+r.status+")"));
  return body;
}
serenityAuthCaptureRedirect();
