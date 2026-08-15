
window.pos30RunDateTest=function(){
  const C=window.POS3Core;
  const before=C.getDateKey();
  const nextExpected=new Date(C.getDate()); nextExpected.setDate(nextExpected.getDate()+1);
  const nextKey=nextExpected.toISOString().slice(0,10);
  C.moveDate(1);
  const afterNext=C.getDateKey();
  C.moveDate(-1);
  const afterBack=C.getDateKey();
  const beforeToday=C.getDateKey();
  C.today();
  const todayKey=C.getDateKey();
  const result={
    before,
    afterNext,
    afterBack,
    today:todayKey,
    selected:window.selected?.toISOString?.().slice(0,10)||null,
    strength:window.strengthLogDate?.toISOString?.().slice(0,10)||null
  };
  result.pass=afterNext===nextKey &&
              afterBack===beforeToday &&
              todayKey===new Date().toISOString().slice(0,10) &&
              result.selected===todayKey &&
              result.strength===todayKey;
  return result;
};
