
/* PERSONAL OS CLEAN UI — EXECUTE / MANAGE SEPARATION */
(function(){
 const nav=[
  ["today","Today","▣"],["fitness","Fitness","◆"],["nutrition","Nutrition","●"],
  ["education","Education","▤"],["tasks","Tasks","✓"],["progress","Progress","◒"]
 ];
 let view="today";

 function d(){try{return typeof selected!=="undefined"?selected:new Date()}catch(e){return new Date()}}
 function week(){try{return typeof pos23Week==="function"?pos23Week(d()):1}catch(e){return 1}}
 function label(){return d().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}
 function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
 function acts(){try{return typeof pos23ProgramsForDate==="function"?pos23ProgramsForDate(d()):[]}catch(e){return []}}
 async function recs(){try{const all=await pos2All();return all.filter(x=>x.date===iso(d())&&x.status==="complete")}catch(e){return []}}
 async function adherence(){try{return typeof pos24Adherence==="function"?await pos24Adherence(7):{rate:0}}catch(e){return {rate:0}}}

 function navRender(){
   document.getElementById("poscleanNav").innerHTML=nav.map(([id,t,i])=>`<button class="${view===id?"active":""}" onclick="poscleanShow('${id}')"><span class="posclean-icon">${i}</span>${t}</button>`).join("");
 }
 function header(title,sub,extra=""){
   return `<div class="posclean-header"><div><div class="posclean-title">${title}</div><div class="posclean-sub">${sub}</div></div>${extra}</div>`;
 }
 function statusRow(a,done){
   let meta="";
   if(a.type==="strength")meta=(a.items||[]).slice(0,2).map(x=>`${x.name} ${x.sets}×${x.reps}`).join(" • ");
   if(a.type==="run")meta=`${a.duration||"—"} min • ${a.intensity||"Run"}`;
   if(a.type==="meal")meta=(a.meals||[]).join(" • ");
   if(a.type==="study")meta=`${a.minutes||"—"} min • ${a.topic||"Study"}`;
   const icon={strength:"Strength",run:"Run",meal:"Meal",study:"Study"}[a.type]||a.type;
   const btn=a.type==="strength"?"pos21Quick('strength')":a.type==="run"?"pos21Quick('run')":a.type==="meal"?"pos21Quick('meal')":"pos21Quick('study')";
   return `<div class="posclean-agenda-row"><div class="posclean-time">${esc(icon)}</div><div><div class="posclean-item">${esc(a.name||a.program||icon)}</div><div class="posclean-meta">${esc(meta)}</div></div><div class="posclean-status ${done?"done":"next"}" onclick="${btn}">${done?"DONE":"START"}</div></div>`;
 }

 async function renderToday(){
   const main=document.getElementById("poscleanMain"),a=acts(),r=await recs();
   const complete=r.length, pct=a.length?Math.min(100,Math.round(complete/a.length*100)):0;
   const doneDomains=new Set(r.map(x=>x.domain));
   main.innerHTML=header("Today",`${label()} • Week ${week()}`)+
   `<div class="posclean-card posclean-agenda">
      <div class="posclean-agenda-head"><div>Area</div><div>Plan</div><div>Action</div></div>
      ${a.length?a.map(x=>statusRow(x,[...doneDomains].some(y=>String(y).toLowerCase().includes(String(x.domain||"").toLowerCase())))).join(""):`<div style="padding:28px;text-align:center;color:var(--pos-ui-muted)">Nothing scheduled today.</div>`}
    </div>
    <div class="posclean-kpis">
      <div class="posclean-kpi"><span>Planned</span><b>${a.length}</b></div>
      <div class="posclean-kpi"><span>Completed</span><b>${complete}</b></div>
      <div class="posclean-kpi"><span>Execution</span><b>${pct}%</b></div>
      <div class="posclean-kpi"><span>Week</span><b>${week()}</b></div>
    </div>
    <div class="posclean-section-label">Next</div>
    <button class="posclean-primary" onclick="poscleanStartNext()">Start Next Activity</button>`;
 }
 async function renderFitness(){
   const main=document.getElementById("poscleanMain"),a=acts().filter(x=>String(x.domain).toLowerCase()==="fitness"),r=await recs();
   const strength=a.find(x=>x.type==="strength"),run=a.find(x=>x.type==="run");
   main.innerHTML=header("Fitness",`${label()} • Week ${week()}`)+
   `<div class="posclean-domain">
     <div class="posclean-domain-card"><h3>Today's Workout</h3><p>${strength?esc(strength.name):"No strength workout scheduled."}</p>${strength?`<div class="posclean-section-label">Session</div><div class="posclean-meta">${esc((strength.items||[]).map(x=>`${x.name} ${x.sets}×${x.reps}`).join(" • "))}</div>`:""}<div style="margin-top:12px"><button class="posclean-primary" onclick="pos21Quick('strength')">Start Workout</button></div></div>
     <div class="posclean-domain-card"><h3>Running</h3><p>${run?esc(run.name):"No run scheduled."}</p>${run?`<div class="posclean-section-label">Target</div><div class="posclean-meta">${run.duration} min • ${esc(run.intensity)}</div>`:""}<div style="margin-top:12px"><button class="posclean-secondary" onclick="pos21Quick('run')">Log Run</button><button class="posclean-secondary" style="margin-left:5px" onclick="pos21Quick('weight')">Weight</button></div></div>
   </div>
   <div class="posclean-section-label">Adaptive</div><div class="posclean-card"><div class="posclean-meta">${r.filter(x=>x.domain==="fitness").length} fitness execution records today.</div><div style="margin-top:8px"><button class="posclean-secondary" onclick="pos24Open()">View Recommendations</button></div></div>`;
 }
 async function renderNutrition(){
   const main=document.getElementById("poscleanMain"),a=acts().find(x=>x.type==="meal");
   main.innerHTML=header("Nutrition",`${label()} • Week ${week()}`)+
   `<div class="posclean-card"><div class="posclean-section-label">Today's Meals</div><div class="posclean-item">${a?esc((a.meals||[]).join(" • ")):"No meal plan scheduled."}</div><div style="margin-top:14px"><button class="posclean-primary" onclick="pos21Quick('meal')">Log Meal</button></div></div>`;
 }
 async function renderEducation(){
   const main=document.getElementById("poscleanMain"),a=acts().find(x=>x.type==="study");
   main.innerHTML=header("Education",`${label()} • Week ${week()}`)+
   `<div class="posclean-card"><div class="posclean-section-label">Today's Study</div><div class="posclean-item">${a?esc(a.topic):"No study activity scheduled."}</div><div class="posclean-meta" style="margin-top:4px">${a?esc(a.minutes+" minutes • "+a.name):""}</div><div style="margin-top:14px"><button class="posclean-primary" onclick="pos21Quick('study')">Start Study</button></div></div>`;
 }
 async function renderTasks(){
   const main=document.getElementById("poscleanMain");
   main.innerHTML=header("Tasks",`${label()} • Focused task workspace`)+
   `<div class="posclean-card"><div class="posclean-section-label">Today</div><div class="posclean-item">Task execution</div><div class="posclean-meta" style="margin-top:4px">Keep the task workspace focused on completion rather than planning controls.</div><div style="margin-top:14px"><button class="posclean-secondary" onclick="pos21OpenCalendar()">Open Schedule</button></div></div>`;
 }
 async function renderProgress(){
   const main=document.getElementById("poscleanMain"),a=await adherence();
   main.innerHTML=header("Progress","Performance and adherence")+`
   <div class="posclean-kpis"><div class="posclean-kpi"><span>7-Day Execution</span><b>${a.rate}%</b></div><div class="posclean-kpi"><span>Records</span><b>${a.records||0}</b></div><div class="posclean-kpi"><span>Completed</span><b>${a.completed||0}</b></div><div class="posclean-kpi"><span>Week</span><b>${week()}</b></div></div>
   <div class="posclean-section-label">Adaptive</div><div class="posclean-card"><div class="posclean-item">Recommendations</div><div class="posclean-meta">Use actual performance to inform the next training decision.</div><div style="margin-top:12px"><button class="posclean-secondary" onclick="pos24Open()">Open Adaptive Engine</button></div></div>`;
 }

 async function render(){
   navRender();
   document.getElementById("poscleanContext").textContent=`${label()} • Week ${week()}`;
   if(view==="today")await renderToday();
   else if(view==="fitness")await renderFitness();
   else if(view==="nutrition")await renderNutrition();
   else if(view==="education")await renderEducation();
   else if(view==="tasks")await renderTasks();
   else await renderProgress();
 }
 window.poscleanShow=function(id){view=id;render()};
 window.poscleanStartNext=async function(){
   const a=acts()[0];if(!a){return}
   if(a.type==="strength")pos21Quick("strength");else if(a.type==="run")pos21Quick("run");else if(a.type==="meal")pos21Quick("meal");else if(a.type==="study")pos21Quick("study");
 };
 window.poscleanToggleStart=function(){document.getElementById("poscleanStart").classList.toggle("open")};
 window.poscleanOpenPrograms=function(){try{pos23Open()}catch(e){}};
 window.poscleanOpenData=function(){try{pos22OpenData()}catch(e){}};

 document.addEventListener("DOMContentLoaded",()=>{
   document.getElementById("poscleanFab").onclick=poscleanToggleStart;
   document.getElementById("poscleanStart").innerHTML=
     `<button onclick="pos21Quick('strength');poscleanToggleStart()">🏋 Start Workout</button>
      <button onclick="pos21Quick('run');poscleanToggleStart()">🏃 Start Run</button>
      <button onclick="pos21Quick('meal');poscleanToggleStart()">🍽 Log Meal</button>
      <button onclick="pos21Quick('study');poscleanToggleStart()">📚 Start Study</button>`;
   render();
 });
})();
