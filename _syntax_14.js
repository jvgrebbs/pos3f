
/* PERSONAL OS 2.0 EXECUTION / ACTUAL-PLANNED ENGINE */
function v2Items(){
  return typeof posPlannedActivities==="function"?posPlannedActivities(selected):[];
}
function v2RenderCore(){
  const items=v2Items(),done=items.filter(x=>x.status==="complete").length,pct=items.length?Math.round(done/items.length*100):0;
  document.getElementById("v2Today").textContent=posDateLabel(selected);
  document.getElementById("v2Execution").textContent=pct+"%";
  document.getElementById("v2Planned").textContent=items.length;
  document.getElementById("v2Completed").textContent=done;
  document.getElementById("v2ActualPlanned").innerHTML=items.length?items.map(x=>`
    <div class="pos2-row"><div>${posEscape(x.domain)}</div><div><strong>${posEscape(x.title)}</strong><div class="pos2-small">${posEscape(x.time)}</div></div><div class="pos2-chip">${x.status.toUpperCase()}</div></div>`).join(""):"<div class='pos2-small'>Nothing planned.</div>";
  const next=items.find(x=>x.status!=="complete");
  document.getElementById("v2NextUp").innerHTML=next?
    `<div style="font-size:18px;font-weight:800">${posEscape(next.title)}</div><div class="pos2-small">${posEscape(next.domain)} • ${posEscape(next.time)}</div>`:
    "<strong>All planned items complete.</strong>";
}
function v2CloseDrawer(){document.getElementById("v2Drawer").classList.remove("open")}
function v2Quick(type){
  const c=document.getElementById("v2DrawerContent");
  const labels={weight:"Body Weight",strength:"Strength Set",run:"Running Result",study:"Network+ Study",meal:"Meal Completion"};
  c.innerHTML=`<h2>${labels[type]}</h2><div class="pos2-small">${posDateLabel(selected)}</div>`;
  if(type==="weight")c.innerHTML+=`<label>Weight (lb)<input class="pos2-input" id="v2Weight" type="number" step="0.1"></label><button type="button" style="margin-top:9px" onclick="v2SaveQuick('weight')">Save</button>`;
  if(type==="strength")c.innerHTML+=`<label>Exercise<input class="pos2-input" id="v2Ex"></label><label>Weight (lb)<input class="pos2-input" id="v2SW" type="number" step="0.5"></label><label>Reps<input class="pos2-input" id="v2SR" type="number"></label><button type="button" style="margin-top:9px" onclick="v2SaveQuick('strength')">Save</button>`;
  if(type==="run")c.innerHTML+=`<label>Distance (mi)<input class="pos2-input" id="v2RD" type="number" step="0.01"></label><label>Duration (min)<input class="pos2-input" id="v2RT" type="number" step="0.1"></label><button type="button" style="margin-top:9px" onclick="v2SaveQuick('run')">Save</button>`;
  if(type==="study")c.innerHTML+=`<button type="button" onclick="v2SaveQuick('study')">Mark Today's Study Complete</button>`;
  if(type==="meal")c.innerHTML+=`<select class="pos2-input" id="v2Meal"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option></select><button type="button" style="margin-top:9px" onclick="v2SaveQuick('meal')">Complete Meal</button>`;
  document.getElementById("v2Drawer").classList.add("open");
}
async function v2SaveQuick(type){
  const date=iso(selected),now=new Date().toISOString();
  if(type==="weight"){
    const value=Number(document.getElementById("v2Weight").value);if(!value)return;
    await pos2Put({id:"body:"+date,domain:"fitness",type:"bodyMetric",date,weight:value,updatedAt:now});
    try{fitnessLogBody?null:null}catch(e){}
  } else if(type==="strength"){
    const ex=document.getElementById("v2Ex").value.trim(),w=Number(document.getElementById("v2SW").value),r=Number(document.getElementById("v2SR").value);
    if(!ex||!w||!r)return;
    await pos2Put({id:"strength:"+date+":"+Date.now(),domain:"fitness",type:"strengthSet",date,exercise:ex,weight:w,reps:r,volume:w*r,updatedAt:now});
  } else if(type==="run"){
    const d=Number(document.getElementById("v2RD").value),t=Number(document.getElementById("v2RT").value);if(!d||!t)return;
    await pos2Put({id:"run:"+date,domain:"fitness",type:"run",date,distance:d,duration:t,pace:t/d,updatedAt:now});
  } else if(type==="study"){
    await pos2Put({id:"study:"+date,domain:"education",type:"studySession",date,duration:60,complete:true,updatedAt:now});
  } else if(type==="meal"){
    const meal=document.getElementById("v2Meal").value;
    await pos2Put({id:"meal:"+date+":"+meal,domain:"nutrition",type:"mealCompletion",date,meal,complete:true,updatedAt:now});
    try{nutritionToggle(meal,true)}catch(e){}
  }
  v2CloseDrawer();v2RenderCore();
  try{posRefreshIntegrated()}catch(e){}
}
