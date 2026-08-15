
(function(){
  const C="pos:core:selectedDate:v3", old=["pos:selectedDate:3.0","pos:selectedDate"];
  try{
    if(!localStorage.getItem(C)){
      for(const k of old){
        const v=localStorage.getItem(k); if(!v)continue;
        const d=new Date(v);
        if(!Number.isNaN(d.getTime())){d.setHours(12,0,0,0);localStorage.setItem(C,d.toISOString());break;}
      }
    }
    old.forEach(k=>localStorage.removeItem(k));
  }catch(e){}
})();
