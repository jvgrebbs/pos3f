
/* PERSONAL OS 2.3 — DATA-DRIVEN PROGRAM ENGINE */
const POS23_SCHEMA_VERSION=4;
const POS23_APP_VERSION="2.3.0";
const POS23_PROGRAMS=[
{
 id:"fitness-strength-12w",domain:"Fitness",name:"12-Week Strength Program",weeks:12,
 days:[
  {day:1,name:"Upper A",type:"strength",items:[
   {name:"Bench Press",sets:5,reps:5,targetWeight:null},
   {name:"Barbell Row",sets:4,reps:8,targetWeight:null},
   {name:"Overhead Press",sets:3,reps:8,targetWeight:null},
   {name:"Lat Pulldown",sets:3,reps:10,targetWeight:null}]},
  {day:2,name:"Lower A",type:"strength",items:[
   {name:"Back Squat",sets:5,reps:5,targetWeight:null},
   {name:"Romanian Deadlift",sets:3,reps:8,targetWeight:null},
   {name:"Walking Lunge",sets:3,reps:10,targetWeight:null},
   {name:"Calf Raise",sets:3,reps:12,targetWeight:null}]},
  {day:4,name:"Upper B",type:"strength",items:[
   {name:"Incline Press",sets:4,reps:8,targetWeight:null},
   {name:"Seated Cable Row",sets:4,reps:8,targetWeight:null},
   {name:"Dumbbell Shoulder Press",sets:3,reps:10,targetWeight:null},
   {name:"Curl",sets:3,reps:10,targetWeight:null}]},
  {day:5,name:"Lower B",type:"strength",items:[
   {name:"Deadlift",sets:4,reps:5,targetWeight:null},
   {name:"Front Squat",sets:3,reps:8,targetWeight:null},
   {name:"Leg Curl",sets:3,reps:10,targetWeight:null},
   {name:"Plank",sets:3,reps:45,targetWeight:null}]}
 ]
},
{
 id:"running-12w",domain:"Fitness",name:"12-Week Running Program",weeks:12,
 days:[
  {day:2,name:"Easy Run",type:"run",duration:30,distance:null,intensity:"Easy"},
  {day:4,name:"Quality Run",type:"run",duration:35,distance:null,intensity:"Moderate"},
  {day:6,name:"Long Run",type:"run",duration:50,distance:null,intensity:"Easy"}
 ]
},
{
 id:"nutrition-12w",domain:"Nutrition",name:"12-Week Meal Program",weeks:12,
 days:[
  {day:1,name:"Monday",type:"meal",meals:["Greek Yogurt Bowl","Chicken Fajita Bowls"]},
  {day:2,name:"Tuesday",type:"meal",meals:["Egg & Oatmeal Breakfast","Beef Taco Bowls"]},
  {day:3,name:"Wednesday",type:"meal",meals:["Protein Oatmeal","Chicken Stir-Fry"]},
  {day:4,name:"Thursday",type:"meal",meals:["Egg Breakfast","Pasta with Lean Beef"]},
  {day:5,name:"Friday",type:"meal",meals:["Greek Yogurt Bowl","Chicken Quesadillas"]},
  {day:6,name:"Saturday",type:"meal",meals:["Protein Pancakes","Beef & Rice Bowls"]},
  {day:7,name:"Sunday",type:"meal",meals:["Egg & Oatmeal Breakfast","Sheet-Pan Chicken and Vegetables"]}
 ]
},
{
 id:"education-networkplus-8w",domain:"Education",name:"Network+ Study Program",weeks:8,
 days:[
  {day:1,name:"Study",type:"study",minutes:60,topic:"Networking Fundamentals"},
  {day:2,name:"Study",type:"study",minutes:60,topic:"Network Implementations"},
  {day:3,name:"Study",type:"study",minutes:60,topic:"Network Operations"},
  {day:4,name:"Study",type:"study",minutes:60,topic:"Network Security"},
  {day:5,name:"Study",type:"study",minutes:60,topic:"Troubleshooting"},
  {day:6,name:"Practice",type:"study",minutes:60,topic:"Practice Questions"},
  {day:7,name:"Review",type:"study",minutes:60,topic:"Weekly Review"}
 ]
}
];

