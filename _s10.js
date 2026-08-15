
/* PHASE 9 — Local Backup / Data Persistence */
const POS_BACKUP_VERSION="0.9";
const POS_BACKUP_META="pos:system:backupMeta";
const POS_BACKUP_PREFIX="pos:";

function posAllLocalData(){
  const data={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key && key.startsWith(POS_BACKUP_PREFIX)){
      try{data[key]=JSON.parse(localStorage.getItem(key))}
      catch(e){data[key]=localStorage.getItem(key)}
    }
  }
  return data;
}
function posSetBackupMeta(meta){localStorage.setItem(POS_BACKUP_META,JSON.stringify(meta))}
function posGetBackupMeta(){try{return JSON.parse(localStorage.getItem(POS_BACKUP_META)||"{}")}catch(e){return {}}}
function posCreateBackup(){
  const now=new Date().toISOString();
  const payload={
    application:"Personal Operating System",
    backupVersion:POS_BACKUP_VERSION,
    createdAt:now,
    data:posAllLocalData()
  };
  const meta={createdAt:now,records:Object.keys(payload.data).length};
  localStorage.setItem("pos:system:lastBackup",JSON.stringify(payload));
  posSetBackupMeta(meta);
  posUpdateBackupUI();
  alert("Local backup snapshot created.");
}
function posExportBackup(){
  const now=new Date().toISOString();
  const payload={
    application:"Personal Operating System",
    backupVersion:POS_BACKUP_VERSION,
    createdAt:now,
    data:posAllLocalData()
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;
  a.download="Personal_OS_Backup_"+now.replace(/[:.]/g,"-")+".json";
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  posSetBackupMeta({createdAt:now,records:Object.keys(payload.data).length,exported:true});
  posUpdateBackupUI();
}
function posRestoreBackup(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const payload=JSON.parse(reader.result);
      if(payload.application!=="Personal Operating System" || !payload.data) throw new Error("Invalid Personal OS backup.");
      if(!confirm("Restore this backup? Existing Personal OS local data will be replaced."))return;
      Object.keys(localStorage).forEach(key=>{
        if(key && key.startsWith(POS_BACKUP_PREFIX))localStorage.removeItem(key);
      });
      Object.entries(payload.data).forEach(([key,value])=>{
        localStorage.setItem(key,typeof value==="string"?value:JSON.stringify(value));
      });
      posSetBackupMeta({createdAt:payload.createdAt||new Date().toISOString(),records:Object.keys(payload.data).length,restored:true});
      alert("Backup restored. The application will reload.");
      location.reload();
    }catch(e){alert("Backup restore failed: "+e.message)}
  };
  reader.readAsText(file);
}
function posUpdateBackupUI(){
  const meta=posGetBackupMeta();
  const last=document.getElementById("backupLast");
  const records=document.getElementById("backupRecords");
  const status=document.getElementById("backupStatus");
  if(last)last.textContent=meta.createdAt?new Date(meta.createdAt).toLocaleString():"Never";
  if(records)records.textContent=meta.records||0;
  if(status)status.textContent=meta.createdAt?"READY":"NOT BACKED UP";
}
document.addEventListener("DOMContentLoaded",()=>{
  const f=document.getElementById("posBackupFile");
  if(f)f.addEventListener("change",e=>{if(e.target.files[0]){posRestoreBackup(e.target.files[0]);e.target.value=""}});
  setTimeout(posUpdateBackupUI,100);
});
