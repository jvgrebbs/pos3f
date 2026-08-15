
document.addEventListener("DOMContentLoaded",()=>{
  const rows=document.getElementById("poshHealthRows");
  if(rows && window.POS3Core){
    const el=document.createElement("div");
    el.className="posh-row";
    el.innerHTML='<span>Core Architecture</span><b class="posh-good">3.0</b>';
    rows.appendChild(el);
  }
});
