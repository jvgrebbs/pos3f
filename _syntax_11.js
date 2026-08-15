
/* PHASE 10 — Cloud Sync Foundation
   Local-first sync queue. Provider adapters are intentionally isolated from
   application startup and local execution. */
const SYNC_QUEUE_KEY="pos:system:syncQueue";
const SYNC_META_KEY="pos:system:syncMeta";
const SYNC_SCHEMA="1.0";

function syncReadQueue(){try{return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)||"[]")}catch(e){return []}}
function syncWriteQueue(q){localStorage.setItem(SYNC_QUEUE_KEY,JSON.stringify(q))}
function syncReadMeta(){try{return JSON.parse(localStorage.getItem(SYNC_META_KEY)||"{}")}catch(e){return {}}}
function syncWriteMeta(m){localStorage.setItem(SYNC_META_KEY,JSON.stringify(m))}
function syncSnapshot(){
  const data={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key && key.startsWith("pos:")) {
      try{data[key]=JSON.parse(localStorage.getItem(key))}
      catch(e){data[key]=localStorage.getItem(key)}
    }
  }
  return data;
}
function cloudSyncQueueCurrentData(){
  const now=new Date().toISOString();
  const q=syncReadQueue();
  q.push({
    id:crypto.randomUUID?crypto.randomUUID():("sync-"+Date.now()),
    createdAt:now,
    operation:"UPSERT_SNAPSHOT",
    schema:SYNC_SCHEMA,
    payload:syncSnapshot()
  });
  syncWriteQueue(q);
  syncUpdateUI();
}
function cloudSyncExportQueue(){
  const payload={
    application:"Personal Operating System",
    syncSchema:SYNC_SCHEMA,
    exportedAt:new Date().toISOString(),
    provider:syncReadMeta().provider||null,
    queue:syncReadQueue()
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;
  a.download="Personal_OS_Sync_Package_"+new Date().toISOString().replace(/[:.]/g,"-")+".json";
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function cloudSyncClearQueue(){
  if(!confirm("Clear all pending sync changes?"))return;
  syncWriteQueue([]);syncUpdateUI();
}
function syncUpdateUI(){
  const q=syncReadQueue(),m=syncReadMeta();
  const p=document.getElementById("syncProvider"),n=document.getElementById("syncPending"),l=document.getElementById("syncLast"),s=document.getElementById("cloudSyncStatus");
  if(p)p.textContent=m.provider||"Not connected";
  if(n)n.textContent=q.length;
  if(l)l.textContent=m.lastSync?new Date(m.lastSync).toLocaleString():"Never";
  if(s)s.textContent=m.provider?(q.length?"PENDING":"SYNCED"):"LOCAL ONLY";
}
window.POSCloudSync={
  schema:SYNC_SCHEMA,
  registerProvider(providerName,adapter){
    syncWriteMeta({...syncReadMeta(),provider:providerName});
    window.POSCloudSync.adapter=adapter;
    syncUpdateUI();
  },
  getQueue:syncReadQueue,
  markSynced(){
    syncWriteMeta({...syncReadMeta(),lastSync:new Date().toISOString()});
    syncWriteQueue([]);
    syncUpdateUI();
  },
  snapshot:syncSnapshot
};
document.addEventListener("DOMContentLoaded",()=>setTimeout(syncUpdateUI,100));
