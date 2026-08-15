
/* PERSONAL OS 2.4 — ADAPTIVE ENGINE */
const POS24_VERSION="2.4.0";
const POS24_SCHEMA_VERSION=5;

function pos24Clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function pos24RoundWeight(n){return Math.round(n/5)*5}
function pos24Pct(actual,target){return target?actual/target:0}

async function pos24Executions(){
  const all=await pos2All();
  return all.filter(x=>["strengthSet","run","bodyMetric","mealCompletion","studySession","taskCompletion","executionRecord"].includes(x.type));
}
async function pos24StrengthHistory(exercise){
  const all=await pos24Executions();
  return all.filter(x=>x.type==="strengthSet" && x.actual && x.actual.weight && x.actual.reps &&
    (!exercise || (x.id||"").toLowerCase().includes(exercise.toLowerCase().replace(/\W+/g,"_"))))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}
async function pos24ExerciseHistory(exercise){
  const all=await pos24Executions();
  return all.filter(x=>x.type==="strengthSet" && x.actual && x.actual.weight && x.actual.reps &&
    JSON.stringify(x).toLowerCase().includes(exercise.toLowerCase())).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

/* Strength adaptation:
   - Full target completion at/above planned reps => +5 lb.
   - 90%+ completion => repeat.
   - <90% => repeat; repeated underperformance => -5 lb.
   This is intentionally conservative and transparent. */
function pos24StrengthRecommendation(targetWeight,targetReps,sets,actualSets,history=[]){
  const targetVol=(targetWeight||0)*(targetReps||0)*(sets||1);
  const actualVol=actualSets.reduce((a,s)=>a+(Number(s.weight)||0)*(Number(s.reps)||0),0);
  const targetRepTotal=(targetReps||0)*(sets||1);
  const actualRepTotal=actualSets.reduce((a,s)=>a+(Number(s.reps)||0),0);
  const completion=targetRepTotal?actualRepTotal/targetRepTotal:0;
  const failed=completion<0.9;
  const recent=history.slice(-3);
  const recentFailures=recent.filter(x=>x.actual&&x.planned&&Number(x.actual.reps||0)<Number(x.planned.reps||0)).length;
  let action="repeat",next=targetWeight||0,reason="Target not fully exceeded.";
  if(completion>=1){action="increase";next=pos24RoundWeight((targetWeight||0)+5);reason="All programmed reps were completed."}
  else if(failed && recentFailures>=2){action="reduce";next=pos24RoundWeight(Math.max(0,(targetWeight||0)-5));reason="Repeated underperformance suggests a small load reduction."}
  else if(completion>=0.9){action="repeat";next=targetWeight||0;reason="Performance was close; repeat to consolidate."}
  return {action,next,completion,actualVolume:actualVol,targetVolume:targetVol,reason};
}

/* Running adaptation:
   - Duration achieved within 5% => progress 5 min.
   - More than 10% short => repeat.
   - Completed with lower-than-target duration does not automatically increase intensity. */
function pos24RunRecommendation(targetDuration,targetDistance,actualDuration,actualDistance){
  const td=Number(targetDuration)||0,ad=Number(actualDuration)||0;
  const distanceTarget=Number(targetDistance)||0,actualDist=Number(actualDistance)||0;
  const durationRatio=td?ad/td:0,distanceRatio=distanceTarget?actualDist/distanceTarget:0;
  const completion=Math.max(durationRatio,distanceRatio||0);
  let action="repeat",nextDuration=td,reason="Repeat the programmed session.";
  if(completion>=0.95){action="progress";nextDuration=td?td+5:td;reason="Session was completed; progress duration conservatively."}
  else if(completion<0.9){action="repeat";reason="Session was materially short; repeat before progressing."}
  return {action,nextDuration,completion,reason};
}

/* General adherence signal */
async function pos24Adherence(days=7){
  const all=await pos24Executions();
  const since=new Date();since.setDate(since.getDate()-days+1);
  const rec=all.filter(x=>x.date && new Date(x.date+"T12:00:00")>=since);
  const completed=rec.filter(x=>x.status==="complete").length;
  return {records:rec.length,completed,rate:rec.length?Math.round(completed/rec.length*100):0};
}

/* Persist recommendations separately from program definitions and execution records. */
async function pos24SaveRecommendation(rec){
  return pos2Put({
    id:"recommendation:"+pos24Date()+":"+rec.key,
    domain:rec.domain||"system",
    type:"adaptiveRecommendation",
    date:pos24Date(),
    planned:rec.planned||null,
    actual:rec.actual||null,
    metrics:rec.metrics||{},
    status:"active",
    schemaVersion:POS24_SCHEMA_VERSION,
    updatedAt:new Date().toISOString()
  });
}
function pos24Date(){return iso(selected)}

async function pos24BuildStrengthRecommendations(){
  const plan=typeof pos23StrengthPlanForToday==="function"?pos23StrengthPlanForToday():null;
  if(!plan)return [];
  const results=[];
  for(const ex of plan.items){
    const hist=await pos24ExerciseHistory(ex.name);
    const last=hist[hist.length-1];
    const targetWeight=Number(ex.targetWeight)||Number(last?.actual?.weight)||0;
    const actualSets=hist.filter(x=>x.date===pos24Date()).map(x=>x.actual);
    if(!actualSets.length)continue;
    const rec=pos24StrengthRecommendation(targetWeight,Number(ex.reps),Number(ex.sets),actualSets,hist);
    const obj={key:"strength:"+ex.name.replace(/\W+/g,"_"),domain:"Fitness",exercise:ex.name,planned:{weight:targetWeight,reps:ex.reps,sets:ex.sets},actual:{sets:actualSets},metrics:{completion:rec.completion,action:rec.action},recommendation:{nextWeight:rec.next,reason:rec.reason}};
    await pos24SaveRecommendation(obj);results.push(obj);
  }
  return results;
}
async function pos24BuildRunRecommendation(){
  const plan=typeof pos23RunPlanForToday==="function"?pos23RunPlanForToday():null;if(!plan)return null;
  const all=await pos24Executions(),runs=all.filter(x=>x.type==="run"&&x.date===pos24Date()),last=runs[runs.length-1];if(!last)return null;
  const rec=pos24RunRecommendation(plan.duration,plan.distance,last.actual?.duration,last.actual?.distance);
  const obj={key:"run",domain:"Fitness",planned:{duration:plan.duration,distance:plan.distance},actual:last.actual,metrics:{completion:rec.completion},recommendation:{action:rec.action,nextDuration:rec.nextDuration,reason:rec.reason}};
  await pos24SaveRecommendation(obj);return obj;
}

/* Transparent recommendation view */
async function pos24Render(){
  const box=document.getElementById("pos24AdaptiveBody");if(!box)return;
  const adh=await pos24Adherence(7);
  let strength=[],run=null;
  try{strength=await pos24BuildStrengthRecommendations()}catch(e){}
  try{run=await pos24BuildRunRecommendation()}catch(e){}
  const plan=typeof pos23ProgramsForDate==="function"?pos23ProgramsForDate(selected):[];
  box.innerHTML=`
    <div class="pos24-grid">
      <div class="pos24-card"><div class="pos24-small">7-DAY EXECUTION</div><div class="pos24-strong">${adh.rate}%</div><div class="pos24-meter"><div style="width:${adh.rate}%"></div></div></div>
      <div class="pos24-card"><div class="pos24-small">PROGRAM WEEK</div><div class="pos24-strong">${typeof pos23Week==="function"?pos23Week(selected):"—"}</div></div>
      <div class="pos24-card"><div class="pos24-small">PROGRAM ACTIVITIES</div><div class="pos24-strong">${plan.length}</div></div>
    </div>
    <div class="pos24-card"><div class="pos24-strong">Today's adaptive recommendations</div>${strength.length?strength.map(r=>`<div class="pos24-row"><div>${posEscape(r.exercise)}</div><div><div class="pos24-strong">Next: ${r.recommendation.nextWeight||"—"} lb</div><div class="pos24-small">${posEscape(r.recommendation.reason)}</div></div><span class="pos24-chip ${r.metrics.action==="increase"?"good":r.metrics.action==="reduce"?"bad":"warn"}">${r.metrics.action.toUpperCase()}</span></div>`).join(""):"<div class='pos24-small' style='margin-top:8px'>Complete a programmed strength session to generate load recommendations.</div>"}
    ${run?`<div class="pos24-row"><div>Running</div><div><div class="pos24-strong">Next: ${run.recommendation.nextDuration} min</div><div class="pos24-small">${posEscape(run.recommendation.reason)}</div></div><span class="pos24-chip ${run.recommendation.action==="progress"?"good":"warn"}">${run.recommendation.action.toUpperCase()}</span></div>`:""}
    </div>
    <div class="pos24-callout"><div class="pos24-strong">Adaptive engine status</div><div class="pos24-small">Recommendations are conservative, explainable, and stored separately from the immutable program definition. They do not automatically alter future targets yet.</div></div>`;
}
function pos24Open(){document.getElementById("pos24AdaptiveCenter").classList.add("open");pos24Render()}
function pos24Close(){document.getElementById("pos24AdaptiveCenter").classList.remove("open")}

/* Recommendation helpers for Today/Program UI */
async function pos24NextTarget(exercise){
  const all=await pos2All();
  const recs=all.filter(x=>x.type==="adaptiveRecommendation"&&x.exercise===exercise).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return recs[recs.length-1]||null;
}
async function pos24RecommendationForToday(){
  const all=await pos2All();
  return all.filter(x=>x.type==="adaptiveRecommendation"&&x.date===pos24Date());
}

/* Keep recommendations from mutating the plan directly. */
function pos24ApplyRecommendationPreview(rec){
  if(!rec)return;
  return {...rec,previewOnly:true};
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{try{pos24Render()}catch(e){}},900));
