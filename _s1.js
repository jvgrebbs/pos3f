
const DATA={"start": "2026-08-17", "end": "2026-11-08", "weekNames": ["Establish", "Build", "Progress", "Adapt", "Power", "Halfway", "Operator", "Exam Ready", "Perform", "Push", "Finisher", "Complete"], "running": ["1 min run / 2 min walk × 10", "1.5 min run / 2 min walk × 10", "2 min run / 2 min walk × 10", "3 min run / 2 min walk × 8", "4 min run / 2 min walk × 7", "5 min run / 2 min walk × 6", "8 min run / 2 min walk × 5", "10 min run / 2 min walk × 4", "15 min easy run / 2 min walk × 3", "20 min easy run / 2 min walk × 2", "30–35 min continuous easy run", "40–45 min continuous easy run"], "study": ["OSI model + TCP/IP model", "IPv4 addressing and binary", "Switching and VLANs", "DHCP and DNS", "Network segmentation", "Troubleshooting methodology", "PBQ scenarios", "Practice exams", "Weak-domain remediation", "Mixed review", "Final review", "Certification completion"], "dinners": [["Chicken fajitas + rice + black beans", "Beef spaghetti + salad", "Bowling Alley Dinner", "Chicken taco bowls", "BBQ chicken wraps + vegetables", "Beef & bean chili shortcut + cornbread", "Lemon garlic chicken + microwave rice + broccoli"], ["Chicken stir-fry + rice", "Chicken meatballs + marinara pasta", "Bowling Alley Dinner", "Beef & bean burrito bowls", "Chicken quesadillas + corn", "Beef taco skillet + rice", "Rotisserie chicken + sweet potatoes + broccoli"], ["Chicken teriyaki bowls + vegetables", "Beef taco pasta", "Bowling Alley Dinner", "Chicken burrito bowls", "Chicken parmesan-style cutlets + pasta + salad", "White chicken chili shortcut + cornbread", "Garlic chicken + potatoes + green beans"], ["Chicken fajita bowls", "Beef meatloaf-style skillet + potatoes", "Bowling Alley Dinner", "Chicken taco salad bowls", "Chicken pesto pasta + vegetables", "Beef chili shortcut + rice", "Honey garlic chicken + roasted vegetables"], ["Chicken curry + microwave rice + vegetables", "Chicken sausage pasta + vegetables", "Bowling Alley Dinner", "Beef & broccoli rice bowls", "BBQ chicken sandwiches + slaw", "Chicken tortilla soup shortcut + cornbread", "Lemon herb chicken + potatoes + carrots"], ["Chicken burrito bowls", "Chicken meatballs + rice + vegetables", "Bowling Alley Dinner", "Beef stuffed pepper skillet + rice", "Chicken tacos + black beans", "Chicken shepherd's-pie skillet", "Sheet-pan chicken fajitas + vegetables"], ["Chicken stir-fry + noodles", "Beef spaghetti + garlic bread + salad", "Bowling Alley Dinner", "Chicken taco bowls", "Chicken enchilada skillet + salad", "Beef burger bowls + roasted potatoes", "Lemon pepper chicken + rice + broccoli"], ["Chicken fajitas + beans", "Chicken sausage pasta + vegetables", "Bowling Alley Dinner", "Beef teriyaki bowls + vegetables", "Chicken Alfredo-style pasta + broccoli", "Chicken taco soup shortcut + cornbread", "Mediterranean chicken bowls + microwave rice"], ["Chicken curry bowls", "Beef taco skillet + rice", "Bowling Alley Dinner", "Chicken & black bean burritos", "BBQ chicken + baked potatoes + vegetables", "Beef chili mac shortcut", "Greek-style lemon chicken + potatoes + salad"], ["Chicken stir-fry + rice", "Chicken meatballs + pasta + vegetables", "Bowling Alley Dinner", "Beef taco bowls", "Chicken burrito casserole skillet + salad", "Chicken burgers + sweet potato fries", "Garlic chicken + vegetables"], ["Chicken fajita bowls", "Beef spaghetti + salad", "Bowling Alley Dinner", "Chicken & vegetable rice skillet", "Chicken parmesan-style cutlets + roasted vegetables", "White chicken chili shortcut + cornbread", "BBQ chicken + corn + potatoes"], ["Chicken teriyaki rice bowls", "Beef taco skillet + potatoes", "Bowling Alley Dinner", "Chicken taco salad bowls", "Chicken enchilada skillet + beans", "Chicken shepherd's-pie skillet", "Lemon herb chicken + rice + roasted vegetables"]], "strength": {"Monday": "Lower Strength — Back Squat 5×5 • RDL 4×8 • Leg Press 3×10 • Walking Lunges 3×12/leg", "Tuesday": "Push Strength — Bench Press 5×5 • Incline DB Press 4×8 • OHP 4×6 • Lateral Raises 3×15", "Thursday": "Lower Hypertrophy — Front Squat 4×8 • Bulgarian Split Squat 3×10 • Leg Curl 4×12", "Friday": "Upper Hypertrophy — Incline Bench 4×8 • Chest-Supported Row 4×10 • DB Shoulder Press 3×10", "Saturday": "Full Body — Trap Bar Deadlift 4×6 • Goblet Squat 3×12 • DB Bench 3×12 • Cable Row 3×12"}, "chores": {"Monday": "Bathrooms", "Tuesday": "Master Bedroom", "Wednesday": "Sweep", "Thursday": "Kitchen & Dining Room", "Friday": "Living Room & Office", "Saturday": "Sweep & Mop"}};
let selected=new Date(); selected.setHours(12,0,0,0);
window.POS_LEGACY_STATE=JSON.parse((()=>{try{return localStorage.getItem('lifeOSState')||'{}'}catch(e){return '{}'}})());

