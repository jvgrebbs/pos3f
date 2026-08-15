
/* PHASE 8 — PWA HARDENING / OFFLINE OPERATION */
let posInstallPrompt=null;
function updatePWAStatus(){
  const online=navigator.onLine;
  const c=document.getElementById("pwaConnection");
  const w=document.getElementById("pwaWorker");
  const i=document.getElementById("pwaInstallable");
  const s=document.getElementById("pwaStatus");
  if(c)c.textContent=online?"ONLINE":"OFFLINE";
  if(s)s.textContent=online?"READY":"OFFLINE MODE";
  if(w)w.textContent=("serviceWorker" in navigator)?"ACTIVE":"UNAVAILABLE";
  if(i)i.textContent=posInstallPrompt?"AVAILABLE":(window.matchMedia("(display-mode: standalone)").matches?"INSTALLED":"NOT YET");
  const d=document.getElementById("pwaDetails");
  if(d)d.textContent=online
    ?"Core application is connected. Cached application assets remain available offline."
    :"No network connection detected. The application is operating from local/cached resources.";
}
window.addEventListener("online",updatePWAStatus);
window.addEventListener("offline",updatePWAStatus);
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); posInstallPrompt=e; updatePWAStatus();
});
window.addEventListener("appinstalled",()=>{posInstallPrompt=null;updatePWAStatus()});
async function installPersonalOS(){
  if(!posInstallPrompt)return;
  posInstallPrompt.prompt();
  await posInstallPrompt.userChoice;
  posInstallPrompt=null;
  updatePWAStatus();
}
document.addEventListener("DOMContentLoaded",()=>{
  setTimeout(updatePWAStatus,100);
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").then(updatePWAStatus).catch(updatePWAStatus);
  }
});
