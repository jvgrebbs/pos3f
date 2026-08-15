
(function(){const C=window.POS3Core;if(!C)return;
function mirror(){const d=C.getDate();window.selected=new Date(d);window.strengthLogDate=new Date(d);return d}
function repaint(){mirror();try{if(typeof window.pos30Show==="function")window.pos30Show(C.state.view||"today")}catch(e){}}
window.pos30PreviousDay=()=>{const r=C.moveDate(-1);repaint();return r};
window.pos30NextDay=()=>{const r=C.moveDate(1);repaint();return r};
window.pos30GoToday=()=>{const r=C.today();repaint();return r};
window.pos30SetDate=v=>{const r=C.setDate(v,"visible-control");repaint();return r};
window.pos30DateRuntimeTest=()=>{const b=C.getDateKey();C.moveDate(1);const n=C.getDateKey();C.moveDate(-1);const back=C.getDateKey();C.setDate("2026-01-31");C.moveDate(1);const feb=C.getDateKey();C.setDate("2026-12-31");C.moveDate(1);const jan=C.getDateKey();C.setDate("2028-02-28");C.moveDate(1);const leap=C.getDateKey();C.setDate(b);return {pass:n!==b&&back===b&&feb==="2026-02-01"&&jan==="2027-01-01"&&leap==="2028-02-29",before:b,next:n,back,feb,jan,leap};};
})();