function iso(d){return d.toISOString().slice(0,10)}
function localDate(y,m,d){return new Date(y,m,d)}
window.POS_CAMPAIGN_START=localDate(2026,7,17); window.POS_CAMPAIGN_END=localDate(2026,10,8);

function weekFor(d){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const diff=Math.floor((x-window.POS_CAMPAIGN_START)/86400000);
  return diff>=0 && diff<84 ? Math.floor(diff/7)+1 : null;
}
function dayName(d){return d.toLocaleDateString(undefined,{weekday:'long'})}
function dateLabel(d){return d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
function add(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function save(){localStorage.setItem('lifeOSState',JSON.stringify(POS_LEGACY_STATE))}

function buildEvents(d,w){
  const day=dayName(d), ev=[];
  if(w && ['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(day))
    ev.push(['04:45–05:45','RUNNING',DATA.running[w-1]]);
  if(day==='Saturday') ev.push(['08:00–10:00','STRENGTH',DATA.strength.Saturday]);
  if(day==='Sunday') ev.push(['08:30–10:00','PERSONAL', 'Church']);
  if(['Monday','Tuesday','Thursday','Friday'].includes(day))
    ev.push(['16:00–17:30','STRENGTH',DATA.strength[day]]);
  if(day==='Wednesday') ev.push(['16:00–16:30','HOUSEHOLD','Sweep']);
  if(day==='Wednesday') ev.push(['17:30–20:00','BOWLING','Bowling + dinner']);
  else if(w) ev.push(['17:30–18:00','MEAL PREP','Prepare the scheduled meal']);
  if(w && day!=='Wednesday') ev.push(['18:00–18:30','DINNER',DATA.dinners[w-1][['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(day)]]);
  if(DATA.chores[day]) ev.push([day==='Saturday'?'10:00–11:00':'18:30–19:00','HOUSEHOLD',DATA.chores[day]]);
  if(w) ev.push([day==='Wednesday'?'20:00–21:00':'19:00–20:00','NETWORK+',DATA.study[w-1]]);
  return ev;
}

function buildTasks(d,w){
  const day=dayName(d), tasks=[];
  if(w && ['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(day)) tasks.push(['run','Running',DATA.running[w-1]]);
  if(w && DATA.strength[day]) tasks.push(['strength','Strength',DATA.strength[day]]);
  if(w) tasks.push(['study','Network+',DATA.study[w-1]]);
  if(w && day!=='Wednesday') tasks.push(['meal','Dinner',DATA.dinners[w-1][['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(day)]]);
  if(DATA.chores[day]) tasks.push(['chore','Chore',DATA.chores[day]]);
  return tasks;
}


const workoutSets = {
  Monday: [
    ["Back Squat","5","5"],["RDL","4","8"],["Leg Press","3","10"],
    ["Walking Lunges","3","12"],["Calf Raises","4","15"],["Plank","3","60"]
  ],
  Tuesday: [
    ["Bench Press","5","5"],["Incline DB Press","4","8"],["Overhead Press","4","6"],
    ["Lateral Raises","3","15"],["Pushdowns / Extension","3","12"]
  ],
  Thursday: [
    ["Front Squat","4","8"],["Bulgarian Split Squat","3","10"],["Leg Curl","4","12"],
    ["Leg Extension","3","12"],["Calf Raise","4","15"],["Hanging Leg Raise","3","15"]
  ],
  Friday: [
    ["Incline Bench","4","8"],["Chest-Supported Row","4","10"],["DB Shoulder Press","3","10"],
    ["Lat Pulldown","3","12"],["Lateral Raise","3","15"],["Curls","3","12"],["Rope Pushdown","3","12"]
  ],
  Saturday: [
    ["Trap Bar Deadlift","4","6"],["Goblet Squat","3","12"],["DB Bench Press","3","12"],
    ["Seated Cable Row","3","12"],["Farmer Carries","4","40 yd"],["Sled Push / Assault Bike","—","—"]
  ]
};

function strengthKey(){ return iso(window.strengthLogDate || selected)+'-strength'; }

function getWorkoutLog(){
  return POS_LEGACY_STATE[strengthKey()] || {};
}

function saveWorkoutLog(log){
  POS_LEGACY_STATE[strengthKey()] = log;
  save();
  const indicator=document.getElementById('saveIndicator');
  if(indicator){
    indicator.textContent='Saved locally';
    clearTimeout(window.__saveTimer);
    window.__saveTimer=setTimeout(()=>indicator.textContent='Saved',900);
  }
}

function renderStrengthLog(){
  const card=document.getElementById('strengthCard');
  const form=document.getElementById('strengthForm');
  const sub=document.getElementById('strengthSubtitle');
  if(!card || !form) return;

  const w=weekFor(selected), day=dayName(selected);
  card.style.display='block';

  // The strength logger remains accessible even when today is not a strength day.
  // Default to the selected date; if that date has no workout, show the next available
  // strength day so the user can immediately see the fillable set-by-set form.
  let logDate = new Date(selected);
  let logDay = dayName(logDate);
  if(!workoutSets[logDay]){
    const candidates=['Monday','Tuesday','Thursday','Friday','Saturday'];
    for(let n=0;n<7;n++){
      const candidate=add(logDate,n);
      if(workoutSets[dayName(candidate)]){ logDate=candidate; break; }
    }
  }
  window.strengthLogDate = logDate;
  const lw=weekFor(logDate), lday=dayName(logDate);
  sub.innerHTML=`<strong>${dateLabel(logDate)}</strong> • Week ${lw||'—'} • ${lday} • Enter actual <strong>weight</strong> and <strong>reps</strong> for every set.`;


  const originalSelected=selected;
  selected=window.strengthLogDate || selected;
  const log=getWorkoutLog();
  let cards='';

  workoutSets[dayName(selected)].forEach((ex,ei)=>{
    const sets=parseInt(ex[1]) || 0;
    const exerciseLog=log[ei] || {};
    let setRows='';

    for(let si=0;si<sets;si++){
      const rec=exerciseLog[si] || {};
      setRows += `
        <div class="set-row">
          <div class="set-label">SET ${si+1}</div>
          <div class="field-group">
            <label>WEIGHT <span>(lb)</span></label>
            <input class="weight-field exercise-input" type="number" inputmode="decimal"
              step="0.5" min="0" placeholder="0"
              value="${rec.weight??''}" data-e="${ei}" data-s="${si}" data-f="weight">
          </div>
          <div class="field-group">
            <label>REPS</label>
            <input class="reps-field exercise-input" type="number" inputmode="numeric"
              step="1" min="0" placeholder="0"
              value="${rec.reps??''}" data-e="${ei}" data-s="${si}" data-f="reps">
          </div>
          <div class="set-volume" id="setVolume-${ei}-${si}">—</div>
        </div>`;
    }

    cards += `
      <div class="exercise-entry" id="exerciseCard-${ei}">
        <div class="exercise-entry-header">
          <div>
            <div class="exercise-title">${ex[0]}</div>
            <div class="exercise-target">Prescribed: ${ex[1]} sets × ${ex[2]} reps</div>
          </div>
          <div class="exercise-status" id="exerciseStatus-${ei}">Not started</div>
        </div>

        <div class="set-header">
          <div>SET</div><div>WEIGHT</div><div>REPS</div><div>VOLUME</div>
        </div>
        <div>${setRows}</div>

        <div class="exercise-entry-footer">
          <div><strong id="exerciseVolume-${ei}">0 lb</strong><span class="small"> exercise volume</span></div>
          <label class="done-check">
            <input type="checkbox" id="exerciseDone-${ei}" data-exdone="${ei}" ${exerciseLog.done?'checked':''}>
            Mark exercise complete
          </label>
        </div>

        <input class="exercise-note-input" type="text"
          placeholder="Notes for ${ex[0]}..."
          value="${exerciseLog.note??''}" data-e="${ei}" data-note="1">
      </div>`;
  });

  form.innerHTML=cards + `
    <div class="workout-summary">
      <div><span class="small">SETS LOGGED</span><strong id="logSets">0</strong></div>
      <div><span class="small">TOTAL VOLUME</span><strong id="logVolume">0 lb</strong></div>
      <div><span class="small">WORKOUT</span><strong id="logStatus">Not started</strong></div>
    </div>
    <textarea id="workoutNotes" class="workout-notes" placeholder="Overall workout notes...">${log.notes||''}</textarea>`;

  form.querySelectorAll('.exercise-input').forEach(el=>{
    el.addEventListener('input',()=>{
      const e=+el.dataset.e, s=+el.dataset.s, f=el.dataset.f;
      const current=getWorkoutLog();
      if(!current[e]) current[e]={};
      if(!current[e][s]) current[e][s]={};
      current[e][s][f]=el.value;
      saveWorkoutLog(current);
      updateStrengthSummary();
    });
  });

  form.querySelectorAll('[data-exdone]').forEach(el=>{
    el.addEventListener('change',()=>{
      const e=+el.dataset.exdone;
      const current=getWorkoutLog();
      if(!current[e]) current[e]={};
      current[e].done=el.checked;
      saveWorkoutLog(current);
      updateStrengthSummary();
    });
  });

  form.querySelectorAll('.exercise-note-input').forEach(el=>{
    el.addEventListener('input',()=>{
      const e=+el.dataset.e;
      const current=getWorkoutLog();
      if(!current[e]) current[e]={};
      current[e].note=el.value;
      saveWorkoutLog(current);
    });
  });

  document.getElementById('workoutNotes').addEventListener('input',e=>{
    const current=getWorkoutLog();
    current.notes=e.target.value;
    saveWorkoutLog(current);
  });

  updateStrengthSummary();
  selected=originalSelected;
}

function updateStrengthSummary(){
  const logDate=window.strengthLogDate || selected;
  const w=weekFor(logDate), day=dayName(logDate);
  if(!w || !workoutSets[day]) return;

  const priorSelected=selected;
  selected=logDate;
  const log=getWorkoutLog();
  selected=priorSelected;
  let completedSets=0, totalVolume=0, targetSets=0, completedExercises=0;

  workoutSets[day].forEach((ex,ei)=>{
    const sets=parseInt(ex[1])||0;
    targetSets += sets;
    let exerciseVolume=0, exerciseSets=0;

    for(let si=0;si<sets;si++){
      const rec=log[ei]?.[si]||{};
      const weight=Number(rec.weight)||0;
      const reps=Number(rec.reps)||0;
      const volume=weight*reps;

      if(weight>0 || reps>0) exerciseSets++;
      if(weight>0 && reps>0){
        completedSets++;
        exerciseVolume += volume;
        totalVolume += volume;
      }

      const setVol=document.getElementById(`setVolume-${ei}-${si}`);
      if(setVol) setVol.textContent=volume>0 ? `${Math.round(volume).toLocaleString()} lb` : '—';
    }

    const explicitDone=!!log[ei]?.done;
    if(explicitDone) completedExercises++;

    const status=document.getElementById(`exerciseStatus-${ei}`);
    const volumeEl=document.getElementById(`exerciseVolume-${ei}`);
    const card=document.getElementById(`exerciseCard-${ei}`);

    if(status){
      status.textContent=explicitDone ? '✓ COMPLETE' :
        (exerciseSets===sets ? 'ALL SETS LOGGED' :
        (exerciseSets>0 ? `${exerciseSets}/${sets} SETS` : 'NOT STARTED'));
      status.classList.toggle('complete',explicitDone);
    }
    if(volumeEl) volumeEl.textContent=`${Math.round(exerciseVolume).toLocaleString()} lb`;
    if(card) card.classList.toggle('complete',explicitDone);
  });

  document.getElementById('logSets').textContent=`${completedSets} / ${targetSets}`;
  document.getElementById('logVolume').textContent=`${Math.round(totalVolume).toLocaleString()} lb`;
  document.getElementById('logStatus').textContent=
    completedExercises===workoutSets[day].length ? 'COMPLETE' :
    (completedSets>0 ? 'IN PROGRESS' : 'NOT STARTED');
}

function clearWorkout(){
  if(!confirm('Clear the strength log for this date?')) return;
  delete POS_LEGACY_STATE[strengthKey()];
  save();
  render();
}


function setStrengthLogDate(dateObj){
  window.strengthLogDate=new Date(dateObj);
  const picker=document.getElementById('strengthDatePicker');
  if(picker) picker.value=iso(window.strengthLogDate);
  renderStrengthLog();
}
function changeStrengthDate(direction){
  let d=new Date(window.strengthLogDate || selected);
  const days=['Monday','Tuesday','Thursday','Friday','Saturday'];
  for(let i=0;i<14;i++){
    d=add(d,direction);
    if(days.includes(dayName(d)) && weekFor(d)){
      setStrengthLogDate(d);
      return;
    }
  }
}
document.addEventListener('change',function(e){
  if(e.target && e.target.id==='strengthDatePicker'){
    const parts=e.target.value.split('-').map(Number);
    if(parts.length===3) setStrengthLogDate(new Date(parts[0],parts[1]-1,parts[2]));
  }
});

function render(){
  try {

  const w=weekFor(selected), day=dayName(selected), k=iso(selected);
  document.getElementById('title').textContent=w?`Week ${w} • ${DATA.weekNames[w-1]}`:'Personal Operating Dashboard';
  document.getElementById('subtitle').textContent=dateLabel(selected);
  document.getElementById('dateLabel').textContent=dateLabel(selected);
  document.getElementById('mode').textContent=w?'EXECUTION DAY':(selected<window.POS_CAMPAIGN_START?'PRE-CAMPAIGN':'CAMPAIGN COMPLETE');
  document.getElementById('mWeek').textContent=w?`${w} / 12`:'—';
  document.getElementById('mRun').textContent=(w&&['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(day))?'Scheduled':'—';
  document.getElementById('mStudy').textContent=w?'1 hour':'—';

  const ev=buildEvents(selected,w);
  document.getElementById('schedule').innerHTML=ev.length?ev.map(e=>`<div class="event"><div class="time">${e[0]}</div><div><div class="tag">${e[1]}</div><div>${e[2]}</div></div></div>`).join(''):'<div class="small">No campaign schedule for this date.</div>';

  const tasks=buildTasks(selected,w);
  document.getElementById('tasks').innerHTML=tasks.length?tasks.map(t=>{
    const id=k+'-'+t[0], done=!!POS_LEGACY_STATE[id];
    return `<label class="task ${done?'done':''}"><input type="checkbox" ${done?'checked':''} onchange="toggle('${id}',this.checked)"><span><strong>${t[1]}</strong><br><span class="small">${t[2]}</span></span></label>`;
  }).join(''):'<div class="small" style="margin-top:10px">Nothing to execute today.</div>';
  updateCompletion(tasks,k);

  document.getElementById('focusTitle').textContent=w?`Week ${w} focus • ${DATA.weekNames[w-1]}`:'Campaign status';
  document.getElementById('focusText').textContent=w?
    'Execute the schedule. Do not replanning during execution time. The selected date controls what appears here.':
    (selected<window.POS_CAMPAIGN_START?'Your 12-week campaign begins August 17, 2026.':'The 12-week campaign is complete.');

  document.getElementById('weeks').innerHTML=DATA.weekNames.map((n,i)=>`<div class="week ${w===i+1?'current':''}"><div class="small">Week ${i+1}</div><h3>${n}</h3><div class="bar progressbar"><span style="width:${w&&i+1<w?100:(w===i+1?10:0)}%"></span></div></div>`).join('');
    renderStrengthLog();
    try{renderFitnessEngine()}catch(e){console.warn('Fitness engine render failed',e)}
    setHealth('OK','Dashboard, date navigation, execution view, and strength log initialized.');
  } catch (error) {
    console.error('Personal OS render error:', error);
    setHealth('ERROR', 'Core application error: ' + (error.message || error));
  }
}

function setHealth(status, detail){
  const badge=document.getElementById('healthStatus');
  const text=document.getElementById('healthDetails');
  if(!badge || !text) return;
  badge.textContent=status;
  badge.classList.toggle('health-ok',status==='OK');
  badge.classList.toggle('health-error',status==='ERROR');
  text.textContent=detail;
  const dm=document.getElementById('dataModelStatus');
  if(dm && window.POS_DATA_MODEL){
    dm.textContent='Data model v'+POS_DATA_MODEL.version+' • Planning / Execution / User Data separated';
  }
}

function updateCompletion(tasks,k){
  const done=tasks.filter(t=>POS_LEGACY_STATE[k+'-'+t[0]]).length, total=tasks.length;
  const pct=total?Math.round(done/total*100):0;
  document.getElementById('mDone').textContent=pct+'%';
  document.getElementById('mDoneText').textContent=`${done} of ${total} complete`;
  document.getElementById('completionText').textContent=`${done} of ${total} complete`;
  document.getElementById('dayBar').style.width=pct+'%';
}
function toggle(id,val){POS_LEGACY_STATE[id]=val;save();render()}
function moveDay(n){
  const next=add(new Date(selected),n);
  if(!(next instanceof Date) || isNaN(next.getTime())) return;
  selected=next;
  render();
  try{posRefreshIntegrated()}catch(e){}
  try{execRender()}catch(e){}
  try{renderNutrition()}catch(e){}
  try{renderEducation()}catch(e){}
  try{renderTodayDashboard()}catch(e){}
}
function goToday(){
  selected=new Date();
  selected.setHours(12,0,0,0);
  render();
  try{posRefreshIntegrated()}catch(e){}
  try{execRender()}catch(e){}
  try{renderNutrition()}catch(e){}
  try{renderEducation()}catch(e){}
  try{renderTodayDashboard()}catch(e){}
}

function xmlEscape(value){
  return String(value??'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&apos;');
}
function excelCell(value, type='String'){
  return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
}
function exportStrengthExcel(){
  const rows=[];
  rows.push(['Date','Week','Day','Exercise','Target Sets','Target Reps','Set','Weight (lb)','Reps','Set Volume (lb)','Exercise Complete','Exercise Notes','Workout Notes']);

  const startDate=new Date(2026,7,17);
  const endDate=new Date(2026,10,8);

  for(let d=new Date(startDate); d<=endDate; d.setDate(d.getDate()+1)){
    const day=dayName(d), w=weekFor(d);
    if(!w || !workoutSets[day]) continue;

    const oldSelected=selected;
    selected=new Date(d);
    const log=getWorkoutLog();
    selected=oldSelected;

    workoutSets[day].forEach((ex,ei)=>{
      const sets=parseInt(ex[1])||0;
      const exLog=log[ei]||{};
      for(let si=0;si<sets;si++){
        const rec=exLog[si]||{};
        const weight=Number(rec.weight)||0;
        const reps=Number(rec.reps)||0;
        rows.push([
          iso(d), w, day, ex[0], ex[1], ex[2], si+1,
          rec.weight??'', rec.reps??'', weight*reps,
          exLog.done?'Yes':'No', exLog.note||'', log.notes||''
        ]);
      }
    });
  }

  if(rows.length===1){
    alert('There is no strength workout data to export yet.');
    return;
  }

  // Excel 2003 XML / SpreadsheetML. Excel opens this as a native workbook.
  const styles = `
    <Styles>
      <Style ss:ID="Default" ss:Name="Normal">
        <Alignment ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="11"/>
      </Style>
      <Style ss:ID="Header">
        <Font ss:Bold="1" ss:Color="#FFFFFF"/>
        <Interior ss:Color="#1F4E78" ss:Pattern="Solid"/>
      </Style>
      <Style ss:ID="Date">
        <NumberFormat ss:Format="yyyy-mm-dd"/>
      </Style>
    </Styles>`;

  let body='';
  rows.forEach((row,ri)=>{
    body += '<Row>';
    row.forEach((v,ci)=>{
      let type='String';
      if(ri>0 && [1,4,5,6,7,8,9].includes(ci) && v!=='' && !isNaN(Number(v))) type='Number';
      body += excelCell(v,type);
    });
    body += '</Row>';
  });

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${styles}
 <Worksheet ss:Name="Strength Log">
  <Table>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob=new Blob([xml],{type:'application/vnd.ms-excel'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='Strength_Training_Log_'+new Date().toISOString().slice(0,10)+'.xls';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
window.strengthLogDate=new Date(); render();
