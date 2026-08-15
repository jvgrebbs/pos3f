
/* PHASE 3 — Fitness Engine */
const FITNESS_KEY = "pos:0.2:userData:fitnessEngine";
const STRENGTH_ENGINE_KEY = "pos:0.2:userData:strengthHistory";
const RUN_ENGINE_KEY = "pos:0.2:userData:runningHistory";
const BODY_ENGINE_KEY = "pos:0.2:userData:bodyMetrics";

function fitnessRead(key,fallback={}){
  try{const x=localStorage.getItem(key);return x?JSON.parse(x):fallback}catch(e){return fallback}
}
function fitnessWrite(key,value){
  localStorage.setItem(key,JSON.stringify(value));
}
function fitnessWeek(){
  const w=weekFor(selected);
  return w || 1;
}
function renderFitnessEngine(){
  const strength=document.getElementById("fitnessStrengthPanel");
  const running=document.getElementById("fitnessRunningPanel");
  const body=document.getElementById("fitnessBodyPanel");
  if(!strength||!running||!body)return;
  const w=fitnessWeek(), d=dayName(selected);

  const strengthHistory=fitnessRead(STRENGTH_ENGINE_KEY,{});
  const runHistory=fitnessRead(RUN_ENGINE_KEY,{});
  const bodyMetrics=fitnessRead(BODY_ENGINE_KEY,{});

  let totalLogged=0,totalSets=0,totalVolume=0;
  Object.values(strengthHistory).forEach(day=>{
    (day.exercises||[]).forEach(ex=>{
      (ex.sets||[]).forEach(s=>{
        if(Number(s.weight)>0&&Number(s.reps)>0){
          totalLogged++; totalVolume+=Number(s.weight)*Number(s.reps);
        }
      });
    });
  });
  totalSets=Math.max(totalLogged,0);

  strength.innerHTML=`
    <div class="fitness-grid">
      <div class="fitness-stat"><div class="small">Current Week</div><strong>Week ${w}</strong></div>
      <div class="fitness-stat"><div class="small">Logged Sets</div><strong>${totalSets}</strong></div>
      <div class="fitness-stat"><div class="small">Logged Volume</div><strong>${Math.round(totalVolume).toLocaleString()} lb</strong></div>
    </div>
    <div class="engine-note"><strong>${d}</strong> — Strength performance is tracked by exercise, set, weight, and reps. Previous performance is retained for progression calculations.</div>
    <div class="fitness-form">
      <div><label>Exercise</label><input id="feExercise" placeholder="e.g. Back Squat"></div>
      <div><label>Set</label><input id="feSet" type="number" min="1" step="1" value="1"></div>
      <div><label>Weight (lb)</label><input id="feWeight" type="number" min="0" step="0.5"></div>
      <div><label>Reps</label><input id="feReps" type="number" min="0" step="1"></div>
    </div>
    <button type="button" style="margin-top:9px" onclick="fitnessLogStrength()">Log Strength Set</button>
    <div id="strengthEngineMessage" class="engine-note"></div>`;

  running.innerHTML=`
    <div class="fitness-grid">
      <div class="fitness-stat"><div class="small">Week</div><strong>${w}</strong></div>
      <div class="fitness-stat"><div class="small">Runs Logged</div><strong>${Object.keys(runHistory).length}</strong></div>
      <div class="fitness-stat"><div class="small">Total Distance</div><strong>${Object.values(runHistory).reduce((a,x)=>a+(Number(x.distance)||0),0).toFixed(1)} mi</strong></div>
    </div>
    <div class="fitness-form">
      <div><label>Date</label><input id="feRunDate" type="date" value="${iso(selected)}"></div>
      <div><label>Distance (mi)</label><input id="feRunDistance" type="number" min="0" step="0.01"></div>
      <div><label>Duration (min)</label><input id="feRunDuration" type="number" min="0" step="0.1"></div>
      <div><label>RPE</label><input id="feRunRPE" type="number" min="1" max="10" step="1"></div>
    </div>
    <button type="button" style="margin-top:9px" onclick="fitnessLogRun()">Log Run</button>
    <div class="engine-note">Running records calculate distance, duration, pace, and weekly progression.</div>`;

  const latestDates=Object.keys(bodyMetrics).sort();
  const latest=latestDates.length?bodyMetrics[latestDates[latestDates.length-1]]:{};
  body.innerHTML=`
    <div class="fitness-grid">
      <div class="fitness-stat"><div class="small">Latest Weight</div><strong>${latest.weight?latest.weight+" lb":"—"}</strong></div>
      <div class="fitness-stat"><div class="small">Goal Weight</div><strong>195 lb</strong></div>
      <div class="fitness-stat"><div class="small">Entries</div><strong>${latestDates.length}</strong></div>
    </div>
    <div class="fitness-form">
      <div><label>Date</label><input id="feBodyDate" type="date" value="${iso(selected)}"></div>
      <div><label>Weight (lb)</label><input id="feBodyWeight" type="number" min="0" step="0.1"></div>
    </div>
    <button type="button" style="margin-top:9px" onclick="fitnessLogBody()">Log Weight</button>
    <div class="engine-note">Body-weight trend is stored by date for future weekly-average and progression calculations.</div>`;
}
function fitnessLogStrength(){
  const key=iso(selected), data=fitnessRead(STRENGTH_ENGINE_KEY,{});
  if(!data[key])data[key]={date:key,week:fitnessWeek(),exercises:[]};
  const ex=document.getElementById("feExercise").value.trim();
  const set=Number(document.getElementById("feSet").value)||1;
  const weight=Number(document.getElementById("feWeight").value)||0;
  const reps=Number(document.getElementById("feReps").value)||0;
  if(!ex||weight<=0||reps<=0){document.getElementById("strengthEngineMessage").textContent="Enter exercise, weight, and reps.";return}
  let record=data[key].exercises.find(x=>x.name===ex);
  if(!record){record={name:ex,sets:[]};data[key].exercises.push(record)}
  record.sets=record.sets.filter(s=>s.set!==set);
  record.sets.push({set,weight,reps,volume:weight*reps});
  record.sets.sort((a,b)=>a.set-b.set);
  fitnessWrite(STRENGTH_ENGINE_KEY,data);
  document.getElementById("strengthEngineMessage").textContent=`Saved ${ex} — Set ${set}: ${weight} lb × ${reps} (${weight*reps} lb volume).`;
  renderFitnessEngine();
}
function fitnessLogRun(){
  const date=document.getElementById("feRunDate").value, dist=Number(document.getElementById("feRunDistance").value)||0;
  const duration=Number(document.getElementById("feRunDuration").value)||0, rpe=Number(document.getElementById("feRunRPE").value)||0;
  if(!date||dist<=0||duration<=0){return}
  const data=fitnessRead(RUN_ENGINE_KEY,{});
  data[date]={date,distance:dist,duration,rpe,pace:duration/dist};
  fitnessWrite(RUN_ENGINE_KEY,data); renderFitnessEngine();
}
function fitnessLogBody(){
  const date=document.getElementById("feBodyDate").value, weight=Number(document.getElementById("feBodyWeight").value)||0;
  if(!date||weight<=0)return;
  const data=fitnessRead(BODY_ENGINE_KEY,{});
  data[date]={date,weight};
  fitnessWrite(BODY_ENGINE_KEY,data); renderFitnessEngine();
}
document.addEventListener("click",e=>{
  if(e.target.classList.contains("fitness-tab")){
    document.querySelectorAll(".fitness-tab").forEach(b=>b.classList.remove("active"));
    e.target.classList.add("active");
    const tab=e.target.dataset.ftab;
    document.getElementById("fitnessStrengthPanel").style.display=tab==="strength"?"block":"none";
    document.getElementById("fitnessRunningPanel").style.display=tab==="running"?"block":"none";
    document.getElementById("fitnessBodyPanel").style.display=tab==="body"?"block":"none";
  }
});