function pos23Iso(d){return iso(d)}
function pos23Week(d=selected){return Math.max(1,Math.min(12,typeof posWeek==="function"?posWeek(d):1))}
function pos23Program(id){return POS23_PROGRAMS.find(p=>p.id===id)||POS23_PROGRAMS[0]}
function pos23Activity(program,week,dayIndex){
  const p=pos23Program(program),day=p.days.find(x=>x.day===dayIndex);
  if(!day || week>p.weeks)return null;
  return JSON.parse(JSON.stringify({...day,programId:p.id,program:p.name,week,scheduledDay:dayIndex}));
}
function pos23ProgramsForDate(d=selected){
  const week=pos23Week(d),day=d.getDay()||7;
  return POS23_PROGRAMS.map(p=>pos23Activity(p,week,day)).filter(Boolean);
}
function pos23ProgramCalendar(programId){
  const p=pos23Program(programId),week=pos23Week(selected),monday=new Date(selected);monday.setDate(selected.getDate()-((selected.getDay()+6)%7));
  return Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return {date:d,activity:pos23Activity(p.id,week,i+1)}})
}

/* Program records are stored as canonical system data, but definitions remain immutable. */
async function pos23InstallPrograms(){
  for(const p of POS23_PROGRAMS){
    await pos2Put({id:"program:"+p.id,domain:p.domain.toLowerCase(),type:"programDefinition",date:iso(new Date()),actual:{program:p},status:"active",schemaVersion:POS23_SCHEMA_VERSION,updatedAt:new Date().toISOString()});
  }
}
async function pos23ProgramRecords(){
  const all=await pos2All();return all.filter(x=>x.type==="programDefinition")
}
async function pos23TodayPlan(){
  const plans=pos23ProgramsForDate(selected);
  return plans;
}

/* Exercise target calculation remains program-driven; actual adaptive logic is 2.4. */
function pos23ExerciseRows(activity){
  if(activity.type!=="strength")return "";
  return activity.items.map((x,i)=>`<div class="pos23-card pos23-program"><div class="pos23-row"><div>Exercise ${i+1}</div><div><div class="pos23-strong">${posEscape(x.name)}</div><div class="pos23-small">${x.sets} sets × ${x.reps} reps</div></div><span class="pos23-chip">${x.targetWeight?x.targetWeight+" lb":"TARGET"}</span></div></div>`).join("");
}
function pos23RunRow(activity){
  return `<div class="pos23-card pos23-program"><div class="pos23-row"><div>${posEscape(activity.intensity)}</div><div><div class="pos23-strong">${posEscape(activity.name)}</div><div class="pos23-small">${activity.duration} min${activity.distance?" • "+activity.distance+" mi":""}</div></div><span class="pos23-chip">RUN</span></div></div>`;
}
function pos23MealRow(activity){
  return `<div class="pos23-card pos23-program"><div class="pos23-row"><div>Meals</div><div>${activity.meals.map(posEscape).join("<br>")}</div><span class="pos23-chip">PLAN</span></div></div>`;
}
function pos23StudyRow(activity){
  return `<div class="pos23-card pos23-program"><div class="pos23-row"><div>${activity.minutes} min</div><div><div class="pos23-strong">${posEscape(activity.topic)}</div><div class="pos23-small">${posEscape(activity.name)}</div></div><span class="pos23-chip">STUDY</span></div></div>`;
}
function pos23ActivityHtml(a){
  if(!a)return "<div class='pos23-card'>No program activity scheduled.</div>";
  return `<div class="pos23-card"><div class="pos23-toolbar"><div><div class="pos23-strong">${posEscape(a.program)}</div><div class="pos23-small">Week ${a.week} • Day ${a.scheduledDay} • ${posEscape(a.name)}</div></div><span class="pos23-chip now">CURRENT</span></div>${a.type==="strength"?pos23ExerciseRows(a):a.type==="run"?pos23RunRow(a):a.type==="meal"?pos23MealRow(a):pos23StudyRow(a)}</div>`;
}

