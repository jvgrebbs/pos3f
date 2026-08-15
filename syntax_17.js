
const V2_NOTIF_KEY="pos2:notifications";
async function v2EnableNotifications(){
  if(!("Notification" in window)){alert("Notifications are not supported by this browser.");return}
  const p=await Notification.requestPermission();
  if(p==="granted"){localStorage.setItem(V2_NOTIF_KEY,"enabled");new Notification("Personal OS",{body:"Reminders enabled."});}
  v2RenderNotifications();
}
function v2RenderNotifications(){
  const box=document.getElementById("v2NotificationBody");if(!box)return;
  const items=v2Items().filter(x=>x.status!=="complete");
  const next=items[0];
  box.innerHTML=next?`<div class="pos2-row"><div>Next</div><div><strong>${posEscape(next.title)}</strong><div class="pos2-small">${posEscape(next.domain)} • ${posEscape(next.time)}</div></div><div class="pos2-chip">UP NEXT</div></div>`:"<div class='pos2-small'>Nothing pending today.</div>";
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(v2RenderNotifications,220));
