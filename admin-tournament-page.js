(function(){
const $=id=>document.getElementById(id);
async function doLogin(){
  const email=($("tourAdminUser").value||"").trim();
  $("tourAdminLoginStatus").textContent="Mengirim link verifikasi ke Gmail...";
  try{
    await serenityAuthSendMagicLink(email);
    $("tourAdminLoginStatus").textContent="Link verifikasi sudah dikirim. Buka Gmail lalu klik link untuk masuk.";
  }catch(e){
    console.error(e);
    $("tourAdminLoginStatus").textContent="Gagal mengirim link: "+(e?.message||e);
  }
}
$("tourAdminLoginBtn").onclick=e=>{e.preventDefault();doLogin()};
doLogin()}});
$("tourAdminLogout").onclick=async()=>{await serenityAuthLogout();location.reload()};
(async()=>{try{
  const user=await serenityAuthGetUser();
  if(user&&String(user.email||"").toLowerCase()===SERENITY_ADMIN_EMAIL){
    $("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false;
  }else{$("tourAdminView").hidden=true}
}catch(e){$("tourAdminView").hidden=true}})();
})();