/* Program Engine UI */
function pos23Open(){
  document.getElementById("pos23ProgramCenter").classList.add("open");
  pos23Render();
}
function pos23Close(){document.getElementById("pos23ProgramCenter").classList.remove("open")}
function pos23Render(){
  const box=document.getElementById("pos23ProgramBody");if(!box)return;
  const wk=pos23Week(selected),today=pos23ProgramsForDate(selected);
  box.innerHTML=`
    <div class="pos23-tabs">${POS23_PROGRAMS.map((p,i)=>`<button onclick="pos23SelectProgram('${p.id}')">${posEscape(p.name.replace(" Program",""))}</button>`).join("")}</div>
    <div class="pos23-card"><div class="pos23-row"><div>Current Date</div><div>${posDateLabel(selected)}</div><span class="pos23-chip now">WEEK ${wk}</span></div></div>
    <div id="pos23ProgramDetail">${today.map(pos23ActivityHtml).join("")||"<div class='pos23-card'>No program activities scheduled today.</div>"}</div>
    <div class="pos23-card"><div class="pos23-strong">12-Week Program Map</div><div class="pos23-weekgrid">${Array.from({length:12},(_,i)=>`<div class="pos23-week ${i+1===wk?"current":""}" onclick="pos23JumpWeek(${i+1})"><div class="pos23-strong">Week ${i+1}</div><div class="pos23-small">${i+1===wk?"Current":"Program week"}</div></div>`).join("")}</div></div>`;
}
function pos23SelectProgram(id){
  const p=pos23Program(id),wk=pos23Week(selected);
  const acts=p.days.filter(x=>x.day===((selected.getDay()||7))).map(x=>({...x,programId:p.id,program:p.name,week:wk,scheduledDay:(selected.getDay()||7)}));
  document.getElementById("pos23ProgramDetail").innerHTML=acts.map(pos23ActivityHtml).join("")||"<div class='pos23-card'>No activity scheduled for this program today.</div>";
}
function pos23JumpWeek(w){
  const d=new Date(selected);const current=pos23Week(d);d.setDate(d.getDate()+(w-current)*7);selected=d;pos23Render();try{refineRefresh()}catch(e){}try{pos21RefreshUI()}catch(e){}
}

/* Expose program-derived workout target to 2.1 execution UI. */
function pos23StrengthPlanForToday(){
  return pos23ProgramsForDate(selected).find(x=>x.type==="strength")||null;
}
function pos23RunPlanForToday(){
  return pos23ProgramsForDate(selected).find(x=>x.type==="run")||null;
}
function pos23MealPlanForToday(){
  return pos23ProgramsForDate(selected).find(x=>x.type==="meal")||null;
}
function pos23StudyPlanForToday(){
  return pos23ProgramsForDate(selected).find(x=>x.type==="study")||null;
}

