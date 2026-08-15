
const POS2_RECIPES={
 "Chicken & Rice Bowls":{Protein:["Chicken breast 2 lb"],Carbs:["Rice 3 cups"],Produce:["Broccoli 2 lb"],Pantry:["Soy sauce"]},
 "Beef Taco Bowls":{Protein:["Lean ground beef 2 lb"],Carbs:["Rice 3 cups"],Produce:["Lettuce 1 head","Tomatoes 4"],Pantry:["Black beans 2 cans","Taco seasoning"]},
 "Chicken Stir-Fry":{Protein:["Chicken breast 2 lb"],Carbs:["Rice 3 cups"],Produce:["Frozen mixed vegetables 2 bags"],Pantry:["Stir-fry sauce"]},
 "Spaghetti with Lean Beef Sauce":{Protein:["Lean ground beef 1.5 lb"],Carbs:["Spaghetti 1 box"],Produce:["Onions 2"],Pantry:["Marinara 2 jars"]},
 "Chicken Fajita Bowls":{Protein:["Chicken breast 2 lb"],Carbs:["Rice 3 cups","Tortillas 1 pack"],Produce:["Bell peppers 4","Onions 2"],Pantry:["Fajita seasoning"]},
 "Beef & Potato Skillet":{Protein:["Lean ground beef 2 lb"],Carbs:["Potatoes 5 lb"],Produce:["Onions 2"],Pantry:["Seasoning"]},
 "Chicken Burrito Bowls":{Protein:["Chicken breast 2 lb"],Carbs:["Rice 3 cups"],Produce:["Lettuce 1 head","Tomatoes 4"],Pantry:["Beans 2 cans","Salsa"]},
 "Turkey-free Chili":{Protein:["Lean ground beef 2 lb"],Carbs:["Beans 3 cans"],Produce:["Onions 2","Bell peppers 2"],Pantry:["Crushed tomatoes 2 cans","Chili seasoning"]},
 "BBQ Chicken Rice Bowls":{Protein:["Chicken breast 2 lb"],Carbs:["Rice 3 cups"],Produce:["Broccoli 2 lb"],Pantry:["BBQ sauce"]},
 "Beef & Vegetable Pasta":{Protein:["Lean ground beef 1.5 lb"],Carbs:["Pasta 1 box"],Produce:["Frozen mixed vegetables 2 bags"],Pantry:["Marinara 2 jars"]}
};
function v2Grocery(){
  const box=document.getElementById("v2GroceryBody");if(!box)return;
  const week=posWeek(selected);
  let dinner="";
  try{dinner=nutDinner(week)}catch(e){dinner="Chicken & Rice Bowls"}
  const r=POS2_RECIPES[dinner]||POS2_RECIPES["Chicken & Rice Bowls"];
  box.innerHTML=`<div class="pos2-small">Week ${week} • Dinner: <strong>${posEscape(dinner)}</strong></div>`+
    Object.entries(r).map(([g,items])=>`<div class="pos2-row"><div>${g}</div><div>${items.map(posEscape).join("<br>")}</div><div class="pos2-chip">BUY</div></div>`).join("");
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(v2Grocery,200));
