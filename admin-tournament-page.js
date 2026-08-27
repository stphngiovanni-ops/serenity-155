
(function(){
const $=id=>document.getElementById(id),PASS="serenity_mei25";
$("tourAdminLoginBtn").onclick=()=>{if($("tourAdminUser").value==="admin"&&$("tourAdminPass").value===PASS){sessionStorage.setItem("serenityTourAdmin","1");$("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false;location.reload()}else $("tourAdminLoginStatus").textContent="Username atau password salah."};
$("tourAdminPass").addEventListener("keydown",e=>{if(e.key==="Enter")$("tourAdminLoginBtn").click()});
$("tourAdminLogout").onclick=()=>{sessionStorage.removeItem("serenityTourAdmin");location.reload()};
if(sessionStorage.getItem("serenityTourAdmin")==="1"){$("tourAdminLogin").hidden=true;$("tourAdminView").hidden=false}
else{$("tourAdminView").hidden=true}
})();
