
document.addEventListener("DOMContentLoaded",()=>{
  const header=document.querySelector(".refine-header");
  if(header){
    const actions=document.createElement("div");actions.className="pos21-actions";
    actions.innerHTML='<button type="button" onclick="pos21OpenCalendar()">Calendar</button><button type="button" onclick="pos21OpenData()">Data</button>';
    header.appendChild(actions);
  }
  const fab=document.querySelector(".refine-fab");if(fab)fab.onclick=()=>pos21Quick("strength");
  setTimeout(pos21RefreshUI,650);
});
