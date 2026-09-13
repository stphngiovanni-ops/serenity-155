(function(){
const $=id=>document.getElementById(id);
async function sendTournamentOtp(){
 const email=($("tourAdminUser").value||"").trim(),btn=$("tourAdminLoginBtn");
 $("tourAdminLoginStatus").textContent="Mengirim kode OTP ke Gmail...";
 try{await serenityAuthSendEmailOtp(email);$("tourAdminLoginStatus").textContent="Kode OTP sudah dikirim. Cek Gmail lalu masukkan kode 6 digit.";serenityOtpCooldownStart(btn,$("tourAdminLoginStatus"),60);$("tourAdminLoginBtnOtp")?.focus()}
 catch(e){const msg=String(e?.message||e);console.error(e);$("tourAdminLoginStatus").textContent=/rate limit/i.test(msg)?"Pengiriman OTP sedang dibatasi Supabase. Tunggu beberapa saat lalu coba lagi.":"Gagal mengirim OTP: "+msg}
}
async function verifyTournamentOtp(){
 const email=($("tourAdminUser").value||"").trim(),code=$("tourAdminLoginBtnOtp")?.value||"";
 $("tourAdminLoginStatus").textContent="Memverifikasi OTP...";
 try{const session=await serenityAuthVerifyEmailOtp(email,code);const user=session?.user||await serenityAuthGetUser();if(!user) throw new Error("Sesi login tidak valid.");$("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false}
 catch(e){console.error(e);$("tourAdminLoginStatus").textContent="OTP gagal: "+(e?.message||e)}
}
$("tourAdminLoginBtn").onclick=e=>{e.preventDefault();sendTournamentOtp()};
$("tourAdminLoginBtnVerify")?.addEventListener("click",verifyTournamentOtp);
$("tourAdminLoginBtnOtp")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();verifyTournamentOtp()}});
$("tourAdminLogout").onclick=async()=>{await serenityAuthLogout();location.reload()};
(async()=>{try{const user=await serenityAuthGetUser();if(user){$("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false}else $("tourAdminView").hidden=true}catch(e){$("tourAdminView").hidden=true}})();
})();