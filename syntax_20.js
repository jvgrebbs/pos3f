
/* PERSONAL OS 2.0 — DOMAIN PAGE CONTROLLER */
const POS_DOMAIN_PAGES=["home","fitness","nutrition","education","tasks","progress"];
function posDomainSwitch(domain){
  document.querySelectorAll(".pos-domain-nav-btn,.pos-domain-bottom-btn").forEach(b=>b.classList.toggle("active",b.dataset.domain===domain));
  document.querySelectorAll(".pos-domain-page").forEach(x=>x.classList.remove("active"));
  const el=document.getElementById("posDomain"+domain.charAt(0).toUpperCase()+domain.slice(1));
  if(el)el.classList.add("active");
  posDomainRender(domain);
}
function posDomainItems(){
  return typeof posPlannedActivities==="function"?posPlannedActivities(selected):[];
}
function posDomainStatus(s){return s==="complete"?'<span class="pos-domain-chip good">DONE</span>':'<span class="pos-domain-chip">PLANNED</span>'}
document.addEventListener("click",e=>{
  const b=e.target.closest(".pos-domain-nav-btn,.pos-domain-bottom-btn");
  if(b)posDomainSwitch(b.dataset.domain);
});

function posDomainRenderHome(){
  const items=posDomainItems(),done=items.filter(x=>x.status==="complete").length,pct=items.length?Math.round(done/items.length*100):0,next=items.find(x=>x.status!=="complete");
  document.getElementById("domainHomeDate").textContent=posDateLabel(selected);
  document.getElementById("domainHomeExec").textContent=pct+"%";
  document.getElementById("domainHomeComplete").textContent=done+"/"+items.length;
  document.getElementById("domainHomeWeek").textContent="Week "+posWeek(selected);
  document.getElementById("domainHomeNext").innerHTML=next?
    `<div class="pos-domain-card"><div class="pos-domain-row"><div>${posEscape(next.time)}</div><div><div class="pos-domain-title-sm">${posEscape(next.title)}</div><div class="pos-domain-muted">${posEscape(next.domain)}</div></div><span class="pos-domain-chip">NEXT</span></div></div>`:
    "<div class='pos-domain-card'>All planned items complete.</div>";
  const domains=["Fitness","Nutrition","Education","Household"];
  document.getElementById("domainHomeDomains").innerHTML=domains.map(d=>{
    const a=items.filter(x=>x.domain===d),n=a.filter(x=>x.status==="complete").length;
    return `<div class="pos-domain-card" onclick="posDomainSwitch('${d==="Household"?"tasks":d.toLowerCase()}')"><div class="pos-domain-row"><div>${d}</div><div>${n}/${a.length} complete</div><span class="pos-domain-chip">${a.length?"OPEN":"NONE"}</span></div></div>`;
  }).join("");
}

function posDomainRenderFitness(){
  let weight="—",strength="—",run="—";
  try{
    const b=fitnessRead(BODY_ENGINE_KEY,{}),keys=Object.keys(b).sort();if(keys.length)weight=b[keys[keys.length-1]].weight+" lb";
    const s=fitnessRead(STRENGTH_ENGINE_KEY,{}),sets=Object.values(s).flatMap(x=>x.exercises||[]).flatMap(x=>x.sets||[]);if(sets.length)strength=Math.round(sets.reduce((a,x)=>a+x.weight*x.reps,0)).toLocaleString()+" lb";
    const r=fitnessRead(RUN_ENGINE_KEY,{}),dist=Object.values(r).reduce((a,x)=>a+(Number(x.distance)||0),0);if(dist)run=dist.toFixed(1)+" mi";
  }catch(e){}
  document.getElementById("domainWeight").textContent=weight;document.getElementById("domainStrength").textContent=strength;document.getElementById("domainRun").textContent=run;
  const items=posDomainItems().filter(x=>x.domain==="Fitness");
  document.getElementById("domainFitnessToday").innerHTML=items.length?items.map(x=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>${posEscape(x.time)}</div><div><div class="pos-domain-title-sm">${posEscape(x.title)}</div><div class="pos-domain-muted">Week ${posWeek(selected)}</div></div>${posDomainStatus(x.status)}</div></div>`).join(""):"<div class='pos-domain-card'>No fitness activity scheduled today.</div>";
  const w=posWeek(selected);
  document.getElementById("domainFitnessProgram").innerHTML=Array.from({length:12},(_,i)=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>Week ${i+1}</div><div><div class="pos-domain-title-sm">${i+1===w?"Current training week":"12-week strength & running program"}</div><div class="pos-domain-muted">Week ${i+1} • ${i+1===w?"ACTIVE":"PLANNED"}</div></div><span class="pos-domain-chip">${i+1===w?"NOW":"VIEW"}</span></div></div>`).join("");
}

