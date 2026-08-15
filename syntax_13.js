
/* PERSONAL OS 2.0 DATA ENGINE
   IndexedDB-backed canonical store with localStorage compatibility. */
const POS2_DB="PersonalOS2";
const POS2_DB_VERSION=1;
const POS2_STORE="records";
const POS2_META="meta";
let pos2DB=null;
let pos2Ready=false;
const pos2Memory=new Map();

function pos2OpenDB(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){resolve(null);return}
    const req=indexedDB.open(POS2_DB,POS2_DB_VERSION);
    req.onupgradeneeded=e=>{
      const db=e.target.result;
      if(!db.objectStoreNames.contains(POS2_STORE)){
        const s=db.createObjectStore(POS2_STORE,{keyPath:"id"});
        s.createIndex("domain","domain",{unique:false});
        s.createIndex("date","date",{unique:false});
        s.createIndex("updatedAt","updatedAt",{unique:false});
      }
      if(!db.objectStoreNames.contains(POS2_META))db.createObjectStore(POS2_META,{keyPath:"id"});
    };
    req.onsuccess=e=>{pos2DB=e.target.result;resolve(pos2DB)};
    req.onerror=()=>resolve(null);
  });
}
async function pos2InitDB(){
  await pos2OpenDB();
  pos2Ready=true;
  if(!pos2DB)return;
  // One-time migration of POS localStorage records into canonical records.
  const migrated=await pos2MetaGet("migrated_v2");
  if(!migrated){
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||!key.startsWith("pos:"))continue;
      try{
        const value=JSON.parse(localStorage.getItem(key));
        await pos2Put({id:"legacy:"+key,domain:"legacy",key,value,date:null,updatedAt:new Date().toISOString()});
      }catch(e){}
    }
    await pos2MetaPut({id:"migrated_v2",value:true});
  }
}
function pos2Put(record){
  record.updatedAt=record.updatedAt||new Date().toISOString();
  pos2Memory.set(record.id,record);
  if(!pos2DB)return Promise.resolve(record);
  return new Promise(resolve=>{
    const tx=pos2DB.transaction(POS2_STORE,"readwrite");
    tx.objectStore(POS2_STORE).put(record);
    tx.oncomplete=()=>resolve(record);tx.onerror=()=>resolve(record);
  });
}
function pos2Get(id){
  if(pos2Memory.has(id))return Promise.resolve(pos2Memory.get(id));
  if(!pos2DB)return Promise.resolve(null);
  return new Promise(resolve=>{
    const r=pos2DB.transaction(POS2_STORE).objectStore(POS2_STORE).get(id);
    r.onsuccess=()=>{if(r.result)pos2Memory.set(id,r.result);resolve(r.result||null)};
    r.onerror=()=>resolve(null);
  });
}
function pos2All(){
  if(!pos2DB)return Promise.resolve([...pos2Memory.values()]);
  return new Promise(resolve=>{
    const r=pos2DB.transaction(POS2_STORE).objectStore(POS2_STORE).getAll();
    r.onsuccess=()=>{(r.result||[]).forEach(x=>pos2Memory.set(x.id,x));resolve(r.result||[])};
    r.onerror=()=>resolve([...pos2Memory.values()]);
  });
}
function pos2Delete(id){
  pos2Memory.delete(id);
  if(!pos2DB)return Promise.resolve();
  return new Promise(resolve=>{
    const tx=pos2DB.transaction(POS2_STORE,"readwrite");tx.objectStore(POS2_STORE).delete(id);
    tx.oncomplete=()=>resolve();tx.onerror=()=>resolve();
  });
}
function pos2MetaGet(id){
  if(!pos2DB)return Promise.resolve(null);
  return new Promise(resolve=>{
    const r=pos2DB.transaction(POS2_META).objectStore(POS2_META).get(id);
    r.onsuccess=()=>resolve(r.result?.value??null);r.onerror=()=>resolve(null);
  });
}
function pos2MetaPut(x){
  if(!pos2DB)return Promise.resolve();
  return new Promise(resolve=>{
    const tx=pos2DB.transaction(POS2_META,"readwrite");tx.objectStore(POS2_META).put(x);
    tx.oncomplete=()=>resolve();tx.onerror=()=>resolve();
  });
}
function pos2DomainSummary(records){
  const m={};
  records.forEach(r=>m[r.domain]=(m[r.domain]||0)+1);
  return m;
}
