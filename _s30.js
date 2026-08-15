
/* Focused domain navigation:
   Today = planner/summary.
   Fitness/Nutrition/Education/Tasks/Progress = one focused domain only. */
(function(){
  const DOMAIN_IDS=["fitness","nutrition","education","tasks","progress","today"];
  const labels={today:"Today",fitness:"Fitness",nutrition:"Nutrition",education:"Education",tasks:"Tasks",progress:"Progress"};

  function allCandidateSections(){
    return Array.from(document.querySelectorAll("section, .refine-page, [data-domain], [data-view]"));
  }

  function textOf(el){return (el.innerText||el.textContent||"").trim().toLowerCase()}

  function inferDomain(el){
    const s=((el.id||"")+" "+(el.getAttribute("data-domain")||"")+" "+(el.getAttribute("data-view")||"")+" "+textOf(el).slice(0,120)).toLowerCase();
    if(/\bfitness\b|\bworkout\b|\bstrength\b|\brun\b/.test(s))return "fitness";
    if(/\bnutrition\b|\bmeal\b|\brecipe\b|\bfood\b/.test(s))return "nutrition";
    if(/\beducation\b|\bstudy\b|\bnetwork\+?\b/.test(s))return "education";
    if(/\btasks?\b|\bhousehold\b/.test(s))return "tasks";
    if(/\bprogress\b|\banalytics\b|\bperformance\b/.test(s))return "progress";
    return null;
  }

  function isNavOrOverlay(el){
    return el.closest(".pos21-modal,.pos22-modal,.pos23-modal,.pos24-modal,.pos22-overlay,.pos21-overlay,.pos23-overlay") ||
           el.matches("nav,header,footer,.refine-header,.refine-nav,.refine-tabs");
  }

  function classifySections(){
    const map={today:[],fitness:[],nutrition:[],education:[],tasks:[],progress:[]};
    for(const el of allCandidateSections()){
      if(isNavOrOverlay(el))continue;
      const d=el.getAttribute("data-pos-ui-domain")||inferDomain(el);
      if(d && map[d]){el.setAttribute("data-pos-ui-classified","1");map[d].push(el)}
    }
    return map;
  }

  function hideLegacyDomainSections(){
    // Hide legacy page bodies; the focused shells below become the authoritative display.
    const map=classifySections();
    Object.values(map).flat().forEach(el=>el.classList.add("pos-ui-view-hidden"));
    return map;
  }

  function dateLabel(d){
    try{return d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}catch(e){return ""}
  }
  function getSelectedDate(){
    try{return typeof selected!=="undefined"?selected:new Date()}catch(e){return new Date()}
  }
  function dayNumber(d){return d.getDay()||7}
  function currentWeek(){
    try{return typeof pos23Week==="function"?pos23Week(getSelectedDate()):1}catch(e){return 1}
  }

  async function recordsForDate(){
    try{
      const all=await pos2All();
      const key=iso(getSelectedDate());
      return all.filter(r=>r.date===key && r.status==="complete");
    }catch(e){return []}
  }

  function activities(){
    try{return typeof pos23ProgramsForDate==="function"?pos23ProgramsForDate(getSelectedDate()):[]}catch(e){return []}
  }

  function activityRows(acts,records){
    const rows=[];
    const doneDomains=new Set(records.map(r=>r.domain));
    for(const a of acts){
      let meta="";
      if(a.type==="strength")meta=a.items.map(x=>`${x.name} ${x.sets}×${x.reps}`).slice(0,2).join(" • ");
      else if(a.type==="run")meta=`${a.duration||"—"} min • ${a.intensity||"Run"}`;
      else if(a.type==="meal")meta=(a.meals||[]).join(" • ");
      else if(a.type==="study")meta=`${a.minutes||"—"} min • ${a.topic||"Study"}`;
      const domain=(a.domain||a.program||"").toLowerCase();
      const isDone=[...doneDomains].some(d=>domain.includes(d));
      rows.push({time:a.scheduledDay===dayNumber(getSelectedDate())?"Today":"Planned",title:a.name||a.program,meta,status:isDone?"done":"next"});
    }
    return rows;
  }

  async function renderToday(shell){
    const recs=await recordsForDate(), acts=activities(), rows=activityRows(acts,recs);
    const complete=recs.length;
    shell.innerHTML=`
      <div class="pos-ui-view-header">
        <div><div class="pos-ui-view-title">Today</div><div class="pos-ui-view-sub">${dateLabel(getSelectedDate())} • Week ${currentWeek()}</div></div>
        <div class="pos-ui-actions"><button type="button" onclick="pos23Open()">Programs</button><button type="button" onclick="pos21OpenCalendar()">Calendar</button></div>
      </div>
      <div class="pos-ui-today-grid">
        <div class="pos-ui-planner">
          <div class="pos-ui-planner-head"><div>When</div><div>Plan</div><div>Status</div></div>
          ${rows.length?rows.map(r=>`<div class="pos-ui-planner-row"><div class="pos-ui-time">${r.time}</div><div><div class="pos-ui-item">${escapeHtml(r.title)}</div><div class="pos-ui-meta">${escapeHtml(r.meta)}</div></div><div class="pos-ui-status ${r.status}">${r.status==="done"?"DONE":"NEXT"}</div></div>`).join(""):`<div class="pos-ui-empty">Nothing scheduled for today.</div>`}
        </div>
        <div>
          <div class="pos-ui-summary-card">
            <div class="pos-ui-view-sub">TODAY'S SUMMARY</div>
            <div class="pos-ui-summary-line"><span>Planned activities</span><b>${acts.length}</b></div>
            <div class="pos-ui-summary-line"><span>Completed records</span><b>${complete}</b></div>
            <div class="pos-ui-summary-line"><span>Program week</span><b>${currentWeek()}</b></div>
            <div class="pos-ui-summary-line"><span>Execution</span><b>${acts.length?Math.min(100,Math.round(complete/acts.length*100)):0}%</b></div>
          </div>
          <div class="pos-ui-summary-card" style="margin-top:12px">
            <div class="pos-ui-view-sub">QUICK ACTIONS</div>
            <div class="pos-ui-actions" style="margin-top:8px">
              <button onclick="pos21Quick('strength')">Strength</button>
              <button onclick="pos21Quick('run')">Run</button>
              <button onclick="pos21Quick('meal')">Meal</button>
              <button onclick="pos21Quick('study')">Study</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function domainDescription(id){
    return {
      fitness:"Workouts, running, body metrics, adaptive recommendations and fitness execution.",
      nutrition:"Meals, recipes and nutrition execution.",
      education:"Study plans, topics and education execution.",
      tasks:"Household and personal task execution.",
      progress:"Performance, adherence, trends and plan-vs-actual information."
    }[id]||"";
  }

  async function renderDomain(shell,id){
    let title=labels[id], body="";
    if(id==="fitness"){
      const p=typeof pos23StrengthPlanForToday==="function"?pos23StrengthPlanForToday():null;
      const r=await recordsForDate();
      body=`<div class="pos-ui-domain-grid">
        <div class="pos-ui-domain-card"><h3>Today's Program</h3><p>${p?escapeHtml(p.name):"No strength session scheduled."}</p><div class="pos-ui-actions" style="margin-top:10px"><button onclick="pos21Quick('strength')">Log Strength</button><button onclick="pos24Open()">Adaptive</button></div></div>
        <div class="pos-ui-domain-card"><h3>Execution</h3><p>${r.filter(x=>x.domain==="fitness").length} fitness records completed today.</p><div class="pos-ui-actions" style="margin-top:10px"><button onclick="pos21Quick('run')">Log Run</button><button onclick="pos21Quick('weight')">Log Weight</button></div></div>
      </div>
      <div class="pos-ui-summary-card" style="margin-top:12px"><div class="pos-ui-view-sub">PROGRAM DETAILS</div>${p?escapeHtml(p.items.map(x=>`${x.name}: ${x.sets} × ${x.reps}`).join(" | ")):"No programmed strength activity today."}</div>`;
    } else if(id==="nutrition"){
      const p=typeof pos23MealPlanForToday==="function"?pos23MealPlanForToday():null;
      body=`<div class="pos-ui-domain-card"><h3>Today's Meals</h3><p>${p?escapeHtml((p.meals||[]).join(" • ")):"No meal plan loaded."}</p><div class="pos-ui-actions" style="margin-top:10px"><button onclick="pos21Quick('meal')">Log Meal</button></div></div>`;
    } else if(id==="education"){
      const p=typeof pos23StudyPlanForToday==="function"?pos23StudyPlanForToday():null;
      body=`<div class="pos-ui-domain-card"><h3>Today's Study</h3><p>${p?escapeHtml(`${p.topic} • ${p.minutes} minutes`):"No study activity scheduled today."}</p><div class="pos-ui-actions" style="margin-top:10px"><button onclick="pos21Quick('study')">Log Study</button></div></div>`;
    } else if(id==="tasks"){
      body=`<div class="pos-ui-domain-card"><h3>Tasks</h3><p>Focused task execution for the selected date.</p><div class="pos-ui-actions" style="margin-top:10px"><button onclick="pos21OpenCalendar()">Open Calendar</button></div></div>`;
    } else if(id==="progress"){
      const r=await recordsForDate();
      const adh=typeof pos24Adherence==="function"?await pos24Adherence(7):{rate:0};
      body=`<div class="pos-ui-domain-grid">
        <div class="pos-ui-domain-card"><h3>7-Day Execution</h3><p>${adh.rate}%</p><div class="pos-ui-progress"><div style="width:${adh.rate}%"></div></div></div>
        <div class="pos-ui-domain-card"><h3>Today</h3><p>${r.length} completed execution records.</p></div>
      </div>
      <div class="pos-ui-summary-card" style="margin-top:12px"><div class="pos-ui-view-sub">ADAPTIVE STATUS</div><p style="font-size:11px">Open Adaptive for current recommendations based on actual performance.</p><button onclick="pos24Open()">Open Adaptive Engine</button></div>`;
    }
    shell.innerHTML=`<div class="pos-ui-view-header"><div><div class="pos-ui-view-title">${title}</div><div class="pos-ui-view-sub">${domainDescription(id)}</div></div></div>${body}`;
  }

  function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

  async function showView(id){
    const map=hideLegacyDomainSections();
    document.querySelectorAll(".pos-ui-generated-shell").forEach(x=>x.remove());
    const anchor=document.querySelector("main")||document.querySelector(".refine-content")||document.body;
    const shell=document.createElement("div");shell.className="pos-ui-generated-shell";
    if(id==="today"){
      shell.className+=" pos-ui-today-shell";
      anchor.prepend(shell);await renderToday(shell);
    }else{
      shell.className+=" pos-ui-domain-shell";
      anchor.prepend(shell);await renderDomain(shell,id);
    }
    document.querySelectorAll("[data-pos-ui-nav]").forEach(b=>b.classList.toggle("active",b.getAttribute("data-pos-ui-nav")===id));
  }

  function wireNavigation(){
    const wanted={};
    document.querySelectorAll("button,a,[role=button]").forEach(el=>{
      const t=textOf(el).replace(/\s+/g," ");
      for(const id of DOMAIN_IDS){
        if(t===labels[id].toLowerCase() || t.startsWith(labels[id].toLowerCase()+" ")){
          if(!wanted[id])wanted[id]=el;
        }
      }
    });
    Object.entries(wanted).forEach(([id,el])=>{
      if(el.dataset.posUiBound)return;
      el.dataset.posUiBound="1";el.setAttribute("data-pos-ui-nav",id);
      el.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();showView(id)});
    });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
      wireNavigation();
      showView("today");
    },500);
  });

  window.posUIShowView=showView;
})();
