
/* PERSONAL OS — DAY / DATE NAVIGATION + RETURN TO TODAY */
(function(){
  const KEY="pos:dateDisplayMode";
  let mode=localStorage.getItem(KEY)||"day";

  function currentDate(){
    try{return typeof selected!=="undefined"?selected:new Date()}catch(e){return new Date()}
  }
  function isToday(){
    const d=currentDate(),n=new Date();
    return d.getFullYear()===n.getFullYear() &&
           d.getMonth()===n.getMonth() &&
           d.getDate()===n.getDate();
  }
  function setSelected(d){
    try{
      selected=new Date(d);
      if(typeof poscleanShow==="function")poscleanShow("today");
      else if(typeof render==="function")render();
    }catch(e){}
  }
  function shift(days){
    const d=new Date(currentDate());
    d.setDate(d.getDate()+days);
    setSelected(d);
  }
  function formatDate(){
    const d=currentDate();
    if(mode==="date") return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    return d.toLocaleDateString(undefined,{weekday:"long"});
  }
  function formatContext(){
    const d=currentDate();
    return d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
  }
  function weekSafe(){
    try{return typeof pos23Week==="function"?pos23Week(currentDate()):1}catch(e){return 1}
  }
  function modeControls(){
    return `<div class="posdd-toggle" aria-label="Day or date display">
      <button class="${mode==="day"?"active":""}" onclick="posDDSetMode('day')">DAY</button>
      <button class="${mode==="date"?"active":""}" onclick="posDDSetMode('date')">DATE</button>
    </div>`;
  }
  function controls(){
    return `<div class="posdd-nav">
      <button aria-label="Previous day" onclick="posDDShift(-1)">‹</button>
      <div class="posdd-date-title">
        <b>${formatDate()}</b>
        ${modeControls()}
        <button class="posdd-today-btn ${isToday()?"active":""}" onclick="posDDToday()" ${isToday()?"disabled":""}>TODAY</button>
      </div>
      <button aria-label="Next day" onclick="posDDShift(1)">›</button>
    </div>`;
  }
  function inject(){
    const main=document.getElementById("poscleanMain");
    if(!main)return;
    const title=main.querySelector(".posclean-title");
    if(!title || title.textContent.trim()!=="Today")return;

    let old=main.querySelector("#posddControls");
    if(old)old.remove();

    const box=document.createElement("div");
    box.id="posddControls";
    box.innerHTML=controls();

    const header=main.querySelector(".posclean-header");
    if(header)header.insertAdjacentElement("afterend",box);

    const context=document.getElementById("poscleanContext");
    if(context)context.textContent=`${formatContext()} • Week ${weekSafe()}`;
  }

  window.posDDSetMode=function(newMode){
    mode=newMode==="date"?"date":"day";
    localStorage.setItem(KEY,mode);
    inject();
  };

  window.posDDShift=function(days){
    shift(days);
  };

  window.posDDToday=function(){
    const n=new Date();
    setSelected(n);
  };

  const observer=new MutationObserver(()=>setTimeout(inject,0));

  document.addEventListener("DOMContentLoaded",()=>{
    const main=document.getElementById("poscleanMain");
    if(main)observer.observe(main,{childList:true,subtree:true});
    setTimeout(inject,600);
  });
})();
