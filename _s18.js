
async function pos2ExportFullDatabase(){
  const records=await pos2All();
  const payload={application:"Personal Operating System 2.0",version:"2.0.0",createdAt:new Date().toISOString(),records};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="Personal_OS_2.0_Full_Backup_"+new Date().toISOString().replace(/[:.]/g,"-")+".json";
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function pos2DataStatus(){
  const box=document.getElementById("integratedData");if(!box)return;
  const records=await pos2All(),domains=pos2DomainSummary(records);
  box.innerHTML+=`<div class="pos2-card" style="margin-top:10px"><strong>2.0 Data Layer</strong><div class="pos2-small">IndexedDB records: ${records.length}</div><div class="pos2-small">${Object.entries(domains).map(([k,v])=>k+": "+v).join(" • ")}</div><button type="button" style="margin-top:8px" onclick="pos2ExportFullDatabase()">Export Full 2.0 Database</button></div>`;
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(pos2DataStatus,350));
