
document.addEventListener("DOMContentLoaded",()=>{
  const header=document.querySelector(".refine-header");
  if(header && !document.getElementById("pos22HeaderActions")){
    const actions=document.createElement("div");
    actions.id="pos22HeaderActions";actions.className="pos22-actions";
    actions.innerHTML='<button type="button" onclick="pos22OpenData()">Data</button>';
    header.appendChild(actions);
  }
});
