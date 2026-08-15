
document.addEventListener("DOMContentLoaded",()=>{
  const header=document.querySelector(".refine-header");
  if(header && !document.getElementById("pos24HeaderAction")){
    const b=document.createElement("button");b.id="pos24HeaderAction";b.type="button";b.textContent="Adaptive";b.onclick=pos24Open;
    header.appendChild(b);
  }
});
