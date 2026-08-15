
document.addEventListener("DOMContentLoaded",()=>{
  // Replace the Today agenda with a timeline after the clean UI renders.
  const observer=new MutationObserver(()=>{
    if(typeof window.poscleanShow!=="function")return;
    const main=document.getElementById("poscleanMain");
    if(!main || main.dataset.timelineApplied==="1")return;
    const title=main.querySelector(".posclean-title");
    if(!title || title.textContent!=="Today")return;
    const rows=[...main.querySelectorAll(".posclean-agenda-row")];
    if(!rows.length)return;
    main.dataset.timelineApplied="1";
    const wrap=document.createElement("div");wrap.className="posclean-card";
    wrap.innerHTML='<div class="posclean-section-label" style="margin-top:0">Daily Planner</div><div class="posref-timeline"></div>';
    const tl=wrap.querySelector(".posref-timeline");
    rows.forEach(row=>{
      const time=row.querySelector(".posclean-time")?.textContent||"";
      const item=row.querySelector(".posclean-item")?.textContent||"";
      const meta=row.querySelector(".posclean-meta")?.textContent||"";
      const status=row.querySelector(".posclean-status")?.textContent||"";
      const cls=status==="DONE"?"done":"current";
      const action=row.querySelector(".posclean-status")?.getAttribute("onclick")||"";
      const safeAction=action.replace(/"/g,"&quot;");
      tl.insertAdjacentHTML("beforeend",`<div class="posref-timeline-row"><div><div class="posref-dot ${cls}"></div><div class="posref-time">${time}</div></div><div class="posref-event ${cls==="current"?"current":""}" onclick="${safeAction}"><div class="posref-event-title">${item}</div><div class="posref-event-meta">${meta}</div><div class="posref-action"><span class="posref-statuspill ${cls==="done"?"green":"blue"}">${status}</span></div></div></div>`);
    });
    const old=main.querySelector(".posclean-agenda");if(old)old.replaceWith(wrap);
  });
  observer.observe(document.getElementById("poscleanMain")||document.body,{childList:true,subtree:true});
});
