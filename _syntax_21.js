
/* PERSONAL OS 2.0 — UI/UX REFINEMENT ENGINE */
function refineItems(){return typeof posPlannedActivities==="function"?posPlannedActivities(selected):[]}
function refineStatus(s){return s==="complete"?'<span class="refine-chip good">DONE</span>':'<span class="refine-chip">PLANNED</span>'}
function refineSwitch(view){
  document.querySelectorAll("[data-rview]").forEach(b=>b.classList.toggle("active",b.dataset.rview===view));
  document.querySelectorAll(".refine-page").forEach(x=>x.classList.remove("active"));
  const el=document.getElementById("refine"+view.charAt(0).toUpperCase()+view.slice(1));if(el)el.classList.add("active");
  refineRender(view);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-rview]");if(b)refineSwitch(b.dataset.rview)});
function refineRenderHome(){
 const a=refineItems(),d=a.filter(x=>x.status==="complete").length,p=a.length?Math.round(d/a.length*100):0,n=a.find(x=>x.status!=="complete");
 document.getElementById("refineDate").textContent=posDateLabel(selected);document.getElementById("rExec").textContent=p+"%";document.getElementById("rComplete").textContent=d+"/"+a.length;document.getElementById("rWeek").textContent="W"+posWeek(selected);document.getElementById("rNext").textContent=n?n.time:"Done";
 document.getElementById("rNextCard").innerHTML=n?`<div class="refine-card"><div class="refine-row"><div>${posEscape(n.time)}</div><div><div class="refine-small-title">${posEscape(n.title)}</div><div class="refine-muted">${posEscape(n.domain)}</div></div><span class="refine-chip">NEXT</span></div></div>`:"<div class='refine-card'>All planned items complete.</div>";
 document.getElementById("rTodayList").innerHTML=a.map(x=>`<div class="refine-card"><div class="refine-row"><div>${posEscape(x.time)}</div><div><div class="refine-small-title">${posEscape(x.title)}</div><div class="refine-muted">${posEscape(x.domain)}</div></div>${refineStatus(x.status)}</div></div>`).join("");
}
function refineFitness(){
 let w="—",s="—",r="—";try{const b=fitnessRead(BODY_ENGINE_KEY,{}),k=Object.keys(b).sort();if(k.length)w=b[k[k.length-1]].weight+" lb";const st=fitnessRead(STRENGTH_ENGINE_KEY,{}),sets=Object.values(st).flatMap(x=>x.exercises||[]).flatMap(x=>x.sets||[]);if(sets.length)s=Math.round(sets.reduce((a,x)=>a+x.weight*x.reps,0)).toLocaleString()+" lb";const rr=fitnessRead(RUN_ENGINE_KEY,{}),dist=Object.values(rr).reduce((a,x)=>a+(Number(x.distance)||0),0);if(dist)r=dist.toFixed(1)+" mi"}catch(e){}
 document.getElementById("rWeight").textContent=w;document.getElementById("rStrength").textContent=s;document.getElementById("rRun").textContent=r;
 const wk=posWeek(selected), names=["Foundation","Base Building","Progressive Overload","Strength + Endurance","Volume Build","Intensity Build","Peak Training","Deload / Test","Performance","Consolidation","Final Build","Completion"];
 document.getElementById("rFitnessRoadmap").innerHTML='<div class="refine-roadmap">'+Array.from({length:12},(_,i)=>`<div class="refine-week ${i+1===wk?"current":""}"><b>Week ${i+1}</b><span>${names[i]}</span></div>`).join("")+'</div>';
 const a=refineItems().filter(x=>x.domain==="Fitness");document.getElementById("rFitnessToday").innerHTML=a.length?a.map(x=>`<div class="refine-card"><div class="refine-row"><div>${posEscape(x.time)}</div><div><div class="refine-small-title">${posEscape(x.title)}</div><div class="refine-muted">Week ${wk}</div></div>${refineStatus(x.status)}</div></div>`).join(""):"<div class='refine-card'>No fitness session scheduled.</div>";
}
function refineNutrition(){
 const a=refineItems().filter(x=>x.domain==="Nutrition"),d=a.filter(x=>x.status==="complete").length;let dinner="—";try{dinner=nutDinner(posWeek(selected))}catch(e){}
 document.getElementById("rNutWeek").textContent="W"+posWeek(selected);document.getElementById("rNutMeals").textContent=d+"/"+a.length;document.getElementById("rDinner").textContent=dinner;
 document.getElementById("rMeals").innerHTML=a.map(x=>`<div class="refine-card"><div class="refine-meal"><div>${posEscape(x.time)}</div><div><div class="refine-small-title">${posEscape(x.title)}</div><div class="refine-muted">Nutrition</div></div>${refineStatus(x.status)}</div></div>`).join("");
 let rec=POS2_RECIPES[dinner]||POS2_RECIPES["Chicken & Rice Bowls"];document.getElementById("rGroceries").innerHTML=Object.entries(rec).map(([g,it])=>`<div class="refine-card"><div class="refine-row"><div>${g}</div><div>${it.map(posEscape).join("<br>")}</div><span class="refine-chip">BUY</span></div></div>`).join("");
}
function refineEducation(){
 const w=posWeek(selected),e=eduRead(),done=Object.values(e).filter(x=>x.complete).length;document.getElementById("rEduWeek").textContent=w<=8?"W"+w:"Done";document.getElementById("rEduComplete").textContent=Math.min(done,8)+"/8";
 const it=refineItems().find(x=>x.domain==="Education");document.getElementById("rEduToday").innerHTML=it?`<div class="refine-card"><div class="refine-row"><div>60m</div><div><div class="refine-small-title">Network+ Study</div><div class="refine-muted">Week ${w}</div></div>${refineStatus(it.status)}</div></div>`:"<div class='refine-card'>No study scheduled.</div>";
 const topics=["Networking Fundamentals","Network Implementations","Network Operations","Network Security","Troubleshooting","Review","Practice Exams","Final Review"];document.getElementById("rEduRoadmap").innerHTML=topics.map((t,i)=>`<div class="refine-card"><div class="refine-row"><div>Week ${i+1}</div><div><div class="refine-small-title">${t}</div><div class="refine-muted">60 min/day</div></div><span class="refine-chip">${i+1===w?"NOW":i+1<w?"DONE":"UPCOMING"}</span></div></div>`).join("");
}
function refineTasks(){
 const a=refineItems().filter(x=>x.domain==="Household");document.getElementById("rTasksToday").innerHTML=a.length?a.map(x=>`<div class="refine-card"><div class="refine-row"><div>${posEscape(x.time)}</div><div><div class="refine-small-title">${posEscape(x.title)}</div><div class="refine-muted">Household</div></div>${refineStatus(x.status)}</div></div>`).join(""):"<div class='refine-card'>No tasks scheduled.</div>";
 const m=posSelectedWeekStart();let out="";for(let i=0;i<7;i++){const d=new Date(m);d.setDate(m.getDate()+i);const q=posPlannedActivities(d).filter(x=>x.domain==="Household");if(q.length)out+=`<div class="refine-card"><div class="refine-small-title">${posDateLabel(d)}</div>${q.map(x=>`<div class="refine-row"><div>${posEscape(x.time)}</div><div>${posEscape(x.title)}</div>${refineStatus(x.status)}</div>`).join("")}</div>`}document.getElementById("rTasksWeek").innerHTML=out||"<div class='refine-card'>No household tasks this week.</div>";
}
function refineProgress(){
 const a=refineItems(),d=a.filter(x=>x.status==="complete").length,p=a.length?Math.round(d/a.length*100):0;document.getElementById("rProgress").innerHTML=`<div class="refine-grid-3"><div class="refine-kpi"><label>TODAY</label><strong>${p}%</strong></div><div class="refine-kpi"><label>COMPLETE</label><strong>${d}/${a.length}</strong></div><div class="refine-kpi"><label>WEEK</label><strong>${posWeek(selected)}</strong></div></div>`+["Fitness","Nutrition","Education","Household"].map(x=>{const q=a.filter(y=>y.domain===x),n=q.filter(y=>y.status==="complete").length,z=q.length?Math.round(n/q.length*100):0;return `<div class="refine-card"><div class="refine-small-title">${x}</div><div class="refine-muted">${n}/${q.length} complete</div><div class="refine-progress"><div style="width:${z}%"></div></div></div>`}).join("");
}
function refineRender(v){if(v==="home")refineRenderHome();if(v==="fitness")refineFitness();if(v==="nutrition")refineNutrition();if(v==="education")refineEducation();if(v==="tasks")refineTasks();if(v==="progress")refineProgress()}
function refineRefresh(){POS_DOMAIN_PAGES.forEach(refineRender)}
function refineQuickOpen(){const c=document.getElementById("refineDrawerContent");c.innerHTML='<h2>Quick Add</h2><div class="refine-actions"><button onclick="refineCloseDrawer();v2Quick(\'weight\')">Weight</button><button onclick="refineCloseDrawer();v2Quick(\'strength\')">Strength</button><button onclick="refineCloseDrawer();v2Quick(\'run\')">Run</button><button onclick="refineCloseDrawer();v2Quick(\'meal\')">Meal</button><button onclick="refineCloseDrawer();v2Quick(\'study\')">Study</button></div>';document.getElementById("refineDrawer").classList.add("open")}
function refineCloseDrawer(){document.getElementById("refineDrawer").classList.remove("open")}
function refineOpenWorkout(){refineQuickOpen();const c=document.getElementById("refineDrawerContent");c.innerHTML='<h2>Today’s Strength Workout</h2><div class="refine-muted">Set-by-set capture</div><div id="refineWorkoutSets"></div><button style="margin-top:9px" onclick="refineSaveWorkout()">Save Workout</button>';refineBuildWorkout()}
function refineBuildWorkout(){const box=document.getElementById("refineWorkoutSets");if(!box)return;const ex=["Squat","Bench Press","Row","Romanian Deadlift"];box.innerHTML=ex.map((n,i)=>`<div class="refine-workout"><div class="refine-workout-head"><strong>${n}</strong><span class="refine-chip">Set ${i+1}</span></div><div class="refine-set"><div>#1</div><div><span class="refine-field-label">WEIGHT</span><input id="rw${i}w" type="number"></div><div><span class="refine-field-label">REPS</span><input id="rw${i}r" type="number"></div><button onclick="this.parentElement.remove()">✓</button></div></div>`).join("")}
async function refineSaveWorkout(){for(let i=0;i<4;i++){const w=Number(document.getElementById("rw"+i+"w")?.value),r=Number(document.getElementById("rw"+i+"r")?.value);if(w&&r)await pos2Put({id:"refined-strength:"+iso(selected)+":"+i,domain:"fitness",type:"strengthSet",date:iso(selected),exercise:["Squat","Bench Press","Row","Romanian Deadlift"][i],weight:w,reps:r,volume:w*r,updatedAt:new Date().toISOString()})}refineCloseDrawer();refineRefresh()}
document.addEventListener("DOMContentLoaded",()=>setTimeout(refineRefresh,500));
