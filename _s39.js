
/* PERSONAL OS 3.0 — LEGACY DATE RECONCILIATION
   Every remaining legacy date entry point is an adapter to POS3Core.
*/
(function(){
  function sync(){
    if(!window.POS3Core)return;
    const d=window.POS3Core.getDate();
    try{if(typeof selected!=="undefined") selected=new Date(d)}catch(e){}
    try{window.selected=new Date(d)}catch(e){}
    try{window.strengthLogDate=new Date(d)}catch(e){}
  }

  // Legacy date-picker controller.
  if(typeof window.posDDShift==="function" && !window.__POS3_ddShiftWrapped){
    const old=window.posDDShift;
    window.posDDShift=function(days){
      if(window.POS3Core){window.POS3Core.moveDate(Number(days)||0);sync();return}
      return old(days);
    };
    window.__POS3_ddShiftWrapped=true;
  }
  if(typeof window.posDDToday==="function" && !window.__POS3_ddTodayWrapped){
    const old=window.posDDToday;
    window.posDDToday=function(){
      if(window.POS3Core){window.POS3Core.today();sync();return}
      return old();
    };
    window.__POS3_ddTodayWrapped=true;
  }

  // Legacy movement helpers.
  if(typeof window.moveDay==="function" && !window.__POS3_moveDayWrapped){
    const old=window.moveDay;
    window.moveDay=function(days){
      if(window.POS3Core){window.POS3Core.moveDate(Number(days)||0);sync();return}
      return old(days);
    };
    window.__POS3_moveDayWrapped=true;
  }
  if(typeof window.goToday==="function" && !window.__POS3_goTodayWrapped){
    const old=window.goToday;
    window.goToday=function(){
      if(window.POS3Core){window.POS3Core.today();sync();return}
      return old();
    };
    window.__POS3_goTodayWrapped=true;
  }

  // Legacy quick UI "Today".
  if(typeof window.posUIToday==="function" && !window.__POS3_posUITodayWrapped){
    const old=window.posUIToday;
    window.posUIToday=function(){
      if(window.POS3Core){window.POS3Core.today();sync();try{window.posUISwitch("today")}catch(e){};return}
      return old();
    };
    window.__POS3_posUITodayWrapped=true;
  }

  // Legacy selected-date picker.
  if(typeof window.setStrengthLogDate==="function" && !window.__POS3_strengthDateWrapped){
    const old=window.setStrengthLogDate;
    window.setStrengthLogDate=function(dateObj){
      if(window.POS3Core){window.POS3Core.setDate(dateObj,"strength-picker");sync();return}
      return old(dateObj);
    };
    window.__POS3_strengthDateWrapped=true;
  }

  // Keep Core synchronized if a legacy event emits a date.
  window.addEventListener("pos:dateChanged",e=>{
    if(!window.POS3Core||!e?.detail?.date)return;
    const key=String(e.detail.date).slice(0,10);
    if(key!==window.POS3Core.getDateKey())window.POS3Core.setDate(key,"legacy-event");
  });

  document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0));
})();
