
/* PERSONAL OS 3.0 — DATE FUNCTION SELF TEST */
window.pos3DateSelfTest=async function(){
  const C=window.POS3Core;
  const before=C.getDateKey();
  C.moveDate(1);
  const next=C.getDateKey();
  C.moveDate(-1);
  const restored=C.getDateKey();
  C.today();
  const today=C.getDateKey();
  const selectedKey=typeof selected!=="undefined"&&selected instanceof Date
    ? selected.toISOString().slice(0,10) : null;
  const strengthKey=window.strengthLogDate instanceof Date
    ? window.strengthLogDate.toISOString().slice(0,10) : null;
  return {
    pass: next!==before && restored===before && today===new Date().toISOString().slice(0,10)
      && selectedKey===today && strengthKey===today,
    before,next,restored,today,selectedKey,strengthKey,
    coreKey:C.getDateKey()
  };
};
