
/* PERSONAL OS 1.0 INTEGRATION ENGINE
   Unified navigation, master calendar, planning/execution separation,
   actual-vs-planned summaries, progress aggregation, and data hub. */

const POS_APP_V1={version:"1.0.0",programStart:"2026-08-17",programWeeks:12};
const POS_NAV_VIEWS=["today","plan","execute","progress","data"];

function posDateKey(d){return iso(new Date(d))}
function posDateLabel(d){return new Date(d).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}
function posWeek(d){
  const start=new Date(2026,7,17,12,0,0,0), cur=new Date(d); cur.setHours(12,0,0,0);
  return Math.max(1,Math.min(12,Math.floor((cur-start)/604800000)+1));
}
function posSelectedWeekStart(){
  const d=new Date(selected); d.setHours(12,0,0,0);
  const monday=new Date(d); const day=(monday.getDay()+6)%7; monday.setDate(monday.getDate()-day);
  return monday;
}
function posEscape(s){return escapeHtml?escapeHtml(String(s??"")):String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function posPlannedActivities(d){
  const key=posDateKey(d), w=posWeek(d), dow=new Date(d).getDay();
  const out=[];
  // Core daily nutrition schedule
  out.push({time:"07:00",title:"Breakfast",domain:"Nutrition",status:posMealStatus(key,"breakfast")});
  out.push({time:"12:00",title:"Lunch",domain:"Nutrition",status:posMealStatus(key,"lunch")});
  // Known evening dinner/meal-prep rule; Wednesday exception is preserved as no prep.
  if(dow!==3) out.push({time:"17:30",title:"Meal Prep",domain:"Nutrition",status:"planned"});
  out.push({time:"18:00",title:"Dinner",domain:"Nutrition",status:posMealStatus(key,"dinner")});
  // Household schedule established earlier.
  const chores={1:"Bathrooms",2:"Master Bedroom",4:"Kitchen & Dining Room",5:"Living Room & Office"};
  if(chores[dow]) out.push({time:"18:30",title:chores[dow],domain:"Household",status:posExecStatus(key,chores[dow])});
  if(dow===3) out.push({time:"16:00",title:"Sweep",domain:"Household",status:posExecStatus(key,"Sweep")});
  if(dow===6) out.push({time:"10:00",title:"Sweep & Mop",domain:"Household",status:posExecStatus(key,"Sweep & Mop")});
  // Network+ 1 hour/day during first 8 weeks.
  if(w<=8) out.push({time:"Study",title:"Network+ Study",domain:"Education",status:posEduStatus(w)});
  // Fitness plan markers.
  if(dow===6) out.push({time:"08:00",title:"Saturday Strength Training",domain:"Fitness",status:posExecStatus(key,"Saturday Strength Training")});
  if(dow!==0 && dow!==6) out.push({time:"Fitness",title:"Scheduled Fitness",domain:"Fitness",status:"planned"});
  return out.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
}
function posExecStatus(key,title){
  try{
    const all=execRead(), day=all[key];
    const item=day&&day.items&&day.items.find(x=>x.title===title);
    return item?(item.status||"planned"):"planned";
  }catch(e){return "planned"}
}
function posMealStatus(key,id){
  try{const x=nutRead(NUTRITION_KEY,{})[key];return x&&x.completed&&x.completed[id]?"complete":"planned"}catch(e){return "planned"}
}
function posEduStatus(w){
  try{return eduRead()[w]?.complete?"complete":"planned"}catch(e){return "planned"}
}

function posRenderNavView(view){
  document.querySelectorAll(".pos-nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.posview===view));
  document.querySelectorAll(".pos-view").forEach(v=>v.classList.remove("active"));
  const target=document.getElementById("posView"+view.charAt(0).toUpperCase()+view.slice(1));
  if(target)target.classList.add("active");
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".pos-nav-btn");
  if(b)posRenderNavView(b.dataset.posview);
});

function posRenderToday(){
  const box=document.getElementById("integratedToday"); if(!box)return;
  const items=posPlannedActivities(selected), done=items.filter(x=>x.status==="complete").length;
  const pct=items.length?Math.round(done/items.length*100):0;
  box.innerHTML=`
    <div class="fitness-grid" style="margin-top:10px">
      <div class="fitness-stat"><div class="small">Date</div><strong>${posDateLabel(selected)}</strong></div>
      <div class="fitness-stat"><div class="small">Week</div><strong>Week ${posWeek(selected)}</strong></div>
      <div class="fitness-stat"><div class="small">Execution</div><strong>${pct}%</strong></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    ${items.map(x=>`<div class="plan-row"><div class="plan-time">${posEscape(x.time)}</div><div><div class="plan-title">${posEscape(x.title)}</div><div class="plan-meta">${posEscape(x.domain)}</div></div><div class="exec-state">${x.status.toUpperCase()}</div></div>`).join("")}`;
}

