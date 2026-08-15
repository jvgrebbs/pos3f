
/* PHASE 6 — Education System */
const EDU_KEY="pos:0.2:userData:educationProgress";
const EDU_START=new Date(2026,7,17,12,0,0,0);
const EDU_TOPICS=[
 ["Week 1","Networking Fundamentals","Networking concepts, topologies, devices, ports, protocols"],
 ["Week 2","OSI & TCP/IP","OSI model, TCP/IP model, encapsulation, addressing basics"],
 ["Week 3","IP Addressing & Subnetting","IPv4, IPv6, CIDR, subnetting, gateways"],
 ["Week 4","Routing & Switching","Routing concepts, VLANs, switching, STP, routing protocols"],
 ["Week 5","Wireless & Network Services","Wi-Fi, DHCP, DNS, NTP, VPNs, common services"],
 ["Week 6","Network Security","Threats, hardening, segmentation, authentication, secure protocols"],
 ["Week 7","Troubleshooting & Operations","Troubleshooting methodology, monitoring, tools, documentation"],
 ["Week 8","Review & Exam Preparation","Weak areas, practice tests, review, exam readiness"]
];
function eduRead(){try{return JSON.parse(localStorage.getItem(EDU_KEY)||"{}")}catch(e){return {}}}
function eduWrite(x){localStorage.setItem(EDU_KEY,JSON.stringify(x))}
function eduWeek(){
  const diff=Math.floor((new Date(selected).setHours(12,0,0,0)-EDU_START.getTime())/(7*86400000));
  return Math.max(1,Math.min(8,diff+1));
}
function eduTopicForWeek(w){return EDU_TOPICS[w-1]}
function renderEducation(){
  const data=eduRead(), w=eduWeek(), topic=eduTopicForWeek(w);
  let totalDone=0,total=0;
  Object.values(data).forEach(x=>{if(x.complete)totalDone++;total++});
  const pct=total?Math.round(totalDone/total*100):0;
  const hours=totalDone;
  document.getElementById("eduWeek").textContent=w;
  document.getElementById("eduHours").textContent=hours+" / 56";
  document.getElementById("eduTopics").textContent=pct+"%";
  document.getElementById("eduProgress").style.width=pct+"%";
  document.getElementById("educationStatus").textContent=pct===100?"COMPLETE":totalDone?"IN PROGRESS":"READY";

  const date=iso(selected);
  document.getElementById("educationDay").innerHTML=
    `<div class="engine-note"><strong>${date}</strong> — 1-hour Network+ study session<br>
    <strong>${topic[1]}</strong> — ${topic[2]}</div>`;

  document.getElementById("educationTopics").innerHTML=EDU_TOPICS.map((t,i)=>{
    const done=data[i+1]?.complete;
    return `<div class="edu-topic">
      <input type="checkbox" ${done?"checked":""} onchange="eduToggle(${i+1},this.checked)">
      <div><div class="edu-title">${t[0]} — ${t[1]}</div><div class="edu-meta">${t[2]}</div></div>
      <div class="exec-state">${done?"COMPLETE":"PLANNED"}</div>
    </div>`;
  }).join("");
}
function eduToggle(week,checked){
  const data=eduRead();
  data[week]={complete:checked,completedAt:checked?new Date().toISOString():null};
  eduWrite(data);renderEducation();
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(renderEducation,0));
