
/* ============================================================
   PERSONAL OS 3.0 — CORE CONSOLIDATION LAYER
   Canonical ownership:
     POS3Core.state.date       = one application date
     POS3Core.data             = canonical IndexedDB data facade
     POS3Core.events           = application event bus
     POS3Core.adapters         = compatibility boundary for 2.x/2.1/2.2/2.3/2.4
     POS3Core.ui               = refresh coordination
   Legacy functions remain available, but they are adapters rather
   than independent sources of truth.
   ============================================================ */
(function(){
  const Core = window.POS3Core = window.POS3Core || {};
  const DATE_KEY="pos:core:selectedDate:v3";
  const SCHEMA=3;

  function normalizeDate(d){
    const x=new Date(d);
    if(Number.isNaN(x.getTime())) return normalizeDate(new Date());
    x.setHours(12,0,0,0);
    return x;
  }
  function dateKey(d){return normalizeDate(d).toISOString().slice(0,10)}
  function cloneDate(d){return new Date(normalizeDate(d).getTime())}

  Core.schemaVersion=SCHEMA;
  Core.state=Core.state||{};
  Core.state.date=normalizeDate(localStorage.getItem(DATE_KEY)||new Date());
  Core.state.view=Core.state.view||"today";
  Core.state.initialized=true;

  Core.events=Core.events||{
    _map:new Map(),
    on(type,fn){const a=this._map.get(type)||[];a.push(fn);this._map.set(type,a);return()=>this.off(type,fn)},
    off(type,fn){const a=this._map.get(type)||[];this._map.set(type,a.filter(x=>x!==fn))},
    emit(type,payload){(this._map.get(type)||[]).slice().forEach(fn=>{try{fn(payload)}catch(e){Core.diagnostics?.record("event",e)}})}
  };

  Core.diagnostics=Core.diagnostics||{
    errors:[],
    record(area,error){
      this.errors.push({area,message:String(error?.message||error),at:new Date().toISOString()});
      if(this.errors.length>100)this.errors.shift();
    }
  };

  Core.getDate=()=>cloneDate(Core.state.date);
  Core.getDateKey=()=>dateKey(Core.state.date);
  Core.setView=v=>{Core.state.view=v;Core.events.emit("VIEW_CHANGED",{view:v})};

  Core.refresh=function(reason="state"){
    Core.events.emit("STATE_INVALIDATED",{reason,date:Core.getDateKey()});
    const fns=[
      ["3.0 state",()=>typeof window.render==="function"&&window.render()],
      ["legacy integrated UI",()=>typeof window.posRefreshIntegrated==="function"&&window.posRefreshIntegrated()],
      ["legacy execution UI",()=>typeof window.pos21RefreshUI==="function"&&window.pos21RefreshUI()]
    ];
    fns.forEach(([area,fn])=>{try{fn()}catch(e){Core.diagnostics.record(area,e)}});
  };

  Core.setDate=function(input,reason="user"){
    const next=normalizeDate(input);
    Core.state.date=next;
    localStorage.setItem(DATE_KEY,next.toISOString());
    // Synchronize the legacy compatibility variable exactly once.
    try{window.selected=cloneDate(next)}catch(e){Core.diagnostics.record("selected-sync",e)}
    try{window.strengthLogDate=cloneDate(next)}catch(e){Core.diagnostics.record("strength-date-sync",e)}
    try{
      const picker=document.getElementById("strengthDatePicker");
      if(picker)picker.value=typeof window.iso==="function"?window.iso(next):dateKey(next);
    }catch(e){Core.diagnostics.record("strength-picker-sync",e)}
    Core.events.emit("DATE_CHANGED",{date:dateKey(next),dateObject:cloneDate(next),reason});
    Core.refresh("date");
    return cloneDate(next);
  };
  Core.moveDate=days=>{
    const d=Core.getDate();d.setDate(d.getDate()+Number(days||0));
    return Core.setDate(d,"navigation");
  };
  Core.today=()=>Core.setDate(new Date(),"today");

  /* Canonical data facade. IndexedDB (pos2) is the primary store.
     Older localStorage helpers remain available only for compatibility. */
  Core.data={
    async all(){try{return await window.pos2All()}catch(e){Core.diagnostics.record("data-all",e);return[]}},
    async put(record){
      try{
        const r=await window.__POS3_original_pos2Put(record);
        Core.events.emit("DATA_CHANGED",{operation:"put",record:r});
        return r;
      }catch(e){Core.diagnostics.record("data-put",e);throw e}
    },
    async get(id){try{return await window.pos2Get(id)}catch(e){Core.diagnostics.record("data-get",e);return null}},
    async remove(id){try{
      const r=await window.pos2Delete(id);
      Core.events.emit("DATA_CHANGED",{operation:"delete",id});
      return r;
    }catch(e){Core.diagnostics.record("data-delete",e);throw e}}
  };

  /* Preserve the original canonical DB writer exactly once, then make
     every future pos2Put call observable through the core. */
  if(!window.__POS3_original_pos2Put && typeof window.pos2Put==="function"){
    window.__POS3_original_pos2Put=window.pos2Put;
    window.pos2Put=async function(record){
      const r=await window.__POS3_original_pos2Put(record);
      Core.events.emit("DATA_CHANGED",{operation:"put",record:r});
      return r;
    };
  }

  /* Compatibility adapters: legacy modules read the canonical core date.
     These are intentionally thin and contain no independent date state. */
  if(typeof window.pos21Date==="function" && !window.__POS3_original_pos21Date){
    window.__POS3_original_pos21Date=window.pos21Date;
    window.pos21Date=function(){return Core.getDateKey()};
  }
  if(typeof window.pos24Date==="function" && !window.__POS3_original_pos24Date){
    window.__POS3_original_pos24Date=window.pos24Date;
    window.pos24Date=function(){return Core.getDateKey()};
  }
  if(typeof window.pos23Week==="function" && !window.__POS3_original_pos23Week){
    window.__POS3_original_pos23Week=window.pos23Week;
    window.pos23Week=function(d){return window.__POS3_original_pos23Week(d||Core.getDate())};
  }
  if(typeof window.pos23ProgramsForDate==="function" && !window.__POS3_original_pos23ProgramsForDate){
    window.__POS3_original_pos23ProgramsForDate=window.pos23ProgramsForDate;
    window.pos23ProgramsForDate=function(d){return window.__POS3_original_pos23ProgramsForDate(d||Core.getDate())};
  }

  /* Date entry points all terminate at Core.setDate(). */
  if(typeof window.pos21SelectDate==="function" && !window.__POS3_original_pos21SelectDate){
    window.__POS3_original_pos21SelectDate=window.pos21SelectDate;
    window.pos21SelectDate=function(key){return Core.setDate(String(key).slice(0,10),"legacy-calendar")};
  }
  if(typeof window.posUISelectDate==="function" && !window.__POS3_original_posUISelectDate){
    window.__POS3_original_posUISelectDate=window.posUISelectDate;
    window.posUISelectDate=function(d){return Core.setDate(d,"legacy-ui")};
  }
  if(typeof window.posUIToday==="function" && !window.__POS3_original_posUIToday){
    window.__POS3_original_posUIToday=window.posUIToday;
    window.posUIToday=function(){Core.today();try{window.posUISwitch("today")}catch(e){}};
  }
  if(typeof window.pos30PreviousDay==="function")window.pos30PreviousDay=()=>Core.moveDate(-1);
  if(typeof window.pos30NextDay==="function")window.pos30NextDay=()=>Core.moveDate(1);
  if(typeof window.pos30GoToday==="function")window.pos30GoToday=()=>Core.today();

  /* Program week jumps also terminate at the canonical date. */
  if(typeof window.pos23JumpWeek==="function" && !window.__POS3_original_pos23JumpWeek){
    window.__POS3_original_pos23JumpWeek=window.pos23JumpWeek;
    window.pos23JumpWeek=function(w){
      const d=Core.getDate(),current=window.pos23Week(d);
      d.setDate(d.getDate()+(Number(w)-current)*7);
      return Core.setDate(d,"program-week");
    };
  }

  /* UI actions are centralized: navigation changes view state first,
     then rendering occurs through the core refresh coordinator. */
  if(typeof window.pos30Show==="function" && !window.__POS3_original_pos30Show){
    window.__POS3_original_pos30Show=window.pos30Show;
    window.pos30Show=function(view){
      Core.setView(view);
      return window.__POS3_original_pos30Show(view);
    };
  }

  Core.adapters={
    legacyData:true,
    legacyDate:true,
    legacyProgram:true,
    legacyExecution:true,
    legacyAdaptive:true
  };

  /* Keep every legacy renderer synchronized after data changes. */
  Core.events.on("DATA_CHANGED",()=>Core.refresh("data"));
  Core.events.on("DATE_CHANGED",payload=>{
    try{window.dispatchEvent(new CustomEvent("pos:coreDateChanged",{detail:payload}))}catch(e){}
  });

  window.addEventListener("pos:dateChanged",e=>{
    if(e?.detail?.date && e.detail.date!==Core.getDateKey()){
      Core.setDate(e.detail.date,"legacy-event");
    }
  });

  window.addEventListener("DOMContentLoaded",()=>{
    try{
      window.selected=cloneDate(Core.state.date);
      window.strengthLogDate=cloneDate(Core.state.date);
    }catch(e){Core.diagnostics.record("startup-date-sync",e)}
    Core.events.emit("CORE_READY",{schemaVersion:SCHEMA,date:Core.getDateKey()});
  });
})();
