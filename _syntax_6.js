
/* PHASE 5 — Nutrition System */
const NUTRITION_KEY="pos:0.2:userData:nutritionExecution";
const GROCERY_KEY="pos:0.2:userData:groceryExecution";

const NUTRITION_PLAN = {
  breakfast:{name:"Oatmeal + Eggs + Banana",prep:"10 min",meal:"Breakfast",time:"0700"},
  lunches:[
    {name:"Chicken Rice Bowl",prep:"15 min"},
    {name:"Beef & Rice Bowl",prep:"20 min"},
    {name:"Chicken Quesadilla",prep:"15 min"}
  ],
  dinners:[
    "Chicken & Rice Bowls","Beef Taco Bowls","Chicken Stir-Fry",
    "Spaghetti with Lean Beef Sauce","Chicken Fajita Bowls",
    "Beef & Potato Skillet","Chicken Burrito Bowls","Turkey-free Chili",
    "BBQ Chicken Rice Bowls","Beef & Vegetable Pasta",
    "Chicken Parmesan Pasta","Chicken & Potato Sheet-Pan",
    "Beef & Bean Burrito Bowls","Chicken Teriyaki Rice",
    "Ground Beef & Rice Skillet","Chicken Alfredo Pasta",
    "Beef Taco Pasta","Chicken & Vegetable Rice",
    "Beef & Potato Tacos","Chicken Enchilada Bowls",
    "Chicken Sausage & Rice","Lean Beef Marinara",
    "Chicken Caesar Wraps","Beef & Broccoli Rice"
  ]
};

function nutRead(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||"{}")}catch(e){return fallback}}
function nutWrite(key,v){localStorage.setItem(key,JSON.stringify(v))}
function nutWeek(){return (typeof weekFor==="function" ? weekFor(selected) : 1)||1}
function nutLunch(week){return NUTRITION_PLAN.lunches[(week-1)%NUTRITION_PLAN.lunches.length]}
function nutDinner(week){return NUTRITION_PLAN.dinners[(week-1)%NUTRITION_PLAN.dinners.length]}
function nutDayKey(){return iso(selected)}

function renderNutrition(){
  const dayKey=nutDayKey(),week=nutWeek();
  const data=nutRead(NUTRITION_KEY,{});
  if(!data[dayKey]){
    data[dayKey]={breakfast:NUTRITION_PLAN.breakfast.name,lunch:nutLunch(week).name,dinner:nutDinner(week),completed:{}};
    nutWrite(NUTRITION_KEY,data);
  }
  const day=data[dayKey];
  const meals=[
    {id:"breakfast",time:"0700",name:day.breakfast,prep:"10 min"},
    {id:"lunch",time:"1200",name:day.lunch,prep:"15–20 min"},
    {id:"dinner",time:"1800",name:day.dinner,prep:"≤30 min"}
  ];
  let complete=0;
  Object.values(data).forEach(x=>complete+=Object.values(x.completed||{}).filter(Boolean).length);
  const planned=Object.keys(data).length*3;
  document.getElementById("nutritionWeek").textContent=week;
  document.getElementById("nutritionPlanned").textContent=planned;
  document.getElementById("nutritionComplete").textContent=complete;
  document.getElementById("nutritionStatus").textContent=complete===planned&&planned?"COMPLETE":complete?"IN PROGRESS":"READY";
  document.getElementById("nutritionDay").innerHTML=`<div class="engine-note"><strong>${dayKey}</strong> — Week ${week} meal plan</div>`;
  document.getElementById("nutritionMealsPanel").innerHTML=meals.map(m=>`
    <div class="meal-card">
      <input type="checkbox" ${day.completed[m.id]?"checked":""} onchange="nutritionToggle('${m.id}',this.checked)">
      <div><div class="meal-name">${escapeHtml(m.name)}</div><div class="meal-meta">${m.time} • Prep ${m.prep}</div></div>
      <div class="exec-state">${day.completed[m.id]?"COMPLETE":"PLANNED"}</div>
    </div>`).join("");

  const grocery=nutGrocery(week);
  document.getElementById("nutritionGroceryPanel").innerHTML=`
    <div class="engine-note"><strong>Week ${week} — What to Buy</strong></div>
    ${Object.entries(grocery).map(([group,items])=>`
      <div class="grocery-group"><strong>${group}</strong>
      ${items.map(item=>`<label class="grocery-item"><input type="checkbox" onchange="groceryToggle('${week}|${group}|${item}',this.checked)"> ${escapeHtml(item)}</label>`).join("")}
      </div>`).join("")}`;
}
function nutGrocery(week){
  const protein=["Chicken breast","Lean ground beef","Eggs","Chicken sausage"];
  const carbs=["Oats","Rice","Potatoes","Pasta","Tortillas"];
  const produce=["Bananas","Apples","Broccoli","Frozen mixed vegetables","Onions","Bell peppers"];
  const pantry=["Beans","Low-fat cheese","Greek yogurt","Peanut butter","Taco seasoning","Marinara sauce"];
  return {Protein:protein,Carbohydrates:carbs,Produce:produce,Pantry:pantry};
}
function nutritionToggle(id,checked){
  const data=nutRead(NUTRITION_KEY,{}),k=nutDayKey();
  if(!data[k])return;
  data[k].completed[id]=checked;nutWrite(NUTRITION_KEY,data);renderNutrition();
}
function groceryToggle(id,checked){
  const data=nutRead(GROCERY_KEY,{});
  data[id]=checked;nutWrite(GROCERY_KEY,data);
}
document.addEventListener("click",e=>{
  if(e.target.classList.contains("nutrition-tab")){
    document.querySelectorAll(".nutrition-tab").forEach(b=>b.classList.remove("active"));
    e.target.classList.add("active");
    const tab=e.target.dataset.ntab;
    document.getElementById("nutritionMealsPanel").style.display=tab==="meals"?"block":"none";
    document.getElementById("nutritionGroceryPanel").style.display=tab==="grocery"?"block":"none";
  }
});
document.addEventListener("DOMContentLoaded",()=>setTimeout(renderNutrition,0));
