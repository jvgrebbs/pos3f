
/* PHASE 4 — Execution Engine */
const EXEC_KEY="pos:0.2:execution:daily";
function execRead(){try{return JSON.parse(localStorage.getItem(EXEC_KEY)||"{}")}catch(e){return {}}}
function execWrite(x){localStorage.setItem(EXEC_KEY,JSON.stringify(x))}
function execDateKey(){return iso(selected)}
function execDefaultItems(){
  const items=[];
  // Pull today's existing schedule when available.
  try{
    if(typeof scheduleForDate==="function"){
      const s=scheduleForDate(selected)||[];
      s.forEach((e,i)=>items.push({id:"schedule-"+i,title:e.title||e.name||"Scheduled item",meta:e.time||e.category||"",source:"schedule"}));
    }
  }catch(e){}
  // Ensure major execution domains are represented.
  const existing=new Set(items.map(x=>x.title));
  const fallbacks=[
    ["Fitness","Fitness"],
    ["Meals","Nutrition"],
    ["Household chores","Household"],
    ["Network+ study","Education"]
  ];
  fallbacks.forEach(([title,meta])=>{if(!existing.has(title))items.push({id:"domain-"+meta.toLowerCase(),title,meta,source:"domain"})});
  return items;
}
function execGetDay(){
  const all=execRead(),key=execDateKey();
  if(!all[key]) all[key]={date:key,items:execDefaultItems()};
  return all;
}
function execRender(){
  const list=document.getElementById("executionList");
  if(!list)return;
  const all=execGetDay(),day=all[execDateKey()];
  const items=day.items||[];
  const complete=items.filter(x=>x.status==="complete").length;
  const percent=items.length?Math.round(complete/items.length*100):0;
  document.getElementById("execPlanned").textContent=items.length;
  document.getElementById("execComplete").textContent=complete;
  document.getElementById("execPercent").textContent=percent+"%";
  document.getElementById("execProgress").style.width=percent+"%";
  const status=document.getElementById("executionStatus");
  if(status)status.textContent=percent===100&&items.length?"COMPLETE":percent?"IN PROGRESS":"READY";
  list.innerHTML=items.map((x,i)=>`
    <div class="exec-item">
      <input type="checkbox" ${x.status==="complete"?"checked":""} onchange="execToggle(${i},this.checked)">
      <div>
        <div class="exec-item-title">${escapeHtml(x.title)}</div>
        <div class="exec-item-meta">${escapeHtml(x.meta||"Planned")}</div>
      </div>
      <div class="exec-actions">
        <button type="button" onclick="execSetState(${i},'modified')">Modify</button>
        <button type="button" onclick="execSetState(${i},'skipped')">Skip</button>
      </div>
      <div class="exec-state">${(x.status||"planned").toUpperCase()}</div>
    </div>`).join("");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function execToggle(i,checked){const all=execGetDay(),day=all[execDateKey()];day.items[i].status=checked?"complete":"planned";execWrite(all);execRender()}
function execSetState(i,state){const all=execGetDay(),day=all[execDateKey()];day.items[i].status=state;execWrite(all);execRender()}
document.addEventListener("DOMContentLoaded",()=>{setTimeout(execRender,0)});
