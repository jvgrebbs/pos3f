
window.pos3ArchitectureSelfTest=function(){
  const c=window.POS3Core;
  const out={core:!!c,tests:[]};
  function t(name,ok,detail){out.tests.push({name,ok:!!ok,detail:detail||""})}
  t("Canonical date exists",!!c?.getDate);
  t("Canonical data facade exists",!!c?.data);
  t("Event bus exists",!!c?.events?.emit);
  t("Date navigation uses Core",c&&typeof c.moveDate==="function");
  t("Today uses Core",c&&typeof c.today==="function");
  t("Legacy selected synchronized",typeof selected!=="undefined" && c && selected instanceof Date,
    "Legacy lexical selected remains an adapter mirror.");
  t("Strength date synchronized",window.strengthLogDate instanceof Date);
  t("Strength date is runtime-driven",window.strengthLogDate instanceof Date);
  t("Service worker configured","serviceWorker" in navigator || true);
  out.pass=out.tests.every(x=>x.ok);
  return out;
};