function posDomainRenderNutrition(){
  const items=posDomainItems().filter(x=>x.domain==="Nutrition"),done=items.filter(x=>x.status==="complete").length;
  document.getElementById("domainNutWeek").textContent="Week "+posWeek(selected);
  document.getElementById("domainNutMeals").textContent=done+"/"+items.length;
  let dinner="—";try{dinner=nutDinner(posWeek(selected))}catch(e){}
  document.getElementById("domainNutDinner").textContent=dinner;
  document.getElementById("domainMealsToday").innerHTML=items.map(x=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>${posEscape(x.time)}</div><div><div class="pos-domain-title-sm">${posEscape(x.title)}</div><div class="pos-domain-muted">Week ${posWeek(selected)}</div></div>${posDomainStatus(x.status)}</div></div>`).join("");
  let r=POS2_RECIPES[dinner]||POS2_RECIPES["Chicken & Rice Bowls"];
  document.getElementById("domainGrocery").innerHTML=Object.entries(r).map(([g,a])=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>${g}</div><div>${a.map(posEscape).join("<br>")}</div><span class="pos-domain-chip">BUY</span></div></div>`).join("");
}

function posDomainRenderEducation(){
  const w=posWeek(selected),ed=eduRead(),done=Object.values(ed).filter(x=>x.complete).length;
  document.getElementById("domainEduWeek").textContent=w<=8?"Week "+w:"Complete";
  document.getElementById("domainEduComplete").textContent=Math.min(done,8)+"/8";
  const item=posDomainItems().find(x=>x.domain==="Education");
  document.getElementById("domainEduToday").innerHTML=item?`<div class="pos-domain-card"><div class="pos-domain-row"><div>60 min</div><div><div class="pos-domain-title-sm">Network+ Study</div><div class="pos-domain-muted">Week ${w} • 1 hour target</div></div>${posDomainStatus(item.status)}</div></div>`:"<div class='pos-domain-card'>No study session scheduled.</div>";
  const topics=["Networking Fundamentals","Network Implementations","Network Operations","Network Security","Network Troubleshooting","Network+ Review","Practice Exams","Final Review & Certification"];
  document.getElementById("domainEduRoadmap").innerHTML=topics.map((t,i)=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>Week ${i+1}</div><div><div class="pos-domain-title-sm">${t}</div><div class="pos-domain-muted">60 minutes/day</div></div><span class="pos-domain-chip">${i+1===w?"NOW":i+1<w?"DONE":"UPCOMING"}</span></div></div>`).join("");
}

function posDomainRenderTasks(){
  const items=posDomainItems().filter(x=>x.domain==="Household"),done=items.filter(x=>x.status==="complete").length;
  document.getElementById("domainTasksToday").innerHTML=items.length?items.map(x=>`<div class="pos-domain-card"><div class="pos-domain-row"><div>${posEscape(x.time)}</div><div><div class="pos-domain-title-sm">${posEscape(x.title)}</div><div class="pos-domain-muted">Household task</div></div>${posDomainStatus(x.status)}</div></div>`).join(""):"<div class='pos-domain-card'>No household tasks scheduled today.</div>";
  const monday=posSelectedWeekStart();
  let out="";
  for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(monday.getDate()+i),a=posPlannedActivities(d).filter(x=>x.domain==="Household");if(a.length)out+=`<div class="pos-domain-card"><div class="pos-domain-title-sm">${posDateLabel(d)}</div>${a.map(x=>`<div class="pos-domain-row"><div>${posEscape(x.time)}</div><div>${posEscape(x.title)}</div>${posDomainStatus(x.status)}</div>`).join("")}</div>`}
  document.getElementById("domainTasksWeek").innerHTML=out||"<div class='pos-domain-card'>No household tasks this week.</div>";
}

function posDomainRenderProgress(){
  const items=posDomainItems(),done=items.filter(x=>x.status==="complete").length,pct=items.length?Math.round(done/items.length*100):0;
  document.getElementById("domainProgressBody").innerHTML=`
    <div class="pos-domain-grid">
      <div class="pos-domain-stat"><div class="label">TODAY</div><strong>${pct}%</strong></div>
      <div class="pos-domain-stat"><div class="label">COMPLETED</div><strong>${done}/${items.length}</strong></div>
      <div class="pos-domain-stat"><div class="label">WEEK</div><strong>${posWeek(selected)}</strong></div>
    </div>
    ${["Fitness","Nutrition","Education","Household"].map(d=>{const a=items.filter(x=>x.domain===d),n=a.filter(x=>x.status==="complete").length,p=a.length?Math.round(n/a.length*100):0;return `<div class="pos-domain-card"><div class="pos-domain-title-sm">${d}</div><div class="pos-domain-muted">${n}/${a.length} complete</div><div class="pos-domain-progress"><div style="width:${p}%"></div></div></div>`}).join("")}`;
}
function posDomainRender(domain){
  if(domain==="home")posDomainRenderHome();
  if(domain==="fitness")posDomainRenderFitness();
  if(domain==="nutrition")posDomainRenderNutrition();
  if(domain==="education")posDomainRenderEducation();
  if(domain==="tasks")posDomainRenderTasks();
  if(domain==="progress")posDomainRenderProgress();
}
function posDomainRefreshAll(){POS_DOMAIN_PAGES.forEach(posDomainRender)}
document.addEventListener("DOMContentLoaded",()=>setTimeout(posDomainRefreshAll,400));
