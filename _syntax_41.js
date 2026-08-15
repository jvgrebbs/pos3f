
/* PERSONAL OS 3.0 — FINAL HARDENING CONTRACT
   Canonical owners + compatibility boundaries + security + performance.
*/
(function(){
  const C=window.POS3Core;
  if(!C)return;

  /* Security */
  const Sec=window.POS3Security=window.POS3Security||{};
  Sec.safeHTML=function(v){
    const d=document.createElement("div");
    d.textContent=v==null?"":String(v);
    return d.innerHTML;
  };
  Sec.safeText=function(v){return v==null?"":String(v)};

  /* Canonical status vocabulary */
  window.POS3Status=Object.freeze({
    PLANNED:"planned",AVAILABLE:"available",IN_PROGRESS:"in_progress",
    COMPLETED:"completed",MISSED:"missed",SKIPPED:"skipped",
    ABANDONED:"abandoned",CANCELLED:"cancelled"
  });
  window.POS3StatusTransitions=Object.freeze({
    planned:["available","in_progress","completed","skipped","missed","cancelled"],
    available:["in_progress","completed","skipped","missed","cancelled"],
    in_progress:["completed","abandoned","cancelled"],
    completed:[],missed:["completed","skipped"],skipped:["planned","available"],
    abandoned:["planned","available"],cancelled:[]
  });

  /* Explicit canonical ownership */
  C.adapters=C.adapters||{};
  C.adapters.canonicalOwners={
    date:"POS3Core.state.date",
    view:"POS3Core.state.view",
    data:"POS3Core.data",
    events:"POS3Core.events",
    status:"POS3Status"
  };
  C.adapters.legacyPolicy="compatibility-adapter-only";

  /* Guard against event/refresh/date re-entry. */
  if(!C.__hardeningGuards){
    const oldSet=C.setDate.bind(C);
    let dateBusy=false;
    C.setDate=function(v,r="user"){
      if(dateBusy)return C.getDate();
      dateBusy=true;
      try{return oldSet(v,r)}finally{dateBusy=false}
    };
    const oldRefresh=C.refresh.bind(C);
    let queued=false,reasons=[];
    C.refresh=function(r="state"){
      reasons.push(r);
      if(queued)return;
      queued=true;
      queueMicrotask(()=>{
        const x=reasons.join(",");
        reasons=[];queued=false;
        oldRefresh(x);
      });
    };
    C.__hardeningGuards=true;
  }

  /* Query cache: one short-lived normalized read per refresh burst. */
  if(C.data && !C.data.__cached){
    const oldAll=C.data.all.bind(C.data);
    let cache=null,stamp=0;
    C.data.all=async function(){
      const now=Date.now();
      if(cache && now-stamp<250)return cache;
      cache=await oldAll();stamp=now;return cache;
    };
    C.data.invalidate=function(){cache=null;stamp=0};
    C.data.__cached=true;
    C.events?.on("DATA_CHANGED",()=>C.data.invalidate());
  }

  /* Recovery contract */
  C.recovery=C.recovery||{};
  C.recovery.mode="non-destructive";
  C.recovery.validateSnapshot=function(s){
    return !!(s && s.schemaVersion===3 && Array.isArray(s.records) &&
      s.createdAt && s.settings && s.records.every(x=>x&&typeof x==="object"));
  };

  /* Central action router for new 3.0 controls. Legacy inline handlers
     remain only inside the compatibility boundary. */
  const A=window.POS3Actions=window.POS3Actions||{};
  A.previousDay=()=>C.moveDate(-1);
  A.nextDay=()=>C.moveDate(1);
  A.today=()=>C.today();
  A.navigate=v=>{C.setView(v);window.pos30Show?.(v)};
  document.addEventListener("click",e=>{
    const b=e.target.closest?.("[data-pos-action]");
    if(!b)return;
    const a=b.dataset.posAction;
    if(a==="previous-day")A.previousDay();
    else if(a==="next-day")A.nextDay();
    else if(a==="today")A.today();
    else if(a.startsWith("nav:"))A.navigate(a.slice(4));
  });

  /* Architecture self-test */
  window.pos3ArchitectureSelfTest=function(){
    const tests=[
      ["core",!!window.POS3Core],
      ["dateOwner",typeof C.getDate==="function"&&typeof C.setDate==="function"],
      ["dataOwner",!!C.data],
      ["events",!!C.events],
      ["statusContract",!!window.POS3StatusTransitions],
      ["recovery",typeof C.recovery.validateSnapshot==="function"],
      ["dateGuard",!!C.__hardeningGuards],
      ["queryCache",!!C.data.__cached]
    ];
    return {pass:tests.every(x=>x[1]),tests};
  };
})();
