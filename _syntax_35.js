
/* PERSONAL OS 3.0 — UNIFIED STATE ENGINE
   Model:
   PROGRAM = intended outcome
   SCHEDULE = when it should occur
   EXECUTION = what happened
   HISTORY = immutable record
   STATE = current synthesized position
   ADAPTATION = recommended next decision
*/
(function(){
  const STATE_VERSION="3.0.0";
  const STATE_KEY="pos:state:3.0";
  const SETTINGS_KEY="pos:settings:3.0";
  // 3.0 owns the selected calendar date. This avoids relying on the
  // legacy 2.x date-navigation DOM, which is intentionally hidden in 3.0.
  const DATE_KEY="pos:selectedDate:3.0";
  const DATE_MODE_KEY="pos:dateDisplayMode";
  let dateDisplayMode=localStorage.getItem(DATE_MODE_KEY)||"day";
  let selectedDateValue=(function(){
    const saved=localStorage.getItem(DATE_KEY);
    const d=saved?new Date(saved):new Date();
    return isNaN(d.getTime())?new Date():d;
  })();

  function normalizeDate(d){
    const x=new Date(d);
    x.setHours(12,0,0,0);
    return x;
  }
  selectedDateValue=normalizeDate(selectedDateValue);

  function canonicalAppDate(){
    try{
      if(window.POS3Core && typeof window.POS3Core.getDate==="function"){
        return normalizeDate(window.POS3Core.getDate());
      }
    }catch(e){}
    return normalizeDate(selectedDateValue);
  }

  function syncSelectedDate(){
    try{selected=canonicalAppDate()}catch(e){}
  }
  syncSelectedDate();

  function dateIsToday(){
    const d=canonicalAppDate(),n=new Date();
    return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();
  }
  function dateLabel(){
    const d=canonicalAppDate();
    if(dateDisplayMode==="date")
      return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    return d.toLocaleDateString(undefined,{weekday:"long"});
  }
  function dateContext(){
    return canonicalAppDate().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric",year:"numeric"});
  }
  function setAppDate(d){
    const next=normalizeDate(d);
    if(window.POS3Core && typeof window.POS3Core.setDate==="function"){
      window.POS3Core.setDate(next,"date-navigation");
      return;
    }
    selectedDateValue=next;
    try{localStorage.setItem(DATE_KEY,next.toISOString())}catch(e){Core.diagnostics.record("date-storage-write",e)}
    syncSelectedDate();
    if(typeof window.pos30SyncDateAcrossApp==="function"){
      try{window.pos30SyncDateAcrossApp(next)}catch(e){}
    }
    render();
  }
  function shiftAppDate(days){
    if(window.POS3Core && typeof window.POS3Core.moveDate==="function"){
      window.POS3Core.moveDate(Number(days)||0);
      return;
    }
    const d=canonicalAppDate();
    d.setDate(d.getDate()+days);
    setAppDate(d);
  }
  function dateNavigator(){
    return `<div class="pos30-datebar">
      <button aria-label="Previous day" onclick="pos30PreviousDay()">‹</button>
      <div class="pos30-date-label">${dateLabel()}</div>
      <div class="pos30-date-toggle" aria-label="Date display mode">
        <button class="${dateDisplayMode==="day"?"active":""}" onclick="pos30SetDateMode('day')">DAY</button>
        <button class="${dateDisplayMode==="date"?"active":""}" onclick="pos30SetDateMode('date')">DATE</button>
      </div>
      <button class="pos30-today ${dateIsToday()?"current":""}" onclick="pos30GoToday()" ${dateIsToday()?"disabled":""}>TODAY</button>
      <button aria-label="Next day" onclick="pos30NextDay()">›</button>
    </div>`;
  }

  let currentView="today";
  let startOpen=false;

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function selectedDate(){return canonicalAppDate()}
  function dateKey(){try{return iso(selectedDate())}catch(e){return new Date().toISOString().slice(0,10)}}
  function dayLabel(){return selectedDate().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}
  function week(){try{return typeof pos23Week==="function"?pos23Week(selectedDate()):1}catch(e){return 1}}
  async function allRecords(){try{return await pos2All()}catch(e){return []}}
  async function executionsForDate(){const a=await allRecords();return a.filter(x=>x.date===dateKey())}
  function plansForDate(){try{return typeof pos23ProgramsForDate==="function"?pos23ProgramsForDate(selectedDate()):[]}catch(e){return []}}

  async function buildState(){
    const records=await allRecords();
    const todayRecords=records.filter(x=>x.date===dateKey());
    const complete=todayRecords.filter(x=>x.status==="complete").length;
    const planned=plansForDate();
    const domains=["fitness","nutrition","education","tasks"];
    const byDomain={};
    domains.forEach(d=>byDomain[d]={
      planned:planned.filter(x=>String(x.domain||"").toLowerCase()===d).length,
      complete:todayRecords.filter(x=>String(x.domain||"").toLowerCase()===d&&x.status==="complete").length
    });
    let adherence={rate:0,records:0,completed:0};
    try{adherence=await pos24Adherence(7)}catch(e){}
    return {
      version:STATE_VERSION,date:dateKey(),week:week(),day:dayLabel(),
      today:{planned:planned.length,completed:complete,rate:planned.length?Math.min(100,Math.round(complete/planned.length*100)):0},
      domains:byDomain,adherence,
      active:records.filter(x=>x.status==="in_progress").sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")))[0]||null,
      generatedAt:new Date().toISOString()
    };
  }

  async function persistState(state){
    localStorage.setItem(STATE_KEY,JSON.stringify(state));
    try{await pos2Put({id:"state:"+state.date,type:"stateSnapshot",domain:"system",date:state.date,status:"current",state,schemaVersion:3,updatedAt:state.generatedAt})}catch(e){}
    return state;
  }

  function activityStatus(a,records){
    const domain=String(a.domain||"").toLowerCase();
    const matching=records.filter(r=>String(r.domain||"").toLowerCase()===domain);
    if(matching.some(r=>r.status==="complete"))return "done";
    if(matching.some(r=>r.status==="in_progress"))return "current";
    return "next";
  }

  function activityMeta(a){
    if(a.type==="strength")return (a.items||[]).slice(0,2).map(x=>`${x.name} ${x.sets}×${x.reps}`).join(" • ");
    if(a.type==="run")return `${a.duration||"—"} min • ${a.intensity||"Run"}`;
    if(a.type==="meal")return (a.meals||[]).join(" • ");
    if(a.type==="study")return `${a.minutes||"—"} min • ${a.topic||"Study"}`;
    return a.description||"Scheduled activity";
  }

  function eventAction(a){
    if(a.type==="strength")return "pos30Start('strength')";
    if(a.type==="run")return "pos30Start('run')";
    if(a.type==="meal")return "pos30Start('meal')";
    if(a.type==="study")return "pos30Start('study')";
    return "";
  }

  async function renderToday(){
    const main=document.getElementById("pos30Main"),state=await persistState(await buildState()),records=await executionsForDate(),plans=plansForDate();
    const rows=plans.map(a=>{const s=activityStatus(a,records);return `<div class="pos3-row"><div><div class="pos3-dot ${s}"></div><div style="font-size:8px;color:var(--pos3-muted);text-align:center">${s==="done"?"✓":s==="current"?"NOW":"→"}</div></div><div class="pos3-event ${s==="current"?"current":""}" onclick="${eventAction(a)}"><div class="pos3-event-title">${esc(a.name||a.program||a.type)}</div><div class="pos3-event-meta">${esc(activityMeta(a))}</div><div class="pos3-actions"><span class="pos3-pill ${s==="done"?"green":"blue"}">${s.toUpperCase()}</span>${s!=="done"?`<button class="pos3-primary" onclick="event.stopPropagation();${eventAction(a)}">Start</button>`:""}</div></div></div>`}).join("");
    const active=state.active;
    main.innerHTML=`
      <div class="pos3-header">
        <div><div class="pos3-title">Today</div><div class="pos3-sub">${esc(dayLabel())} • Week ${state.week}</div>
          <div class="pos3-statebar"><span class="pos3-pill blue">STATE ${STATE_VERSION}</span><span class="pos3-pill">${state.today.completed}/${state.today.planned} complete</span><span class="pos3-pill">${state.adherence.rate}% 7-day execution</span></div>
        </div>
        <div class="pos3-manage"><button onclick="pos30OpenPrograms()">Programs</button><button onclick="pos30OpenData()">Data</button></div>
      </div>
      ${dateNavigator()}
      <div class="pos3-kpis">
        <div class="pos3-kpi"><span>Planned</span><b>${state.today.planned}</b></div>
        <div class="pos3-kpi"><span>Complete</span><b>${state.today.completed}</b></div>
        <div class="pos3-kpi"><span>Today</span><b>${state.today.rate}%</b></div>
        <div class="pos3-kpi"><span>Week</span><b>${state.week}</b></div>
      </div>
      <div class="pos3-section">My Day</div>
      <div class="pos3-command">
        <div class="pos3-card"><div class="pos3-section" style="margin-top:0">Daily Planner</div>
          <div class="pos3-timeline">${rows||`<div style="padding:25px;text-align:center;color:var(--pos3-muted)">Nothing scheduled for this date.</div>`}</div>
        </div>
        <div>
          <div class="pos3-card">
            <div class="pos3-section" style="margin-top:0">Current State</div>
            <div class="pos3-item">${active?esc(active.type||"Activity"):"Ready"}</div>
            <div class="pos3-event-meta">${active?"An activity is currently in progress.":"No activity is currently in progress."}</div>
            <div class="pos3-actions"><button class="pos3-primary" onclick="pos30StartNext()">Start Next</button></div>
          </div>
          <div class="pos3-card">
            <div class="pos3-section" style="margin-top:0">Execution</div>
            ${Object.entries(state.domains).map(([d,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--pos3-line);font-size:9px"><span>${d[0].toUpperCase()+d.slice(1)}</span><b>${v.complete}/${v.planned}</b></div>`).join("")}
          </div>
          <div class="pos3-card">
            <div class="pos3-insight"><b>State Engine</b><span>Program, schedule, execution and history are synthesized into one current state. Adaptive recommendations remain separate from the plan.</span></div>
          </div>
        </div>
      </div>`;
  }

  async function renderDomain(id){
    const main=document.getElementById("pos30Main"),state=await persistState(await buildState());
    const cfg={
      fitness:["Fitness","Workouts, running, execution and adaptive training state.","strength"],
      nutrition:["Nutrition","Meals and nutrition execution state.","meal"],
      education:["Education","Study plan and learning execution state.","study"],
      tasks:["Tasks","Focused task execution state.","task"],
      progress:["Progress","Plan vs actual, adherence and baseline signals.","progress"]
    }[id];
    let body="";
    if(id==="fitness"){
      body=`<div class="pos3-domain-grid"><div class="pos3-domain-card"><h3>Today</h3><p>${state.domains.fitness.complete}/${state.domains.fitness.planned} fitness activities complete.</p><div class="pos3-progress"><div style="width:${state.domains.fitness.planned?Math.min(100,state.domains.fitness.complete/state.domains.fitness.planned*100):0}%"></div></div><div class="pos3-actions"><button class="pos3-primary" onclick="pos30Start('strength')">Start Workout</button><button class="pos3-secondary" onclick="pos30Start('run')">Log Run</button></div></div><div class="pos3-domain-card"><h3>Adaptive</h3><p>Actual performance feeds the next-target recommendation.</p><div class="pos3-actions"><button class="pos3-secondary" onclick="pos24Open()">Review Recommendations</button></div></div></div>`;
    } else if(id==="nutrition"){
      body=`<div class="pos3-domain-card"><h3>Today's Nutrition</h3><p>${state.domains.nutrition.complete}/${state.domains.nutrition.planned} nutrition activities complete.</p><div class="pos3-actions"><button class="pos3-primary" onclick="pos30Start('meal')">Log Meal</button></div></div>`;
    } else if(id==="education"){
      body=`<div class="pos3-domain-card"><h3>Today's Education</h3><p>${state.domains.education.complete}/${state.domains.education.planned} study activities complete.</p><div class="pos3-actions"><button class="pos3-primary" onclick="pos30Start('study')">Start Study</button></div></div>`;
    } else if(id==="tasks"){
      body=`<div class="pos3-domain-card"><h3>Today's Tasks</h3><p>${state.domains.tasks.complete}/${state.domains.tasks.planned} task activities complete.</p><div class="pos3-actions"><button class="pos3-secondary" onclick="pos21OpenCalendar()">Open Schedule</button></div></div>`;
    } else {
      body=`<div class="pos3-kpis"><div class="pos3-kpi"><span>7-Day Execution</span><b>${state.adherence.rate}%</b></div><div class="pos3-kpi"><span>Completed</span><b>${state.adherence.completed||0}</b></div><div class="pos3-kpi"><span>Records</span><b>${state.adherence.records||0}</b></div><div class="pos3-kpi"><span>Week</span><b>${state.week}</b></div></div>
      <div class="pos3-section">Plan vs Actual</div><div class="pos3-card">${Object.entries(state.domains).map(([d,v])=>`<div style="padding:9px 0;border-bottom:1px solid var(--pos3-line);display:flex;justify-content:space-between;font-size:10px"><span>${d[0].toUpperCase()+d.slice(1)}</span><b>${v.complete}/${v.planned}</b></div>`).join("")}</div>
      <div class="pos3-section">Adaptive</div><div class="pos3-insight"><b>Recommendation layer active</b><span>Performance history can inform future training recommendations without rewriting the original program.</span></div>`;
    }
    main.innerHTML=`<div class="pos3-header"><div><div class="pos3-title">${cfg[0]}</div><div class="pos3-sub">${cfg[1]} • ${esc(dayLabel())}</div></div></div>${dateNavigator()}${body}`;
  }

  function nav(){
    const n=document.getElementById("pos30Nav");if(!n)return;
    const items=[["today","Today","▣"],["fitness","Fitness","◆"],["nutrition","Nutrition","●"],["education","Education","▤"],["tasks","Tasks","✓"],["progress","Progress","◒"]];
    n.innerHTML=items.map(x=>`<button class="${currentView===x[0]?"active":""}" onclick="pos30Show('${x[0]}')"><span style="font-size:17px;display:block">${x[2]}</span>${x[1]}</button>`).join("");
  }
  async function render(){nav();if(currentView==="today")await renderToday();else await renderDomain(currentView)}

  window.pos30PreviousDay=function(){shiftAppDate(-1)};
  window.pos30NextDay=function(){shiftAppDate(1)};
  window.pos30GoToday=function(){setAppDate(new Date())};
  window.pos30SetDateMode=function(mode){
    dateDisplayMode=mode==="date"?"date":"day";
    localStorage.setItem(DATE_MODE_KEY,dateDisplayMode);
    render();
  };

  window.pos30Show=function(id){currentView=id;render()}
  window.pos30Start=function(type){
    if(type==="strength"){try{posrefStartWorkout();return}catch(e){pos21Quick("strength");return}}
    if(type==="run"||type==="meal"||type==="study"){pos21Quick(type);return}
  };
  window.pos30StartNext=async function(){
    const a=plansForDate()[0];if(!a)return;
    pos30Start(a.type==="strength"?"strength":a.type==="run"?"run":a.type==="meal"?"meal":"study");
  };
  window.pos30OpenPrograms=function(){try{pos23Open()}catch(e){}};
  window.pos30OpenData=function(){try{pos22OpenData()}catch(e){}};

  // Global Start menu
  document.addEventListener("DOMContentLoaded",()=>{
    const fab=document.getElementById("pos30Fab"),menu=document.getElementById("pos30Start");
    if(fab)fab.onclick=()=>menu.classList.toggle("open");
    if(menu)menu.innerHTML=`<button onclick="pos30Start('strength');pos30CloseStart()">🏋 Start Workout</button><button onclick="pos30Start('run');pos30CloseStart()">🏃 Start Run</button><button onclick="pos30Start('meal');pos30CloseStart()">🍽 Log Meal</button><button onclick="pos30Start('study');pos30CloseStart()">📚 Start Study</button>`;
    render();
  });
  window.pos30CloseStart=function(){document.getElementById("pos30Start")?.classList.remove("open")};
})();
