
function v2FitnessProgress(){
  const box=document.getElementById("v2FitnessProgressBody");if(!box)return;
  let sets=[];
  try{sets=fitnessRead(STRENGTH_ENGINE_KEY,{});sets=Object.values(sets).flatMap(x=>x.exercises||[]).flatMap(x=>x.sets||[])}catch(e){}
  if(!sets.length){box.innerHTML="<div class='pos2-small'>Log a strength set to begin progression.</div>";return}
  const byEx={};sets.forEach(s=>{if(!byEx[s.name])byEx[s.name]=[];byEx[s.name].push(s)});
  box.innerHTML=Object.entries(byEx).slice(0,8).map(([name,a])=>{
    const best=a.reduce((p,x)=>Number(x.weight*x.reps)>Number(p.weight*p.reps)?x:p,a[0]);
    const e1rm=best.reps?Math.round(best.weight*(1+best.reps/30)):0;
    return `<div class="pos2-row"><div>Strength</div><div><strong>${posEscape(name)}</strong><div class="pos2-small">Best ${best.weight} lb × ${best.reps} • e1RM ${e1rm} lb</div></div><div class="pos2-chip">PROGRESS</div></div>`;
  }).join("");
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(v2FitnessProgress,180));
