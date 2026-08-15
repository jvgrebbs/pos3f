
/* PERSONAL OS 3.0 — GLOBAL DATE / ACTION CONTROLLER
   One selected date drives every domain and every legacy execution surface.
*/
(function(){
  function normalize(d){
    const x=new Date(d); x.setHours(12,0,0,0); return x;
  }
  function syncDate(d){
    const x=normalize(d);
    try{window.selected=x}catch(e){}
    try{window.strengthLogDate=new Date(x)}catch(e){}
    try{
      const picker=document.getElementById("strengthDatePicker");
      if(picker) picker.value=typeof iso==="function"?iso(x):x.toISOString().slice(0,10);
    }catch(e){}
    try{
      if(typeof localStorage!=="undefined"){
        localStorage.setItem("pos:selectedDate:3.0",x.toISOString());
        localStorage.setItem("pos:selectedDate",x.toISOString());
      }
    }catch(e){}
    // Refresh every domain that is present. Each call is guarded so one
    // legacy renderer cannot prevent the other domains from updating.
    const calls=[
      ()=>typeof window.render==="function"&&window.render(),
      ()=>typeof window.posRefreshIntegrated==="function"&&window.posRefreshIntegrated(),
      ()=>typeof window.execRender==="function"&&window.execRender(),
      ()=>typeof window.renderNutrition==="function"&&window.renderNutrition(),
      ()=>typeof window.renderEducation==="function"&&window.renderEducation(),
      ()=>typeof window.renderTodayDashboard==="function"&&window.renderTodayDashboard(),
      ()=>typeof window.renderFitnessEngine==="function"&&window.renderFitnessEngine(),
      ()=>typeof window.pos21RefreshUI==="function"&&window.pos21RefreshUI(),
      ()=>typeof window.renderStrengthLog==="function"&&window.renderStrengthLog()
    ];
    calls.forEach(fn=>{try{fn()}catch(e){}});
    try{window.dispatchEvent(new CustomEvent("pos:dateChanged",{detail:{date:x.toISOString().slice(0,10)}}))}catch(e){}
    return x;
  }

  window.pos30SyncDateAcrossApp=syncDate;

  // Make legacy date-selection entry points feed the same global date.
  const legacySelect=window.pos21SelectDate;
  window.pos21SelectDate=function(key){
    syncDate(new Date(String(key)+"T12:00:00"));
    try{window.pos21CloseDrawer()}catch(e){}
  };

  const legacyToday=window.posUIToday;
  window.posUIToday=function(){
    const x=new Date(); syncDate(x);
    try{window.posUISwitch("today")}catch(e){}
    return x;
  };

  // Ensure legacy day movement updates every surface.
  const legacyMove=window.moveDay;
  window.moveDay=function(n){
    const base=normalize(window.selected||new Date());
    base.setDate(base.getDate()+Number(n||0));
    return syncDate(base);
  };

  const legacyGoToday=window.goToday;
  window.goToday=function(){
    const x=new Date(); syncDate(x);
    return x;
  };

  // Date picker changes are global, not fitness-only.
  document.addEventListener("change",function(e){
    if(!e.target)return;
    if(e.target.id==="strengthDatePicker" && e.target.value){
      const parts=e.target.value.split("-").map(Number);
      if(parts.length===3)syncDate(new Date(parts[0],parts[1]-1,parts[2]));
    }
  });

  // Navigation fallback: if a 3.0 nav/date button has an inline handler
  // that is unavailable after a module error, delegate the action here.
  document.addEventListener("click",function(e){
    const b=e.target.closest?.("#pos30Nav button");
    if(b){
      const text=(b.textContent||"").trim().toLowerCase();
      if(text.includes("today")) window.pos30Show?.("today");
      else if(text.includes("fitness")) window.pos30Show?.("fitness");
      else if(text.includes("nutrition")) window.pos30Show?.("nutrition");
      else if(text.includes("education")) window.pos30Show?.("education");
      else if(text.includes("tasks")) window.pos30Show?.("tasks");
      else if(text.includes("progress")) window.pos30Show?.("progress");
    }
    const d=e.target.closest?.(".pos30-date-toggle button");
    if(d){
      const mode=(d.textContent||"").trim().toLowerCase();
      if(mode==="day"||mode==="date") window.pos30SetDateMode?.(mode);
    }
  },true);

  // Keep the selected date synchronized if a legacy renderer changes it.
  window.addEventListener("pos:dateChanged",function(){});

  document.addEventListener("DOMContentLoaded",function(){
    try{
      const saved=localStorage.getItem("pos:selectedDate:3.0");
      if(saved) syncDate(new Date(saved));
      else syncDate(new Date());
    }catch(e){syncDate(new Date())}
  });
})();
