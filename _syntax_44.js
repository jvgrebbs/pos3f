
/* PERSONAL OS 3.0 — FINAL DATE CONTROLLER
   This is intentionally the last date adapter in the file.
   All visible date navigation terminates here.
*/
(function(){
  const C=window.POS3Core;
  if(!C)return;

  function redraw(){
    try{
      const view=C.state?.view||"today";
      if(typeof window.pos30Show==="function"){
        window.pos30Show(view);
      }else if(typeof window.render==="function"){
        window.render();
      }
    }catch(e){
      C.diagnostics?.record?.("final-date-redraw",e);
    }
  }

  window.pos30PreviousDay=function(){
    const result=C.moveDate(-1);
    redraw();
    return result;
  };
  window.pos30NextDay=function(){
    const result=C.moveDate(1);
    redraw();
    return result;
  };
  window.pos30GoToday=function(){
    const result=C.today();
    redraw();
    return result;
  };

  window.pos30SetDate=function(input){
    const result=C.setDate(input,"visible-date-control");
    redraw();
    return result;
  };

  C.events?.on("DATE_CHANGED",function(){
    try{
      if(window.selected && C.getDate){
        window.selected=C.getDate();
      }
      if(window.strengthLogDate && C.getDate){
        window.strengthLogDate=C.getDate();
      }
    }catch(e){}
  });

  window.pos30GetDate=function(){
    return C.getDateKey();
  };
})();
