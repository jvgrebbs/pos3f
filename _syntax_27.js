
document.addEventListener("DOMContentLoaded",()=>{
  const header=document.querySelector(".refine-header");
  if(header && !document.getElementById("pos23HeaderAction")){
    const b=document.createElement("button");b.id="pos23HeaderAction";b.type="button";b.textContent="Programs";b.onclick=pos23Open;
    const actions=header.querySelector(".pos22-actions,.pos21-actions")||header;actions.appendChild(b);
  }
});
