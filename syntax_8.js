
/* PHASE 7 — Dashboard / Today / Next Up */
function todayDashboardItems(){
  const items=[];
  try{
    const all=execGetDay();
    const day=all[execDateKey()];
    (day.items||[]).forEach((x,i)=>items.push({
      id:"exec-"+i,title:x.title,meta:x.meta||"Planned",
      status:x.status||"planned",time:x.time||""
    }));
  }catch(e){}
  // Add the fitness/meal/education domains if the execution layer has not
  // already represented them.
  const seen=new Set(items.map(x=>x.title));
  const extras=[
    ["Strength workout","Fitness"],
    ["Running workout","Fitness"],
    ["Today's meals","Nutrition"],
    ["Network+ study","Education"]
  ];
  extras.forEach((x,i)=>{if(!seen.has(x[0]))items.push({id:"extra-"+i,title:x[0],meta:x[1],status:"planned",time:""})});
  return items;
}
function renderTodayDashboard(){
  const date=iso(selected);
  const items=todayDashboardItems();
  const done=items.filter(x=>x.status==="complete").length;
  const pct=items.length?Math.round(done/items.length*100):0;
  const next=items.find(x=>x.status!=="complete");
  const d=new Date(selected);
  const dateLabel=d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  document.getElementById("todayDate").textContent=dateLabel;
  document.getElementById("todayWeek").textContent=(typeof weekFor==="function"?("Week "+(weekFor(selected)||1)):"—");
  document.getElementById("todayExecution").textContent=pct+"%";
  document.getElementById("todayNext").textContent=next?next.title:"Complete";
  document.getElementById("todayProgress").style.width=pct+"%";
  document.getElementById("todayStatus").textContent=pct===100&&items.length?"COMPLETE":pct?"IN PROGRESS":"READY";

  document.getElementById("todayTimeline").innerHTML=items.map(x=>`
    <div class="today-event">
      <div class="today-time">${escapeHtml(x.time||"TODAY")}</div>
      <div><div class="today-title">${escapeHtml(x.title)}</div><div class="today-meta">${escapeHtml(x.meta)}</div></div>
      <div class="today-state">${escapeHtml((x.status||"planned").toUpperCase())}</div>
    </div>`).join("");
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(renderTodayDashboard,0));
