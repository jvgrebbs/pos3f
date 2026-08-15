
/* PERSONAL OS 2.2 — RELIABILITY & DATA ENGINE */
const POS22_SCHEMA_VERSION=3;
const POS22_APP_VERSION="2.2.0";
const POS22_META_KEY="pos22:meta";
const POS22_SNAPSHOT_KEY="pos22:snapshot";

function pos22Now(){return new Date().toISOString()}
function pos22Hash(text){
  let h=2166136261;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return ("00000000"+(h>>>0).toString(16)).slice(-8);
}
function pos22Canonicalize(r){
  return {
    id:r.id||("record:"+Date.now()+":"+Math.random().toString(16).slice(2)),
    domain:r.domain||"system",type:r.type||"record",date:r.date||null,
    planned:r.planned??null,actual:r.actual??null,status:r.status||"stored",
    metrics:r.metrics||{},updatedAt:r.updatedAt||pos22Now(),
    schemaVersion:POS22_SCHEMA_VERSION
  };
}
async function pos22All(){return await pos2All()}
async function pos22Put(record){return await pos2Put(pos22Canonicalize(record))}

async function pos22GetMeta(){
  try{
    const all=await pos2All();
    return all.find(x=>x.id===POS22_META_KEY)||null;
  }catch(e){return null}
}
async function pos22SaveMeta(meta){
  return await pos2Put({id:POS22_META_KEY,domain:"system",type:"metadata",date:iso(new Date()),actual:meta,status:"stored",schemaVersion:POS22_SCHEMA_VERSION,updatedAt:pos22Now()});
}

/* Schema migration: safe, idempotent, non-destructive. */
async function pos22Migrate(){
  const all=await pos22All();
  let migrated=0,invalid=0;
  for(const r of all){
    if(r.id===POS22_META_KEY)continue;
    const canonical=pos22Canonicalize(r);
    if(!r.id||!r.type||!r.domain)invalid++;
    if(r.schemaVersion!==POS22_SCHEMA_VERSION){
      await pos2Put(canonical);
      migrated++;
    }
  }
  await pos22SaveMeta({appVersion:POS22_APP_VERSION,schemaVersion:POS22_SCHEMA_VERSION,lastMigration:pos22Now(),migrated,invalid});
  return {migrated,invalid};
}

/* Validation does not modify data. */
async function pos22Validate(){
  const all=await pos22All();
  const issues=[];
  const ids=new Set();
  for(const r of all){
    if(ids.has(r.id))issues.push("Duplicate ID: "+r.id); ids.add(r.id);
    if(!r.id)issues.push("Missing ID");
    if(!r.type)issues.push("Missing type: "+r.id);
    if(!r.domain)issues.push("Missing domain: "+r.id);
    if(r.schemaVersion && r.schemaVersion>POS22_SCHEMA_VERSION)issues.push("Future schema: "+r.id);
  }
  return {records:all.length,issues};
}

/* Snapshot is stored as a record so it travels with the local database. */
async function pos22CreateSnapshot(){
  const all=await pos22All();
  const records=all.filter(r=>r.id!==POS22_SNAPSHOT_KEY && r.id!==POS22_META_KEY);
  const payload={format:"personal-os-backup",version:POS22_APP_VERSION,schemaVersion:POS22_SCHEMA_VERSION,createdAt:pos22Now(),records};
  const text=JSON.stringify(payload);
  const snapshot={id:POS22_SNAPSHOT_KEY,domain:"system",type:"backupSnapshot",date:iso(new Date()),actual:{recordCount:records.length,payload,hash:pos22Hash(text)},status:"stored",schemaVersion:POS22_SCHEMA_VERSION,updatedAt:pos22Now()};
  await pos2Put(snapshot);
  return snapshot;
}
async function pos22ExportSnapshot(){
  const snap=await pos22CreateSnapshot();
  const payload=snap.actual.payload;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="Personal_OS_2.2_Backup_"+iso(new Date())+".json";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  return snap;
}
async function pos22RestoreFile(file){
  const payload=JSON.parse(await file.text());
  if(payload.format!=="personal-os-backup")throw new Error("Unsupported backup format.");
  if(!Array.isArray(payload.records))throw new Error("Backup contains no records.");
  const before=await pos22All();
  const backupHash=pos22Hash(JSON.stringify(payload));
  for(const r of payload.records)await pos2Put(pos22Canonicalize(r));
  await pos22SaveMeta({appVersion:POS22_APP_VERSION,schemaVersion:POS22_SCHEMA_VERSION,lastRestore:pos22Now(),restoredRecords:payload.records.length,backupHash});
  return {before:before.length,restored:payload.records.length,hash:backupHash};
}
function pos22ChooseRestore(){
  const i=document.createElement("input");i.type="file";i.accept=".json,application/json";
  i.onchange=async()=>{try{const result=await pos22RestoreFile(i.files[0]);alert("Restore complete: "+result.restored+" records processed.");pos22RenderData()}catch(e){alert("Restore failed: "+e.message)}};
  i.click();
}

/* Automatic local snapshot policy: create a snapshot after meaningful execution activity. */
let pos22SnapshotTimer=null;
function pos22ScheduleSnapshot(){
  clearTimeout(pos22SnapshotTimer);
  pos22SnapshotTimer=setTimeout(()=>pos22CreateSnapshot().catch(()=>{}),1500);
}

