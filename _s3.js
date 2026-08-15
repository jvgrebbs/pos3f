
/* PHASE 2 — Application Data Model
   UI behavior remains on the Phase 1 storage path.
   This layer provides a stable normalized model for later phases. */
const POS_DATA_MODEL = {
  version: "0.2",
  namespaces: {
    planning: ["fitness","running","nutrition","household","education"],
    execution: ["daily","strength","running","meals","chores","education"],
    userData: ["bodyMetrics","workoutResults","runningResults","completion","notes"],
    system: ["settings","calendar","schema"]
  }
};

function posDataKey(namespace, id){
  return `pos:${POS_DATA_MODEL.version}:${namespace}:${id}`;
}
function posRead(namespace,id){
  try{
    const raw=localStorage.getItem(posDataKey(namespace,id));
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function posWrite(namespace,id,value){
  try{
    localStorage.setItem(posDataKey(namespace,id),JSON.stringify(value));
    return true;
  }catch(e){ console.warn("POS data write failed",e); return false; }
}
function posRemove(namespace,id){
  localStorage.removeItem(posDataKey(namespace,id));
}
function posList(namespace){
  const prefix=`pos:${POS_DATA_MODEL.version}:${namespace}:`;
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k && k.startsWith(prefix)){
      const id=k.slice(prefix.length);
      out.push({id,value:posRead(namespace,id)});
    }
  }
  return out;
}
function posModelStatus(){
  return {
    version:POS_DATA_MODEL.version,
    namespaces:POS_DATA_MODEL.namespaces,
    records:Object.fromEntries(
      Object.keys(POS_DATA_MODEL.namespaces).map(ns=>[ns,posList(ns).length])
    )
  };
}
function posSeedModel(){
  // Preserve the existing application data and create only schema metadata.
  if(!posRead("system","schema")){
    posWrite("system","schema",{
      version:POS_DATA_MODEL.version,
      createdAt:new Date().toISOString(),
      namespaces:POS_DATA_MODEL.namespaces
    });
  }
}
posSeedModel();
