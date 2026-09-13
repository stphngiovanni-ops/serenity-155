(function(){
const $=id=>document.getElementById(id);
async function doLogin(){
  const email=($("tourAdminUser").value||"").trim().toLowerCase();
  const pass=($("tourAdminPass").value||"");
  $("tourAdminLoginStatus").textContent="Memverifikasi akun...";
  try{
    const session=await serenityAuthSignIn(email,pass);
    const user=session?.user||await serenityAuthGetUser();
    if(!user || String(user.email||"").toLowerCase()!==SERENITY_ADMIN_EMAIL) throw new Error("Akun ini tidak diizinkan.");
    $("tourAdminLogin").hidden=true;
    $("tourAdminView").hidden=false;
    $("tourAdminLoginStatus").textContent="Login aman berhasil ✓";
  }catch(e){
    console.error(e);
    $("tourAdminLoginStatus").textContent="Login gagal: "+(e?.message||e);
  }
}
$("tourAdminLoginBtn").onclick=e=>{e.preventDefault();doLogin()};
$("tourAdminPass").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();doLogin()}});
$("tourAdminLogout").onclick=async()=>{await serenityAuthLogout();location.reload()};
(async()=>{try{
  const user=await serenityAuthGetUser();
  if(user&&String(user.email||"").toLowerCase()===SERENITY_ADMIN_EMAIL){
    $("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false;
  }else{$("tourAdminView").hidden=true}
}catch(e){$("tourAdminView").hidden=true}})();
})();
