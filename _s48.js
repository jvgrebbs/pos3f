
(function(){
  const C=window.POS3Core;if(!C)return;
  let mode="day";
  try{mode=localStorage.getItem("pos:dateDisplayMode:3.0")||"day"}catch(e){}
  function key(){return C.getDateKey()}
  function label(){
    const d=C.getDate();
    return mode==="date"
      ? d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})
      : d.toLocaleDateString(undefined,{weekday:"long"});
  }
  function renderBar(){
    const main=document.getElementById("pos30Main");if(!main)return;
    let bar=document.getElementById("pos30RuntimeDateBar");
    if(!bar){
      bar=document.createElement("div");bar.id="pos30RuntimeDateBar";bar.className="pos30-runtime-datebar";
      main.insertBefore(bar,main.firstChild);
    }
    bar.innerHTML=
      '<button type="button" aria-label="Previous day" data-pos-runtime-date="prev">‹</button>'+
      '<div class="date-main" aria-live="polite">'+label()+'</div>'+
      '<div class="date-toggle">'+
      '<button type="button" data-pos-runtime-date="day" class="'+(mode==="day"?"active":"")+'">DAY</button>'+
      '<button type="button" data-pos-runtime-date="date" class="'+(mode==="date"?"active":"")+'">DATE</button>'+
      '</div>'+
      '<button type="button" data-pos-runtime-date="today">TODAY</button>'+
      '<button type="button" aria-label="Next day" data-pos-runtime-date="next">›</button>';
  }
  function sync(){
    try{window.selected=new Date(C.getDate())}catch(e){}
    try{window.strengthLogDate=new Date(C.getDate())}catch(e){}
    renderBar();
  }
  window.pos30PreviousDay=function(){const r=C.moveDate(-1);sync();return r};
  window.pos30NextDay=function(){const r=C.moveDate(1);sync();return r};
  window.pos30GoToday=function(){const r=C.today();sync();return r};
  window.pos30SetDate=function(v){const r=C.setDate(v,"visible-date");sync();return r};
  document.addEventListener("click",function(e){
    const b=e.target.closest?.("[data-pos-runtime-date]");if(!b)return;
    const a=b.dataset.posRuntimeDate;
    if(a==="prev")window.pos30PreviousDay();
    else if(a==="next")window.pos30NextDay();
    else if(a==="today")window.pos30GoToday();
    else if(a==="day"||a==="date"){
      mode=a;
      try{localStorage.setItem("pos:dateDisplayMode:3.0",mode)}catch(e){}
      renderBar();
    }
  });
  C.events?.on("DATE_CHANGED",sync);
  document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0));
  window.pos30DateRuntimeTest=function(){
    const b=key();C.moveDate(1);const n=key();C.moveDate(-1);const back=key();
    C.setDate("2026-01-31");C.moveDate(1);const feb=key();
    C.setDate("2026-12-31");C.moveDate(1);const jan=key();
    C.setDate("2028-02-28");C.moveDate(1);const leap=key();C.setDate(b);sync();
    return {pass:n!==b&&back===b&&feb==="2026-02-01"&&jan==="2027-01-01"&&leap==="2028-02-29",before:b,next:n,back,feb,jan,leap};
  };
  setTimeout(sync,0);
})();