/* Patch 2.1 execution dialogs to consume the program engine. */
const POS23_originalOpenStrength=window.pos21OpenStrength;
window.pos21OpenStrength=function(){
  const plan=pos23StrengthPlanForToday();
  if(!plan && POS23_originalOpenStrength){POS23_originalOpenStrength();return}
  if(!plan)return;
  const rows=plan.items.map((x,i)=>`<div class="pos23-card"><div class="pos23-strong">${posEscape(x.name)}</div><div class="pos23-small">${x.sets} sets × ${x.reps} reps</div>${Array.from({length:x.sets},(_,s)=>`<div class="pos23-row"><div>Set ${s+1}</div><div class="pos23-grid"><div class="pos23-field"><label>WEIGHT</label><input class="pos23-input" id="p23w${i}_${s}" type="number" step=".5" placeholder="${x.targetWeight||""}"></div><div class="pos23-field"><label>REPS</label><input class="pos23-input" id="p23r${i}_${s}" type="number" value="${x.reps}"></div></div><span class="pos23-chip">TARGET</span></div>`).join("")}</div>`).join("");
  pos21OpenExecution("Week "+plan.week+" Strength",plan.name+" • "+plan.name,rows+`<div class="pos23-actions" style="margin-top:10px"><button onclick="pos23SaveProgramStrength()">Save Workout</button></div>`);
}
async function pos23SaveProgramStrength(){
  const plan=pos23StrengthPlanForToday();if(!plan)return;
  for(let i=0;i<plan.items.length;i++){
    const ex=plan.items[i];
    for(let s=0;s<ex.sets;s++){
      const w=Number(document.getElementById("p23w"+i+"_"+s)?.value),r=Number(document.getElementById("p23r"+i+"_"+s)?.value);
      if(w&&r)await pos21SaveStrengthSet(pos21Date(),ex.name,s+1,w,r,{weight:ex.targetWeight,reps:ex.reps});
    }
  }
  await pos21WriteExecution({id:"workout:"+pos21Date()+":program",domain:"fitness",type:"executionRecord",date:pos21Date(),planned:{programId:plan.programId,program:plan.program,week:plan.week,day:plan.scheduledDay},actual:{completed:true},status:"complete"});
  pos21CloseModal();pos21RefreshUI();
}
const POS23_originalOpenRun=window.pos21OpenRun;
window.pos21OpenRun=function(){
  const p=pos23RunPlanForToday();if(!p){if(POS23_originalOpenRun)POS23_originalOpenRun();return}
  pos21OpenExecution("Week "+p.week+" Run",p.program+" • "+p.name,`<div class="pos23-card"><div class="pos23-row"><div>Target</div><div>${p.duration} min • ${p.intensity}</div><span class="pos23-chip now">PROGRAM</span></div><div class="pos23-field" style="margin-top:8px"><label>DISTANCE (MI)</label><input class="pos23-input" id="p23runDist" type="number" step=".01"></div><div class="pos23-field" style="margin-top:8px"><label>DURATION (MIN)</label><input class="pos23-input" id="p23runTime" type="number" step=".1" value="${p.duration}"></div><div class="pos23-actions" style="margin-top:10px"><button onclick="pos23SaveRun()">Save Run</button></div></div>`);
}
async function pos23SaveRun(){const p=pos23RunPlanForToday(),d=Number(document.getElementById("p23runDist").value),t=Number(document.getElementById("p23runTime").value);if(!d||!t)return;await pos21SaveRun(pos21Date(),p.distance,p.duration,d,t);pos21CloseModal();pos21RefreshUI()}
const POS23_originalOpenMeal=window.pos21OpenMeal;
window.pos21OpenMeal=function(){
  const p=pos23MealPlanForToday();if(!p){if(POS23_originalOpenMeal)POS23_originalOpenMeal();return}
  pos21OpenExecution("Week "+pos23Week(selected)+" Meals",p.program+" • "+p.name,p.meals.map(m=>`<div class="pos23-card"><div class="pos23-row"><div>Meal</div><div class="pos23-strong">${posEscape(m)}</div><button onclick="pos23CompleteMeal('${m.replace(/'/g,"\\'")}')">Complete</button></div></div>`).join(""));
}
async function pos23CompleteMeal(m){await pos21CompleteMeal(pos21Date(),m,m);pos21CloseModal();pos21RefreshUI()}
const POS23_originalOpenStudy=window.pos21OpenStudy;
window.pos21OpenStudy=function(){
  const p=pos23StudyPlanForToday();if(!p){if(POS23_originalOpenStudy)POS23_originalOpenStudy();return}
  pos21OpenExecution("Week "+p.week+" Study",p.program+" • "+p.topic,`<div class="pos23-card"><div class="pos23-row"><div>Target</div><div>${p.minutes} minutes</div><span class="pos23-chip now">PROGRAM</span></div><div class="pos23-field" style="margin-top:8px"><label>MINUTES COMPLETED</label><input class="pos23-input" id="p23study" type="number" value="${p.minutes}"></div><div class="pos23-actions" style="margin-top:10px"><button onclick="pos23SaveStudy()">Save Study</button></div></div>`);
}
async function pos23SaveStudy(){const p=pos23StudyPlanForToday(),m=Number(document.getElementById("p23study").value)||0;await pos21CompleteStudy(pos21Date(),m,p.minutes);pos21CloseModal();pos21RefreshUI()}

/* Program engine installs definitions once. */
document.addEventListener("DOMContentLoaded",async()=>{try{await pos23InstallPrograms()}catch(e){}});
