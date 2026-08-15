
/* PERSONAL OS — FINAL EXECUTION UX */
(function(){
  let session=null;

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function today(){try{return typeof selected!=="undefined"?selected:new Date()}catch(e){return new Date()}}
  function dateKey(){return iso(today())}

  window.posrefStartWorkout=function(){
    let p=null;try{p=pos23StrengthPlanForToday()}catch(e){}
    if(!p){if(typeof pos21Quick==="function")pos21Quick("strength");return}
    session={plan:p,exerciseIndex:0,setIndex:0,sets:[],startedAt:new Date().toISOString()};
    document.getElementById("posrefWorkout").classList.add("open");
    posrefRenderWorkout();
  }
  window.posrefCloseWorkout=function(){
    if(session && session.sets.length && !confirm("Exit workout? Completed sets are saved, but the session will remain incomplete."))return;
    document.getElementById("posrefWorkout").classList.remove("open");
  }
  function currentExercise(){return session?.plan?.items?.[session.exerciseIndex]||null}
  function completedSetsForCurrent(){return session.sets.filter(x=>x.exercise===currentExercise()?.name).length}

  async function posrefSaveSet(){
    const ex=currentExercise();if(!ex)return;
    const w=Number(document.getElementById("posrefWeight")?.value),r=Number(document.getElementById("posrefReps")?.value);
    if(!w||!r)return;
    const setNo=completedSetsForCurrent()+1;
    try{await pos21SaveStrengthSet(pos21Date(),ex.name,setNo,w,r,{weight:ex.targetWeight,reps:ex.reps})}catch(e){}
    session.sets.push({exercise:ex.name,set:setNo,weight:w,reps:r});
    if(setNo>=ex.sets){
      if(session.exerciseIndex<session.plan.items.length-1){session.exerciseIndex++;session.setIndex=0}
      else{
        try{await pos21WriteExecution({id:"workout:"+dateKey()+":refined",domain:"fitness",type:"executionRecord",date:dateKey(),planned:{programId:session.plan.programId,program:session.plan.program,week:session.plan.week,day:session.plan.scheduledDay},actual:{completed:true,sets:session.sets},status:"complete"})}catch(e){}
        try{await pos24BuildStrengthRecommendations()}catch(e){}
        posrefRenderWorkout(true);return;
      }
    }
    posrefRenderWorkout();
  }

  window.posrefNextSet=posrefSaveSet;

  function posrefRenderWorkout(done=false){
    const body=document.getElementById("posrefWorkoutBody"),state=document.getElementById("posrefWorkoutState");
    if(done){
      state.textContent="COMPLETE";state.className="posref-statuspill green";
      const strength=session.plan;
      body.innerHTML=`<div class="posref-workout-title">Workout Complete</div>
        <div class="posref-workout-sub">${esc(strength.name)} • Week ${strength.week}</div>
        <div class="posref-recommend"><b>Adaptive recommendation</b><span>Your completed performance has been saved. Open Adaptive to review the next-target recommendation.</span></div>
        <button class="posref-next" onclick="posrefCloseWorkout();pos24Open()">Review Recommendation</button>`;
      return;
    }
    state.textContent="IN PROGRESS";state.className="posref-statuspill blue";
    const ex=currentExercise(),doneSets=completedSetsForCurrent(),total=session.plan.items.length;
    const pct=Math.round(((session.exerciseIndex+(doneSets/ex.sets))/total)*100);
    const last=session.sets.filter(x=>x.exercise===ex.name).slice(-1)[0];
    body.innerHTML=`
      <div class="posref-workout-title">${esc(session.plan.name)}</div>
      <div class="posref-workout-sub">Week ${session.plan.week} • ${esc(session.plan.scheduledDay?"Day "+session.plan.scheduledDay:"Today")}</div>
      <div class="posref-progress"><div style="width:${Math.min(100,pct)}%"></div></div>
      <div class="posref-progress-text">${session.exerciseIndex+1} of ${total} exercises • ${doneSets} of ${ex.sets} sets</div>
      <div class="posref-exercise-name">${esc(ex.name)}</div>
      <div class="posref-target">Target: ${ex.sets} × ${ex.reps}${ex.targetWeight?" • "+ex.targetWeight+" lb":""}</div>
      ${last?`<div class="posref-recommend"><b>Last set: ${last.weight} lb × ${last.reps}</b><span>Use this as a reference for the next set.</span></div>`:""}
      <div class="posref-set-card">
        <div class="posref-small" style="font-size:9px;color:#9aa6b2;font-weight:900">SET ${doneSets+1}</div>
        <div class="posref-set-row" style="margin-top:8px">
          <div><label>WEIGHT (LB)</label><input class="posref-touch" id="posrefWeight" inputmode="decimal" type="number" step=".5" value="${last?.weight||ex.targetWeight||""}" autofocus></div>
          <div><label>REPS</label><input class="posref-touch" id="posrefReps" inputmode="numeric" type="number" value="${ex.reps}"></div>
        </div>
        <button class="posref-next" onclick="posrefNextSet()">${doneSets+1>=ex.sets?"Complete Exercise":"Save Set & Next"}</button>
      </div>`;
  }

  /* Re-route the primary workout entry point to the focused execution experience. */
  document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
      if(typeof window.pos21Quick==="function" && !window.__posrefQuickWrapped){
        const original=window.pos21Quick;
        window.pos21Quick=function(type){
          if(type==="strength"){posrefStartWorkout();return}
          return original(type);
        };
        window.__posrefQuickWrapped=true;
      }
    },800);
  });
})();
