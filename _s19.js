
/* PERSONAL OS 2.0 UI CONTROLLER */
function posUISwitch(view){
  document.querySelectorAll(".pos-ui-nav-btn,.pos-ui-bottom-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelectorAll(".pos-ui-view").forEach(v=>v.classList.remove("active"));
  const el=document.getElementById("posUIView"+view.charAt(0).toUpperCase()+view.slice(1));
  if(el)el.classList.add("active");
  if(view==="today")posUIRenderToday();
  if(view==="plan")posUIRenderPlan();
  if(view==="execute")posUIRenderExecute();
  if(view==="progress")posUIRenderProgress();
}
function posUIToggleMore(){document.getElementById("posUIMore").classList.toggle("open")}
function posUIToday(){selected=new Date();selected.setHours(12,0,0,0);posUIRefresh();posUISwitch("today")}
document.addEventListener("click",e=>{
  const b=e.target.closest(".pos-ui-nav-btn,.pos-ui-bottom-btn");
  if(b)posUISwitch(b.dataset.view);
});
function posUIItems(){return typeof posPlannedActivities==="function"?posPlannedActivities(selected):[]}
function posUIStatus(s){return s==="complete"?'<span class="pos-ui-chip good">DONE</span>':'<span class="pos-ui-chip">PLANNED</span>'}
function posUIRenderToday(){
  const items=posUIItems(),done=items.filter(x=>x.status==="complete").length,pct=items.length?Math.round(done/items.length*100):0;
  const next=items.find(x=>x.status!=="complete");
  document.getElementById("posUIDate").textContent=posDateLabel(selected);
  document.getElementById("uiExec").textContent=pct+"%";
  document.getElementById("uiComplete").textContent=done+"/"+items.length;
  document.getElementById("uiWeek").textContent="W"+posWeek(selected);
  document.getElementById("uiNextShort").textContent=next?next.time:"Done";
  document.getElementById("uiNext").innerHTML=next?
    `<div class="pos-ui-next"><div class="pos-ui-next-time">${posEscape(next.time)}</div><div><div class="pos-ui-next-title">${posEscape(next.title)}</div><div class="pos-ui-next-meta">${posEscape(next.domain)}</div></div><div class="pos-ui-next-arrow">›</div></div>`:
    `<div class="pos-ui-next"><div class="pos-ui-next-time">DONE</div><div><div class="pos-ui-next-title">All planned items complete</div><div class="pos-ui-next-meta">Great work.</div></div><div>✓</div></div>`;
  document.getElementById("uiTasks").innerHTML=items.map(x=>`<div class="pos-ui-task"><input type="checkbox" ${x.status==="complete"?"checked":""} onchange="posUIToggleTask('${posEscape(x.title)}',this.checked)"><div><div class="pos-ui-task-title">${posEscape(x.title)}</div><div class="pos-ui-task-meta">${posEscape(x.time)} • ${posEscape(x.domain)}</div></div>${posUIStatus(x.status)}</div>`).join("");
  const fitness=items.filter(x=>x.domain==="Fitness"),nutrition=items.filter(x=>x.domain==="Nutrition"),edu=items.filter(x=>x.domain==="Education"),home=items.filter(x=>x.domain==="Household");
  document.getElementById("uiFitness").textContent=fitness.length?`${fitness.filter(x=>x.status==="complete").length}/${fitness.length} complete`:"No fitness item";
  document.getElementById("uiNutrition").textContent=nutrition.length?`${nutrition.filter(x=>x.status==="complete").length}/${nutrition.length} complete`:"No meal";
  document.getElementById("uiEducation").textContent=edu.length?`${edu.filter(x=>x.status==="complete").length}/${edu.length} complete`:"No study";
  document.getElementById("uiHousehold").textContent=home.length?`${home.filter(x=>x.status==="complete").length}/${home.length} complete`:"No chore";
}
function posUIToggleTask(title,checked){
  try{const all=execGetDay(),day=all[execDateKey()],item=day.items.find(x=>x.title===title);
    if(item){item.status=checked?"complete":"planned";execWrite(all)}
  }catch(e){}
  posUIRefresh();
}
function posUIRenderPlan(){
  const monday=posSelectedWeekStart(),box=document.getElementById("uiCalendar");
  let out='<div class="pos2-calendar">';
  for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(monday.getDate()+i);const key=posDateKey(d);
    out+=`<div class="pos2-calday ${key===posDateKey(selected)?"sel":""}" onclick="posUISelectDate('${key}')"><b>${d.toLocaleDateString(undefined,{weekday:"short"})} ${d.getDate()}</b><span>${posPlannedActivities(d).length} planned</span></div>`;
  }
  box.innerHTML=out+'</div>';
  document.getElementById("uiPlanDate").textContent=posDateLabel(selected);
  document.getElementById("uiPlanTasks").innerHTML=posUIItems().map(x=>`<div class="pos-ui-task"><div></div><div><div class="pos-ui-task-title">${posEscape(x.title)}</div><div class="pos-ui-task-meta">${posEscape(x.time)} • ${posEscape(x.domain)}</div></div><span class="pos-ui-chip">PLAN</span></div>`).join("");
}
function posUISelectDate(key){selected=new Date(key+"T12:00:00");posUIRefresh();posUISwitch("plan")}
function posUIRenderExecute(){
  const items=posUIItems(),box=document.getElementById("uiExecuteTasks");
  box.innerHTML=items.map(x=>`<div class="pos-ui-task"><input type="checkbox" ${x.status==="complete"?"checked":""} onchange="posUIToggleTask('${posEscape(x.title)}',this.checked)"><div><div class="pos-ui-task-title">${posEscape(x.title)}</div><div class="pos-ui-task-meta">${posEscape(x.time)} • ${posEscape(x.domain)}</div></div>${posUIStatus(x.status)}</div>`).join("");
}
function posUIRenderProgress(){
  const box=document.getElementById("uiProgress");if(!box)return;
  let weight="—",strength="—",run="—",study=0,nut=0;
  try{
    const b=fitnessRead(BODY_ENGINE_KEY,{}),bk=Object.keys(b).sort();if(bk.length)weight=b[bk[bk.length-1]].weight+" lb";
    const s=fitnessRead(STRENGTH_ENGINE_KEY,{}),ss=Object.values(s).flatMap(x=>x.exercises||[]).flatMap(x=>x.sets||[]);if(ss.length)strength=Math.round(ss.reduce((a,x)=>a+x.weight*x.reps,0)).toLocaleString()+" lb";
    const r=fitnessRead(RUN_ENGINE_KEY,{}),rd=Object.values(r).reduce((a,x)=>a+(Number(x.distance)||0),0);if(rd)run=rd.toFixed(1)+" mi";
    const e=eduRead(),ed=Object.values(e).filter(x=>x.complete).length;study=Math.round(ed/8*100);
    const n=nutRead(NUTRITION_KEY,{}),nd=Object.values(n).reduce((a,x)=>a+Object.values(x.completed||{}).filter(Boolean).length,0),nt=Math.max(1,Object.keys(n).length*3);nut=Math.round(nd/nt*100);
  }catch(e){}
  box.innerHTML=`
    <div class="pos-ui-grid">
      <div class="pos-ui-module"><h3>Weight</h3><div class="pos-ui-hero-title" style="font-size:20px">${weight}</div></div>
      <div class="pos-ui-module"><h3>Strength Volume</h3><div class="pos-ui-hero-title" style="font-size:20px">${strength}</div></div>
      <div class="pos-ui-module"><h3>Running</h3><div class="pos-ui-hero-title" style="font-size:20px">${run}</div></div>
      <div class="pos-ui-module"><h3>Network+</h3><div class="pos-ui-hero-title" style="font-size:20px">${study}%</div></div>
    </div>
    <div class="pos-ui-section">
      <div class="pos-ui-section-title"><h2>Adherence</h2></div>
      <div class="pos-ui-task"><div></div><div><div class="pos-ui-task-title">Network+</div><div class="pos-ui-task-meta">8-week certification plan</div></div><span class="pos-ui-chip">${study}%</span></div>
      <div class="pos-ui-task"><div></div><div><div class="pos-ui-task-title">Nutrition</div><div class="pos-ui-task-meta">Meal completion</div></div><span class="pos-ui-chip">${nut}%</span></div>
    </div>`;
}
function posUIRefresh(){
  try{posUIRenderToday()}catch(e){}
  try{posUIRenderPlan()}catch(e){}
  try{posUIRenderExecute()}catch(e){}
  try{posUIRenderProgress()}catch(e){}
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(posUIRefresh,250));