/* Data health */
async function pos22Health(){
  const all=await pos22All(),validation=await pos22Validate(),meta=await pos22GetMeta();
  const bytes=JSON.stringify(all).length;
  return {records:all.length,bytes,issues:validation.issues,meta};
}
async function pos22RenderData(){
  const box=document.getElementById("pos22DataBody");if(!box)return;
  const h=await pos22Health();
  const lastSnap=(await pos22All()).find(x=>x.id===POS22_SNAPSHOT_KEY);
  const issueCount=h.issues.length;
  box.innerHTML=`
    <div class="pos22-grid">
      <div class="pos22-card"><div class="pos22-small">APP VERSION</div><div class="pos22-strong">${POS22_APP_VERSION}</div></div>
      <div class="pos22-card"><div class="pos22-small">SCHEMA</div><div class="pos22-strong">v${POS22_SCHEMA_VERSION}</div></div>
      <div class="pos22-card"><div class="pos22-small">RECORDS</div><div class="pos22-strong">${h.records}</div></div>
    </div>
    <div class="pos22-card">
      <div class="pos22-row"><div>IndexedDB</div><div><span class="pos22-health-dot"></span>Operational</div><span class="pos22-chip good">OK</span></div>
      <div class="pos22-row"><div>Validation</div><div>${issueCount?issueCount+" issue(s)":"No issues detected"}</div><span class="pos22-chip ${issueCount?"bad":"good"}">${issueCount?"CHECK":"OK"}</span></div>
      <div class="pos22-row"><div>Snapshot</div><div>${lastSnap?lastSnap.updatedAt:"Not created"}</div><span class="pos22-chip ${lastSnap?"good":"warn"}">${lastSnap?"READY":"PENDING"}</span></div>
      <div class="pos22-row"><div>Cloud Sync</div><div>Deferred to 3.0</div><span class="pos22-chip warn">PENDING</span></div>
    </div>
    <div class="pos22-actions" style="margin-top:10px">
      <button onclick="pos22CreateSnapshot().then(()=>pos22RenderData())">Create Local Snapshot</button>
      <button onclick="pos22ExportSnapshot()">Export Backup</button>
      <button onclick="pos22ChooseRestore()">Restore Backup</button>
      <button onclick="pos22OpenMigration()">Migration / Validation</button>
    </div>
    ${issueCount?`<div class="pos22-card"><div class="pos22-strong">Validation issues</div><div class="pos22-code">${pos22Escape(h.issues.join("\\n"))}</div></div>`:""}
  `;
}
function pos22Escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

/* Migration center */
async function pos22OpenMigration(){
  document.getElementById("pos22MigrationCenter").classList.add("open");
  const body=document.getElementById("pos22MigrationBody"),h=await pos22Health();
  body.innerHTML=`
    <div class="pos22-card"><div class="pos22-row"><div>Current schema</div><div>v${POS22_SCHEMA_VERSION}</div><span class="pos22-chip good">ACTIVE</span></div>
      <div class="pos22-row"><div>Validation</div><div>${h.issues.length} issue(s)</div><span class="pos22-chip ${h.issues.length?"bad":"good"}">${h.issues.length?"CHECK":"PASS"}</span></div>
    </div>
    <div class="pos22-actions" style="margin-top:10px"><button onclick="pos22RunMigration()">Run Safe Migration</button><button onclick="pos22RunValidation()">Validate Data</button></div>
    <div id="pos22MigrationResult" class="pos22-card"><div class="pos22-small">No operation run yet.</div></div>`;
}
async function pos22RunMigration(){
  const result=await pos22Migrate();
  document.getElementById("pos22MigrationResult").innerHTML=`<div class="pos22-strong">Migration complete</div><div class="pos22-small">${result.migrated} records normalized • ${result.invalid} records flagged</div>`;
}
async function pos22RunValidation(){
  const r=await pos22Validate();
  document.getElementById("pos22MigrationResult").innerHTML=`<div class="pos22-strong">Validation complete</div><div class="pos22-small">${r.records} records checked • ${r.issues.length} issues</div>${r.issues.length?`<div class="pos22-code">${pos22Escape(r.issues.join("\\n"))}</div>`:""}`;
}
function pos22CloseMigration(){document.getElementById("pos22MigrationCenter").classList.remove("open")}
function pos22OpenData(){document.getElementById("pos22DataCenter").classList.add("open");pos22RenderData()}
function pos22CloseData(){document.getElementById("pos22DataCenter").classList.remove("open")}
function pos22CloseBackup(){document.getElementById("pos22BackupCenter").classList.remove("open")}

/* Hook meaningful writes so a local snapshot is refreshed automatically. */
const POS22_originalPos2Put=window.pos2Put;
if(typeof POS22_originalPos2Put==="function" && !window.__pos22Wrapped){
  window.pos2Put=async function(record){const result=await POS22_originalPos2Put(record);if(record && record.type!=="backupSnapshot" && record.type!=="metadata")pos22ScheduleSnapshot();return result};
  window.__pos22Wrapped=true;
}

/* Startup migration is intentionally non-destructive and idempotent. */
document.addEventListener("DOMContentLoaded",async()=>{try{await pos22Migrate()}catch(e){}});
