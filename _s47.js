
(function(){
  const C=window.POS3Core;if(!C)return;
  function repaint(){
    try{
      if(typeof window.pos30SyncDateAcrossApp==="function"){
        window.pos30SyncDateAcrossApp(C.getDate());
      }
    }catch(e){}
    try{
      if(typeof window.pos30Show==="function") window.pos30Show(C.state?.view||"today");
    }catch(e){}
  }
  window.moveDay=function(days){
    const r=C.moveDate(Number(days)||0);repaint();return r;
  };
  window.goToday=function(){
    const r=C.today();repaint();return r;
  };
  window.pos30PreviousDay=()=>window.moveDay(-1);
  window.pos30NextDay=()=>window.moveDay(1);
  window.pos30GoToday=()=>window.goToday();
  window.pos30SetDate=v=>{const r=C.setDate(v,"visible-date");repaint();return r};
  window.pos30VisibleDateTest=function(){
    const before=C.getDateKey();
    window.moveDay(1);const next=C.getDateKey();
    window.moveDay(-1);const back=C.getDateKey();
    C.setDate("2020-01-01");window.goToday();const today=C.getDateKey();
    C.setDate(before);
    return {pass:next!==before&&back===before&&today===new Date().toISOString().slice(0,10),before,next,back,today};
  };
})();