function posRenderPlan(){
  const d=new Date(selected),week=posWeek(d),box=document.getElementById("planActivities");
  document.getElementById("planDate").textContent=posDateLabel(d);
  document.getElementById("planWeek").textContent="Week "+week;
  const items=posPlannedActivities(d); document.getElementById("planCount").textContent=items.length;
  box.innerHTML=items.map(x=>`<div class="plan-row"><div class="plan-time">${posEscape(x.time)}</div><div><div class="plan-title">${posEscape(x.title)}</div><div class="plan-meta">${posEscape(x.domain)}</div></div><div class="exec-state">${x.status.toUpperCase()}</div></div>`).join("");
  posRenderCalendar();
}
function posRenderCalendar(){
  const box=document.getElementById("masterCalendar"); if(!box)return;
  const monday=posSelectedWeekStart();
  let out=`<div class="master-calendar">`;
  for(let i=0;i<7;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const key=posDateKey(d), selectedCls=key===posDateKey(selected)?" selected":"";
    const todayCls=key===posDateKey(new Date())?" today":"";
    const count=posPlannedActivities(d).length;
    out+=`<div class="cal-day${selectedCls}${todayCls}" onclick="posSelectDate('${key}')"><div class="cal-day-num">${d.getDate()} ${d.toLocaleDateString(undefined,{weekday:"short"})}</div><div class="cal-day-meta">${count} planned</div></div>`;
  }
  out+="</div>";
  box.innerHTML=out;
}
function posSelectDate(key){
  selected=new Date(key+"T12:00:00");
  render();
  posRefreshIntegrated();
}
function posRenderExecute(){
  const box=document.getElementById("integratedExecute");if(!box)return;
  const items=posPlannedActivities(selected),done=items.filter(x=>x.status==="complete").length;
  box.innerHTML=`
    <div class="progress-row"><div>Execution</div><div class="progress-mini"><div style="width:${items.length?done/items.length*100:0}%"></div></div><strong>${items.length?Math.round(done/items.length*100):0}%</strong></div>
    ${items.map((x,i)=>`<div class="plan-row"><div class="plan-time">${posEscape(x.time)}</div><div><div class="plan-title">${posEscape(x.title)}</div><div class="plan-meta">${posEscape(x.domain)}</div></div><div class="exec-state">${x.status.toUpperCase()}</div></div>`).join("")}`;
}
function posRenderProgress(){
  const box=document.getElementById("integratedProgress");if(!box)return;
  let weight="—",strength="—",run="—",study="0%",meals="0%";
  try{
    const b=fitnessRead(BODY_ENGINE_KEY,{}), keys=Object.keys(b).sort(); if(keys.length)weight=b[keys[keys.length-1]].weight+" lb";
    const s=fitnessRead(STRENGTH_ENGINE_KEY,{}), sets=Object.values(s).flatMap(x=>x.exercises||[]).flatMap(x=>x.sets||[]); if(sets.length)strength=Math.round(sets.reduce((a,x)=>a+(x.weight*x.reps),0)).toLocaleString()+" lb";
    const r=fitnessRead(RUN_ENGINE_KEY,{}), dist=Object.values(r).reduce((a,x)=>a+(Number(x.distance)||0),0); if(dist)run=dist.toFixed(1)+" mi";
    const ed=eduRead(), done=Object.values(ed).filter(x=>x.complete).length; study=Math.round(done/8*100)+"%";
    const nd=nutRead(NUTRITION_KEY,{}), mealDone=Object.values(nd).reduce((a,x)=>a+Object.values(x.completed||{}).filter(Boolean).length,0), mealTotal=Math.max(1,Object.keys(nd).length*3); meals=Math.round(mealDone/mealTotal*100)+"%";
  }catch(e){}
  box.innerHTML=`
    <div class="fitness-grid" style="margin-top:10px">
      <div class="fitness-stat"><div class="small">Weight</div><strong>${weight}</strong></div>
      <div class="fitness-stat"><div class="small">Strength Volume</div><strong>${strength}</strong></div>
      <div class="fitness-stat"><div class="small">Run Distance</div><strong>${run}</strong></div>
    </div>
    <div class="progress-row"><div>Network+</div><div class="progress-mini"><div style="width:${parseInt(study)}%"></div></div><strong>${study}</strong></div>
    <div class="progress-row"><div>Nutrition</div><div class="progress-mini"><div style="width:${parseInt(meals)}%"></div></div><strong>${meals}</strong></div>`;
}
function posRenderData(){
  const box=document.getElementById("integratedData");if(!box)return;
  const meta=posGetBackupMeta?posGetBackupMeta():{}, q=syncReadQueue?syncReadQueue():[];
  box.innerHTML=`
    <div class="fitness-grid" style="margin-top:10px">
      <div class="fitness-stat"><div class="small">Backup</div><strong>${meta.createdAt?"Ready":"Not created"}</strong></div>
      <div class="fitness-stat"><div class="small">Sync Queue</div><strong>${q.length}</strong></div>
      <div class="fitness-stat"><div class="small">Provider</div><strong>${syncReadMeta?syncReadMeta().provider||"Local": "Local"}</strong></div>
    </div>
    <div class="engine-note">Data remains local-first. Backup and sync controls remain available below.</div>`;
}
function posRefreshIntegrated(){
  try{posRenderToday()}catch(e){}
  try{posRenderPlan()}catch(e){}
  try{posRenderExecute()}catch(e){}
  try{posRenderProgress()}catch(e){}
  try{posRenderData()}catch(e){}
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(posRefreshIntegrated,150));
